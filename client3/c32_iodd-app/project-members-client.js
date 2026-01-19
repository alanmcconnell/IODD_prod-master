// Simple Projects Display
async function loadProjects() {
    try {
        const response = await fetch(`${window.FVARS.SERVER_API_URL}/webpage_project_info_view`);
        const data = await response.json();
        

        
        // Create the layout
        const container = document.getElementById('data-display');
        container.innerHTML = `
            <div class="projects-container">
                <div class="grid-container">
                    <table class="projects-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Industry</th>
                                <th>Website</th>
                                <th style="display:none;">ProjectId</th>
                                <th style="display:none;">Description</th>
                            </tr>
                        </thead>
                        <tbody id="projects-tbody">
                        </tbody>
                    </table>
                </div>
                <div class="right-panel">
                    <div class="description-container">
                        <div class="description-title">Project Description</div>
                        <div class="description-content">Select a project to view description</div>
                    </div>
                    <div class="members-container">
                        <div class="members-title">Project Members</div>
                        <table class="members-table">
                            <thead>
                                <tr>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Role</th>
                                    <th>Duration</th>
                                </tr>
                            </thead>
                            <tbody id="members-tbody">
                                <tr><td colspan="4">Select a project to view members</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        // Fill the projects table
        const tbody = document.getElementById('projects-tbody');
        
        // Handle different response formats
        let projects = data;
        if (data && data.webpage_project_info_view) {
            projects = data.webpage_project_info_view;
        } else if (data && data.projects) {
            projects = data.projects;
        } else if (data && !Array.isArray(data) && typeof data === 'object') {
            // If data is an object, try to find the array property
            const keys = Object.keys(data);
            if (keys.length === 1 && Array.isArray(data[keys[0]])) {
                projects = data[keys[0]];
            }
        }
        
        if (Array.isArray(projects) && projects.length > 0) {
            projects.forEach(project => {
                const row = document.createElement('tr');
                
                // Name column
                const nameCell = document.createElement('td');
                nameCell.textContent = project.Name || project.PROJECTNAME || project.ProjectName || 'N/A';
                row.appendChild(nameCell);
                
                // Industry column
                const industryCell = document.createElement('td');
                industryCell.textContent = project.Industry || project.INDUSTRY || 'N/A';
                row.appendChild(industryCell);
                
                // Website column with web icon link
                const websiteCell = document.createElement('td');
                const webUrl = project.ProjectWeb || project.PROJECTWEB;
                if (webUrl && webUrl.trim()) {
                    const link = document.createElement('a');
                    link.href = webUrl.startsWith('http') ? webUrl : `https://${webUrl}`;
                    link.target = '_blank';
                    link.innerHTML = '🌐';
                    link.style.fontSize = '18px';
                    link.style.textDecoration = 'none';
                    link.title = webUrl;
                    websiteCell.appendChild(link);
                }
                row.appendChild(websiteCell);
                
                // ProjectId column (hidden)
                const idCell = document.createElement('td');
                idCell.style.display = 'none';
                const projectId = project.ProjectID || project.Id || project.ID || project.id;
                idCell.textContent = projectId || '';
                row.appendChild(idCell);
                
                // Hidden Description column
                const descCell = document.createElement('td');
                descCell.style.display = 'none';
                descCell.textContent = project.ProjectDescription || project.PROJECTDESCRIPTION || '';
                row.appendChild(descCell);
                
                // Add click handler to show description and members
                row.addEventListener('click', function() {
                    // Remove previous selection
                    document.querySelectorAll('.projects-table tr').forEach(r => r.classList.remove('selected'));
                    // Add selection to current row
                    row.classList.add('selected');
                    // Update description
                    const descContent = document.querySelector('.description-content');
                    descContent.textContent = descCell.textContent || 'No description available';
                    // Load project members
                    const projectId = project.ProjectID || project.Id || project.ID || project.id;
                    loadProjectMembers(projectId);
                });
                
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="3">No projects available in database</td></tr>';
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        document.getElementById('data-display').innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

// Load project members
async function loadProjectMembers(projectId) {
    try {
//      const response = await fetch(     `http://localhost:3004/api/webpage_project_members_view?ProjectID=${projectId}`);  /#.(51013.01.35)  
        const response = await fetch(`${window.FVARS.SERVER_API_URL}/webpage_project_members_view?ProjectID=${projectId}`);  // .(51013.01.35)        
        const data = await response.json();
        
        let members = data;
        if (data && typeof data === 'object') {
            if (Array.isArray(data)) {
                members = data;
            } else {
                const keys = Object.keys(data);
                const arrayKey = keys.find(key => Array.isArray(data[key]));
                if (arrayKey) {
                    members = data[arrayKey];
                }
            }
        }
        

        
        const tbody = document.getElementById('members-tbody');
        
        if (Array.isArray(members) && members.length > 0) {
            tbody.innerHTML = '';
            members.forEach(member => {
                const row = document.createElement('tr');
                
                const firstNameCell = document.createElement('td');
                firstNameCell.textContent = member.FirstName || member.FIRSTNAME || '';
                row.appendChild(firstNameCell);
                
                const lastNameCell = document.createElement('td');
                lastNameCell.textContent = member.LastName || member.LASTNAME || '';
                row.appendChild(lastNameCell);
                
                const roleCell = document.createElement('td');
                roleCell.textContent = member.Role || member.ROLE || '';
                row.appendChild(roleCell);
                
                const durationCell = document.createElement('td');
                durationCell.textContent = member.Duration || member.DURATION || '';
                row.appendChild(durationCell);
                
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4">No members assigned to this project</td></tr>';
        }
        
    } catch (error) {
        console.error('Error loading project members:', error);
        document.getElementById('members-tbody').innerHTML = '<tr><td colspan="4">Error loading members</td></tr>';
    }
}

// Load when page is ready
document.addEventListener('DOMContentLoaded', loadProjects);