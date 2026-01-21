// About Page Client
class AboutClient {

    constructor() {
//      this.baseUrl        = 'http://localhost:3004/api';                              //#.(51013.01.11)
        this.baseUrl        = window.FVARS.SERVER_API_URL;                              // .(51013.01.11)

        this.aboutInfo = {
            mission: "The Institute of Database Developers (IODD) is dedicated to advancing the field of database development through professional collaboration, knowledge sharing, and innovative solutions. We bring together experts in database design, implementation, and optimization to tackle complex data challenges across industries.",
            vision: "Our vision is to be the leading community of database professionals, setting standards for excellence in database development and empowering organizations to harness the full potential of their data assets.",
            history: "Founded in 2005 by a group of database architects and engineers, IODD has grown from a small community of practice into a global network of database professionals. Over the years, we've contributed to numerous open-source database projects and helped organizations implement robust data solutions across various industries.",
            expertise: [
                "Database Design & Architecture",
                "Performance Optimization",
                "Data Migration & Integration",
                "Database Security",
                "Big Data Solutions",
                "Cloud Database Management",
                "NoSQL & NewSQL Technologies"
            ]
        };
    }

    async fetchStats() {
        try {
            // Get project count from dedicated function
            const projectCount  = await this.getProjectCount();
            
            // Get member count from dedicated function
            const memberCount   = await this.getMemberCount();
            
            // Get industry count from dedicated function
            const industryCount = await this.getIndustryCount();
            
            // Calculate years active
            const yearsActive   = new Date().getFullYear() - 2005;
            
            return {
                projects: projectCount,
                members: memberCount,
                years: yearsActive,
                industries: industryCount
            };
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Return default stats if API fails
            return {
                projects: 0,
                members: 0,
                years: new Date().getFullYear() - 2005,
                industries: 0
            };
        }
    }
    
    async fetchLeadership() {
        try {
            const response = await fetch(`${this.baseUrl}/members`);
            const members = await response.json();
            
            // Filter for leadership team (this is a simplified example)
            // In a real scenario, you might have a specific endpoint for leadership
            const leadership = Array.isArray(members) ? 
                members.slice(0, 4).map(member => ({
                    name: member.FirstName + ' ' + member.LastName,
                    role: this.getRandomRole(),
                    bio: member.Bio || "Database professional with expertise in modern data solutions."
                })) : [];
                
            return leadership;
        } catch (error) {
            console.error('Error fetching leadership:', error);
            // Return default leadership if API fails
            return [
                { name: "Jane Smith",    role: "Founder & President", bio: "Database architect with over 20 years of experience in enterprise solutions." },
                { name: "Michael Chen",  role: "Technical Director", bio: "Specializes in high-performance database systems and cloud architecture." },
                { name: "Sarah Johnson", role: "Research Lead", bio: "PhD in Computer Science with focus on distributed database systems." },
                { name: "Robert Taylor", role: "Education Director", bio: "Former professor of Database Management with extensive industry experience." }
            ];
        }
    }
    
    getRandomRole() {
        const roles = [
            "Database Architect", 
            "Senior Database Engineer", 
            "Data Integration Specialist",
            "Database Security Expert",
            "Cloud Database Consultant",
            "NoSQL Specialist",
            "Performance Optimization Lead"
        ];
        return roles[Math.floor(Math.random() * roles.length)];
    }
    
    async getMemberCount() {
        try {
            
            // Get members data and count active members
            const membersResponse = await fetch(`${this.baseUrl}/members`);
            if (membersResponse.ok) {
                const data = await membersResponse.json();
                const members = data.members || data;
                
                if (Array.isArray(members)) {
                    // Count active members
                    const activeMembers = members.filter(member => member && member.Active === 'Y');
                    return activeMembers.length;
                }
            }
            
            // If all attempts fail, return 0
            return 0;
        } catch (error) {
            console.error('Error in getMemberCount:', error);
            return -1; // Return -1 if there's an error
        }
    }
    
    async getProjectCount() {
        try {
            // Get all projects data and count only completed ones
            const projectsResponse = await fetch(`${this.baseUrl}/projects`);
            
            if (projectsResponse.ok) {
                const data = await projectsResponse.json();
                const projects = data.projects || data;
                
                if (Array.isArray(projects)) {
                    // Filter for completed projects
                    const completedProjects = projects.filter(p => p.Status === 'Completed');
                    return completedProjects.length;
                }
            }
            
            // If all attempts fail, return 0
            return 0;
        } catch (error) {
            console.error('Error in getProjectCount:', error);
            return -1; // Return -1 if there's an error
        }
    }
    
    async getIndustryCount() {
        try {
            // Use the correct SQL query as specified
            const response = await fetch(`${this.baseUrl}/industries`, {
                method: 'GET'
            });
            
            if (response.ok) {
                const data = await response.json();
                // The server returns: {"industries":[{"IndustryType":36}]}
                if (data && data.industries && data.industries.length > 0 && data.industries[0].IndustryType !== undefined) {
                    return data.industries[0].IndustryType;
                }
            }
            
            return 0;
        } catch (error) {
            console.error('Error in getIndustryCount:', error);
            return 0;
        }
    }
}

// UI Functions
function showLoading() {
    const container = document.getElementById('about-content');
    container.innerHTML = '<div class="loading">Loading about information...</div>';
}

function showError(error) {
    const container = document.getElementById('about-content');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = `Error loading data: ${error.message}`;
    container.innerHTML = '';
    container.appendChild(errorDiv);
}

async function displayAboutContent() {
    const container = document.getElementById('about-content');
    const client = new AboutClient();
    
    try {
        showLoading();
        
        // Fetch stats and leadership in parallel
        const [stats, leadership] = await Promise.all([
            client.fetchStats(),
            client.fetchLeadership()
        ]);
        
        // Sanitize stats to prevent XSS
        const sanitizedStats = {
            years: parseInt(stats.years) || 0,
            members: parseInt(stats.members) || 0,
            projects: parseInt(stats.projects) || 0,
            industries: parseInt(stats.industries) || 0
        };
        
        // Build the about content with sanitized data
        let content = `

            <div class="stats-container">
                <div class="stat-card">
                    <div class="stat-number">${sanitizedStats.years}</div>
                    <div class="stat-label">Years of Excellence</div>
                </div>
                <div class="stat-card" id="member-stat-card">
                    <div class="stat-number">${sanitizedStats.members}</div>
                    <div class="stat-label">Professional Members</div>
                </div>
                <div class="stat-card" id="project-stat-card">
                    <div class="stat-number">${sanitizedStats.projects}</div>
                    <div class="stat-label">Projects Completed</div>
                </div>
                <div class="stat-card" id="industry-stat-card">
                    <div class="stat-number">${sanitizedStats.industries}</div>
                    <div class="stat-label">Industries Served</div>
                </div>
            </div> 

            <div class="about-section">
                <h2>Our Mission</h2>
                <p>${escapeHtml(client.aboutInfo.mission)}</p>
            </div>
            
            <div class="about-section">
                <h2>Our Vision</h2>
                <p>${escapeHtml(client.aboutInfo.vision)}</p>
            </div>
            
            <div class="about-section">
                <h2>Our History</h2>
                <p>${escapeHtml(client.aboutInfo.history)}</p>
            </div>
            
            <div class="about-section">
                <h2>Our Expertise</h2>
                <p>At IODD, we specialize in:</p>
                <ul style="margin-left: 20px; margin-bottom: 15px;">
                    ${client.aboutInfo.expertise.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                </ul>
            </div>
            
<!--        <div class="stats-container">
                <div class="stat-card">
                    <div class="stat-number">${sanitizedStats.years}</div>
                    <div class="stat-label">Years of Excellence</div>
                </div>
                <div class="stat-card" id="member-stat-card">
                    <div class="stat-number">${sanitizedStats.members}</div>
                    <div class="stat-label">Professional Members</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${sanitizedStats.projects}</div>
                    <div class="stat-label">Projects Completed</div>
                </div>
                <div class="stat-card" id="industry-stat-card">
                    <div class="stat-number">${sanitizedStats.industries}</div>
                    <div class="stat-label">Industries Served</div>
                </div>
            </div> -->

        `;
        
        container.innerHTML = content;
        
        // Add animation to stats
        animateStats();
        
    } catch (error) {
        showError(error);
    }
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(statEl => {
        const finalValue = parseInt(statEl.textContent);
        let startValue = 0;
        const duration = 2000; // 2 seconds
        const increment = Math.ceil(finalValue / (duration / 20));
        
        statEl.textContent = '0';
        
        const timer = setInterval(() => {
            startValue += increment;
            if (startValue > finalValue) {
                statEl.textContent = finalValue;
                clearInterval(timer);
            } else {
                statEl.textContent = startValue;
            }
        }, 20);
    });
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await displayAboutContent();
    
    // Update counts separately with the latest data
    try {
        const client = new AboutClient();
        
        // Get all three counts in parallel
        const [industryCount, memberCount, projectCount] = await Promise.all([
            client.getIndustryCount(),
            client.getMemberCount(),
            client.getProjectCount()
        ]);
        
        // Update the industry count in the UI
        updateStatNumber('industry-stat-card', industryCount);
        
        // Update the member count in the UI
        updateStatNumber('member-stat-card', memberCount);
        
        // Update the project count in the UI
        updateStatNumber('project-stat-card', projectCount);
        
        // No need to display API responses or member list
        
    } catch (error) {
        console.error('Error updating counts:', error);
    }
    
    // Helper function to update and animate stat numbers
    function updateStatNumber(cardId, newValue) {
        const statNumber = document.querySelector(`#${cardId} .stat-number`);
        if (!statNumber) return;
        
        // Save current value for animation
        const currentValue = parseInt(statNumber.textContent) || 0;
        
        // Only update if the new value is different
        if (newValue !== currentValue) {
            console.log(`Updating ${cardId} to:`, newValue);
            
            // Animate to the new value
            let startValue = currentValue;
            const duration = 1000; // 1 second
            const increment = Math.ceil(Math.abs(newValue - currentValue) / (duration / 20));
            
            const timer = setInterval(() => {
                if (newValue > currentValue) {
                    startValue += increment;
                    if (startValue >= newValue) {
                        statNumber.textContent = newValue;
                        clearInterval(timer);
                    } else {
                        statNumber.textContent = startValue;
                    }
                } else {
                    startValue -= increment;
                    if (startValue <= newValue) {
                        statNumber.textContent = newValue;
                        clearInterval(timer);
                    } else {
                        statNumber.textContent = startValue;
                    }
                }
            }, 20);
        }
    }
    
    // Function to display the member count response
    async function displayIndustryCountResponse() {
        const responseElement = document.getElementById('industry-count-response');
        if (!responseElement) return;
        
        // Display the SQL query
        responseElement.textContent = `SQL Query for Member Count:\n\nSELECT COUNT(DISTINCT ID) AS TheCnt FROM members WHERE Active = 'Y'\n\nLoading API response...`;
        
        try {
            // Try to execute the SQL query directly
            const client = new AboutClient();
            const sqlResponse = await fetch(`${client.baseUrl}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: "SELECT COUNT(DISTINCT ID) AS TheCnt FROM members WHERE Active = 'Y'"
                })
            });
            
            const sqlText = await sqlResponse.text();
            responseElement.textContent += `\n\nSQL Query Response:\n${sqlText}\n\n`;
            
            // Also get members data
            const projectsResponse = await fetch(`${client.baseUrl}/members`);
            
            if (projectsResponse.ok) {
                const text = await projectsResponse.text();
                responseElement.textContent += `Raw API Response from /api2/members:\n\n${text.substring(0, 500)}${text.length > 500 ? '... (truncated)' : ''}`;
                
                try {
                    const data = JSON.parse(text);
                    
                    // Also show server status
                    const serverStatusElement = document.createElement('div');
                    serverStatusElement.style.marginTop = '10px';
                    serverStatusElement.style.padding = '10px';
                    serverStatusElement.style.background = '#f0f0f0';
                    serverStatusElement.style.borderRadius = '5px';
                    
                    serverStatusElement.innerHTML = `
                        <strong>Server Status:</strong><br>
                        - SQL Query: SELECT COUNT(DISTINCT ID) AS TheCnt FROM members WHERE Active = 'Y'<br>
                        - SQL Response Status: ${sqlResponse.status} ${sqlResponse.statusText}<br>
                        - Members Response Status: ${projectsResponse.status} ${projectsResponse.statusText}<br>
                        - Content Type: ${projectsResponse.headers.get('content-type') || 'Not specified'}<br>
                        - Response Length: ${text.length} characters<br>
                        - Is Array: ${Array.isArray(data)}<br>
                        - Data Type: ${typeof data}<br>
                        ${Array.isArray(data) ? `- Array Length: ${data.length}` : ''}
                    `;
                    
                    responseElement.parentNode.appendChild(serverStatusElement);

                } catch (parseError) {
                    console.error('Error parsing projects data:', parseError);
                }
            } else {
                responseElement.textContent += `\n\nError getting members: ${projectsResponse.status} ${projectsResponse.statusText}`;
            }
        } catch (error) {
            responseElement.textContent += `\n\nError: ${error.message}`;
        }
    }
    
    // Function to display the list of members
    async function displayIndustriesList() {
        const membersContainer = document.getElementById('industries-container');
        if (!membersContainer) return;
        
        try {
            // Get members data
            const client = new AboutClient();
            const response = await fetch(`${client.baseUrl}/members`);
            
            if (response.ok) {
                const data = await response.json();
                const members = data.members || data;
                
                if (Array.isArray(members)) {
                    // Filter active members
                    const activeMembers = members.filter(member => member && member.Active === 'Y');
                    
                    // Sort by last name
                    const sortedMembers = activeMembers.sort((a, b) => {
                        const lastNameA = a.LastName || '';
                        const lastNameB = b.LastName || '';
                        return lastNameA.localeCompare(lastNameB);
                    });
                    
                    if (sortedMembers.length > 0) {
                        membersContainer.innerHTML = sortedMembers.map(member => {
                            const fullName = `${member.FirstName || ''} ${member.LastName || ''}`.trim();
                            return `<div style="margin-bottom: 8px;">• ${fullName}</div>`;
                        }).join('');
                    } else {
                        membersContainer.textContent = 'No active members found.';
                    }
                } else {
                    membersContainer.textContent = 'No members data available.';
                }
            } else {
                membersContainer.textContent = `Error getting members: ${response.status} ${response.statusText}`;
            }
        } catch (error) {
            console.error('Error displaying members list:', error);
            membersContainer.textContent = `Error: ${error.message}`;
        }
    }
});