// member-profile-info.js

class MemberProfileInfo {
    constructor() {
        this.originalData = {};
        this.members = [];
        this.selectedMemberId = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.loadMembersList();
        this.loadRoles();
        // Wait for auth to be ready before applying UI
        await this.waitForAuth();
        this.setupRoleBasedUI();
    }
    
    async waitForAuth() {
        // Wait for JWT auth to be ready
        let attempts = 0;
        let delay = 50;
        let userRole, userNo;
        
        while (attempts < 10) {
            try {
                userRole = await acmJWTFetch('user_role');
                userNo = await acmJWTFetch('user_no');
                if (userRole && userNo) break;
            } catch (error) {
                // Fallback to global variables
                if (window.gRole && window.gMemberId) {
                    userRole = window.gRole;
                    userNo = window.gMemberId;
                    break;
                }
            }
            
            await new Promise(resolve => setTimeout(() => resolve(), delay));
            attempts++;
            delay = Math.min(delay * 1.5, 500);
        }
        
        if (userRole && userNo) {
            console.log('Auth ready - Role:', userRole, 'UserNo:', userNo);
        } else {
            console.warn('Auth timeout - no role/user found');
        }
    }

    async loadRoles() {
        try {
            const response = await fetch(`${window.FVARS.SERVER_API_URL}/webpage_roles_view`);              // .(51013.01.21)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const roles = Array.isArray(data) ? data : (data.roles || []);
            
            const roleSelect = document.getElementById('applicationRole');
            if (!roleSelect) return;
            
            roleSelect.innerHTML = '<option value="">Select Role...</option>';
            
            roles.forEach(role => {
                const option = document.createElement('option');
                option.value = role.Id;
                option.textContent = role.Name;
                roleSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading roles:', error);
        }
    }

    setupEventListeners() {
        // Handle form submission
        const memberForm = document.getElementById('memberForm');
        if (memberForm) {
            memberForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveMemberData();
            });
            memberForm.addEventListener('input', () => {
                this.autoSaveToLocal();
            });
        }
        
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveMemberData();
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
                this.addNewMember();
            });
        }

        const deleteBtn = document.getElementById('deleteBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteMember();
            });
        }

        // Load from localStorage on page load
        this.loadFromLocal();
    }

    async loadMembersList() {
        try {
            const response = await fetch(`${window.FVARS.SERVER_API_URL}/list/members`);                    // .(51013.01.21)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (jsonError) {
                console.error('Invalid JSON response:', text);
                throw new Error('Server returned invalid JSON');
            }
            
            this.members = data.members || [];
            this.displayMembersList();
        } catch (error) {
            console.error('Error loading members list:', error);
            document.getElementById('membersList').innerHTML = '<div class="loading-members">Error loading members</div>';
        }
    }

    displayMembersList() {
        const membersList = document.getElementById('membersList');
        if (!this.members || this.members.length === 0) {
            membersList.innerHTML = '<div class="loading-members">No members found</div>';
            return;
        }

        membersList.innerHTML = '';
        this.members.forEach(member => {
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';
            memberItem.dataset.memberId = member.MemberNo;
            
            const memberName = document.createElement('div');
            memberName.className = 'member-name';
            memberName.textContent = `${member.FirstName || ''} ${member.LastName || ''}`.trim();
            
            memberItem.appendChild(memberName);
            
            memberItem.addEventListener('click', (event) => {
                this.selectMember(member, event);
            });
            
            membersList.appendChild(memberItem);
        });
    }

    async selectMember(member, event) {
        // Check record access permissions
        const accessCheck = await RolePermissions.checkRecordAccess(member);
        if (!accessCheck.allowed) {
            this.showMessage(accessCheck.message, 'error');
            return;
        }
        
        // Remove previous selection
        const selectedItem = document.querySelector('.member-item.selected');
        if (selectedItem) {
            selectedItem.classList.remove('selected');
        }
        
        // Add selection to clicked item
        if (event && event.currentTarget) {
            event.currentTarget.classList.add('selected');
        }
        
        // Store selected member ID
        this.selectedMemberId = member.MemberNo;
        
        // Load member data
        this.loadMemberDataById(this.selectedMemberId);
    }

    getMemberId() {
        return this.selectedMemberId !== null ? this.selectedMemberId : (window.gMemberId || window.parent?.gMemberId);
    }

    async loadMemberDataById(memberId) {
        try {
            // Validate memberId to prevent SSRF
            if (!memberId || isNaN(memberId) || memberId < 0) {
                throw new Error('Invalid member ID');
            }
            
            this.showMessage('Loading member data...', 'loading');

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch(`${window.FVARS.SERVER_API_URL}/members?id=${encodeURIComponent(memberId)}`, { // .(51013.01.21)
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
//                  'X-CSRF-TOKEN': csrfToken || '',                       //#.(51013.05.1 RAM csrfToken is undefined)
//                  'X-Requested-With': 'XMLHttpRequest'                   //#.(51013.05.2)
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.members && data.members.length > 0) {
                this.originalData = data.members[0];
                this.populateForm(data.members[0]);
                this.clearMessage();
            } else {
                this.showMessage('Member not found', 'error');
            }
        } catch (error) {
            console.error('Error loading member data:', error);
            this.showMessage('Error loading member data. Please check your connection.', 'error');
        }
    }

    async loadMemberData() {
        const memberId = this.getMemberId();
        if (memberId) {
            await this.loadMemberDataById(memberId);
        } else {
            this.showMessage('Select a member from the list to view their information', 'loading');
        }
    }

    populateForm(member) {
        document.getElementById('firstName').value = member.FirstName || '';
        document.getElementById('lastName').value = member.LastName || '';
        document.getElementById('email').value = member.Email || '';
        document.getElementById('phone1').value = member.Phone1 || '';
        document.getElementById('phone2').value = member.Phone2 || '';
        document.getElementById('company').value = member.Company || '';
        document.getElementById('address1').value = member.Address1 || '';
        document.getElementById('address2').value = member.Address2 || '';
        document.getElementById('city').value = member.City || '';
        document.getElementById('state').value = member.State || '';
        document.getElementById('zip').value = member.Zip || '';
        document.getElementById('country').value = member.Country || '';
        document.getElementById('website').value = member.WebSite || '';
        document.getElementById('applicationRole').value = member.RoleId || '';
        document.getElementById('emailContactQuestion').value = member.EmailContactQuestion || 'No';
        
        // Apply all role-based permissions and UI controls
        RolePermissions.applyFormPermissions(member);
    }

    async saveMemberData() {
        try {
            console.log('saveMemberData called');
            const memberId = this.getMemberId();
            console.log('Member ID:', memberId);
            if (memberId === null || memberId === undefined) {
                this.showMessage('Member ID is required', 'error');
                return;
            }
            
            // Check role permissions for editing
            let userRole, currentUserId;
            try {
                userRole = await acmJWTFetch('user_role') || window.gRole || window.parent?.gRole || 'Member';
                currentUserId = await acmJWTFetch('user_no') || window.gMemberId || window.parent?.gMemberId;
            } catch (error) {
                userRole = window.gRole || window.parent?.gRole || 'Member';
                currentUserId = window.gMemberId || window.parent?.gMemberId;
            }
            
            if (memberId !== 0 && !RolePermissions.canEditRecord(userRole, currentUserId, memberId)) {
                this.showMessage('You do not have permission to edit this record', 'error');
                return;
            }
            
            // Validate required fields
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            
            if (!firstName || !lastName || !email) {
                this.showMessage('First Name, Last Name, and Email are required fields', 'error');
                return;
            }

            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            this.showMessage('Saving...', 'loading');

            // For new members (ID = 0), get next MemberNo
            if (memberId === 0) {
                return new Promise((resolve, reject) => {
                    try {
                        acm_NextId('MemberNo', (nextId) => {
                            console.log('Got next MemberNo:', nextId);
                            this.saveWithMemberNo(nextId).then(resolve).catch(reject);
                        });
                    } catch (nextIdError) {
                        console.error('Error getting next member ID:', nextIdError);
                        reject(nextIdError);
                    }
                });
            }

            const formData = new URLSearchParams();
            formData.append('mid', memberId);
            console.log('Sending form data with mid:', memberId);
            const fieldMap = {
                'first-name': 'firstName',
                'last-name': 'lastName',
                'email': 'email',
                'phone1': 'phone1',
                'phone2': 'phone2',
                'company': 'company',
                'company-address1': 'address1',
                'company-address2': 'address2',
                'city': 'city',
                'state': 'state',
                'zip': 'zip',
                'country': 'country',
                'company-url': 'website',
                'role-id': 'applicationRole',
                'emailContactQuestion': 'emailContactQuestion'
            };
            
            Object.keys(fieldMap).forEach(key => {
                const element = document.getElementById(fieldMap[key]);
                if (element) {
                    formData.append(key, element.value);
                }
            });

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch(`${window.FVARS.SERVER_API_URL}/member`, {                         // .(51013.01.21)
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest'
                },
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
                if (response.status === 200) {
                    this.showMessage('Member information saved successfully!', 'success');
                    localStorage.removeItem('memberInfoEdit');
                    setTimeout(() => this.clearMessage(), 3000);
                    return;
                }
                throw new Error(`Server returned invalid response: ${responseText}`);
            }

            const isSuccess = result.success !== false && 
                (result.member || result.success === true || !result.error);

            if (isSuccess) {
                this.showMessage('Member information saved successfully!', 'success');
                localStorage.removeItem('memberInfoEdit');
                setTimeout(() => this.clearMessage(), 3000);
            } else {
                const errorMsg = result.message || result.error || result.msg || 'Unknown error';
                this.showMessage(`Save failed: ${errorMsg}`, 'error');
            }
        } catch (error) {
            console.error('Error saving member data:', error);
            this.showMessage(`Error saving member information: ${error.message}`, 'error');
        } finally {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    }

    async saveWithMemberNo(memberNo) {
        try {
            const formData = new URLSearchParams();
            formData.append('mid', 0);
            formData.append('memberno', memberNo);
            
            const fieldMap = {
                'first-name': 'firstName',
                'last-name': 'lastName',
                'email': 'email',
                'phone1': 'phone1',
                'phone2': 'phone2',
                'company': 'company',
                'company-address1': 'address1',
                'company-address2': 'address2',
                'city': 'city',
                'state': 'state',
                'zip': 'zip',
                'country': 'country',
                'company-url': 'website',
                'role-id': 'applicationRole',
                'emailContactQuestion': 'emailContactQuestion'
            };
            
            Object.keys(fieldMap).forEach(key => {
                const element = document.getElementById(fieldMap[key]);
                if (element) {
                    formData.append(key, element.value);
                }
            });

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch(`${window.FVARS.SERVER_API_URL}/member`, {                         // .(51013.01.21)
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText}\nServer response: ${errorText}`);
            }

            this.showMessage('Member information saved successfully!', 'success');
            localStorage.removeItem('memberInfoEdit');
            setTimeout(() => this.clearMessage(), 3000);
        } catch (error) {
            console.error('Error saving member data:', error);
            this.showMessage(`Error saving member information: ${error.message}`, 'error');
        } finally {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    }

    cancelChanges() {
        localStorage.removeItem('memberInfoEdit');
        window.location.reload();
    }

    autoSaveToLocal() {
        const memberId = this.getMemberId();
        if (!memberId) return;

        const elements = {
            firstName: document.getElementById('firstName'),
            lastName: document.getElementById('lastName'),
            email: document.getElementById('email'),
            phone1: document.getElementById('phone1'),
            phone2: document.getElementById('phone2'),
            company: document.getElementById('company'),
            address1: document.getElementById('address1'),
            address2: document.getElementById('address2'),
            city: document.getElementById('city'),
            state: document.getElementById('state'),
            zip: document.getElementById('zip'),
            country: document.getElementById('country'),
            website: document.getElementById('website')
        };

        const formData = { memberNo: memberId, timestamp: Date.now() };
        Object.keys(elements).forEach(key => {
            formData[key] = elements[key]?.value || '';
        });

        localStorage.setItem('memberInfoEdit', JSON.stringify(formData));
    }

    loadFromLocal() {
        const savedData = localStorage.getItem('memberInfoEdit');
        if (savedData) {
            try {
                const editData = JSON.parse(savedData);
                const oneHour = 60 * 60 * 1000;
                if (Date.now() - editData.timestamp < oneHour) {
                    const elements = {
                        firstName: document.getElementById('firstName'),
                        lastName: document.getElementById('lastName'),
                        email: document.getElementById('email'),
                        phone1: document.getElementById('phone1'),
                        phone2: document.getElementById('phone2'),
                        company: document.getElementById('company'),
                        address1: document.getElementById('address1'),
                        address2: document.getElementById('address2'),
                        city: document.getElementById('city'),
                        state: document.getElementById('state'),
                        zip: document.getElementById('zip'),
                        country: document.getElementById('country'),
                        website: document.getElementById('website')
                    };
                    
                    Object.keys(elements).forEach(key => {
                        if (elements[key]) {
                            elements[key].value = editData[key] || '';
                        }
                    });
                    
                    this.showMessage('Restored unsaved changes from browser storage', 'success');
                    setTimeout(() => this.clearMessage(), 5000);
                }
            } catch (error) {
                console.error('Error loading from localStorage:', error);
                localStorage.removeItem('memberInfoEdit');
            }
        }
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

    addNewMember() {
        this.selectedMemberId = 0;
        this.clearForm();
        this.showMessage('Ready to add new member', 'success');
    }

    async deleteMember() {
        if (!this.selectedMemberId || this.selectedMemberId === 0) {
            this.showMessage('Please select a member to delete', 'error');
            return;
        }

        // Check role permissions for deletion
        let userRole, currentUserId;
        try {
            userRole = await acmJWTFetch('user_role') || window.gRole || window.parent?.gRole || 'Member';
            currentUserId = await acmJWTFetch('user_no') || window.gMemberId || window.parent?.gMemberId;
        } catch (error) {
            userRole = window.gRole || window.parent?.gRole || 'Member';
            currentUserId = window.gMemberId || window.parent?.gMemberId;
        }
        
        // Only Admin can delete records
        if (userRole !== 'Admin') {
            this.showMessage('You do not have permission to delete records', 'error');
            return;
        }
        
        if (!RolePermissions.canEditRecord(userRole, currentUserId, this.selectedMemberId)) {
            this.showMessage('You do not have permission to delete this record', 'error');
            return;
        }

        try {
            const userChoice = await acm_SecurePopUp("Do you want to delete this member?","Yes : Yes", "No : No");
            if (userChoice === "No") {
                return;
            }

            this.showMessage('Deleting...', 'loading');

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch(`${window.FVARS.SERVER_API_URL}/member?id=${this.selectedMemberId}`, { // .(51013.01.21)
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.showMessage('Member deleted successfully!', 'success');
            this.loadMembersList();
            this.clearForm();
            this.selectedMemberId = null;
            setTimeout(() => this.clearMessage(), 3000);
        } catch (error) {
            console.error('Error deleting member:', error);
            this.showMessage(`Error deleting member: ${error.message}`, 'error');
        }
    }

    setupRoleBasedUI() {
        console.log('setupRoleBasedUI called');
        RolePermissions.applyRoleBasedUI();
    }

    clearForm() {
        const fieldIds = ['firstName', 'lastName', 'email', 'phone1', 'phone2', 'company', 
                         'address1', 'address2', 'city', 'state', 'zip', 'country', 'website', 'applicationRole'];
        
        fieldIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = id === 'applicationRole' ? '1' : '';
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const memberProfile = new MemberProfileInfo();
    
    // Add manual trigger for testing
    window.testRolePermissions = function() {
        console.log('Manual role permissions test - Role:', window.gRole, 'MemberId:', window.gMemberId);
        RolePermissions.applyRoleBasedUI();
    };
    
    // Also trigger after a delay to ensure auth is ready
    setTimeout(() => {
        console.log('Delayed role permissions check');
        RolePermissions.applyRoleBasedUI();
    }, 2000);
});