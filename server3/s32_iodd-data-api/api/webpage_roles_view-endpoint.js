/**
 * webpage_roles_view-endpoint.js
 * Returns roles data from webpage_roles_view
 */

import mysql from 'mysql2/promise';

async function webpageRolesViewHandler(req, res) {
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
        
        // Get roles data
        const [rows] = await pool.execute(
            'SELECT Id, Name FROM webpage_roles_view ORDER BY Name'
        );
        
        return res.json({
            success: true,
            count: rows.length,
            roles: rows
        });
        
    } catch (error) {
        console.error('Webpage roles view error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch roles',
            error: error.message
        });
    }
}

export default webpageRolesViewHandler;