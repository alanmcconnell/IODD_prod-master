/**
 * login-endpoint.js
 * API endpoint for handling member login authentication
 */

const mysql = require('mysql2/promise');
// const dotenv = require('dotenv');            //#.(50922.02a.1 RAM).(50922.02.1 CAI Wrong!)

// Load environment variables
// dotenv.config();                             //#.(50922.02a.2 RAM).(50922.02.2 CAI Wrong!)

// Create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,                  // .(50922.02a.3 RAM Remove || "localhost" ).(50922.02.2 CAI Wrong! Beg)
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME, 
    port: process.env.DB_PORT,                  // .(50922.02a.3 End).(50922.02.2 End)
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Login endpoint handler
async function loginHandler(req, res) {
    try {
        const { username, password } = req.body;
        
        // Input validation
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }
        
        // Query the database
        const [rows] = await pool.execute(
            'SELECT MemberNo, UserName, Password FROM users WHERE UserName = ? AND Password = ?',
            [username, password]
        );
        
        // Check if user exists with matching credentials
        if (rows.length > 0) {
            // Authentication successful
            return res.status(200).json({
                success: true,
                message: 'Access Approved',
                memberNo: rows[0].MemberNo
            });
        } else {
            // Authentication failed
            return res.status(401).json({
                success: false,
                message: 'Invalid User name or password'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error occurred'
        });
    }
}

// Export the handler
module.exports = loginHandler;