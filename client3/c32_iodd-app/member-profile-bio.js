// member-profile-bio.js

class MemberProfileBio {
    constructor() {
        this.quill = null;
        this.originalData = {};
        this.members = [];
        this.selectedMemberId = null;
        this.init();
    }

    async init() {
        // Initialize Quill rich text editor
        this.quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'script': 'sub'}, { 'script': 'super' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    ['link'],
                    ['clean']
                ]
            }
        });

        // Set up event listeners
        this.setupEventListeners();

        // Load members list first
        this.loadMembersList();
        
        // Wait for auth to be ready
        await this.waitForAuth();
    }
    
    async waitForAuth() {
        let attempts = 0;
        let delay = 50;
        let userRole, userNo;
        
        while (attempts < 10) {
            userRole = this.getJWTValue('user_role');
            userNo = this.getJWTValue('user_no');
            if (userRole && userNo) break;
            
            await new Promise(resolve => setTimeout(() => resolve(), delay));
            attempts++;
            delay = Math.min(delay * 1.5, 500);
        }
        console.log('Auth ready - Role:', userRole, 'UserNo:', userNo);
        
        // Override global variables for consistency
        if (userRole && userNo) {
            window.gRole = userRole;
            window.gMemberId = userNo;
        }
    }

    getJWTValue(key) {
        try {
            // Get JWT payload from app_token
            const payload = acmJWTGetPayload();
            if (payload && payload[key]) {
                return payload[key];
            }
        } catch (error) {
            console.log(`JWT payload read failed for ${key}:`, error.message);
        }
        
        // Fallback to window globals for compatibility
        if (key === 'user_role') return window.gRole;
        if (key === 'user_no') return window.gMemberId;
        return null;
    }

    async loadMembersList() {
        try {
            const response = await fetch(`${window.FVARS.SERVER_API_URL}/list/members`);             // .(51013.01.17)            
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
            memberName.textContent = `${member.FirstName} ${member.LastName}`;
            
            memberItem.appendChild(memberName);
            
            memberItem.addEventListener('click', () => {
                this.selectMember(member);
            });
            
            membersList.appendChild(memberItem);
        });
    }

    selectMember(member) {
        // Remove previous selection
        document.querySelectorAll('.member-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to clicked item
        event.currentTarget.classList.add('selected');
        
        // Store selected member ID
        this.selectedMemberId = member.MemberNo;
        
        // Load member data
        this.loadMemberDataById(this.selectedMemberId);
        
        // Apply role-based permissions
        this.applyRolePermissions();
    }

    getMemberId() {
        if (this.selectedMemberId) return this.selectedMemberId;
        return this.getJWTValue('user_no') || window.gMemberId || window.parent?.gMemberId;
    }

    async loadMemberDataById(memberId) {
        try {
            this.showMessage('Loading member data...', 'loading');

            const response = await fetch(`${window.FVARS.SERVER_API_URL}/members?id=${memberId}`, {  // .(51013.01.17)                
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
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

    setupEventListeners() {
        // Submit button
        document.getElementById('submitBtn').addEventListener('click', () => {
            this.saveMemberData();
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.cancelChanges();
        });

        // Auto-save to localStorage on content change
        this.quill.on('text-change', () => {
            this.autoSaveToLocal();
        });

        // Load from localStorage if page is refreshed
        window.addEventListener('beforeunload', () => {
            this.autoSaveToLocal();
        });

        // Check for saved data on page load
        this.loadFromLocal();
    }

    async loadMemberData() {
        const memberId = this.getMemberId();
        if (memberId) {
            await this.loadMemberDataById(memberId);
        } else {
            this.showMessage('Select a member from the list to view their bio', 'loading');
        }
    }

    populateForm(member) {
        document.getElementById('memberNo').value = member.Id || member.MemberNo || '';
        this.quill.root.innerHTML = member.Bio || '';
        
        // Apply role-based permissions after populating form
        this.applyRolePermissions();
    }

    async saveMemberData() {
        try {
            // Security check for Member role
            const userRole = this.getJWTValue('user_role') || window.gRole;
            const currentUserId = this.getJWTValue('user_no') || window.gMemberId;
            
            const targetUserId = this.selectedMemberId;
            if (userRole === 'Member' && currentUserId != targetUserId) {
                this.showMessage('You can only edit your own record', 'error');
                return;
            }
            
            const memberId = this.getMemberId();
            if (!memberId) {
                this.showMessage('No member ID available', 'error');
                return;
            }
            const bio = this.quill.root.innerHTML;

            console.log('Saving with member ID:', memberId);
            console.log('Bio content:', bio.substring(0, 100) + '...');

            this.showMessage('Saving...', 'loading');

            const params = new URLSearchParams();
            params.append('mid', memberId);
            params.append('bio', bio);

            console.log('Params contents:', Array.from(params.entries()));

            const response = await fetch(`${window.FVARS.SERVER_API_URL}/member_bio`, {              // .(51013.01.17)                
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers.get('content-type'));

            const responseText = await response.text();
            console.log('Save response text:', responseText);
            
            if (!response.ok) {
                console.error('Save error response:', responseText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                const result = JSON.parse(responseText);
                console.log('Parsed save result:', result);
            }
            
            this.showMessage('Member data saved successfully!', 'success');
            localStorage.removeItem('memberBioEdit');
            this.originalData = { Id: memberId, Bio: bio };
            setTimeout(() => this.clearMessage(), 3000);
        } catch (error) {
            console.error('Error saving member data:', error);
            this.showMessage('Error saving member data. Please try again.', 'error');
        }
    }

    cancelChanges() {
        // Clear any auto-saved data
        localStorage.removeItem('memberBioEdit');
        
        // Reload the page to get fresh data from database
        window.location.reload();
    }

    autoSaveToLocal() {
        const memberId = this.getMemberId();
        const bio = this.quill.root.innerHTML;
        
        if (memberId && bio) {
            const editData = {
                memberNo: memberId,
                bio: bio,
                timestamp: Date.now()
            };
            
            localStorage.setItem('memberBioEdit', JSON.stringify(editData));
        }
    }

    loadFromLocal() {
        const savedData = localStorage.getItem('memberBioEdit');
        if (savedData) {
            try {
                const editData = JSON.parse(savedData);
                // Only load if saved within last hour to avoid stale data
                const oneHour = 60 * 60 * 1000;
                if (Date.now() - editData.timestamp < oneHour) {
                    this.showMessage('Restored unsaved changes from browser storage', 'success');
                    setTimeout(() => this.clearMessage(), 5000);
                }
            } catch (error) {
                console.error('Error loading from localStorage:', error);
                localStorage.removeItem('memberBioEdit');
            }
        }
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('message');
        messageDiv.innerHTML = message;
        messageDiv.className = type;
        messageDiv.style.display = 'block';
    }

    clearMessage() {
        const messageDiv = document.getElementById('message');
        messageDiv.style.display = 'none';
        messageDiv.innerHTML = '';
        messageDiv.className = '';
    }

    applyRolePermissions() {
        const userRole = this.getJWTValue('user_role') || window.gRole;
        const currentUserId = this.getJWTValue('user_no') || window.gMemberId;
        
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const targetUserId = this.selectedMemberId;
        
        // Use RolePermissions class for consistent security
        if (typeof RolePermissions !== 'undefined') {
            const buttonVisibility = RolePermissions.getButtonVisibility(userRole, currentUserId, targetUserId);
            if (submitBtn) submitBtn.style.display = buttonVisibility.submit ? 'inline-block' : 'none';
            if (cancelBtn) cancelBtn.style.display = buttonVisibility.cancel ? 'inline-block' : 'none';
        } else {
            // Fallback logic
            if (userRole === 'Admin' || userRole === 'Editor') {
                if (submitBtn) submitBtn.style.display = 'inline-block';
                if (cancelBtn) cancelBtn.style.display = 'inline-block';
            } else if (userRole === 'Member') {
                const canEdit = currentUserId && targetUserId && (currentUserId == targetUserId);
                if (submitBtn) submitBtn.style.display = canEdit ? 'inline-block' : 'none';
                if (cancelBtn) cancelBtn.style.display = canEdit ? 'inline-block' : 'none';
            }
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MemberProfileBio();
});