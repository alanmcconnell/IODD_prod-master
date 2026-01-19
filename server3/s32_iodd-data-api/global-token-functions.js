/**
 * global-token-functions.js
 * JWT token creation and verification functions
 * This file is deprecated - use JWT-Tokens-Server.js instead
 */

import { acmJWTCreate, acmJWTVerify } from './JWT-Tokens-Server.js';

// Re-export functions from JWT-Tokens-Server for backward compatibility
export function createToken(payload) {
    return acmJWTCreate(payload);
}

export function verifyToken(token) {
    try {
        return acmJWTVerify(token);
    } catch (error) {
        return null;
    }
}