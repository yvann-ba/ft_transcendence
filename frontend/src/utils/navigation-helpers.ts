import { navigate } from "../router";

/**
 * Handles navigation with smooth transitions
 * 
 * @param event Optional event to prevent default
 * @param path Path to navigate to, defaults to pong selection screen
 */
export function handleNavigation(event?: Event, path: string = '/pong-selection'): void {
  // Prevent default form submission behavior if this is in a form
  if (event) {
    event.preventDefault();
  }
  
  // Use the improved navigation system
  navigate(path);
}

/**
 * Sets up click handlers for navigation buttons
 * This should be called during initialization of game screens
 */
export function setupNavigationHandlers(): void {
  // Find all back buttons that should navigate to game modes
  const backButtons = document.querySelectorAll('[id^="back-to-modes-button"]');
  
  backButtons.forEach(button => {
    // Create new button to replace old one (to remove existing event listeners)
    const newButton = button.cloneNode(true) as HTMLElement;
    button.parentNode?.replaceChild(newButton, button);
    
    // Add click handler
    newButton.addEventListener('click', (e) => {
      handleNavigation(e);
    });
  });
  
  // Handle "New Game" buttons that should start a new game
  const newGameButton = document.getElementById('new-game-button');
  if (newGameButton) {
    newGameButton.addEventListener('click', () => {
      // Hide winner announcement
      const winnerAnnouncement = document.getElementById("pong-winner-announcement");
      if (winnerAnnouncement) {
        winnerAnnouncement.classList.add("hidden");
      }
      
      // Find and trigger the play button to reset the game
      const playButton = document.getElementById("play-button");
      if (playButton) {
        playButton.click();
      }
    });
  }
  
  // Set up custom menu navigation
  const customizeButton = document.getElementById('custom-button');
  const customBackButton = document.getElementById('custom-back-button');
  
  if (customizeButton) {
    customizeButton.addEventListener('click', () => {
      const menu = document.getElementById('pong-menu');
      const customMenu = document.getElementById('pong-custom-menu');
      
      if (menu && customMenu) {
        // Add fade-out animation class
        menu.classList.add('fade-out');
        
        // After animation completes, hide menu and show custom menu
        setTimeout(() => {
          menu.classList.add('hidden');
          menu.classList.remove('fade-out');
          customMenu.classList.remove('hidden');
          
          // Add fade-in animation
          customMenu.classList.add('fade-in');
          
          // Remove animation class after it completes
          setTimeout(() => {
            customMenu.classList.remove('fade-in');
          }, 300);
        }, 300);
      }
    });
  }
  
  if (customBackButton) {
    customBackButton.addEventListener('click', () => {
      const menu = document.getElementById('pong-menu');
      const customMenu = document.getElementById('pong-custom-menu');
      
      if (menu && customMenu) {
        // Add fade-out animation class
        customMenu.classList.add('fade-out');
        
        // After animation completes, hide custom menu and show main menu
        setTimeout(() => {
          customMenu.classList.add('hidden');
          customMenu.classList.remove('fade-out');
          menu.classList.remove('hidden');
          
          // Add fade-in animation
          menu.classList.add('fade-in');
          
          // Remove animation class after it completes
          setTimeout(() => {
            menu.classList.remove('fade-in');
          }, 300);
        }, 300);
      }
    });
  }
}

/**
 * Preloads images to avoid flicker during transitions
 * 
 * @param imagePaths Array of image paths to preload
 */
export function preloadImages(imagePaths: string[]): void {
  imagePaths.forEach(path => {
    const img = new Image();
    img.src = path;
  });
}

/**
 * Shows a temporary toast notification
 * 
 * @param message Message to display
 * @param type Type of notification ('success', 'error', 'info')
 * @param duration Duration in milliseconds
 */
export function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000): void {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.backgroundColor = type === 'success' ? '#4CAF50' : 
                               type === 'error' ? '#F44336' : 
                               '#2196F3';
  toast.style.color = 'white';
  toast.style.padding = '12px 20px';
  toast.style.marginBottom = '10px';
  toast.style.borderRadius = '4px';
  toast.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(20px)';
  toast.style.transition = 'opacity 0.3s, transform 0.3s';
  toast.textContent = message;
  
  // Add toast to container
  toastContainer.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  
  // Remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    
    // Remove from DOM after animation
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, duration);
}