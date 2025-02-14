import "./styles/globals.css";
import "./styles/404.css";
import { navigate } from "./router";
import initializeHomeAnimations from "./pages/home";

document.addEventListener("DOMContentLoaded", async () => {
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