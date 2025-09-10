import { Injectable, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response, NextFunction } from "express";
import { ServerResponse } from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import * as CircuitBreaker from 'opossum';
import { LoggerService } from "src/common/log/logger.service";

@Injectable()
export class AuthProxyMiddleware implements NestMiddleware {
    private proxy;
    private circuitBreaker: CircuitBreaker;
    constructor(
        private readonly configService: ConfigService,
        private readonly logger: LoggerService
    ){
        const authServiceUrl = this.configService.getOrThrow<string>('AUTH_SERVICE_URL');
        console.log(`authServiceUrl: ${authServiceUrl}`)
        
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
                proxyReq: (proxyReq: any, req: any, res: any) => {
                    // Safely get client IP
                    const clientIP = this.getClientIP(req);
                    const protocol = req.protocol || 'http';
                    console.log(`Proxy incoming req: ${proxyReq.path}`);
                    console.log(`Proxy only req: ${req.path}`);
                    console.log(`Proxy incoming req url: ${proxyReq.url}`);
                    console.log(`Proxy only req url: ${req.url}`);
                    
                    // Add forwarding headers
                    proxyReq.setHeader('X-Forwarded-For', clientIP);
                    proxyReq.setHeader('X-Real-IP', clientIP);
                    proxyReq.setHeader('X-Forwarded-Proto', protocol);
                    
                    // Add your custom headers
                    proxyReq.setHeader('X-Gateway', 'nestjs-api-gateway');
                    proxyReq.setHeader('X-Service-Target', 'auth-service');
                    proxyReq.setHeader('X-Request-Time', new Date().toISOString());
                },

                error: (err: any, req: any, res: any) => {
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

        })

        this.circuitBreaker = new CircuitBreaker(this.makeRequest.bind(this),{
            timeout: 10000,                    // 10 seconds
            errorThresholdPercentage: 50,     // Open after 50% failures
            resetTimeout: 30000,              // Wait 30 seconds before half-open
            volumeThreshold: 10,              // Need 10 requests before tripping
            rollingCountTimeout: 10000,       // 10 second window
            name: 'auth-service',
        })

        this.circuitBreaker.on('open', () => {
            this.logger.logError('auth', {
                name: 'CircuitBreaker',
                message: 'Circuit Breaker opened',
                statusCode: 503,
                code: 'CIRCUIT_OPEN'
            }, 'CIRCUIT');
        });

        this.circuitBreaker.on('halfOpen', () => {
            this.logger.logError('auth', {
                name: 'CircuitBreaker',
                message: 'Circuit Breaker half-open',
                statusCode: 503,
                code: 'CIRCUIT_HALF_OPEN'
            }, 'CIRCUIT');
        });

        this.circuitBreaker.on('close', () => {
            this.logger.logError('auth', {
                name: 'CircuitBreaker',
                message: 'Circuit Breaker closed',
                statusCode: 200,
                code: 'CIRCUIT_CLOSED'
            }, 'CIRCUIT');
        });

        this.circuitBreaker.fallback(this.handleFallback.bind(this));
    }

    private getClientIP(req: any): string {
        return req.ip || 
            req.connection?.remoteAddress || 
            req.socket?.remoteAddress ||
            req.headers['x-forwarded-for']?.split(',')[0] ||
            'unknown';
    }

    /**
     * Safely send error response
     */
    private sendErrorResponse(res: any, err: any): void {
        try {
        // Check if this is an HTTP response object (not a socket)
        if (this.isHTTPResponse(res)) {
            // Check if we can still write to the response
            if (res.writable && !res.headersSent) {
            const errorCode = err?.code || 'UNKNOWN_ERROR';
            const statusCode = this.getStatusCodeFromError(errorCode);
            const message = this.getErrorMessage(errorCode);
            
            res.writeHead(statusCode, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: message,
                code: errorCode,
                timestamp: new Date().toISOString()
            }));
            }
        }
        } catch (writeError) {
        console.error('Failed to write error response:', writeError);
        }
    }

    /**
     * Type guard to check if response is HTTP response
     */
    private isHTTPResponse(res: any): res is ServerResponse {
        return res && 
            typeof res.writeHead === 'function' && 
            typeof res.end === 'function' &&
            typeof res.writable === 'boolean';
    }

    /**
     * Get appropriate status code from error code
     */
    private getStatusCodeFromError(errorCode: string): number {
        switch (errorCode) {
        case 'ECONNREFUSED': return 503;
        case 'ETIMEDOUT': return 504;
        case 'ENOTFOUND': return 502;
        case 'ECONNRESET': return 502;
        default: return 500;
        }
    }

    /**
     * Get user-friendly error message
     */
    private getErrorMessage(errorCode: string): string {
        switch (errorCode) {
        case 'ECONNREFUSED': return 'Auth service is unavailable';
        case 'ETIMEDOUT': return 'Auth service response timeout';
        case 'ENOTFOUND': return 'Auth service not found';
        case 'ECONNRESET': return 'Connection to auth service was reset';
        default: return 'Proxy error occurred';
        }
    }

    private async makeRequest(req: Request, res: Response, next: NextFunction) {
        return new Promise((resolve, reject) => {
            this.proxy(req, res, (err?: Error) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    private handleFallback(req: Request, res: Response, next: NextFunction) {
        return res.status(503).json({
            error: 'Service Temporarily Unavailable',
            message: 'Auth service is currently unavailable. Please try again later.',
            code: 'CIRCUIT_OPEN',
            timestamp: new Date().toISOString()
        });
    }

    async use(req: Request, res: Response, next: NextFunction) {
        const correlationId = req.headers['x-correlation-id'] as string;
        this.logger.logRequest('auth',req,correlationId);

        console.log(`Req.path at use method of proxy: ${req.path}`);

        this.circuitBreaker.fire(req,res,next).catch(error=> {
            this.logger.logError('auth',{
                name: error.name,
                message: error.message,
                statusCode: this.getStatusCodeFromError(error.code),
                code: error.code,
                details: error
            }, correlationId);

            this.sendErrorResponse(res,error);
        })
    }
}