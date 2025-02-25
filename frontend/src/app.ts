import "./styles/globals.css";
import "./styles/404.css";
import { navigate } from "./router";
import initializeHomeAnimations from "./pages/home";

const profileButton = document.querySelector(".profile-label");

export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/check-auth", {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.authenticated;
  } catch (err) {
    console.error("Error checking auth status:", err);
    return false;
  }
};

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