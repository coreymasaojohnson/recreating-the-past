// Vera Molnar-inspired rectangle sketch
// Interactive version with bounce and reset

const molnarRectanglesSketch = (p) => {
  // Original offset values
  const topRowOriginal = [56,14,55,18,69,8,8,0,37,26,62,44,22,7,15,23,9,13,60,63,38,49,26,21,58,70,25,19,66,39,75,37,21];
  const bottomRowOriginal = [58,60,18,50,0,43,33,17,9,37,7,33,38,64,25,33,55,49,50,64,52,14,55,6,16,0,44,0,68,16,24,45,66];
  
  // Current offset values (will be animated)
  let topRowCurrent = [...topRowOriginal];
  let bottomRowCurrent = [...bottomRowOriginal];
  
  // Target offset values for animation
  let topRowTarget = [...topRowOriginal];
  let bottomRowTarget = [...bottomRowOriginal];
  
  // Animation state
  let isAnimating = false;
  let animationProgress = 0;
  let animationDuration = 1200; // ms for smooth animation
  let animationStartTime = 0;
  
  let bounceBtn;
  let resetBtn;

  p.setup = () => {
    let canvas = p.createCanvas(950, 660);
    canvas.parent('molnar-rectangles-container');
    
    // Create Bounce button
    bounceBtn = p.createButton("Bounce");
    bounceBtn.addClass("shuffle-btn");
    bounceBtn.parent('molnar-rectangles-container');
    bounceBtn.mousePressed(startBounce);
    
    // Create Reset button
    resetBtn = p.createButton("Reset");
    resetBtn.addClass("shuffle-btn reset-btn");
    resetBtn.parent('molnar-rectangles-container');
    resetBtn.mousePressed(startReset);
    
    // Draw initial state
    drawRectangles();
    p.noLoop(); // Static until animation starts
  };

  p.draw = () => {
    // Update animation if active
    if (isAnimating) {
      let elapsed = p.millis() - animationStartTime;
      animationProgress = p.constrain(elapsed / animationDuration, 0, 1);
      
      // Easing function for smooth motion (ease-in-out)
      let t = easeInOutCubic(animationProgress);
      
      // Interpolate between current and target
      for (let i = 0; i < topRowCurrent.length; i++) {
        topRowCurrent[i] = p.lerp(
          topRowCurrent[i], 
          topRowTarget[i], 
          t / (1 / (1 - animationProgress + 0.01)) // Smooth interpolation
        );
        bottomRowCurrent[i] = p.lerp(
          bottomRowCurrent[i], 
          bottomRowTarget[i], 
          t / (1 / (1 - animationProgress + 0.01))
        );
      }
      
      // Check if animation complete
      if (animationProgress >= 1) {
        isAnimating = false;
        // Snap to final values
        topRowCurrent = [...topRowTarget];
        bottomRowCurrent = [...bottomRowTarget];
        p.noLoop();
      }
    }
    
    drawRectangles();
  };

  function drawRectangles() {
    p.background("#e6e4e5");
    
    // Draw rectangles
    let rectangleX = 135;
    let rectangleY = 36;
    let rectangleY2 = 272;
    
    p.fill("#2f2725");
    p.noStroke();
    
    for (let i = 0; i < 33; i++) {
      p.rect(rectangleX, rectangleY + topRowCurrent[i], 19, 188);
      p.rect(rectangleX, rectangleY2 + bottomRowCurrent[i], 19, 188);
      rectangleX += 21;
    }
  }

  function startBounce() {
    if (isAnimating) return; // Prevent multiple clicks during animation
    
    // Store current as starting point
    let topRowStart = [...topRowCurrent];
    let bottomRowStart = [...bottomRowCurrent];
    
    // Generate random target offsets within specified ranges
    topRowTarget = [];
    bottomRowTarget = [];
    
    for (let i = 0; i < 33; i++) {
      // Top row: top of rect between 30-78px from top (rect is 172px tall, bottom at 250px max)
      // Base Y is 36, so offset range: -6 to 42
      topRowTarget.push(p.random(-6, 42));
      
      // Bottom row: top of rect between 240-298px from top (rect is 172px tall, bottom at 470px max)
      // Base Y is 272, so offset range: -32 to 26
      bottomRowTarget.push(p.random(-32,60));
    }
    
    // Reset animation
    topRowCurrent = topRowStart;
    bottomRowCurrent = bottomRowStart;
    animationProgress = 0;
    animationStartTime = p.millis();
    isAnimating = true;
    
    p.loop();
  }

  function startReset() {
    if (isAnimating) return; // Prevent multiple clicks during animation
    
    // Store current as starting point
    let topRowStart = [...topRowCurrent];
    let bottomRowStart = [...bottomRowCurrent];
    
    // Set target to original values
    topRowTarget = [...topRowOriginal];
    bottomRowTarget = [...bottomRowOriginal];
    
    // Reset animation
    topRowCurrent = topRowStart;
    bottomRowCurrent = bottomRowStart;
    animationProgress = 0;
    animationStartTime = p.millis();
    isAnimating = true;
    
    p.loop();
  }

  // Easing function for smooth animation
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