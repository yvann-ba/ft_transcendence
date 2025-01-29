function initializePongGame() {
    // Récupération des éléments DOM
    const canvas = document.getElementById("pongCanvas");
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    
    const ctx = canvas.getContext("2d");
    const playButton = document.getElementById("play-button");
    const customButton = document.getElementById("custom-button");
    const customBackButton = document.getElementById("custom-back-button");

        // Variables du jeu
    let groundColor = "#fff";
    let ballColor = "#fff";
    let paddleColor = "#fff";

    // Dimensions et positions
    const paddleWidth = 7;
    const paddleHeight = 100;
    const ballRadius = 6;

    // Positions initiales
    let player1Y = (canvas.height - paddleHeight) / 2;
    let player2Y = (canvas.height - paddleHeight) / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;

    // Vitesse de la balle
    const initialBallSpeed = 250;
    const maxBallSpeed =  1000;
    let ballSpeedX = initialBallSpeed;
    let ballSpeedY = initialBallSpeed;

    // Scores
    let player1Score = 0;
    let player2Score = 0;
    let winningScore = 3;

    // Contrôles des joueurs
    let player1Up = false;
    let player1Down = false;
    let player2Up = false;
    let player2Down = false;

    // État du jeu
    let gameRunning = false;

    let lastTime = 0;
    const maxDeltaTime = 0.05;

    // Effet "bump" 
    let bumpIntensity = 1.1;

    // Compte à rebours
    let countDown = 3;
    let countdownRunning = false; 
    let countdownOpacity = 0.7;
    let fadingOut = false; 

    // Effet de taille des raquettes
    let paddle1Height = paddleHeight;
    let paddle2Height = paddleHeight;
    const maxPaddleHeight = 120;
    const minPaddleHeight = 90;
    const paddleResizeSpeed = 5; // Vitesse de l'animation de redimensionnement

    // Variables pour animation de bump
    let paddle1Animation = false;
    let paddle2Animation = false;
    let animationStartTime = 0;
    const animationDuration = 300; // Durée de l'animation en millisecondes


    // Fonctions du jeu
    function draw() { /* ... */ }
    function update(deltaTime) { /* ... */ }
    function gameLoop(timestamp) { /* ... */ }

    // Gestionnaires d'événements
    function handleKeyDown(event) { /* ... */ }
    function handleKeyUp(event) { /* ... */ }

    // Initialisation
    function initEventListeners() {
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        
        if (playButton) {
            playButton.addEventListener("click", handlePlay);
        }
        
        if (customButton) {
            customButton.addEventListener("click", handleCustom);
        }
        
        if (customBackButton) {
            customBackButton.addEventListener("click", handleCustomBack);
        }
    }

    function cleanup() {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
        
        if (playButton) {
            playButton.removeEventListener("click", handlePlay);
        }
        // ... nettoyage des autres écouteurs
    }

    // Démarrage
    function start() {
        initEventListeners();
        resetGame();
        requestAnimationFrame(gameLoop);
    }

    // Nettoyage quand on quitte la page
    window.addEventListener('beforeunload', cleanup);

    // Démarrage du jeu
    start();
}

// Exporter la fonction pour le SPA
if (typeof module !== 'undefined' && module.exports) {
    module.exports = initializePongGame;
} else {
    window.initializePongGame = initializePongGame;
}