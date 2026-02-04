// ===== COFFEE CUP LIQUID SHADER =====
// Configurable drink properties - edit these to customize each drink's appearance

const drinkConfigs = {
    'none': {
        baseColor: [0.98, 0.97, 0.95],      // Empty cup (cream parchment)
        secondaryColor: [0.95, 0.94, 0.92],
        flowSpeed: 0.5,
        fillLevel: 0.0                       // Empty
    },
    'pour-over': {
        baseColor: [0.76, 0.55, 0.35],      // Light amber
        secondaryColor: [0.45, 0.30, 0.15], // Dark roast accent
        flowSpeed: 1.2,
        fillLevel: 0.85
    },
    'cappuccino': {
        baseColor: [0.35, 0.20, 0.12],      // Dark espresso
        secondaryColor: [0.95, 0.92, 0.88], // White foam
        flowSpeed: 0.8,
        fillLevel: 0.9
    },
    'latte': {
        baseColor: [0.55, 0.38, 0.25],      // Milky coffee
        secondaryColor: [0.90, 0.85, 0.78], // Cream swirl
        flowSpeed: 0.9,
        fillLevel: 0.88
    },
    'mocha': {
        baseColor: [0.28, 0.15, 0.10],      // Dark chocolate coffee
        secondaryColor: [0.85, 0.75, 0.65], // Cream accent
        flowSpeed: 0.6,
        fillLevel: 0.85
    },
    'hot-chocolate': {
        baseColor: [0.25, 0.12, 0.08],      // Rich chocolate
        secondaryColor: [0.95, 0.90, 0.85], // Marshmallow cream
        flowSpeed: 0.4,
        fillLevel: 0.92
    },
    'matcha-latte': {
        baseColor: [0.45, 0.55, 0.30],      // Matcha green
        secondaryColor: [0.90, 0.92, 0.85], // Oat milk
        flowSpeed: 0.85,
        fillLevel: 0.87
    },
    'moroccan-mint': {
        baseColor: [0.35, 0.50, 0.35],      // Mint tea green
        secondaryColor: [0.95, 0.98, 0.90], // Bright mint highlight
        flowSpeed: 1.3,
        fillLevel: 0.8
    },
    'something-different': {
        baseColor: [0.75, 0.45, 0.55],      // Dusty rose (mystery drink)
        secondaryColor: [0.90, 0.75, 0.60], // Golden accent
        flowSpeed: 1.0,
        fillLevel: 0.86
    }
};

// Default starting drink (empty/none)
const defaultDrink = 'none';

(function initLiquidShader() {
    const canvas = document.getElementById('liquid-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.warn('WebGL not supported, liquid effect disabled');
        return;
    }

    // Shader sources
    const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision mediump float;

        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec3 u_baseColor;
        uniform vec3 u_secondaryColor;
        uniform float u_flowSpeed;
        uniform float u_fillLevel;

        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution;
            float time = u_time * u_flowSpeed * 0.3;

            // Create zigzag/sawtooth diamond-like surface pattern
            float waveStrength = 0.035;
            // Triangle wave function for sharp zigzag peaks
            float triWave1 = abs(mod(uv.x * 8.0 + time * 0.5, 2.0) - 1.0) * waveStrength;
            float triWave2 = abs(mod(uv.x * 12.0 - time * 0.3, 2.0) - 1.0) * waveStrength * 0.5;
            float surfaceWave = triWave1 + triWave2 - waveStrength * 0.75;

            // The liquid fill level (0 = bottom, 1 = top)
            float liquidSurface = u_fillLevel + surfaceWave;

            // Smooth edges for anti-aliasing but sharp zigzag shape
            float inLiquid = smoothstep(0.0, 0.005, uv.y) * smoothstep(liquidSurface + 0.003, liquidSurface - 0.003, uv.y);

            // Stroke line at the top of the liquid (using secondary color)
            float strokeWidth = 0.008;
            float inStroke = smoothstep(liquidSurface - strokeWidth - 0.002, liquidSurface - strokeWidth, uv.y)
                           * smoothstep(liquidSurface + 0.002, liquidSurface - 0.002, uv.y);

            // Empty state (when fillLevel is 0)
            if (u_fillLevel < 0.01) {
                gl_FragColor = vec4(0.0);
                return;
            }

            // === LIQUID RENDERING ===
            vec3 liquidColor = u_baseColor;

            // Depth gradient - darker at bottom
            float depthGradient = smoothstep(0.0, liquidSurface, uv.y);
            liquidColor *= 0.85 + depthGradient * 0.15;

            // === COMBINE ===
            vec3 finalColor = vec3(0.0);
            float finalAlpha = 0.0;

            if (inLiquid > 0.01) {
                finalColor = liquidColor;
                finalAlpha = inLiquid * 0.4;
            }

            // Add stroke line at top in secondary color (darker version for contrast)
            if (inStroke > 0.01) {
                vec3 strokeColor = u_secondaryColor * 0.7; // Slightly darker for visibility
                finalColor = mix(finalColor, strokeColor, inStroke * 0.9);
                finalAlpha = max(finalAlpha, inStroke * 0.6);
            }

            gl_FragColor = vec4(finalColor * finalAlpha, finalAlpha);
        }
    `;

    // WebGL resources (reassignable for context restore)
    let program = null;
    let uniforms = null;
    let contextLost = false;

    // Compile shader helper
    function compileShader(source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    // Setup WebGL resources (called on init and context restore)
    function setupWebGLResources() {
        const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

        if (!vertexShader || !fragmentShader) return false;

        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return false;
        }

        gl.useProgram(program);

        // Enable blending for transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        // Create fullscreen quad
        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1,
        ]);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const positionLoc = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        // Get uniform locations
        uniforms = {
            resolution: gl.getUniformLocation(program, 'u_resolution'),
            time: gl.getUniformLocation(program, 'u_time'),
            baseColor: gl.getUniformLocation(program, 'u_baseColor'),
            secondaryColor: gl.getUniformLocation(program, 'u_secondaryColor'),
            flowSpeed: gl.getUniformLocation(program, 'u_flowSpeed'),
            fillLevel: gl.getUniformLocation(program, 'u_fillLevel')
        };

        return true;
    }

    // Initial setup
    if (!setupWebGLResources()) return;

    // Handle WebGL context loss/restore
    canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        contextLost = true;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    });

    canvas.addEventListener('webglcontextrestored', () => {
        contextLost = false;
        if (setupWebGLResources()) {
            resize();
            startAnimation();
        }
    });

    // Deep clone drink config to avoid mutating original arrays
    function cloneDrinkConfig(config) {
        return {
            baseColor: [...config.baseColor],
            secondaryColor: [...config.secondaryColor],
            flowSpeed: config.flowSpeed,
            fillLevel: config.fillLevel
        };
    }

    // Current and target values for smooth transitions
    let current = cloneDrinkConfig(drinkConfigs[defaultDrink]);
    let target = cloneDrinkConfig(drinkConfigs[defaultDrink]);
    const transitionSpeed = 0.03;

    // Visibility tracking for performance
    let isVisible = true;
    let animationId = null;

    // Lerp helper
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    // Mutates arr in place to avoid GC pressure
    function lerpColorInPlace(arr, target, t) {
        arr[0] = lerp(arr[0], target[0], t);
        arr[1] = lerp(arr[1], target[1], t);
        arr[2] = lerp(arr[2], target[2], t);
    }

    // Check if two values are approximately equal
    const EPSILON = 0.001;
    function approxEqual(a, b) {
        return Math.abs(a - b) < EPSILON;
    }

    function colorsApproxEqual(a, b) {
        return approxEqual(a[0], b[0]) && approxEqual(a[1], b[1]) && approxEqual(a[2], b[2]);
    }

    // Check if transition is complete
    let isTransitioning = false;
    function checkTransitionComplete() {
        return colorsApproxEqual(current.baseColor, target.baseColor) &&
               colorsApproxEqual(current.secondaryColor, target.secondaryColor) &&
               approxEqual(current.flowSpeed, target.flowSpeed) &&
               approxEqual(current.fillLevel, target.fillLevel);
    }

    // Resize handler
    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    // Set drink
    window.setLiquidDrink = function(drinkId) {
        if (drinkConfigs[drinkId]) {
            target = cloneDrinkConfig(drinkConfigs[drinkId]);
            isTransitioning = true;
        }
    };

    // Animation loop
    let lastFrameTime = 0;
    const TARGET_FRAME_MS = 16.67; // 60fps baseline

    function animate(timestamp) {
        // Only animate when visible
        if (!isVisible) {
            animationId = null;
            return;
        }

        // Calculate delta time normalized to 60fps
        const deltaTime = lastFrameTime ? timestamp - lastFrameTime : TARGET_FRAME_MS;
        lastFrameTime = timestamp;
        const dt = deltaTime / TARGET_FRAME_MS;

        // Frame-rate independent lerp factor
        const frameAdjustedSpeed = 1 - Math.pow(1 - transitionSpeed, dt);

        // Clear with transparent
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Only lerp when transitioning between drinks
        if (isTransitioning) {
            lerpColorInPlace(current.baseColor, target.baseColor, frameAdjustedSpeed);
            lerpColorInPlace(current.secondaryColor, target.secondaryColor, frameAdjustedSpeed);
            current.flowSpeed = lerp(current.flowSpeed, target.flowSpeed, frameAdjustedSpeed);
            current.fillLevel = lerp(current.fillLevel, target.fillLevel, frameAdjustedSpeed);

            // Check if transition is complete, snap to target values
            if (checkTransitionComplete()) {
                current.baseColor[0] = target.baseColor[0];
                current.baseColor[1] = target.baseColor[1];
                current.baseColor[2] = target.baseColor[2];
                current.secondaryColor[0] = target.secondaryColor[0];
                current.secondaryColor[1] = target.secondaryColor[1];
                current.secondaryColor[2] = target.secondaryColor[2];
                current.flowSpeed = target.flowSpeed;
                current.fillLevel = target.fillLevel;
                isTransitioning = false;
            }
        }

        // Set uniforms
        gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
        gl.uniform1f(uniforms.time, timestamp / 1000);
        gl.uniform3fv(uniforms.baseColor, current.baseColor);
        gl.uniform3fv(uniforms.secondaryColor, current.secondaryColor);
        gl.uniform1f(uniforms.flowSpeed, current.flowSpeed);
        gl.uniform1f(uniforms.fillLevel, current.fillLevel);

        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        animationId = requestAnimationFrame(animate);
    }

    // Start animation only when visible and context is valid
    function startAnimation() {
        if (!animationId && isVisible && !contextLost) {
            lastFrameTime = 0; // Reset to avoid delta spike after pause
            animationId = requestAnimationFrame(animate);
        }
    }

    // Initialize
    resize();
    window.addEventListener('resize', resize);

    // Use Intersection Observer to pause/resume animation when out of view
    const menuEl = document.getElementById('menu');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
            if (isVisible) {
                resize(); // Re-calculate size when becoming visible
                startAnimation();
            }
        });
    }, { threshold: 0.01 }); // Lower threshold to trigger sooner

    if (menuEl) {
        observer.observe(menuEl);
    }

    // Start animation
    startAnimation();

    // Note: Drink card click handlers are now initialized in initDrinkCardHandlers()
    // after menu cards are dynamically loaded from menu-config.json
})();
