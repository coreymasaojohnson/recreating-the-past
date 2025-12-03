// Molnar-inspired overlapping squares - STATIC BACKGROUND VERSION

let cols = 10;
let rows = 10;

// --- AESTHETIC UPDATE: Using final values ---
// HSB: HUE=318 (warmer), SAT=65 (richer), BRIGHTNESS=45 (for visibility)
const HUE = 199;
const SATURATION = 100;
const BRIGHTNESS = 55; 
const MIN_ALPHA = 140;
const MAX_ALPHA = 150;

// Geometry for 9:10 Aspect Ratio
const BASE_HEIGHT = 70;   // Height of the rectangle
const BASE_WIDTH  = 63;   // Width of the rectangle (70 * 0.9)
let spacingX = 54;        // Horizontal spacing (60 * 0.9)
let spacingY = 60;        // Vertical spacing

// Jitter and Grain
let jitterX = 10;
let rowJitterY = 20;      // Shared noise-based vertical jitter (Kept from original file)
let localJitterY = 5;     // Local random vertical jitter (Kept from original file)
let grainDensity = 0.08;  // Slightly increased from original 0.05
// ------------------------------------------

function setup() {
  let container = document.getElementById('molnar-art');
  if (!container) {
    console.error('Container not found!');
    return;
  }

  // Canvas size remains dynamic based on the responsive container (#molnar-art)
  let w = container.offsetWidth;
  let h = container.offsetHeight || window.innerHeight;
  
  console.log('Creating canvas:', w, 'x', h);
  
  let canvas = createCanvas(w, h);
  canvas.parent('molnar-art');
  
  rectMode(CORNER);
  colorMode(HSB, 360, 100, 100, 255);
  
  // Keep the sketch static for the background
  noLoop();
}

function draw() {
  clear(); // transparent background
  
  randomSeed(3);
  noiseSeed(42);
  
  // Grid size and centering calculations
  let gridW = (cols - 1) * spacingX + BASE_WIDTH;
  let gridH = (rows - 1) * spacingY + BASE_HEIGHT;
  let offsetX = (width - gridW) / 2;
  let offsetY = (height - gridH) / 2;

  // Draw squares
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let baseX = offsetX + i * spacingX;
      let baseY = offsetY + j * spacingY;

      // Vertical displacement based on noise and random jitter
      let n = noise(i * 0.3, j * 0.5);
      let sharedOffsetY = map(n, 0, 1, -rowJitterY, rowJitterY);

      let x = baseX + random(-jitterX, jitterX);
      let y = baseY + sharedOffsetY + random(-localJitterY, localJitterY);
      
      let w = BASE_WIDTH + random(-4, 4); 
      let h = BASE_HEIGHT + random(-4, 4); 
      
      // Apply the final alpha range
      let a = random(MIN_ALPHA, MAX_ALPHA); 

      noStroke();
      // Apply the final HUE, SATURATION, and BRIGHTNESS
      fill(HUE, SATURATION, BRIGHTNESS, a); 
      rect(x, y, w, h);

      // Add grain (per-square, slow but simple for static background)
      let area = w * h;
      let count = int(area * grainDensity); 
      
      strokeWeight(1);

      for (let k = 0; k < count; k++) {
        let gx = x + random(w);
        let gy = y + random(h);
        
        let b = random(35, 55);
        let ga = random(20, 60);
        
        // Apply the final HUE/SATURATION to the grain dots
        stroke(HUE, SATURATION, b, ga);
        point(gx, gy);
      }
    }
  }
  
  console.log('Drawing complete');
}

function windowResized() {
  let container = document.getElementById('molnar-art');
  if (!container) return;
  
  let w = container.offsetWidth;
  let h = container.offsetHeight || window.innerHeight;
  
  resizeCanvas(w, h);
  redraw();
}