// Member Bios Client for webpage_members_bio_view
class MemberBiosClient {
    constructor() {
//      this.baseUrl        = 'http://localhost:3004/api';                              //#.(51013.01.7)
        this.baseUrl        =  window.FVARS.SERVER_API_URL;                             // .(51013.01.7)
    }

    async fetchData(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            console.log('Raw response:', text);
            
            try {
                return JSON.parse(text);
            } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                throw new Error('Server returned invalid JSON');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    async getMembersBios() {
        return await this.fetchData('/webpage_members_bio_view');
    }
}

// UI Functions
function showLoading() {
    const container = document.getElementById('data-display');
    container.innerHTML = '<div class="loading">Loading member biographies...</div>';
}

function showError(error) {
    const container = document.getElementById('data-display');
    container.innerHTML = `<div class="error">Error loading data: ${error.message}</div>`;
}



function createMemberCard(member, index) {
    const fullName = `${member.FirstName || ''} ${member.LastName || ''}`.trim();
    console.log('Member data:', member);
    console.log('Available fields:', Object.keys(member));
    
    // Use the BIO field from the database view
    const bio = member.BIO || 'No bio available';
    
    return `
        <div class="member-card" id="card-${index}">
            <div class="member-name">${fullName}</div>
            <div class="bio-section">
                <div class="bio-text">${bio}</div>
            </div>
        </div>
    `;
}

function displayMembersBios(data) {
    const container = document.getElementById('data-display');
    
    console.log('Data received:', data);
    console.log('Data type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    
    if (!data) {
        container.innerHTML = '<p class="error">No data received from server</p>';
        return;
    }
    
    // Handle different response formats - be more flexible
    let members = null;
    
    if (Array.isArray(data)) {
        members = data;
    } else if (typeof data === 'object') {
        // Try different possible property names
        members = data.members || data.data || data.results || data.webpage_members_bio_view;
        
        // If still no members found, try to use the object directly if it has expected properties
        if (!members && data.FirstName) {
            members = [data]; // Single member object
        }
    }
    
    if (!members || !Array.isArray(members) || members.length === 0) {
        container.innerHTML = '<p class="error">No member biographies available</p>';
        return;
    }

    const membersGrid = document.createElement('div');
    membersGrid.className = 'members-grid';
    
    members.forEach((member, index) => {
        membersGrid.innerHTML += createMemberCard(member, index);
    });

    container.innerHTML = '';
    container.appendChild(membersGrid);
}

// client will be initialized after config loads
const client = new MemberBiosClient();   // .(51013.05.1 RAM Why wasn't this set.  Line 116 always fails if not set)

async function loadMembersBios() {
    try {
        showLoading();
        // Wait for client to be ready
        while (!client) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        const data = await client.getMembersBios();
        displayMembersBios(data);
    } catch (error) {
        showError(error);
    }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadMembersBios);