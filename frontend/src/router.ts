import { languageService } from "./utils/languageContext";
import { changeProfileLabel } from "./app";

// Cache for preloaded HTML content
const pageCache: { [key: string]: string } = {};

// Flag to track if a transition is in progress
let isTransitioning = false;

// Store query parameters for routes
const routeParams: { [key: string]: string } = {};

export const navigate = async (path?: string, preserveParams = false): Promise<void> => {
  // If no path is provided, use the current path
  let targetPath = path || window.location.pathname;
  
  // Handle query parameters
  let queryString = '';
  if (path && path.includes('?')) {
    const [basePath, params] = path.split('?');
    targetPath = basePath;
    queryString = `?${params}`;
    
    // Parse and store query parameters
    const urlParams = new URLSearchParams(params);
    urlParams.forEach((value, key) => {
      routeParams[key] = value;
    });
  } else if (preserveParams && window.location.search) {
    // Preserve existing query parameters if requested
    queryString = window.location.search;
  }
  
  // If transition is already in progress, ignore
  if (isTransitioning) return;
  
  isTransitioning = true;
  
  // Create transition overlay
  const overlay = createTransitionOverlay();
  document.body.appendChild(overlay);
  
  // Fade in the overlay
  setTimeout(async () => {
    try {
      // Get the page content (from cache or fetch)
      const fullPath = targetPath + queryString;
      let pageContent = pageCache[fullPath];
      if (!pageContent) {
        pageContent = await loadPage(getViewName(targetPath));
        // Store in cache for future use
        pageCache[fullPath] = pageContent;
      }
      
      // Update the content while overlay is visible
      document.getElementById("app")!.innerHTML = pageContent;
      
      // Update URL if necessary (when called with a specific path)
      if (path || queryString) {
        window.history.pushState({}, "", targetPath + queryString);
      }
      
      // Apply translations
      applyTranslationsToPage();
      
      // Initialize any scripts needed for the new page
      await loadPageScript(targetPath + queryString);
      
      // Fade out the overlay
      setTimeout(() => {
        overlay.style.opacity = "0";
        
        setTimeout(() => {
          // Remove overlay when fade out completes
          document.body.removeChild(overlay);
          isTransitioning = false;
        }, 300);
      }, 200);
    } catch (error) {
      console.error("Navigation error:", error);
      isTransitioning = false;
      
      // Still remove overlay in case of error
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
  overlay.style.pointerEvents = 'none'; // Allow clicking through during fade
  
  // Force a reflow before changing opacity
  void overlay.offsetWidth;
  overlay.style.opacity = '1';
  
  return overlay;
}

function getViewName(path: string): string {
  // Default to home if path is root
  if (path === "/") return "home";
  
  // Remove the leading slash
  let routeName = path.substring(1);
  
  // Remove any query parameters
  const queryParamIndex = routeName.indexOf('?');
  if (queryParamIndex > -1) {
    routeName = routeName.substring(0, queryParamIndex);
  }
  
  // If empty after processing, default to home
  return routeName || "home";
}

async function loadPage(viewName: string): Promise<string> {
  try {
    const response = await fetch(`/views/${viewName}.html`);
    if (!response.ok) throw new Error(`Failed to load page: ${viewName}`);
    return await response.text();
  } catch (error) {
    console.error(`Error loading view ${viewName}:`, error);
    return "<section>Page not found</section>";
  }
}

// Function to apply translations to the current page
function applyTranslationsToPage(): void {
  // Find all elements with data-i18n attribute
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      element.textContent = languageService.translate(key);
    }
  });
  
  // Update navigation links hover state
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
  
  // Update profile button based on auth status
  changeProfileLabel();
}

// Add a shared cleanup function to handle navigation transition cleanup
let currentCleanup: (() => void) | null = null;

// Function to load and execute page-specific JavaScript
async function loadPageScript(path: string): Promise<void> {
  // Clean up previous page if needed
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  // Parse path to get main route and query parameters
  const [route, queryParams] = path.split('?');
  const urlParams = new URLSearchParams(queryParams || '');

  try {
    // Import the appropriate module based on the path
    if (route === "/" || route === "/home") {
      const module = await import("./pages/home");
      currentCleanup = module.default() || null;
    } else if (route === "/pong-game") {
      const module = await import("./pages/pong-game");
      currentCleanup = module.default() || null;
    } else if (route === "/pong-selection") {
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
      currentCleanup = module.default() || null;
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
    
    // Only handle internal links
    if (href && href.startsWith("/")) {
      event.preventDefault();
      navigate(href);
    }
  }
});

// Handle browser back/forward buttons
window.addEventListener("popstate", () => {
  navigate();
});

export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  return token !== null && token !== "";
}

// Get a query parameter value for the current page
export function getQueryParam(key: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key) || routeParams[key] || null;
}

// Preload common pages in the background
export function preloadCommonPages(): void {
  // List of commonly accessed pages to preload
  const pagesToPreload = [
    "/home",
    "/pong-selection",
    "/login"
  ];
  
  // Preload pages in the background
  setTimeout(() => {
    pagesToPreload.forEach(async (path) => {
      try {
        const viewName = getViewName(path);
        if (!pageCache[path]) {
          const content = await loadPage(viewName);
          pageCache[path] = content;
        }
      } catch (error) {
        // Silently fail - this is just preloading
      }
    });
  }, 2000); // Wait a bit after initial page load
}

// Export this for backward compatibility
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