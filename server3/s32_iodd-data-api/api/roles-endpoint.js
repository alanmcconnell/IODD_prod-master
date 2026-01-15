/**
 * roles-endpoint.js
 * CRUD operations for roles table
 */

import mysql from 'mysql2/promise';

async function rolesHandler(req, res) {
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
        
        if (req.method === 'GET') {
            // Get all roles
            const [rows] = await pool.execute(
                `SELECT * FROM ${process.env.DB_NAME}.roles ORDER BY Name`
            );
            
            return res.json({
                success: true,
                count: rows.length,
                roles: rows
            });
        }
        
        if (req.method === 'POST') {
            // Create or update role
            const { id, name, scope, active } = req.body;
            
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Name is required'
                });
            }
            
            if (id && id !== '0') {
                // Update existing role
                const [result] = await pool.execute(
                    `UPDATE ${process.env.DB_NAME}.roles SET Name = ?, Scope = ?, Active = ?, UpdatedAt = NOW() WHERE Id = ?`,
                    [name, scope || '', active || 'Yes', id]
                );
                
                return res.json({
                    success: true,
                    message: 'Role updated successfully',
                    affectedRows: result.affectedRows
                });
            } else {
                // Create new role
                const [result] = await pool.execute(
                    `INSERT INTO ${process.env.DB_NAME}.roles (Name, Scope, Active, CreatedAt, UpdatedAt) VALUES (?, ?, ?, NOW(), NOW())`,
                    [name, scope || '', active || 'Yes']
                );
                
                return res.json({
                    success: true,
                    message: 'Role created successfully',
                    insertId: result.insertId
                });
            }
        }
        
        if (req.method === 'DELETE') {
            // Delete role
            const roleId = req.query.id;
            
            if (!roleId) {
                return res.status(400).json({
                    success: false,
                    message: 'Role ID is required'
                });
            }
            
            const [result] = await pool.execute(
                `DELETE FROM ${process.env.DB_NAME}.roles WHERE Id = ?`,
                [roleId]
            );
            
            return res.json({
                success: true,
                message: 'Role deleted successfully',
                affectedRows: result.affectedRows
            });
        }
        
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
        
    } catch (error) {
        console.error('Roles endpoint error:', error);
        return res.status(500).json({
            success: false,
            message: 'Database error',
            error: error.message
        });
    }
}

export default rolesHandler;