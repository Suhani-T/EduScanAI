document.addEventListener("DOMContentLoaded", function () {
            
    let isAuthenticated = false;
    let teacherEmail = '';


    function updateAuthUI() {
        const authButton = document.getElementById('authenticateButton');
        const teacherEmailInput = document.getElementById('teacherEmail');
        const evaluateButton = document.getElementById('evaluateButton');
        
        if (isAuthenticated) {
            authButton.textContent = 'Logout';
            authButton.classList.remove('evaluate');
            authButton.classList.add('btn-gradient-danger');
            teacherEmailInput.value = teacherEmail;
            evaluateButton.disabled = false; 
        } else {
            authButton.textContent = 'Authenticate';
            authButton.classList.remove('btn-gradient-danger');
            authButton.classList.add('evaluate');
            teacherEmailInput.value = '';
            evaluateButton.disabled = true; 
            resetAllForms(); 
        }
    }

    
    function resetAllForms() {
    
        document.getElementById("studentEmail").value = "";
        document.getElementById("answerKey").value = "";
        document.getElementById("studentScript").value = "";
        
    
        document.getElementById("feedbackText").value = "";
        document.getElementById("message").innerText = "";
        
    
        document.getElementById("emailInput").value = "";
        document.getElementById("otpInput").value = "";
        document.getElementById("emailInput").disabled = false;

        document.getElementById("studentScriptPreview").innerHTML = "";
    }

    
    if (sessionStorage.getItem('isAuthenticated') === 'true') {
        isAuthenticated = true;
        teacherEmail = sessionStorage.getItem('teacherEmail') || '';
        updateAuthUI();
    }

    
    function scrollToSection(sectionId) {
        let section = document.getElementById(sectionId);
        let offset = 70; 
        let sectionPosition = section.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: sectionPosition, behavior: "smooth" });
    }

    
    const authenticateButton = document.getElementById('authenticateButton');
    authenticateButton.addEventListener('click', function() {
        if (isAuthenticated) {
            
            isAuthenticated = false;
            teacherEmail = '';
            sessionStorage.removeItem('isAuthenticated');
            sessionStorage.removeItem('teacherEmail');
            updateAuthUI();
        } else {
        
            const otpModal = new bootstrap.Modal(document.getElementById('otpModal'));
            otpModal.show();
        }
    });

    
    const sendOtpButton = document.getElementById("sendOtpButton");
    const verifyOtpButton = document.getElementById("verifyOtpButton");
    const emailInput = document.getElementById("emailInput");
    const otpInput = document.getElementById("otpInput");

    sendOtpButton.addEventListener('click', function () {
        const email = emailInput.value;
        if (!email) {
            alert('Please enter your email.');
            return;
        }

    
        const csrfToken = document.querySelector('[name=csrf-token]').content; 

        
        fetch("/send-otp/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                'X-CSRFToken': csrfToken
            },
            body: `email=${encodeURIComponent(email)}`,
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.status === "success") {
                
                emailInput.disabled = true;
            }
        })
        .catch(error => {
            alert("There was an error sending the OTP.");
            console.error(error);
        });
    });

    verifyOtpButton.addEventListener("click", function () {
        const email = emailInput.value;
        const otp = otpInput.value;
        if (!otp) {
            alert("Please enter the OTP.");
            return;
        }

        
        fetch("/verify-otp/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                'X-CSRFToken': document.querySelector('[name=csrf-token]').content
            },
            body: `email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                
                isAuthenticated = true;
                teacherEmail = email;
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('teacherEmail', email);
                updateAuthUI();
                
                
                const otpModal = bootstrap.Modal.getInstance(document.getElementById('otpModal'));
                otpModal.hide();
                emailInput.disabled = false;
                emailInput.value = '';
                otpInput.value = '';
                
                alert("OTP verified successfully!");
            } else {
                alert(data.message || "Invalid OTP.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("There was an error verifying the OTP.");
        });
    });

    
    const evaluationForm = document.getElementById('evaluationForm');
    evaluationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!isAuthenticated) {
            alert("Please authenticate first!");
            return;
        }

        const teacherEmail = document.getElementById("teacherEmail").value;
        const studentEmail = document.getElementById("studentEmail").value;
        const answerKey = document.getElementById("answerKey").files[0];
        const studentScript = document.getElementById("studentScript").files[0];

        if (!teacherEmail || !studentEmail || !answerKey || !studentScript) {
            alert("Please fill all fields and upload the required files.");
            return;
        }

        let formData = new FormData();
        formData.append("teacher_email", teacherEmail);
        formData.append("student_email", studentEmail);
        formData.append("answer_key", answerKey);
        formData.append("student_script", studentScript);

        document.getElementById("evaluateButton").disabled = true;

        fetch("/evaluate/", {
            method: "POST",
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to evaluate script.");
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("feedbackText").value = data.feedback;
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error generating feedback.");
        })
        .finally(() => {
            document.getElementById("evaluateButton").disabled = false;
        });
    });

    
    document.getElementById("sendFeedbackButton").addEventListener("click", function () {
        const teacherEmail = document.getElementById("teacherEmail").value;
        const studentEmail = document.getElementById("studentEmail").value;
        const feedback = document.getElementById("feedbackText").value;

        if (!feedback.trim()) {
            alert("Feedback cannot be empty.");
            document.getElementById("feedbackText").style.border = "2px solid red";
            return;
        }

        document.getElementById("sendFeedbackButton").disabled = true;
        document.getElementById("feedbackText").style.border = "";

        fetch("/send-feedback/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                teacher_email: teacherEmail, 
                student_email: studentEmail, 
                feedback: feedback 
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to send feedback.");
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("message").innerText = `Results sent to ${studentEmail}`;
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error sending feedback.");
        })
        .finally(() => {
            document.getElementById("sendFeedbackButton").disabled = false;
        });
    });

    
    document.getElementById("resetButton").addEventListener("click", function () {
        resetStudentInputs();
    });
});