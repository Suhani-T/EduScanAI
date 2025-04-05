
if (!window.TRANSLATABLE_MESSAGES) {
    console.warn("TRANSLATABLE_MESSAGES was not initialized before translation.js ran.");
} else {
    console.log("TRANSLATABLE_MESSAGES available in translation.js:", window.TRANSLATABLE_MESSAGES);
}

const evaluateButton = document.getElementById("evaluateButton");
const sendFeedbackButton = document.getElementById("sendFeedbackButton");
const resetButton = document.getElementById("resetButton");
const feedbackText = document.getElementById("feedbackText");
const message = document.getElementById("message");
const teacherEmailInput = document.getElementById("teacherEmail");
const studentEmailInput = document.getElementById("studentEmail");
const answerKeyInput = document.getElementById("answerKey");
const studentScriptInput = document.getElementById("studentScript");




async function translateText(text, targetLang) {
    const response = await fetch('/translate/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ text: [text], target: targetLang })
    });

    const data = await response.json();
    return data.translations ? data.translations[0] : text;
}


function translatePage(targetLang) {
    return new Promise((resolve, reject) => {
        // let elements = document.querySelectorAll("h1, h2, h3, p, button, label, a, input[placeholder], textarea[placeholder], small.text-muted, .step-title, .step-description, h2.headings, #message");
        let elements = document.querySelectorAll("h1, h2, h3, p, span, button, label, a:not(.notranslate), input[placeholder], input, textarea, textarea[placeholder], small.text-muted, .step-title, .step-description, h2.headings, #message");

        let textArray = [];

        elements.forEach(el => {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                textArray.push(el.placeholder);  
            } else {
                textArray.push(el.innerHTML);
            }
        });

        const dynamicMessagesKeys = Object.keys(window.TRANSLATABLE_MESSAGES);
        const dynamicMessages = dynamicMessagesKeys.map(key => window.TRANSLATABLE_MESSAGES[key]);
        textArray = textArray.concat(dynamicMessages);

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

                dynamicMessagesKeys.forEach((key, i) => {
                    window.TRANSLATABLE_MESSAGES[key] = data.translations[elements.length + i];
                });

                console.log("TRANSLATABLE_MESSAGES updated:", window.TRANSLATABLE_MESSAGES);


                rebindEventListeners();
                resolve();
            }
        })
        .catch(error => {
            console.error("Error:", error)
            reject(error)
        });
    });
}

function rebindEventListeners() {
    // document.getElementById("evaluateButton").addEventListener("click", evaluateScript);
    // document.getElementById("sendFeedbackButton").addEventListener("click", sendFeedback);
    // document.getElementById("resetButton").addEventListener("click", resetStudentInputs);


    let evaluateBtn = document.getElementById("evaluateButton");
    let sendFeedbackBtn = document.getElementById("sendFeedbackButton");
    let resetBtn = document.getElementById("resetButton");

    // if (evaluateBtn) evaluateBtn.addEventListener("click", evaluateScript);
    // if (sendFeedbackBtn) sendFeedbackBtn.addEventListener("click", sendFeedback);
    // if (resetBtn) resetBtn.addEventListener("click", resetStudentInputs);

    if (evaluateBtn) {
        evaluateBtn.replaceWith(evaluateBtn.cloneNode(true));
        evaluateBtn = document.getElementById("evaluateButton");
        evaluateBtn.addEventListener("click", evaluateScript);
    }

    if (sendFeedbackBtn) {
        sendFeedbackBtn.replaceWith(sendFeedbackBtn.cloneNode(true));
        sendFeedbackBtn = document.getElementById("sendFeedbackButton");
        sendFeedbackBtn.addEventListener("click", sendFeedback);
    }

    if (resetBtn) {
        resetBtn.replaceWith(resetBtn.cloneNode(true));
        resetBtn = document.getElementById("resetButton");
        resetBtn.addEventListener("click", resetStudentInputs);
    }
}

function evaluateScript() {
    console.log("Evaluate button clicked!");
    const teacherEmail =teacherEmailInput.value;
    const studentEmail= studentEmailInput.value;
    const answerKey = answerKeyInput.files[0];
    const studentScript = studentScriptInput.files[0];
    const customPromptInput = document.getElementById("customPrompt");
    const customPrompt = customPromptInput ? customPromptInput.value.trim() : "";

    console.log("Custom Prompt Sent:", customPrompt)
    if (!customPrompt) {
        console.warn("Custom Prompt is empty!");
    }

    if (!teacherEmail || !studentEmail || !answerKey || !studentScript) {
        // alert("Please fill all fields and upload the required files.");
        alert(window.TRANSLATABLE_MESSAGES.alertFillFields);
        return;
    }


    let formData = new FormData();
    formData.append("teacher_email", teacherEmail);
    formData.append("student_email", studentEmail);
    formData.append("answer_key", answerKey);
    formData.append("student_script", studentScript);
    formData.set("custom_prompt", customPrompt);

    evaluateButton.disabled = true; 
    document.getElementById("evaluateLoader").style.display = "inline-block"; 

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
        // alert("Error generating feedback.");
        alert(window.TRANSLATABLE_MESSAGES.errorGeneratingFeedback);
    })
    .finally(() => {
        evaluateButton.disabled = false; 
        document.getElementById("evaluateLoader").style.display = "none";
    });
}

function sendFeedback() {
    console.log("Send feedback button clicked!");
    const teacherEmail = teacherEmailInput.value;
    const studentEmail = studentEmailInput.value;
    const feedback = feedbackText.value;

    if (!feedback.trim()) {
        // alert("Feedback cannot be empty.");
        console.log("eedback empty alert text (at time of click):", window.TRANSLATABLE_MESSAGES.alertFeedbackEmpty);
        alert(window.TRANSLATABLE_MESSAGES.alertFeedbackEmpty || "Feedback cannot be empty.");
        feedbackText.style.border = "2px solid red";
        return;
    }

    sendFeedbackButton.disabled = true; 
    document.getElementById("sendLoader").style.display = "inline-block";

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
        // message.innerText = `Results sent to ${studentEmail}`;
        message.innerText = window.TRANSLATABLE_MESSAGES.resultSent.replace("{email}", studentEmail);
        // message.innerText = translate("resultSent", { email: studentEmail });

    })
    .catch(error => {
        console.error("Error:", error);
        // alert("Error sending feedback.");
        alert(window.TRANSLATABLE_MESSAGES.errorSendingFeedback);
    })
    .finally(() => {
        sendFeedbackButton.disabled = false; 
        document.getElementById("sendLoader").style.display = "none";
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
        // alert("Error: CSRF token missing. Please refresh the page.");
        alert(window.TRANSLATABLE_MESSAGES.errorMissingCSRF);
    }

    return csrfToken;
}

document.addEventListener("DOMContentLoaded", () => {
    rebindEventListeners();
});