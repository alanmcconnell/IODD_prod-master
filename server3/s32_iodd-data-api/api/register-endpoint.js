/**
 * register-endpoint.js
 * Secure registration endpoint that creates accounts in both IODD and SecureAccess
 */

import crypto from 'crypto';
import { acm_NextID } from '../lib/acm_NextID.js';

// Hash function for passwords and security answers
function hashValue(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

async function registerHandler(req, res) {
    try {
        console.log('Registration request received');
        console.log('Request body:', { ...req.body, password: '***', secureAnswer1: '***', secureAnswer2: '***' });
        
        const { firstName, lastName, email, username, password, 
                secureQuestion1, secureAnswer1, secureQuestion2, secureAnswer2 } = req.body;
        
        // Server-side validation
        if (!firstName || !lastName || !email || !username || !password || 
            !secureQuestion1 || !secureAnswer1 || !secureQuestion2 || !secureAnswer2) {
            console.log('Validation failed: Missing fields');
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        
        // Validate email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }
        
        // Validate password strength
        if (password.length < 8 || !/[A-Z]/.test(password) || 
            !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
            });
        }
        
        // Use the existing database connection from the request
        const { getData, putData } = await import('./assets/mjs/formr_server-fns.mjs');
        
        // Check if email already exists
        console.log('Checking if email exists:', email);
        const checkEmailSQL = `SELECT Id FROM members WHERE Email = '${email}' LIMIT 1`;
        const existingUsers = await getData(req.pDB, checkEmailSQL, '/register');
        
        if (existingUsers && existingUsers.length > 0 && existingUsers[0] !== 'error') {
            console.log('Email already exists');
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }
        
        // Hash sensitive data
        console.log('Hashing sensitive data');
        const hashedPassword = hashValue(password);
        const hashedAnswer1 = hashValue(secureAnswer1);
        const hashedAnswer2 = hashValue(secureAnswer2);
        
        // Get next MemberNo
        const memberNo = await acm_NextID(req.pDB, 'MemberNo');
        console.log('Generated MemberNo:', memberNo);
        
        // Create IODD member record
        console.log('Creating member record');
        const memberResult = await putData(req.pDB,
            `INSERT INTO members 
             (MemberNo, FirstName, LastName, Email, PIN, RoleId, Active, CreatedAt, UpdatedAt)
             VALUES (${memberNo}, '${firstName}', '${lastName}', '${email}', 'iodd', 1, 'Y', NOW(), NOW())`,
            '/register'
        );
        
        if (memberResult[0] === 'error') {
            throw new Error(memberResult[1]);
        }
        
        const newMemberId = memberResult[2].insertId;
        console.log('Member created with ID:', newMemberId, 'MemberNo:', memberNo);
        
        // Create SecureAccess user account (server-to-server)
        try {
            const secureAccessUrl = process.FVARS?.SECURE_API_URL || 'http://localhost:56785/api';
            const secureAccessData = {
                firstName,
                lastName,
                email,
                username,
                password: hashedPassword,
                securityQuestion1: secureQuestion1,
                securityAnswer1: hashedAnswer1,
                securityQuestion2: secureQuestion2,
                securityAnswer2: hashedAnswer2,
                appKey: process.FVARS?.SECURE_APP_KEY || 'IODD',
                userRole: 'Member'
            };
            
            const secureResponse = await fetch(`${secureAccessUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': process.FVARS?.SECURE_API_SECRET || ''
                },
                body: JSON.stringify(secureAccessData)
            });
            
            if (!secureResponse.ok) {
                console.error('SecureAccess registration failed:', await secureResponse.text());
                // Continue anyway - user can still use IODD
            }
        } catch (secureError) {
            console.error('SecureAccess API error:', secureError);
            // Continue anyway - user can still use IODD
        }
        
        return res.json({
            success: true,
            message: 'Registration successful',
            memberId: newMemberId
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        
        return res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
}

export default registerHandler;
