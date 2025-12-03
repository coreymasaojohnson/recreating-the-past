let video;
let videoScale = 8; 
let cols, rows;
let yOffsets = []; 
let grid = [];
let frameCounter = 0;
let videoReady = false;

// Raindrop system
let raindrops = [];

// ═══════════════════════════════════════════════════════════════
// ⚙️ BRIGHTNESS CONTROL PANEL
// ═══════════════════════════════════════════════════════════════

// MAIN MATRIX EFFECT BRIGHTNESS:
let matrixDarknessThreshold = 0.01;    // Skip pixels darker than this (0-1). Lower = more dark areas visible
let matrixGammaCorrection = 1.2;       // Contrast punch (>1 = brighter highlights). Try 1.0-1.5
let matrixGreenMin = 120;               // Minimum green value (0-255). Lower = darker greens
let matrixGreenMax = 255;              // Maximum green value (0-255). Higher = brighter greens
let matrixAlphaMin = 100;               // Minimum opacity (0-255). Higher = more visible in dark areas
let matrixAlphaMax = 255;              // Maximum opacity (0-255)
let matrixNoiseAmount = 0.1;          // Random brightness variation (0-0.2). Higher = more noise

// RAINDROP BRIGHTNESS:
let raindropTailThreshold = 0.05;     // Show raindrop tail if video is brighter than this (0-1)
let raindropBrightnessBoost = 0.3;    // How much to boost underlying brightness (0-1). Higher = brighter tails
let raindropTailGamma = 0.8;          // Tail contrast (<1 = softer, >1 = punchier)
let raindropTailAlphaMin = 100;       // Minimum tail opacity (0-255)
let raindropTailAlphaMax = 255;       // Maximum tail opacity (0-255)

// ═══════════════════════════════════════════════════════════════

// Improved color palette with better contrast
let hexValues = [
  "#000000", "#001a00", "#003300", "#004d00", "#006600",
  "#008000", "#00a000", "#00c000", "#00e000", "#00ff00",
  "#33ff33", "#66ff66", "#99ff99", "#ccffcc", "#ffffff"
];

let palette = [];

// Tail gradient for raindrops (3 characters per hue)
let raindropTailColors = [
  "#ffffff", "#ffffff", "#ffffff",  // 3 white
  "#ccffcc", "#ccffcc", "#ccffcc",  // 3 pale green
  "#99ff99", "#99ff99", "#99ff99",  // 3 light green
  "#66ff66", "#66ff66", "#66ff66",  // 3 medium green
  "#33ff33", "#33ff33", "#33ff33",  // 3 darker green
  "#00ff00", "#00ff00", "#00ff00"   // 3 pure green
];

// Characters ordered from lightest/sparsest to darkest/densest
let chars = " .'`,:;|/\\-_Il1i!<>^\"~+][}{)()?7ｲﾉｼﾂｸtfjrﾃﾄﾕﾘﾚﾛvnxzsceky2345ｱｳｴｵｶｷｹｺｻｽｾｿﾀﾁﾅﾆﾇﾈﾊﾋﾌﾍﾔﾖﾗﾙﾜﾝaeguTLFJYpqdbVCXZK6890SUERNAPHｦﾎﾏﾐﾑﾒﾓDGBQOZMW#*&%@$";

let raindropTailLength = 18;

function setup() {
  createCanvas(640, 480 + 270);
  pixelDensity(1);
  
  for (let i = 0; i < hexValues.length; i++) {
    palette.push(color(hexValues[i]));
  }
  
  video = createVideo(['matrix_source.mp4'], videoLoaded);
  video.volume(0);
  video.hide();
  
  textSize(videoScale);
  textFont('monospace');
  textAlign(CENTER, CENTER);
}

function videoLoaded() {
  cols = floor(640 / videoScale);
  rows = floor(480 / videoScale);
  
  video.size(cols, rows);
  
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      grid[y][x] = chars.charAt(floor(random(chars.length)));
    }
  }
  
  for (let i = 0; i < cols; i++) {
    yOffsets[i] = random(480);
  }
  
  video.loop();
  videoReady = true;
}

function draw() {
  background(0, 180);
  
  if (!videoReady) {
    fill(0, 255, 0);
    text("LOADING...", width/2, height/2);
    return;
  }
  
  video.loadPixels();
  
  let expectedLength = cols * rows * 4;
  if (video.pixels.length < expectedLength) {
    return;
  }
  
  frameCounter++;
  
  // AUTO-CONTRAST
  let minB = 255;
  let maxB = 0;
  for (let i = 0; i < video.pixels.length; i += 4) {
    let r = video.pixels[i + 0];
    let g = video.pixels[i + 1];
    let b = video.pixels[i + 2];
    let brightness = (r + g + b) / 3;
    if (brightness < minB) minB = brightness;
    if (brightness > maxB) maxB = brightness;
  }
  let rangeB = maxB - minB;
  if (rangeB < 1) rangeB = 1;
  
  // Spawn new raindrops
  if (frameCounter % 5 === 0 && random(1) < 0.25) {
    let newDroplet = {
      x: floor(random(cols)) * videoScale + videoScale / 2,
      y: 0,
      speed: random(0.8, 1.5) * videoScale,
      tail: []
    };
    
    for (let i = 0; i < raindropTailLength; i++) {
      newDroplet.tail.push({
        char: chars.charAt(floor(random(chars.length))),
        y: -i * videoScale
      });
    }
    
    raindrops.push(newDroplet);
  }
  
  // Draw matrix effect
  for (let x = 0; x < cols; x++) {
    yOffsets[x] += videoScale * 0.5; 
    if (yOffsets[x] > 480) yOffsets[x] = -videoScale * 5;
    
    for (let y = 0; y < rows; y++) {
      let sx = x * videoScale + videoScale / 2;
      let sy = (y * videoScale + yOffsets[x]) % 480;
      if (sy < 0) sy += 480;
      
      let sampleY = floor(sy / videoScale);
      sampleY = constrain(sampleY, 0, rows - 1);
      
      let index = (x + sampleY * cols) * 4;
      
      if (index >= video.pixels.length - 3) continue;
      
      let r = video.pixels[index + 0];
      let g = video.pixels[index + 1];
      let b = video.pixels[index + 2];
      
      let brightness = (r + g + b) / 3;
      
      let norm = (brightness - minB) / rangeB;
      norm = constrain(norm, 0, 1);
      
      if (norm < matrixDarknessThreshold) continue;
      
      norm += random(-matrixNoiseAmount, matrixNoiseAmount);
      norm = constrain(norm, 0, 1);
      
      norm = pow(norm, matrixGammaCorrection);
      
      if (frameCounter % 10 === 0 && random(1) < 0.2) {
        let charIndex = floor(map(norm, 0, 1, 0, chars.length - 1));
        charIndex = constrain(charIndex, 0, chars.length - 1);
        grid[y][x] = chars.charAt(charIndex);
      }
      
      let greenVal = lerp(matrixGreenMin, matrixGreenMax, norm);
      let alpha = lerp(matrixAlphaMin, matrixAlphaMax, norm);
      
      noStroke();
      fill(0, greenVal, 70, alpha);
      
      if (norm > 0.85) {
        textStyle(BOLD);
      } else {
        textStyle(NORMAL);
      }
      
      text(grid[y][x], sx, sy);
    }
  }
  
  // Draw raindrops
  for (let i = raindrops.length - 1; i >= 0; i--) {
    let droplet = raindrops[i];
    
    droplet.y += droplet.speed;
    
    for (let j = 0; j < droplet.tail.length; j++) {
      droplet.tail[j].y += droplet.speed;
      
      if (frameCounter % 3 === 0 && random(1) < 0.5) {
        droplet.tail[j].char = chars.charAt(floor(random(chars.length)));
      }
    }
    
    for (let j = droplet.tail.length - 1; j >= 0; j--) {
      let tailChar = droplet.tail[j];
      
      if (tailChar.y >= 0 && tailChar.y < 480) {
        let dropletX = floor(droplet.x / videoScale);
        let dropletY = floor(tailChar.y / videoScale);
        dropletX = constrain(dropletX, 0, cols - 1);
        dropletY = constrain(dropletY, 0, rows - 1);
        
        let index = (dropletX + dropletY * cols) * 4;
        
        if (index < video.pixels.length - 3) {
          let r = video.pixels[index + 0];
          let g = video.pixels[index + 1];
          let b = video.pixels[index + 2];
          let brightness = (r + g + b) / 3;
          
          let norm = (brightness - minB) / rangeB;
          norm = constrain(norm, 0, 1);
          
          noStroke();
          
          if (j < 3) {
            fill(raindropTailColors[j]);
            textStyle(BOLD);
            text(tailChar.char, droplet.x, tailChar.y);
          } else {
            if (norm > raindropTailThreshold) {
              let boostedNorm = constrain(norm + raindropBrightnessBoost, 0, 1);
              boostedNorm = pow(boostedNorm, raindropTailGamma);
              
              let baseColor = color(raindropTailColors[j]);
              
              let r = red(baseColor) * boostedNorm;
              let g = green(baseColor) * boostedNorm;
              let b = blue(baseColor) * boostedNorm;
              let alpha = lerp(raindropTailAlphaMin, raindropTailAlphaMax, boostedNorm);
              
              fill(r, g, b, alpha);
              textStyle(NORMAL);
              text(tailChar.char, droplet.x, tailChar.y);
            }
          }
        }
      }
    }
    
    if (droplet.tail[droplet.tail.length - 1].y > 480) {
      raindrops.splice(i, 1);
    }
  }
  
  // Draw source video
  push();
  stroke(0, 255, 0);
  strokeWeight(2);
  line(0, 480, width, 480);
  
  let previewWidth = 480;
  let previewHeight = 270;
  let previewX = (width - previewWidth) / 2;
  
  image(video, previewX, 490, previewWidth, previewHeight);
  
  noStroke();
  fill(0, 255, 0);
  textAlign(LEFT, TOP);
  textSize(12);
  text("SOURCE VIDEO", previewX + 10, 495);
  pop();
}