import initializeHomeAnimations from "./pages/home";
import { changeProfileLabel } from "./app";
import { languageService } from "./utils/languageContext";

const routes: { [key: string]: string } = {
  "/": "home",
  "/home": "home",
  "/pong-selection": "pong-selection",
  "/pong-game": "pong-game",
  "/four-player-pong" : "four-player-pong",
  "/profile-page": "profile-page",
  "/test": "test",
  "/login": "login",
  "/about": "about",
  "/contact": "contact",
  "404": "404",
};

const isPublicRoute = (path: string): boolean => {
  if (path === "/" || path === "/home")
    return true;
  return (false)
}

export const navigate = async (): Promise<void> => {
  const hasAuthCookie = document.cookie.split(';').some(item => item.trim().startsWith('auth_token='));
  if (hasAuthCookie && !isAuthenticated()) {
    localStorage.setItem('token', 'authenticated');
  }

  let path = window.location.pathname;
  if (!isPublicRoute(path) && !isAuthenticated()) {
    path = "/login";
  }
  if (path === '/login' && isAuthenticated()) {
    path = "/home";
  }

  let page = routes[path] || routes["404"];
  const pageContent = await loadPage(page);
  document.getElementById("app")!.innerHTML = pageContent;
  changeProfileLabel();

  // Apply translations to the loaded page
  applyTranslationsToPage();

  // Check for AI mode query parameter
  if (path === "/pong-game") {
    const urlParams = new URLSearchParams(window.location.search);
    const aiMode = urlParams.get('ai');
    if (aiMode === "true") {
      // Store AI mode preference to be used when initializing the game
      localStorage.setItem('pongAiMode', 'true');
    } else {
      localStorage.removeItem('pongAiMode');
    }
  }

  await loadPageScript(path);

  if (page === "home") {
    initializeHomeAnimations();
  }
};

// Function to apply translations to the current page
function applyTranslationsToPage() {
  // Find all elements with data-i18n attribute
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      element.textContent = languageService.translate(key);
    }
  });
  
  // Update specific elements based on their IDs or classes
  
  // Home page
  const homeHeader = document.querySelector('.home-header-heading');
  if (homeHeader) {
    const clickElem = homeHeader.querySelector('[data-i="1"]');
    const toElem = homeHeader.querySelector('[data-i="2"]');
    const playElem = homeHeader.querySelector('[data-i="3"]');
    const pongElem = homeHeader.querySelector('[data-i="4"]');
    
    if (clickElem) clickElem.textContent = languageService.translate('home.title.click', 'Click');
    if (toElem) toElem.textContent = languageService.translate('home.title.to', 'To');
    if (playElem) playElem.textContent = languageService.translate('home.title.play', 'Play');
    if (pongElem) pongElem.textContent = languageService.translate('home.title.pong', 'Pong');
  }
  
  // Pong selection page
  const gameCards = document.querySelectorAll('.game-card');
  if (gameCards.length > 0) {
    const playButtons = document.querySelectorAll('.play-button');
    playButtons.forEach(btn => {
      btn.textContent = languageService.translate('game.play', 'PLAY NOW');
    });
    
    // Update game card titles
    const classicModeCard = document.getElementById('classic-mode');
    const aiModeCard = document.getElementById('ai-mode');
    const multiplayerModeCard = document.getElementById('multiplayer-mode');
    
    if (classicModeCard) {
      const title = classicModeCard.querySelector('h2');
      if (title) title.textContent = languageService.translate('game.classic_pong', 'Classic Pong');
      
      const featuresList = classicModeCard.querySelectorAll('.features li');
      if (featuresList.length >= 3) {
        featuresList[0].textContent = languageService.translate('game.features.two_players', 'Two players');
        featuresList[1].textContent = languageService.translate('game.features.same_keyboard', 'Same keyboard');
        featuresList[2].textContent = languageService.translate('game.features.addictive', 'Truly addictive...');
      }
    }
    
    if (aiModeCard) {
      const title = aiModeCard.querySelector('h2');
      if (title) title.textContent = languageService.translate('game.ai_challenge', 'AI Pong Challenge');
      
      const featuresList = aiModeCard.querySelectorAll('.features li');
      if (featuresList.length >= 3) {
        featuresList[0].textContent = languageService.translate('game.features.single_player', 'Single player');
        featuresList[1].textContent = languageService.translate('game.features.difficulty_levels', 'Three difficulty levels');
        featuresList[2].textContent = languageService.translate('game.features.adaptive_ai', 'Adaptive AI opponent');
      }
    }
    
    if (multiplayerModeCard) {
      const title = multiplayerModeCard.querySelector('h2');
      if (title) title.textContent = languageService.translate('game.brick_breaker', 'Brick Breaker');
      
      const featuresList = multiplayerModeCard.querySelectorAll('.features li');
      if (featuresList.length >= 3) {
        featuresList[0].textContent = languageService.translate('game.features.four_players', 'Four players');
        featuresList[1].textContent = languageService.translate('game.features.square_arena', 'Square arena');
        featuresList[2].textContent = languageService.translate('game.features.fast_paced', 'Fast-paced action');
      }
    }
  }
  
  // Profile page
  const profileTitle = document.querySelector('.page-title');
  if (profileTitle && profileTitle.textContent?.includes('Profile')) {
    profileTitle.textContent = languageService.translate('profile.title', 'Player Profile');
    
    // Update tabs
    const tabLinks = document.querySelectorAll('.tab-link');
    if (tabLinks.length >= 3) {
      tabLinks[0].textContent = languageService.translate('profile.tabs.info', 'Profile Info');
      tabLinks[1].textContent = languageService.translate('profile.tabs.stats', 'Statistics');
      tabLinks[2].textContent = languageService.translate('profile.tabs.history', 'History');
    }
    
    // Update add friend button
    const addFriendBtn = document.querySelector('.btn-add-friend');
    if (addFriendBtn) {
      addFriendBtn.textContent = languageService.translate('profile.login', 'log in');
    }
  }
  
  // About page
  const aboutHeader = document.querySelector('.about-header h1');
  if (aboutHeader) {
    const aboutSpan = aboutHeader.querySelector('[data-i="1"]');
    const ftTranscendenceSpan = aboutHeader.querySelector('[data-i="2"]');
    
    if (aboutSpan) aboutSpan.textContent = languageService.translate('about.title', 'About');
    // Keep ft_transcendence as is, no translation needed for the project name
  }
  
  const aboutSections = document.querySelectorAll('.section-title h2');
  aboutSections.forEach(section => {
    const text = section.textContent?.trim();
    if (text === 'Project Overview') {
      section.textContent = languageService.translate('about.project', 'Project Overview');
    } else if (text === 'Technology Stack') {
      section.textContent = languageService.translate('about.tech_stack', 'Technology Stack');
    } else if (text === 'Key Features') {
      section.textContent = languageService.translate('about.features', 'Key Features');
    } else if (text === 'Our Team') {
      section.textContent = languageService.translate('about.team', 'Our Team');
    }
  });
  
  // Contact page
  const contactHeader = document.querySelector('.contact-header h1');
  if (contactHeader) {
    const meetSpan = contactHeader.querySelector('[data-i="1"]');
    const theSpan = contactHeader.querySelector('[data-i="2"]');
    const teamSpan = contactHeader.querySelector('[data-i="3"]');
    
    if (meetSpan) meetSpan.textContent = languageService.translate('contact.title', 'Meet');
    if (theSpan) theSpan.textContent = languageService.translate('contact.the', 'The');
    if (teamSpan) teamSpan.textContent = languageService.translate('contact.team', 'Team');
    
    const subtitle = document.querySelector('.contact-subtitle');
    if (subtitle) subtitle.textContent = languageService.translate('contact.subtitle', 'The masterminds behind ft_transcendence');
    
    const intro = document.querySelector('.team-intro p');
    if (intro) intro.textContent = languageService.translate('contact.intro', 'Our team of five developers worked together to create this immersive Pong experience. Each member brought unique skills and perspectives to make ft_transcendence a reality.');
  }
}

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
    } else if (path === "/pong-selection") {
      const module = await import("./pages/pong-selection");
      currentCleanup = module.default() || null;
    } else if (path === "/four-player-pong") {
      const module = await import("./game/four-player-pong");
      currentCleanup = module.default() || null;
    } else if (path === "/profile-page") {
      const module = await import("./pages/profile-page");
      currentCleanup = module.default() || null;
    } else if (path === "/about") {
      const module = await import("./pages/about");
      currentCleanup = module.default() || null;
    } else if (path === "/contact") {
      const module = await import("./pages/contact");
      currentCleanup = module.default() || null;
    } else if (path === "/test") {
      // const module = await import("./pages/test");
      // module.default();
    } else if (path === "/login") {
      const module = await import("./pages/login");
      module.default();
    }
  } catch (error) {
    console.error(`Error loading script for ${path}:`, error);
  }
};
  
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return token !== null && token !== "";
};

const loadPage = async (page: string): Promise<string> => {
  try {
    const response = await fetch(`/views/${page}.html`);
    if (!response.ok) throw new Error("Page not found");
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.innerHTML;
  } catch (error) {
    return "<section>Page not found</section>";
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