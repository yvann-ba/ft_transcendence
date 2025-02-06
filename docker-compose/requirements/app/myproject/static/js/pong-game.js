function initializePongGame() {
    // ======================
    // Configuration initiale
    // ======================
    const canvas = document.getElementById("pongCanvas");
    if (!canvas)
		return console.error("Canvas non trouvé");
    const ctx = canvas.getContext("2d");
    
    // Éléments UI
    const elements = {
        playButton: document.getElementById("play-button"),
        menu: document.getElementById("pong-menu"),
        score1: document.getElementById("player1-score"),
        score2: document.getElementById("player2-score"),
        customButton: document.getElementById("custom-button"),
        customBackButton: document.getElementById("custom-back-button"),
		customColorsInputs: document.querySelectorAll(".color-input"),
		customSliders: document.querySelectorAll(".pong-custom-slider"),
		winningScoreSlider: document.getElementById("winning-score-slider")
    };

    // ======================
    // État du jeu
    // ======================
    const state = {
        // Physique
        ball: {
            x: canvas.width / 2,
            y: canvas.height / 2,
            speedX: 250,
            speedY: 250,
            radius: 6,
            maxSpeed: 1000
        },
        
        paddles: {
            width: 7,
            height: 100,
            player1Y: (canvas.height - 100) / 2,
            player2Y: (canvas.height - 100) / 2,
            speed: 300,
            animations: {
                player1: { scale: 1, phase: 'none', time: 0 },
                player2: { scale: 1, phase: 'none', time: 0 }
            }
        },
        
        // Scores
        scores: {
            player1: 0,
            player2: 0,
            winning: 3
        },
        
        // Contrôles
        controls: {
            player1Up: false,
            player1Down: false,
            player2Up: false,
            player2Down: false
        },
        
		color : {
			groundColor : "#fff",
			ballColor : "#fff",
			paddleColor : "#fff"
		},

        // État
        running: false,
        countdown: 3,
        countdownActive: false,
        countdownOpacity: 1.0,
        fadingOut: false,
        lastTime: performance.now()
    };

    // ======================
    // Fonctions de base
    // ======================
    function drawPaddles() {
        ctx.fillStyle = state.color.paddleColor;
        
        // Dessiner player1 avec animation
        const anim1 = state.paddles.animations.player1;
        const width1 = state.paddles.width * anim1.scale;
        const height1 = state.paddles.height * anim1.scale;
        ctx.fillRect(
            3 - (width1 - state.paddles.width)/2, 
            state.paddles.player1Y - (height1 - state.paddles.height)/2, 
            width1, 
            height1
        );
    
        // Dessiner player2 avec animation
        const anim2 = state.paddles.animations.player2;
        const width2 = state.paddles.width * anim2.scale;
        const height2 = state.paddles.height * anim2.scale;
        ctx.fillRect(
            canvas.width - width2 - 3 - (width2 - state.paddles.width)/2, 
            state.paddles.player2Y - (height2 - state.paddles.height)/2, 
            width2, 
            height2
        );
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = state.color.ballColor;
        ctx.fill();
        ctx.closePath();
    }

    function updateScores() {
        elements.score1.textContent = state.scores.player1;
        elements.score2.textContent = state.scores.player2;
    }

    // ======================
    // Logique de collision
    // ======================
    function checkPaddleCollision() {

        const pw = state.paddles.width;
        const ph = state.paddles.height;
    
        if (state.ball.x - state.ball.radius < pw + 3 &&
            state.ball.y > state.paddles.player1Y &&
            state.ball.y < state.paddles.player1Y + ph) {
            handlePaddleBounce("player1");
        }
        
        if (state.ball.x + state.ball.radius > canvas.width - (pw + 3) &&
            state.ball.y > state.paddles.player2Y &&
            state.ball.y < state.paddles.player2Y + ph) {
            handlePaddleBounce("player2");
        }
    }

    function handlePaddleBounce(player) {

        state.paddles.animations[player] = { 
            scale: 1.05, 
            phase: 'grow', 
            time: 0 
        };

        const paddleY = player === "player1" ? 
            state.paddles.player1Y : 
            state.paddles.player2Y;
        
        const relativeIntersect = (state.ball.y - paddleY) / state.paddles.height - 0.5;
        const bounceAngle = relativeIntersect * (Math.PI / 3); // ±60 degrés max
        
        // Ajustement vitesse
        const speedMultiplier = 1.1;
        const currentSpeed = Math.hypot(state.ball.speedX, state.ball.speedY);
        const newSpeed = Math.min(currentSpeed * speedMultiplier, state.ball.maxSpeed);
        
        // Nouvelle direction
        state.ball.speedX = (player === "player1" ? 1 : -1) * newSpeed * Math.cos(bounceAngle);
        state.ball.speedY = newSpeed * Math.sin(bounceAngle);
    }

    function checkWallCollision() {
        // Mur haut/bas
        if (state.ball.y - state.ball.radius <= 0 || 
            state.ball.y + state.ball.radius >= canvas.height) {
            state.ball.speedY *= -1;
        }
        
        // Sortie latérale
        if (state.ball.x - state.ball.radius < 0) {
            state.scores.player2++;
            resetBall();
        } else if (state.ball.x + state.ball.radius > canvas.width) {
            state.scores.player1++;
            resetBall();
        }
    }

    // ======================
    // Logique de jeu
    // ======================
    function update(deltaTime) {
        if (state.countdownActive) {
            state.countdown -= deltaTime;
            if (state.countdown <= 0) {
                state.countdownActive = false;
                state.fadingOut = true;
            }
        }
        
        if (state.fadingOut) {
            state.countdownOpacity -= deltaTime;
            if (state.countdownOpacity <= 0) {
                state.fadingOut = false;
                state.running = true; 
            }
        }

        if (!state.running) return;
        
        ['player1', 'player2'].forEach(player => {
            const anim = state.paddles.animations[player];
            
            if (anim.phase !== 'none') {
                anim.time += deltaTime;
                
                if (anim.phase === 'grow') {
                    if (anim.time >= 0.2) {
                        anim.phase = 'shrink';
                        anim.scale = 0.9;
                        anim.time = 0;
                    }
                }
                else if (anim.phase === 'shrink') {
                    if (anim.time >= 0.2) {
                        anim.phase = 'return';
                        anim.scale = 1;
                        anim.time = 0;
                    }
                }
                else if (anim.phase === 'return') {
                    if (anim.time >= 0.6) {
                        anim.phase = 'none';
                    }
                }
            }
        });

        // Mouvement joueurs
        if (state.controls.player1Up && state.paddles.player1Y > 5) {
            state.paddles.player1Y -= state.paddles.speed * deltaTime;
        }
        if (state.controls.player1Down && state.paddles.player1Y < canvas.height - state.paddles.height - 5) {
            state.paddles.player1Y += state.paddles.speed * deltaTime;
        }
        
        if (state.controls.player2Up && state.paddles.player2Y > 5) {
            state.paddles.player2Y -= state.paddles.speed * deltaTime;
        }
        if (state.controls.player2Down && state.paddles.player2Y < canvas.height - state.paddles.height - 5) {
            state.paddles.player2Y += state.paddles.speed * deltaTime;
        }

        // Mouvement balle
        state.ball.x += state.ball.speedX * deltaTime;
        state.ball.y += state.ball.speedY * deltaTime;

        // Collisions
        checkWallCollision();
        checkPaddleCollision();

        // Vérification victoire
        if (state.scores.player1 >= state.scores.winning || 
            state.scores.player2 >= state.scores.winning) {
            endGame();
        }
    }

    function resetBall() {
        state.ball.x = canvas.width / 2;
        state.ball.y = canvas.height / 2;
        state.ball.speedX = 250 * (Math.random() > 0.5 ? 1 : -1);
        state.ball.speedY = 250 * (Math.random() > 0.5 ? 1 : -1);
    }

    function endGame() {
        state.running = false;
        elements.menu.classList.remove("hidden");
        resetBall();
    }

    // ======================
    // Gestion des événements
    // ======================
    function handleKeyDown(e) {
        switch(e.key) {
            case "w": state.controls.player1Up = true; 
				break;
            case "s": state.controls.player1Down = true; 
				break;
            case "ArrowUp": state.controls.player2Up = true; 
				break;
            case "ArrowDown": state.controls.player2Down = true; 
				break;
        }
    }

    function handleKeyUp(e) {
        switch(e.key) {
            case "w": state.controls.player1Up = false; 
				break;
            case "s": state.controls.player1Down = false; 
				break;
            case "ArrowUp": state.controls.player2Up = false; 
				break;
            case "ArrowDown": state.controls.player2Down = false; 
				break;
        }
    }
    
    function drawCountdown() {
        if (state.countdownActive) {
            const currentCount = Math.ceil(state.countdown);
            if (currentCount > 0) {
                drawCountElement(currentCount.toString());
            }
        } else if (state.fadingOut) {
            drawCountElement("GO", state.countdownOpacity);
        }
    }
    
    function drawCountElement(text, opacity = 1.0) {
        // Cercle de fond
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, 50, 0, Math.PI*2);
        ctx.fillStyle = `rgba(224, 122, 236, ${opacity * 0.7})`;
        ctx.fill();
        
        // Texte
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.font = "50px Aeonik";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, canvas.width/2, canvas.height/2 + 5);
        
        // Contour
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();
    }

    function startGame() {
        elements.menu.classList.remove("show");
        setTimeout(() => {
            elements.menu.classList.add("hidden");
        }, 500);
        state.running = false;
        state.scores.player1 = 0;
        state.scores.player2 = 0;
        elements.menu.classList.add("hidden");
        updateScores();
        resetBall();
        
        // Initialiser le compte à rebours
        state.countdown = 3;
        state.countdownActive = true;
        state.fadingOut = false;
        state.countdownOpacity = 1.0;
    }

    // ======================
    // Cycle principal
    // ======================
    function gameLoop(currentTime) {
        const deltaTime = (currentTime - state.lastTime) / 1000;
        state.lastTime = currentTime;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Terrain
        ctx.fillStyle = state.color.groundColor;
        ctx.fillRect(canvas.width/2 - 1, 0, 2, canvas.height);
        
        drawPaddles();
        drawBall();
        update(deltaTime);
        
        if (state.countdownActive || state.fadingOut) {
            drawCountdown();
        }

        requestAnimationFrame(gameLoop);
    }

	// ======================
    // Custom menu
    // ======================

	function openCustomMenu() {

        elements.menu.classList.remove("show");
        document.getElementById("pong-custom-menu").classList.remove("hidden");
        document.getElementById("pong-custom-menu").classList.add("show");
        
        setTimeout(() => {
            elements.menu.classList.add("hidden");
        }, 350);

        document.getElementById("pong-game").classList.remove("main-menu");
        document.getElementById("pong-game").classList.add("pong-custom-menu-canvas");
	}

	function closeCustomMenu() {

        document.getElementById("pong-custom-menu").classList.remove("show");
        document.getElementById("pong-custom-menu").classList.add("hidden");
        elements.menu.classList.remove("hidden");
        
        setTimeout(() => {
            elements.menu.classList.add("show");
        }, 50); 

        document.getElementById("pong-game").classList.remove("pong-custom-menu-canvas");
        document.getElementById("pong-game").classList.add("main-menu");
	}

	function changeColors(event) {
		const input = event.target;
		const id = input.id;
		const color = input.value;
	
		input.style.backgroundColor = color;
	
		switch (id) {
			case "pong-ground-color":
				state.color.groundColor = color;
				document.getElementById("pongCanvas").style.setProperty('--ground-color', `${color}`);
				break;
			case "pong-ball-color":
				state.color.ballColor = color;
				break;
			case "pong-paddle-color":
				state.color.paddleColor = color;
				break;
		}
	}

	function sliderAnimation(event) {
		const slider = event.target;
        let value = 5 + (slider.value - slider.min) / (slider.max - slider.min) * 90;

        slider.style.setProperty('--slider-track-bg', `linear-gradient(to right, #BB70AD 0%, #BB70AD ${value}%, #ffffff ${value}%)`);
	}

	function changeWinningScore(event) {
		const slider = event.target;

		state.scores.winning = Math.floor(slider.value);
		document.getElementById("pong-winning-score").textContent = "Winning score : " + state.scores.winning ;
	}


    // ======================
    // Initialisation
    // ======================
    function init() {

        setTimeout(() => {
            elements.menu.classList.add("show");
        }, 50);

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        elements.playButton?.addEventListener("click", startGame);
		elements.customButton?.addEventListener("click", openCustomMenu);
		elements.customBackButton?.addEventListener("click", closeCustomMenu);
		elements.customColorsInputs?.forEach(input => {
			input.addEventListener("input", changeColors);
		});
		elements.customSliders?.forEach(slider => {
			slider.addEventListener("input", sliderAnimation);
		});
		elements.winningScoreSlider?.addEventListener("input", changeWinningScore);

        requestAnimationFrame(gameLoop);
    }

    init();
}


// Export pour SPA
if (typeof window !== "undefined") {
    window.initializePongGame = initializePongGame;
}
