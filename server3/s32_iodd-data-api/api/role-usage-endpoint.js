/**
 * role-usage-endpoint.js
 * Check if a role is assigned to any members
 */

import mysql from 'mysql2/promise';

async function roleUsageHandler(req, res) {
    try {
        // Create database connection
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        
        const roleId = req.query.id;
        
        if (!roleId) {
            return res.status(400).json({
                success: false,
                message: 'Role ID is required'
            });
        }
        
        // Check if role is assigned to any members
        const [rows] = await pool.execute(
            'SELECT Count(Id) AS TheCnt FROM members WHERE RoleId = ?',
            [roleId]
        );
        
        const count = rows[0]?.TheCnt || 0;
        
        return res.json({
            success: true,
            roleId: roleId,
            count: count,
            canDelete: count === 0
        });
        
    } catch (error) {
        console.error('Role usage check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to check role usage',
            error: error.message
        });
    }
}

export default roleUsageHandler;