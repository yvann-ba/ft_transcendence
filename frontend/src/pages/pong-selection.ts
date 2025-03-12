import "../styles/pong-selection.css";

export default function initializePongSelection(): (() => void) | null {
  // No special functionality needed, just loading the CSS
  
  // You could add some animations or interactivity here if desired
  const cards = document.querySelectorAll('.game-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.classList.add('hover-effect');
    });
    card.addEventListener('mouseleave', function() {
      this.classList.remove('hover-effect');
    });
  });
  
  // Return cleanup function
  return () => {
    cards.forEach(card => {
      card.removeEventListener('mouseenter', function() {});
      card.removeEventListener('mouseleave', function() {});
    });
  };
}