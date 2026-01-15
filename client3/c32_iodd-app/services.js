document.addEventListener('DOMContentLoaded', function() {
    // DBA Services data
    const dbaServices = [
        {
            title: "Database Design and Architecture",
            items: [
                "Schema design and optimization",
                "Data modeling and normalization",
                "Database architecture planning",
                "High availability and disaster recovery planning"
            ]
        },
        {
            title: "Database Implementation and Maintenance",
            items: [
                "Database installation and configuration",
                "Performance tuning and optimization",
                "Backup and recovery management",
                "Patch management and version upgrades"
            ]
        },
        {
            title: "Data Security and Compliance",
            items: [
                "Access control and user permission management",
                "Data encryption implementation",
                "Security auditing and compliance monitoring",
                "Vulnerability assessment and remediation"
            ]
        },
        {
            title: "Data Migration and Integration",
            items: [
                "Database migration between platforms",
                "ETL (Extract, Transform, Load) process management",
                "Data integration across multiple systems",
                "Legacy system data conversion"
            ]
        },
        {
            title: "Monitoring and Troubleshooting",
            items: [
                "Performance monitoring and alerting",
                "Query optimization and tuning",
                "Bottleneck identification and resolution",
                "Database health checks and diagnostics"
            ]
        },
        {
            title: "Capacity Planning",
            items: [
                "Storage management and optimization",
                "Scalability planning",
                "Resource allocation and management",
                "Growth forecasting and infrastructure planning"
            ]
        }
    ];

    // Software Developer Services data
    const devServices = [
        {
            title: "Application Development",
            items: [
                "Custom software development",
                "Web application development",
                "Mobile application development",
                "Desktop application development"
            ]
        },
        {
            title: "Software Architecture",
            items: [
                "System design and architecture",
                "Microservices architecture design",
                "API design and development",
                "Scalable architecture planning"
            ]
        },
        {
            title: "Frontend Development",
            items: [
                "User interface (UI) development",
                "User experience (UX) design implementation",
                "Responsive web design",
                "Cross-browser compatibility"
            ]
        },
        {
            title: "Backend Development",
            items: [
                "Server-side logic implementation",
                "Database connectivity and ORM integration",
                "API development and integration",
                "Authentication and authorization systems"
            ]
        },
        {
            title: "Testing and Quality Assurance",
            items: [
                "Unit testing",
                "Integration testing",
                "Performance testing",
                "Automated testing implementation"
            ]
        },
        {
            title: "DevOps and Deployment",
            items: [
                "CI/CD pipeline setup and maintenance",
                "Containerization (Docker, Kubernetes)",
                "Cloud deployment (AWS, Azure, GCP)",
                "Infrastructure as Code implementation"
            ]
        },
        {
            title: "Maintenance and Support",
            items: [
                "Bug fixing and troubleshooting",
                "Code refactoring and optimization",
                "Feature enhancements",
                "Technical documentation"
            ]
        },
        {
            title: "Security Implementation",
            items: [
                "Secure coding practices",
                "Vulnerability assessment",
                "Security patch implementation",
                "Penetration testing support"
            ]
        },
        {
            title: "Version Control and Collaboration",
            items: [
                "Git repository management",
                "Code review processes",
                "Collaborative development workflows",
                "Branching and merging strategies"
            ]
        }
    ];

    // Function to create service HTML
    function createServiceHTML(services) {
        let html = '';
        
        services.forEach(service => {
            html += `
                <div class="service-category">
                    <h3>${service.title}</h3>
                    <ul class="service-list">
                        ${service.items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `;
        });
        
        return html;
    }

    // Get the container
    const servicesContainer = document.getElementById('services-container');
    
    // Clear loading message
    servicesContainer.innerHTML = '';
    
    // Create DBA column
    const dbaColumn = document.createElement('div');
    dbaColumn.className = 'service-column';
    dbaColumn.innerHTML = `
        <h2 class="service-title">Database Administrator Services</h2>
        ${createServiceHTML(dbaServices)}
    `;
    
    // Create Developer column
    const devColumn = document.createElement('div');
    devColumn.className = 'service-column';
    devColumn.innerHTML = `
        <h2 class="service-title">Software Developer Services</h2>
        ${createServiceHTML(devServices)}
    `;
    
    // Add columns to container
    servicesContainer.appendChild(dbaColumn);
    servicesContainer.appendChild(devColumn);
});