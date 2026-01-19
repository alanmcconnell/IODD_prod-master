// Listen for navigation events to catch original URL
window.addEventListener('beforeunload', function() {
    console.log('Page unloading, URL was:', window.location.href);
});

// Check if we can get the original URL from performance API
if (performance.getEntriesByType) {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
        console.log('Navigation entry:', navEntries[0]);
    }
}

// Prevent redirect loops by checking if we've been here before
if (sessionStorage.getItem('credentials_processing')) {
    console.log('REDIRECT LOOP DETECTED - stopping execution');
    document.querySelector('.message').textContent = 'Redirect loop detected. Please clear browser cache and try again.';
    throw new Error('Redirect loop detected');
}
sessionStorage.setItem('credentials_processing', 'true');

// Extract PKCE token from URL and process credentials
(async function() {
    try {
        // Get auth_token from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        
        // Auth token should be in localStorage from SecureAccess (not URL)
        let authToken = localStorage.getItem('auth_token') || localStorage.getItem('temp_token') || sessionStorage.getItem('auth_token');
        
        // Also check URL parameters as fallback
        if (!authToken) {
            authToken = urlParams.get('auth_token') || urlParams.get('token') || urlParams.get('access_token') || urlParams.get('code');
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            if (!authToken) {
                authToken = hashParams.get('auth_token') || hashParams.get('token') || hashParams.get('access_token') || hashParams.get('code');
            }
        }
        
        // Listen for postMessage from SecureAccess
        if (!authToken) {
            window.addEventListener('message', function(event) {
                if (event.data && event.data.auth_token) {
                    processCredentials(event.data.auth_token);
                }
            });
        }
        
        if (!authToken) {
            document.querySelector('.message').textContent = 'No auth token found from SecureAccess';
            sessionStorage.removeItem('credentials_processing');
            return;
        }
        
        await processCredentials(authToken);
        
    } catch (error) {
        console.error('Error preparing credentials:', error);
        sessionStorage.removeItem('credentials_processing');
        
        if (error.message !== 'Redirect loop detected') {
            await acm_SecurePopUp('Error preparing credentials: ' + error.message, 'OK:ok');
        }
        document.querySelector('.message').textContent = 'Error preparing credentials: ' + error.message;
    }
})();

// Separate function to process credentials
async function processCredentials(authToken) {
    try {
        document.querySelector('.message').textContent = 'Processing credentials...';
        
        // Decode auth token (assuming it's base64 encoded JWT)
        const tokenPayload = JSON.parse(atob(authToken.split('.')[1]));
        const email = tokenPayload.email;
        
        if (!email) {
            throw new Error('No email found in PKCE token');
        }
        
        // Get API URL from config
        const apiUrl = window.FVARS?.SERVER_API_URL || 'http://localhost:54382/api2';
        
        // Fetch member data
        const memberResponse = await fetch(`${apiUrl}/members?email=${encodeURIComponent(email)}`);
        if (!memberResponse.ok) {
            throw new Error('Failed to fetch member data');
        }
        
        const memberData = await memberResponse.json();
        
        // Handle different response formats - API returns {members: [...]}
        let member;
        if (memberData.members && Array.isArray(memberData.members)) {
            member = memberData.members[0];
        } else if (Array.isArray(memberData)) {
            member = memberData[0];
        } else {
            member = memberData;
        }
        
        if (!member || !member.RoleId) {
            throw new Error('Member data incomplete');
        }
        
        // Fetch role data
        let roleResponse = await fetch(`${apiUrl}/roles?id=${member.RoleId}`);
        
        if (!roleResponse.ok) {
            roleResponse = await fetch(`${apiUrl}/roles/${member.RoleId}`);
        }
        
        if (!roleResponse.ok) {
            throw new Error('Failed to fetch role data');
        }
        
        const roleData = await roleResponse.json();
        
        // Handle different response formats - find role by ID
        let role;
        if (roleData.roles && Array.isArray(roleData.roles)) {
            role = roleData.roles.find(r => r.Id == member.RoleId);
        } else if (Array.isArray(roleData)) {
            role = roleData.find(r => r.Id == member.RoleId);
        } else {
            role = roleData;
        }
        
        if (!role || !role.Name) {
            throw new Error('Role data incomplete');
        }
        
        // Validate role name (database only contains Admin, Editor, Member)
        const validRoles = ['Admin', 'Editor', 'Member'];
        const userRole = validRoles.includes(role.Name) ? role.Name : 'Member';
        
        // Create JWT payload for app_token
        const jwtPayload = {
            user_no: member.MemberNo || member.Id || '',
            user_email: member.Email || '',
            user_role: userRole,
            user_name: ((member.FirstName || '') + ' ' + (member.LastName || '')).trim() || member.FullName || ''
        };
        
        // Create JWT token
        const jwtResponse = await fetch(`${apiUrl}/jwt/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ payload: jwtPayload })
        });
        
        if (!jwtResponse.ok) {
            throw new Error('Failed to create JWT token');
        }
        
        const jwtResult = await jwtResponse.json();
        const app_key = jwtResult.token;
        
        // Store JWT token as 'app_token' (not 'user_jwt_token')
        localStorage.setItem('app_token', app_key);
        
        
        // Clean up temporary storage
        localStorage.removeItem('pkce_token');
        localStorage.removeItem('temp_token');
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('pkce_token');
        
        // Redirect or notify completion
        document.querySelector('.message').textContent = 'Credentials prepared successfully!';
        
        // Clear the processing flag before redirect
        sessionStorage.removeItem('credentials_processing');
        
        // Redirect to member profile page immediately
        const redirectUrl = 'member-profile.html';
        window.location.href = redirectUrl;
        
    } catch (error) {
        console.error('Error processing credentials:', error);
        document.querySelector('.message').textContent = 'Error processing credentials. Redirecting to home...';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}