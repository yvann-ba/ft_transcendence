// document.addEventListener("DOMContentLoaded", function() {

const canvas = document.getElementById("pongCanvas");
console.log("canvas: ", canvas);
const ctx = canvas.getContext("2d");
console.log("ctx: ", ctx);

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

function animatePaddleSize(paddle, duration) {
    let startTime = Date.now();
    let startHeight = paddleHeight;
    let startY = paddle === "player1" ? player1Y : player2Y;
    let maxHeight = paddleHeight * 1.05;  // 50% larger
    let minHeight = paddleHeight * 0.9;  // 30% smaller

    function animate() {
        let elapsedTime = Date.now() - startTime;
        let progress = elapsedTime / duration;

        let currentHeight;
        let currentY;

        if (progress < 0.3) {
            // Quickly grow larger from center
            currentHeight = startHeight + (maxHeight - startHeight) * (progress / 0.3);
            currentY = startY - (currentHeight - startHeight) / 2;
        } else if (progress < 0.6) {
            // Quickly shrink below normal from center
            currentHeight = maxHeight - (maxHeight - minHeight) * ((progress - 0.3) / 0.3);
            currentY = startY + (startHeight - currentHeight) / 2;
        } else {
            // Smoothly return to normal
            let returnProgress = (progress - 0.6) / 0.4;
            currentHeight = minHeight + (startHeight - minHeight) * Math.pow(returnProgress, 3);
            currentY = startY + (startHeight - currentHeight) / 2;
        }

        if (paddle === "player1") {
            paddle1Height = currentHeight;
            player1Y = currentY;
            paddle1Animation = progress < 1;
        } else if (paddle === "player2") {
            paddle2Height = currentHeight;
            player2Y = currentY;
            paddle2Animation = progress < 1;
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
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

    // Animation des raquettes (bump effect)
    if (paddle1Animation) {
        let elapsedTime = Date.now() - animationStartTime;
        if (elapsedTime < animationDuration) {
            paddle1Height = paddleHeight + (maxPaddleHeight - paddleHeight) * (elapsedTime / animationDuration);
        } else {
            paddle1Height = maxPaddleHeight;
            paddle1Animation = false;
        }
    }

    if (paddle2Animation) {
        let elapsedTime = Date.now() - animationStartTime;
        if (elapsedTime < animationDuration) {
            paddle2Height = paddleHeight + (maxPaddleHeight - paddleHeight) * (elapsedTime / animationDuration);
        } else {
            paddle2Height = maxPaddleHeight;
            paddle2Animation = false;
        }
    }


    // Mouvement de la balle
    let nextBallX = ballX + ballSpeedX * deltaTime;
    let nextBallY = ballY + ballSpeedY * deltaTime;

    // Vertical wall collision
    if (nextBallY - ballRadius <= 0 || nextBallY + ballRadius >= canvas.height) {
        ballSpeedY = -ballSpeedY;
        nextBallY = nextBallY > canvas.height/2 
            ? canvas.height - ballRadius 
            : ballRadius;
    }

    // Update ball position
    ballX = nextBallX;
    ballY = nextBallY;

    // Collision avec les raquettes
    if (
        (ballX - ballRadius < paddleWidth && ballY > player1Y && ballY < player1Y + paddle1Height) ||
        (ballX + ballRadius > canvas.width - paddleWidth && ballY > player2Y && ballY < player2Y + paddle2Height)
    ) {

        let relativePosition;
        if (ballX - ballRadius < paddleWidth) {
            relativePosition = (ballY - player1Y) / paddle1Height - 0.5;
        } else {
            relativePosition = (ballY - player2Y) / paddle2Height - 0.5;
        }

        const maxDeflectionAngle = Math.PI / 1.4;
        const deflectionAngle = relativePosition * maxDeflectionAngle;

        const currentSpeed = Math.sqrt(ballSpeedX**2 + ballSpeedY**2);
        const newSpeed = currentSpeed * bumpIntensity;

        // Maintain the original speed while changing direction
        ballSpeedX = -Math.sign(ballSpeedX) * newSpeed * Math.cos(Math.abs(deflectionAngle));
        ballSpeedY = newSpeed * Math.sin(deflectionAngle);

        // Limiter la vitesse maximale
        if (Math.abs(ballSpeedX) > maxBallSpeed)
            ballSpeedX = maxBallSpeed * (ballSpeedX > 0 ? 1 : -1);
        if (Math.abs(ballSpeedY) > maxBallSpeed)
            ballSpeedY = maxBallSpeed * (ballSpeedY > 0 ? 1 : -1);

        // Déclencher l'animation pour player1
        if (ballX - ballRadius < paddleWidth) {
            animatePaddleSize("player1", 150); // Easing quadratique
        }
    
        // Déclencher l'animation pour player2
        if (ballX + ballRadius > canvas.width - paddleWidth) {
            animatePaddleSize("player2", 150);
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

    draw();

    if (countdownRunning) {
        drawCountdown(countDown);
    } else if (gameRunning) {
        update(deltaTime);
    }

    requestAnimationFrame(gameLoop);
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
            clearInterval(countdownInterval);
            fadingOut = true;
        }
    }, 1000);
}


function drawCountdown() {
    if (countDown > 0) {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2); 
        ctx.fillStyle = "rgba(224, 122, 236, 0.7)"; 
        ctx.fill();
        ctx.closePath();

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
    console.log("play-button clicked");
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
                document.getElementById("pongCanvas").style.setProperty('--ground-color', `${}`);
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

// }); // Fin de l'écouteur d'événement "DOMContentLoaded"