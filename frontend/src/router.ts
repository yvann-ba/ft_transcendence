import initializeHomeAnimations from "./pages/home";
import { changeProfileLabel } from "./app";

const routes: { [key: string]: string } = {
  "/": "home",
  "/home": "home",
  "/pong-game": "pong-game",
  "/profile-page": "profile-page",
  "/test": "test",
  "/login": "login",
  "/about" : "about",
  "/contact": "contact",
  "404": "404",
};

const isPublicRoute = (path: string): boolean => {
  if (path === "/" || path === "/home")
    return true;
  return (false)
}

export const navigate = async (): Promise<void> => {
  let path = window.location.pathname;
  if (!isPublicRoute(path) && !isAuthenticated()) {
    path = "/login";
  }
  if (path === '/login' && isAuthenticated())
    path = "/home"

  let page = routes[path] || routes["404"];
  const pageContent = await loadPage(page);
  document.getElementById("app")!.innerHTML = pageContent;
  changeProfileLabel();

  await loadPageScript(path);


  if (page === "home") {
    initializeHomeAnimations();
  }
};

let currentCleanup: (() => void) | null = null;

const loadPageScript = async (path: string): Promise<void> => {

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
    }/*
     else if (path === "/profile-page") {
      const module = await import("./pages/profile-page");
      currentCleanup = module.default() || null;
    }
    */
    else if (path === "/about") {
      const module = await import("./pages/about");
      currentCleanup = module.default() || null;
    }
    else if (path === "/contact") {
      const module = await import("./pages/contact");
      currentCleanup = module.default() || null;
    }
      else if (path === "/test") {
      // const module = await import("./pages/test");
      // module.default();
    }
     else if (path === "/login") {
      const module = await import("./pages/login");
      module.default();
    }
  } catch (error) {
    console.error(`Erreur lors du chargement du script pour ${path}:`, error);
  }
};
  
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return token !== null && token !== "";
};

const loadPage = async (page: string): Promise<string> => {
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

document.body.addEventListener("click", (event: MouseEvent) : void => {
  const target = event.target as HTMLElement;
  const link = target.closest("a");
  if (link) {
    const href = link.getAttribute("href");
    const profileLabel = document.querySelector(".profile-label") as HTMLElement;

    if (href && href.startsWith("/")) {
      event.preventDefault();
      window.history.pushState({}, "", href);
      navigate();
    }
  }
});
