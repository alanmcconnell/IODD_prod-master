// Member Bios Client for webpage_members_bio_view
class MemberBiosClient {
    constructor() {
        this.baseUrl = 'http://localhost:3004/api';
//      this.baseUrl        = 'http://localhost:3004/api';                              //#.(51013.01.15)
        this.baseUrl        =  window.fvaRs.SERVER_API_URL;                             // .(51013.01.15)
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

function selectMember(index, members) {
    // Remove previous selection
    document.querySelectorAll('.member-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selection to clicked item
    document.querySelector(`[data-index="${index}"]`).classList.add('selected');
    
    // Display bio
    const member = members[index];
    const bioDisplay = document.querySelector('.bio-display');
    const fullName = `${member.FirstName || ''} ${member.LastName || ''}`.trim();
    const bio = member.BIO || 'No bio available';
    
    bioDisplay.innerHTML = `
        <div class="bio-title">${fullName}</div>
        <div class="bio-content">${bio}</div>
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

    // Create the layout
    const contentLayout = document.createElement('div');
    contentLayout.className = 'content-layout';
    
    // Create members list
    const membersList = document.createElement('div');
    membersList.className = 'members-list';
    
    members.forEach((member, index) => {
        const fullName = `${member.FirstName || ''} ${member.LastName || ''}`.trim();
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';
        memberItem.setAttribute('data-index', index);
        memberItem.innerHTML = `<div class="member-name">${fullName}</div>`;
        memberItem.onclick = () => selectMember(index, members);
        membersList.appendChild(memberItem);
    });
    
    // Create bio display area
    const bioDisplay = document.createElement('div');
    bioDisplay.className = 'bio-display';
    bioDisplay.innerHTML = '<div class="no-selection">Select a member to view their biography</div>';
    
    contentLayout.appendChild(membersList);
    contentLayout.appendChild(bioDisplay);
    
    container.innerHTML = '';
    container.appendChild(contentLayout);
}

// Initialize and load data
const client = new MemberBiosClient();

async function loadMembersBios() {
    try {
        showLoading();
        const data = await client.getMembersBios();
        displayMembersBios(data);
    } catch (error) {
        showError(error);
    }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadMembersBios);