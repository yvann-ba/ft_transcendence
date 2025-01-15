document.addEventListener('DOMContentLoaded', function() {
    // Fonction pour charger les données initiales
    loadInitialData();

    // Gestion de la navigation SPA
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const page = event.target.getAttribute('data-page');
            fetchPage(page);  // Appel pour récupérer le contenu
            // Mise à jour de l'historique avec l'URL propre
            window.history.pushState({}, '', `/game/${page}/`);
        });
    });

    // Gestion de l'historique du navigateur (back/forward)
    window.addEventListener('popstate', function(event) {
        const page = window.location.pathname.split('/')[2];  // Récupère le 2e segment de l'URL
        if (page) {
            fetchPage(page);
        } else {
            fetchPage('home');
        }
    });

    function loadInitialData() {
        fetch('/api/users/')
            .then(response => response.json())
            .then(data => {
                const usersList = document.getElementById('users-list');
                if (usersList) {
                    data.forEach(user => {
                        const listItem = document.createElement('li');
                        listItem.textContent = user.name;
                        usersList.appendChild(listItem);
                    });
                }
            })
            .catch(error => console.error('There was an error fetching the users!', error));

        fetch('/api/games/')
            .then(response => response.json())
            .then(data => {
                const gamesList = document.getElementById('games-list');
                if (gamesList) {
                    data.forEach(game => {
                        const listItem = document.createElement('li');
                        listItem.textContent = game.name;
                        gamesList.appendChild(listItem);
                    });
                }
            })
            .catch(error => console.error('There was an error fetching the games!', error));
    }

    // Fonction pour initialiser les animations de la page d'accueil
    function initializeHomeAnimations() {
        const animatedTextContainer = document.querySelector(".home-header-content");
        const animatedText = document.querySelector(".h-anim");

        if (animatedTextContainer && animatedText) {
            // Reset des classes d'animation
            animatedTextContainer.classList.add("hidden");
            animatedText.classList.remove("in");
            const splits = animatedText.querySelectorAll(".split");
            splits.forEach((split) => split.classList.remove("in"));

            // Relancer l'animation
            setTimeout(() => {
                animatedTextContainer.classList.remove("hidden");

                setTimeout(() => {
                    animatedText.classList.add("in");

                    setTimeout(() => {
                        splits.forEach((split) => split.classList.add("in"));
                    }, 1000);
                }, 500);
            }, 100);
        }
    }

    // Fonction modifiée pour charger le contenu de la page
    function fetchPage(page) {
        fetch(`/game/${page}/`) // Utilise l'URL propre sans paramètres
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const newContent = doc.getElementById('app').innerHTML;
                document.getElementById('app').innerHTML = newContent;

                // Met à jour l'historique du navigateur avec l'URL de la page
                window.history.pushState({}, '', `/game/${page}/`);

                // Initialiser les animations si c'est la page d'accueil
                if (page === 'home') {
                    initializeHomeAnimations();
                }
            })
            .catch(error => console.error('Error fetching the page:', error));
    }
});
