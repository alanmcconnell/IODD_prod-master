// Contact Emails Management
class ContactEmailsManager {
    constructor() {
        this.contactData = [];
        this.selectedContactId = null;
        this.apiBaseUrl = window.fvaRs.SERVER_API_URL;
        this.init();
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

    init() {
        this.loadContactEmails();
        this.setupEventListeners();
    }



    async loadContactEmails() {
        try {
            console.log('Fetching from:', `${this.apiBaseUrl}/contactmail`);
            const response = await fetch( `${this.apiBaseUrl}/contactmail`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            console.log('Raw response text:', text);
            
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                throw new Error('Server returned invalid JSON');
            }
            
            console.log('Parsed API Response data:', data);
            console.log('Data type:', typeof data);
            console.log('Data keys:', Object.keys(data));
            
            // Try different possible property names based on server patterns
            this.contactData = data.contactmail || data.ContactMail || data.data || data.results || [];
            console.log('Final contactData:', this.contactData);
            console.log('ContactData length:', this.contactData.length);
            this.renderGrid();
        } catch (error) {
            console.error('Error loading contact emails:', error);
            this.showError('Failed to load contact messages. Please try again.');
        }
    }

    renderGrid() {
        const gridContainer = document.getElementById('gridContainer');
        
        if (this.contactData.length === 0) {
            gridContainer.innerHTML = '<div class="no-data">No contact messages found</div>';
            return;
        }

        // Filter data based on status filter
        const statusFilter = document.getElementById('statusFilter')?.value || 'New';
        
        // Debug: Log the data structure
        console.log('Status filter:', statusFilter);
        console.log('Total contact data length:', this.contactData.length);
        if (this.contactData.length > 0) {
            console.log('Sample contact data:', this.contactData[0]);
            const statusValues = [...new Set(this.contactData.map(c => c.Status))];
            console.log('Available Status values:', statusValues);
            console.log('Status values with types:', statusValues.map(s => `'${s}' (${typeof s})`));
        }
        
        let filteredData;
        if (statusFilter === 'All') {
            // Show all records when 'All' is selected
            filteredData = this.contactData;
        } else {
            filteredData = this.contactData.filter(contact => {
                // Treat undefined/null Status as 'New'
                const contactStatus = contact.Status || 'New';
                console.log(`Comparing: '${contactStatus}' === '${statusFilter}' = ${contactStatus === statusFilter}`);
                return contactStatus === statusFilter;
            });
        }
        
        console.log('Filtered data length:', filteredData.length);
        if (filteredData.length > 0) {
            console.log('Sample filtered record:', filteredData[0]);
        } else {
            console.log('No records match the filter criteria');
        }
        
        if (filteredData.length === 0) {
            gridContainer.innerHTML = `<div class="no-data">No ${statusFilter.toLowerCase()} messages found</div>`;
            return;
        }

        // Sort by DateReceived (newest first)
        const sortedData = [...filteredData].sort((a, b) => 
            new Date(b.DateReceived) - new Date(a.DateReceived)
        );
        
        if (sortedData.length === 0) {
            const message = statusFilter === 'All' ? 'No messages found' : `No ${statusFilter.toLowerCase()} messages found`;
            gridContainer.innerHTML = `<div class="no-data">${message}</div>`;
            return;
        }

        const table = document.createElement('table');
        table.className = 'data-grid';
        
        // Create header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Contact Name</th>
                <th>Date Received</th>
            </tr>
        `;
        table.appendChild(thead);

        // Create body
        const tbody = document.createElement('tbody');
        sortedData.forEach(contact => {
            const row = document.createElement('tr');
            row.dataset.id = contact.Id;
            row.innerHTML = `
                <td>${this.escapeHtml(contact.ContactName || 'Unknown')}</td>
                <td>${this.formatDate(contact.DateReceived)}</td>
            `;
            
            row.addEventListener('click', () => this.selectContact(contact.Id));
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        gridContainer.innerHTML = '';
        gridContainer.appendChild(table);
    }

    selectContact(contactId) {
        // Remove previous selection
        document.querySelectorAll('.data-grid tr').forEach(row => {
            row.classList.remove('selected');
        });

        // Add selection to clicked row
        const selectedRow = document.querySelector(`tr[data-id="${contactId}"]`);
        if (selectedRow) {
            selectedRow.classList.add('selected');
        }

        this.selectedContactId = contactId;
        this.renderDetails();
    }

    async renderDetails() {
        const detailsContainer = document.getElementById('detailsContainer');
        
        if (!this.selectedContactId) {
            detailsContainer.innerHTML = '<div class="no-data">Select a message from the left to view details</div>';
            return;
        }

        const contact = this.contactData.find(c => c.Id == this.selectedContactId);
        if (!contact) {
            detailsContainer.innerHTML = '<div class="error">Contact not found</div>';
            return;
        }

        // Get role from JWT token
        const userRole = this.getJWTValue('user_role') || window.gRole || 'Member';
        const currentUserId = this.getJWTValue('user_no') || window.gMemberId;
        
        // Update global variables for consistency
        if (userRole && currentUserId) {
            window.gRole = userRole;
            window.gMemberId = currentUserId;
        }
        
        console.log('Auth ready - Role:', userRole, 'UserNo:', currentUserId);

        // Fetch member name if MemberNo exists
        let memberName = '';
        if (contact.MemberNo) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/members?MemberNo=${contact.MemberNo}`);
                if (response.ok) {
                    const data = await response.json();
                    const member = data.members?.[0] || data[0];
                    if (member) {
                        memberName = ` (${member.FirstName} ${member.LastName})`;
                    }
                }
            } catch (error) {
                console.error('Error fetching member name:', error);
            }
        }

        detailsContainer.innerHTML = `
            <form id="contactForm">
                <input type="hidden" id="memberNo" value="${contact.MemberNo || ''}">
                <div class="form-group">
                    <label class="form-label">Contact Name:</label>
                    <input type="text" class="form-input" value="${this.escapeHtml(contact.ContactName || '')}" disabled>
                </div>

                <div class="form-group">
                    <label class="form-label">Contact Email:</label>
                    <input type="email" class="form-input" value="${this.escapeHtml(contact.ContactEmail || '')}" disabled>
                </div>

                <div class="form-group">
                    <label class="form-label">Question:</label>
                    <textarea class="form-input question-field" disabled>${this.escapeHtml(contact.Question || '')}</textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Member's Answer${memberName}:</label>
                    <textarea class="form-textarea" id="answerText" placeholder="Enter your response here...">${this.escapeHtml(contact.Answer || '')}</textarea>
                </div>

                <div class="button-group">
                    <button type="button" class="action-btn btn-submit" onclick="submitAnswer()">Submit</button>
                    <button type="button" class="action-btn btn-cancel" onclick="cancelChanges()">Cancel</button>
                    <button type="button" class="action-btn btn-email" onclick="sendEmail()">Send Email</button>
                    <button type="button" class="action-btn btn-delete" id="deleteBtn" onclick="deleteRecord()" style="display: none;">Delete</button>
                </div>
            </form>
        `;
        
        // Apply role-based UI after rendering
        setTimeout(() => {
            this.applyRolePermissions(userRole, currentUserId);
        }, 100);
    }

    applyRolePermissions(userRole, currentUserId) {
        const deleteBtn = document.getElementById('deleteBtn');
        const submitBtn = document.querySelector('.btn-submit');
        const emailBtn = document.querySelector('.btn-email');
        
        if (typeof RolePermissions !== 'undefined') {
            const buttonVisibility = RolePermissions.getButtonVisibility(userRole, currentUserId, null);
            if (deleteBtn) deleteBtn.style.display = buttonVisibility.delete ? 'inline-block' : 'none';
            // All roles can submit answers, so always show submit button
            if (submitBtn) submitBtn.style.display = 'inline-block';
            // All roles can send emails, so always show email button
            if (emailBtn) emailBtn.style.display = 'inline-block';
        } else {
            // Fallback logic
            if (deleteBtn) {
                deleteBtn.style.display = userRole === 'Admin' ? 'inline-block' : 'none';
            }
            // Members now have same permissions as Editors
            // Only hide delete button for non-Admin users
            if (submitBtn) submitBtn.style.display = 'inline-block';
            if (emailBtn) emailBtn.style.display = 'inline-block';
        }
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        const gridContainer = document.getElementById('gridContainer');
        gridContainer.innerHTML = `<div class="error">${message}</div>`;
    }

    async submitAnswer() {
        // All roles (Admin, Editor, Member) can submit answers
        
        if (!this.selectedContactId) return;
        
        const answerText = document.getElementById('answerText')?.value || '';
        const contact = this.contactData.find(c => c.Id == this.selectedContactId);
        
        if (!contact) return;
        
        const memberNo = this.getJWTValue('user_no') || window.gMemberId || 1;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/contactmail/${this.selectedContactId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Answer: answerText,
                    DateRespond: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    MemberNo: memberNo,
                    Status: 'Working On'
                })
            });
            
            if (response.ok) {
                await acm_SecurePopUp('Answer submitted successfully!', 'OK:ok');
                this.loadContactEmails(); // Refresh data
            } else {
                throw new Error('Failed to submit answer');
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
            await acm_SecurePopUp('Failed to submit answer. Please try again.', 'OK:ok');
        }
    }
    
    cancelChanges() {
        this.loadContactEmails(); // Refresh data
        this.renderDetails(); // Re-render details
    }
    
    async sendEmail() {
        // All roles (Admin, Editor, Member) can send emails
        
        if (!this.selectedContactId) return;
        
        const contact = this.contactData.find(c => c.Id == this.selectedContactId);
        const answerText = document.getElementById('answerText')?.value || '';
        
        if (!contact || !answerText.trim()) {
            await acm_SecurePopUp('Please enter an answer before sending email.', 'OK:ok');
            return;
        }
        
        try {
            const memberId = contact.MemberNo || this.getJWTValue('user_no') || window.gMemberId || 1;

            
            const response = await fetch(`${this.apiBaseUrl}/contactmail/${this.selectedContactId}/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contactName: contact.ContactName,
                    contactEmail: contact.ContactEmail,
                    question: contact.Question,
                    answer: answerText,
                    memberId: memberId
                })
            });
            
            if (response.ok) {
                await acm_SecurePopUp('Email sent successfully!', 'OK:ok');
                // Update status to 'Sent'
                await this.updateContactStatus('Sent');
            } else {
                throw new Error('Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            await acm_SecurePopUp('Failed to send email. Please try again.', 'OK:ok');
        }
    }
    
    async deleteRecord() {
        const userRole = this.getJWTValue('user_role') || window.gRole || 'Member';
        if (userRole !== 'Admin') {
            await acm_SecurePopUp('You do not have permission to delete records', 'OK:ok');
            return;
        }
        
        if (!this.selectedContactId) return;
        
        const userResponse = await acm_SecurePopUp("Do you want to delete this email?", "Yes:Yes", "No:No");
        if (userResponse !== 'Yes') return;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/contactmail/${this.selectedContactId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await acm_SecurePopUp('Record deleted successfully!', 'OK:ok');
                this.selectedContactId = null;
                this.loadContactEmails(); // Refresh data
                this.renderDetails(); // Clear details
            } else {
                throw new Error('Failed to delete record');
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            await acm_SecurePopUp('Failed to delete record. Please try again.', 'OK:ok');
        }
    }
    
    async updateContactStatus(status) {
        if (!this.selectedContactId) return;
        
        try {
            await fetch(`${this.apiBaseUrl}/contactmail/${this.selectedContactId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ Status: status })
            });
            
            this.loadContactEmails(); // Refresh data
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }

    async fetchMemberRole(memberId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/members?id=${memberId}`);
            if (response.ok) {
                const data = await response.json();
                const member = data.members?.[0] || data[0];
                if (member && member.RoleId) {
                    // Fetch role name
                    const roleResponse = await fetch(`${this.apiBaseUrl}/webpage_roles_view`);
                    if (roleResponse.ok) {
                        const rolesData = await roleResponse.json();
                        console.log('Roles response:', rolesData);
                        
                        // Handle different response formats
                        let roles = rolesData;
                        if (rolesData.webpage_roles_view) roles = rolesData.webpage_roles_view;
                        if (rolesData.roles) roles = rolesData.roles;
                        if (!Array.isArray(roles)) roles = [rolesData];
                        
                        const role = roles.find(r => r.Id == member.RoleId && r.Active === 'Yes');
                        if (role) {
                            window.gRole = role.Name;
                            window.gRoleId = member.RoleId;
                            console.log('Fetched and set role:', window.gRole);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching member role:', error);
        }
    }

    setupEventListeners() {
        // Add any additional event listeners here
        window.addEventListener('resize', () => {
            // Handle responsive layout changes if needed
        });
    }
}

// Global functions for action buttons
function submitAnswer() {
    if (window.contactManager) {
        window.contactManager.submitAnswer();
    }
}

function cancelChanges() {
    if (window.contactManager) {
        window.contactManager.cancelChanges();
    }
}

function sendEmail() {
    if (window.contactManager) {
        window.contactManager.sendEmail();
    }
}

async function deleteRecord() {
    if (window.contactManager) {
        await window.contactManager.deleteRecord();
    }
}

// Global function for filter dropdown
function filterMessages() {
    if (window.contactManager) {
        window.contactManager.renderGrid();
    }
}

// Initialize the contact emails manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.contactManager = new ContactEmailsManager();
});