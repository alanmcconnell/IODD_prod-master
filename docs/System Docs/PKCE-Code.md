# PKCE Authentication Code - IODD Application

## Overview
This document contains the minimal code needed to implement PKCE (Proof Key for Code Exchange) authentication flow in the IODD application.

## 1. Pre-Authentication Code (Before SecureAccess App)

### 1.1 Generate PKCE Parameters
```javascript
// Generate code verifier and challenge for PKCE
function generatePKCEParams() {
    // Generate random code verifier (43-128 characters)
    const codeVerifier = generateRandomString(128);
    
    // Create code challenge using SHA256
    const codeChallenge = base64URLEncode(sha256(codeVerifier));
    
    // Store verifier in sessionStorage for later use
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);
    
    return {
        codeVerifier,
        codeChallenge,
        codeChallengeMethod: 'S256'
    };
}

// Generate cryptographically secure random string
function generateRandomString(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const values = new Uint8Array(length);
    crypto.getRandomValues(values);
    return Array.from(values, x => charset[x % charset.length]).join('');
}

// SHA256 hash function
async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return crypto.subtle.digest('SHA-256', data);
}

// Base64 URL encode
function base64URLEncode(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
```

### 1.2 Initiate PKCE Login Flow
```javascript
// Replace the existing login button onclick handler
function initiateLogin() {
    const pkceParams = generatePKCEParams();
    
    // Build authorization URL with PKCE parameters
    const authParams = new URLSearchParams({
        response_type: 'code',
        client_id: 'iodd-client',
        redirect_uri: 'http://localhost:54032/api2/auth/callback',
        code_challenge: pkceParams.codeChallenge,
        code_challenge_method: pkceParams.codeChallengeMethod,
        state: generateRandomString(32) // CSRF protection
    });
    
    // Store state for validation
    sessionStorage.setItem('oauth_state', authParams.get('state'));
    
    // Redirect to SecureAccess app
    const authURL = `http://127.0.0.1:5505/client/c01_client-first-app/login_client.html?${authParams}`;
    window.location.href = authURL;
}

// Update login button in index.html
// Replace: onclick="window.location.href='http://127.0.0.1:5505/client/c01_client-first-app/login_client.html'"
// With: onclick="initiateLogin()"
```

## 2. Post-Authentication Code (After SecureAccess Login)

### 2.1 Handle Authorization Callback
```javascript
// Add to index.html or create separate callback handler
function handleAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    // Validate state parameter
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
        console.error('Invalid state parameter');
        return;
    }
    
    if (error) {
        console.error('Authorization error:', error);
        return;
    }
    
    if (authCode) {
        exchangeCodeForToken(authCode);
    }
}

// Exchange authorization code for token
async function exchangeCodeForToken(authCode) {
    const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
    
    if (!codeVerifier) {
        console.error('Code verifier not found');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:54032/api2/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: authCode,
                code_verifier: codeVerifier,
                client_id: 'iodd-client',
                redirect_uri: 'http://localhost:54032/api2/auth/callback'
            })
        });
        
        if (response.ok) {
            const tokenData = await response.json();
            handleSuccessfulAuth(tokenData);
        } else {
            console.error('Token exchange failed');
        }
    } catch (error) {
        console.error('Token exchange error:', error);
    } finally {
        // Clean up stored values
        sessionStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('oauth_state');
    }
}
```

### 2.2 Verify and Process Token
```javascript
// Handle successful authentication
function handleSuccessfulAuth(tokenData) {
    // Verify JWT token structure
    if (!tokenData.access_token) {
        console.error('No access token received');
        return;
    }
    
    try {
        // Decode JWT payload (without verification - server handles that)
        const payload = JSON.parse(atob(tokenData.access_token.split('.')[1]));
        
        // Validate token expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            console.error('Token expired');
            return;
        }
        
        // Set global authentication variables
        window.gMemberId = payload.user_id;
        window.gRole = payload.role;
        window.gRoleId = payload.role_id;
        window.gMemberName = payload.username;
        
        // Update UI to show authenticated state
        updateNavWithMemberName();
        
        // Redirect to member area or refresh page
        window.location.href = 'member-profile.html';
        
    } catch (error) {
        console.error('Token validation error:', error);
    }
}

// Verify token with server
async function verifyTokenWithServer() {
    try {
        const response = await authenticatedFetch('http://localhost:54032/api2/auth/verify');
        
        if (response.ok) {
            const userData = await response.json();
            
            // Update global variables with verified data
            window.gMemberId = userData.user_id;
            window.gRole = userData.role;
            window.gRoleId = userData.role_id;
            
            return true;
        }
        return false;
    } catch (error) {
        console.error('Token verification failed:', error);
        return false;
    }
}
```

### 2.3 Enhanced Authentication Check
```javascript
// Enhanced authentication check for page load
async function checkAuthentication() {
    // Check for auth callback first
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code')) {
        handleAuthCallback();
        return;
    }
    
    // Check existing token
    if (hasValidToken()) {
        const isValid = await verifyTokenWithServer();
        if (isValid) {
            updateNavWithMemberName();
        } else {
            clearAuthToken();
        }
    }
}

// Add to DOMContentLoaded event
document.addEventListener('DOMContentLoaded', checkAuthentication);
```

## 3. Server-Side Token Exchange Endpoint

### 3.1 Enhanced PKCE Endpoint
```javascript
// Update pkce-auth-endpoint.js
async function pkceTokenExchange(req, res) {
    try {
        const { grant_type, code, code_verifier, client_id } = req.body;
        
        // Validate PKCE parameters
        if (grant_type !== 'authorization_code' || !code || !code_verifier) {
            return res.status(400).json({ error: 'invalid_request' });
        }
        
        // Verify code challenge (retrieve from stored auth codes)
        const storedChallenge = await getStoredCodeChallenge(code);
        const computedChallenge = base64URLEncode(sha256(code_verifier));
        
        if (storedChallenge !== computedChallenge) {
            return res.status(400).json({ error: 'invalid_grant' });
        }
        
        // Get user data associated with auth code
        const userData = await getUserDataByCode(code);
        
        // Create JWT token
        const payload = {
            user_id: userData.user_id,
            username: userData.username,
            email: userData.email,
            role: userData.role,
            role_id: userData.role_id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
        };
        
        const accessToken = createToken(payload);
        
        // Set secure cookie
        res.cookie('auth_token', accessToken, {
            httpOnly: true,
            secure: false, // Set to true in production
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });
        
        res.json({
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 86400
        });
        
    } catch (error) {
        console.error('PKCE token exchange error:', error);
        res.status(500).json({ error: 'server_error' });
    }
}
```

## 4. Integration Points

### 4.1 Update Login Button
```html
<!-- In index.html, replace the login button onclick -->
<button class="btn" onclick="initiateLogin()">Login</button>
```

### 4.2 Add PKCE Script
```html
<!-- Add before closing </body> tag in index.html -->
<script>
// Include all PKCE functions here or link to separate file
// generatePKCEParams(), initiateLogin(), handleAuthCallback(), etc.
</script>
```

### 4.3 Server Route Registration
```javascript
// Add to server routes
app.post('/api2/auth/token', pkceTokenExchange);
app.get('/api2/auth/verify', verifyTokenEndpoint);
```

---
*This implementation provides secure PKCE authentication flow with minimal code changes to the existing IODD application.*