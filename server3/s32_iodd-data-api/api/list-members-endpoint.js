/**
 * list-members-endpoint.js
 * Lists all active members in the database
 */

import mysql from 'mysql2/promise';

async function listMembersHandler(req, res) {
    try {
        // Create database connection
        const pool = mysql.createPool({
            host: process.env.DB_Host,
            user: process.env.DB_User,
            password: process.env.DB_Password,
            database: process.env.DB_Database,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        
        // Get all active members
        const [rows] = await pool.execute(
            'SELECT MemberNo, FirstName, LastName, Email FROM members WHERE Active = "Y" ORDER BY FirstName, LastName'
        );
        
        const members = rows.map(member => ({
            MemberNo: member.MemberNo,
            fullName: `${member.FirstName} ${member.LastName}`,
            email: member.Email,
            FirstName: member.FirstName,
            LastName: member.LastName
        }));
        
        return res.json({
            success: true,
            count: members.length,
            members: members
        });
        
    } catch (error) {
        console.error('List members error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch members',
            error: error.message
        });
    }
}

export default listMembersHandler;