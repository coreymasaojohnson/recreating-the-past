// Navigation system with triangle indicator and page transitions

class Navigation {
  constructor() {
    this.navItems = document.querySelectorAll('.nav-item');
    this.navSubItems = document.querySelectorAll('.nav-subitem');
    this.pageContents = document.querySelectorAll('.page-content');
    this.backgroundArt = document.getElementById('molnar-art');
    this.currentPage = 'overview';
    
    this.init();
  }
  
  init() {
    // Fade in background art 0.5 seconds after page load, but only if still on overview
    this.backgroundArtTimer = setTimeout(() => {
      if (this.currentPage === 'overview') {
        this.backgroundArt.classList.add('visible');
      }
    }, 500);
    
    // Handle main nav items
    this.navItems.forEach(item => {
      const link = item.querySelector('a');
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetPage = item.getAttribute('data-page');
        
        // Special handling for "algorithmic" - navigate to molnar-1 instead
        const actualTargetPage = targetPage === 'algorithmic' ? 'molnar-1' : targetPage;
        
        // Don't do anything if clicking the current page
        if (actualTargetPage === this.currentPage) {
          return;
        }
        
        this.switchPage(item, actualTargetPage, true);
      });
    });
    
    // Handle sub-menu items
    this.navSubItems.forEach(item => {
      const link = item.querySelector('a');
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetPage = item.getAttribute('data-page');
        
        // Don't do anything if clicking the current page
        if (targetPage === this.currentPage) {
          return;
        }
        
        this.switchPage(item, targetPage, false);
      });
    });
    
    // Initialize navigation state (hide submenu since we start on overview)
    this.updateNavigation(this.currentPage);
  }
  
  async switchPage(clickedItem, targetPage, isMainNavItem) {
    // Clear any pending background art timer
    if (this.backgroundArtTimer) {
      clearTimeout(this.backgroundArtTimer);
      this.backgroundArtTimer = null;
    }
    
    // Handle background art visibility
    this.handleBackgroundArt(targetPage);
    
    // 1. Flash the clicked item
    clickedItem.classList.add('flashing');
    
    // 2. Wait for flash animation (300ms)
    await this.wait(300);
    
    // Remove flashing class
    clickedItem.classList.remove('flashing');
    
    // 3. Wait 200ms before moving nav
    await this.wait(200);
    
    // 4. Move nav bar first (if transitioning between overview and portfolio pages)
    this.updateNavPosition(targetPage);
    
    // 5. Wait 2 seconds for nav animation to complete
    await this.wait(2000);
    
    // 6. Move the triangle indicator and handle sub-menu visibility
    this.updateNavigation(targetPage);
    
    // 7. Crossfade page content (start immediately with triangle move)
    this.crossfadeContent(targetPage);
    
    // Update current page
    this.currentPage = targetPage;
  }
  
  updateNavPosition(targetPage) {
    // Handle nav positioning: top for overview, bottom for portfolio pages
    const navMenu = document.querySelector('.nav-menu');
    if (targetPage === 'overview') {
      navMenu.classList.remove('nav-bottom');
    } else {
      navMenu.classList.add('nav-bottom');
    }
  }
  
  handleBackgroundArt(targetPage) {
    if (targetPage === 'overview') {
      // Fade in when returning to overview
      this.backgroundArt.classList.add('visible');
    } else if (this.currentPage === 'overview') {
      // Fade out when leaving overview
      this.backgroundArt.classList.remove('visible');
    }
  }
  
  updateNavigation(targetPage) {
    // Check if target page is a Molnar sub-page
    const isMolnarPage = targetPage === 'molnar-1' || targetPage === 'molnar-2';
    
    // Remove active class from all main nav items
    this.navItems.forEach(item => {
      item.classList.remove('active');
    });
    
    // Remove active class from all sub-items
    this.navSubItems.forEach(item => {
      item.classList.remove('active');
      // Only remove animation-trigger if we're leaving the Algorithmic Drawing section
      if (!isMolnarPage) {
        item.classList.remove('animation-trigger');
      }
    });
    
    if (isMolnarPage) {
      // DON'T activate the parent "Algorithmic Drawing" item
      // Let the triangle appear next to the actual page (Molnar 1 or 2)
      
      // Show the submenu
      this.showSubmenu();
      
      // Get both Molnar items
      const molnar1Item = document.querySelector('.nav-subitem[data-page="molnar-1"]');
      const molnar2Item = document.querySelector('.nav-subitem[data-page="molnar-2"]');
      
      // Only activate the CURRENT page (for triangle indicator)
      if (targetPage === 'molnar-1' && molnar1Item) {
        molnar1Item.classList.add('active');
      } else if (targetPage === 'molnar-2' && molnar2Item) {
        molnar2Item.classList.add('active');
      }
      
      // ALWAYS add animation-trigger to Molnar 1 (for the underline animation)
      if (molnar1Item && !molnar1Item.classList.contains('animation-trigger')) {
        // Force a reflow by reading offsetHeight
        void molnar1Item.offsetHeight;
        
        // Use double requestAnimationFrame to ensure browser fully processes
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Trigger animation after a delay using a separate class
            setTimeout(() => {
              molnar1Item.classList.add('animation-trigger');
            }, 500); // Half-second delay after item becomes active
          });
        });
      }
    } else {
      // Activate the clicked main nav item
      const targetMainItem = document.querySelector(`.nav-item[data-page="${targetPage}"]`);
      if (targetMainItem) {
        targetMainItem.classList.add('active');
      }
      
      // Hide the submenu
      this.hideSubmenu();
    }
  }
  
  showSubmenu() {
    const submenu = document.querySelector('.nav-submenu');
    if (submenu) {
      submenu.classList.add('visible');
    }
  }
  
  hideSubmenu() {
    const submenu = document.querySelector('.nav-submenu');
    if (submenu) {
      submenu.classList.remove('visible');
    }
  }
  
  crossfadeContent(targetPage) {
    // Find the current and target page content
    const currentContent = document.querySelector('.page-content.active');
    const targetContent = document.getElementById(`page-${targetPage}`);
    
    if (!targetContent) {
      console.error(`Page content not found: page-${targetPage}`);
      return;
    }
    
    // If leaving the repetition page, stop and mute the video
    if (this.currentPage === 'repetition') {
      const video = currentContent.querySelector('#whitney-video');
      if (video) {
        video.pause();
        video.muted = true;
        
        // Reset sound toggle button UI
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
          const soundOffIcon = soundToggle.querySelector('.sound-off');
          const soundOnIcon = soundToggle.querySelector('.sound-on');
          const soundOffLabel = soundToggle.querySelector('.sound-off-label');
          const soundOnLabel = soundToggle.querySelector('.sound-on-label');
          
          if (soundOffIcon && soundOnIcon) {
            soundOffIcon.style.display = 'inline-block';
            soundOnIcon.style.display = 'none';
          }
          
          if (soundOffLabel && soundOnLabel) {
            soundOffLabel.style.display = 'inline-block';
            soundOnLabel.style.display = 'none';
          }
        }
        
        // Reset play/pause button UI
        const whitneyControls = document.getElementById('whitney-controls');
        if (whitneyControls) {
          const playLabel = whitneyControls.querySelector('.play-label');
          const pauseLabel = whitneyControls.querySelector('.pause-label');
          
          if (playLabel && pauseLabel) {
            playLabel.style.display = 'inline-block';
            pauseLabel.style.display = 'none';
          }
        }
        
        // Stop the animation
        document.dispatchEvent(new Event('whitneyReset'));
      }
    }
    
    // If leaving the Moving Image page, stop and mute both videos
    if (this.currentPage === 'glitch') {
      const sourceVideo = currentContent.querySelector('#matrix-video');
      const outputVideo = currentContent.querySelector('#matrix-output-video');
      
      if (sourceVideo) {
        sourceVideo.pause();
        sourceVideo.muted = true;
      }
      
      if (outputVideo) {
        outputVideo.pause();
        outputVideo.muted = true;
      }
      
      // Reset sound toggle button UI
      const soundToggle = document.getElementById('matrix-sound-toggle');
      if (soundToggle) {
        const soundOffIcon = soundToggle.querySelector('.sound-off');
        const soundOnIcon = soundToggle.querySelector('.sound-on');
        const soundOffLabel = soundToggle.querySelector('.sound-off-label');
        const soundOnLabel = soundToggle.querySelector('.sound-on-label');
        
        if (soundOffIcon && soundOnIcon) {
          soundOffIcon.style.display = 'inline-block';
          soundOnIcon.style.display = 'none';
        }
        
        if (soundOffLabel && soundOnLabel) {
          soundOffLabel.style.display = 'inline-block';
          soundOnLabel.style.display = 'none';
        }
      }
      
      // Reset play/pause button UI
      const playPauseBtn = document.getElementById('matrix-play-pause');
      if (playPauseBtn) {
        const playLabel = playPauseBtn.querySelector('.play-label');
        const pauseLabel = playPauseBtn.querySelector('.pause-label');
        
        if (playLabel && pauseLabel) {
          playLabel.style.display = 'inline-block';
          pauseLabel.style.display = 'none';
        }
      }
    }
    
    // Start fading out current content
    currentContent.classList.remove('active');
    
    // After a brief moment, activate the new content
    // This creates the "new content appears behind" effect
    setTimeout(() => {
      targetContent.classList.add('active');
      
      // NEW: Trigger Molnar 1 shuffle
      if (targetPage === 'molnar-1') {
        document.dispatchEvent(new Event('molnar1PageActivated'));
      }

      // NEW: Trigger Molnar 2 wave
      if (targetPage === 'molnar-2') {
        document.dispatchEvent(new Event('molnar2PageActivated'));
      }
      
      // NEW: Trigger Riley pulse (Matrix flex)
      if (targetPage === 'pattern') {
        document.dispatchEvent(new Event('rileyPageActivated'));
      }
      
      // NEW: Auto-transition Lincoln image on Pixels page
      if (targetPage === 'pixels') {
        const toggleBtn = document.getElementById('lincoln-toggle');
        const mosaicImage = document.getElementById('lincoln-mosaic');
        const originalImage = document.getElementById('lincoln-original');
        
        if (toggleBtn && mosaicImage && originalImage) {
          // Ensure we start from ORIGINAL visible, mosaic hidden
          mosaicImage.style.opacity = '0';
          originalImage.style.opacity = '1';
          
          const originalLabel = toggleBtn.querySelector('.original-label');
          const mosaicLabel = toggleBtn.querySelector('.mosaic-label');
          if (originalLabel && mosaicLabel) {
            originalLabel.style.display = 'none';
            mosaicLabel.style.display = 'inline-block';
          }
          
          // After 2 seconds, if still on Pixels, trigger the toggle to mosaic
          setTimeout(() => {
            if (this.currentPage !== 'pixels') return;
            
            const currentOpacity = parseFloat(mosaicImage.style.opacity || '0');
            // Only auto-toggle if we're still basically on the original view
            if (currentOpacity < 0.5) {
              toggleBtn.click();
            }
          }, 2000);
        }
      }
      
      // If navigating to repetition page, start both video and animation
      if (targetPage === 'repetition') {
        // Trigger Whitney animation start
        setTimeout(() => {
          document.dispatchEvent(new Event('whitneyPageActivated'));
          
          // Start video playback at 4:37
          const video = targetContent.querySelector('.video-player');
          if (video) {
            video.currentTime = 287; // 4 minutes 47 seconds (4*60 + 47)
            video.play().catch(err => {
              console.log('Video autoplay prevented:', err);
            });
          }
        }, 200); // Small delay to ensure page is visible
      }
      
      // If navigating to Moving Image page, start both videos
      if (targetPage === 'glitch') {
        setTimeout(() => {
          // Start both videos from beginning
          const sourceVideo = targetContent.querySelector('#matrix-video');
          const outputVideo = targetContent.querySelector('#matrix-output-video');
          
          if (sourceVideo) {
            sourceVideo.currentTime = 0;
            sourceVideo.play().catch(err => {
              console.log('Source video autoplay prevented:', err);
            });
          }
          
          if (outputVideo) {
            outputVideo.currentTime = 0;
            outputVideo.play().catch(err => {
              console.log('Output video autoplay prevented:', err);
            });
          }
        }, 2200); // Small delay to ensure page is visible
      }
    }, 100);
  }
  
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new Navigation();
  });
} else {
  new Navigation();
}
