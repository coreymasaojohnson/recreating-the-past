// Text Rain Modal Video Controls
(function() {
  // Wait for DOM to be ready
  function initTextRainControls() {
    console.log('Initializing Text Rain controls...');
    
    // Use a small delay to ensure DOM is fully loaded
    setTimeout(() => {
      const soundToggle = document.getElementById('text-rain-sound-toggle');
      const playPauseBtn = document.getElementById('text-rain-play-pause');
      const resetBtn = document.getElementById('text-rain-reset');
      const video = document.getElementById('text-rain-video');
      
      console.log('Elements found:', {
        soundToggle: !!soundToggle,
        playPauseBtn: !!playPauseBtn,
        resetBtn: !!resetBtn,
        video: !!video
      });
      
      if (!soundToggle || !playPauseBtn || !resetBtn || !video) {
        console.log('Text Rain controls not found - missing elements');
        return;
      }
      
      // Sound toggle elements
      const soundOffIcon = soundToggle.querySelector('.sound-off');
      const soundOnIcon = soundToggle.querySelector('.sound-on');
      const soundOffLabel = soundToggle.querySelector('.sound-off-label');
      const soundOnLabel = soundToggle.querySelector('.sound-on-label');
      
      // Play/Pause elements
      const playLabel = playPauseBtn.querySelector('.play-label');
      const pauseLabel = playPauseBtn.querySelector('.pause-label');
      
      // Update sound button state based on muted state
      function updateSoundButtonState() {
        if (video.muted) {
          // Video is muted - show muted icon and "TOGGLE SOUND ON" label
          if (soundOffIcon && soundOnIcon) {
            soundOffIcon.style.display = 'inline-block'; // Show muted icon (speaker with X)
            soundOnIcon.style.display = 'none';
          }
          if (soundOffLabel && soundOnLabel) {
            soundOffLabel.style.display = 'none';
            soundOnLabel.style.display = 'inline-block'; // Show "TOGGLE SOUND ON"
          }
        } else {
          // Video is unmuted - show unmuted icon and "TOGGLE SOUND OFF" label
          if (soundOffIcon && soundOnIcon) {
            soundOffIcon.style.display = 'none';
            soundOnIcon.style.display = 'inline-block'; // Show unmuted icon (speaker with waves)
          }
          if (soundOffLabel && soundOnLabel) {
            soundOffLabel.style.display = 'inline-block'; // Show "TOGGLE SOUND OFF"
            soundOnLabel.style.display = 'none';
          }
        }
      }
      
      // Sound Toggle Handler
      soundToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Sound toggle clicked, current muted state:', video.muted);
        
        // Toggle the muted state
        video.muted = !video.muted;
        
        // Update button display to match new state
        updateSoundButtonState();
      });
      
      // Update button state based on video state
      function updateButtonState() {
        if (video.paused) {
          playLabel.style.display = 'inline-block';
          pauseLabel.style.display = 'none';
        } else {
          playLabel.style.display = 'none';
          pauseLabel.style.display = 'inline-block';
        }
      }
      
      // Play/Pause Handler
      playPauseBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Play/Pause clicked, video paused:', video.paused);
        
        if (video.paused) {
          video.play().catch(err => console.log('Video play error:', err));
        } else {
          video.pause();
        }
        
        updateButtonState();
      });
      
      // Reset Handler
      resetBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Reset clicked');
        
        // Reset video to beginning
        video.currentTime = 0;
        video.pause();
        
        // Update play/pause button UI to show PLAY
        updateButtonState();
      });
      
      // Keep button in sync with video state changes
      video.addEventListener('play', updateButtonState);
      video.addEventListener('pause', updateButtonState);
      
      // Set initial button states
      updateButtonState();
      updateSoundButtonState(); // Initialize sound button correctly
      
      console.log('Text Rain controls initialized successfully');
    }, 100); // Small delay to ensure DOM is ready
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTextRainControls);
  } else {
    initTextRainControls();
  }
})();