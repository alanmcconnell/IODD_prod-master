/**
 * fix-token-endpoint.js
 * Copy token from authToken to auth_token cookie
 */

function fixTokenHandler(req, res) {
    try {
        const authToken = req.cookies.authToken;
        
        if (!authToken) {
            return res.json({
                success: false,
                message: 'No authToken cookie found'
            });
        }
        
        // Copy the token to the correct cookie name
        res.cookie('auth_token', authToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        return res.json({
            success: true,
            message: 'Token copied from authToken to auth_token',
            token_set: true
        });
        
    } catch (error) {
        console.error('Fix token error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fix token'
        });
    }
}

export default fixTokenHandler;