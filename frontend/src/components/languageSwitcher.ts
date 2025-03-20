import { languageService } from '../utils/languageContext';

export function createLanguageSwitcher(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'language-switcher';
  container.style.position = 'fixed';
    container.style.top = '20px'; // Changed from 10px to appear below navbar
    container.style.right = '200px';
    container.style.zIndex = '1000'; // Higher z-index to ensure visibility
    container.style.display = 'flex';
    container.style.gap = '10px';
    container.style.background = 'rgba(0, 0, 0, 0.5)'; // Add background
    container.style.padding = '5px 10px';
    container.style.borderRadius = '5px';
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];
  
  languages.forEach(lang => {
    const button = document.createElement('button');
    button.className = 'language-btn';
    button.setAttribute('data-lang', lang.code);
    button.innerHTML = lang.flag;
    button.title = lang.name;
    button.style.background = 'none';
    button.style.border = 'none';
    button.style.fontSize = '24px';
    button.style.cursor = 'pointer';
    button.style.opacity = languageService.getCurrentLanguage() === lang.code ? '1' : '0.5';
    button.style.transition = 'all 0.3s ease';
    
    button.addEventListener('click', async () => {
      await languageService.setLanguage(lang.code as 'en' | 'fr' | 'es');
      updateActiveButton();
      updatePageContent();
    });
    
    container.appendChild(button);
  });
  
  function updateActiveButton() {
    const currentLang = languageService.getCurrentLanguage();
    const buttons = container.querySelectorAll('.language-btn');
    buttons.forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      (btn as HTMLElement).style.opacity = btnLang === currentLang ? '1' : '0.5';
      (btn as HTMLElement).style.transform = btnLang === currentLang ? 'scale(1.2)' : 'scale(1)';
    });
  }
  
  function updatePageContent() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const page = link.getAttribute('data-page');
      if (page) {
        let translationKey = '';
        if (page === 'home') translationKey = 'nav.home';
        else if (page === 'about') translationKey = 'nav.about';
        else if (page === 'contact') translationKey = 'nav.contact';
        else if (page === 'profile-page') translationKey = 'nav.profile';
        
        if (translationKey) {
          const translated = languageService.translate(translationKey);
          // Mettre à jour à la fois le texte et l'attribut data-hover
          const span = link.querySelector('span');
          if (span) span.textContent = translated;
          link.setAttribute('data-hover', translated);
        }
      }
    });
    
    window.dispatchEvent(new CustomEvent('languageChanged'));
  }
  
  // Update buttons when language changes
  languageService.addListener(updateActiveButton);
  
  return container;
}