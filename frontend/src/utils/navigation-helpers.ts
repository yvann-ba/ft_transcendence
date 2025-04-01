import { navigate } from "../router";

export function handleNavigation(event?: Event, path: string = '/pong-selection'): void {
  if (event) {
    event.preventDefault();
  }
  
  navigate(path);
}

export function setupNavigationHandlers(): void {
  const backButtons = document.querySelectorAll('[id^="back-to-modes-button"]');
  
  backButtons.forEach(button => {
    const newButton = button.cloneNode(true) as HTMLElement;
    button.parentNode?.replaceChild(newButton, button);
    
    newButton.addEventListener('click', (e) => {
      handleNavigation(e);
    });
  });
  
  const newGameButton = document.getElementById('new-game-button');
  if (newGameButton) {
    newGameButton.addEventListener('click', () => {
      // Hide winner announcement
      const winnerAnnouncement = document.getElementById("pong-winner-announcement");
      if (winnerAnnouncement) {
        winnerAnnouncement.classList.add("hidden");
      }
      
      const playButton = document.getElementById("play-button");
      if (playButton) {
        playButton.click();
      }
    });
  }
  
  const customizeButton = document.getElementById('custom-button');
  const customBackButton = document.getElementById('custom-back-button');
  
  if (customizeButton) {
    customizeButton.addEventListener('click', () => {
      const menu = document.getElementById('pong-menu');
      const customMenu = document.getElementById('pong-custom-menu');
      
      if (menu && customMenu) {
        menu.classList.add('fade-out');
        
        setTimeout(() => {
          menu.classList.add('hidden');
          menu.classList.remove('fade-out');
          customMenu.classList.remove('hidden');
          
          customMenu.classList.add('fade-in');
          
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
        customMenu.classList.add('fade-out');
        
        setTimeout(() => {
          customMenu.classList.add('hidden');
          customMenu.classList.remove('fade-out');
          menu.classList.remove('hidden');
          
          menu.classList.add('fade-in');
          
          setTimeout(() => {
            menu.classList.remove('fade-in');
          }, 300);
        }, 300);
      }
    });
  }
}

export function preloadImages(imagePaths: string[]): void {
  imagePaths.forEach(path => {
    const img = new Image();
    img.src = path;
  });
}

export function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000): void {
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
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, duration);
}