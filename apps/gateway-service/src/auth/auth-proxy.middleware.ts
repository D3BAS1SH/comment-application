import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { ServerResponse } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as http from 'http';
import { LoggerService } from 'src/common/log/logger.service';

@Injectable()
export class AuthProxyMiddleware implements NestMiddleware {
  private proxy: ReturnType<typeof createProxyMiddleware>;
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
      // Fix connection issues
      agent: undefined, // Don't reuse connections
      headers: {
        Connection: 'close', // Close connection after each request
      },
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

          // Force close connection to prevent reuse issues
          proxyReq.setHeader('Connection', 'close');
        },

        proxyRes: (
          proxyRes: http.IncomingMessage,
          req: Request,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          res: Response
        ) => {
          // Log successful responses
          console.log(
            `Proxy response: ${req.method} ${req.url} -> ${proxyRes.statusCode}`
          );
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
            timestamp: new Date().toISOString(),
            headersSent: res.headersSent,
          });

          // Only handle error if response hasn't been sent
          if (!res.headersSent) {
            console.log('Proxy error handler: Sending error response');
            this.sendErrorResponse(res, err);
          } else {
            console.log(
              'Proxy error handler: Headers already sent, skipping error response'
            );
          }
        },
      },
      timeout: 10000, // Reduced timeout
      proxyTimeout: 15000, // Reduced proxy timeout
    });

    // Circuit breaker removed - using proxy's built-in error handling instead
    console.log('Auth proxy middleware initialized successfully');
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || `req-${Date.now()}`;
    this.logger.logRequest('auth', req, correlationId);

    console.log(`[${correlationId}] Proxying: ${req.method} ${req.path}`);

    try {
      // Use the proxy directly instead of wrapping in circuit breaker
      await new Promise<void>((resolve, reject) => {
        this.proxy(req, res, (err?: Error) => {
          if (err) {
            console.log(`[${correlationId}] Proxy error:`, err.message);
            reject(err);
          } else {
            console.log(`[${correlationId}] Proxy success`);
            resolve();
          }
        });
      });
    } catch (error) {
      console.log(`[${correlationId}] Caught proxy error:`, error);

      // The proxy error handler should have already sent the response
      // Only log here, don't try to send another response
      if (!res.headersSent) {
        console.log(
          `[${correlationId}] Headers not sent, sending fallback error`
        );
        this.sendErrorResponse(res, error as Error);
      } else {
        console.log(
          `[${correlationId}] Headers already sent by proxy error handler`
        );
      }
    }
  }
}
