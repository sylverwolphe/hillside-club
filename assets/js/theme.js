// ===== THEME TOGGLE =====
// Light/Dark theme toggle functionality

(function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
    }

    if (toggle) {
        toggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            if (newTheme === 'dark') {
                html.setAttribute('data-theme', 'dark');
            } else {
                html.removeAttribute('data-theme');
            }

            localStorage.setItem('theme', newTheme);
        });
    }
})();
