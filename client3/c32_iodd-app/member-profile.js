
     var SERVER_API_URL = window.FVARS.SERVER_API_URL;                               // .(51013.01.5)

class MemberProfileClient {
    constructor() {
        this.currentSection = null;
        this.expandedMenus = new Set(['member-profile']); // Member Profile starts expanded
        this.memberNo = null;

        this.init();
    }

    init() {
        this.loadUserFromToken();
        this.setupEventListeners();
        console.log('Member Profile Client initialized');
    }

    async loadUserFromToken() {
        try {
            // Get user info from app_token
            const userName = await acmJWTFetch('user_name') || 'IODD Member';
            const userEmail = await acmJWTFetch('user_email') || 'member@iodd.com';
            
            document.getElementById('userName').textContent = userName;
            document.getElementById('userEmail').textContent = userEmail;
        } catch (error) {
            // Fallback to defaults if JWT fetch fails
            document.getElementById('userName').textContent = 'IODD Member';
            document.getElementById('userEmail').textContent = 'member@iodd.com';
        }
    }





    setupEventListeners() {
        // Main menu items (expandable sections)
        const mainMenuItems = document.querySelectorAll('.main-menu-item');
        console.log('Found main menu items:', mainMenuItems.length);
        
        mainMenuItems.forEach((item, index) => {
            console.log(`Main menu item ${index}:`, item.getAttribute('data-main'));
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const mainSection = e.target.getAttribute('data-main');
                console.log('Main menu clicked:', mainSection);
                
                if (e.target.classList.contains('expandable')) {
                    this.toggleMainMenu(mainSection, e.target);
                } else {
                    this.handleMainMenuClick(mainSection, e.target);
                }
            });
        });

        // Sub menu items (actual content links)
        const subMenuItems = document.querySelectorAll('.sub-menu-item');
        console.log('Found sub menu items:', subMenuItems.length);
        
        subMenuItems.forEach((item, index) => {
            const section = item.getAttribute('data-section');
            const url = item.getAttribute('data-url');
            console.log(`Sub menu item ${index}: section="${section}", url="${url}"`);
            
            item.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('*** SUB MENU CLICKED ***');
                console.log('Section:', section);
                console.log('URL:', url);
                console.log('Element:', e.target);
                
                this.loadContent(section, url, e.target);
            });
        });
        
        console.log('All event listeners set up');
    }

    toggleMainMenu(mainSection, menuElement) {
        const subMenu = menuElement.parentNode.querySelector('.sub-menu');
        
        if (!subMenu) return;

        if (this.expandedMenus.has(mainSection)) {
            // Collapse menu
            this.expandedMenus.delete(mainSection);
            subMenu.classList.remove('expanded');
            subMenu.classList.add('collapsed');
            menuElement.classList.add('collapsed');
            menuElement.classList.remove('active');
        } else {
            // Expand menu
            this.expandedMenus.add(mainSection);
            subMenu.classList.remove('collapsed');
            subMenu.classList.add('expanded');
            menuElement.classList.remove('collapsed');
            menuElement.classList.add('active');
        }
    }

    handleMainMenuClick(mainSection, menuElement) {
        // Handle clicks on non-expandable main menu items
        this.setActiveMainMenuItem(menuElement);
        this.clearActiveSubMenuItems();
        
        // Load content based on main section
        switch (mainSection) {
            case 'projects':
                this.showMessage('Projects', 'Projects section - Content coming soon');
                break;
            case 'user-account':
                this.showMessage('User Account', 'Account settings - Content coming soon');
                break;
            default:
                this.showWelcome();
        }
    }

    loadContent(section, url, menuElement) {
        console.log(`*** LOAD CONTENT CALLED ***`);
        console.log(`Section: ${section}`);
        console.log(`URL: ${url}`);
        console.log(`Menu Element:`, menuElement);
        
        // Check if this URL is already active
        const currentActiveUrl = this.getActiveUrl();
        if (currentActiveUrl === url) {
            console.log('Same URL already active, skipping reload');
            // Just update the active menu item styling
            this.setActiveSubMenuItem(menuElement);
            return;
        }
        
        // Update active states
        this.setActiveSubMenuItem(menuElement);
        
        // Update content header
        const titles = {
            'your-information': { title: 'Member Information', subtitle: 'Personal details and contact information' },
            'bio': { title: 'Biography', subtitle: 'Your professional background and story' },
            'skills': { title: 'Skills', subtitle: 'Technical abilities and expertise' },
            'project-list': { title: 'Project Information', subtitle: 'Manage your project portfolio' },
            'contact-emails': { title: 'IODD Contact email requests', subtitle: 'Manage and respond to contact inquiries' }
        };
        
        const titleInfo = titles[section] || { title: section, subtitle: 'Loading content...' };
        console.log('Updating header:', titleInfo);
        this.updateContentHeader(titleInfo.title, titleInfo.subtitle);
        
        // Show loading state
        console.log('Showing loading state');
        this.showLoading();

        // Load the webpage in iframe (global gMemberId is already available)
        console.log('Loading webpage:', url);
        this.loadWebpage(url);
    }

    loadWebpage(url) {
        const contentArea = document.getElementById('contentArea');
        
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.className = 'content-frame';
        iframe.src = url;
        
        // Handle load success
        iframe.onload = () => {
            console.log(`Successfully loaded: ${url}`);
        };
        
        // Handle load error
        iframe.onerror = () => {
            console.error(`Failed to load: ${url}`);
            this.showError(`Failed to load webpage: ${url}`);
        };
        
        // Replace content with iframe
        contentArea.innerHTML = '';
        contentArea.appendChild(iframe);
        
        // Let the iframe handle its own loading - no fallback check needed
    }

    showSampleContent(originalUrl) {
        const contentArea = document.getElementById('contentArea');
        
        // Simply show that the page couldn't be loaded
        const sampleContent = `
            <div style="padding: 40px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); height: 100%; text-align: center;">
                <h3 style="color: #666; margin-bottom: 15px;">Content Loading Error</h3>
                <p style="color: #888;">The webpage "${originalUrl}" exists but may have loading issues.</p>
                <p style="color: #888; margin-top: 10px;">Please refresh the page or try again.</p>
            </div>
        `;
        
        contentArea.innerHTML = sampleContent;
    }

    showLoading() {
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = '<div class="loading">Loading webpage...</div>';
    }

    showError(message) {
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `<div class="error">${message}</div>`;
    }

    showWelcome() {
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `
            <div class="welcome-message">
                <div>
                    <h3>Welcome to Your Member Profile</h3>
                    <p>Please select a menu item from the left sidebar to view content.</p>
                </div>
            </div>
        `;
        this.updateContentHeader('Welcome', 'Select a menu item to get started');
    }

    showMessage(title, message) {
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `
            <div class="welcome-message">
                <div>
                    <h3>${title}</h3>
                    <p>${message}</p>
                </div>
            </div>
        `;
        this.updateContentHeader(title, message);
    }

    setActiveMainMenuItem(activeItem) {
        // Remove active class from all main menu items
        document.querySelectorAll('.main-menu-item').forEach(item => {
            if (!item.classList.contains('expandable')) {
                item.classList.remove('active');
            }
        });
        
        // Add active class to clicked item
        activeItem.classList.add('active');
    }

    setActiveSubMenuItem(activeItem) {
        // Remove active class from all sub menu items
        document.querySelectorAll('.sub-menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked item
        activeItem.classList.add('active');
    }

    clearActiveSubMenuItems() {
        document.querySelectorAll('.sub-menu-item').forEach(item => {
            item.classList.remove('active');
        });
    }

    updateContentHeader(title, subtitle) {
        document.getElementById('contentTitle').textContent = title;
        document.getElementById('contentSubtitle').textContent = subtitle;
    }

    // Public method to programmatically navigate to a section
    navigateTo(section) {
        const menuItem = document.querySelector(`[data-section="${section}"]`);
        if (menuItem) {
            menuItem.click();
        }
    }

    // Public method to expand/collapse specific menu
    toggleMenu(mainSection) {
        const menuItem = document.querySelector(`[data-main="${mainSection}"]`);
        if (menuItem && menuItem.classList.contains('expandable')) {
            this.toggleMainMenu(mainSection, menuItem);
        }
    }

    // Get the data-url of the currently active sub-menu item
    getActiveUrl() {
        const activeMenuItem = document.querySelector('.sub-menu-item.active');
        if (activeMenuItem) {
            return activeMenuItem.getAttribute('data-url');
        }
        return null;
    }

    // Get the data-section of the currently active sub-menu item
    getActiveSection() {
        const activeMenuItem = document.querySelector('.sub-menu-item.active');
        if (activeMenuItem) {
            return activeMenuItem.getAttribute('data-section');
        }
        return null;
    }

    // Get full info about the active menu item
    getActiveMenuInfo() {
        const activeMenuItem = document.querySelector('.sub-menu-item.active');
        if (activeMenuItem) {
            return {
                section: activeMenuItem.getAttribute('data-section'),
                url: activeMenuItem.getAttribute('data-url'),
                text: activeMenuItem.textContent.trim(),
                element: activeMenuItem
            };
        }
        return null;
    }


}

// Initialize the application when page is fully loaded
window.addEventListener('load', () => {
    // Add small delay to ensure URL is fully processed
    setTimeout(() => {
        window.memberProfile = new MemberProfileClient();
        console.log('Member Profile application started');
    }, 100);
});

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MemberProfileClient;
}