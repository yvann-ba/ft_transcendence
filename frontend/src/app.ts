import "./styles/globals.css";
import "./styles/404.css";
import { navigate } from "./router";
import initializeHomeAnimations from "./pages/home";

const profileButton = document.querySelector(".profile-label");

async function checkAuthStatus() {
  try {
    const response = await fetch('/api/check-auth', {
      method: 'GET',
      credentials: 'same-origin'
    });
    
    const data = await response.json();

    if (data.authenticated == true) {
      if (profileButton) {
        profileButton.textContent = "Profile";
        profileButton.setAttribute("data-hover", "Profile");
      }
    } else {
      if (profileButton) {
        profileButton.textContent = "Login";
        profileButton.setAttribute("data-hover", "Login");
      }
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
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

const initializeNavbarAnimation = (): void => {
  const nav = document.querySelector(".nav");
  

  if (nav) {
    setTimeout(() => {
      nav.classList.add("in");
    }, 500);
  }
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