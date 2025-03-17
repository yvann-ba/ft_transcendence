import "./styles/globals.css";
import "./styles/404.css";
import { navigate, isAuthenticated } from "./router";
import initializeHomeAnimations from "./pages/home";
import { languageService, getInitialLanguage } from "./utils/languageContext";
import { createLanguageSwitcher } from "./components/languageSwitcher";

export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    // First check if we have a token in localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      return true;
    }
    
    // Check auth_token non-httpOnly cookie
    const hasAuthCookie = document.cookie.split(';').some(item => item.trim().startsWith('auth_token='));
    if (hasAuthCookie) {
      localStorage.setItem('token', 'authenticated');
      return true;
    }
    
    // If no local token, check with the server
    const response = await fetch("/api/auth/status", {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });
    
    if (!response.ok) return false;
    
    try {
      const data = await response.json();
      if (data.authenticated) {
        localStorage.setItem('token', 'authenticated');
        return true;
      }
      return false;
    } catch (jsonError) {
      console.error("Received non-JSON response from auth status endpoint");
      return false;
    }
  } catch (err) {
    console.error("Error checking auth status:", err);
    return false;
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize language
  const initialLang = getInitialLanguage();
  document.documentElement.lang = initialLang;
  await languageService.setLanguage(initialLang);
  
  // Add language switcher to the DOM
  const languageSwitcher = createLanguageSwitcher();
  document.body.appendChild(languageSwitcher);
  
  // Set up language change listener
  window.addEventListener('languageChanged', async () => {
    await navigate(); // Re-render the current page
  });
  
  checkAuthStatus();
  initializeNavbarAnimation();
  await navigate();

  if (window.location.pathname === "/" || window.location.pathname === "/home") {
    initializeHomeAnimations();
  }
  
  initializeBurgerMenu();
  
  window.addEventListener("popstate", async () => {
    await navigate();
  });
});

export const changeProfileLabel = (): void => {
  const profileLabel = document.querySelector(".profile-label") as HTMLElement;
  
  if (isAuthenticated()) {
    profileLabel.textContent = languageService.translate("nav.profile", "Profile");
    profileLabel.setAttribute("data-hover", languageService.translate("nav.profile", "Profile"));
  } else {
    profileLabel.textContent = languageService.translate("profile.login", "Login");
    profileLabel.setAttribute("data-hover", languageService.translate("profile.login", "Login"));
  }
};

const initializeNavbarAnimation = (): void => {
  const nav = document.querySelector(".nav");
  
  changeProfileLabel();

  if (nav) {
    setTimeout(() => {
      nav.classList.add("in");
    }, 500);
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
  const burgerMenu = document.querySelector<HTMLUListElement>('.ham-menu');

  if (burgerButton) {
    burgerButton.addEventListener('click', () => {
      burgerButton.classList.toggle('opened');
      const isOpened = burgerButton.classList.contains('opened');
      burgerButton.setAttribute('aria-expanded', isOpened.toString());
      if (isOpened) {
        burgerMenu?.classList.remove('hidden');
      } else {
        burgerMenu?.classList.add('hidden');
      }
    });
  }
};