// ARCHIVED: Original Spice Dust Particle System with circular dots
// Date archived: 2024
// To restore: Replace the particle system section in assets/script.js with this code

// Spice Dust Particle System with drink-based colors
(function initSpiceDust() {
    const canvas = document.getElementById('spice-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];

    const PARTICLE_COUNT = 200;

    // Logo colors for each drink - theme awarthree for accessibility
    const drinkLogoColorsLight = {
        'default': '#2d2926',      // Charcoal ink (original)
        'pour-over': '#8a6035',    // Darker amber for light bg
        'cappuccino': '#4a2a1a',   // Dark espresso
        'latte': '#6b4d35',        // Darker milky coffee
        'mocha': '#3d2015',        // Dark chocolate coffee
        'hot-chocolate': '#351a10', // Rich chocolate
        'matcha-latte': '#4a5c30', // Darker matcha green
        'moroccan-mint': '#3d5a3d', // Darker mint
        'something-different': '#8a4a5a' // Darker dusty rose
    };

    const drinkLogoColorsDark = {
        'default': '#d4cdc5',      // Light warm gray
        'pour-over': '#d4a870',    // Light amber
        'cappuccino': '#c4a080',   // Light espresso cream
        'latte': '#c9b090',        // Light milky coffee
        'mocha': '#b08060',        // Light chocolate
        'hot-chocolate': '#c49070', // Light cocoa
        'matcha-latte': '#9ab070', // Light matcha
        'moroccan-mint': '#80b080', // Light mint
        'something-different': '#d4a0b0' // Light rose
    };

    // Mobile navbar colors for each drink (5 colors for 5 buttons)
    const drinkNavbarColors = {
        'default': ['#2D5B69', '#722F37', '#C08497', '#CD7F32', '#E8A317'], // teal, burgundy, rose, bronze, saffron
        'pour-over': ['#8a6035', '#c28c50', '#d4a870', '#b8860b', '#daa520'],
        'cappuccino': ['#4a2a1a', '#6b4423', '#8b5a2b', '#a0522d', '#cd853f'],
        'latte': ['#6b4d35', '#8b7355', '#a08060', '#c4a484', '#d2b48c'],
        'mocha': ['#3d2015', '#5c3317', '#6b4423', '#8b4513', '#a0522d'],
        'hot-chocolate': ['#351a10', '#4a2c2a', '#6b4423', '#8b4513', '#cd853f'],
        'matcha-latte': ['#4a5c30', '#6b8e23', '#7cba3d', '#8fbc8f', '#9acd32'],
        'moroccan-mint': ['#3d5a3d', '#4a7c59', '#5f9e6e', '#71bc78', '#90ee90'],
        'something-different': ['#8a4a5a', '#b06070', '#c08497', '#d4a0b0', '#e6b8c2']
    };

    // Helper to get current theme
    function getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    // Get the appropriate logo color based on theme
    function getLogoColor(drinkId) {
        const theme = getCurrentTheme();
        const colors = theme === 'dark' ? drinkLogoColorsDark : drinkLogoColorsLight;
        return colors[drinkId] || colors['default'];
    }

    // Color palettes for each drink
    const drinkSpiceColors = {
        'default': [
            { r: 232, g: 163, b: 23 },   // Saffron
            { r: 114, g: 47, b: 55 },    // Burgundy/Paprika
            { r: 210, g: 105, b: 30 },   // Cinnamon
            { r: 192, g: 132, b: 151 },  // Dusty Rose
            { r: 139, g: 115, b: 85 },   // Olive/Brown
            { r: 204, g: 85, b: 0 },     // Burnt Orange
        ],
        'pour-over': [
            { r: 194, g: 140, b: 89 },   // Light amber
            { r: 217, g: 179, b: 128 },  // Golden
            { r: 166, g: 113, b: 67 },   // Warm brown
            { r: 232, g: 200, b: 150 },  // Pale gold
            { r: 180, g: 130, b: 80 },   // Honey
        ],
        'cappuccino': [
            { r: 89, g: 51, b: 31 },     // Dark espresso
            { r: 242, g: 235, b: 224 },  // Foam white
            { r: 139, g: 90, b: 60 },    // Medium brown
            { r: 200, g: 180, b: 160 },  // Cream
            { r: 70, g: 40, b: 25 },     // Deep coffee
        ],
        'latte': [
            { r: 140, g: 97, b: 64 },    // Milky coffee
            { r: 230, g: 217, b: 199 },  // Cream swirl
            { r: 180, g: 145, b: 110 },  // Latte tan
            { r: 210, g: 190, b: 165 },  // Steamed milk
            { r: 160, g: 115, b: 80 },   // Coffee accent
        ],
        'mocha': [
            { r: 71, g: 38, b: 26 },     // Dark chocolate
            { r: 115, g: 64, b: 38 },    // Chocolate brown
            { r: 89, g: 51, b: 31 },     // Espresso
            { r: 140, g: 90, b: 60 },    // Milk chocolate
            { r: 50, g: 30, b: 20 },     // Deep cocoa
        ],
        'hot-chocolate': [
            { r: 64, g: 31, b: 20 },     // Rich chocolate
            { r: 242, g: 230, b: 217 },  // Marshmallow
            { r: 100, g: 55, b: 35 },    // Cocoa
            { r: 220, g: 200, b: 180 },  // Cream
            { r: 80, g: 45, b: 30 },     // Dark cocoa
        ],
        'matcha-latte': [
            { r: 115, g: 140, b: 77 },   // Matcha green
            { r: 230, g: 235, b: 217 },  // Oat milk
            { r: 140, g: 160, b: 100 },  // Light matcha
            { r: 90, g: 115, b: 60 },    // Deep green
            { r: 200, g: 210, b: 180 },  // Creamy green
        ],
        'moroccan-mint': [
            { r: 89, g: 128, b: 89 },    // Mint green
            { r: 204, g: 217, b: 179 },  // Light tea
            { r: 115, g: 150, b: 110 },  // Fresh mint
            { r: 70, g: 100, b: 70 },    // Deep mint
            { r: 180, g: 200, b: 160 },  // Pale green
        ],
        'something-different': [
            { r: 192, g: 115, b: 140 },  // Dusty rose
            { r: 230, g: 191, b: 153 },  // Golden accent
            { r: 170, g: 100, b: 120 },  // Mauve
            { r: 210, g: 160, b: 140 },  // Blush
            { r: 150, g: 90, b: 110 },   // Deep rose
        ]
    };

    let currentColors = drinkSpiceColors['default'];
    let targetColors = drinkSpiceColors['default'];
    const colorTransitionSpeed = 0.02;

    // Parallax effect based on scroll
    let scrollY = 0;
    let targetScrollY = 0;
    const parallaxStrength = 0.15;

    // Tab visibility - reduce updates when tab is hidden
    let isTabActive = true;
    let lastFrameTime = 0;
    const activeFrameInterval = 1000 / 60;  // 60fps
    const inactiveFrameInterval = 1000 / 10; // 10fps when inactive

    document.addEventListener('visibilitychange', () => {
        isTabActive = !document.hidden;
    });

    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY;
    }, { passive: true });

    function resize() {
        const oldWidth = canvas.width || window.innerWidth;
        const oldHeight = canvas.height || window.innerHeight;
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        canvas.width = newWidth;
        canvas.height = newHeight;

        if (particles.length > 0 && oldWidth > 0 && oldHeight > 0) {
            const scaleX = newWidth / oldWidth;
            const scaleY = newHeight / oldHeight;

            particles.forEach(p => {
                p.x *= scaleX;
                p.y *= scaleY;
                p.x = Math.max(0, Math.min(p.x, newWidth));
                p.y = Math.max(0, Math.min(p.y, newHeight));
            });
        }
    }

    function createParticle() {
        const color = currentColors[Math.floor(Math.random() * currentColors.length)];
        const baseSize = Math.random() * 4 + 2;
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: baseSize,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: Math.random() * 0.2 + 0.05,
            opacity: Math.random() * 0.25 + 0.08,
            color: { ...color },
            targetColor: { ...color },
            colorIndex: Math.floor(Math.random() * currentColors.length),
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.02 + 0.005
        };
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(createParticle());
        }
    }

    function lerpColor(current, target, t) {
        return {
            r: current.r + (target.r - current.r) * t,
            g: current.g + (target.g - current.g) * t,
            b: current.b + (target.b - current.b) * t
        };
    }

    function animate(currentTime) {
        const frameInterval = isTabActive ? activeFrameInterval : inactiveFrameInterval;
        if (currentTime - lastFrameTime < frameInterval) {
            requestAnimationFrame(animate);
            return;
        }
        lastFrameTime = currentTime;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        scrollY += (targetScrollY - scrollY) * 0.1;

        particles.forEach(p => {
            p.wobble += p.wobbleSpeed;
            p.color = lerpColor(p.color, p.targetColor, colorTransitionSpeed);

            p.x += p.speedX + Math.sin(p.wobble) * 0.2;
            p.y += p.speedY;

            if (p.y > canvas.height + 10) {
                p.y = -10;
                p.x = Math.random() * canvas.width;
                p.colorIndex = Math.floor(Math.random() * targetColors.length);
                p.targetColor = { ...targetColors[p.colorIndex] };
            }
            if (p.x > canvas.width + 10) p.x = -10;
            if (p.x < -10) p.x = canvas.width + 10;

            const depthFactor = (p.size / 6) * parallaxStrength;
            const parallaxOffsetY = scrollY * depthFactor;

            const colorStr = `rgba(${Math.round(p.color.r)}, ${Math.round(p.color.g)}, ${Math.round(p.color.b)}, ${p.opacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y - parallaxOffsetY, p.size, 0, Math.PI * 2);
            ctx.fillStyle = colorStr;
            ctx.shadowColor = colorStr;
            ctx.shadowBlur = p.size * 2;
            ctx.fill();
        });

        ctx.shadowBlur = 0;
        requestAnimationFrame(animate);
    }

    window.setSpiceColors = function(drinkId) {
        if (drinkSpiceColors[drinkId]) {
            targetColors = drinkSpiceColors[drinkId];
            particles.forEach(p => {
                p.colorIndex = Math.floor(Math.random() * targetColors.length);
                p.targetColor = { ...targetColors[p.colorIndex] };
            });
        }
    };

    let currentDrinkTheme = 'default';

    const getThemedElements = () => ({
        logos: document.querySelectorAll('.logo'),
        menuTitle: document.querySelector('#menu .section-title'),
        projectsTitle: document.querySelector('#projects .section-title'),
        teamTitle: document.querySelector('#team .section-title'),
        drinkDetailName: document.querySelector('.drink-detail-name'),
        menuSection: document.querySelector('#menu'),
        projectsSection: document.querySelector('#projects'),
        teamSection: document.querySelector('#team'),
        drinkCards: document.querySelectorAll('.drink-card'),
        projectCards: document.querySelectorAll('.project-card'),
        teamMembers: document.querySelectorAll('.team-member'),
        footerLinks: document.querySelectorAll('.footer-link'),
        themeToggle: document.querySelector('.theme-toggle'),
        mainNav: document.querySelector('.main-nav'),
        navLinks: document.querySelectorAll('.nav-link'),
        mobileNavbar: document.querySelector('.mobile-navbar'),
        mobileNavIcons: document.querySelectorAll('.mobile-nav-icon')
    });

    window.setDrinkTheme = function(drinkId) {
        currentDrinkTheme = drinkId;
        const elements = getThemedElements();
        const color = drinkId === 'default' ? '' : getLogoColor(drinkId);

        elements.logos.forEach(logo => {
            logo.style.color = color;
        });

        [elements.menuTitle, elements.projectsTitle, elements.teamTitle, elements.drinkDetailName].forEach(title => {
            if (title) {
                title.style.color = color;
            }
        });

        [elements.menuSection, elements.projectsSection, elements.teamSection].forEach(section => {
            if (section) {
                section.style.setProperty('--drink-accent', color || 'var(--dusty-rose)');
            }
        });

        elements.drinkCards.forEach(card => {
            card.style.borderColor = color || '';
        });

        elements.projectCards.forEach(card => {
            card.style.borderColor = color || '';
        });

        elements.teamMembers.forEach(member => {
            member.style.borderColor = color || '';
        });

        if (elements.themeToggle) {
            elements.themeToggle.style.borderColor = color || '';
        }

        if (elements.mainNav) {
            elements.mainNav.style.borderColor = color || '';
        }
        elements.navLinks.forEach(link => {
            if (link.classList.contains('active')) {
                link.style.color = color || '';
                link.style.borderColor = color || '';
            } else {
                link.style.color = '';
                link.style.borderColor = '';
            }
        });

        const navColors = drinkNavbarColors[drinkId] || drinkNavbarColors['default'];
        if (elements.mobileNavbar) {
            if (drinkId === 'default') {
                elements.mobileNavbar.style.borderImage = '';
                elements.mobileNavbar.style.borderColor = '';
            } else {
                elements.mobileNavbar.style.borderImage = `linear-gradient(to right, ${navColors[0]}, ${navColors[1]}, ${navColors[2]}, ${navColors[3]}, ${navColors[4]}) 1`;
            }
        }

        document.documentElement.style.setProperty('--drink-nav-color-1', navColors[0]);
        document.documentElement.style.setProperty('--drink-nav-color-2', navColors[1]);
        document.documentElement.style.setProperty('--drink-nav-color-3', navColors[2]);
        document.documentElement.style.setProperty('--drink-nav-color-4', navColors[3]);
        document.documentElement.style.setProperty('--drink-nav-color-5', navColors[4]);
    };

    window.setLogoColor = function(drinkId) {
        window.setDrinkTheme(drinkId);
    };

    const themeObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'data-theme' && currentDrinkTheme !== 'default') {
                window.setDrinkTheme(currentDrinkTheme);
            }
        });
    });
    themeObserver.observe(document.documentElement, { attributes: true });

    window.addEventListener('resize', resize);

    init();
    animate();
})();
