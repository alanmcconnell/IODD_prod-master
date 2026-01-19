/**
 * pkce-auth-endpoint.js
 * PKCE authentication callback handler
 */

import { createToken } from '../global-token-functions.js';
import mysql from 'mysql2/promise';

// Database configuration
const pDB_Config = {
    host: process.env.DB_Host,
    user: process.env.DB_User,
    password: process.env.DB_Password,
    database: process.env.DB_Database,
    port: process.env.DB_Port
};

// PKCE authentication callback handler
async function pkceAuthHandler(req, res) {
    try {
        const { code, pkce, user_id, username, email, role } = req.query;
        
        if (!code && !pkce) {
            return res.status(400).json({ 
                success: false, 
                message: 'Authorization code or PKCE parameter is required' 
            });
        }
        
        // Create JWT token with user info (no sensitive data in URL)
        const payload = {
            user_id: user_id,
            username: username,
            email: email,
            role: role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        };
        
        const jwtToken = createToken(payload);
        
        // Set HTTP-only cookie with JWT token
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('auth_token', jwtToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        // Create app_token using member information from PKCE token
        try {
            const { acmJWTCreate } = await import('../JWT-Tokens-Server.js');
            
            // Create database connection
            const pDB = await mysql.createConnection(pDB_Config);
            
            // Look up member by email from PKCE token (using parameterized query)
            let memberData = null;
            if (email) {
                const memberSQL = 'SELECT MemberNo, FirstName, LastName, Email, RoleId FROM members WHERE Email = ? AND Active = ? LIMIT 1';
                const [memberResult] = await pDB.execute(memberSQL, [email, 'Y']);
                
                if (memberResult && memberResult.length > 0) {
                    memberData = memberResult[0];
                }
            }
            
            // Get role name from RoleId if member found (using parameterized query)
            let roleName = role || 'Member';
            if (memberData && memberData.RoleId) {
                const roleSQL = 'SELECT Name FROM roles WHERE Id = ? AND Active = ? LIMIT 1';
                const [roleResult] = await pDB.execute(roleSQL, [memberData.RoleId, 'Yes']);
                if (roleResult && roleResult.length > 0) {
                    roleName = roleResult[0].Name;
                }
            }
            
            // Create app_token payload with member data or PKCE data
            const appTokenPayload = {
                user_id: memberData ? memberData.MemberNo : user_id,
                user_name: memberData ? `${memberData.FirstName || ''} ${memberData.LastName || ''}`.trim() : username,
                user_email: memberData ? memberData.Email : email,
                user_role: roleName
            };
            
            const appToken = acmJWTCreate(appTokenPayload);
            
            // Set app_token cookie
            res.cookie('app_token', appToken, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? 'strict' : 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });
            
            await pDB.end();
            
        } catch (tokenError) {
            console.error('App token creation failed:', tokenError);
        }
        
        // Redirect to clean URL without parameters
        res.redirect('/member-profile.html');
        
    } catch (error) {
        // Log error without exposing details to client
        console.error('PKCE auth error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
}

export default pkceAuthHandler;