// ===== MULTI-MODE PARTICLE SYSTEM =====
// Modes: 'dots', 'diamonds', 'steam', 'dust', 'grounds'
// Includes drink-based color theming

(function initParticleSystem() {
    const canvas = document.getElementById('spice-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];

    // Current particle mode - can be toggled
    let particleMode = 'diamonds'; // 'dots', 'diamonds', 'steam', 'dust', 'grounds'

    // Get particle count from config or use defaults
    function getParticleCount(mode) {
        if (window.particleConfig && window.particleConfig.global) {
            return window.particleConfig.global.particleCount[mode] || 150;
        }
        return { dots: 200, diamonds: 200, steam: 120, dust: 150, grounds: 100 }[mode] || 150;
    }

    // Get config value with fallback
    function getConfig(mode, key, fallback) {
        if (window.particleConfig && window.particleConfig[mode]) {
            return window.particleConfig[mode][key] !== undefined ? window.particleConfig[mode][key] : fallback;
        }
        return fallback;
    }

    function getGlobalConfig(key, fallback) {
        if (window.particleConfig && window.particleConfig.global) {
            return window.particleConfig.global[key] !== undefined ? window.particleConfig.global[key] : fallback;
        }
        return fallback;
    }

    // Logo colors for each drink - theme aware for accessibility
    const drinkLogoColorsLight = {
        'default': '#2d2926',
        'pour-over': '#8a6035',
        'cappuccino': '#4a2a1a',
        'latte': '#6b4d35',
        'mocha': '#3d2015',
        'hot-chocolate': '#351a10',
        'matcha-latte': '#4a5c30',
        'moroccan-mint': '#3d5a3d',
        'something-different': '#8a4a5a'
    };

    const drinkLogoColorsDark = {
        'default': '#d4cdc5',
        'pour-over': '#d4a870',
        'cappuccino': '#c4a080',
        'latte': '#c9b090',
        'mocha': '#b08060',
        'hot-chocolate': '#c49070',
        'matcha-latte': '#9ab070',
        'moroccan-mint': '#80b080',
        'something-different': '#d4a0b0'
    };

    // Mobile navbar colors for each drink (5 colors for 5 buttons)
    const drinkNavbarColors = {
        'default': ['#6B5740', '#D2691E', '#C08497', '#CD7F32', '#E8A317'],
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
    window.getLogoColor = function(drinkId) {
        const theme = getCurrentTheme();
        const colors = theme === 'dark' ? drinkLogoColorsDark : drinkLogoColorsLight;
        return colors[drinkId] || colors['default'];
    };

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
            { r: 194, g: 140, b: 89 },
            { r: 217, g: 179, b: 128 },
            { r: 166, g: 113, b: 67 },
            { r: 232, g: 200, b: 150 },
            { r: 180, g: 130, b: 80 },
        ],
        'cappuccino': [
            { r: 89, g: 51, b: 31 },
            { r: 242, g: 235, b: 224 },
            { r: 139, g: 90, b: 60 },
            { r: 200, g: 180, b: 160 },
            { r: 70, g: 40, b: 25 },
        ],
        'latte': [
            { r: 140, g: 97, b: 64 },
            { r: 230, g: 217, b: 199 },
            { r: 180, g: 145, b: 110 },
            { r: 210, g: 190, b: 165 },
            { r: 160, g: 115, b: 80 },
        ],
        'mocha': [
            { r: 71, g: 38, b: 26 },
            { r: 115, g: 64, b: 38 },
            { r: 89, g: 51, b: 31 },
            { r: 140, g: 90, b: 60 },
            { r: 50, g: 30, b: 20 },
        ],
        'hot-chocolate': [
            { r: 64, g: 31, b: 20 },
            { r: 242, g: 230, b: 217 },
            { r: 100, g: 55, b: 35 },
            { r: 220, g: 200, b: 180 },
            { r: 80, g: 45, b: 30 },
        ],
        'matcha-latte': [
            { r: 115, g: 140, b: 77 },
            { r: 230, g: 235, b: 217 },
            { r: 140, g: 160, b: 100 },
            { r: 90, g: 115, b: 60 },
            { r: 200, g: 210, b: 180 },
        ],
        'moroccan-mint': [
            { r: 89, g: 128, b: 89 },
            { r: 204, g: 217, b: 179 },
            { r: 115, g: 150, b: 110 },
            { r: 70, g: 100, b: 70 },
            { r: 180, g: 200, b: 160 },
        ],
        'something-different': [
            { r: 192, g: 115, b: 140 },
            { r: 230, g: 191, b: 153 },
            { r: 170, g: 100, b: 120 },
            { r: 210, g: 160, b: 140 },
            { r: 150, g: 90, b: 110 },
        ]
    };

    let currentColors = drinkSpiceColors['default'];
    let targetColors = drinkSpiceColors['default'];

    // Color transition speed from config
    function getColorTransitionSpeed() {
        return getGlobalConfig('colorTransitionSpeed', 0.02);
    }

    // Parallax effect based on scroll
    let scrollY = 0;
    let targetScrollY = 0;

    // Parallax strength from config
    function getParallaxStrength() {
        return getGlobalConfig('parallaxStrength', 0.15);
    }

    // Tab visibility - reduce updates when tab is hidden
    let isTabActive = true;
    let lastFrameTime = 0;
    const activeFrameInterval = 1000 / 60;
    const inactiveFrameInterval = 1000 / 10;

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

    // Update cached RGB string if color changed (avoids string allocation every frame)
    function updateColorCache(p) {
        const r = Math.round(p.color.r);
        const g = Math.round(p.color.g);
        const b = Math.round(p.color.b);
        if (r !== p.cachedR || g !== p.cachedG || b !== p.cachedB) {
            p.cachedR = r;
            p.cachedG = g;
            p.cachedB = b;
            p.rgbPrefix = `rgba(${r},${g},${b},`;
        }
    }

    function createParticle(randomizeLife = true) {
        const color = currentColors[Math.floor(Math.random() * currentColors.length)];
        const r = Math.round(color.r);
        const g = Math.round(color.g);
        const b = Math.round(color.b);

        const particle = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            color: { ...color },
            targetColor: { ...color },
            colorIndex: Math.floor(Math.random() * currentColors.length),
            // Cached color string components
            cachedR: r,
            cachedG: g,
            cachedB: b,
            rgbPrefix: `rgba(${r},${g},${b},`
        };

        if (particleMode === 'dots') {
            const sizeMin = getConfig('dots', 'sizeMin', 2);
            const sizeMax = getConfig('dots', 'sizeMax', 6);
            const speedX = getConfig('dots', 'speedX', 0.3);
            const speedYMin = getConfig('dots', 'speedYMin', 0.05);
            const speedYMax = getConfig('dots', 'speedYMax', 0.25);
            const opacityMin = getConfig('dots', 'opacityMin', 0.08);
            const opacityMax = getConfig('dots', 'opacityMax', 0.33);
            const wobbleSpeedMax = getConfig('dots', 'wobbleSpeed', 0.02);

            particle.size = Math.random() * (sizeMax - sizeMin) + sizeMin;
            particle.speedX = (Math.random() - 0.5) * speedX;
            particle.speedY = Math.random() * (speedYMax - speedYMin) + speedYMin;
            particle.opacity = Math.random() * (opacityMax - opacityMin) + opacityMin;
            particle.wobble = Math.random() * Math.PI * 2;
            particle.wobbleSpeed = Math.random() * wobbleSpeedMax + 0.005;
        } else if (particleMode === 'diamonds') {
            const sizeMin = getConfig('diamonds', 'sizeMin', 2);
            const sizeMax = getConfig('diamonds', 'sizeMax', 6);
            const speedX = getConfig('diamonds', 'speedX', 0.3);
            const speedYMin = getConfig('diamonds', 'speedYMin', 0.05);
            const speedYMax = getConfig('diamonds', 'speedYMax', 0.25);
            const opacityMin = getConfig('diamonds', 'opacityMin', 0.08);
            const opacityMax = getConfig('diamonds', 'opacityMax', 0.33);
            const wobbleSpeedMax = getConfig('diamonds', 'wobbleSpeed', 0.02);

            particle.size = Math.random() * (sizeMax - sizeMin) + sizeMin;
            particle.speedX = (Math.random() - 0.5) * speedX;
            particle.speedY = Math.random() * (speedYMax - speedYMin) + speedYMin;
            particle.opacity = Math.random() * (opacityMax - opacityMin) + opacityMin;
            particle.wobble = Math.random() * Math.PI * 2;
            particle.wobbleSpeed = Math.random() * wobbleSpeedMax + 0.005;
            particle.rotation = Math.random() * Math.PI * 2;
        } else if (particleMode === 'steam') {
            const sizeMin = getConfig('steam', 'sizeMin', 3);
            const sizeMax = getConfig('steam', 'sizeMax', 9);
            const speedYMin = getConfig('steam', 'speedYMin', 0.2);
            const speedYMax = getConfig('steam', 'speedYMax', 0.6);
            const curlSpeedMin = getConfig('steam', 'curlSpeedMin', 0.003);
            const curlSpeedMax = getConfig('steam', 'curlSpeedMax', 0.011);
            const curlAmpMin = getConfig('steam', 'curlAmplitudeMin', 20);
            const curlAmpMax = getConfig('steam', 'curlAmplitudeMax', 60);
            const maxLifeMin = getConfig('steam', 'maxLifeMin', 300);
            const maxLifeMax = getConfig('steam', 'maxLifeMax', 700);

            particle.size = Math.random() * (sizeMax - sizeMin) + sizeMin;
            particle.originalSize = particle.size;
            particle.y = canvas.height + Math.random() * 50;
            particle.speedY = -(Math.random() * (speedYMax - speedYMin) + speedYMin);
            particle.curlOffset = Math.random() * Math.PI * 2;
            particle.curlSpeed = Math.random() * (curlSpeedMax - curlSpeedMin) + curlSpeedMin;
            particle.curlAmplitude = Math.random() * (curlAmpMax - curlAmpMin) + curlAmpMin;
            particle.life = randomizeLife ? Math.floor(Math.random() * 400) : 0;
            particle.maxLife = Math.random() * (maxLifeMax - maxLifeMin) + maxLifeMin;
        } else if (particleMode === 'dust') {
            const sizeMin = getConfig('dust', 'sizeMin', 1.5);
            const sizeMax = getConfig('dust', 'sizeMax', 4.5);
            const opacityMin = getConfig('dust', 'opacityMin', 0.15);
            const opacityMax = getConfig('dust', 'opacityMax', 0.5);
            const speedX = getConfig('dust', 'speedX', 0.4);
            const speedY = getConfig('dust', 'speedY', 0.15);
            const swirlSpeedMin = getConfig('dust', 'swirlSpeedMin', 0.005);
            const swirlSpeedMax = getConfig('dust', 'swirlSpeedMax', 0.015);
            const swirlRadiusMin = getConfig('dust', 'swirlRadiusMin', 5);
            const swirlRadiusMax = getConfig('dust', 'swirlRadiusMax', 20);

            particle.size = Math.random() * (sizeMax - sizeMin) + sizeMin;
            particle.opacity = Math.random() * (opacityMax - opacityMin) + opacityMin;
            particle.speedX = (Math.random() - 0.5) * speedX;
            particle.speedY = (Math.random() - 0.5) * speedY;
            particle.swirlPhase = Math.random() * Math.PI * 2;
            particle.swirlSpeed = Math.random() * (swirlSpeedMax - swirlSpeedMin) + swirlSpeedMin;
            particle.swirlRadius = Math.random() * (swirlRadiusMax - swirlRadiusMin) + swirlRadiusMin;
            particle.directionTimer = Math.floor(Math.random() * 200);
            particle.directionInterval = Math.floor(Math.random() * 300) + 200;
        } else if (particleMode === 'grounds') {
            const sizeMin = getConfig('grounds', 'sizeMin', 1);
            const sizeMax = getConfig('grounds', 'sizeMax', 3.5);
            const opacityMin = getConfig('grounds', 'opacityMin', 0.2);
            const opacityMax = getConfig('grounds', 'opacityMax', 0.6);
            const speedX = getConfig('grounds', 'speedX', 0.08);
            const speedYDown = getConfig('grounds', 'speedYDown', 0.12);
            const speedYUp = getConfig('grounds', 'speedYUp', 0.05);
            const wobbleSpeedMax = getConfig('grounds', 'wobbleSpeed', 0.008);
            const wobbleAmountMax = getConfig('grounds', 'wobbleAmount', 0.3);
            const rotationSpeedMax = getConfig('grounds', 'rotationSpeed', 0.01);
            const stretchMin = getConfig('grounds', 'stretchMin', 0.8);
            const stretchMax = getConfig('grounds', 'stretchMax', 1.3);

            particle.size = Math.random() * (sizeMax - sizeMin) + sizeMin;
            particle.opacity = Math.random() * (opacityMax - opacityMin) + opacityMin;
            particle.speedX = (Math.random() - 0.5) * speedX;
            particle.speedY = Math.random() < 0.7
                ? Math.random() * speedYDown + 0.02
                : -(Math.random() * speedYUp + 0.01);
            particle.wobble = Math.random() * Math.PI * 2;
            particle.wobbleSpeed = Math.random() * wobbleSpeedMax + 0.002;
            particle.wobbleAmount = Math.random() * wobbleAmountMax + 0.1;
            particle.rotation = Math.random() * Math.PI * 2;
            particle.rotationSpeed = (Math.random() - 0.5) * rotationSpeedMax;
            particle.stretch = Math.random() * (stretchMax - stretchMin) + stretchMin;
        }

        return particle;
    }

    function init() {
        resize();
        particles = [];
        const count = getParticleCount(particleMode);
        for (let i = 0; i < count; i++) {
            particles.push(createParticle(true));
        }
    }

    // Expose function to reinitialize with new config
    window.applyParticleConfig = function() {
        init();
    };

    window.setParticleMode = function(mode) {
        if (['dots', 'diamonds', 'steam', 'dust', 'grounds'].includes(mode)) {
            particleMode = mode;
            init();
            updateToggleButton();
        }
    };

    window.getParticleMode = function() {
        return particleMode;
    };

    function updateToggleButton() {
        const btn = document.getElementById('particleToggle');
        if (btn) {
            const labels = { dots: 'Dots', diamonds: 'Diamonds', steam: 'Steam', dust: 'Spice Dust', grounds: 'Coffee Grounds' };
            btn.textContent = `Particles: ${labels[particleMode]}`;
        }
    }

    // Mutates color in place to avoid GC pressure
    function lerpColorInPlace(color, target, t) {
        color.r += (target.r - color.r) * t;
        color.g += (target.g - color.g) * t;
        color.b += (target.b - color.b) * t;
    }

    // Quantize opacity for batching (round to nearest 0.02 for ~50 buckets)
    function quantizeOpacity(opacity) {
        return Math.round(opacity * 50) / 50;
    }

    // Reusable object for batching to avoid allocations
    const batchGroups = new Map();

    function animate(currentTime) {
        const frameInterval = isTabActive ? activeFrameInterval : inactiveFrameInterval;
        if (currentTime - lastFrameTime < frameInterval) {
            requestAnimationFrame(animate);
            return;
        }
        lastFrameTime = currentTime;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        scrollY += (targetScrollY - scrollY) * 0.1;

        const parallaxStrength = getParallaxStrength();
        const colorTransitionSpeed = getColorTransitionSpeed();

        // For batchable modes (dots, dust), collect draw data first
        if (particleMode === 'dots' || particleMode === 'dust') {
            batchGroups.clear();

            particles.forEach((p) => {
                lerpColorInPlace(p.color, p.targetColor, colorTransitionSpeed);
                updateColorCache(p);

                if (particleMode === 'dots') {
                    p.wobble += p.wobbleSpeed;
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
                    p.drawY = p.y - scrollY * depthFactor;

                } else if (particleMode === 'dust') {
                    p.swirlPhase += p.swirlSpeed;
                    p.directionTimer++;
                    if (p.directionTimer >= p.directionInterval) {
                        p.directionTimer = 0;
                        p.directionInterval = Math.floor(Math.random() * 300) + 200;
                        p.speedX += (Math.random() - 0.5) * 0.2;
                        p.speedY += (Math.random() - 0.5) * 0.1;
                        p.speedX = Math.max(-0.5, Math.min(0.5, p.speedX));
                        p.speedY = Math.max(-0.2, Math.min(0.2, p.speedY));
                    }

                    const swirlX = Math.sin(p.swirlPhase) * p.swirlRadius * 0.02;
                    const swirlY = Math.cos(p.swirlPhase * 0.7) * p.swirlRadius * 0.01;

                    p.x += p.speedX + swirlX;
                    p.y += p.speedY + swirlY;

                    if (p.x > canvas.width + 20) {
                        p.x = -20;
                        p.colorIndex = Math.floor(Math.random() * targetColors.length);
                        p.targetColor = { ...targetColors[p.colorIndex] };
                    }
                    if (p.x < -20) {
                        p.x = canvas.width + 20;
                        p.colorIndex = Math.floor(Math.random() * targetColors.length);
                        p.targetColor = { ...targetColors[p.colorIndex] };
                    }
                    if (p.y > canvas.height + 20) p.y = -20;
                    if (p.y < -20) p.y = canvas.height + 20;

                    const depthFactor = (p.size / 4) * parallaxStrength;
                    p.drawY = p.y - scrollY * depthFactor;
                }

                // Group by quantized color+opacity for batching
                const quantizedOpacity = quantizeOpacity(p.opacity);
                const batchKey = p.rgbPrefix + quantizedOpacity + ')';
                if (!batchGroups.has(batchKey)) {
                    batchGroups.set(batchKey, []);
                }
                batchGroups.get(batchKey).push(p);
            });

            // Draw batched particles - single fill() per color group
            batchGroups.forEach((group, fillStyle) => {
                ctx.beginPath();
                ctx.fillStyle = fillStyle;
                group.forEach(p => {
                    ctx.moveTo(p.x + p.size, p.drawY);
                    ctx.arc(p.x, p.drawY, p.size, 0, Math.PI * 2);
                });
                ctx.fill();
            });

        } else {
            // Non-batchable modes (diamonds, steam, grounds) - draw individually
            particles.forEach((p) => {
                lerpColorInPlace(p.color, p.targetColor, colorTransitionSpeed);
                updateColorCache(p);

                if (particleMode === 'diamonds') {
                    p.wobble += p.wobbleSpeed;
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
                    const x = p.x;
                    const y = p.y - parallaxOffsetY;
                    const size = p.size * 1.5;
                    const rotationEffect = getConfig('diamonds', 'rotationEffect', 0.1);

                    const angle = Math.PI / 4 + p.wobble * rotationEffect;
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);
                    ctx.setTransform(cos, sin, -sin, cos, x, y);
                    ctx.beginPath();
                    ctx.rect(-size / 2, -size / 2, size, size);
                    ctx.fillStyle = p.rgbPrefix + p.opacity + ')';
                    ctx.fill();
                    ctx.setTransform(1, 0, 0, 1, 0, 0);

                } else if (particleMode === 'steam') {
                    p.life++;
                    p.curlOffset += p.curlSpeed;
                    const curlX = Math.sin(p.curlOffset) * p.curlAmplitude * (p.life / p.maxLife);
                    p.y += p.speedY;

                    const lifeRatio = p.life / p.maxLife;
                    const opacityPeak = getConfig('steam', 'opacityPeak', 0.15);
                    const growthRate = getConfig('steam', 'growthRate', 0.5);
                    let opacity;
                    if (lifeRatio < 0.1) {
                        opacity = (lifeRatio / 0.1) * opacityPeak;
                    } else if (lifeRatio > 0.7) {
                        opacity = ((1 - lifeRatio) / 0.3) * opacityPeak;
                    } else {
                        opacity = opacityPeak;
                    }

                    p.size = p.originalSize * (1 + lifeRatio * growthRate);

                    if (p.life >= p.maxLife || p.y < -50) {
                        p.x = Math.random() * canvas.width;
                        p.y = canvas.height + Math.random() * 50;
                        p.life = 0;
                        p.maxLife = Math.random() * 400 + 300;
                        p.curlOffset = Math.random() * Math.PI * 2;
                        p.curlAmplitude = Math.random() * 40 + 20;
                        p.size = p.originalSize;
                        p.colorIndex = Math.floor(Math.random() * targetColors.length);
                        p.targetColor = { ...targetColors[p.colorIndex] };
                    }

                    const depthFactor = (p.originalSize / 8) * parallaxStrength;
                    const parallaxOffsetY = scrollY * depthFactor;
                    const x = p.x + curlX;
                    const y = p.y - parallaxOffsetY;

                    // Outer ring (25% opacity)
                    ctx.beginPath();
                    ctx.arc(x, y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = p.rgbPrefix + (opacity * 0.25) + ')';
                    ctx.fill();
                    // Middle ring (50% opacity)
                    ctx.beginPath();
                    ctx.arc(x, y, p.size * 0.65, 0, Math.PI * 2);
                    ctx.fillStyle = p.rgbPrefix + (opacity * 0.5) + ')';
                    ctx.fill();
                    // Inner core (full opacity)
                    ctx.beginPath();
                    ctx.arc(x, y, p.size * 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = p.rgbPrefix + opacity + ')';
                    ctx.fill();

                } else if (particleMode === 'grounds') {
                    p.wobble += p.wobbleSpeed;
                    p.rotation += p.rotationSpeed;
                    p.x += p.speedX + Math.sin(p.wobble) * p.wobbleAmount;
                    p.y += p.speedY;

                    if (p.y > canvas.height + 20) {
                        p.y = -20;
                        p.x = Math.random() * canvas.width;
                        p.colorIndex = Math.floor(Math.random() * targetColors.length);
                        p.targetColor = { ...targetColors[p.colorIndex] };
                    }
                    if (p.y < -20) {
                        p.y = canvas.height + 20;
                        p.x = Math.random() * canvas.width;
                        p.colorIndex = Math.floor(Math.random() * targetColors.length);
                        p.targetColor = { ...targetColors[p.colorIndex] };
                    }
                    if (p.x > canvas.width + 20) p.x = -20;
                    if (p.x < -20) p.x = canvas.width + 20;

                    const depthFactor = (p.size / 3) * parallaxStrength;
                    const parallaxOffsetY = scrollY * depthFactor;
                    const x = p.x;
                    const y = p.y - parallaxOffsetY;

                    const cos = Math.cos(p.rotation);
                    const sin = Math.sin(p.rotation);
                    ctx.setTransform(cos, sin, -p.stretch * sin, p.stretch * cos, x, y);
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = p.rgbPrefix + p.opacity + ')';
                    ctx.fill();
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                }
            });
        }

        requestAnimationFrame(animate);
    }

    // Expose function to change spice colors based on drink
    window.setSpiceColors = function(drinkId) {
        if (drinkSpiceColors[drinkId]) {
            targetColors = drinkSpiceColors[drinkId];
            particles.forEach(p => {
                p.colorIndex = Math.floor(Math.random() * targetColors.length);
                p.targetColor = { ...targetColors[p.colorIndex] };
            });
        }
    };

    // Track current drink for theme change updates
    let currentDrinkTheme = 'default';
    window.currentDrinkTheme = currentDrinkTheme;

    // Elements that should be themed with drink colors
    const getThemedElements = () => ({
        logos: document.querySelectorAll('.logo'),
        menuTitle: document.querySelector('#menu .section-title'),
        projectsTitle: document.querySelector('#projects .section-title'),
        teamTitle: document.querySelector('#team .section-title'),
        drinkDetailName: document.querySelector('.drink-detail-name'),
        drinkDetailBack: document.querySelector('.drink-detail-back'),
        drinkDetailIllustration: document.querySelector('.drink-detail-illustration'),
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

    // Apply drink theme colors to all relevant elements
    window.setDrinkTheme = function(drinkId) {
        currentDrinkTheme = drinkId;
        window.currentDrinkTheme = drinkId;
        const elements = getThemedElements();
        const color = drinkId === 'default' ? '' : window.getLogoColor(drinkId);

        // Set global theme accent color
        if (color) {
            document.documentElement.style.setProperty('--theme-accent', color);
        } else {
            document.documentElement.style.removeProperty('--theme-accent');
        }

        elements.logos.forEach(logo => {
            logo.style.color = color;
        });

        [elements.menuTitle, elements.projectsTitle, elements.teamTitle, elements.drinkDetailName].forEach(title => {
            if (title) {
                title.style.color = color;
            }
        });

        if (elements.drinkDetailBack) {
            if (color) {
                elements.drinkDetailBack.style.setProperty('--btn-color', color);
            } else {
                elements.drinkDetailBack.style.removeProperty('--btn-color');
            }
        }

        if (elements.drinkDetailIllustration) {
            elements.drinkDetailIllustration.style.borderColor = color || '';
        }

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

    // Keep setLogoColor as alias for backwards compatibility
    window.setLogoColor = function(drinkId) {
        window.setDrinkTheme(drinkId);
    };

    // Update themed elements when light/dark theme changes
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
