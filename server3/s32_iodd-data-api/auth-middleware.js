/**
 * auth-middleware.js
 * Authentication middleware for validating JWT tokens
 */

import { acmJWTVerify } from './JWT-Tokens-Server.js';

// Rate limiting storage (in-memory, use Redis in production)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Max requests per window

export function rateLimiter(req, res, next) {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitStore.has(clientId)) {
        rateLimitStore.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return next();
    }
    
    const clientData = rateLimitStore.get(clientId);
    
    if (now > clientData.resetTime) {
        rateLimitStore.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return next();
    }
    
    if (clientData.count >= MAX_REQUESTS) {
        return res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.'
        });
    }
    
    clientData.count++;
    next();
}

export function authenticateToken(req, res, next) {
    // Get token from cookie or Authorization header
    const token = req.cookies?.app_token || 
                  req.cookies?.auth_token ||
                  req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    
    try {
        const decoded = acmJWTVerify(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}

export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        
        if (!allowedRoles.includes(req.user.user_role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        
        next();
    };
}

// Clean up old rate limit entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [clientId, data] of rateLimitStore.entries()) {
        if (now > data.resetTime) {
            rateLimitStore.delete(clientId);
        }
    }
}, RATE_LIMIT_WINDOW);
