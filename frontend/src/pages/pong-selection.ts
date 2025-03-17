import "../styles/pong-selection.css";

export default function initializePongSelection(): (() => void) | null {
  const cards = document.querySelectorAll('.game-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.classList.add('hover-effect');
    });
    card.addEventListener('mouseleave', function() {
      this.classList.remove('hover-effect');
    });
  });
  return () => {
    cards.forEach(card => {
      card.removeEventListener('mouseenter', function() {});
      card.removeEventListener('mouseleave', function() {});
    });
  };
}