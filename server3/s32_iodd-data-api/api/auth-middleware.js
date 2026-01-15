/**
 * auth-middleware.js
 * Middleware to check HTTP-only authentication cookies
 */

import { verifyToken } from '../global-token-functions.js';

// Middleware to verify HTTP-only authentication cookie
function requireAuth(req, res, next) {
    const authToken = req.cookies.auth_token;
    
    if (!authToken) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    
    const payload = verifyToken(authToken);
    
    if (!payload) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
    
    // Add decoded payload to request for use in route handlers
    req.user = payload;
    next();
}

export default requireAuth;