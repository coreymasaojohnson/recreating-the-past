// Whitney Matrix III Interactive Sketch
// Targets the #whitney-canvas-container div

(function() {
  // ── Config ─────────────────────────────────────────────
  var npoints = 32;      // number of points in a display
  var rate = 20;         // draw is called at 20Hz
  var stepRate = 1/150;  // base rotation speed (per second)

  // Responsive canvas sizing - fit container at 4:3 aspect ratio
  var ASPECT = 4/3;
  var canvasWidth, canvasHeight;

  var xcenter, ycenter;
  var radius;

  // animation state
  var t = 0;             // time accumulator in seconds
  var running = false;   // Start paused, will start on page navigation

  // intro color sequence: single 6-second swap
  var COLOR_SWAP_DURATION = 14;          // 6-second cross-fade
  var ROTATION_START_TIME = COLOR_SWAP_DURATION; // motion starts after swap

  // smooth speed easing after rotation starts
  var SLOW_HOLD = 6;       // first 7s at 20% speed
  var RAMP_DURATION = 17;  // then 25 easing from 25% → 100%

  // mid-animation slowdown at 1:20
  var MID_SLOW_START = 50;     // start slowdown at 1 min 20 sec
  var MID_SLOW_DURATION = 40;  // slow down over 30 seconds
  var MID_RAMP_DURATION = 45;  // ramp back up over 30 seconds
  var MID_SLOW_SPEED = 0.01;   // slow down to 10% speed

  // base colors
  var baseRed;
  var baseWhite;

  // rotation accumulator
  var step = 0;

  // UI
  var canvas;
  var containerDiv;

  // p5 instance setup
  var s = function(p) {
    p.setup = function() {
      // Get the container
      containerDiv = p.select('#whitney-canvas-container');
      
      // Calculate responsive canvas size based on container
      var container = document.getElementById('whitney-canvas-container');
      var containerWidth = container.clientWidth;
      
      // Set canvas to fit container width with 4:3 aspect ratio
      canvasWidth = Math.min(containerWidth, 800); // Max 800px wide
      canvasHeight = canvasWidth / ASPECT;
      
      // Create canvas inside the container
      canvas = p.createCanvas(canvasWidth, canvasHeight);
      canvas.parent('whitney-canvas-container');
      
      p.background(0);
      p.frameRate(rate);

      // base colors for lerping
      baseRed   = p.color(255, 60, 60);
      baseWhite = p.color(255);

      xcenter = p.width / 2;
      ycenter = p.height / 2 - 20;    // bump triangles up by 20px

      // radius scales with canvas size
      radius = p.min(p.width, p.height) * 0.25; // tweak factor to grow/shrink

      // Listen for page navigation events to start animation
      document.addEventListener('whitneyPageActivated', function() {
        // Reset and start animation
        t = 0;
        step = 0;
        running = true;
        // Dispatch event with current state
        document.dispatchEvent(new CustomEvent('whitneyStateChange', { detail: { running: running } }));
      });
      
      // Listen for external control events
      document.addEventListener('whitneyPlayPause', function() {
        running = !running;
        // Dispatch event with current state
        document.dispatchEvent(new CustomEvent('whitneyStateChange', { detail: { running: running } }));
      });
      
      document.addEventListener('whitneyReset', function() {
        t = 0;
        step = 0;
        running = false;
        // Dispatch event with current state
        document.dispatchEvent(new CustomEvent('whitneyStateChange', { detail: { running: running } }));
      });
    };

    p.draw = function() {
      var dt = 1 / rate;

      // advance animation time only when running
      if (running) {
        t += dt;
      }

      // black background
      p.background(0);
      p.noFill();

      // ── Update rotation step with smooth speed easing ───
      var elapsed = t - ROTATION_START_TIME; // seconds since rotation began

      if (running && elapsed > 0) {
        var speedFactor;

        if (elapsed < SLOW_HOLD) {
          // Phase 1: hold at 25% for the first SLOW_HOLD seconds
          speedFactor = 0.23;
        } else if (elapsed < SLOW_HOLD + RAMP_DURATION) {
          // Phase 2: smoothly ease from 25% → 100% over RAMP_DURATION
          var u = (elapsed - SLOW_HOLD) / RAMP_DURATION;
          u = p.constrain(u, 0, 1);

          // easeInOutCubic
          var eased = (u < 0.5)
            ? 4 * u * u * u
            : 1 - p.pow(-2 * u + 2, 3) / 2;

          speedFactor = 0.25 + (1.0 - 0.25) * eased; // 0.25 → 1.0
        } else if (elapsed < MID_SLOW_START) {
          // Phase 3: full speed until mid-animation slowdown
          speedFactor = 1.0;
        } else if (elapsed < MID_SLOW_START + MID_SLOW_DURATION) {
          // Phase 4: ease from 100% → 10% over MID_SLOW_DURATION
          var u = (elapsed - MID_SLOW_START) / MID_SLOW_DURATION;
          u = p.constrain(u, 0, 1);

          // easeInOutCubic
          var eased = (u < 0.5)
            ? 4 * u * u * u
            : 1 - p.pow(-2 * u + 2, 3) / 2;

          speedFactor = 1.0 - (1.0 - MID_SLOW_SPEED) * eased; // 1.0 → 0.1
        } else if (elapsed < MID_SLOW_START + MID_SLOW_DURATION + MID_RAMP_DURATION) {
          // Phase 5: ease from 10% → 100% over MID_RAMP_DURATION
          var u = (elapsed - (MID_SLOW_START + MID_SLOW_DURATION)) / MID_RAMP_DURATION;
          u = p.constrain(u, 0, 1);

          // easeInOutCubic
          var eased = (u < 0.5)
            ? 4 * u * u * u
            : 1 - p.pow(-2 * u + 2, 3) / 2;

          speedFactor = MID_SLOW_SPEED + (1.0 - MID_SLOW_SPEED) * eased; // 0.1 → 1.0
        } else {
          // Phase 6: back to full speed
          speedFactor = 1.0;
        }

        // integrate rotation over time
        step += speedFactor * stepRate * dt;
      }

      // ── Main rotating triangles ─────────────────────────
      p.push();
      p.translate(xcenter, ycenter);
      p.rotate(-p.PI / 2);

      // current colors based on single swap
      var colorState = getCurrentColors(t, p);

      for (var i = 1; i <= npoints; i++) {
        var a;
        var strokeCol;

        // odd indices are left, even are right in this setup
        if (i % 2 == 0) {
          // right side group
          a = p.TAU * step * i + p.PI / 2;
          strokeCol = colorState.right;
        } else {
          // left side group
          a = -p.TAU * step * i - p.PI / 2;
          strokeCol = colorState.left;
        }

        var x = p.cos(a) * radius;
        var y = p.sin(a) * radius;

        p.push();
        p.translate(p.round(x), p.round(y)); // triangle centre

        var cr = (i / npoints) * radius; // circumradius
        var s  = 3 * cr / p.sqrt(3);       // side length
        var ir = cr / 2;                 // inradius

        // Glowy halo effect using shadowBlur
        p.stroke(strokeCol);
        p.strokeWeight(2); // bump this if you want thicker triangles

        var glowColorCss = 'rgba(' +
          p.floor(p.red(strokeCol))   + ',' +
          p.floor(p.green(strokeCol)) + ',' +
          p.floor(p.blue(strokeCol))  + ',0.9)';

        p.drawingContext.shadowBlur  = 14 + cr * 0.20;
        p.drawingContext.shadowColor = glowColorCss;

        p.triangle(
          ir,  s / 2,
          ir, -s / 2,
         -cr,  0
        );

        p.drawingContext.shadowBlur = 0; // reset
        p.pop();
      }

      p.pop(); // back to normal canvas coordinates

      // ── "dirty glass" / old-TV fuzz ─────────────────────

      // Soft blur over everything (like out-of-focus glass)
      p.filter(p.BLUR, 1);  // try 1–3 for stronger blur

      // Slight foggy overlay
      p.noStroke();
      p.fill(255, 10);     // very low-alpha white
      p.rect(0, 0, p.width, p.height);

      // Static / grain like an old TV
      p.stroke(255, 30);   // faint white points
      for (var j = 0; j < 900; j++) {
        p.point(p.random(p.width), p.random(p.height));
      }
    };
  };

  // ── Color sequence helper: single swap with a wobble ──
  // LEFT starts RED → WHITE
  // RIGHT starts WHITE → RED
  function getCurrentColors(time, p) {
    var leftColor, rightColor;

    if (time < COLOR_SWAP_DURATION) {
      var fRaw = time / COLOR_SWAP_DURATION;

      // pulse/backtrack curve
      var wobble = 0.12 * p.sin(p.TWO_PI * fRaw);
      var f = p.constrain(fRaw + wobble, 0, 1);

      leftColor  = p.lerpColor(baseRed,   baseWhite, f); // left: red → white
      rightColor = p.lerpColor(baseWhite, baseRed,   f); // right: white → red
    } else {
      leftColor  = baseWhite;
      rightColor = baseRed;
    }

    return { left: leftColor, right: rightColor };
  }

  // Create the p5 instance
  new p5(s);
})();