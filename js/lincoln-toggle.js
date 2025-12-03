// Lincoln Image Toggle - Switch between original and mosaic with cross-fade
(function() {
  // Animation state
  let state = "static"; // "static", "waiting", "transition"
  let waitStart = 0;
  let waitDuration = 300; // Brief wait before transition
  let transitionStart = 0;
  let transitionDuration = 800; // Cross-fade duration
  let targetState = "mosaic"; // "mosaic" or "original"
  let animationFrameId = null;
  
  // Wait for DOM to be ready
  function initLincolnToggle() {
    const toggleBtn = document.getElementById('lincoln-toggle');
    const mosaicImage = document.getElementById('lincoln-mosaic');
    const originalImage = document.getElementById('lincoln-original');
    
    if (!toggleBtn || !mosaicImage || !originalImage) {
      console.log('Lincoln toggle controls not found');
      return;
    }
    
    const originalLabel = toggleBtn.querySelector('.original-label');
    const mosaicLabel = toggleBtn.querySelector('.mosaic-label');
    
    // Set initial opacity values (CSS handles positioning)
    // NEW: Start on ORIGINAL image (opposite of previous mosaic default)
    mosaicImage.style.opacity = '0';
    originalImage.style.opacity = '1';
    
    // NEW: When original is visible, button should say "View Mosaic"
    if (originalLabel && mosaicLabel) {
      originalLabel.style.display = 'none';
      mosaicLabel.style.display = 'inline-block';
    }
    
    // Toggle between images
    toggleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (state !== "static") return; // Prevent clicking during animation
      
      // Determine target state
      if (mosaicImage.style.opacity === '1' || parseFloat(mosaicImage.style.opacity) > 0.5) {
        targetState = "original";
      } else {
        targetState = "mosaic";
      }
      
      // Start animation sequence
      state = "waiting";
      waitStart = Date.now();
      animate();
    });
    
    function animate() {
      const now = Date.now();
      
      if (state === "waiting") {
        if (now - waitStart >= waitDuration) {
          state = "transition";
          transitionStart = now;
        }
        animationFrameId = requestAnimationFrame(animate);
      } else if (state === "transition") {
        let t = (now - transitionStart) / transitionDuration;
        t = Math.min(t, 1);
        
        // Easing function (ease-in-out)
        const eased = t < 0.5 
          ? 4 * t * t * t 
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
        
        if (targetState === "original") {
          // Fade to original
          mosaicImage.style.opacity = (1 - eased).toString();
          originalImage.style.opacity = eased.toString();
          
          if (t >= 1) {
            // Animation complete - update button labels
            if (originalLabel && mosaicLabel) {
              originalLabel.style.display = 'none';
              mosaicLabel.style.display = 'inline-block';
            }
            state = "static";
          } else {
            animationFrameId = requestAnimationFrame(animate);
          }
        } else {
          // Fade to mosaic
          originalImage.style.opacity = (1 - eased).toString();
          mosaicImage.style.opacity = eased.toString();
          
          if (t >= 1) {
            // Animation complete - update button labels
            if (originalLabel && mosaicLabel) {
              originalLabel.style.display = 'inline-block';
              mosaicLabel.style.display = 'none';
            }
            state = "static";
          } else {
            animationFrameId = requestAnimationFrame(animate);
          }
        }
      }
    }
    
    console.log('Lincoln toggle initialized');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLincolnToggle);
  } else {
    initLincolnToggle();
  }
})();
