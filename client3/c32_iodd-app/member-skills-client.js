// Member Skills Client for webpage_members_skills_view
class MemberSkillsClient {
    constructor() {
        this.baseUrl = window.FVARS.SERVER_API_URL;                                     // .(51013.01.29)
    }

    async fetchData(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            // console.log('Raw response:', text);
            
            if (!text || text.trim() === '') {
                throw new Error('Server returned empty response');
            }
            
            try {
                return JSON.parse(text);
            } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                console.error('Response text:', text);
                throw new Error(`Server returned invalid JSON: ${text.substring(0, 100)}...`);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    async getMembersSkills() {
        return await this.fetchData('/webpage_members_bio_view');
    }
}

// UI Functions
function showLoading() {
    const container = document.getElementById('data-display');
    container.innerHTML = '<div class="loading">Loading member skills...</div>';
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
    
    // Display skills
    const member = members[index];
    const skillsDisplay = document.querySelector('.skills-display');
    const fullName = `${member.FirstName || ''} ${member.LastName || ''}`.trim();
    
    // Try different possible field names for skills
    const skills = member.Skills || member.SKILLS || member.skills || member.BIO || 'No skills information available';
    
    skillsDisplay.innerHTML = `
        <div class="skills-title">${fullName} - Technical Skills</div>
        <div class="skills-content">${skills}</div>
    `;
}

let allMembers = []; // Store all members for filtering

function toggleClearButton() {
    const searchInput = document.getElementById('skillSearch');
    const clearButton = document.getElementById('searchClear');
    
    if (searchInput && clearButton) {
        clearButton.style.display = searchInput.value.length > 0 ? 'block' : 'none';
    }
}

function clearSearch() {
    const searchInput = document.getElementById('skillSearch');
    const clearButton = document.getElementById('searchClear');
    
    if (searchInput) {
        searchInput.value = '';
        displayFilteredMembers(allMembers);
        clearButton.style.display = 'none';
    }
}

function searchSkills() {
    const searchInput = document.getElementById('skillSearch').value.trim();
    
    if (!searchInput) {
        displayFilteredMembers(allMembers);
        return;
    }
    
    // Split search terms by comma and trim each term
    const searchTerms = searchInput.split(',').map(term => term.trim().toLowerCase()).filter(term => term);
    
    const filteredMembers = allMembers.filter(member => {
        const skills = member.Skills || member.SKILLS || member.skills || member.BIO || '';
        const skillsLower = skills.toLowerCase();
        
        // If any of the search terms are found in the skills, include this member
        return searchTerms.some(term => skillsLower.includes(term));
    });
    
    displayFilteredMembers(filteredMembers);
    
    // Clear the skills display after search
    const skillsDisplay = document.querySelector('.skills-display');
    if (skillsDisplay) {
        skillsDisplay.innerHTML = '<div class="no-selection">Select a member to view their technical skills</div>';
    }
}

function displayFilteredMembers(members) {
    const membersList = document.querySelector('.members-list');
    
    if (!membersList) {
        console.error('Members list element not found');
        return;
    }
    
    if (!members || members.length === 0) {
        membersList.innerHTML = '<div class="no-selection">No members found with that skill</div>';
        return;
    }
    
    membersList.innerHTML = '';
    members.forEach((member, index) => {
        const fullName = `${member.FirstName || ''} ${member.LastName || ''}`.trim();
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';
        memberItem.setAttribute('data-index', index);
        memberItem.innerHTML = `<div class="member-name">${fullName}</div>`;
        memberItem.onclick = () => selectMember(index, members);
        membersList.appendChild(memberItem);
    });
}

function displayMembersSkills(data) {
    const container = document.getElementById('data-display');
    
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
        container.innerHTML = '<p class="error">No member skills available</p>';
        return;
    }

    allMembers = members; // Store for filtering

    // Create the layout
    const contentLayout = document.createElement('div');
    contentLayout.className = 'content-layout';
    
    // Create members list (left panel)
    const membersList = document.createElement('div');
    membersList.className = 'members-list';
    
    // Create right panel with search and skills display
    const rightPanel = document.createElement('div');
    rightPanel.className = 'right-panel';
    
    // Create search container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <div class="search-input-wrapper">
            <input type="text" id="skillSearch" class="search-input" placeholder="Enter skills to search (separate with commas)" oninput="toggleClearButton()">
            <button class="search-clear" id="searchClear" onclick="clearSearch()">×</button>
        </div>
        <button class="search-btn" onclick="searchSkills()">Search for skills</button>
    `;
    
    // Create skills display area
    const skillsDisplay = document.createElement('div');
    skillsDisplay.className = 'skills-display';
    skillsDisplay.innerHTML = '<div class="no-selection">Select a member to view their technical skills</div>';
    
    rightPanel.appendChild(searchContainer);
    rightPanel.appendChild(skillsDisplay);
    
    contentLayout.appendChild(membersList);
    contentLayout.appendChild(rightPanel);
    
    container.innerHTML = '';
    container.appendChild(contentLayout);
    
    // Now populate the members list after DOM is ready
    displayFilteredMembers(members);
}

// Initialize and load data
const client = new MemberSkillsClient();

async function loadMembersSkills() {
    try {
        showLoading();
        const data = await client.getMembersSkills();
        displayMembersSkills(data);
    } catch (error) {
        showError(error);
    }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadMembersSkills);