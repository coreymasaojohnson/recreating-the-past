// Bridget Riley-inspired interactive circles with mode toggle
// Responsive instance mode targeting #riley-canvas-container
// Version 5: Event-triggered intro pulse with DRAMATIC Matrix-flex effect

new p5((p) => {
  // Original logical coordinates
  const LOGICAL_WIDTH = 800;
  const LOGICAL_HEIGHT = 1010;
  const OFFSET_X = 163;
  const OFFSET_Y = 227;

  // Outer ring diameter (from your data)
  const OUTER_DIAMETER = 498;

  // Responsive scale factor (1 = original size)
  let scaleFactor = 1;

  let isInteractive = true;
  let toggleButton;

  // Background / circle animation state
  let bgIntensity = 0;          // 0 = light (original), 1 = dark
  let circlePulseIntensity = 0; // circles "breathe" slightly behind bg

  // One-time intro pulse (Matrix flex) state
  let demoActive = false;
  let demoStartTime = 0;
  const DEMO_DELAY = 2000;      // ms after page activated
  const DEMO_DURATION = 2200;   // length of one "breath" in ms

  // Circle data: [x, y, diameter]
  const circles = [
    [0, 0, 498], [19, 3, 460], [32, 6, 431], [50, 9, 398],
    [66, 12, 364], [83, 15, 330], [98, 42, 300], [115, 72, 268],
    [131, 103, 235], [147, 131, 205], [163, 160, 174], [177, 185, 147],
    [191, 209, 121], [203, 212, 98], [214, 214, 77], [223, 217, 59],
    [232, 219, 42], [238, 221, 29]
  ];

  p.setup = function () {
    const container = document.getElementById('riley-canvas-container');
    const canvas = p.createCanvas(LOGICAL_WIDTH, LOGICAL_HEIGHT);
    canvas.parent(container);

    p.noStroke();
    p.ellipseMode(p.CORNER);

    createToggleButton();
    p.windowResized(); // set initial responsive size

    // ---- Listen for navigation event to trigger Matrix-flex pulse ----
    document.addEventListener('rileyPageActivated', () => {
      setTimeout(() => {
        if (!isInteractive) return;

        // If user is already hovering, skip the demo
        const overCanvasNow =
          p.mouseX >= 0 && p.mouseX <= p.width &&
          p.mouseY >= 0 && p.mouseY <= p.height;

        if (overCanvasNow) return;

        demoActive = true;
        demoStartTime = p.millis();
      }, DEMO_DELAY);
    });
  };

  // Keep aspect ratio while respecting both container width AND max-height
  p.windowResized = function () {
    const container = document.getElementById('riley-canvas-container');
    if (!container) return;

    const availableWidth = container.offsetWidth;
    const maxHeight = 600; // Match CSS max-height constraint

    // Calculate height based on aspect ratio
    let newHeight = availableWidth * (LOGICAL_HEIGHT / LOGICAL_WIDTH);
    let newWidth = availableWidth;

    // If height exceeds max, constrain by height instead
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = maxHeight * (LOGICAL_WIDTH / LOGICAL_HEIGHT);
    }

    p.resizeCanvas(newWidth, newHeight);
    scaleFactor = newWidth / LOGICAL_WIDTH;
  };

  p.draw = function () {
    // Convert current mouse position into logical (unscaled) coordinates
    const logicalMouseX = p.mouseX / scaleFactor;
    const logicalMouseY = p.mouseY / scaleFactor;

    const baseBg = p.color('#eae9e4');
    const darkBg = p.color('#8a7d61'); // DARKER for more dramatic Matrix flex

    const overCanvas =
      isInteractive &&
      p.mouseX >= 0 &&
      p.mouseX <= p.width &&
      p.mouseY >= 0 &&
      p.mouseY <= p.height;

    const overSpiral =
      isInteractive && isMouseOverSpiral(logicalMouseX, logicalMouseY);

    // If the user interacts during the demo, cancel the demo immediately
    if (demoActive && overCanvas) {
      demoActive = false;
    }

    // --- Update background & circle intensities ----------------------------
    const t = p.millis() * 0.001;

    let shouldPulse = false;
    let pulseTarget = 0;

    if (isInteractive && overCanvas && !overSpiral) {
      // Normal hover breathing
      pulseTarget = (p.sin(t * 1.5) + 1) / 2; // 0..1, slow breathing
      shouldPulse = true;
    } else if (demoActive) {
      // DRAMATIC Matrix-flex pulse (no mouseover)
      const elapsed = p.millis() - demoStartTime;
      if (elapsed >= DEMO_DURATION) {
        demoActive = false;
      } else {
        const phase = elapsed / DEMO_DURATION;      // 0..1
        
        // Use easeInOutQuad for more dramatic acceleration/deceleration
        let eased = phase < 0.5 
          ? 2 * phase * phase 
          : 1 - Math.pow(-2 * phase + 2, 2) / 2;
        
        pulseTarget = Math.sin(eased * Math.PI);   // 0→1→0 with dramatic easing
        shouldPulse = true;
      }
    }

    if (shouldPulse) {
      // During demo, make background respond MORE dramatically
      const bgSpeed = demoActive ? 0.18 : 0.12;
      const circleSpeed = demoActive ? 0.09 : 0.05;
      
      bgIntensity = p.lerp(bgIntensity, pulseTarget, bgSpeed);
      circlePulseIntensity = p.lerp(circlePulseIntensity, pulseTarget, circleSpeed);
    } else {
      // Fade both back toward original state.
      // When the mouse leaves the canvas, ease back more gently so
      // the transition home is less abrupt.
      const offCanvas = !overCanvas && !demoActive;

      const fadeBgSpeed = offCanvas ? 0.03 : 0.08;      // was 0.08
      const fadeCircleSpeed = offCanvas ? 0.02 : 0.05;  // was 0.05

      bgIntensity = p.lerp(bgIntensity, 0, fadeBgSpeed);
      circlePulseIntensity = p.lerp(circlePulseIntensity, 0, fadeCircleSpeed);
    }

    // Set background color based on intensity
    const currentBg = p.lerpColor(baseBg, darkBg, bgIntensity);
    p.background(currentBg);

    // --- Draw circles (scaled + translated) --------------------------------
    p.push();
    p.scale(scaleFactor);
    p.translate(OFFSET_X, OFFSET_Y);

    if (!isInteractive) {
      drawStatic();
    } else {
      const demoCircles = demoActive && !overCanvas;
      drawInteractive(
        logicalMouseX,
        logicalMouseY,
        overCanvas,
        overSpiral,
        circlePulseIntensity,
        demoCircles
      );
    }

    p.pop();
  };

  // Check if logical mouse position is roughly over the spiral
  function isMouseOverSpiral(logicalMouseX, logicalMouseY) {
    // Center of the outer circle in logical coords
    const centerX = OFFSET_X + OUTER_DIAMETER / 2;
    const centerY = OFFSET_Y + OUTER_DIAMETER / 2;
    const distToCenter = p.dist(logicalMouseX, logicalMouseY, centerX, centerY);

    // Radius plus a small margin so the effect starts a bit outside the ring
    const radiusWithMargin = OUTER_DIAMETER / 2 + 40;
    return distToCenter <= radiusWithMargin;
  }

  function drawStatic() {
    for (let i = 0; i < circles.length; i++) {
      const [x, y, d] = circles[i];
      p.fill(i % 2 === 0 ? 0 : 220);
      p.circle(x, y, d);
    }
  }

  function drawInteractive(
    logicalMouseX,
    logicalMouseY,
    overCanvas,
    overSpiral,
    circlePulseIntensity,
    demoCircles
  ) {
    // Mouse relative to translated coordinate system
    const localMouseX = logicalMouseX - OFFSET_X;
    const localMouseY = logicalMouseY - OFFSET_Y;

    const t = p.millis() * 0.001;
    const maxInfluenceRadius = 270;

    for (let i = 0; i < circles.length; i++) {
      let [x, y, d] = circles[i];

      const cx = x + d / 2;
      const cy = y + d / 2;

      const distToMouse = p.dist(localMouseX, localMouseY, cx, cy);
      let influence = 1 - distToMouse / maxInfluenceRadius;
      influence = p.constrain(influence, 0, 1);
      const influenceCurve = p.pow(influence, 1.6);

      const baseGrey = (i % 2 === 0) ? 0 : 220;
      const altGrey  = (i % 2 === 0) ? 220 : 0;

      const wave = (p.sin(t * 2 + i * 0.7) + 1) / 2;
      const mixAmount = influenceCurve * wave;
      let grey = p.lerp(baseGrey, altGrey, mixAmount);

      // --- DRAMATIC "Matrix Flex" pulse for lighter rings -------------------
      const isLightRing = (i % 2 !== 0);
      const shouldPulseLight =
        isLightRing && ((overCanvas && !overSpiral) || demoCircles);

      if (shouldPulseLight) {
        // During demo, go MUCH darker (30 instead of 60) - more dramatic!
        const darkestLightGrey = demoCircles ? 30 : 60;
        const pulsedGrey = p.lerp(220, darkestLightGrey, circlePulseIntensity);

        // Much stronger blend during Matrix flex
        const mixFactor = demoCircles ? 0.95 : 0.7;
        grey = p.lerp(grey, pulsedGrey, mixFactor);
      }

      p.fill(grey);

      // Size pulsing: near-mouse plus DRAMATIC global swell during Matrix flex
      const pulseStrength = 0.04;
      let pulse = 1 + pulseStrength * influenceCurve * p.sin(t * 3 + i * 0.9);

      if (demoCircles) {
        // ALL rings pulse during demo (not just light ones) - MATRIX FLEX!
        const globalSwell = 0.06 * circlePulseIntensity; // Much bigger swell
        pulse += globalSwell;
      }

      const newD = d * pulse;
      const delta = (newD - d) / 2;
      const drawX = x - delta;
      const drawY = y - delta;

      p.circle(drawX, drawY, newD);
    }
  }

  function createToggleButton() {
    const controlsContainer = document.getElementById('riley-controls');
    if (!controlsContainer || controlsContainer.querySelector('button')) return;

    toggleButton = document.createElement('button');
    toggleButton.className = 'video-control-btn';
    toggleButton.title = 'Toggle between static and interactive modes';

    const label = document.createElement('span');
    label.className = 'control-label';
    label.textContent = 'Set to Static';  // starts in interactive mode

    toggleButton.appendChild(label);
    controlsContainer.appendChild(toggleButton);

    toggleButton.addEventListener('click', () => {
      isInteractive = !isInteractive;
      label.textContent = isInteractive ? 'Set to Static' : 'Make Dynamic';
    });
  }
}, 'riley-canvas-container');
