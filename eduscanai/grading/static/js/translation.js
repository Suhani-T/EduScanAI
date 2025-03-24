function translatePage(targetLang) {
    let elements = document.querySelectorAll("h1, h2, h3, p, button, label, a, input, textarea, small.text-muted, div.step-title, div.step-description, div, h2.headings, #message");
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
                } else {
                    el.innerHTML = data.translations[index]; 
                }
            });
        }
    })
    .catch(error => console.error("Error:", error));
}

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