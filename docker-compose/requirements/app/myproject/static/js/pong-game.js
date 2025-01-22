const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Colors
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
const initialBallSpeed = 200;
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
const maxDeltaTime = 0.02;

// Effet "bump" 
let bumpIntensity = 1.1;

// Effet de taille des raquettes
let paddle1Height = paddleHeight;
let paddle2Height = paddleHeight;
const maxPaddleHeight = 150;
const minPaddleHeight = 90;
const paddleResizeSpeed = 5; // Vitesse de l'animation de redimensionnement

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

    // Dessiner les raquettes avec les nouvelles hauteurs
    ctx.fillStyle = paddleColor;
    ctx.fillRect(3, player1Y, paddleWidth, paddle1Height);
    ctx.fillRect(canvas.width - paddleWidth - 3, player2Y, paddleWidth, paddle2Height);

    // Dessiner la balle (ronde)
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.closePath();
}

function updateScores() {
    document.getElementById('player1-score').textContent = player1Score;
    document.getElementById('player2-score').textContent = player2Score;
}

// Mettre à jour les positions
function update(deltaTime) {
    if (!gameRunning) return;

    deltaTime = Math.min(deltaTime, maxDeltaTime);

    // Mouvement des raquettes
    const paddleSpeed = 300;
    if (player1Up && player1Y > 5) player1Y -= paddleSpeed * deltaTime;
    if (player1Down && player1Y < canvas.height - paddle1Height - 5) player1Y += paddleSpeed * deltaTime;
    if (player2Up && player2Y > 5) player2Y -= paddleSpeed * deltaTime;
    if (player2Down && player2Y < canvas.height - paddle2Height - 5) player2Y += paddleSpeed * deltaTime;

    // Mouvement de la balle
    ballX += ballSpeedX * deltaTime;
    ballY += ballSpeedY * deltaTime;

    // Collision avec le haut et le bas
    if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
        ballSpeedY = -ballSpeedY;
    }

    // Collision avec les raquettes
    if (
        (ballX - ballRadius < paddleWidth && ballY > player1Y && ballY < player1Y + paddle1Height) ||
        (ballX + ballRadius > canvas.width - paddleWidth && ballY > player2Y && ballY < player2Y + paddle2Height)
    ) {
        ballSpeedX = -ballSpeedX * bumpIntensity;
        ballSpeedY = ballSpeedY * bumpIntensity;

        // Agrandir la raquette gauche (player1)
        if (ballX - ballRadius < paddleWidth) {
            if (paddle1Height < maxPaddleHeight) {
                paddle1Height += paddleResizeSpeed; // Agrandir la raquette progressivement
            }
        } else if (paddle1Height > paddleHeight) {
            paddle1Height -= paddleResizeSpeed; // Rétrécir la raquette progressivement
        }

        // Agrandir la raquette droite (player2)
        if (ballX + ballRadius > canvas.width - paddleWidth) {
            if (paddle2Height < maxPaddleHeight) {
                paddle2Height += paddleResizeSpeed; // Agrandir la raquette progressivement
            }
        } else if (paddle2Height > paddleHeight) {
            paddle2Height -= paddleResizeSpeed; // Rétrécir la raquette progressivement
        }
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
        resetGame();
    }
}

// Réinitialiser la position de la balle
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
}

// Réinitialiser le jeu
function resetGame() {
    player1Score = 0;
    player2Score = 0;
    paddle1Height = paddleHeight; // Réinitialiser la taille de la raquette
    paddle2Height = paddleHeight; // Réinitialiser la taille de la raquette
    resetBall();
    document.getElementById("pong-menu").classList.remove("hidden");
}

// Boucle principale
function gameLoop(timestamp) {
    let deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    draw();
    update(deltaTime);
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

// Barre de progression des sliders
document.querySelectorAll(".pong-custom-slider").forEach(slider => {
    slider.addEventListener("input", (event) => {
        const slider = event.target;
        let value = 5 + (slider.value - slider.min) / (slider.max - slider.min) * 90; // Calcul de progression

        slider.style.setProperty('--slider-track-bg', `linear-gradient(to right, #BB70AD 0%, #BB70AD ${value}%, #ffffff ${value}%)`);
    });
});

document.querySelectorAll(".color-input").forEach(input => {
    input.addEventListener("input", (event) => {
        const input = event.target;
        const color = input.value;
        id = input.id;

        input.style.backgroundColor = color;

        switch (id) {
            case "pong-ground-color":
                groundColor = color;
                document.getElementById("pongCanvas").style.setProperty('--ground-color', `${groundColor}`);
                break;
            case "pong-ball-color":
                ballColor = color;
                break;
            case "pong-paddle-color":
                paddleColor = color;
                break;
        }
    });
});
