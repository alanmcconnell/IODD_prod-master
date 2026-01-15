// Shared footer content for all IODD pages
document.addEventListener('DOMContentLoaded', function() {
    const footer = document.querySelector('.footer .footer-links');
    if (footer) {
        footer.innerHTML = `
            <a href="privacy-policy.html"   target="_blank">Privacy Policy</a>&nbsp;&nbsp;&nbsp;
            <a href="terms-of-service.html" target="_blank">Terms of Service Contract</a>&nbsp;&nbsp;&nbsp;(c)&nbsp;2025&nbsp;&nbsp;&nbsp;
            <a href="group.html"            target="_blank">IODD Group</a>.&nbsp;&nbsp;&nbsp;All&nbsp;rights&nbsp;reserved.&nbsp;&nbsp;&nbsp;Licensed&nbsp;under&nbsp;
            <a href="http://creativecommons.org/licenses/by-nc/4.0/" target="_blank">Creative Commons Attribution-NonCommercial (CC BY-NC-ND)</a>
        `;
    }
});