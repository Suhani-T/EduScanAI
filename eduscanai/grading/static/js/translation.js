function translatePage(targetLang) {
    // let elements = document.querySelectorAll("h1, h2, h3, p, button, label, a, input[placeholder], textarea[placeholder], small.text-muted, .step-title, .step-description, h2.headings, #message");
    let elements = document.querySelectorAll("h1, h2, h3, p, button, label, a, input[placeholder], input, textarea, textarea[placeholder], small.text-muted, .step-title, .step-description, h2.headings, #message");

    let textArray = [];

    elements.forEach(el => {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            textArray.push(el.placeholder);  
        } else {
            textArray.push(el.innerHTML);
        }
    });

    fetch('/translate/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ text: textArray, target: targetLang })
    })
    .then(response => response.json())
    .then(data => {
        if (data.translations) {
            elements.forEach((el, index) => {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = data.translations[index];  
                } 
                else {
                    el.innerHTML = data.translations[index]; 
                }
            });
            rebindEventListeners();
        }
    })
    .catch(error => console.error("Error:", error));
}

function rebindEventListeners() {
    // document.getElementById("evaluateButton").addEventListener("click", evaluateScript);
    // document.getElementById("sendFeedbackButton").addEventListener("click", sendFeedback);
    // document.getElementById("resetButton").addEventListener("click", resetStudentInputs);


    let evaluateBtn = document.getElementById("evaluateButton");
    let sendFeedbackBtn = document.getElementById("sendFeedbackButton");
    let resetBtn = document.getElementById("resetButton");

    if (evaluateBtn) evaluateBtn.addEventListener("click", evaluateScript);
    if (sendFeedbackBtn) sendFeedbackBtn.addEventListener("click", sendFeedback);
    if (resetBtn) resetBtn.addEventListener("click", resetStudentInputs);
}

function evaluateScript() {
    console.log("Evaluate button clicked!");
    const teacherEmail =teacherEmailInput.value;
    const studentEmail= studentEmailInput.value;
    const answerKey = answerKeyInput.files[0];
    const studentScript = studentScriptInput.files[0];

    if (!teacherEmail || !studentEmail || !answerKey || !studentScript) {
        alert("Please fill all fields and upload the required files.");
        return;
    }


    let formData = new FormData();
    formData.append("teacher_email", teacherEmail);
    formData.append("student_email", studentEmail);
    formData.append("answer_key", answerKey);
    formData.append("student_script", studentScript);

    evaluateButton.disabled = true; 

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
        feedbackText.value = data.feedback;
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error generating feedback.");
    })
    .finally(() => {
        evaluateButton.disabled = false; 
    });
}

function sendFeedback() {
    console.log("Send feedback button clicked!");
    const teacherEmail = teacherEmailInput.value;
    const studentEmail = studentEmailInput.value;
    const feedback = feedbackText.value;

    if (!feedback.trim()) {
        alert("Feedback cannot be empty.");
        feedbackText.style.border = "2px solid red";
        return;
    }

    sendFeedbackButton.disabled = true; 
    feedbackText.style.border = "";

    fetch("/send-feedback/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_email: teacherEmail, student_email: studentEmail, feedback: feedback }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to send feedback.");
        }
        return response.json();
    })
    .then(data => {
        message.innerText = `Results sent to ${studentEmail}`;
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error sending feedback.");
    })
    .finally(() => {
        sendFeedbackButton.disabled = false; 
    });
}

function resetStudentInputs() {
    document.getElementById("studentEmail").value = "";
    document.getElementById("studentScript").value = "";
}


document.addEventListener("DOMContentLoaded", rebindEventListeners);

function getCSRFToken() {
    let csrfToken = document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken'))
        ?.split('=')[1];

    if (!csrfToken) {
        console.error("CSRF token not found!");
        alert("Error: CSRF token missing. Please refresh the page.");
    }

    return csrfToken;
}