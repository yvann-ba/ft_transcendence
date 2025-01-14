document.addEventListener("DOMContentLoaded", () => {
    const animatedTextContainer = document.querySelector(".home-header-content");
    const animatedText = document.querySelector(".h-anim");

    if (animatedTextContainer) {
        // Réinitialiser l'animation en supprimant les classes
        animatedTextContainer.classList.add("hidden");
        setTimeout(() => {
            animatedTextContainer.classList.remove("hidden"); // Affiche le conteneur du texte

            setTimeout(() => {
                animatedText.classList.add("in"); // Lance l'animation de révélation du texte

                setTimeout(() => {
                    const splits = animatedText.querySelectorAll(".split");
                    splits.forEach((split) => split.classList.add("in"));
                }, 1000); // Ajustez ce délai selon la durée de l'animation de révélation
            }, 500);
        }, 100); 
    }
});
