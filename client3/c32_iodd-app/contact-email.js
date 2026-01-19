// API configuration matching other working pages
//    var API_BASE_URL       = 'http://localhost:3004/api';                             //#.(51013.01.13)
      var API_BASE_URL       = window.FVARS.SERVER_API_URL;                             // .(51013.01.13)

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });
});

function validateForm() {
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error').forEach(error => error.textContent = '');
    
    // Validate Contact Name
    const contactName = document.getElementById('contactName').value.trim();
    if (!contactName) {
        document.getElementById('contactNameError').textContent = 'Contact Name is required';
        isValid = false;
    }
    
    // Validate Contact Email
    const contactEmail = document.getElementById('contactEmail').value.trim();
    if (!contactEmail) {
        document.getElementById('contactEmailError').textContent = 'Contact Email is required';
        isValid = false;
    } else if (!isValidEmail(contactEmail)) {
        document.getElementById('contactEmailError').textContent = 'Please enter a valid email address';
        isValid = false;
    }
    
    // Validate Question
    const question = document.getElementById('question').value.trim();
    if (!question) {
        document.getElementById('questionError').textContent = 'Question is required';
        isValid = false;
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function submitForm() {
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    // Prepare form data
    const formData = {
        ContactName: document.getElementById('contactName').value.trim(),
        ContactEmail: document.getElementById('contactEmail').value.trim(),
        Question: document.getElementById('question').value.trim(),
        DateReceived: new Date().toISOString().replace('T', ' ').substring(0, 19),
        Status: 'New'
    };
    
    // Try to submit to API
    try {
//      const response = await fetch(`${API_BASE_URL}/contact`, {
        const response = await fetch(   API_BASE_URL + '/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Submission failed');
        }
        
        const data = await response.json();
        
        // Check if response contains an error
        if (data && data.error) {
            throw new Error('Submission failed');
        }
        
        const popupResponse = await acm_SecurePopUp('Thank you! Your message has been submitted successfully.', 'OK:ok');
        window.location.href = 'index.html';
        
    } catch (error) {
        // Generic error message to prevent information disclosure
        const popupResponse = await acm_SecurePopUp('There was an error submitting your message. Please try again.', 'OK:ok');
        
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function cancelForm() {
    // Redirect to home page without saving
    window.location.href = 'index.html';
}