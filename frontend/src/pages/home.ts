import "../styles/home.css";

export default function initializeHomeAnimations(): void {
	// On suppose que l'élément contenant le texte animé est un <div>
	const animatedTextContainer = document.querySelector<HTMLDivElement>(".home-header-content");
	// On suppose ici que l'élément avec la classe "h-anim" est également un <div>
	const animatedText = document.querySelector<HTMLDivElement>(".h-anim");
  
	if (animatedTextContainer && animatedText) {
	  // Réinitialisation des classes d'animation
	  animatedTextContainer.classList.add("hidden");
	  animatedText.classList.remove("in");
  
	  // Ici, on ne sait pas exactement quel type d'élément contient la classe "split",
	  // on utilise donc HTMLElement pour rester générique.
	  const splits = animatedText.querySelectorAll<HTMLElement>(".split");
	  splits.forEach((split) => split.classList.remove("in"));
  
	  // Relancer l'animation après un délai
	  setTimeout(() => {
		animatedTextContainer.classList.remove("hidden");
		setTimeout(() => {
		  animatedText.classList.add("in");
		  setTimeout(() => {
			splits.forEach((split) => split.classList.add("in"));
		  }, 1000); // Délai pour synchroniser l'animation des "splits"
		}, 500); // Délai avant de montrer le texte principal
	  }, 100); // Petit délai pour s'assurer que les classes sont bien réinitialisées
	}
  }