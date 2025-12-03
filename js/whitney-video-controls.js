// Whitney Video + Animation Controls - Play/Pause and Reset for both
(function() {
  // Wait for DOM to be ready
  function initWhitneyControls() {
    const video = document.getElementById('whitney-video');
    const controlsContainer = document.getElementById('whitney-controls');
    
    if (!video || !controlsContainer) {
      console.log('Whitney controls not found');
      return;
    }
    
    // Create Play/Pause button
    const playPauseBtn = document.createElement('button');
    playPauseBtn.className = 'inline-control-btn';
    playPauseBtn.title = 'Play/Pause';
    
    const playLabel = document.createElement('span');
    playLabel.className = 'control-label play-label';
    playLabel.textContent = 'Play';
    
    const pauseLabel = document.createElement('span');
    pauseLabel.className = 'control-label pause-label';
    pauseLabel.style.display = 'none';
    pauseLabel.textContent = 'Pause';
    
    playPauseBtn.appendChild(playLabel);
    playPauseBtn.appendChild(pauseLabel);
    controlsContainer.appendChild(playPauseBtn);
    
    // Create Reset button
    const resetBtn = document.createElement('button');
    resetBtn.className = 'inline-control-btn';
    resetBtn.title = 'Reset to start';
    resetBtn.textContent = 'Reset';
    controlsContainer.appendChild(resetBtn);
    
    // Play/Pause both video and animation
    playPauseBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Toggle video
      if (video.paused) {
        video.play().catch(err => console.log('Video play error:', err));
      } else {
        video.pause();
      }
      
      // Toggle animation through event
      document.dispatchEvent(new Event('whitneyPlayPause'));
    });
    
    // Reset both video and animation
    resetBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Reset and pause video
      video.currentTime = 287; // 4:47 timestamp
      video.pause();
      
      // Reset animation through event
      document.dispatchEvent(new Event('whitneyReset'));
      
      // Update button UI
      playLabel.style.display = 'inline-block';
      pauseLabel.style.display = 'none';
    });
    
    // Listen for animation state changes to update button
    document.addEventListener('whitneyStateChange', function(e) {
      const running = e.detail.running;
      
      // Update button UI to match animation state
      if (running) {
        playLabel.style.display = 'none';
        pauseLabel.style.display = 'inline-block';
      } else {
        playLabel.style.display = 'inline-block';
        pauseLabel.style.display = 'none';
      }
    });
    
    // Sync button state when video state changes
    video.addEventListener('play', function() {
      playLabel.style.display = 'none';
      pauseLabel.style.display = 'inline-block';
    });
    
    video.addEventListener('pause', function() {
      playLabel.style.display = 'inline-block';
      pauseLabel.style.display = 'none';
    });
    
    console.log('Whitney video controls initialized');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhitneyControls);
  } else {
    initWhitneyControls();
  }
})();