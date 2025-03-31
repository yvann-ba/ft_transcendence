import "../styles/pong-selection.css";
import { navigate } from "../router";

export default function initializePongSelection(): (() => void) {
  const cards = document.querySelectorAll('.game-card');
  
  // Animation effect for game cards
  const animateCards = () => {
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animated');
      }, 100 * index);
    });
  };
  
  const handleCardMouseEnter = function(this: HTMLElement) {
    this.classList.add('hover-effect');
  };
  
  const handleCardMouseLeave = function(this: HTMLElement) {
    this.classList.remove('hover-effect');
  };
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', handleCardMouseEnter);
    card.addEventListener('mouseleave', handleCardMouseLeave);
    
    const playButton = card.querySelector('.play-button');
    if (playButton) {
      playButton.addEventListener('click', (e) => {
        e.preventDefault();
        const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
        if (href) {
          navigate(href);
        }
      });
    }
  });
  
  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', (e) => {
      e.preventDefault();
      navigate('/home');
    });
  }
  
  animateCards();
  
  return () => {
    cards.forEach(card => {
      card.removeEventListener('mouseenter', handleCardMouseEnter);
      card.removeEventListener('mouseleave', handleCardMouseLeave);
      
      const playButton = card.querySelector('.play-button');
      if (playButton) {
        playButton.removeEventListener('click', () => {});
      }
    });
    
    if (backButton) {
      backButton.removeEventListener('click', () => {});
    }
  };
}