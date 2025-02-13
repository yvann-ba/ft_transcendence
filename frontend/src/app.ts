import "./styles/globals.css";
import "./styles/404.css";
import { navigate } from "./router";
import initializeHomeAnimations from "./pages/home";

document.addEventListener("DOMContentLoaded", async () => {
  initializeNavbarAnimation();
  await navigate(); // Charge le contenu et le script via router.ts

  if (window.location.pathname === "/" || window.location.pathname === "/home") {
    initializeHomeAnimations();
  }

  window.addEventListener("popstate", async () => {
    await navigate(); // La navigation gère déjà le rechargement
  });
});

const initializeNavbarAnimation = () : void => {
  const nav = document.querySelector(".nav");

  if (nav) {
    setTimeout(() => {
      nav.classList.add("in");
    }, 500);
  }
};
