import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { ServerResponse } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as CircuitBreaker from 'opossum';
import * as http from 'http';
import { LoggerService } from 'src/common/log/logger.service';

// Define a proper type for our circuit breaker
type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

@Injectable()
export class AuthProxyMiddleware implements NestMiddleware {
  private proxy: ReturnType<typeof createProxyMiddleware>;
  private circuitBreaker: CircuitBreaker<
    [Request, Response, NextFunction],
    unknown
  >;
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService
  ) {
    const authServiceUrl =
      this.configService.getOrThrow<string>('AUTH_SERVICE_URL');
    console.log(`authServiceUrl: ${authServiceUrl}`);

    this.proxy = createProxyMiddleware({
      target: authServiceUrl,
      changeOrigin: true,
      pathRewrite: {
        '^/register': '/api/v1/users/register',
        '^/login': '/api/v1/users/login',
        '^/logout': '/api/v1/users/logout',
        '^/refresh': '/api/v1/users/refresh',
        '^/verify-email': '/api/v1/users/verify-email',
        '^/forget-password': '/api/v1/users/forget-password',
        '^/reset-password': '/api/v1/users/reset-password',
        '^/upload-url': '/api/v1/cloudinary-utility/upload-url',
      },
      selfHandleResponse: false,
      on: {
        proxyReq: (proxyReq: http.ClientRequest, req: Request) => {
          // Safely get client IP
          const clientIP = this.getClientIP(req);
          const protocol = req.protocol || 'http';

          // Add forwarding headers
          proxyReq.setHeader('X-Forwarded-For', clientIP);
          proxyReq.setHeader('X-Real-IP', clientIP);
          proxyReq.setHeader('X-Forwarded-Proto', protocol);

          // Add your custom headers
          proxyReq.setHeader('X-Gateway', 'nestjs-api-gateway');
          proxyReq.setHeader('X-Service-Target', 'auth-service');
          proxyReq.setHeader('X-Request-Time', new Date().toISOString());
        },

        error: (
          err: Error & { code?: string },
          req: Request,
          res: Response | http.ServerResponse
        ) => {
          console.error('Auth Proxy Error:', {
            message: err?.message || 'Unknown error',
            code: err?.code || 'UNKNOWN',
            url: req?.url || 'unknown',
            method: req?.method || 'unknown',
          });

          // Use helper method for safe error response
          this.sendErrorResponse(res, err);
        },
      },
      timeout: 15000, //Millisecond value,
      proxyTimeout: 30000,
    });

    // Type-safe binding of the makeRequest method
    const boundMakeRequest: RequestHandler = this.makeRequest.bind(
      this
    ) as RequestHandler;
    this.circuitBreaker = new CircuitBreaker(boundMakeRequest, {
      timeout: 10000, // 10 seconds
      errorThresholdPercentage: 50, // Open after 50% failures
      resetTimeout: 30000, // Wait 30 seconds before half-open
      volumeThreshold: 10, // Need 10 requests before tripping
      rollingCountTimeout: 10000, // 10 second window
      name: 'auth-service',
    });

    this.circuitBreaker.on('open', () => {
      this.logger.logError(
        'auth',
        {
          name: 'CircuitBreaker',
          message: 'Circuit Breaker opened',
          statusCode: 503,
          code: 'CIRCUIT_OPEN',
        },
        'CIRCUIT'
      );
    });

    this.circuitBreaker.on('halfOpen', () => {
      this.logger.logError(
        'auth',
        {
          name: 'CircuitBreaker',
          message: 'Circuit Breaker half-open',
          statusCode: 503,
          code: 'CIRCUIT_HALF_OPEN',
        },
        'CIRCUIT'
      );
    });

    this.circuitBreaker.on('close', () => {
      this.logger.logError(
        'auth',
        {
          name: 'CircuitBreaker',
          message: 'Circuit Breaker closed',
          statusCode: 200,
          code: 'CIRCUIT_CLOSED',
        },
        'CIRCUIT'
      );
    });

    // Type-safe binding of the fallback handler
    const boundFallback: RequestHandler = this.handleFallback.bind(
      this
    ) as RequestHandler;
    this.circuitBreaker.fallback(boundFallback);
  }

  private getClientIP(req: Request): string {
    const forwardedHeader = req.headers['x-forwarded-for'];
    const forwardedIp =
      typeof forwardedHeader === 'string'
        ? forwardedHeader.split(',')[0]
        : Array.isArray(forwardedHeader) && forwardedHeader.length > 0
          ? forwardedHeader[0]
          : null;

    return (
      req.ip ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      forwardedIp ||
      'unknown'
    );
  }

  /**
   * Safely send error response
   */
  private sendErrorResponse(
    res: Response | http.ServerResponse,
    err: Error & { code?: string }
  ): void {
    try {
      // Check if this is an HTTP response object (not a socket)
      if (this.isHTTPResponse(res)) {
        // Check if we can still write to the response
        if (res.writable && !res.headersSent) {
          const errorCode = err?.code || 'UNKNOWN_ERROR';
          const statusCode = this.getStatusCodeFromError(errorCode);
          const message = this.getErrorMessage(errorCode);

          res.writeHead(statusCode, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error: message,
              code: errorCode,
              timestamp: new Date().toISOString(),
            })
          );
        }
      }
    } catch (writeError) {
      console.error('Failed to write error response:', writeError);
    }
  }

  /**
   * Type guard to check if response is HTTP response
   */
  private isHTTPResponse(res: unknown): res is ServerResponse {
    return (
      res !== null &&
      typeof res === 'object' &&
      typeof (res as ServerResponse).writeHead === 'function' &&
      typeof (res as ServerResponse).end === 'function' &&
      typeof (res as ServerResponse).writable === 'boolean'
    );
  }

  /**
   * Get appropriate status code from error code
   */
  private getStatusCodeFromError(errorCode: string): number {
    switch (errorCode) {
      case 'ECONNREFUSED':
        return 503;
      case 'ETIMEDOUT':
        return 504;
      case 'ENOTFOUND':
        return 502;
      case 'ECONNRESET':
        return 502;
      default:
        return 500;
    }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'ECONNREFUSED':
        return 'Auth service is unavailable';
      case 'ETIMEDOUT':
        return 'Auth service response timeout';
      case 'ENOTFOUND':
        return 'Auth service not found';
      case 'ECONNRESET':
        return 'Connection to auth service was reset';
      default:
        return 'Proxy error occurred';
    }
  }

  private async makeRequest(
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
  ): Promise<boolean> {
    // Mark promise as handled with await to address floating promise warning
    const result = await new Promise<boolean>((resolve, reject) => {
      // Explicitly handle the promise and callback
      try {
        // Use void to mark that we're intentionally not awaiting this
        void this.proxy(req, res, (err?: Error) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Unknown proxy error'));
      }
    });
    return result;
  }

  private handleFallback(
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
  ): Response {
    return res.status(503).json({
      error: 'Service Temporarily Unavailable',
      message: 'Auth service is currently unavailable. Please try again later.',
      code: 'CIRCUIT_OPEN',
      timestamp: new Date().toISOString(),
    });
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const correlationId = req.headers['x-correlation-id'] as string;
    this.logger.logRequest('auth', req, correlationId);

    console.log(`Req.path at use method of proxy: ${req.path}`);

    try {
      // Using await to properly fulfill the async/await pattern
      await this.circuitBreaker.fire(req, res, next);
    } catch (errorUnknown) {
      // Type-safe error handling
      const error = errorUnknown as Error & {
        code?: string;
        name: string;
        message: string;
      };

      this.logger.logError(
        'auth',
        {
          name: error.name,
          message: error.message,
          statusCode: this.getStatusCodeFromError(error.code || ''),
          code: error.code || 'UNKNOWN_ERROR',
          details: error,
        },
        correlationId
      );

      this.sendErrorResponse(res, error);
    }
  }
}
