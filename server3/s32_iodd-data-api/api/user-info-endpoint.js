/**
 * user-info-endpoint.js
 * Endpoint to get current user info from JWT token
 */

async function userInfoHandler(req, res) {
    try {
        const appToken = req.cookies.app_token;
        
        if (!appToken) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        
        // Decode JWT payload (simple decode without verification for app_token)
        const payload = JSON.parse(Buffer.from(appToken.split('.')[1], 'base64').toString());
        
        // Return user info from app_token
        return res.json({
            user_id: payload.user_id,
            user_name: payload.user_name,
            user_email: payload.user_email,
            user_role: payload.user_role
        });
        
    } catch (error) {
        console.error('User info error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

export default userInfoHandler;