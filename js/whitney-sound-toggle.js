// Whitney Video Sound Toggle Handler
(function() {
  // Wait for DOM to be ready
  function initSoundToggle() {
    const soundToggle = document.getElementById('sound-toggle');
    const video = document.getElementById('whitney-video');
    const soundOffIcon = soundToggle.querySelector('.sound-off');
    const soundOnIcon = soundToggle.querySelector('.sound-on');
    const soundOffLabel = soundToggle.querySelector('.sound-off-label');
    const soundOnLabel = soundToggle.querySelector('.sound-on-label');
    
    if (!soundToggle || !video) return;
    
    // Toggle sound on button click
    soundToggle.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (video.muted) {
        // Unmute
        video.muted = false;
        soundOffIcon.style.display = 'none';
        soundOnIcon.style.display = 'inline-block';
        soundOffLabel.style.display = 'none';
        soundOnLabel.style.display = 'inline-block';
      } else {
        // Mute
        video.muted = true;
        soundOffIcon.style.display = 'inline-block';
        soundOnIcon.style.display = 'none';
        soundOffLabel.style.display = 'inline-block';
        soundOnLabel.style.display = 'none';
      }
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSoundToggle);
  } else {
    initSoundToggle();
  }
})();