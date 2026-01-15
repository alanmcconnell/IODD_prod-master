// register.js - IODD Member Registration

class Registration {
    constructor() {
        this.apiBaseUrl = window.fvaRs?.SERVER_API_URL || 'http://localhost:54382/api2';
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Cancel button - return to index.html
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancelRegistration();
            });
        }

        // Submit button - placeholder for future implementation
        const submitBtn = document.getElementById('submitBtn');
        const registrationForm = document.getElementById('registrationForm');
        
        if (registrationForm) {
            registrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitRegistration();
            });
        }
    }

    cancelRegistration() {
        // Return user to index.html
        window.location.href = 'index.html';
    }

    async submitRegistration() {
        try {
            const formData = this.getFormData();
            
            // Prepare member data for database - use mid: 0 to trigger INSERT
            const memberData = {
                mid: 0,
                'first-name': formData.firstName,
                'last-name': formData.lastName,
                email: formData.email,
                password: 'iodd',
                'role-id': 1
            };
            
            console.log('Sending registration data:', memberData);
            console.log('API URL:', `${this.apiBaseUrl}/member`);
            
            const response = await fetch(`${this.apiBaseUrl}/member`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(memberData)
            });
            
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            const responseText = await response.text();
            console.log('Response text:', responseText);
            
            if (response.ok) {
                // Create PKCE token and redirect to login page
                await this.createPKCETokenAndRedirect(formData);
            } else {
                throw new Error(`Registration failed: ${response.status} - ${responseText}`);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert(`Registration failed: ${error.message}`);
        }
    }

    async createPKCETokenAndRedirect(formData) {
        try {
            const tokenPayload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                password: formData.password,
                security_question_1: formData.secureQuestion1,
                security_answer_1: formData.secureAnswer1,
                security_question_2: formData.secureQuestion2,
                security_answer_2: formData.secureAnswer2,
                user_app_role: 'Member',
                app_key: window.fvaRs?.SECURE_APP_KEY || '',
                url_redirect: window.fvaRs?.failure_URL || 'index.html'
            };

            const tokenResponse = await fetch(`${this.apiBaseUrl}/jwt/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ payload: tokenPayload })
            });

            if (tokenResponse.ok) {
                const tokenData = await tokenResponse.json();
                const loginPage = window.fvaRs?.LOGIN_PAGE || 'index.html';
                const loginUrl = `${loginPage}?reg_key=yes&pkce=${encodeURIComponent(tokenData.token)}`;
                console.log('Redirecting to:', loginUrl);
                window.location.href = loginUrl;
            } else {
                throw new Error('Failed to create PKCE token');
            }
        } catch (error) {
            console.error('PKCE token creation failed:', error);
            alert('Registration successful! Welcome to IODD.');
            window.location.href = 'index.html';
        }
    }

    getFormData() {
        return {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value, // Will be encrypted later
            secureQuestion1: document.getElementById('secureQuestion1').value,
            secureAnswer1: document.getElementById('secureAnswer1').value,
            secureQuestion2: document.getElementById('secureQuestion2').value,
            secureAnswer2: document.getElementById('secureAnswer2').value
        };
    }
}

// Initialize registration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Registration();
});