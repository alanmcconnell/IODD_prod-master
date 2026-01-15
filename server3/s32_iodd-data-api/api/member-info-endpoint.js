/**
 * member-info-endpoint.js
 * Get member details by email from JWT token
 */

import { verifyToken } from '../global-token-functions.js';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function memberInfoHandler(req, res) {
    try {
        console.log('Member info request received');
        
        // CORS is handled by middleware, no need for manual headers
        
        const authToken = req.cookies.auth_token;
        console.log('Auth token present:', !!authToken);
        
        if (!authToken) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        
        const payload = verifyToken(authToken);
        console.log('Token payload:', payload);
        
        if (!payload || !payload.email) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or no email in token'
            });
        }
        
        const [rows] = await pool.execute(
            'SELECT FirstName, LastName, Email FROM members WHERE Email = ?',
            [payload.email]
        );
        
        console.log('Database query result:', rows);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Member not found for email: ' + payload.email
            });
        }
        
        return res.json({
            success: true,
            member: {
                firstName: rows[0].FirstName,
                lastName: rows[0].LastName,
                email: rows[0].Email,
                fullName: `${rows[0].FirstName} ${rows[0].LastName}`
            }
        });
        
    } catch (error) {
        console.error('Member info error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
}

export default memberInfoHandler;