import "./styles/globals.css";
import "./styles/404.css";
import { navigate, isAuthenticated } from "./router";
import initializeHomeAnimations from "./pages/home";

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

  
  if (isAuthenticated())
  {
    profileLabel.textContent = "Profile";
    profileLabel.setAttribute("data-hover", "Profile");
  }
  else
  {
    profileLabel.textContent = "Login";
    profileLabel.setAttribute("data-hover", "Login");
  }
}

const initializeNavbarAnimation = (): void => {
  const nav = document.querySelector(".nav");
  
  changeProfileLabel(); // Execute the function instead of referencing it

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