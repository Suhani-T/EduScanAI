document.addEventListener("DOMContentLoaded", function () {
    let isAuthenticated = false;
    let teacherEmail = '';

    function updateAuthenticateButton(isLoggedIn) {
        const authButton = document.getElementById("authenticateButton");
        if (!authButton || !window.TRANSLATABLE_MESSAGES) return;
    
        const textKey = isLoggedIn ? "logout" : "authenticate";
        authButton.textContent =
            window.TRANSLATABLE_MESSAGES[textKey] ||
            (isLoggedIn ? "Logout" : "Authenticate");
    }
    

    function updateAuthUI() {
        const authButton = document.getElementById('authenticateButton');
        const teacherEmailInput = document.getElementById('teacherEmail');
        const evaluateButton = document.getElementById('evaluateButton');

        if (isAuthenticated) {
            // authButton.textContent = 'Logout';
            updateAuthenticateButton(true);
            authButton.classList.remove('evaluate');
            authButton.classList.add('btn-gradient-danger');
            teacherEmailInput.value = teacherEmail;
            evaluateButton.disabled = false;
        } else {
            // authButton.textContent = 'Authenticate';
            updateAuthenticateButton(false);
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
    authenticateButton.addEventListener('click', function () {
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
            alert(window.TRANSLATABLE_MESSAGES.alertEnterEmail);
            return;
        }

        fetch("/send-otp/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                'X-CSRFToken': getCSRFToken()
            },
            body: `email=${encodeURIComponent(email)}`,
        })
        .then(response => response.json())
        .then(data => {
            // alert(data.message);
            if (data.status === "success") {
                alert(window.TRANSLATABLE_MESSAGES.otpSendSuccess || "OTP sent successfully!");
                emailInput.disabled = true;
            } else {
                alert(data.message); 
            }
            // if (data.status === "success") {
            //     emailInput.disabled = true;
            // }
        })
        .catch(error => {
            alert(window.TRANSLATABLE_MESSAGES.alertOtpSendError);
            console.error(error);
        });
    });

    verifyOtpButton.addEventListener("click", function () {
        const email = emailInput.value;
        const otp = otpInput.value;
        if (!otp) {
            alert(window.TRANSLATABLE_MESSAGES.alertEnterOTP);
            return;
        }

        fetch("/verify-otp/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                'X-CSRFToken': getCSRFToken()
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

                alert(window.TRANSLATABLE_MESSAGES.otpVerifiedSuccess);
            } else {
                alert(data.message || "Invalid OTP.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert(window.TRANSLATABLE_MESSAGES.alertInvalidOtp);
        });
    });

    const evaluationForm = document.getElementById('evaluationForm');
    evaluationForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!isAuthenticated) {
            alert(window.TRANSLATABLE_MESSAGES.alertAuthenticateFirst);
            return;
        }

        const teacherEmail = document.getElementById("teacherEmail").value;
        const studentEmail = document.getElementById("studentEmail").value;
        const answerKey = document.getElementById("answerKey").files[0];
        const studentScript = document.getElementById("studentScript").files[0];

        if (!teacherEmail || !studentEmail || !answerKey || !studentScript) {
            alert(window.TRANSLATABLE_MESSAGES.alertFillFields);
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
            alert(window.TRANSLATABLE_MESSAGES.errorGeneratingFeedback);
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
            alert(window.TRANSLATABLE_MESSAGES.alertFeedbackEmpty);
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
            document.getElementById("message").innerText =
                window.TRANSLATABLE_MESSAGES.resultsSent.replace('{email}', studentEmail);
        })
        .catch(error => {
            console.error("Error:", error);
            alert(window.TRANSLATABLE_MESSAGES.alertSendingFeedback);
        })
        .finally(() => {
            document.getElementById("sendFeedbackButton").disabled = false;
        });
    });

    document.getElementById("resetButton").addEventListener("click", function () {
        resetStudentInputs();
    });

    function getCSRFToken() {
        let csrfToken = document.cookie.split('; ')
            .find(row => row.startsWith('csrftoken'))
            ?.split('=')[1];

        if (!csrfToken) {
            console.error("CSRF token not found!");
            alert(window.TRANSLATABLE_MESSAGES.errorMissingCSRF);
        }

        return csrfToken;
    }
});
