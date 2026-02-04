// ===== PARTICLE SYSTEM CONTROLLER =====
// Temporary UI for tweaking particle parameters
// Remove this file once you've decided on final settings

(function initParticleController() {
    // Default configurations for each mode
    const defaultConfig = {
        global: {
            particleCount: { dots: 200, diamonds: 300, steam: 120, dust: 150, grounds: 100 },
            parallaxStrength: 0.15,
            colorTransitionSpeed: 0.02
        },
        dots: {
            sizeMin: 2,
            sizeMax: 6,
            speedX: 0.3,
            speedYMin: 0.05,
            speedYMax: 0.25,
            opacityMin: 0.08,
            opacityMax: 0.33,
            wobbleSpeed: 0.02,
            shadowBlur: 2
        },
        diamonds: {
            sizeMin: 4.5,
            sizeMax: 6,
            speedX: 1.2,
            speedYMin: 0.05,
            speedYMax: 0.25,
            opacityMin: 0.1,
            opacityMax: 0.33,
            wobbleSpeed: 0,
            rotationEffect: 0,
            shadowBlur: 2
        },
        steam: {
            sizeMin: 3,
            sizeMax: 9,
            speedYMin: 0.2,
            speedYMax: 0.6,
            curlSpeedMin: 0.003,
            curlSpeedMax: 0.011,
            curlAmplitudeMin: 20,
            curlAmplitudeMax: 60,
            maxLifeMin: 300,
            maxLifeMax: 700,
            opacityPeak: 0.15,
            growthRate: 0.5
        },
        dust: {
            sizeMin: 1.5,
            sizeMax: 4.5,
            opacityMin: 0.15,
            opacityMax: 0.5,
            speedX: 0.4,
            speedY: 0.15,
            swirlSpeedMin: 0.005,
            swirlSpeedMax: 0.015,
            swirlRadiusMin: 5,
            swirlRadiusMax: 20
        },
        grounds: {
            sizeMin: 1,
            sizeMax: 3.5,
            opacityMin: 0.2,
            opacityMax: 0.6,
            speedX: 0.08,
            speedYDown: 0.12,
            speedYUp: 0.05,
            wobbleSpeed: 0.008,
            wobbleAmount: 0.3,
            rotationSpeed: 0.01,
            stretchMin: 0.8,
            stretchMax: 1.3
        }
    };

    // Current config (will be modified by sliders)
    window.particleConfig = JSON.parse(JSON.stringify(defaultConfig));

    // Create the controller panel
    function createControllerPanel() {
        const panel = document.createElement('div');
        panel.id = 'particle-controller';
        panel.classList.add('minimized');
        panel.innerHTML = `
            <div class="pc-header">
                <span class="pc-title">Particle Controller</span>
                <button class="pc-minimize" id="pcMinimize">+</button>
            </div>
            <div class="pc-body" id="pcBody" style="display: none;">
                <div class="pc-tabs">
                    <button class="pc-tab active" data-tab="global">Global</button>
                    <button class="pc-tab" data-tab="dots">Dots</button>
                    <button class="pc-tab" data-tab="diamonds">Diamonds</button>
                    <button class="pc-tab" data-tab="steam">Steam</button>
                    <button class="pc-tab" data-tab="dust">Dust</button>
                    <button class="pc-tab" data-tab="grounds">Grounds</button>
                </div>
                <div class="pc-content" id="pcContent"></div>
                <div class="pc-actions">
                    <button class="pc-btn" id="pcReset">Reset</button>
                    <button class="pc-btn pc-btn-primary" id="pcCopy">Copy Config</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // Add event listeners
        document.getElementById('pcMinimize').addEventListener('click', togglePanel);
        document.getElementById('pcReset').addEventListener('click', resetConfig);
        document.getElementById('pcCopy').addEventListener('click', copyConfig);

        // Tab switching
        panel.querySelectorAll('.pc-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                panel.querySelectorAll('.pc-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderTabContent(tab.dataset.tab);
            });
        });

        // Initial render
        renderTabContent('global');
    }

    function togglePanel() {
        const body = document.getElementById('pcBody');
        const btn = document.getElementById('pcMinimize');
        const panel = document.getElementById('particle-controller');

        if (body.style.display === 'none') {
            body.style.display = 'block';
            btn.textContent = '−';
            panel.classList.remove('minimized');
        } else {
            body.style.display = 'none';
            btn.textContent = '+';
            panel.classList.add('minimized');
        }
    }

    function renderTabContent(tab) {
        const content = document.getElementById('pcContent');
        const config = window.particleConfig;

        if (tab === 'global') {
            content.innerHTML = `
                <div class="pc-section">
                    <h4>Particle Counts</h4>
                    ${createSlider('global.particleCount.dots', 'Dots', config.global.particleCount.dots, 10, 500, 10)}
                    ${createSlider('global.particleCount.diamonds', 'Diamonds', config.global.particleCount.diamonds, 10, 500, 10)}
                    ${createSlider('global.particleCount.steam', 'Steam', config.global.particleCount.steam, 10, 300, 10)}
                    ${createSlider('global.particleCount.dust', 'Dust', config.global.particleCount.dust, 10, 400, 10)}
                    ${createSlider('global.particleCount.grounds', 'Grounds', config.global.particleCount.grounds, 10, 300, 10)}
                </div>
                <div class="pc-section">
                    <h4>Effects</h4>
                    ${createSlider('global.parallaxStrength', 'Parallax Strength', config.global.parallaxStrength, 0, 0.5, 0.01)}
                    ${createSlider('global.colorTransitionSpeed', 'Color Blend Speed', config.global.colorTransitionSpeed, 0.001, 0.1, 0.001)}
                </div>
                <div class="pc-section">
                    <h4>Quick Mode Switch</h4>
                    <div class="pc-mode-buttons">
                        <button class="pc-mode-btn" data-mode="dots">Dots</button>
                        <button class="pc-mode-btn" data-mode="diamonds">Diamonds</button>
                        <button class="pc-mode-btn" data-mode="steam">Steam</button>
                        <button class="pc-mode-btn" data-mode="dust">Dust</button>
                        <button class="pc-mode-btn" data-mode="grounds">Grounds</button>
                    </div>
                </div>
            `;
        } else if (tab === 'dots') {
            content.innerHTML = `
                <div class="pc-section">
                    <h4>Size</h4>
                    ${createSlider('dots.sizeMin', 'Min Size', config.dots.sizeMin, 0.5, 10, 0.5)}
                    ${createSlider('dots.sizeMax', 'Max Size', config.dots.sizeMax, 1, 15, 0.5)}
                </div>
                <div class="pc-section">
                    <h4>Movement</h4>
                    ${createSlider('dots.speedX', 'Horizontal Speed', config.dots.speedX, 0, 2, 0.05)}
                    ${createSlider('dots.speedYMin', 'Min Fall Speed', config.dots.speedYMin, 0, 1, 0.01)}
                    ${createSlider('dots.speedYMax', 'Max Fall Speed', config.dots.speedYMax, 0, 2, 0.05)}
                    ${createSlider('dots.wobbleSpeed', 'Wobble Speed', config.dots.wobbleSpeed, 0, 0.1, 0.005)}
                </div>
                <div class="pc-section">
                    <h4>Appearance</h4>
                    ${createSlider('dots.opacityMin', 'Min Opacity', config.dots.opacityMin, 0, 0.5, 0.01)}
                    ${createSlider('dots.opacityMax', 'Max Opacity', config.dots.opacityMax, 0.1, 1, 0.01)}
                    ${createSlider('dots.shadowBlur', 'Glow Amount', config.dots.shadowBlur, 0, 10, 0.5)}
                </div>
            `;
        } else if (tab === 'diamonds') {
            content.innerHTML = `
                <div class="pc-section">
                    <h4>Size</h4>
                    ${createSlider('diamonds.sizeMin', 'Min Size', config.diamonds.sizeMin, 0.5, 10, 0.5)}
                    ${createSlider('diamonds.sizeMax', 'Max Size', config.diamonds.sizeMax, 1, 15, 0.5)}
                </div>
                <div class="pc-section">
                    <h4>Movement</h4>
                    ${createSlider('diamonds.speedX', 'Horizontal Speed', config.diamonds.speedX, 0, 2, 0.05)}
                    ${createSlider('diamonds.speedYMin', 'Min Fall Speed', config.diamonds.speedYMin, 0, 1, 0.01)}
                    ${createSlider('diamonds.speedYMax', 'Max Fall Speed', config.diamonds.speedYMax, 0, 2, 0.05)}
                    ${createSlider('diamonds.wobbleSpeed', 'Wobble Speed', config.diamonds.wobbleSpeed, 0, 0.1, 0.005)}
                    ${createSlider('diamonds.rotationEffect', 'Rotation Amount', config.diamonds.rotationEffect, 0, 0.5, 0.01)}
                </div>
                <div class="pc-section">
                    <h4>Appearance</h4>
                    ${createSlider('diamonds.opacityMin', 'Min Opacity', config.diamonds.opacityMin, 0, 0.5, 0.01)}
                    ${createSlider('diamonds.opacityMax', 'Max Opacity', config.diamonds.opacityMax, 0.1, 1, 0.01)}
                    ${createSlider('diamonds.shadowBlur', 'Glow Amount', config.diamonds.shadowBlur, 0, 10, 0.5)}
                </div>
            `;
        } else if (tab === 'steam') {
            content.innerHTML = `
                <div class="pc-section">
                    <h4>Size</h4>
                    ${createSlider('steam.sizeMin', 'Min Size', config.steam.sizeMin, 1, 15, 0.5)}
                    ${createSlider('steam.sizeMax', 'Max Size', config.steam.sizeMax, 2, 25, 0.5)}
                    ${createSlider('steam.growthRate', 'Growth Rate', config.steam.growthRate, 0, 2, 0.1)}
                </div>
                <div class="pc-section">
                    <h4>Movement</h4>
                    ${createSlider('steam.speedYMin', 'Min Rise Speed', config.steam.speedYMin, 0.05, 1, 0.05)}
                    ${createSlider('steam.speedYMax', 'Max Rise Speed', config.steam.speedYMax, 0.1, 2, 0.05)}
                </div>
                <div class="pc-section">
                    <h4>Curl Effect</h4>
                    ${createSlider('steam.curlSpeedMin', 'Min Curl Speed', config.steam.curlSpeedMin, 0, 0.05, 0.001)}
                    ${createSlider('steam.curlSpeedMax', 'Max Curl Speed', config.steam.curlSpeedMax, 0.001, 0.1, 0.001)}
                    ${createSlider('steam.curlAmplitudeMin', 'Min Curl Width', config.steam.curlAmplitudeMin, 0, 100, 5)}
                    ${createSlider('steam.curlAmplitudeMax', 'Max Curl Width', config.steam.curlAmplitudeMax, 10, 150, 5)}
                </div>
                <div class="pc-section">
                    <h4>Lifecycle</h4>
                    ${createSlider('steam.maxLifeMin', 'Min Lifetime', config.steam.maxLifeMin, 100, 1000, 50)}
                    ${createSlider('steam.maxLifeMax', 'Max Lifetime', config.steam.maxLifeMax, 200, 1500, 50)}
                    ${createSlider('steam.opacityPeak', 'Peak Opacity', config.steam.opacityPeak, 0.05, 0.5, 0.01)}
                </div>
            `;
        } else if (tab === 'dust') {
            content.innerHTML = `
                <div class="pc-section">
                    <h4>Size</h4>
                    ${createSlider('dust.sizeMin', 'Min Size', config.dust.sizeMin, 0.5, 5, 0.25)}
                    ${createSlider('dust.sizeMax', 'Max Size', config.dust.sizeMax, 1, 10, 0.25)}
                </div>
                <div class="pc-section">
                    <h4>Movement</h4>
                    ${createSlider('dust.speedX', 'Horizontal Drift', config.dust.speedX, 0, 1, 0.05)}
                    ${createSlider('dust.speedY', 'Vertical Drift', config.dust.speedY, 0, 0.5, 0.025)}
                </div>
                <div class="pc-section">
                    <h4>Swirl Effect</h4>
                    ${createSlider('dust.swirlSpeedMin', 'Min Swirl Speed', config.dust.swirlSpeedMin, 0, 0.05, 0.001)}
                    ${createSlider('dust.swirlSpeedMax', 'Max Swirl Speed', config.dust.swirlSpeedMax, 0.001, 0.1, 0.001)}
                    ${createSlider('dust.swirlRadiusMin', 'Min Swirl Radius', config.dust.swirlRadiusMin, 0, 30, 1)}
                    ${createSlider('dust.swirlRadiusMax', 'Max Swirl Radius', config.dust.swirlRadiusMax, 5, 50, 1)}
                </div>
                <div class="pc-section">
                    <h4>Appearance</h4>
                    ${createSlider('dust.opacityMin', 'Min Opacity', config.dust.opacityMin, 0, 0.5, 0.01)}
                    ${createSlider('dust.opacityMax', 'Max Opacity', config.dust.opacityMax, 0.1, 1, 0.01)}
                </div>
            `;
        } else if (tab === 'grounds') {
            content.innerHTML = `
                <div class="pc-section">
                    <h4>Size</h4>
                    ${createSlider('grounds.sizeMin', 'Min Size', config.grounds.sizeMin, 0.5, 5, 0.25)}
                    ${createSlider('grounds.sizeMax', 'Max Size', config.grounds.sizeMax, 1, 8, 0.25)}
                    ${createSlider('grounds.stretchMin', 'Min Stretch', config.grounds.stretchMin, 0.5, 1.5, 0.05)}
                    ${createSlider('grounds.stretchMax', 'Max Stretch', config.grounds.stretchMax, 0.8, 2, 0.05)}
                </div>
                <div class="pc-section">
                    <h4>Movement</h4>
                    ${createSlider('grounds.speedX', 'Horizontal Speed', config.grounds.speedX, 0, 0.5, 0.01)}
                    ${createSlider('grounds.speedYDown', 'Fall Speed', config.grounds.speedYDown, 0, 0.5, 0.01)}
                    ${createSlider('grounds.speedYUp', 'Rise Speed', config.grounds.speedYUp, 0, 0.2, 0.005)}
                    ${createSlider('grounds.wobbleSpeed', 'Wobble Speed', config.grounds.wobbleSpeed, 0, 0.05, 0.001)}
                    ${createSlider('grounds.wobbleAmount', 'Wobble Amount', config.grounds.wobbleAmount, 0, 1, 0.05)}
                    ${createSlider('grounds.rotationSpeed', 'Rotation Speed', config.grounds.rotationSpeed, 0, 0.05, 0.002)}
                </div>
                <div class="pc-section">
                    <h4>Appearance</h4>
                    ${createSlider('grounds.opacityMin', 'Min Opacity', config.grounds.opacityMin, 0, 0.5, 0.01)}
                    ${createSlider('grounds.opacityMax', 'Max Opacity', config.grounds.opacityMax, 0.1, 1, 0.01)}
                </div>
            `;
        }

        // Add event listeners to all sliders
        content.querySelectorAll('.pc-slider').forEach(slider => {
            slider.addEventListener('input', handleSliderChange);
        });

        // Add event listeners to mode buttons
        content.querySelectorAll('.pc-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.setParticleMode) {
                    window.setParticleMode(btn.dataset.mode);
                }
            });
        });
    }

    function createSlider(path, label, value, min, max, step) {
        const id = path.replace(/\./g, '-');
        return `
            <div class="pc-slider-group">
                <label for="${id}">${label}</label>
                <div class="pc-slider-row">
                    <input type="range" id="${id}" class="pc-slider"
                           data-path="${path}"
                           min="${min}" max="${max}" step="${step}" value="${value}">
                    <span class="pc-value" id="${id}-value">${value}</span>
                </div>
            </div>
        `;
    }

    function handleSliderChange(e) {
        const path = e.target.dataset.path;
        const value = parseFloat(e.target.value);

        // Update display value
        document.getElementById(e.target.id + '-value').textContent = value;

        // Update config
        setNestedValue(window.particleConfig, path, value);

        // Apply changes
        applyConfig();
    }

    function setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
    }

    function getNestedValue(obj, path) {
        const keys = path.split('.');
        let current = obj;
        for (const key of keys) {
            current = current[key];
        }
        return current;
    }

    function applyConfig() {
        // Trigger particle system to reinitialize with new config
        if (window.applyParticleConfig) {
            window.applyParticleConfig();
        }
    }

    function resetConfig() {
        window.particleConfig = JSON.parse(JSON.stringify(defaultConfig));

        // Re-render current tab
        const activeTab = document.querySelector('.pc-tab.active');
        if (activeTab) {
            renderTabContent(activeTab.dataset.tab);
        }

        applyConfig();
    }

    function copyConfig() {
        const config = window.particleConfig;
        const output = `// Particle Configuration - Generated ${new Date().toLocaleString()}
// Copy these values to particles.js to make permanent

const PARTICLE_CONFIG = ${JSON.stringify(config, null, 2)};
`;

        navigator.clipboard.writeText(output).then(() => {
            const btn = document.getElementById('pcCopy');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.style.background = '#4a5c30';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy. Check console for config.');
            console.log(output);
        });
    }

    // Add styles
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #particle-controller {
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 320px;
                background: rgba(42, 38, 34, 0.95);
                border: 2px solid #C08497;
                border-radius: 8px;
                font-family: 'Satoshi', sans-serif;
                font-size: 13px;
                color: #F7F3E9;
                z-index: 10000;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                max-height: 80vh;
                display: flex;
                flex-direction: column;
            }

            #particle-controller.minimized {
                width: auto;
            }

            .pc-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                background: rgba(192, 132, 151, 0.2);
                border-bottom: 1px solid #C08497;
                cursor: move;
            }

            .pc-title {
                font-weight: 600;
                letter-spacing: 1px;
            }

            .pc-minimize {
                background: none;
                border: none;
                color: #F7F3E9;
                font-size: 20px;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1;
            }

            .pc-minimize:hover {
                color: #C08497;
            }

            .pc-body {
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .pc-tabs {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                padding: 10px;
                background: rgba(0, 0, 0, 0.2);
                border-bottom: 1px solid rgba(192, 132, 151, 0.3);
            }

            .pc-tab {
                padding: 6px 10px;
                background: rgba(192, 132, 151, 0.1);
                border: 1px solid rgba(192, 132, 151, 0.3);
                border-radius: 4px;
                color: #F7F3E9;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s;
            }

            .pc-tab:hover {
                background: rgba(192, 132, 151, 0.3);
            }

            .pc-tab.active {
                background: #C08497;
                border-color: #C08497;
            }

            .pc-content {
                padding: 15px;
                overflow-y: auto;
                max-height: 400px;
            }

            .pc-section {
                margin-bottom: 20px;
            }

            .pc-section:last-child {
                margin-bottom: 0;
            }

            .pc-section h4 {
                color: #C08497;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 12px;
                padding-bottom: 5px;
                border-bottom: 1px solid rgba(192, 132, 151, 0.3);
            }

            .pc-slider-group {
                margin-bottom: 12px;
            }

            .pc-slider-group label {
                display: block;
                margin-bottom: 4px;
                color: rgba(247, 243, 233, 0.8);
                font-size: 11px;
            }

            .pc-slider-row {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .pc-slider {
                flex: 1;
                -webkit-appearance: none;
                appearance: none;
                height: 6px;
                background: rgba(192, 132, 151, 0.3);
                border-radius: 3px;
                cursor: pointer;
            }

            .pc-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 14px;
                height: 14px;
                background: #C08497;
                border-radius: 50%;
                cursor: pointer;
                transition: transform 0.2s;
            }

            .pc-slider::-webkit-slider-thumb:hover {
                transform: scale(1.2);
            }

            .pc-slider::-moz-range-thumb {
                width: 14px;
                height: 14px;
                background: #C08497;
                border: none;
                border-radius: 50%;
                cursor: pointer;
            }

            .pc-value {
                min-width: 45px;
                text-align: right;
                font-family: monospace;
                font-size: 11px;
                color: #E8A317;
            }

            .pc-actions {
                display: flex;
                gap: 10px;
                padding: 12px 15px;
                background: rgba(0, 0, 0, 0.2);
                border-top: 1px solid rgba(192, 132, 151, 0.3);
            }

            .pc-btn {
                flex: 1;
                padding: 8px 12px;
                background: rgba(192, 132, 151, 0.2);
                border: 1px solid #C08497;
                border-radius: 4px;
                color: #F7F3E9;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            }

            .pc-btn:hover {
                background: rgba(192, 132, 151, 0.4);
            }

            .pc-btn-primary {
                background: #C08497;
            }

            .pc-btn-primary:hover {
                background: #d49aab;
            }

            .pc-mode-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }

            .pc-mode-btn {
                padding: 6px 12px;
                background: rgba(232, 163, 23, 0.2);
                border: 1px solid #E8A317;
                border-radius: 4px;
                color: #E8A317;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s;
            }

            .pc-mode-btn:hover {
                background: #E8A317;
                color: #2A2622;
            }

            @media (max-width: 768px) {
                #particle-controller {
                    width: calc(100% - 40px);
                    bottom: 90px;
                    left: 20px;
                    right: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Make panel draggable
    function makeDraggable() {
        const panel = document.getElementById('particle-controller');
        const header = panel.querySelector('.pc-header');
        let isDragging = false;
        let startX, startY, startLeft, startBottom;

        header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('pc-minimize')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = panel.offsetLeft;
            startBottom = window.innerHeight - panel.offsetTop - panel.offsetHeight;
            header.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            panel.style.left = (startLeft + deltaX) + 'px';
            panel.style.bottom = (startBottom - deltaY) + 'px';
            panel.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            header.style.cursor = 'move';
        });
    }

    // Initialize - DISABLED (uncomment to enable controller UI)
    // addStyles();
    // createControllerPanel();
    // makeDraggable();

    // Remove the old particle toggle button since we have a better UI now
    // const oldToggle = document.getElementById('particleToggle');
    // if (oldToggle) {
    //     oldToggle.style.display = 'none';
    // }
})();
