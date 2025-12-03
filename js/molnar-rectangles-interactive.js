// Vera Molnar-inspired rectangle sketch
// Interactive version with bounce, reset, and wave effect

const molnarRectanglesSketch = (p) => {
  // Original offset values
  const topRowOriginal = [56,14,55,18,69,8,8,0,37,26,62,44,22,7,15,23,9,13,60,63,38,49,26,21,58,70,25,19,66,39,75,37,21];
  const bottomRowOriginal = [58,60,23,50,0,43,33,17,9,37,7,33,38,64,25,33,55,49,50,64,52,14,55,6,16,2,44,0,68,26,24,45,66];
  
  // Current offset values (will be animated)
  let topRowCurrent = [...topRowOriginal];
  let bottomRowCurrent = [...bottomRowOriginal];
  
  // Target offset values for standard animation (bounce/reset)
  let topRowTarget = [...topRowOriginal];
  let bottomRowTarget = [...bottomRowOriginal];
  
  // Animation state for linear transitions (bounce/reset)
  let isAnimating = false;
  let animationProgress = 0;
  let animationDuration = 1200; // ms for smooth animation
  let animationStartTime = 0;
  
  // Animation state for Wave effect
  let isWaving = false;
  let waveStartTime = 0;
  const WAVE_SPEED = 70; // ms delay per column
  const WAVE_PEAK_WIDTH = 320; // duration of the "swell" in ms
  const TOTAL_WAVE_TIME = 33 * WAVE_SPEED + WAVE_PEAK_WIDTH * 4;
  
  // Store positions before wave starts (for returning after manual wave)
  let topRowPreWave = [...topRowOriginal];
  let bottomRowPreWave = [...bottomRowOriginal];
  
  // Scale factor for responsive sizing
  let scaleFactor = 1;
  
  // Base dimensions (original design dimensions)
  const BASE_WIDTH = 950;
  const BASE_HEIGHT = 660; // Original proportions
  
  let bounceBtn;
  let resetBtn;

  p.setup = () => {
    // Get container and calculate responsive size
    let container = document.getElementById('molnar-rectangles-container');
    let containerWidth = container.clientWidth;
    
    // Calculate canvas size to fit container while maintaining aspect ratio
    let canvasWidth = containerWidth;
    let canvasHeight = (canvasWidth / BASE_WIDTH) * BASE_HEIGHT;
    
    // Calculate scale factor
    scaleFactor = canvasWidth / BASE_WIDTH;
    
    let canvas = p.createCanvas(canvasWidth, canvasHeight);
    canvas.parent('molnar-rectangles-container');
    
    // Create Bounce button
    bounceBtn = p.createButton("Bounce");
    bounceBtn.addClass("inline-control-btn");
    bounceBtn.parent('molnar-2-controls');
    bounceBtn.mousePressed(startBounce);
    
    // Create Wave button
    let waveBtn = p.createButton("Wave");
    waveBtn.addClass("inline-control-btn");
    waveBtn.parent('molnar-2-controls');
    waveBtn.mousePressed(startManualWave);
    
    // Create Reset button
    resetBtn = p.createButton("Reset");
    resetBtn.addClass("inline-control-btn");
    resetBtn.parent('molnar-2-controls');
    resetBtn.mousePressed(startReset);
    
    // Draw initial state
    drawRectangles();
    p.noLoop(); // Static until animation starts
    
    // Listen for navigation event to trigger the wave
    document.addEventListener('molnar2PageActivated', () => {
      setTimeout(() => {
        // Trigger the wave effect
        startWave();
      }, 2000);
    });
  };

  p.draw = () => {
    p.background("#e6e4e5");

    // --- HANDLE WAVE ANIMATION ---
    if (isWaving) {
      let elapsed = p.millis() - waveStartTime;
      
      for (let i = 0; i < 33; i++) {
        // Determine when the wave hits this specific column
        let peakTime = i * WAVE_SPEED;
        let timeDiff = elapsed - peakTime;
        
        // Calculate intensity using a Gaussian bell curve (0.0 to 1.0)
        // This creates a smooth pulse that travels across
        let sigma = WAVE_PEAK_WIDTH / 2;
        let intensity = Math.exp(-(timeDiff * timeDiff) / (2 * sigma * sigma));
        
        // Target positions for "Max Separation" (moving away from center)
        // Top row moves UP (negative offset), Bottom row moves DOWN (large positive offset)
        let waveTopTarget = -20; 
        let waveBottomTarget = 90; 
        
        // Interpolate between the PRE-WAVE position and the WAVE target
        // This allows the wave to work from wherever the rectangles currently are
        topRowCurrent[i] = p.lerp(topRowPreWave[i], waveTopTarget, intensity);
        bottomRowCurrent[i] = p.lerp(bottomRowPreWave[i], waveBottomTarget, intensity);
      }
      
      // End wave and return to pre-wave positions
      if (elapsed > TOTAL_WAVE_TIME) {
        isWaving = false;
        topRowCurrent = [...topRowPreWave];
        bottomRowCurrent = [...bottomRowPreWave];
        p.noLoop();
      }
    } 
    
    // --- HANDLE LINEAR ANIMATION (Bounce / Reset) ---
    else if (isAnimating) {
      let elapsed = p.millis() - animationStartTime;
      animationProgress = p.constrain(elapsed / animationDuration, 0, 1);
      
      // Easing function for smooth motion (ease-in-out)
      let t = easeInOutCubic(animationProgress);
      
      // Interpolate between current and target
      for (let i = 0; i < topRowCurrent.length; i++) {
        topRowCurrent[i] = p.lerp(
          topRowCurrent[i], 
          topRowTarget[i], 
          t / (1 / (1 - animationProgress + 0.01))
        );
        bottomRowCurrent[i] = p.lerp(
          bottomRowCurrent[i], 
          bottomRowTarget[i], 
          t / (1 / (1 - animationProgress + 0.01))
        );
      }
      
      if (animationProgress >= 1) {
        isAnimating = false;
        topRowCurrent = [...topRowTarget];
        bottomRowCurrent = [...bottomRowTarget];
        p.noLoop();
      }
    }
    
    drawRectangles();
  };

  function drawRectangles() {
    // Base coordinates (original design dimensions)
    let baseRectangleX = 135;
    let baseRectangleY = 40; 
    let baseRectangleY2 = 298; 
    let baseRectWidth = 19;
    let baseRectHeight = 209; 
    let baseSpacing = 21;
    
    // Scale all coordinates
    let rectangleX = baseRectangleX * scaleFactor;
    let rectangleY = baseRectangleY * scaleFactor;
    let rectangleY2 = baseRectangleY2 * scaleFactor;
    let rectWidth = baseRectWidth * scaleFactor;
    let rectHeight = baseRectHeight * scaleFactor;
    let spacing = baseSpacing * scaleFactor;
    
    p.fill("#2f2725");
    p.noStroke();
    
    for (let i = 0; i < 33; i++) {
      let topOffset = topRowCurrent[i] * scaleFactor;
      let bottomOffset = bottomRowCurrent[i] * scaleFactor;
      
      p.rect(rectangleX, rectangleY + topOffset, rectWidth, rectHeight);
      p.rect(rectangleX, rectangleY2 + bottomOffset, rectWidth, rectHeight);
      rectangleX += spacing;
    }
  }

  function startWave() {
    // Automatic wave on page load - use original positions
    topRowPreWave = [...topRowOriginal];
    bottomRowPreWave = [...bottomRowOriginal];
    
    isWaving = true;
    isAnimating = false; // Override any other animation
    waveStartTime = p.millis();
    p.loop();
  }
  
  function startManualWave() {
    // Manual wave button - preserve CURRENT positions
    topRowPreWave = [...topRowCurrent];
    bottomRowPreWave = [...bottomRowCurrent];
    
    isWaving = true;
    isAnimating = false; // Cancel any other animation
    waveStartTime = p.millis();
    p.loop();
  }

  function startBounce() {
    topRowTarget = [];
    bottomRowTarget = [];
    
    for (let i = 0; i < 33; i++) {
      topRowTarget.push(p.random(-6, 42));
      bottomRowTarget.push(p.random(-32, 70));
    }
    
    animationProgress = 0;
    animationStartTime = p.millis();
    isAnimating = true;
    isWaving = false; // Cancel wave if user clicks button
    
    p.loop();
  }

  function startReset() {
    topRowTarget = [...topRowOriginal];
    bottomRowTarget = [...bottomRowOriginal];
    
    animationProgress = 0;
    animationStartTime = p.millis();
    isAnimating = true;
    isWaving = false;
    
    p.loop();
  }

  function easeInOutCubic(t) {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
};

// Initialize the sketch when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMolnarRectanglesSketch);
} else {
  initMolnarRectanglesSketch();
}

function initMolnarRectanglesSketch() {
  const container = document.getElementById('molnar-rectangles-container');
  if (container) {
    new p5(molnarRectanglesSketch);
  }
}