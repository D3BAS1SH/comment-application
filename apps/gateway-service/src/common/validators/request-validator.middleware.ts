import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestValidatorMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Skip validation for non-API routes
        console.log(req.path);
        if (!req.path.includes('/api/')) {
            return next();
        }

        // Content-Type Validation
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const contentType = req.headers['content-type'];
            if (!contentType?.includes('application/json')) {
                return res.status(415).json({
                    error: 'Unsupported Media Type',
                    message: 'Content-Type must be application/json'
                });
            }
        }

        // API Version Validation
        const pathParts = req.path.split('/').filter(Boolean);
        const apiIndex = pathParts.indexOf('api');
        if (apiIndex !== -1 && pathParts[apiIndex + 1]) {
            const version = pathParts[apiIndex + 1];
            if (!version.match(/^v[1-9]$/)) {
                return res.status(400).json({
                    error: 'Invalid API Version',
                    message: 'API version must be specified (e.g., /api/v1/)'
                });
            }
        }

        next();
    }
}