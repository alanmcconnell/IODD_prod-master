const JWT_API_BASE = window.fvaRs?.SERVER_API_URL ? `${window.fvaRs.SERVER_API_URL}/jwt` : 'http://localhost:54382/api2/jwt';

async function acmJWTCreate(payload = {}) {
    try {
        const response = await fetch(`${JWT_API_BASE}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ payload })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('app_token', data.token);
        }
        return data;
    } catch (error) {
        throw new Error('Token creation failed: ' + error.message);
    }
}

async function acmJWTPost(key, value) {
    try {
        const token = localStorage.getItem('app_token');
        if (!token) {
            throw new Error('No token found');
        }
        
        const response = await fetch(`${JWT_API_BASE}/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ key, value })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('app_token', data.token);
        }
        return data;
    } catch (error) {
        throw new Error('Token update failed: ' + error.message);
    }
}

async function acmJWTFetch(key) {
    try {
        const token = localStorage.getItem('app_token');
        if (!token) {
            throw new Error('No token found');
        }
        
        const response = await fetch(`${JWT_API_BASE}/fetch/${encodeURIComponent(key)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.value;
    } catch (error) {
        throw new Error('Token fetch failed: ' + error.message);
    }
}

function acmJWTGetPayload() {
    try {
        const token = localStorage.getItem('app_token');
        if (!token) return null;
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch (error) {
        return null;
    }
}

function acmJWTClear() {
    localStorage.removeItem('app_token');
}