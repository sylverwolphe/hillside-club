# Particle System Code Review

Review of the particle system implementation in `assets/js/particles.js` (724 lines) and `assets/js/particle-controller.js` (681 lines).

---

## Performance Issues

### Critical

**1. ~~Object allocation every frame in lerpColor()~~ (FIXED)**
```javascript
function lerpColor(current, target, t) {
    return {
        r: current.r + (target.r - current.r) * t,
        g: current.g + (target.g - current.g) * t,
        b: current.b + (target.b - current.b) * t
    };  // New object every call
}
```
~~Called once per particle per frame (line 380). With 200 particles at 60fps = 12,000 object allocations/second, causing GC pressure and frame drops.~~

**Fix:** Replaced with `lerpColorInPlace()` that mutates the color object directly instead of returning a new one.

**2. ~~String template allocation every frame~~ (FIXED)**
```javascript
// Lines 400, 430, 480, 525, 557
const colorStr = `rgba(${Math.round(p.color.r)}, ${Math.round(p.color.g)}, ${Math.round(p.color.b)}, ${p.opacity})`;
```
~~Creates a new string for every particle every frame. With 200 particles at 60fps = 12,000 string allocations/second.~~

**Fix:** Added `updateColorCache(p)` function that caches `rgbPrefix` string (e.g., `"rgba(128,64,32,"`) on each particle, only rebuilding when rounded RGB values change. All render code now uses `p.rgbPrefix + opacity + ')'` for minimal string concatenation.

**3. ~~RadialGradient creation every frame (steam mode)~~ (FIXED)**
```javascript
// Lines 481-484
const gradient = ctx.createRadialGradient(x, y, 0, x, y, p.size);
gradient.addColorStop(0, colorStr);
gradient.addColorStop(0.5, `rgba(...)`);
gradient.addColorStop(1, `rgba(...)`);
```
~~`createRadialGradient()` is expensive. For 120 steam particles at 60fps = 7,200 gradient objects/second. This is one of the most expensive operations in 2D Canvas.~~

**Fix:** Replaced with 3 concentric filled circles (outer at 25% opacity, middle at 50%, inner at 100%) that simulate the radial gradient effect without any gradient object creation.

**4. ~~shadowBlur causes expensive compositing~~ (FIXED)**
```javascript
// Lines 405, 439
ctx.shadowBlur = p.size * shadowBlur;
```
~~Any non-zero `shadowBlur` triggers expensive Gaussian blur compositing for every draw call. With 200+ particles, this is extremely costly.~~

**Fix:** Removed all `shadowBlur` and `shadowColor` operations from dots and diamonds modes. Shadow effects were subtle and the performance cost was not justified.

**5. ~~ctx.save()/restore() overhead~~ (FIXED)**
```javascript
// Lines 432-441, 559-567
ctx.save();
ctx.translate(x, y);
ctx.rotate(...);
// draw
ctx.restore();
```
~~Save/restore preserves the entire canvas state including clip regions, transforms, styles. Called per particle in diamonds/grounds modes.~~

**Fix:** Replaced with `setTransform()` to directly set the transformation matrix. Diamonds mode uses rotation matrix; grounds mode uses combined rotation + scale(1, stretch) matrix. Reset with `setTransform(1, 0, 0, 1, 0, 0)` after each particle.

**6. ~~No draw call batching~~ (FIXED)**
~~Each particle calls `beginPath()`, draws a shape, then `fill()`. For simple circles, this creates 200+ separate draw calls per frame.~~

**Fix:** Implemented batching for `dots` and `dust` modes:
- Particles are grouped by quantized color+opacity (50 opacity buckets)
- Each group is drawn with a single `beginPath()` / `fill()` cycle
- Uses `moveTo()` before each `arc()` to create disconnected circles in one path
- Reduces draw calls from 200+ to ~10-30 depending on color variety
- `diamonds`, `steam`, `grounds` modes still draw individually due to per-particle transforms

### Moderate

**7. Color transition never completes**
```javascript
// Line 380
p.color = lerpColor(p.color, p.targetColor, getColorTransitionSpeed());
```
Unlike the liquid shader (which now has `checkTransitionComplete()`), particles keep lerping forever even when `p.color ≈ p.targetColor`, wasting CPU cycles.

**Fix:** Add convergence check:
```javascript
const EPSILON = 0.5; // Colors are 0-255
if (Math.abs(p.color.r - p.targetColor.r) < EPSILON &&
    Math.abs(p.color.g - p.targetColor.g) < EPSILON &&
    Math.abs(p.color.b - p.targetColor.b) < EPSILON) {
    p.color.r = p.targetColor.r;
    p.color.g = p.targetColor.g;
    p.color.b = p.targetColor.b;
    p.colorTransitioning = false;
}
```

**8. getConfig() called per particle per frame**
```javascript
// Lines 398, 427-428, 450-451, etc.
const shadowBlur = getConfig('dots', 'shadowBlur', 2);
const rotationEffect = getConfig('diamonds', 'rotationEffect', 0.1);
```
These traverse the config object hierarchy repeatedly. Called inside the particle loop.

**Fix:** Cache config values at mode switch time:
```javascript
let cachedConfig = {};
function cacheConfig(mode) {
    cachedConfig = {
        shadowBlur: getConfig(mode, 'shadowBlur', 2),
        // ... other values
    };
}
// In animate(): use cachedConfig.shadowBlur
```

**9. getParallaxStrength() and getColorTransitionSpeed() called repeatedly**
```javascript
// Line 396
const depthFactor = (p.size / 6) * getParallaxStrength();
// Line 380
p.color = lerpColor(p.color, p.targetColor, getColorTransitionSpeed());
```
Both functions traverse `window.particleConfig` every call. These values rarely change.

**Fix:** Cache globally, update only when config changes:
```javascript
let parallaxStrength = 0.15;
let colorTransitionSpeed = 0.02;
window.applyParticleConfig = function() {
    parallaxStrength = getGlobalConfig('parallaxStrength', 0.15);
    colorTransitionSpeed = getGlobalConfig('colorTransitionSpeed', 0.02);
    init();
};
```

**10. Animation loop runs even when tab inactive**
```javascript
// Lines 369-374
const frameInterval = isTabActive ? activeFrameInterval : inactiveFrameInterval;
if (currentTime - lastFrameTime < frameInterval) {
    requestAnimationFrame(animate);  // Still scheduling frames!
    return;
}
```
When tab is inactive, animation still runs at 10fps (100ms intervals) instead of stopping entirely.

**Fix:** Stop animation loop when hidden, restart on visibility change:
```javascript
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(animationId);
        animationId = null;
    } else {
        startAnimation();
    }
});
```

**11. Resize handler not debounced**
```javascript
// Line 719
window.addEventListener('resize', resize);
```
Fires dozens of times during window resize, causing repeated canvas reconfigurations.

**Fix:** Debounce resize:
```javascript
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 100);
});
```

**12. Spread operator creates objects on particle wrap**
```javascript
// Lines 391, 417, 472, 512, 517, 541, 547
p.targetColor = { ...targetColors[p.colorIndex] };
```
Creates new object every time a particle wraps around screen edges.

**Fix:** Copy properties directly:
```javascript
const tc = targetColors[p.colorIndex];
p.targetColor.r = tc.r;
p.targetColor.g = tc.g;
p.targetColor.b = tc.b;
```

**13. No canvas DPR (devicePixelRatio) handling**
```javascript
// Lines 193-194
canvas.width = newWidth;
canvas.height = newHeight;
```
Canvas is not scaled for high-DPI displays, resulting in blurry particles on Retina/4K screens.

**Fix:**
```javascript
function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);
}
```

### Minor

**14. MutationObserver never disconnected**
```javascript
// Lines 716-717
themeObserver.observe(document.documentElement, { attributes: true });
```
If the particle system were ever destroyed, the observer would leak.

**15. No IntersectionObserver for visibility**
Unlike the liquid shader, particles don't pause when scrolled out of view. The canvas covers the full viewport so this is less critical, but if particles were in a specific section it would matter.

**16. Magic numbers throughout**
```javascript
p.y > canvas.height + 10      // Why 10?
canvas.height + Math.random() * 50  // Why 50?
p.speedX = Math.max(-0.5, Math.min(0.5, p.speedX));  // Why 0.5?
```
Should be named constants or config values.

---

## Robustness Issues

**17. No fallback for canvas context**
```javascript
// Line 9
const ctx = canvas.getContext('2d');
```
If `getContext('2d')` returns null (rare but possible on some devices), code will crash.

**Fix:**
```javascript
const ctx = canvas.getContext('2d');
if (!ctx) {
    console.warn('Canvas 2D not supported');
    return;
}
```

**18. Particle scaling on resize can cause clustering**
```javascript
// Lines 196-206
particles.forEach(p => {
    p.x *= scaleX;
    p.y *= scaleY;
    p.x = Math.max(0, Math.min(p.x, newWidth));
    p.y = Math.max(0, Math.min(p.y, newHeight));
});
```
When resizing from large to small, particles cluster at edges. When resizing from small to large, particles cluster in one corner.

**Fix:** Consider redistributing particles randomly on significant resize, or using normalized coordinates (0-1 range).

---

## Code Quality Issues

**19. Duplicated mode logic in createParticle() and animate()**
Both functions have large if/else chains for each mode (dots, diamonds, steam, dust, grounds). This violates DRY principle.

**Fix:** Use a strategy pattern:
```javascript
const particleModes = {
    dots: {
        create: (p, config) => { /* ... */ },
        update: (p, config, ctx) => { /* ... */ },
        draw: (p, ctx) => { /* ... */ }
    },
    diamonds: { /* ... */ },
    // ...
};
// In createParticle:
particleModes[particleMode].create(particle, config);
// In animate:
particleModes[particleMode].update(p, config, ctx);
particleModes[particleMode].draw(p, ctx);
```

**20. particle-controller.js loaded but disabled**
```javascript
// Lines 670-673
// Initialize - DISABLED (uncomment to enable controller UI)
// addStyles();
// createControllerPanel();
// makeDraggable();
```
681 lines of code loaded, parsed, and IIFE executed, but nothing happens. Should be removed from production or conditionally loaded.

**Fix:** Either:
- Remove the script tag from index.html
- Use dynamic import: `if (DEV_MODE) import('./particle-controller.js')`

**21. Global namespace pollution**
```javascript
window.setParticleMode = function() { ... };
window.getParticleMode = function() { ... };
window.setSpiceColors = function() { ... };
window.setDrinkTheme = function() { ... };
window.setLogoColor = function() { ... };
window.getLogoColor = function() { ... };
window.applyParticleConfig = function() { ... };
window.particleConfig = ...;
window.currentDrinkTheme = ...;
```
9+ globals exposed. Consider a namespace object or ES modules.

**22. Inconsistent property naming**
- Some modes: `speedY` (dots, diamonds)
- Other modes: `speedYDown`, `speedYUp` (grounds)
- Steam uses: `speedY` but it's negative (upward)

---

## Summary

| Category | Critical | Moderate | Minor |
|----------|----------|----------|-------|
| Performance | 6 | 7 | 3 |
| Robustness | 0 | 2 | 0 |
| Code Quality | 0 | 1 | 3 |

### Priority Fixes

1. **Highest Impact:** Remove/disable shadowBlur (issue #4) - single biggest performance win
2. **High Impact:** Replace lerpColor with in-place mutation (issue #1)
3. **High Impact:** Cache config values instead of repeated lookups (issues #8, #9)
4. **Medium Impact:** Stop animation when tab hidden (issue #10)
5. **Medium Impact:** Add color transition completion check (issue #7)
6. **Medium Impact:** Remove particle-controller.js from production (issue #20)

### Estimated Performance Gain

Implementing fixes #1, #4, #7, #8, #9, #10 could reduce CPU usage by 40-60% and eliminate frame drops on lower-end devices.
