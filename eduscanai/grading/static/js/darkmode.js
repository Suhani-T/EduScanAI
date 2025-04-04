document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const icon = darkModeToggle.querySelector('i');
    const text = darkModeToggle.querySelector('.dark-mode-text') || document.createElement('span');
    

    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = localStorage.getItem('theme') || (systemPrefersDark ? 'dark' : 'light');
    
        if (currentTheme === 'dark') {
        enableDarkMode(darkModeToggle, icon, text, false);
    }

    
    darkModeToggle.addEventListener('click', function(e) {
        
        createRippleEffect(this, e);
        
    
        if (document.body.classList.contains('dark-mode')) {
            disableDarkMode(darkModeToggle, icon, text);
        } else {
            enableDarkMode(darkModeToggle, icon, text, true);
        }
    });
});
//ripple js
function createRippleEffect(button, event) {
    const ripple = document.createElement('span');
    ripple.classList.add('dark-mode-ripple');
    
    const rect = button.getBoundingClientRect();
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

function enableDarkMode(button, icon, text, animate = true) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    
    
    icon.classList.replace('bi-moon-fill', 'bi-sun-fill');
    if (text) text.textContent = 'Light Mode';
    

    if (animate) {
        icon.style.animation = 'sunPulse 0.5s ease';
        setTimeout(() => {
            icon.style.animation = 'sunPulse 2s infinite';
        }, 500);
    }
}

function disableDarkMode(button, icon, text, animate = true) {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    

    icon.classList.replace('bi-sun-fill', 'bi-moon-fill');
    if (text) text.textContent = 'Dark Mode';
    
    
    if (animate) {
        icon.style.animation = 'moonFloat 0.5s ease';
        setTimeout(() => {
            icon.style.animation = 'moonFloat 3s infinite ease-in-out';
        }, 500);
    }
}
