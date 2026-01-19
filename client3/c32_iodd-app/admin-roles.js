// admin-roles.js
//      var CLIENT_PATH    = window.FVARS.CLIENT_PATH;                                  //#.(51013.01.5)
        var SERVER_API_URL = window.FVARS.SERVER_API_URL;                               // .(51013.01.5)

class AdminRoles {
    constructor() {
        this.originalData = {};
        this.roles = [];
        this.selectedRoleId = null;
// this.baseUrl = window.location.protocol + '//' + window.location.hostname + ':3004'; //#.(51013.01.5)
        this.currentUser = null;
        this.init();
    }

    async init() {
        const isAuthorized = await this.checkAuthentication();
        if (!isAuthorized) {
            this.showAccessDenied();
            return;
        }
        this.setupEventListeners();
        this.loadRoles();
    }

    getJWTValue(key) {
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

    async checkAuthentication() {
        const memberId = this.getJWTValue('user_no') || window.gMemberId;
        const memberRole = this.getJWTValue('user_role') || window.gRole || 'Member';
        
        // Update global variables for consistency
        if (memberId && memberRole) {
            window.gMemberId = memberId;
            window.gRole = memberRole;
        }
        
        this.currentUser = {
            MemberNo: memberId,
            Role: memberRole
        };
        
        console.log('Auth ready - Role:', memberRole, 'UserNo:', memberId);
        
        // Only Admin role can access this page
        if (memberRole !== 'Admin') {
            return false;
        }
        
        return true;
    }

    showAccessDenied() {
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f5f5f5;">
                <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center;">
                    <h2 style="color: #dc3545; margin-bottom: 20px;">Access Denied</h2>
                    <p style="color: #666; margin-bottom: 20px;">Only users with Admin role can access this page.</p>
                    <button onclick="window.history.back()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Go Back</button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        try {
            // Handle form submission
            const roleForm = document.getElementById('roleForm');
            if (roleForm) {
                roleForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.saveRole();
                });
            }
            
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.saveRole();
                });
            }

            const cancelBtn = document.getElementById('cancelBtn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.cancelChanges();
                });
            }

            const addBtn = document.getElementById('addBtn');
            if (addBtn) {
                addBtn.addEventListener('click', () => {
                    this.addNewRole();
                });
            }

            const deleteBtn = document.getElementById('deleteBtn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    this.deleteRole();
                });
            }
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    async loadRoles() {
        try {
            const response = await fetch( SERVER_API_URL + '/roles', {                  // .(51013.01.5 RAM Was: `${this.baseUrl}/api/roles`)
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.roles = data.roles || [];
            this.displayRoles();
        } catch (error) {
            console.error('Error loading roles:', error);
            const rolesGrid = document.getElementById('rolesGrid');
            if (rolesGrid) {
                rolesGrid.innerHTML = '<div class="loading-roles">Error loading roles</div>';
            }
        }
    }

    displayRoles() {
        const rolesGrid = document.getElementById('rolesGrid');
        if (!rolesGrid) return;
        
        if (!this.roles || this.roles.length === 0) {
            rolesGrid.innerHTML = '<div class="loading-roles">No roles found</div>';
            return;
        }

        rolesGrid.innerHTML = '';
        this.roles.forEach(role => {
            const roleItem = document.createElement('div');
            roleItem.className = 'role-item';
            roleItem.dataset.roleId = role.Id;
            
            const roleName = document.createElement('div');
            roleName.className = 'role-name';
            roleName.textContent = role.Name;
            
            roleItem.appendChild(roleName);
            
            roleItem.addEventListener('click', (event) => {
                this.selectRole(role, event);
            });
            
            rolesGrid.appendChild(roleItem);
        });
    }

    selectRole(role, event) {
        // Remove previous selection
        document.querySelectorAll('.role-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to clicked item
        if (event && event.currentTarget) {
            event.currentTarget.classList.add('selected');
        }
        
        // Store selected role ID
        this.selectedRoleId = role.Id;
        this.originalData = { ...role };
        
        // Populate form
        this.populateForm(role);
    }

    populateForm(role) {
        const nameEl = document.getElementById('name');
        const scopeEl = document.getElementById('scope');
        const activeEl = document.getElementById('active');
        const createdAtEl = document.getElementById('createdAt');
        const updatedAtEl = document.getElementById('updatedAt');
        
        if (nameEl) nameEl.value = role.Name || '';
        if (scopeEl) scopeEl.value = role.Scope || '';
        if (activeEl) activeEl.value = role.Active || 'Yes';
        if (createdAtEl) createdAtEl.value = role.CreatedAt || '';
        if (updatedAtEl) updatedAtEl.value = role.UpdatedAt || '';
    }

    async saveRole() {
        try {
            const nameEl = document.getElementById('name');
            const scopeEl = document.getElementById('scope');
            const activeEl = document.getElementById('active');
            
            if (!nameEl || !scopeEl || !activeEl) {
                throw new Error('Required form elements not found');
            }
            
            const name = nameEl.value.trim();
            const scope = scopeEl.value.trim();
            const active = activeEl.value;
            
            if (!name) {
                this.showMessage('Name is required', 'error');
                return;
            }

            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Saving...';
            }

            this.showMessage('Saving...', 'loading');

            const formData = new URLSearchParams();
            formData.append('id', this.selectedRoleId || 0);
            formData.append('name', name);
            formData.append('scope', scope);
            formData.append('active', active);
            
            // Add CSRF token if available
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (csrfToken) {
                formData.append('_token', csrfToken);
            }

//          const response = await fetch('http://localhost:3004/api/role', {            //#.(51013.01.5)
            const response = await fetch( SERVER_API_URL + '/role', {                   // .(51013.01.5)                
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText}\nServer response: ${errorText}`);
            }

            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                if (responseText.toLowerCase().includes('success') || 
                    responseText.toLowerCase().includes('saved') ||
                    responseText.toLowerCase().includes('updated')) {
                    this.showMessage('Role saved successfully!', 'success');
                    this.loadRoles();
                    setTimeout(() => this.clearMessage(), 3000);
                    return;
                }
                throw new Error(`Server returned invalid response: ${responseText}`);
            }

            const isSuccess = result.success !== false && 
                (result.role || result.success === true || !result.error);

            if (isSuccess) {
                this.showMessage('Role saved successfully!', 'success');
                this.loadRoles();
                setTimeout(() => this.clearMessage(), 3000);
            } else {
                const errorMsg = result.message || result.error || result.msg || 'Unknown error';
                this.showMessage(`Save failed: ${errorMsg}`, 'error');
            }
        } catch (error) {
            console.error('Error saving role:', error);
            this.showMessage(`Error saving role: ${error.message}`, 'error');
        } finally {
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit';
            }
        }
    }

    async deleteRole() {
        if (!this.selectedRoleId) {
            this.showMessage('Please select a role to delete', 'error');
            return;
        }

        try {
            // Check if role is assigned to any members
//          const checkResponse = await fetch(`http://localhost:3004/api/role-usage?id=${this.selectedRoleId}`, {  //#.(51013.01.5)                
            const checkResponse = await fetch( SERVER_API_URL + `/role-usage?id=${this.selectedRoleId}`, {         // .(51013.01.5)                
                credentials: 'include'
            });
            if (!checkResponse.ok) {
                throw new Error(`Failed to check role usage: ${checkResponse.status}`);
            }
            let checkData;
            try {
                checkData = await checkResponse.json();
            } catch (jsonError) {
                throw new Error('Invalid response from role usage check');
            }
            
            if (checkData && checkData.count > 0) {
                this.showMessage(`Cannot delete role. It is assigned to ${checkData.count} member(s).`, 'error');
                return;
            }

            let userChoice;
            try {
                userChoice = await acm_SecurePopUp("Do you want to delete this role?","Yes:Yes", "No:No");
            } catch (popupError) {
                console.error('Error showing confirmation popup:', popupError);
                return;
            }
            if (userChoice === "No") {
                return;
            }

            this.showMessage('Deleting...', 'loading');

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch( SERVER_API_URL + `/role?id=${this.selectedRoleId}`, {                    // .(51013.01.5)                                
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.showMessage('Role deleted successfully!', 'success');
            this.loadRoles();
            this.clearForm();
            setTimeout(() => this.clearMessage(), 3000);
        } catch (error) {
            console.error('Error deleting role:', error);
            this.showMessage(`Error deleting role: ${error.message}`, 'error');
        }
    }

    cancelChanges() {
        if (this.selectedRoleId && this.originalData) {
            this.populateForm(this.originalData);
        } else {
            this.clearForm();
        }
        this.clearMessage();
    }

    addNewRole() {
        this.selectedRoleId = null;
        this.originalData = {};
        this.clearForm();
        
        // Remove selection from grid
        const selectedItem = document.querySelector('.role-item.selected');
        if (selectedItem) {
            selectedItem.classList.remove('selected');
        }
        
        this.showMessage('Ready to add new role', 'success');
        setTimeout(() => this.clearMessage(), 2000);
    }

    clearForm() {
        const nameEl = document.getElementById('name');
        const scopeEl = document.getElementById('scope');
        const activeEl = document.getElementById('active');
        const createdAtEl = document.getElementById('createdAt');
        const updatedAtEl = document.getElementById('updatedAt');
        
        if (nameEl) nameEl.value = '';
        if (scopeEl) scopeEl.value = '';
        if (activeEl) activeEl.value = 'Yes';
        if (createdAtEl) createdAtEl.value = '';
        if (updatedAtEl) updatedAtEl.value = '';
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('message');
        if (!messageDiv) return;
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    }

    clearMessage() {
        const messageDiv = document.getElementById('message');
        if (!messageDiv) return;
        messageDiv.style.display = 'none';
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new AdminRoles();
    } catch (initError) {
        console.error('Error initializing AdminRoles:', initError);
    }
});