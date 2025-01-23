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
let countDown = 3;
let countdownRunning = false; // Indicateur pour le compte à rebours
let countdownOpacity = 0.7; // Opacité initiale du compte à rebours
let fadingOut = false; 

// Effet de taille des raquettes
let paddle1Height = paddleHeight;
let paddle2Height = paddleHeight;
const maxPaddleHeight = 150;
const minPaddleHeight = 90;
const paddleResizeSpeed = 5; // Vitesse de l'animation de redimensionnement

// Variables pour animation de bump
let paddle1Animation = false;
let paddle2Animation = false;
let animationStartTime = 0;
const animationDuration = 300; // Durée de l'animation en millisecondes

// Démarrage
document.addEventListener("DOMContentLoaded", () => {

    setTimeout(() => {
        
        gameLoop();
    }, 1000);

});

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

async function animatePaddleSize(paddle, targetHeight, duration, easing) {
    let startHeight = paddle === "player1" ? paddle1Height : paddle2Height;
    let startY = paddle === "player1" ? player1Y : player2Y;
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = (timestamp - startTime) / duration;

        // Appliquer la fonction d'easing pour le retour lent
        let easedProgress = easing(progress);

        // Calcul de la hauteur actuelle
        let currentHeight =
            progress < 0.5
                ? startHeight + (targetHeight - startHeight) * (progress * 2)
                : targetHeight + (paddleHeight - targetHeight) * (easedProgress - 0.5) * 2;

        // Calcul du décalage vertical pour centrer la raquette
        let currentY = startY - (currentHeight - startHeight) / 2;

        // Mise à jour des valeurs
        if (paddle === "player1") {
            paddle1Height = Math.max(minPaddleHeight, Math.min(maxPaddleHeight, currentHeight));
            player1Y = currentY;
        } else if (paddle === "player2") {
            paddle2Height = Math.max(minPaddleHeight, Math.min(maxPaddleHeight, currentHeight));
            player2Y = currentY;
        }

        // Si l'animation n'est pas terminée, continuer
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}


// Mettre à jour les positions
function update(deltaTime) {
    if (!gameRunning) return;

    deltaTime = Math.min(deltaTime, maxDeltaTime);

    // Animation des raquettes (bump effect)
    if (paddle1Animation) {
        let elapsedTime = Date.now() - animationStartTime;
        if (elapsedTime < animationDuration) {
            paddle1Height = paddleHeight + (maxPaddleHeight - paddleHeight) * (elapsedTime / animationDuration);
        } else {
            paddle1Height = maxPaddleHeight;
            paddle1Animation = false; // Fin de l'animation
        }
    }

    if (paddle2Animation) {
        let elapsedTime = Date.now() - animationStartTime;
        if (elapsedTime < animationDuration) {
            paddle2Height = paddleHeight + (maxPaddleHeight - paddleHeight) * (elapsedTime / animationDuration);
        } else {
            paddle2Height = maxPaddleHeight;
            paddle2Animation = false; // Fin de l'animation
        }
    }

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
    
        // Déclencher l'animation pour player1
        if (ballX - ballRadius < paddleWidth) {
            animatePaddleSize("player1", maxPaddleHeight, 300, (t) => t * t); // Easing quadratique
        }
    
        // Déclencher l'animation pour player2
        if (ballX + ballRadius > canvas.width - paddleWidth) {
            animatePaddleSize("player2", maxPaddleHeight, 300, (t) => t * t); // Easing quadratique
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
    player1Y = (canvas.height - paddleHeight) / 2;
    player2Y = (canvas.height - paddleHeight) / 2;
    resetBall();
    document.getElementById("pong-menu").classList.remove("hidden");
}

// Boucle principale

function gameLoop(timestamp) {
    let deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    draw(); // Dessiner le terrain et les autres éléments

    if (countdownRunning) {
        drawCountdown(countDown); // Dessiner le compte à rebours si actif
    } else if (gameRunning) {
        update(deltaTime); // Mettre à jour le jeu si actif
    }

    requestAnimationFrame(gameLoop); // Prochaine frame
}

function startCountdown(seconds) {
    draw();
    countDown = seconds;
    countdownOpacity = 1.0;
    fadingOut = false;
    countdownRunning = true; 
    gameRunning = false;
    const countdownInterval = setInterval(() => {
        countDown--;

        if (countDown <= 0) {
            clearInterval(countdownInterval); // Arrêter le décompte
            fadingOut = true; // Démarrer immédiatement le fade-out
        }
    }, 1000);
}


function drawCountdown() {
    if (countDown > 0) {
        // Dessiner le cercle avec opacité
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2); 
        ctx.fillStyle = "rgba(224, 122, 236, 0.7)"; 
        ctx.fill();
        ctx.closePath();

        // Dessiner le chiffre
        ctx.fillStyle = "white"; 
        ctx.font = "50px Aeonik";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle"; 
        ctx.fillText(countDown, canvas.width / 2, canvas.height / 2 + 5);

        ctx.strokeStyle = "white";
        ctx.lineWidth = 4;
        ctx.stroke();
        
    }
    if (fadingOut) {
        countdownOpacity -= 0.01;

        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2); 
        ctx.fillStyle = `rgba(224, 122, 236, ${countdownOpacity})`; 
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = `rgba(255, 255, 255, ${countdownOpacity})`;
        ctx.font = "50px Aeonik";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("GO", canvas.width / 2, canvas.height / 2 + 5);

        ctx.strokeStyle = `rgba(255, 255, 255, ${countdownOpacity})`;
        ctx.lineWidth = 4; 
        ctx.stroke();

        if (countdownOpacity <= 0) {
            countdownRunning = false;
            gameRunning = true; 
        }
    }
}

// Événement "Play"
document.getElementById("play-button").addEventListener("click", () => {
    player1Score = 0;
    player2Score = 0;
    updateScores();
    draw();
    document.getElementById("pong-menu").classList.add("hidden");
    startCountdown(3);
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
