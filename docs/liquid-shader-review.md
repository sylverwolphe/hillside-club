# Liquid Shader Code Review

Review of the liquid shader implementation in `assets/script.js` (lines 1392-1795).

---

## Performance Issues

### Critical

**1. ~~Unbounded animation loop during transitions~~ (FIXED)**
```javascript
// Line 1738-1744 - Lerps every frame even when values have converged
current.baseColor = lerpColor(current.baseColor, target.baseColor, transitionSpeed);
```
~~No check if `current ≈ target`. Continues interpolating forever, wasting GPU cycles.~~

**Fix:** Added `isTransitioning` flag and `checkTransitionComplete()` function. Lerp operations only run during active transitions, and snap to target values when converged (within EPSILON of 0.001).

**2. ~~Frame-rate dependent transitions~~ (FIXED)**
```javascript
const transitionSpeed = 0.03; // Line 1692
```
~~Fixed lerp factor means 30fps devices get 2x slower transitions than 60fps.~~

**Fix:** Now uses `requestAnimationFrame` timestamp to calculate delta time normalized to 60fps. Lerp factor is computed as `1 - Math.pow(1 - transitionSpeed, dt)` for frame-rate independent transitions. Also resets `lastFrameTime` when animation resumes to avoid delta spikes. Bonus: switched from `Date.now()` to RAF timestamp for shader time uniform (addresses issue #8).

**3. ~~Array allocation every frame~~ (FIXED)**
```javascript
function lerpColor(a, b, t) {
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; // Line 1704
}
```
~~Creates garbage every frame.~~

**Fix:** Replaced with `lerpColorInPlace(arr, target, t)` that mutates the array in place. Also changed snap logic to use direct index assignment instead of spread operator.

**4. ~~Expensive FBM in fragment shader~~ (FIXED)**
```glsl
float fbm(vec2 p) {  // Line 1530
    // 4 octaves × 4 hash calls each = 16 sin() + dot() operations per fbm() call
}
```
~~Called twice per fragment (swirl + movement).~~

**Fix:** Removed `fbm()`, `noise()`, and `hash()` functions entirely since swirl/movement effects were removed. Shader is now much simpler with just zigzag waves and depth gradient.

### Moderate

**5. ~~Unused uniforms waste bandwidth~~ (FIXED)**
~~`u_viscosity` (line 1507) and `u_foamHeight` (line 1510) are sent every frame but never read in shader.~~

**Fix:** Removed `u_viscosity`, `u_foamHeight`, and `u_hasSwirl` uniforms from shader and JS. Only active uniforms remain: resolution, time, baseColor, secondaryColor, flowSpeed, fillLevel.

**6. Resize handler not debounced**
```javascript
window.addEventListener('resize', resize); // Line 1772
```
Fires dozens of times during resize. Add debouncing.

**7. GPU branching in fragment shader**
```glsl
if (u_fillLevel < 0.01) { ... }  // Line 1564
if (u_hasSwirl > 0.5) { ... }    // Line 1573
```
Use branchless `step()`/`mix()` for better GPU parallelism:
```glsl
float swirlEnabled = step(0.5, u_hasSwirl);
liquidColor = mix(liquidColor, swirlColor, creamSwirl * 0.5 * swirlEnabled);
```

**8. ~~Date.now() vs performance.now()~~ (FIXED)**
```javascript
gl.uniform1f(uniforms.time, (Date.now() - startTime) / 1000); // Line 1748
```
~~`performance.now()` is higher precision.~~

**Fix:** Now uses the timestamp from `requestAnimationFrame` callback directly: `gl.uniform1f(uniforms.time, timestamp / 1000)`. Fixed as part of issue #2.

---

## Robustness Issues

**9. ~~No WebGL context loss handling~~ (FIXED)**
```javascript
const gl = canvas.getContext('webgl'); // Line 1485
```
~~Mobile browsers frequently lose WebGL context.~~

**Fix:** Added `contextLost` flag and event listeners. On `webglcontextlost`: prevents default, sets flag, cancels animation. On `webglcontextrestored`: calls `setupWebGLResources()` to reinitialize shaders/program/buffers/uniforms, then restarts animation. Extracted WebGL setup into reusable `setupWebGLResources()` function.

**10. ~~Shallow copy mutates shared arrays~~ (FIXED)**
```javascript
let current = { ...drinkConfigs[defaultDrink] }; // Line 1687-1688
```
~~`baseColor` and `secondaryColor` are array references. If mutated, original config is corrupted.~~

**Fix:** Added `cloneDrinkConfig()` helper that deep clones arrays. Used for `current`, `target` initialization and in `setLiquidDrink()`.

**11. No DPR change detection**
```javascript
const dpr = window.devicePixelRatio || 1; // Line 1710
```
Users moving windows between monitors with different DPR will have blurry/sharp mismatches. Listen to:
```javascript
matchMedia(`(resolution: ${dpr}dppx)`).addEventListener('change', resize);
```

**12. Observer never disconnected**
The IntersectionObserver (line 1776) is never cleaned up if the page/element is removed.

---

## Code Quality

**13. Magic numbers throughout shader**
```glsl
float waveStrength = 0.035;           // Why 0.035?
uv.x * 8.0 + time * 0.5              // Why 8.0, 0.5?
smoothstep(0.05, 0.15, dist)         // Why these thresholds?
```
Extract to named uniforms or constants.

**14. Global namespace pollution**
```javascript
window.setLiquidDrink = function(drinkId) { ... } // Line 1717
```
Consider a module pattern or event-based communication.

**15. No shader compilation error recovery**
```javascript
if (!vertexShader || !fragmentShader) return; // Line 1638
```
Silently fails with no fallback. Show a static image or CSS gradient.

---

## Summary

| Category | Issues |
|----------|--------|
| Performance | Frame-rate dependent lerp, unbounded animation, GC pressure, expensive FBM |
| Robustness | No context loss handling, shallow copies, no DPR tracking |
| Code quality | Magic numbers, unused uniforms, global pollution |

The shader itself produces nice visuals, but the JavaScript orchestration needs work for production use on varied devices.
