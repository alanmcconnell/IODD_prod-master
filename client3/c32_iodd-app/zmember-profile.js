document.addEventListener('DOMContentLoaded', function() {
    // Get the URL parameters
    const urlParams = new URLSearchParams(window.location.search);

    // Get the value of the 'memberNo' parameter.
    // You can open this page with a URL like: Member-Profile.html?memberNo=123
    const memberNo = urlParams.get('memberNo');

    // Find the textbox by its ID
    const memberNoTextbox = document.getElementById('txtMemberNO');

    // If the 'memberNo' parameter exists and the textbox element is found, set the textbox value.
    if (memberNo && memberNoTextbox) {
        memberNoTextbox.value = memberNo;
        console.log(`Member number set to: ${memberNo}`);
    } else {
        console.log('The "memberNo" URL parameter was not found, or the "txtMemberNO" element does not exist.');
    }
});