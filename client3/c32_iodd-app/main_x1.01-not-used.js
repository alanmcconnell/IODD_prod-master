// Database API Client
class IODDClient {
    constructor() {
//      this.SERVER_API_URL =  window.fvaRs.SERVER_API_URL;                             //#.(51013.01.3)
//      this.baseUrl        = 'http://localhost:54032/api2';                            //#.(51013.01.3)
        this.baseUrl        =  window.fvaRs.SERVER_API_URL;                             // .(51013.01.3)
    }

    async fetchData(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    async getMembers() {
        return await this.fetchData('/members');
    }

    async getMemberBios() {
        return await this.fetchData('/member-bios');
    }

    async getProjects() {
        return await this.fetchData('/projects');
    }

    async getProjectDetails() {
        return await this.fetchData('/project-details');
    }
}

// UI Helper Functions
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    container.style.display = 'block';
    container.innerHTML = '<div class="loading">Loading...</div>';
}

function showError(containerId, error) {
    const container = document.getElementById(containerId);
    container.style.display = 'block';
    container.innerHTML = `<div class="error">Error: ${error.message}</div>`;
}

function displayTable(data, containerId) {
    const container = document.getElementById(containerId);
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p>No data available</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'data-table';

    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');
    data.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value || '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);
}

// Initialize client
const client = new IODDClient();

// Member Functions
async function loadMemberListing() {
    const containerId = 'members-display';
    try {
        showLoading(containerId);
        const data = await client.getMembers();
        displayTable(data, containerId);
    } catch (error) {
        showError(containerId, error);
    }
}

async function loadMemberBios() {
    const containerId = 'members-display';
    try {
        showLoading(containerId);
        const data = await client.getMemberBios();
        displayTable(data, containerId);
    } catch (error) {
        showError(containerId, error);
    }
}

// Project Functions
async function loadProjectListing() {
    const containerId = 'projects-display';
    try {
        showLoading(containerId);
        const data = await client.getProjects();
        displayTable(data, containerId);
    } catch (error) {
        showError(containerId, error);
    }
}

async function loadProjectDetails() {
    const containerId = 'projects-display';
    try {
        showLoading(containerId);
        const data = await client.getProjectDetails();
        displayTable(data, containerId);
    } catch (error) {
        showError(containerId, error);
    }
}