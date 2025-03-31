import "../styles/home.css";

export default function initializeHomeAnimations(): () => void {
	const animatedTextContainer = document.querySelector<HTMLDivElement>(".home-header-content");
	const animatedText = document.querySelector<HTMLDivElement>(".h-anim");

	if (animatedTextContainer && animatedText) {
	  animatedTextContainer.classList.add("hidden");
	  animatedText.classList.remove("in");
	  const splits = animatedText.querySelectorAll<HTMLElement>(".split");
	  splits.forEach((split) => split.classList.remove("in"));
  
	  setTimeout(() => {
		animatedTextContainer.classList.remove("hidden");
		setTimeout(() => {
		  animatedText.classList.add("in");
		  setTimeout(() => {
			splits.forEach((split) => split.classList.add("in"));
		  }, 1000);
		}, 500);
	  }, 100);
  
	  return () => {
		animatedTextContainer.classList.remove("hidden");
		animatedText.classList.remove("in");
		splits.forEach((split) => split.classList.remove("in"));
	  };
	}
  
	const handleResize = () => {
	  const viewportHeight = window.innerHeight;
	  const headerElement = document.querySelector<HTMLElement>('.home-header');
	  if (headerElement) {
		headerElement.style.height = `${viewportHeight}px`;
	  }
	};
  
	handleResize();
	window.addEventListener('resize', handleResize);
	
	return () => {
	  window.removeEventListener('resize', handleResize);
	};
}