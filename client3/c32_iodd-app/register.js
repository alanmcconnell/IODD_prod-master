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
            // Validate form data
            const formData = this.getFormData();
            const validation = this.validateFormData(formData);
            
            if (!validation.valid) {
                alert(validation.message);
                return;
            }
            
            console.log('Sending registration to:', `${this.apiBaseUrl}/register`);
            console.log('Form data:', { ...formData, password: '***', secureAnswer1: '***', secureAnswer2: '***' });
            
            // Send all registration data to server via POST
            const response = await fetch(`${this.apiBaseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            const responseText = await response.text();
            console.log('Response text:', responseText);
            
            let result;
            try {
                result = JSON.parse(responseText);
                console.log('Parsed result:', result);
            } catch (e) {
                throw new Error(`Server returned invalid JSON: ${responseText}`);
            }
            
            if (response.ok && result.success) {
                alert('Registration successful! Please log in with your credentials.');
                window.location.href = 'index.html';
            } else {
                const errorMsg = result.message || result.error || `Registration failed with status ${response.status}`;
                console.error('Registration failed:', errorMsg);
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert(`Registration failed: ${error.message}`);
        }
    }
    
    validateFormData(data) {
        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(data.email)) {
            return { valid: false, message: 'Please enter a valid email address' };
        }
        
        // Password strength validation
        if (data.password.length < 8) {
            return { valid: false, message: 'Password must be at least 8 characters long' };
        }
        
        if (!/[A-Z]/.test(data.password)) {
            return { valid: false, message: 'Password must contain at least one uppercase letter' };
        }
        
        if (!/[a-z]/.test(data.password)) {
            return { valid: false, message: 'Password must contain at least one lowercase letter' };
        }
        
        if (!/[0-9]/.test(data.password)) {
            return { valid: false, message: 'Password must contain at least one number' };
        }
        
        // Check all required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'username', 'password', 
                                'secureQuestion1', 'secureAnswer1', 'secureQuestion2', 'secureAnswer2'];
        
        for (const field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                return { valid: false, message: `${field} is required` };
            }
        }
        
        return { valid: true };
    }

    getFormData() {
        return {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value,
            secureQuestion1: document.getElementById('secureQuestion1').value.trim(),
            secureAnswer1: document.getElementById('secureAnswer1').value.trim(),
            secureQuestion2: document.getElementById('secureQuestion2').value.trim(),
            secureAnswer2: document.getElementById('secureAnswer2').value.trim()
        };
    }
}

// Initialize registration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Registration();
});