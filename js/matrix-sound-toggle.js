// Matrix Video Sound Toggle Handler
(function() {
  // Wait for DOM to be ready
  function initSoundToggle() {
    console.log('Initializing matrix sound toggle...');
    
    // Use a small delay to ensure DOM is fully loaded
    setTimeout(() => {
      const soundToggle = document.getElementById('matrix-sound-toggle');
      const video = document.getElementById('matrix-video');
      
      console.log('Elements found:', {
        soundToggle: !!soundToggle,
        video: !!video
      });
      
      if (!soundToggle || !video) {
        console.log('Matrix sound toggle elements not found');
        return;
      }
      
      const soundOffIcon = soundToggle.querySelector('.sound-off');
      const soundOnIcon = soundToggle.querySelector('.sound-on');
      const soundOffLabel = soundToggle.querySelector('.sound-off-label');
      const soundOnLabel = soundToggle.querySelector('.sound-on-label');
      
      // Toggle sound on button click
      soundToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Sound toggle clicked, current muted state:', video.muted);
        
        if (video.muted) {
          // Unmute
          video.muted = false;
          if (soundOffIcon && soundOnIcon) {
            soundOffIcon.style.display = 'none';
            soundOnIcon.style.display = 'inline-block';
          }
          if (soundOffLabel && soundOnLabel) {
            soundOffLabel.style.display = 'none';
            soundOnLabel.style.display = 'inline-block';
          }
        } else {
          // Mute
          video.muted = true;
          if (soundOffIcon && soundOnIcon) {
            soundOffIcon.style.display = 'inline-block';
            soundOnIcon.style.display = 'none';
          }
          if (soundOffLabel && soundOnLabel) {
            soundOffLabel.style.display = 'inline-block';
            soundOnLabel.style.display = 'none';
          }
        }
      });
      
      console.log('Matrix sound toggle initialized successfully');
    }, 100); // Small delay to ensure DOM is ready
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSoundToggle);
  } else {
    initSoundToggle();
  }
})();