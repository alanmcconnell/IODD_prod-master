// Project List Client
class ProjectListClient {
    constructor() {
        this.baseUrl = window.FVARS.SERVER_API_URL;                                       // .(51013.01.33)        
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

    async getProjects() {
        console.log('Fetching from /webpage_project_info_view');
        return await this.fetchData('/webpage_project_info_view');
    }
}

// UI Functions
function showLoading() {
    const container = document.getElementById('data-display');
    container.innerHTML = '<div class="loading">Loading project data...</div>';
}

function showError(error) {
    const container = document.getElementById('data-display');
    container.innerHTML = `<div class="error">Error loading data: ${error.message}</div>`;
}

function displayProjectsTable(data) {
    const container = document.getElementById('data-display');
    
    console.log('Data received:', data);
    console.log('Data type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    
    if (!data) {
        container.innerHTML = '<p>No data received from server</p>';
        return;
    }
    
    // Handle different response formats - be more flexible
    let projects = null;
    
    if (Array.isArray(data)) {
        projects = data;
    } else if (typeof data === 'object') {
        // Try different possible property names
        projects = data.projects || data.data || data.results || data.webpage_project_info_view;
        
        // If no projects found but data exists, check if it's wrapped differently
        if (!projects && typeof data === 'object' && !Array.isArray(data)) {
            console.log('Data object keys:', Object.keys(data));
            
            // If it's a single object, convert to array
            if (Object.keys(data).length > 0) {
                console.log('Converting single object to array');
                projects = [data];
            }
        }
    }
    
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
        container.innerHTML = '<p>No project data available</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'data-table';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '20px';

    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Show all columns except Client, CprojectID, and PROJECTID
    const firstProject = projects[0];
    const allKeys = Object.keys(firstProject).filter(key => 
        key !== 'Client' && key !== 'CprojectID' && key !== 'PROJECTID' && key !== 'ProjectID'
    );
    
    console.log('All available columns:', allKeys);
    
    allKeys.forEach((key, index) => {
        
        const th = document.createElement('th');
        
        // Custom column names
        let columnName;
        if (index === 4) {
            columnName = 'Project Description';
        } else {
            switch(key) {
                case 'ProjectName':
                    columnName = 'Project Name / Client';
                    break;
                case 'ProjectWeb':
                    columnName = 'Website';
                    break;
                case 'ProjectType':
                    columnName = 'Project Type';
                    break;
                case 'Industry':
                    columnName = 'Industry';
                    break;
                case 'Description':
                    columnName = 'ProjectDescription';
                    break;
                case 'PROJECTDESCRIPTION':
                    columnName = 'Project Description';
                    break;
                default:
                    columnName = key.replace(/_/g, ' ').toUpperCase();
            }
        }
        
        th.textContent = columnName;
        th.style.padding = '12px';
        th.style.textAlign = 'left';
        th.style.borderBottom = '1px solid #ddd';
        th.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        th.style.color = 'white';
        th.style.fontWeight = 'bold';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');
    projects.forEach(row => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #ddd';
        tr.addEventListener('mouseenter', () => tr.style.backgroundColor = '#f8f9fa');
        tr.addEventListener('mouseleave', () => tr.style.backgroundColor = '');
        
        // Process all columns
        allKeys.forEach((key, index) => {
            const value = row[key];
            const td = document.createElement('td');
            
            // Special handling for ProjectName column
            if (key === 'ProjectName') {
                const projectName = (value !== null && value !== undefined) ? String(value) : '';
                const client = (row['Client'] !== null && row['Client'] !== undefined) ? String(row['Client']) : '';
                
                // Create a container for the two lines
                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                
                // Add project name
                const nameSpan = document.createElement('span');
                nameSpan.textContent = projectName;
                nameSpan.style.fontWeight = 'bold';
                container.appendChild(nameSpan);
                
                // Add client name if it exists
                if (client) {
                    const clientSpan = document.createElement('span');
                    clientSpan.textContent = client;
                    clientSpan.style.fontSize = '0.85em';
                    clientSpan.style.color = '#666';
                    clientSpan.style.marginTop = '4px';
                    container.appendChild(clientSpan);
                }
                
                td.appendChild(container);
            }
            // Special handling for ProjectWeb column - show web icon
            else if (key === 'ProjectWeb') {
                if (value && value.trim()) {
                    const link = document.createElement('a');
                    link.href = value.startsWith('http') ? value : `https://${value}`;
                    link.target = '_blank';
                    link.innerHTML = '🌐';
                    link.style.fontSize = '18px';
                    link.style.textDecoration = 'none';
                    link.title = value;
                    td.appendChild(link);
                } else {
                    td.textContent = '';
                }
            }
            // Normal handling for other columns
            else {
                td.textContent = (value !== null && value !== undefined) ? String(value) : '';
            }
            
            td.style.padding = '12px';
            td.style.textAlign = 'left';
            td.style.borderBottom = '1px solid #ddd';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);
}

// Initialize and load data
const client = new ProjectListClient();

async function loadProjectsList() {
    try {
        showLoading();
        const data = await client.getProjects();
        displayProjectsTable(data);
    } catch (error) {
        showError(error);
    }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadProjectsList);