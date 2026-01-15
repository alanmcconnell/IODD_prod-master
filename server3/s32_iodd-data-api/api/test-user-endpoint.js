/**
 * test-user-endpoint.js
 * Test endpoint that returns real member data from database
 */

import mysql from 'mysql2/promise';

async function testUserHandler(req, res) {
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
        
        // Use a specific email to find the correct member (simulating JWT token email)
        const testEmail = 'robin.mattern@gmail.com'; // Change this to test different members
        const [rows] = await pool.execute(
            'SELECT FirstName, LastName, Email FROM members WHERE Email = ? AND Active = "Y"',
            [testEmail]
        );
        
        // If specific member not found, get first active member
        if (rows.length === 0) {
            const [fallbackRows] = await pool.execute(
                'SELECT FirstName, LastName, Email FROM members WHERE Active = "Y" LIMIT 1'
            );
            rows.push(...fallbackRows);
        }
        
        if (rows.length > 0) {
            const member = rows[0];
            return res.json({
                success: true,
                member: {
                    fullName: `${member.FirstName} ${member.LastName}`,
                    email: member.Email,
                    firstName: member.FirstName,
                    lastName: member.LastName
                }
            });
        } else {
            // Fallback to test data if no members found
            return res.json({
                success: true,
                member: {
                    fullName: 'John Doe',
                    email: 'john.doe@example.com',
                    firstName: 'John',
                    lastName: 'Doe'
                }
            });
        }
    } catch (error) {
        console.error('Test user endpoint error:', error);
        return res.json({
            success: true,
            member: {
                fullName: 'John Doe',
                email: 'john.doe@example.com',
                firstName: 'John',
                lastName: 'Doe'
            }
        });
    }
}

export default testUserHandler;