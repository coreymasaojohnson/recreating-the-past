// Molnar-inspired overlapping squares
// Smooth shuffle: squares move from old positions to new ones (no redraw jitter)
// Instance mode for embedding in portfolio

const molnarSketch = (p) => {
  let cols = 10;
  let rows = 10;

  // --- BASE CANVAS DIMENSIONS ---
  const BASE_CANVAS_WIDTH = 720;
  const BASE_CANVAS_HEIGHT = 800;
  let scaleFactor = 1;

  // --- DIMENSION VARIABLES for 9:10 Aspect Ratio ---
  const RECT_RATIO = 0.9;
  const BASE_HEIGHT = 70;                       // Base height
  const BASE_WIDTH  = BASE_HEIGHT * RECT_RATIO; // Base width = 63
  
  // --- SPACING ADJUSTMENT ---
  const BASE_SPACING_Y = 60; 
  const BASE_SPACING_X = 60; 
  let spacingX = BASE_SPACING_X * RECT_RATIO; // Horizontal spacing adjusted by 0.9 = 54
  let spacingY = BASE_SPACING_Y;              // Vertical spacing remains 60

  let jitterX      = 10;
  let localJitterY = 20;

  let grainDensity = 0.6;

  // --- AESTHETIC UPDATE ---
  const HUE = 319;
  const SATURATION = 65;
  const BRIGHTNESS = 18;
  const MIN_ALPHA = 140;
  const MAX_ALPHA = 155;

  // Layout + animation state
  let currentRandomSeed = 3;
  let currentLayout = [];
  let targetLayout = null;
  let state = "static"; // "static" | "waiting" | "transition"
  let waitStart = 0;
  let waitDuration = 500;
  let transitionStart = 0;
  let transitionDuration = 800;

  let squareGrainTexture;
  let backgroundGrainTexture;

  let shuffleBtn;
  let canvasContainer;

  // Helper: is Molnar 1 page currently active?
  function isMolnar1PageActive() {
    const page = document.getElementById('page-molnar-1');
    return page && page.classList.contains('active');
  }

  p.setup = () => {
    canvasContainer = p.select('#molnar-canvas-container');
    
    // Responsive sizing based on container
    let container = document.getElementById('molnar-canvas-container');
    let containerWidth = container.clientWidth;
    
    let idealWidth = containerWidth;
    let idealHeight = (idealWidth / BASE_CANVAS_WIDTH) * BASE_CANVAS_HEIGHT;
    
    let maxHeight = 600; // Match CSS max-height
    if (window.innerWidth <= 1024) maxHeight = 500;
    if (window.innerWidth <= 768) maxHeight = 400;
    
    let canvasWidth, canvasHeight;
    
    if (idealHeight > maxHeight) {
      canvasHeight = maxHeight;
      canvasWidth = (canvasHeight / BASE_CANVAS_HEIGHT) * BASE_CANVAS_WIDTH;
    } else {
      canvasWidth = idealWidth;
      canvasHeight = idealHeight;
    }
    
    scaleFactor = canvasWidth / BASE_CANVAS_WIDTH;
    
    let canvas = p.createCanvas(canvasWidth, canvasHeight);
    canvas.parent('molnar-canvas-container');
    
    p.frameRate(60);
    p.rectMode(p.CORNER);
    
    generateSquareGrain(); 
    generateBackgroundGrain();

    // Initial layout
    currentLayout = generateLayout(currentRandomSeed);

    // Shuffle button
    shuffleBtn = p.createButton("Shuffle");
    shuffleBtn.addClass("inline-control-btn");
    shuffleBtn.parent('molnar-1-controls');
    shuffleBtn.mousePressed(startShuffle);

    // Draw once initially
    p.noLoop();

    // --- Listen for navigation event to trigger a double shuffle ---
    document.addEventListener('molnar1PageActivated', () => {
      // Wait 2 seconds before first shuffle
      setTimeout(() => {
        if (!isMolnar1PageActive()) return;

        // Only auto-fire if the sketch is at rest
        if (state === 'static') {
          startShuffle(); // first shuffle

          // Second shuffle 1.5s later
          setTimeout(() => {
            if (!isMolnar1PageActive()) return;
            startShuffle();
          }, 1500);
        }
      }, 2800);
    });
  };

  p.draw = () => {
    // Background + grain
    p.colorMode(p.RGB, 255);
    p.background(251, 251, 253); 
    p.image(backgroundGrainTexture, 0, 0); 
    p.colorMode(p.HSB, 360, 100, 100, 255); 

    if (state === "static") {
      // Draw the current (fixed) layout, then stop looping
      drawLayout(currentLayout);
      p.noLoop();
    } else if (state === "waiting") {
      drawLayout(currentLayout);
      if (p.millis() - waitStart >= waitDuration) {
        state = "transition";
        transitionStart = p.millis();
      }
    } else if (state === "transition") {
      if (!targetLayout || currentLayout.length !== targetLayout.length) {
        // Fallback safety: if something went wrong, just snap to target
        currentLayout = targetLayout || currentLayout;
        state = "static";
        drawLayout(currentLayout);
        p.noLoop();
        return;
      }

      let t = (p.millis() - transitionStart) / transitionDuration;
      t = p.constrain(t, 0, 1);

      // Interpolate each square from currentLayout -> targetLayout
      const interpolatedLayout = [];
      for (let i = 0; i < currentLayout.length; i++) {
        const from = currentLayout[i];
        const to   = targetLayout[i];

        interpolatedLayout.push({
          x: p.lerp(from.x, to.x, t),
          y: p.lerp(from.y, to.y, t),
          w: p.lerp(from.w, to.w, t),
          h: p.lerp(from.h, to.h, t),
          a: p.lerp(from.a, to.a, t)
        });
      }

      // Draw just once in this frame (no extra pass at t === 1)
      drawLayout(interpolatedLayout);

      if (t >= 1) {
        // Commit new layout & stop: last interpolated frame is already on screen
        currentLayout = targetLayout;
        targetLayout = null;
        state = "static";
        p.noLoop();
      }
    }
  };

  function startShuffle() {
    // If we’re mid-transition, capture the *current* visual positions
    // and use those as the new "from" layout (like the bounce sketch).
    if (state === "transition" && targetLayout && currentLayout.length === targetLayout.length) {
      let elapsed = p.millis() - transitionStart;
      let t = p.constrain(elapsed / transitionDuration, 0, 1);

      const snapshot = [];
      for (let i = 0; i < currentLayout.length; i++) {
        const from = currentLayout[i];
        const to   = targetLayout[i];
        snapshot.push({
          x: p.lerp(from.x, to.x, t),
          y: p.lerp(from.y, to.y, t),
          w: p.lerp(from.w, to.w, t),
          h: p.lerp(from.h, to.h, t),
          a: p.lerp(from.a, to.a, t)
        });
      }
      currentLayout = snapshot;
    }

    // Generate a new random target layout
    const nextRandomSeed = p.floor(p.random(1e6));
    targetLayout = generateLayout(nextRandomSeed);
    currentRandomSeed = nextRandomSeed;

    if (state === "static") {
      // First click from rest: keep the short pause before motion
      state = "waiting";
      waitStart = p.millis();
    } else {
      // If we were already waiting or transitioning, respond immediately
      state = "transition";
      transitionStart = p.millis();
    }

    p.loop();
  }

  // Generate a deterministic layout of squares for a given seed
  function generateLayout(seedR) {
    const layout = [];

    p.randomSeed(seedR);

    // Scale all dimensions
    let scaledSpacingX  = spacingX * scaleFactor;
    let scaledSpacingY  = spacingY * scaleFactor;
    let scaledBaseWidth = BASE_WIDTH * scaleFactor;
    let scaledBaseHeight = BASE_HEIGHT * scaleFactor;
    let scaledJitterX   = jitterX * scaleFactor;
    let scaledJitterY   = localJitterY * scaleFactor;

    // Grid size and centering
    let gridW = (cols - 1) * scaledSpacingX + scaledBaseWidth;
    let gridH = (rows - 1) * scaledSpacingY + scaledBaseHeight;
    let offsetX = (p.width  - gridW) / 2;
    let offsetY = (p.height - gridH) / 2;

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        let baseX = offsetX + i * scaledSpacingX;
        let baseY = offsetY + j * scaledSpacingY;

        let x = baseX + p.random(-scaledJitterX, scaledJitterX);
        let y = baseY + p.random(-scaledJitterY, scaledJitterY);

        let h = scaledBaseHeight + p.random(-4, 4) * scaleFactor; 
        let w = scaledBaseWidth  + p.random(-4, 4) * scaleFactor; 
        
        let a = p.random(MIN_ALPHA, MAX_ALPHA);

        layout.push({ x, y, w, h, a });
      }
    }

    return layout;
  }

  function generateBackgroundGrain() {
    backgroundGrainTexture = p.createGraphics(p.width, p.height);

    backgroundGrainTexture.colorMode(p.HSB, 360, 100, 100, 255);
    backgroundGrainTexture.clear();

    const subtleDensity = 0.05; 
    const area = p.width * p.height;
    const count = p.int(area * subtleDensity);

    backgroundGrainTexture.strokeWeight(scaleFactor);
    
    for (let k = 0; k < count; k++) {
      let gx = p.random(p.width);
      let gy = p.random(p.height);

      let b = p.random(10, 30);
      let a = p.random(5, 15);

      backgroundGrainTexture.stroke(290, 5, b, a); 
      backgroundGrainTexture.point(gx, gy);
    }
  }

  // Generate the opaque square grain stamp
  function generateSquareGrain() {
    const MAX_HEIGHT = (BASE_HEIGHT + 10) * scaleFactor; 
    const MAX_WIDTH  = (BASE_WIDTH  + 10) * scaleFactor; 
    
    squareGrainTexture = p.createGraphics(MAX_WIDTH, MAX_HEIGHT);

    squareGrainTexture.colorMode(p.HSB, 360, 100, 100, 255);
    squareGrainTexture.rectMode(p.CORNER);
    
    squareGrainTexture.noStroke();
    squareGrainTexture.fill(HUE, SATURATION, BRIGHTNESS, 255); 
    squareGrainTexture.rect(0, 0, MAX_WIDTH, MAX_HEIGHT); 

    let area = MAX_WIDTH * MAX_HEIGHT;
    let count = p.int(area * grainDensity);

    squareGrainTexture.strokeWeight(scaleFactor);
    
    for (let k = 0; k < count; k++) {
      let gx = p.random(MAX_WIDTH);
      let gy = p.random(MAX_HEIGHT);

      let b = p.random(35, 55);
      let a = 255;

      squareGrainTexture.stroke(HUE, SATURATION, b, a); 
      squareGrainTexture.point(gx, gy);
    }
  }

  // Draw a given layout (array of {x, y, w, h, a})
  function drawLayout(layout) {
    if (!layout || layout.length === 0) return;

    p.blendMode(p.MULTIPLY);
    for (let i = 0; i < layout.length; i++) {
      const cell = layout[i];
      if (cell.a <= 0) continue;

      p.tint(255, cell.a);
      p.image(squareGrainTexture, cell.x, cell.y, cell.w, cell.h);
      p.noTint();
    }
    p.blendMode(p.BLEND);
  }
};

// Initialize the sketch when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMolnarInteractiveSketch);
} else {
  initMolnarInteractiveSketch();
}

function initMolnarInteractiveSketch() {
  const container = document.getElementById('molnar-canvas-container');
  if (container) {
    new p5(molnarSketch);
  }
}
