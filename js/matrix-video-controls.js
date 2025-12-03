// Matrix Dual Video Controls - Play/Pause and Reset for both videos
(function() {
  // Wait for DOM to be ready
  function initVideoControls() {
    console.log('Initializing matrix video controls...');
    
    // Use a small delay to ensure DOM is fully loaded
    setTimeout(() => {
      const playPauseBtn = document.getElementById('matrix-play-pause');
      const resetBtn = document.getElementById('matrix-reset');
      const sourceVideo = document.getElementById('matrix-video');
      const outputVideo = document.getElementById('matrix-output-video');
      
      console.log('Elements found:', {
        playPauseBtn: !!playPauseBtn,
        resetBtn: !!resetBtn,
        sourceVideo: !!sourceVideo,
        outputVideo: !!outputVideo
      });
      
      if (!playPauseBtn || !resetBtn || !sourceVideo || !outputVideo) {
        console.log('Matrix video controls not found - missing elements');
        return;
      }
      
      const playLabel = playPauseBtn.querySelector('.play-label');
      const pauseLabel = playPauseBtn.querySelector('.pause-label');
      
      if (!playLabel || !pauseLabel) {
        console.log('Play/Pause labels not found');
        return;
      }

      // Normalize label text so they are always correct
      playLabel.textContent = 'PLAY';
      pauseLabel.textContent = 'PAUSE';
      
      // Sync video states - if either video ends/pauses/plays, update button
      function updateButtonState() {
        if (sourceVideo.paused && outputVideo.paused) {
          // Show PLAY when videos are paused
          playLabel.style.display = 'inline-block';
          pauseLabel.style.display = 'none';
        } else {
          // Show PAUSE when videos are playing
          playLabel.style.display = 'none';
          pauseLabel.style.display = 'inline-block';
        }
      }
      
      // Play/Pause both videos
      playPauseBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log(
          'Play/Pause clicked, source paused:',
          sourceVideo.paused,
          'output paused:',
          outputVideo.paused
        );
        
        if (sourceVideo.paused || outputVideo.paused) {
          // Play both videos
          sourceVideo.play().catch(err => console.log('Source video play error:', err));
          outputVideo.play().catch(err => console.log('Output video play error:', err));
        } else {
          // Pause both videos
          sourceVideo.pause();
          outputVideo.pause();
        }

        // Update button UI based on new state
        updateButtonState();
      });
      
      // Reset both videos to start
      resetBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Reset clicked');
        
        // Reset both videos to beginning
        sourceVideo.currentTime = 0;
        outputVideo.currentTime = 0;
        
        // Pause both videos
        sourceVideo.pause();
        outputVideo.pause();
        
        // Update play/pause button UI to show PLAY
        updateButtonState();
      });
      
      // Keep button in sync with any external play/pause
      sourceVideo.addEventListener('play', updateButtonState);
      sourceVideo.addEventListener('pause', updateButtonState);
      outputVideo.addEventListener('play', updateButtonState);
      outputVideo.addEventListener('pause', updateButtonState);
      
      // Set the initial label correctly based on the current video state
      updateButtonState();
      
      console.log('Matrix video controls initialized successfully');
    }, 100); // Small delay to ensure DOM is ready
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoControls);
  } else {
    initVideoControls();
  }
})();
