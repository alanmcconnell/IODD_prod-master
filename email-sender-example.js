// Email sending process from member-profile-contactq.html
async function sendEmail(contactId, answerText) {
    const apiBaseUrl = window.fvaRs.SERVER_API_URL;
    
    // Get contact data (you'll need to adapt this to your data source)
    const contact = getContactById(contactId);
    
    if (!contact || !answerText.trim()) {
        alert('Please enter an answer before sending email.');
        return;
    }
    
    try {
        const response = await fetch(`${apiBaseUrl}/contactmail/${contactId}/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contactName: contact.ContactName,
                contactEmail: contact.ContactEmail,
                question: contact.Question,
                answer: answerText,
                memberName: window.gMemberName || 'IODD Member'
            })
        });
        
        if (response.ok) {
            alert('Email sent successfully!');
            // Update status to 'Sent'
            await updateContactStatus(contactId, 'Sent');
        } else {
            throw new Error('Failed to send email');
        }
    } catch (error) {
        console.error('Error sending email:', error);
        alert('Failed to send email. Please try again.');
    }
}

async function updateContactStatus(contactId, status) {
    const apiBaseUrl = window.fvaRs.SERVER_API_URL;
    
    try {
        await fetch(`${apiBaseUrl}/contactmail/${contactId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Status: status })
        });
    } catch (error) {
        console.error('Error updating status:', error);
    }
}