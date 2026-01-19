class LoginClient {
    constructor() {
//      this.baseUrl = 'http://localhost:54032/api2';                                   //#.(51013.01.31 AMC Assuming same base URL as other clients)
        this.baseUrl = window.FVARS.SERVER_API_URL;                                     // .(51013.01.31)        
    }

    async login(username, password) {
        // This is a mock login function.
        // In a real application, this would make a POST request to a login endpoint.
        // For example:
        // const response = await fetch(`${this.baseUrl}/login`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ username, password })
        // });
        // if (!response.ok) {
        //     const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        //     throw new Error(errorData.message);
        // }
        // return response.json();

         console.log(`Attempting login for user: ${username}`);
         return new Promise((resolve, reject) => {
             setTimeout(() => {
                 if (username === 'test@iodd.com' && password === 'password') {
                     console.log('Mock login successful.');
                       resolve({
                         success: true,
                         message: 'Login successful! Redirecting...',
                         MemberNo: 12345 // Example member number
                     });
                 } else {
                     console.log('Mock login failed.');
                     reject(new Error('Invalid username or password.'));
                 }
             }, 500);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const client = new LoginClient();

            try {
                const result = await client.login(username, password);
                if (result.success && result.MemberNo) {
                    // On successful login, redirect to the member-profile page with the MemberNo
                    window.location.href = `member-profile.html?memberNo=${result.MemberNo}`;
                }
            } catch (error) {
                messageDiv.textContent = error.message;
                messageDiv.className = 'message error';
                messageDiv.style.display = 'block';
            }
        });
    }
});