import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRY = '1h';

export function acmJWTCreate(payload = {}) {
    try {
        const tokenPayload = {
            name: 'app_Token',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            user_no: payload.user_no || '',
            user_name: payload.user_name || '',
            user_email: payload.user_email || '',
            user_role: payload.user_role || 'user',
            ...payload
        };
        
        return jwt.sign(tokenPayload, JWT_SECRET, { algorithm: 'HS256' });
    } catch (error) {
        throw new Error('Token creation failed: ' + error.message);
    }
}

export function acmJWTPost(token, key, value) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const allowedKeys = ['user_no', 'user_name', 'user_email', 'user_role'];
        if (!allowedKeys.includes(key)) {
            throw new Error(`Invalid key: ${key}. Allowed keys: ${allowedKeys.join(', ')}`);
        }
        
        /* Validation of the user_role. If not needed comment it out. */
        if (key === 'user_role' && !['Admin', 'Editor', 'Member'].includes(value)) {
            throw new Error('Invalid user_role. Allowed: Admin, Editor, Member');
        }
        
        decoded[key] = value;
        delete decoded.iat;
        delete decoded.exp;
        
        return acmJWTCreate(decoded);
    } catch (error) {
        throw new Error('Token update failed: ' + error.message);
    }
}

export function acmJWTFetch(token, key) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const allowedKeys = ['user_no', 'user_name', 'user_email', 'user_role', 'name'];
        if (!allowedKeys.includes(key)) {
            throw new Error(`Invalid key: ${key}. Allowed keys: ${allowedKeys.join(', ')}`);
        }
        
        return decoded[key] || null;
    } catch (error) {
        throw new Error('Token fetch failed: ' + error.message);
    }
}

export function acmJWTVerify(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Token verification failed: ' + error.message);
    }
}