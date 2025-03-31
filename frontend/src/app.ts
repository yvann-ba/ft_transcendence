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
  window.addEventListener('message', async (event) => {
    if (event.origin !== window.location.origin) return;
    
    if (event.data === 'auth-success') {
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('User data after OAuth login:', userData);
          
          if (userData.avatar) {
            localStorage.setItem('userAvatar', userData.avatar);
            console.log('Stored avatar URL in localStorage:', userData.avatar);
          }
          
          // Set auth token and update UI
          localStorage.setItem('token', 'authenticated');
          changeProfileLabel();
          
          // Redirect to home or refresh the page
          window.location.href = '/home';
        }
      } catch (error) {
        console.error('Error fetching user data after OAuth login:', error);
      }
    }
  });

  const initialLang = getInitialLanguage();
  document.documentElement.lang = initialLang;
  await languageService.setLanguage(initialLang);
  
  // Add language switcher to the DOM
  const languageSwitcher = createLanguageSwitcher();
  document.body.appendChild(languageSwitcher);
  
  window.addEventListener('languageChanged', async () => {
    await navigate();
  });
  
  await checkAuthStatus();
  
  initializeNavbarAnimation();
  
  await navigate();
  
  preloadCommonPages();
  
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
          
          navigate(href);
        }
      });
    });
  }
};