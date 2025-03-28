console.log("evaluation.js loaded successfully!");

document.addEventListener("DOMContentLoaded", function () {
    const evaluateButton = document.getElementById("evaluateButton");
    const sendFeedbackButton=document.getElementById("sendFeedbackButton");
    const resetButton = document.getElementById("resetButton");
    const feedbackText= document.getElementById("feedbackText");
    const message = document.getElementById("message");
    const teacherEmailInput =document.getElementById("teacherEmail");
    const studentEmailInput= document.getElementById("studentEmail");
    const answerKeyInput= document.getElementById("answerKey");
    const studentScriptInput = document.getElementById("studentScript");

    evaluateButton.addEventListener("click", function (e) {
        e.preventDefault();
        const teacherEmail =teacherEmailInput.value;
        const studentEmail= studentEmailInput.value;
        const answerKey = answerKeyInput.files[0];
        const studentScript = studentScriptInput.files[0];
        // const customPrompt = document.getElementById("customPrompt").value.trim(); /////////////
        const customPromptInput = document.getElementById("customPrompt");
        const customPrompt = customPromptInput ? customPromptInput.value.trim() : "";


        console.log("Custom Prompt Sent:", customPrompt)
        if (!customPrompt) {
            console.warn("Custom Prompt is empty!");
        }

        if (!teacherEmail || !studentEmail || !answerKey || !studentScript) {
            alert("Please fill all fields and upload the required files.");
            return;
        }


        let formData = new FormData();
        formData.append("teacher_email", teacherEmail);
        formData.append("student_email", studentEmail);
        formData.append("answer_key", answerKey);
        formData.append("student_script", studentScript);
        // formData.append("custom_prompt", customPrompt);
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
            alert("Error generating feedback.");
        })
        .finally(() => {
            evaluateButton.disabled = false; 
            evaluateButton.disabled = false;
            document.getElementById("evaluateLoader").style.display = "none";
        });
    });




    
    sendFeedbackButton.addEventListener("click", function () {
        const teacherEmail = teacherEmailInput.value;
        const studentEmail = studentEmailInput.value;
        const feedback = feedbackText.value;
    
        if (!feedback.trim()) {
            alert("Feedback cannot be empty.");
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
            message.innerText = `Results sent to ${studentEmail}`;
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error sending feedback.");
        })
        .finally(() => {
            sendFeedbackButton.disabled = false; 
            document.getElementById("sendLoader").style.display = "none";
        });
    });

    resetButton.addEventListener("click", function () {
        feedbackText.value = "";
        message.innerText = "";
        // teacherEmailInput.value = "";
        studentEmailInput.value = "";
        // answerKeyInput.value = "";
        studentScriptInput.value = "";
        // document.getElementById("customPrompt").value = "";
        feedbackText.style.border = ""; 
        document.getElementById("studentScriptPreview").innerHTML = "";
    });
});
