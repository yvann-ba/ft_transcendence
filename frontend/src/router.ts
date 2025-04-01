import { languageService } from "./utils/languageContext";
import { changeProfileLabel } from "./app";

const pageCache: { [key: string]: string } = {};

let isTransitioning = false;

const routeParams: { [key: string]: string } = {};

const validRoutes = [
  "/", 
  "/home", 
  "/about", 
  "/contact",
  "/login",
  "/register",
  "/pong-selection",
  "/pong-game",
  "/pong-tournament",
  "/four-player-pong",
  "/profile-page",
  "/profile-edit"
];

export const navigate = async (path?: string, preserveParams = false): Promise<void> => {
  let targetPath = path || window.location.pathname;
  
  let queryString = '';
  if (path && path.includes('?')) {
    const [basePath, params] = path.split('?');
    targetPath = basePath;
    queryString = `?${params}`;
    
    const urlParams = new URLSearchParams(params);
    urlParams.forEach((value, key) => {
      routeParams[key] = value;
    });
  } else if (preserveParams && window.location.search) {
    queryString = window.location.search;
  }
  
  const cleanPath = targetPath.split('?')[0];
  const pathExists = validRoutes.includes(cleanPath);

  if (!pathExists && cleanPath !== "/404") {
    targetPath = "/404";
    queryString = "";
  }
  
  if ((targetPath === "/login" || targetPath === "/register") && isAuthenticated()) {
    targetPath = "/profile-page";
    queryString = "";
  }

  if (requiresAuthentication(targetPath) && !isAuthenticated()) {
    const returnUrl = encodeURIComponent(targetPath + queryString);
    targetPath = "/login";
    queryString = `?redirect=${returnUrl}`;
  }

  if (isTransitioning) return;
  
  isTransitioning = true;
  
  const overlay = createTransitionOverlay();
  document.body.appendChild(overlay);
  
  setTimeout(async () => {
    try {
      const fullPath = targetPath + queryString;
      let pageContent = pageCache[fullPath];
      if (!pageContent) {
        pageContent = await loadPage(getViewName(targetPath));
        pageCache[fullPath] = pageContent;
      }
      
      document.getElementById("app")!.innerHTML = pageContent;
      
      if (path || queryString) {
        window.history.pushState({}, "", targetPath + queryString);
      }
      
      applyTranslationsToPage();
      
      await loadPageScript(targetPath + queryString);

      const { changeProfileLabel } = await import("./app");
      changeProfileLabel();
      
      setTimeout(() => {
        overlay.style.opacity = "0";
        
        setTimeout(() => {
          document.body.removeChild(overlay);
          isTransitioning = false;
        }, 300);
      }, 200);
    } catch (error) {
      console.error("Navigation error:", error);
      isTransitioning = false;
      
      overlay.style.opacity = "0";
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 300);
    }
  }, 10);
};

function createTransitionOverlay(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = '#000';
  overlay.style.zIndex = '9999';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.3s ease';
  overlay.style.pointerEvents = 'none';
  
  void overlay.offsetWidth;
  overlay.style.opacity = '1';
  
  return overlay;
}

function requiresAuthentication(path: string): boolean {
  const publicRoutes = [
    "/", 
    "/home", 
    "/about", 
    "/contact", 
    "/login", 
    "/register",
    "/404"
  ];
  
  const cleanPath = path.split('?')[0];
  
  return !publicRoutes.includes(cleanPath);
}

function getViewName(path: string): string {
  if (path === "/404") return "404";
  
  if (path === "/") return "home";
  
  let routeName = path.substring(1);
  
  const queryParamIndex = routeName.indexOf('?');
  if (queryParamIndex > -1) {
    routeName = routeName.substring(0, queryParamIndex);
  }
  
  return routeName || "home";
}

async function loadPage(viewName: string): Promise<string> {
  try {
    const response = await fetch(`/views/${viewName}.html`);
    if (!response.ok) {
      if (viewName !== "404") {
        return await loadPage("404");
      }
      throw new Error(`Failed to load page: ${viewName}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error loading view ${viewName}:`, error);
    return "<section>Page not found</section>";
  }
}

// Function to apply translations to the current page
function applyTranslationsToPage(): void {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      element.textContent = languageService.translate(key);
    }
  });
  
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const dataHover = link.getAttribute('data-hover');
    if (dataHover) {
      const page = link.getAttribute('data-page');
      if (page) {
        let translationKey = '';
        if (page === 'home') translationKey = 'nav.home';
        else if (page === 'about') translationKey = 'nav.about';
        else if (page === 'contact') translationKey = 'nav.contact';
        else if (page === 'profile-page') translationKey = 'nav.profile';
        
        if (translationKey) {
          const translated = languageService.translate(translationKey);
          link.setAttribute('data-hover', translated);
        }
      }
    }
  });
  
  changeProfileLabel();
}

let currentCleanup: (() => void) | null = null;

async function loadPageScript(path: string): Promise<void> {
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  const [route, queryParams] = path.split('?');
  const urlParams = new URLSearchParams(queryParams || '');

  if (requiresAuthentication(route) && !isAuthenticated()) {
    console.warn("Attempted to access protected route without authentication");
    return;
  }
  try {
    if (route === "/" || route === "/home") {
      const module = await import("./pages/home");
      currentCleanup = module.default() || null;
    } else if (route === "/pong-game") {
      const module = await import("./pages/pong-game");
      module.default();
    } else if (path === "/pong-selection") {
      const module = await import("./pages/pong-selection");
      currentCleanup = module.default() || null;
    } else if (route === "/four-player-pong") {
      const module = await import("./game/four-player-pong");
      currentCleanup = module.default() || null;
    } else if (route === "/pong-tournament") {
      const module = await import("./pages/pong-tournament");
      currentCleanup = module.default() || null;
    } else if (route === "/profile-page") {
      const module = await import("./pages/profile-page");
      module.default();
    } else if (route === "/about") {
      const module = await import("./pages/about");
      currentCleanup = module.default() || null;
    } else if (route === "/contact") {
      const module = await import("./pages/contact");
      currentCleanup = module.default() || null;
    } else if (route === "/login") {
      const module = await import("./pages/login");
      module.default();
    } else if (route === "/register") {
      const module = await import("./pages/register");
      module.default();
    } else if (route === "/404") {
      console.log("Loading 404 page");
    }
    else if (route === "/profile-edit") {
      const module = await import("./pages/profile-edit");
      module.default();
    }
  } catch (error) {
    console.error(`Error loading script for ${path}:`, error);
  }
}

// Global click handler for navigation links
document.body.addEventListener("click", (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const link = target.closest("a");
  if (link && !link.hasAttribute('target')) {
    const href = link.getAttribute("href");
    
    if (href && href.startsWith("/")) {
      event.preventDefault();
      navigate(href);
    }
  }
});

export function redirectAfterAuth(): void {
  const redirect = getQueryParam('redirect');
  if (redirect) {
    navigate(decodeURIComponent(redirect));
  } else {
    navigate('/profile-page');
  }
}

window.addEventListener("popstate", () => {
  const currentPath = window.location.pathname;
  
  if (requiresAuthentication(currentPath) && !isAuthenticated()) {
    const returnUrl = encodeURIComponent(currentPath + window.location.search);
    navigate(`/login?redirect=${returnUrl}`, false);
    return;
  }

  navigate();
});

export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  return token !== null && token !== "";
}

export function getQueryParam(key: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key) || routeParams[key] || null;
}

export function preloadCommonPages(): void {
  const pagesToPreload = [
    "/home",
    "/pong-selection",
    "/login",
    "/404"
  ];
  
  setTimeout(() => {
    pagesToPreload.forEach(async (path) => {
      try {
        const viewName = getViewName(path);
        if (!pageCache[path]) {
          const content = await loadPage(viewName);
          pageCache[path] = content;
        }
      } catch (error) {
      }
    });
  }, 2000);
}

export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      return true;
    }
    
    const hasAuthCookie = document.cookie.split(';').some(item => item.trim().startsWith('auth_token='));
    if (hasAuthCookie) {
      localStorage.setItem('token', 'authenticated');
      return true;
    }
    
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