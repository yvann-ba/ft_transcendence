

document.addEventListener('DOMContentLoaded', function() {
    // Fonction pour charger les données initiales
    loadInitialData();

    // Gestion de la navigation SPA (Délégation d'événements sur tout le body)
    document.body.addEventListener('click', function(event) {
        const link = event.target.closest('a');  // Trouver le lien cliqué
        if (link && link.getAttribute('href')) { 
            event.preventDefault();  // Empêcher le rechargement de la page
            const href = link.getAttribute('href');
            const page = href.split('/')[1]; // Extraire le nom de la page à partir du href, sans le '/'
            fetchPage(page);  // Appel pour récupérer le contenu de la page
            // Mise à jour de l'historique avec l'URL propre
            window.history.pushState({}, '', href);
        }
    });

    // Gestion de l'historique du navigateur (back/forward)
    window.addEventListener('popstate', function(event) {
        const page = window.location.pathname.split('/')[1];  // Récupère le 1er segment de l'URL
        if (page) {
            fetchPage(page);
        } else {
            fetchPage('home');
        }
    });

    // Fonction pour charger les données initiales
    function loadInitialData() {
        fetch('/api/users/')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Users:', data);
            })
            .catch(error => console.error('Error fetching users:', error));

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
            // Réinitialisation des classes d'animation
            animatedTextContainer.classList.add("hidden");
            animatedText.classList.remove("in");
            const splits = animatedText.querySelectorAll(".split");
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
    

    // Fonction modifiée pour charger le contenu de la page
    function fetchPage(page) {
        fetch(`/${page}/`)
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const newContent = doc.getElementById('app').innerHTML;
                const appContainer = document.getElementById('app');
                
                // Remplacer le contenu
                appContainer.innerHTML = newContent;
    
                // Exécuter les scripts dynamiquement
                const scripts = appContainer.getElementsByTagName('script');
                Array.from(scripts).forEach(oldScript => {
                    const newScript = document.createElement('script');
                    if (oldScript.src) {
                        newScript.src = oldScript.src;
                    } else {
                        newScript.textContent = oldScript.textContent;
                    }
                    document.body.appendChild(newScript).parentNode.removeChild(newScript);
                });
    
                // Mise à jour de l'historique
                window.history.pushState({}, '', `/${page}/`);
    
                if (page === 'home') {
                    initializeHomeAnimations();
                }
                if (page === 'pong-game') {
                    if (typeof initializePongGame === 'function') {
                        initializePongGame();
                    }
                }
            })
            .catch(error => console.error('Error fetching the page:', error));
    }
});
