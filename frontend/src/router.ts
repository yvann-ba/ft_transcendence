import initializeHomeAnimations from "./pages/home";

const routes: { [key: string]: string } = {
  "/": "home",
  "/home": "home",
  "/pong-game": "pong-game",
  "/profile-page": "profile-page",
  "404": "404",
};

export const navigate = async () => {
  const path = window.location.pathname;
  const page = routes[path] || routes["404"];
  const pageContent = await loadPage(page);
  document.getElementById("app")!.innerHTML = pageContent; // Seul le contenu change

  // Charger le script de la page après avoir modifié le contenu
  await loadPageScript();

  if (page === "home") {
    initializeHomeAnimations();
  }
};

let currentCleanup: (() => void) | null = null;

const loadPageScript = async () => {
  const path = window.location.pathname;

  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  try {
    if (path === "/" || path === "/home") {
      const module = await import("./pages/home");
      currentCleanup = module.default() || null;
    } else if (path === "/pong-game") {
      const module = await import("./pages/pong-game");
      currentCleanup = module.default() || null;
    } else if (path === "/profile-page") {
      const module = await import("./pages/profile-page");
      currentCleanup = module.default() || null;
    }
  } catch (error) {
    console.error(`Erreur lors du chargement du script pour ${path}:`, error);
  }
};
  
const loadPage = async (page: string) => {
	try {
	  const response = await fetch(`/views/${page}.html`);
	  if (!response.ok) throw new Error("Page introuvable");
	  const html = await response.text();
	  
	  const parser = new DOMParser();
	  const doc = parser.parseFromString(html, "text/html");
	  return doc.body.innerHTML;
  
	} catch (error) {
	  return "<section>Page introuvable</section>";
	}
  };
  
// Gestion des clics sur les liens
document.addEventListener("DOMContentLoaded", () => {
  navigate();

  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const href = link.getAttribute("href")!;
      window.history.pushState({}, "", href);
      navigate(); // Navigation sans rechargement de la page
    });
  });

  window.addEventListener("popstate", navigate); // Gérer les retours dans l'historique
});
