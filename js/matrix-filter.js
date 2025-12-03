// Matrix Filter - Instance Mode (won't conflict with other p5 sketches)
console.log('=== MATRIX FILTER SCRIPT LOADING ===');

const matrixFilterSketch = function(p) {
  let video;
  let videoScale = 8; 
  let cols, rows;
  let yOffsets = []; 
  let grid = [];
  let frameCounter = 0;
  let videoReady = false;
  let isActive = false;
  let raindrops = [];

  // Settings
  let matrixDarknessThreshold = 0.01;
  let matrixGammaCorrection = 1.2;
  let matrixGreenMin = 120;
  let matrixGreenMax = 255;
  let matrixAlphaMin = 100;
  let matrixAlphaMax = 255;
  let matrixNoiseAmount = 0.1;
  let raindropTailThreshold = 0.05;
  let raindropBrightnessBoost = 0.3;
  let raindropTailGamma = 0.8;
  let raindropTailAlphaMin = 100;
  let raindropTailAlphaMax = 255;

  let hexValues = [
    "#000000", "#001a00", "#003300", "#004d00", "#006600",
    "#008000", "#00a000", "#00c000", "#00e000", "#00ff00",
    "#33ff33", "#66ff66", "#99ff99", "#ccffcc", "#ffffff"
  ];

  let palette = [];

  let raindropTailColors = [
    "#ffffff", "#ffffff", "#ffffff",
    "#ccffcc", "#ccffcc", "#ccffcc",
    "#99ff99", "#99ff99", "#99ff99",
    "#66ff66", "#66ff66", "#66ff66",
    "#33ff33", "#33ff33", "#33ff33",
    "#00ff00", "#00ff00", "#00ff00"
  ];

  let chars = " .'`,:;|/\\-_Il1i!<>^\"~+][}{)()?7ｲﾉｼﾂｸtfjrﾃﾄﾕﾘﾚﾛvnxzsceky2345ｱｳｴｵｶｷｹｺｻｽｾｿﾀﾁﾅﾆﾇﾈﾊﾋﾌﾍﾔﾖﾗﾙﾜﾝaeguTLFJYpqdbVCXZK6890SUERNAPHｦﾎﾏﾐﾑﾒﾓDGBQOZMW#*&%@$";

  let raindropTailLength = 18;

  p.setup = function() {
    console.log('=== MATRIX FILTER SETUP STARTING ===');
    
    let canvas = p.createCanvas(640, 480);
    
    let container = document.getElementById('matrix-canvas-container');
    if (container) {
      canvas.parent('matrix-canvas-container');
      console.log('✓ Canvas parented to #matrix-canvas-container');
    } else {
      console.error('✗ Container #matrix-canvas-container NOT FOUND');
    }
    
    p.pixelDensity(1);
    
    for (let i = 0; i < hexValues.length; i++) {
      palette.push(p.color(hexValues[i]));
    }
    
    p.textSize(videoScale);
    p.textFont('monospace');
    p.textAlign(p.CENTER, p.CENTER);
    
    console.log('✓ Text settings configured');
    
    document.addEventListener('glitchPageActivated', () => {
      console.log('=== GLITCH PAGE ACTIVATED EVENT ===');
      handlePageActivated();
    });
    
    document.addEventListener('glitchPageDeactivated', () => {
      console.log('=== GLITCH PAGE DEACTIVATED EVENT ===');
      stopEffect();
    });
    
    console.log('✓ Event listeners registered');
    console.log('=== SETUP COMPLETE ===');
  };

  function handlePageActivated() {
    if (isActive && videoReady) {
      console.log('Already active and ready, skipping');
      return;
    }
    startEffect();
  }

  function startEffect() {
    console.log('=== STARTING EFFECT ===');
    isActive = true;
    
    if (!video) {
      console.log('Creating video element from: images/matrix-source.mp4');
      video = p.createVideo('images/matrix-source.mp4', videoLoaded);
      video.hide();
      video.volume(0);
      console.log('Video element created');
    } else if (!videoReady) {
      console.log('Video exists but not ready, calling videoLoaded()');
      videoLoaded();
    } else {
      console.log('Video already exists and is ready');
    }
    
    frameCounter = 0;
    raindrops = [];
    console.log('State reset. isActive =', isActive);
  }

  function videoLoaded() {
    console.log('=== VIDEO LOADED CALLBACK ===');
    
    cols = p.floor(640 / videoScale);
    rows = p.floor(480 / videoScale);
    
    console.log('Grid size:', cols, 'x', rows);
    
    video.size(cols, rows);
    video.loop();
    
    for (let y = 0; y < rows; y++) {
      grid[y] = [];
      for (let x = 0; x < cols; x++) {
        grid[y][x] = chars.charAt(p.floor(p.random(chars.length)));
      }
    }
    
    for (let i = 0; i < cols; i++) {
      yOffsets[i] = p.random(480);
    }
    
    videoReady = true;
    console.log('✓ Effect initialized. videoReady =', videoReady);
  }

  function stopEffect() {
    console.log('=== STOPPING EFFECT ===');
    isActive = false;
    frameCounter = 0;
    raindrops = [];
  }

  p.draw = function() {
    p.background(0, 180);
    
    if (!isActive) {
      p.fill(0, 255, 0);
      p.noStroke();
      p.textSize(20);
      p.textStyle(p.BOLD);
      p.text("READY", p.width/2, p.height/2 - 20);
      
      p.textSize(12);
      p.textStyle(p.NORMAL);
      p.text("Navigate to this page to activate", p.width/2, p.height/2 + 20);
      
      p.noFill();
      p.stroke(0, 255, 0);
      p.strokeWeight(2);
      p.rect(5, 5, p.width-10, p.height-10);
      
      return;
    }
    
    if (!videoReady) {
      p.fill(0, 255, 0);
      p.noStroke();
      p.textSize(20);
      p.textStyle(p.BOLD);
      p.text("LOADING...", p.width/2, p.height/2);
      
      p.push();
      p.translate(p.width/2, p.height/2 + 40);
      p.rotate(p.frameCount * 0.1);
      p.noFill();
      p.stroke(0, 255, 0);
      p.strokeWeight(3);
      p.arc(0, 0, 30, 30, 0, p.PI * 1.5);
      p.pop();
      
      return;
    }
    
    if (!video || !video.elt || video.elt.readyState < 2) {
      p.fill(0, 255, 0);
      p.noStroke();
      p.textSize(20);
      p.text("BUFFERING...", p.width/2, p.height/2);
      return;
    }
    
    video.loadPixels();
    
    let expectedLength = cols * rows * 4;
    if (!video.pixels || video.pixels.length < expectedLength) {
      p.fill(255, 0, 0);
      p.text("PIXEL DATA UNAVAILABLE", p.width/2, p.height/2);
      return;
    }
    
    frameCounter++;
    
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
    
    if (frameCounter % 5 === 0 && p.random(1) < 0.25) {
      let newDroplet = {
        x: p.floor(p.random(cols)) * videoScale + videoScale / 2,
        y: 0,
        speed: p.random(0.8, 1.5) * videoScale,
        tail: []
      };
      
      for (let i = 0; i < raindropTailLength; i++) {
        newDroplet.tail.push({
          char: chars.charAt(p.floor(p.random(chars.length))),
          y: -i * videoScale
        });
      }
      
      raindrops.push(newDroplet);
    }
    
    for (let x = 0; x < cols; x++) {
      yOffsets[x] += videoScale * 0.5; 
      if (yOffsets[x] > 480) yOffsets[x] = -videoScale * 5;
      
      for (let y = 0; y < rows; y++) {
        let sx = x * videoScale + videoScale / 2;
        let sy = (y * videoScale + yOffsets[x]) % 480;
        if (sy < 0) sy += 480;
        
        let sampleY = p.floor(sy / videoScale);
        sampleY = p.constrain(sampleY, 0, rows - 1);
        
        let index = (x + sampleY * cols) * 4;
        
        if (index >= video.pixels.length - 3) continue;
        
        let r = video.pixels[index + 0];
        let g = video.pixels[index + 1];
        let b = video.pixels[index + 2];
        
        let brightness = (r + g + b) / 3;
        
        let norm = (brightness - minB) / rangeB;
        norm = p.constrain(norm, 0, 1);
        
        if (norm < matrixDarknessThreshold) continue;
        
        norm += p.random(-matrixNoiseAmount, matrixNoiseAmount);
        norm = p.constrain(norm, 0, 1);
        
        norm = p.pow(norm, matrixGammaCorrection);
        
        if (frameCounter % 10 === 0 && p.random(1) < 0.2) {
          let charIndex = p.floor(p.map(norm, 0, 1, 0, chars.length - 1));
          charIndex = p.constrain(charIndex, 0, chars.length - 1);
          grid[y][x] = chars.charAt(charIndex);
        }
        
        let greenVal = p.lerp(matrixGreenMin, matrixGreenMax, norm);
        let alpha = p.lerp(matrixAlphaMin, matrixAlphaMax, norm);
        
        p.noStroke();
        p.fill(0, greenVal, 70, alpha);
        
        if (norm > 0.85) {
          p.textStyle(p.BOLD);
        } else {
          p.textStyle(p.NORMAL);
        }
        
        p.text(grid[y][x], sx, sy);
      }
    }
    
    for (let i = raindrops.length - 1; i >= 0; i--) {
      let droplet = raindrops[i];
      
      droplet.y += droplet.speed;
      
      for (let j = 0; j < droplet.tail.length; j++) {
        droplet.tail[j].y += droplet.speed;
        
        if (frameCounter % 3 === 0 && p.random(1) < 0.5) {
          droplet.tail[j].char = chars.charAt(p.floor(p.random(chars.length)));
        }
      }
      
      for (let j = droplet.tail.length - 1; j >= 0; j--) {
        let tailChar = droplet.tail[j];
        
        if (tailChar.y >= 0 && tailChar.y < 480) {
          let dropletX = p.floor(droplet.x / videoScale);
          let dropletY = p.floor(tailChar.y / videoScale);
          dropletX = p.constrain(dropletX, 0, cols - 1);
          dropletY = p.constrain(dropletY, 0, rows - 1);
          
          let index = (dropletX + dropletY * cols) * 4;
          
          if (index < video.pixels.length - 3) {
            let r = video.pixels[index + 0];
            let g = video.pixels[index + 1];
            let b = video.pixels[index + 2];
            let brightness = (r + g + b) / 3;
            
            let norm = (brightness - minB) / rangeB;
            norm = p.constrain(norm, 0, 1);
            
            p.noStroke();
            
            if (j < 3) {
              p.fill(raindropTailColors[j]);
              p.textStyle(p.BOLD);
              p.text(tailChar.char, droplet.x, tailChar.y);
            } else {
              if (norm > raindropTailThreshold) {
                let boostedNorm = p.constrain(norm + raindropBrightnessBoost, 0, 1);
                boostedNorm = p.pow(boostedNorm, raindropTailGamma);
                
                let baseColor = p.color(raindropTailColors[j]);
                
                let r = p.red(baseColor) * boostedNorm;
                let g = p.green(baseColor) * boostedNorm;
                let b = p.blue(baseColor) * boostedNorm;
                let alpha = p.lerp(raindropTailAlphaMin, raindropTailAlphaMax, boostedNorm);
                
                p.fill(r, g, b, alpha);
                p.textStyle(p.NORMAL);
                p.text(tailChar.char, droplet.x, tailChar.y);
              }
            }
          }
        }
      }
      
      if (droplet.tail[droplet.tail.length - 1].y > 480) {
        raindrops.splice(i, 1);
      }
    }
  };
};

// Create the instance
console.log('Creating p5 instance for matrix filter');
new p5(matrixFilterSketch);
console.log('=== MATRIX FILTER SCRIPT LOADED ===');