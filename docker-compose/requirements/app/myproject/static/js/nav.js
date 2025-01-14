document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('clicked'));
            link.classList.add('clicked');
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector(".nav");

    
    // Étape 1 : Faire apparaître la barre de navigation
    if (nav) {
        setTimeout(() => {
            nav.classList.add("in"); // Affiche la barre de navigation
        }, 500); // Délai avant d'afficher la barre de navigation
    }

});
