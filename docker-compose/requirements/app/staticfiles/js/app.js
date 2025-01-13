// myproject/static/js/app.js
document.addEventListener('DOMContentLoaded', function() {
    // Fonction pour charger les données initiales
    loadInitialData();

    // Gestion de la navigation SPA
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const page = event.target.getAttribute('data-page');
            fetchPage(page);
            window.history.pushState({}, '', `?page=${page}`);
        });
    });

    // Gestion de l'historique du navigateur
    window.addEventListener('popstate', function(event) {
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page');
        if (page) {
            fetchPage(page);
        } else {
            fetchPage('home');
        }
    });

    // Fonction pour charger les données initiales
    function loadInitialData() {
        fetch('/api/users/')
            .then(response => response.json())
            .then(data => {
                const usersList = document.getElementById('users-list');
                data.forEach(user => {
                    const listItem = document.createElement('li');
                    listItem.textContent = user.name;
                    usersList.appendChild(listItem);
                });
            })
            .catch(error => console.error('There was an error fetching the users!', error));

        fetch('/api/games/')
            .then(response => response.json())
            .then(data => {
                const gamesList = document.getElementById('games-list');
                data.forEach(game => {
                    const listItem = document.createElement('li');
                    listItem.textContent = game.name;
                    gamesList.appendChild(listItem);
                });
            })
            .catch(error => console.error('There was an error fetching the games!', error));
    }

    // Fonction pour charger le contenu de la page
    function fetchPage(page) {
        fetch(`/${page}/`)
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const newContent = doc.getElementById('app').innerHTML;
                document.getElementById('app').innerHTML = newContent;
            })
            .catch(error => console.error('Error fetching the page:', error));
    }
});
