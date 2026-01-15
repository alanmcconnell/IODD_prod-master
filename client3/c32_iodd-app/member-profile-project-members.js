// Project Members Management
const API_BASE_URL =  window.fvaRs.SERVER_API_URL;                                      // .(51013.01.23) 

let projects = [];
let members = [];
let allMembers = [];
let selectedProjectId = null;
let currentUser = null;

// DOM Elements
const projectGrid = document.getElementById('projectGrid');
const membersGrid = document.getElementById('membersGrid');
const messageDiv = document.getElementById('message');
const addBtn = document.getElementById('addBtn');
const deleteBtn = document.getElementById('deleteBtn');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    await checkAuthentication();
    loadProjects();
    loadAllMembers();
    setupEventListeners();
});

// Get JWT token value
function getJWTValue(key) {
    try {
        const payload = acmJWTGetPayload();
        if (payload && payload[key]) {
            return payload[key];
        }
    } catch (error) {
        console.log(`JWT payload read failed for ${key}:`, error.message);
    }
    
    if (key === 'user_role') return window.gRole;
    if (key === 'user_no') return window.gMemberId;
    return null;
}

// Check authentication and set user permissions
async function checkAuthentication() {
    const memberId = getJWTValue('user_no') || window.gMemberId;
    const memberRole = getJWTValue('user_role') || window.gRole || 'Member';
    
    // Update global variables for consistency
    if (memberId && memberRole) {
        window.gMemberId = memberId;
        window.gRole = memberRole;
    }
    
    currentUser = {
        MemberNo: memberId,
        Role: memberRole
    };
    
    console.log('Auth ready - Role:', memberRole, 'UserNo:', memberId);
    
    // Apply role-based permissions
    applyRolePermissions();
}

// Apply role-based permissions
function applyRolePermissions() {
    const userRole = currentUser?.Role;
    
    if (typeof RolePermissions !== 'undefined') {
        const buttonVisibility = RolePermissions.getButtonVisibility(userRole, currentUser?.MemberNo, null);
        addBtn.style.display = buttonVisibility.add ? 'inline-block' : 'none';
        deleteBtn.style.display = buttonVisibility.delete ? 'inline-block' : 'none';
        submitBtn.style.display = buttonVisibility.submit ? 'inline-block' : 'none';
        cancelBtn.style.display = buttonVisibility.cancel ? 'inline-block' : 'none';
    } else {
        // Fallback logic - Members get read-only access
        if (userRole === 'Member') {
            addBtn.style.display = 'none';
            deleteBtn.style.display = 'none';
            submitBtn.style.display = 'none';
        } else {
            addBtn.disabled = false;
            submitBtn.disabled = false;
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    addBtn.addEventListener('click', handleAdd);
    deleteBtn.addEventListener('click', handleDelete);
    submitBtn.addEventListener('click', handleSubmit);
    cancelBtn.addEventListener('click', handleCancel);
    
    // Enable submit button by default
    submitBtn.disabled = false;
}

// Load projects from database
async function loadProjects() {
    try {
        showMessage('Loading projects...', 'loading');
        
        const response = await fetch(`${API_BASE_URL}/webpage_project_info_view`, {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        projects = data.webpage_project_info_view || [];
        
        displayProjects();
        hideMessage();
        
    } catch (error) {
        console.error('Error loading projects:', error);
        showMessage('Error loading projects: ' + error.message, 'error');
    }
}

// Load all members for dropdown
async function loadAllMembers() {
    try {
        const response = await fetch(`${API_BASE_URL}/members`, {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        allMembers = data.members || [];
        
    } catch (error) {
        console.error('Error loading all members:', error);
        allMembers = [];
    }
}

// Display projects in grid
function displayProjects() {
    projectGrid.innerHTML = '';
    
    if (projects.length === 0) {
        projectGrid.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No projects found</div>';
        return;
    }
    
    projects.forEach(project => {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.innerHTML = `
            <span class="project-name">${project.ProjectName || 'Unnamed Project'}</span>
            <span class="project-id" style="display: none;">${project.ProjectID}</span>
        `;
        
        projectItem.addEventListener('click', () => selectProject(project.ProjectID, projectItem));
        projectGrid.appendChild(projectItem);
    });
}

// Select project and load members
async function selectProject(projectId, element) {
    // Remove previous selection
    document.querySelectorAll('.project-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selection to clicked item
    element.classList.add('selected');
    selectedProjectId = projectId;
    
    // Load members for selected project
    await loadProjectMembers(projectId);
}

// Load project members
async function loadProjectMembers(projectId) {
    try {
        showMessage('Loading project members...', 'loading');
        
        // Ensure allMembers is loaded first
        if (!allMembers || allMembers.length === 0) {
            await loadAllMembers();
        }
        
        const response = await fetch(`${API_BASE_URL}/webpage_project_members_view`, {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const projectMembers = data.webpage_project_members_view || [];
        
        // Filter members by ProjectID
        members = projectMembers.filter(member => member.ProjectID == projectId);
        displayMembers();
        // Enable submit button when members are loaded
        submitBtn.disabled = false;
        hideMessage();
        
    } catch (error) {
        console.error('Error loading project members:', error);
        showMessage('Error loading project members: ' + error.message, 'error');
        members = [];
        displayMembers();
        submitBtn.disabled = false;
    }
}

let selectedMemberIndex = null;

// Display members in grid
function displayMembers() {
    membersGrid.innerHTML = '';
    selectedMemberIndex = null;
    deleteBtn.disabled = true;
    
    if (members.length === 0) {
        membersGrid.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No members found for this project</div>';
        return;
    }
    
    members.forEach((member, index) => {
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';
        memberItem.style.padding = '10px';
        memberItem.style.borderBottom = '1px solid #eee';
        memberItem.dataset.index = index;
        
        // Create member dropdown options
        let memberOptions = '<option value="">Select Member</option>';
        if (allMembers && allMembers.length > 0) {
            // Sort alphabetically by first name then last name
            const sortedMembers = [...allMembers].sort((a, b) => {
                const aFirst = (a.FirstName || a.firstname || '').toLowerCase();
                const aLast = (a.LastName || a.lastname || '').toLowerCase();
                const bFirst = (b.FirstName || b.firstname || '').toLowerCase();
                const bLast = (b.LastName || b.lastname || '').toLowerCase();
                return aFirst.localeCompare(bFirst) || aLast.localeCompare(bLast);
            });
            sortedMembers.forEach(m => {
                const selected = m.MemberNo == member.MemberNo ? 'selected' : '';
                const firstName = m.FirstName || m.firstname || '';
                const lastName = m.LastName || m.lastname || '';
                const memberNo = m.MemberNo || m.memberno || m.id || '';
                memberOptions += `<option value="${memberNo}" ${selected}>${firstName} ${lastName}</option>`;
            });
        }
        
        memberItem.innerHTML = `
            <div style="margin-bottom: 5px;">
                <label style="font-size: 11px; color: #666;">Member:</label>
                <select style="width: 100%; padding: 2px 4px; font-size: 12px; border: 1px solid #ddd; border-radius: 2px;"
                        data-field="member" data-index="${index}">
                    ${memberOptions}
                </select>
            </div>
            <div style="margin-bottom: 3px;">
                <label style="font-size: 11px; color: #666;">Role:</label>
                <input type="text" value="${member.Role || ''}" 
                       style="width: 100%; padding: 2px 4px; font-size: 12px; border: 1px solid #ddd; border-radius: 2px;"
                       data-field="role" data-index="${index}">
            </div>
            <div style="display: flex; gap: 5px;">
                <div style="flex: 1;">
                    <label style="font-size: 11px; color: #666;">Duration:</label>
                    <input type="text" value="${member.Duration || ''}" 
                           style="width: 100%; padding: 2px 4px; font-size: 12px; border: 1px solid #ddd; border-radius: 2px;"
                           data-field="duration" data-index="${index}">
                </div>
                <div style="flex: 1;">
                    <label style="font-size: 11px; color: #666;">Dates:</label>
                    <input type="text" value="${member.Dates || ''}" 
                           style="width: 100%; padding: 2px 4px; font-size: 12px; border: 1px solid #ddd; border-radius: 2px;"
                           data-field="dates" data-index="${index}">
                </div>
            </div>
            <div style="display: none;" class="member-id">${member.Id || member.ID || 0}</div>
            <div style="display: none;">${member.ProjectID}</div>
            <div style="display: none;">${member.MemberNo}</div>
        `;
        
        // Add click event for row selection
        memberItem.addEventListener('click', () => {
            // Remove previous selection
            document.querySelectorAll('.member-item').forEach(item => {
                item.style.backgroundColor = '';
            });
            // Add selection to clicked item
            memberItem.style.backgroundColor = '#e3f2fd';
            selectedMemberIndex = index;
            deleteBtn.disabled = false;
        });
        
        // Add event listeners for the input fields
        const memberSelect = memberItem.querySelector('[data-field="member"]');
        const roleInput = memberItem.querySelector('[data-field="role"]');
        const durationInput = memberItem.querySelector('[data-field="duration"]');
        const datesInput = memberItem.querySelector('[data-field="dates"]');
        
        memberSelect.addEventListener('change', (e) => {
            members[index].MemberNo = e.target.value;
        });
        
        roleInput.addEventListener('input', (e) => {
            members[index].Role = e.target.value;
        });
        
        durationInput.addEventListener('input', (e) => {
            members[index].Duration = e.target.value;
        });
        
        datesInput.addEventListener('input', (e) => {
            members[index].Dates = e.target.value;
        });
        
        // Ensure Id field is tracked properly - handle both ID and Id
        members[index].Id = member.Id || member.ID || 0;
        
        membersGrid.appendChild(memberItem);
    });
}

// Button handlers (placeholder functions)
function handleAdd() {
    const userRole = getJWTValue('user_role') || currentUser?.Role;
    if (userRole === 'Member') {
        showMessage('You do not have permission to add project members', 'error');
        return;
    }
    
    if (!selectedProjectId) {
        showMessage('No project selected', 'error');
        return;
    }
    
    // Add a new member record with Id = 0
    const newMember = {
        Id: 0,
        ProjectID: selectedProjectId,
        MemberNo: '',
        FirstName: '',
        LastName: '',
        Role: '',
        Duration: '',
        Dates: ''
    };
    
    members.push(newMember);
    displayMembers();
    showMessage('New member row added', 'success');
    setTimeout(() => hideMessage(), 2000);
}

async function handleDelete() {
    const userRole = getJWTValue('user_role') || currentUser?.Role;
    if (userRole === 'Member') {
        showMessage('You do not have permission to delete project members', 'error');
        return;
    }
    
    if (selectedMemberIndex === null) {
        showMessage('No member selected for deletion', 'error');
        return;
    }
    
    const memberToDelete = members[selectedMemberIndex];
    
    // Use the shared popup function for confirmation
    const result = await acm_SecurePopUp("Do you want to remove this member from the project?", "Yes:Yes", "No:No");
    
    if (result === 'Yes') {
        try {
            showMessage('Deleting member...', 'loading');
            
            // If it's a new record (Id = 0), just remove from array
            if (parseInt(memberToDelete.Id) === 0) {
                members.splice(selectedMemberIndex, 1);
                displayMembers();
                showMessage('Member removed from list', 'success');
            } else {
                // Delete from server
                const response = await fetch(`${API_BASE_URL}/project_collaborators?action=delete&mpid=${memberToDelete.Id}`, {
                    method: 'GET',
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    const result = await response.text();
                    throw new Error(`Delete failed: ${response.status} - ${result}`);
                }
                
                // Remove from local array and refresh display
                members.splice(selectedMemberIndex, 1);
                displayMembers();
                showMessage('Member removed from project', 'success');
            }
            
            setTimeout(() => hideMessage(), 2000);
            
        } catch (error) {
            console.error('Error deleting member:', error);
            showMessage('Error deleting member: ' + error.message, 'error');
        }
    }
}

async function handleSubmit() {
    const userRole = getJWTValue('user_role') || currentUser?.Role;
    if (userRole === 'Member') {
        showMessage('You do not have permission to save project member changes', 'error');
        return;
    }
    
    if (!selectedProjectId) {
        showMessage('No project selected', 'error');
        return;
    }
    
    if (members.length === 0) {
        showMessage('No members to save', 'error');
        return;
    }
    
    console.log('Starting submit with members:', members);
    
    try {
        showMessage('Saving changes...', 'loading');
        
        for (const member of members) {
            // Convert Id to number for proper comparison
            const memberId = parseInt(member.Id) || 0;
            
            console.log(`Processing member with Id: ${memberId}`, member);
            
            if (memberId === 0) {
                console.log('Calling insertMemberProject');
                await insertMemberProject(member);
            } else {
                console.log('Calling updateMemberProject');
                await updateMemberProject(member);
            }
        }
        
        showMessage('Changes saved successfully!', 'success');
        await loadProjectMembers(selectedProjectId);
        setTimeout(() => hideMessage(), 3000);
        
    } catch (error) {
        console.error('Error saving changes:', error);
        showMessage('Error saving changes: ' + error.message, 'error');
    }
}

// Insert new member project record
async function insertMemberProject(member) {
    console.log('Attempting to insert member:', member);
    
    // Skip insert if no member is selected
    if (!member.MemberNo || member.MemberNo === '') {
        console.log('Skipping insert - no member selected, MemberNo:', member.MemberNo);
        return 'Skipped - no member selected';
    }
    
    console.log(`Inserting member ${member.MemberNo} into project ${selectedProjectId}`);
    
    // First, insert the basic record
    const insertResponse = await fetch(`${API_BASE_URL}/project_collaborators?action=insert&pid=${selectedProjectId}&mid=${member.MemberNo}`, {
        method: 'GET',
        credentials: 'include'
    });
    
    if (!insertResponse.ok) {
        const result = await insertResponse.text();
        throw new Error(`Insert failed: ${insertResponse.status} - ${result}`);
    }
    
    const insertResult = await insertResponse.text();
    console.log('Insert result:', insertResult);
    
    // If Role, Duration, or Dates are provided, update them
    if (member.Role || member.Duration || member.Dates) {
        console.log('Updating Role, Duration, and Dates for new record');
        
        // We need to get the new record ID to update it
        // Reload the project members to get the new record with its ID
        await loadProjectMembers(selectedProjectId);
        
        // Find the newly inserted record (it should be the one with matching MemberNo)
        const newRecord = members.find(m => m.MemberNo == member.MemberNo && m.ProjectID == selectedProjectId);
        if (newRecord && newRecord.Id) {
            // Update the new record with Role, Duration, and Dates
            const updateMember = {
                Id: newRecord.Id,
                MemberNo: member.MemberNo,
                Role: member.Role || '',
                Duration: member.Duration || '',
                Dates: member.Dates || ''
            };
            await updateMemberProject(updateMember);
        }
    }
    
    return insertResult;
}

// Update existing member project record using POST
async function updateMemberProject(member) {
    const formData = new URLSearchParams();
    formData.append('mpid', member.Id);
    formData.append('mid', member.MemberNo || '');
    formData.append('role', member.Role || '');
    formData.append('duration', member.Duration || '');
    formData.append('dates', member.Dates || '');
    
    const response = await fetch(`${API_BASE_URL}/project_collaborators`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'include',
        body: formData
    });
    
    if (!response.ok) {
        const result = await response.text();
        throw new Error(`Update failed: ${response.status} - ${result}`);
    }
    
    return await response.text();
}

function handleCancel() {
    if (selectedProjectId) {
        // Reload the project members to reset any unsaved changes
        loadProjectMembers(selectedProjectId);
        showMessage('Changes cancelled - data refreshed', 'success');
        setTimeout(() => hideMessage(), 2000);
    } else {
        showMessage('No project selected', 'info');
        setTimeout(() => hideMessage(), 2000);
    }
}

// Utility functions
function showMessage(text, type) {
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    }
}

function hideMessage() {
    if (messageDiv) {
        messageDiv.style.display = 'none';
    }
}