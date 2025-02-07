import "./styles/globals.css";
import "./styles/404.css";
import { navigate } from "./router";
import initializeHomeAnimations from "./pages/home";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Pong Game Initialized!");
  
  initializeNavbarAnimation();
  await navigate(); // Charge le contenu de la page

  // Charger dynamiquement le script spécifique à la page
  await loadPageScript(); 

  if (window.location.pathname === "/" || window.location.pathname === "/home") {
    initializeHomeAnimations();
  }


  // Gérer les changements d'URL via l'historique (bouton retour)
  window.addEventListener("popstate", async () => {
    await navigate();
    initializeHomeAnimations();
    await loadPageScript();
  });
});


const loadPageScript = async () => {
  const path = window.location.pathname;

  try {
    if (path === "/" || path === "/home") {
      const module = await import("./pages/home");
      module.default(); // Exécute la fonction exportée par défaut
    }
    else if (path === "/pong-game") {
      const module = await import("./pages/pong-game");
      module.default(); // Exécute la fonction exportée par défaut
    }
    else {
      console.log(`Aucun script à charger pour ${path}`);
    }
  } catch (error) {
    console.error(`Erreur lors du chargement du script pour ${path}:`, error);
  }
};

const initializeNavbarAnimation = () => {
  const nav = document.querySelector(".nav");

  console.log("Navbar animation initialized!");

  if (nav) {
    setTimeout(() => {
      nav.classList.add("in");
    }, 500);
  }
};