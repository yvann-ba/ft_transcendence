import { languageService } from '../utils/languageContext';

export function createLanguageSwitcher(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'language-switcher';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '998';
  container.style.display = 'flex';
  container.style.gap = '8px';
  container.style.background = 'rgba(0, 0, 0, 0.6)';
  container.style.padding = '6px 10px';
  container.style.borderRadius = '25px';
  container.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
  container.style.transition = 'all 0.3s ease';
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];
  
  languages.forEach(lang => {
    const button = document.createElement('button');
    button.className = 'language-btn';
    button.setAttribute('data-lang', lang.code);
    button.setAttribute('aria-label', `Switch to ${lang.name}`);
    button.innerHTML = lang.flag;
    button.title = lang.name;
    button.style.background = 'none';
    button.style.border = 'none';
    button.style.fontSize = '20px';
    button.style.cursor = 'pointer';
    button.style.opacity = languageService.getCurrentLanguage() === lang.code ? '1' : '0.5';
    button.style.transform = languageService.getCurrentLanguage() === lang.code ? 'scale(1.2)' : 'scale(1)';
    button.style.transition = 'all 0.3s ease';
    button.style.padding = '2px';
    button.style.lineHeight = '1';
    button.style.width = '26px';
    button.style.height = '26px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    
    if (languageService.getCurrentLanguage() === lang.code) {
      button.style.textShadow = '0 0 5px rgba(255, 255, 255, 0.7)';
    }
    
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.2)';
      button.style.opacity = '1';
    });
    
    button.addEventListener('mouseleave', () => {
      if (languageService.getCurrentLanguage() !== lang.code) {
        button.style.transform = 'scale(1)';
        button.style.opacity = '0.5';
      } else {
        button.style.transform = 'scale(1.2)';
      }
    });
    
    button.addEventListener('click', async () => {
      // Small click animation
      button.style.transform = 'scale(0.9)';
      setTimeout(() => {
        button.style.transform = 'scale(1.2)';
      }, 100);
      
      await languageService.setLanguage(lang.code as 'en' | 'fr' | 'es');
      updateActiveButton();
      updatePageContent();
    });
    
    container.appendChild(button);
  });
  
  // Add subtle hover effect
  container.addEventListener('mouseenter', () => {
    container.style.background = 'rgba(0, 0, 0, 0.8)';
  });
  
  container.addEventListener('mouseleave', () => {
    container.style.background = 'rgba(0, 0, 0, 0.6)';
  });
  
  function updateActiveButton() {
    const currentLang = languageService.getCurrentLanguage();
    const buttons = container.querySelectorAll('.language-btn');
    buttons.forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      const isActive = btnLang === currentLang;
      
      (btn as HTMLElement).style.opacity = isActive ? '1' : '0.5';
      (btn as HTMLElement).style.transform = isActive ? 'scale(1.2)' : 'scale(1)';
      (btn as HTMLElement).style.textShadow = isActive ? '0 0 5px rgba(255, 255, 255, 0.7)' : 'none';
    });
  }
  
  function updatePageContent() {
    window.dispatchEvent(new CustomEvent('languageChanged'));
  }
  
  // Responsive adjustments
  const handleResize = () => {
    if (window.innerWidth < 768) {
      container.style.bottom = '10px';
      container.style.right = '10px';
      container.style.transform = 'scale(0.9)';
    } else {
      container.style.bottom = '20px';
      container.style.right = '20px';
      container.style.transform = 'scale(1)';
    }
  };
  
  handleResize();
  window.addEventListener('resize', handleResize);
  
  // Entry animation
  container.style.opacity = '0';
  container.style.transform = 'translateY(10px)';
  
  setTimeout(() => {
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
  }, 300);
  
  languageService.addListener(updateActiveButton);
  
  return container;
}