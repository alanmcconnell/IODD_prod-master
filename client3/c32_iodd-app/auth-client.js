/**
 * auth-client.js
 * Client-side authentication handling
 */

// Get user info from server (JWT token in HTTP-only cookie)
async function getCurrentUser() {
    try {
        // Try the member info endpoint first
//      const response = await fetch( 'http://localhost:54032/api2/member/info', {      //#.(51013.01.4)        
//      const response = await fetch(`${window.fvaRs.AUTH_API_URL}/member/info`, {      //#.(51013.01.4)        
        const response = await fetch(`${window.fvaRs.SERVER_API_URL}/member/info`, {    // .(51013.01.4)        
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.success ? data.member : null;
        }
        
        return null;
    } catch (error) {
        console.error('Error getting user info:', error);
        return null;
    }
}

// Check if user is authenticated and populate UI
async function checkAuth() {
    const user = await getCurrentUser();
    
    if (user) {
        // User is authenticated, update UI
        updateUIForAuthenticatedUser(user);
        return user;
    } else {
        // User not authenticated
        updateUIForGuestUser();
        return null;
    }
}

function updateUIForAuthenticatedUser(user) {
    // Update navigation buttons
    const navButtons = document.querySelector('.nav-buttons');
    if (navButtons) {
        const displayName = user.FullName || user.username || user.Email || 'Member';
        navButtons.innerHTML = `
            <span style="color: #333; margin-right: 10px;">Welcome, ${displayName}</span>
            <button class="btn" onclick="logout()">Logout</button>
        `;
    }
    
    // Store user data for page use
    window.currentUser = user;
}

function updateUIForGuestUser() {
    // Keep default login/register buttons
    window.currentUser = null;
}

async function logout() {
    try {
//      await fetch( 'http://localhost:54032/api2/auth/logout', {                       //#.(51013.01.4) 
//      await fetch(`${window.fvaRs.AUTH_API_URL}/auth/logout`, {                       //#.(51013.01.4) 
        await fetch(`${window.fvaRs.SECURE_API_URL}/auth/logout`, {                     // .(51013.01.4) 
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    // Redirect to home
    window.location.href = '/';
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', checkAuth);