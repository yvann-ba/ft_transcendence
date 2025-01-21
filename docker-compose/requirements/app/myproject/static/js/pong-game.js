
// Configuration du canvas
const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Colors
groundColor = "#fff";
ballColor = "#fff";

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
let ballSpeedX = 4;
let ballSpeedY = 4;

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

// Démarrage
gameLoop();

// Écoute des touches
document.addEventListener("keydown", (event) => {
    if (event.key === "w") player1Up = true;
    if (event.key === "s") player1Down = true;
    if (event.key === "ArrowUp") player2Up = true;
    if (event.key === "ArrowDown") player2Down = true;
});

document.addEventListener("keyup", (event) => {
    if (event.key === "w") player1Up = false;
    if (event.key === "s") player1Down = false;
    if (event.key === "ArrowUp") player2Up = false;
    if (event.key === "ArrowDown") player2Down = false;
});

// Dessiner les éléments
function draw() {
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner le terrain
    ctx.fillStyle = groundColor;
    ctx.fillRect(canvas.width / 2 - 1, 0, 2, canvas.height);

    // Dessiner les raquettes
    ctx.fillRect(3, player1Y, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - paddleWidth - 3, player2Y, paddleWidth, paddleHeight);

    // Dessiner la balle (ronde)
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.closePath();
}

function updateScores() {
    // Sélectionner les éléments HTML et les mettre à jour
    document.getElementById('player1-score').textContent = player1Score;
    document.getElementById('player2-score').textContent = player2Score;
}

// Mettre à jour les positions
function update() {
    if (!gameRunning) return;

    // Mouvement des raquettes
    if (player1Up && player1Y > 5) player1Y -= 5;
    if (player1Down && player1Y < canvas.height - paddleHeight - 5) player1Y += 5;
    if (player2Up && player2Y > 5) player2Y -= 5;
    if (player2Down && player2Y < canvas.height - paddleHeight - 5) player2Y += 5;

    // Mouvement de la balle
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Collision avec le haut et le bas
    if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
        ballSpeedY = -ballSpeedY;
    }

    // Collision avec les raquettes
    if (
        (ballX - ballRadius < paddleWidth && ballY > player1Y && ballY < player1Y + paddleHeight) ||
        (ballX + ballRadius > canvas.width - paddleWidth && ballY > player2Y && ballY < player2Y + paddleHeight)
    ) {
        ballSpeedX = -ballSpeedX;

        // Augmenter la vitesse de la balle
        ballSpeedX *= 1.1;
        ballSpeedY *= 1.1;
    }


    // Réinitialisation de la balle si elle sort et mise à jour du score
    if (ballX - ballRadius < 0) {
        player2Score++;
        resetBall();
    } else if (ballX + ballRadius > canvas.width) {
        player1Score++;
        resetBall();
    }
    updateScores();

    // Vérifier si un joueur a gagné
    if (player1Score === winningScore || player2Score === winningScore) {
        gameRunning = false;
        // alert(`Game Over! ${player1Score === winningScore ? "Player 1" : "Player 2"} Wins!`);
        resetGame();
    }
}

// Réinitialiser la position de la balle
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = 4 * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
}

// Réinitialiser le jeu
function resetGame() {
    player1Score = 0;
    player2Score = 0;
    resetBall();
    document.getElementById("pong-menu").classList.remove("hidden"); 
}

// Boucle principale
function gameLoop() {
    draw();
    update();
    requestAnimationFrame(gameLoop);
}

// Lancer ou arrêter le jeu
document.getElementById("play-button").addEventListener("click", () => {
    document.getElementById("pong-menu").classList.add("hidden");
    gameRunning = true;
});

// Menu de personnalisation
document.getElementById("custom-button").addEventListener("click", () => {
    document.getElementById("pong-menu").classList.add("hidden");
    document.getElementById("pong-custom-menu").classList.remove("hidden");

    document.getElementById("pong-game").classList.remove("main-menu".add);
    document.getElementById("pong-game").classList.add("pong-custom-menu-canvas");
});


// Retour au menu de jeu

document.getElementById("custom-back-button").addEventListener("click", () => {
    document.getElementById("pong-menu").classList.remove("hidden");
    document.getElementById("pong-custom-menu").classList.add("hidden");
    document.getElementById("pong-game").classList.remove("pong-custom-menu-canvas");
    document.getElementById("pong-game").classList.add("main-menu");
});


// Modif du score max
document.getElementById("winning-score-slider").addEventListener("input", (event) => {
    const slider = event.target; 

    winningScore = Math.floor(slider.value);
    document.getElementById("pong-winning-score").textContent = "Winning score : " + winningScore;
});

//barre de progression des sliders
document.querySelectorAll(".pong-custom-slider").forEach(slider => {
    slider.addEventListener("input", (event) => {
        const slider = event.target;
        let value = 5 + (slider.value - slider.min) / (slider.max - slider.min) * 90; // Calcul de progression
        // value += ;
        console.log(`Valeur calculée : ${value}%`);

        // Met à jour le style de fond
    slider.style.setProperty('--slider-track-bg', `linear-gradient(to right, #BB70AD 0%, #BB70AD ${value}%, #ffffff ${value}%)`);

    });
});
