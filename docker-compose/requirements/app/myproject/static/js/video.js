// static/js/video.js
document.addEventListener('DOMContentLoaded', function() {
    const playButton = document.getElementById('play-button');
    const app = document.getElementById('app');

    playButton.addEventListener('click', function() {
        // Ajouter une classe pour la transition
        app.classList.add('fade-in');
        app.style.display = 'flex';

        // Masquer la vidéo de fond et le bouton
        document.getElementById('video-header').style.display = 'none';

        // Émettre un événement personnalisé pour indiquer que le jeu doit être chargé
        const event = new CustomEvent('loadGame');
        document.dispatchEvent(event);
    });
});
