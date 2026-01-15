/**
 * create-test-token-endpoint.js
 * Creates a test JWT token for development/testing
 */

import { createToken } from '../global-token-functions.js';

function createTestTokenHandler(req, res) {
    try {
        // Get email from query parameter or use default
        const email = req.query.email || 'robin.mattern@gmail.com';
        
        // Create JWT token with test user data
        const payload = {
            user_id: '123',
            username: 'testuser',
            email: email,
            role: 'member',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        };
        
        const jwtToken = createToken(payload);
        
        // Set HTTP-only cookie with JWT token
        res.cookie('auth_token', jwtToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        return res.json({
            success: true,
            message: `Test token created for ${email}`,
            email: email,
            token_set: true
        });
        
    } catch (error) {
        console.error('Create test token error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create test token'
        });
    }
}

export default createTestTokenHandler;