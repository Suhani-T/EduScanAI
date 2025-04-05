document.addEventListener('DOMContentLoaded', function () {
    console.log('Script loaded');

  
    document.getElementById('feedback-link').addEventListener('click', function (e) {
        e.preventDefault();
        console.log('Feedback modal opened');
        document.getElementById('feedback-modal').style.display = 'flex';
        document.getElementById('feedback-username').focus();
    });


    document.getElementById('close-feedback').addEventListener('click', function () {
        console.log('Feedback modal closed with ✖ button');
        document.getElementById('feedback-modal').style.display = 'none';
    });

   
    document.getElementById('feedback-modal').addEventListener('click', function (e) {
        if (e.target === this) {
            console.log('Feedback modal closed by clicking outside');
            document.getElementById('feedback-modal').style.display = 'none';
        }
    });

    
    document.getElementById('feedbackFormfooter').addEventListener('submit', function (e) {
        e.preventDefault();
       
       
        console.log('Modal still visible?', document.getElementById('feedback-modal').style.display);

        const username = document.getElementById('feedback-username').value.trim();
        const email = document.getElementById('feedback-email').value.trim();
        const type = document.getElementById('feedback-type').value;
        const message = document.getElementById('feedback-text').value.trim();

        console.log({ username, email, type, message });

        const formData = { username, email, type, message };

        if (!formData.username || !formData.email || !formData.type || !formData.message) {
            // alert('Please fill in all fields');
            alert(window.TRANSLATABLE_MESSAGES.feed_all_fields);
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            // alert('Please enter a valid email address');
            alert(window.TRANSLATABLE_MESSAGES.feed_valid_email);
            return;
        }

        const csrfToken = getCookie('csrftoken');
        console.log('Sending fetch with CSRF:', csrfToken);

        fetch('/submit-feedback/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            console.log('Raw response:', response);
            return response.json();
        })
        .then(data => {
            console.log('Response data:', data);
            if (data.success) {
                // alert(`Thank you for your feedback, ${formData.username}!`);
                const message = window.TRANSLATABLE_MESSAGES.feed_thanks.replace('{username}', formData.username);
                document.getElementById('feedback-modal').style.display = 'none';
                document.getElementById('feedbackFormfooter').reset();
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => {
            console.error(' Fetch error:', error);
            // alert('There was an error submitting your feedback. Please try again.');
            alert(window.TRANSLATABLE_MESSAGES.feed_error_submitting);
        });
    });
});


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
