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
        // Debug URL information
        console.log('=== URL DEBUG INFO ===');
        console.log('Full URL:', window.location.href);
        console.log('Origin:', window.location.origin);
        console.log('Pathname:', window.location.pathname);
        console.log('Search:', window.location.search);
        console.log('Hash:', window.location.hash);
        console.log('Document referrer:', document.referrer);
        
        // Check if this is a POST request with form data
        if (document.forms.length > 0) {
            console.log('Forms found on page:', document.forms.length);
        }
        
        // Get PKCE token from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        console.log('URL parameters:', Object.fromEntries(urlParams));
        
        // Check specifically for pkce parameter
        const pkceFromUrl = urlParams.get('pkce');
        if (pkceFromUrl) {
            console.log('*** FOUND PKCE IN URL ***:', pkceFromUrl.substring(0, 20) + '...');
            console.log('*** FULL PKCE TOKEN ***:', pkceFromUrl);
        } else {
            console.log('*** NO PKCE PARAMETER IN URL ***');
            console.log('*** AVAILABLE PARAMETERS ***:', Object.fromEntries(urlParams));
        }
        
        // Also check hash fragment (some OAuth flows use this)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        console.log('Hash parameters:', Object.fromEntries(hashParams));
        
        // PKCE token should be in localStorage from SecureAccess (not URL)
        console.log('=== STORAGE DEBUG ===');
        console.log('localStorage length:', localStorage.length);
        console.log('All localStorage keys:', Object.keys(localStorage));
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            console.log(`localStorage[${key}]:`, localStorage.getItem(key));
        }
        
        // Get PKCE token from localStorage (SecureAccess stored it there)
        let pkceToken = localStorage.getItem('pkce_token') || localStorage.getItem('temp_token') || sessionStorage.getItem('pkce_token');
        
        // Also check URL parameters as fallback
        if (!pkceToken) {
            pkceToken = urlParams.get('pkce') || urlParams.get('token') || urlParams.get('pkce_token') || urlParams.get('access_token') || urlParams.get('code') ||
                       hashParams.get('pkce') || hashParams.get('token') || hashParams.get('pkce_token') || hashParams.get('access_token') || hashParams.get('code');
        }
        
        console.log('PKCE token source:', pkceToken ? (localStorage.getItem('pkce_token') ? 'localStorage' : 'URL') : 'Not found');
        console.log('PKCE token value:', pkceToken ? pkceToken.substring(0, 20) + '...' : 'None');
        
        // Listen for postMessage from SecureAccess
        if (!pkceToken) {
            console.log('Waiting for postMessage from SecureAccess...');
            window.addEventListener('message', function(event) {
                console.log('Received message:', event.data, 'from:', event.origin);
                if (event.data && event.data.pkce_token) {
                    console.log('Received PKCE token via postMessage');
                    processCredentials(event.data.pkce_token);
                }
            });
        }
        
        if (!pkceToken) {
            document.querySelector('.message').textContent = 'No PKCE token found from SecureAccess';
            console.log('ERROR: No PKCE token found in localStorage or URL');
            console.log('Expected: SecureAccess should store PKCE token in localStorage before redirect');
            console.log('Current app_key (IODD identifier):', localStorage.getItem('app_key'));
            
            // Clear processing flag and show debug button anyway
            sessionStorage.removeItem('credentials_processing');
            // document.getElementById('viewJwtBtn').style.display = 'inline-block';
            // setTimeout(() => {
            //     window.location.href = '/client3/c32_iodd-app/index.html';
            // }, 3000);
            return;
        }
        
        await processCredentials(pkceToken);
        
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
async function processCredentials(pkceToken) {
    try {
        console.log('Found PKCE token:', pkceToken.substring(0, 20) + '...');
        document.querySelector('.message').textContent = 'Processing credentials...';
        
        // Decode PKCE token (assuming it's base64 encoded JWT)
        const tokenPayload = JSON.parse(atob(pkceToken.split('.')[1]));
        const email = tokenPayload.email;
        
        if (!email) {
            throw new Error('No email found in PKCE token');
        }
        
        // Get API URL from config
        const apiUrl = window.fvaRs?.SERVER_API_URL || 'http://localhost:54382/api2';
        console.log('Using API URL:', apiUrl);
        
        // Fetch member data
        const memberResponse = await fetch(`${apiUrl}/members?email=${encodeURIComponent(email)}`);
        if (!memberResponse.ok) {
            throw new Error('Failed to fetch member data');
        }
        
        const memberData = await memberResponse.json();
        console.log('Raw member response:', memberData);
        
        // Handle different response formats - API returns {members: [...]}
        let member;
        if (memberData.members && Array.isArray(memberData.members)) {
            member = memberData.members[0];
        } else if (Array.isArray(memberData)) {
            member = memberData[0];
        } else {
            member = memberData;
        }
        
        console.log('Processed member:', member);
        
        if (!member || !member.RoleId) {
            throw new Error('Member data incomplete: ' + JSON.stringify(memberData));
        }
        
        // Fetch role data - check different possible endpoints
        console.log('Fetching role for RoleId:', member.RoleId);
        let roleResponse = await fetch(`${apiUrl}/roles?id=${member.RoleId}`);
        
        if (!roleResponse.ok) {
            console.log('Trying alternative roles endpoint...');
            roleResponse = await fetch(`${apiUrl}/roles/${member.RoleId}`);
        }
        
        if (!roleResponse.ok) {
            const errorText = await roleResponse.text();
            console.log('Role fetch error:', errorText);
            throw new Error('Failed to fetch role data: ' + errorText);
        }
        
        const roleData = await roleResponse.json();
        console.log('Raw role response:', roleData);
        
        // Handle different response formats - find role by ID
        let role;
        if (roleData.roles && Array.isArray(roleData.roles)) {
            role = roleData.roles.find(r => r.Id == member.RoleId);
        } else if (Array.isArray(roleData)) {
            role = roleData.find(r => r.Id == member.RoleId);
        } else {
            role = roleData;
        }
        
        console.log('Processed role:', role);
        
        if (!role || !role.Name) {
            throw new Error('Role data incomplete: ' + JSON.stringify(roleData));
        }
        
        // Validate role name (database only contains Admin, Editor, Member)
        const validRoles = ['Admin', 'Editor', 'Member'];
        const userRole = validRoles.includes(role.Name) ? role.Name : 'Member';
        console.log('Role validation:', role.Name, '->', userRole);
        
        // Create JWT payload for app_token
        const jwtPayload = {
            user_no: member.MemberNo || member.Id || '',
            user_email: member.Email || '',
            user_role: userRole,
            user_name: ((member.FirstName || '') + ' ' + (member.LastName || '')).trim() || member.FullName || ''
        };
        
        console.log('=== JWT PAYLOAD DEBUG ===');
        console.log('member.MemberNo:', member.MemberNo);
        console.log('member.RoleId:', member.RoleId);
        console.log('member.Email:', member.Email);
        console.log('member.FirstName:', member.FirstName);
        console.log('member.LastName:', member.LastName);
        console.log('=== ROLE LOOKUP DEBUG ===');
        console.log('role.Id:', role.Id);
        console.log('role.Name:', role.Name);
        console.log('userRole (after validation):', userRole);
        console.log('Final JWT payload:', jwtPayload);
        
        // Create JWT token
        const jwtResponse = await fetch(`${apiUrl}/jwt/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ payload: jwtPayload })
        });
        
        console.log('JWT creation response status:', jwtResponse.status);
        
        if (!jwtResponse.ok) {
            const errorText = await jwtResponse.text();
            console.log('JWT creation error:', errorText);
            throw new Error('Failed to create JWT token: ' + errorText);
        }
        
        const jwtResult = await jwtResponse.json();
        console.log('JWT creation result:', jwtResult);
        const app_key = jwtResult.token;
        
        // Store JWT token as 'app_token' (not 'user_jwt_token')
        localStorage.setItem('app_token', app_key);
        console.log('Stored app_token in localStorage:', app_key.substring(0, 20) + '...');
        

        
        // Clean up temporary storage
        localStorage.removeItem('pkce_token');
        localStorage.removeItem('temp_token');
        sessionStorage.removeItem('pkce_token');
        
        // Redirect or notify completion
        console.log('Credentials prepared successfully');
        document.querySelector('.message').textContent = 'Credentials prepared successfully!';
        
        // Clear the processing flag before redirect
        sessionStorage.removeItem('credentials_processing');
        
        // Redirect to member profile page immediately
        const redirectUrl = 'member-profile.html';
        console.log('SUCCESS: Redirecting to member profile:', redirectUrl);
        window.location.href = redirectUrl;
        
    } catch (error) {
        console.error('Error processing credentials:', error);
        document.querySelector('.message').textContent = 'Error processing credentials. Redirecting to home...';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}