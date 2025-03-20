import "./styles/globals.css";
import "./styles/404.css";
import { navigate, checkAuthStatus, preloadCommonPages } from "./router";
import { languageService, getInitialLanguage } from "./utils/languageContext";
import { createLanguageSwitcher } from "./components/languageSwitcher";

export const changeProfileLabel = (): void => {
  const profileLabel = document.querySelector(".profile-label") as HTMLElement;
  
  if (profileLabel) {
    const isAuth = localStorage.getItem('token') !== null;
    
    if (isAuth) {
      profileLabel.textContent = languageService.translate("nav.profile", "Profile");
      profileLabel.setAttribute("data-hover", languageService.translate("nav.profile", "Profile"));
    } else {
      profileLabel.textContent = languageService.translate("profile.login", "Login");
      profileLabel.setAttribute("data-hover", languageService.translate("profile.login", "Login"));
    }
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  // Add the message listener for Google OAuth popup
  window.addEventListener('message', (event) => {
    // Verify origin
    if (event.origin !== window.location.origin) return;
    
    // Check for auth success message
    if (event.data === 'auth-success') {
      // Update app state
      localStorage.setItem('token', 'authenticated');
      
      // Update UI if needed
      changeProfileLabel();
      
      // Navigate if needed
      if (window.location.pathname === '/login') {
        navigate('/home');
      }
    }
  });

  // Initialize language
  const initialLang = getInitialLanguage();
  document.documentElement.lang = initialLang;
  await languageService.setLanguage(initialLang);
  
  // Add language switcher to the DOM
  const languageSwitcher = createLanguageSwitcher();
  document.body.appendChild(languageSwitcher);
  
  // Set up language change listener
  window.addEventListener('languageChanged', async () => {
    await navigate(); // Re-render the current page with new language
  });
  
  // Check authentication status
  await checkAuthStatus();
  
  // Initialize navbar animation
  initializeNavbarAnimation();
  
  // Navigate to initial page with smooth transition
  await navigate();
  
  // Preload common pages for faster navigation
  preloadCommonPages();
  
  // Initialize burger menu for mobile
  initializeBurgerMenu();
});

const initializeNavbarAnimation = (): void => {
  const nav = document.querySelector(".nav");
  
  changeProfileLabel();

  if (nav) {
    setTimeout(() => {
      nav.classList.add("in");
    }, 300);
  }
  
  // Update navbar links with translations
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const page = link.getAttribute('data-page');
    if (page === 'home') {
      link.querySelector('span')!.textContent = languageService.translate('nav.home', 'Home');
    } else if (page === 'about') {
      link.querySelector('span')!.textContent = languageService.translate('nav.about', 'About');
    } else if (page === 'contact') {
      link.querySelector('span')!.textContent = languageService.translate('nav.contact', 'Contact');
    } else if (page === 'profile-page') {
      link.querySelector('span')!.textContent = languageService.translate('nav.profile', 'Profile');
    }
  });
};

const initializeBurgerMenu = (): void => {
  const burgerButton = document.querySelector<HTMLButtonElement>('.burger-menu-button');
  const burgerMenu = document.querySelector<HTMLDivElement>('.ham-menu');

  if (burgerButton && burgerMenu) {
    // Remove any existing event listeners and recreate them
    const newBurger = burgerButton.cloneNode(true) as HTMLButtonElement;
    burgerButton.parentNode?.replaceChild(newBurger, burgerButton);
    
    newBurger.addEventListener('click', () => {
      newBurger.classList.toggle('opened');
      const isOpened = newBurger.classList.contains('opened');
      newBurger.setAttribute('aria-expanded', isOpened.toString());
      
      if (isOpened) {
        burgerMenu.classList.remove('hidden');
      } else {
        burgerMenu.classList.add('hidden');
      }
    });
    
    // Set up navigation in the hamburger menu
    const menuLinks = burgerMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          // Close menu before navigating
          burgerMenu.classList.add('hidden');
          newBurger.classList.remove('opened');
          newBurger.setAttribute('aria-expanded', 'false');
          
          // Navigate to the destination
          navigate(href);
        }
      });
    });
  }
};