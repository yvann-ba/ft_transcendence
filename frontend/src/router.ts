import initializeHomeAnimations from "./pages/home";

const loadPage = async (page: string) => {
  try {
    const response = await fetch(`/views/${page}.html`);
    if (!response.ok) throw new Error("Page introuvable");
    const html = await response.text();
    
    // Extrait le contenu entre <body> et </body> (si nécessaire)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.innerHTML; // Retourne uniquement le contenu du body

  } catch (error) {
    return "<section>Page introuvable</section>";
  }
};

const routes: { [key: string]: string } = {
	"/": "home",
	"/home": "home",
	"/pong-game": "pong-game",
	"404": "404",
};

export const navigate = async () => {
	const path = window.location.pathname;
	const page = routes[path] || routes["404"];
	const pageContent = await loadPage(page);
	document.getElementById("app")!.innerHTML = pageContent; // Seul le contenu change
	if (page === "home") {
		initializeHomeAnimations();
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
		navigate();
		});
	});

	window.addEventListener("popstate", navigate);
});