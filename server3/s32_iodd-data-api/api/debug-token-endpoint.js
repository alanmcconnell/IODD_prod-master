/**
 * debug-token-endpoint.js
 * Debug endpoint to check JWT token contents
 */

import { verifyToken } from '../global-token-functions.js';

function debugTokenHandler(req, res) {
    try {
        const authToken = req.cookies.auth_token;
        
        console.log('Debug - Cookies:', req.cookies);
        console.log('Debug - Auth token:', authToken);
        
        if (!authToken) {
            return res.json({
                success: false,
                message: 'No auth token found',
                cookies: req.cookies
            });
        }
        
        const payload = verifyToken(authToken);
        console.log('Debug - Token payload:', payload);
        
        return res.json({
            success: true,
            message: 'Token found and decoded',
            payload: payload,
            cookies: req.cookies
        });
        
    } catch (error) {
        console.error('Debug token error:', error);
        return res.json({
            success: false,
            message: 'Error processing token',
            error: error.message
        });
    }
}

export default debugTokenHandler;