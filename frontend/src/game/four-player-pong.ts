import "../styles/four-player-pong.css";
import { AIDifficulty } from '../game/ai/ai-opponent';
import "../styles/pong-selection.css";

declare global {
	interface Window {
		initializeFourPlayerPong?: () => void;
	}
}

interface Ball {
	x: number;
	y: number;
	speedX: number;
	speedY: number;
	radius: number;
	maxSpeed: number;
}

type PaddlePhase = "none" | "grow" | "shrink" | "return";

interface PaddleAnimation {
	scale: number;
	phase: PaddlePhase;
	time: number;
}

interface Paddles {
	width: number;
	height: number;
	// Top player (Player 1)
	player1X: number;
	player1Y: number;
	// Right player (Player 2)
	player2X: number;
	player2Y: number;
	// Bottom player (Player 3)
	player3X: number;
	player3Y: number;
	// Left player (Player 4)
	player4X: number;
	player4Y: number;
	speed: number;
	animations: {
		player1: PaddleAnimation;
		player2: PaddleAnimation;
		player3: PaddleAnimation;
		player4: PaddleAnimation;
	};
}

interface Scores {
	player1: number;
	player2: number;
	player3: number;
	player4: number;
	winning: number;
}

interface Controls {
	player1Left: boolean;
	player1Right: boolean;
	player2Up: boolean;
	player2Down: boolean;
	player3Left: boolean;
	player3Right: boolean;
	player4Up: boolean;
	player4Down: boolean;
}

interface Colors {
	groundColor: string;
	ballColor: string;
	player1Color: string;
	player2Color: string;
	player3Color: string;
	player4Color: string;
}

interface GameState {
	ball: Ball;
	paddles: Paddles;
	scores: Scores;
	controls: Controls;
	color: Colors;
	running: boolean;
	countdown: number;
	countdownActive: boolean;
	countdownOpacity: number;
	fadingOut: boolean;
	lastTime: number;
	animationFrameId: number | null;
}

export default function initializeFourPlayerPong(): (() => void) | null | undefined {
	const canvas = document.getElementById("fourPlayerCanvas") as HTMLCanvasElement | null;
	if (!canvas) {
		console.error("Canvas not found");
		return null;
	}
	
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		console.error("2D context not found");
		return null;
	}

	// Set canvas to be square
	const canvasSize = Math.min(800, window.innerWidth * 0.8, window.innerHeight * 0.8);
	canvas.width = canvasSize;
	canvas.height = canvasSize;

	const elements = {
		playButton: document.getElementById("four-player-play-button") as HTMLElement | null,
		menu: document.getElementById("four-player-menu") as HTMLElement | null,
		score1: document.getElementById("player1-score") as HTMLElement | null,
		score2: document.getElementById("player2-score") as HTMLElement | null,
		score3: document.getElementById("player3-score") as HTMLElement | null,
		score4: document.getElementById("player4-score") as HTMLElement | null,
		customButton: document.getElementById("four-player-custom-button") as HTMLElement | null,
		customBackButton: document.getElementById("four-player-custom-back-button") as HTMLElement | null,
		customColorsInputs: document.querySelectorAll(".four-player-color-input") as NodeListOf<HTMLInputElement>,
		customSliders: document.querySelectorAll(".four-player-custom-slider") as NodeListOf<HTMLInputElement>,
		winningScoreSlider: document.getElementById("four-player-winning-score-slider") as HTMLInputElement | null,
	};

	// Calculate paddle dimensions based on canvas size
	const paddleWidth = Math.floor(canvasSize * 0.15); // 15% of canvas for horizontal paddles
	const paddleHeight = Math.floor(canvasSize * 0.025); // 2.5% of canvas thickness
	const paddleOffset = Math.floor(canvasSize * 0.03); // 3% of canvas from edge

	const state: GameState = {
		ball: {
			x: canvas.width / 2,
			y: canvas.height / 2,
			speedX: 250,
			speedY: 250,
			radius: Math.floor(canvasSize * 0.015), // 1.5% of canvas size
			maxSpeed: 850
		},

		paddles: {
			width: paddleWidth,
			height: paddleHeight,
			// Top paddle (centered horizontally, at top with offset)
			player1X: (canvas.width - paddleWidth) / 2,
			player1Y: paddleOffset,
			// Right paddle (at right edge with offset, centered vertically)
			player2X: canvas.width - paddleOffset - paddleHeight, // Using height as width because it's vertical
			player2Y: (canvas.height - paddleWidth) / 2, // Using width as height because it's vertical
			// Bottom paddle (centered horizontally, at bottom with offset)
			player3X: (canvas.width - paddleWidth) / 2,
			player3Y: canvas.height - paddleOffset - paddleHeight,
			// Left paddle (at left edge with offset, centered vertically)
			player4X: paddleOffset,
			player4Y: (canvas.height - paddleWidth) / 2, // Using width as height because it's vertical
			speed: 300,
			animations: {
				player1: { scale: 1, phase: "none", time: 0 },
				player2: { scale: 1, phase: "none", time: 0 },
				player3: { scale: 1, phase: "none", time: 0 },
				player4: { scale: 1, phase: "none", time: 0 }
			}
		},

		scores: {
			player1: 0,
			player2: 0,
			player3: 0,
			player4: 0,
			winning: 5
		},

		controls: {
			player1Left: false,
			player1Right: false,
			player2Up: false,
			player2Down: false,
			player3Left: false,
			player3Right: false,
			player4Up: false,
			player4Down: false
		},

		color: {
			groundColor: "#fff",
			ballColor: "#fff",
			player1Color: "#BB70AD", // Top player (pink)
			player2Color: "#70BB88", // Right player (green)
			player3Color: "#7088BB", // Bottom player (blue)
			player4Color: "#BBBB70"  // Left player (yellow)
		},

		running: false,
		countdown: 3,
		countdownActive: false,
		countdownOpacity: 1.0,
		fadingOut: false,
		lastTime: performance.now(),
		animationFrameId: null
	};

	function drawPaddles(): void {
		if (!ctx || !canvas) return;

		// Draw top paddle (player1) - horizontal
		const anim1 = state.paddles.animations.player1;
		const width1 = state.paddles.width * anim1.scale;
		const height1 = state.paddles.height * anim1.scale;
		ctx.fillStyle = state.color.player1Color;
		ctx.fillRect(
			state.paddles.player1X - (width1 - state.paddles.width) / 2,
			state.paddles.player1Y - (height1 - state.paddles.height) / 2,
			width1,
			height1
		);

		// Draw right paddle (player2) - vertical
		const anim2 = state.paddles.animations.player2;
		const width2 = state.paddles.height * anim2.scale; // Using height as width because it's vertical
		const height2 = state.paddles.width * anim2.scale; // Using width as height because it's vertical
		ctx.fillStyle = state.color.player2Color;
		ctx.fillRect(
			state.paddles.player2X - (width2 - state.paddles.height) / 2,
			state.paddles.player2Y - (height2 - state.paddles.width) / 2,
			width2,
			height2
		);

		// Draw bottom paddle (player3) - horizontal
		const anim3 = state.paddles.animations.player3;
		const width3 = state.paddles.width * anim3.scale;
		const height3 = state.paddles.height * anim3.scale;
		ctx.fillStyle = state.color.player3Color;
		ctx.fillRect(
			state.paddles.player3X - (width3 - state.paddles.width) / 2,
			state.paddles.player3Y - (height3 - state.paddles.height) / 2,
			width3,
			height3
		);

		// Draw left paddle (player4) - vertical
		const anim4 = state.paddles.animations.player4;
		const width4 = state.paddles.height * anim4.scale; // Using height as width because it's vertical
		const height4 = state.paddles.width * anim4.scale; // Using width as height because it's vertical
		ctx.fillStyle = state.color.player4Color;
		ctx.fillRect(
			state.paddles.player4X - (width4 - state.paddles.height) / 2,
			state.paddles.player4Y - (height4 - state.paddles.width) / 2,
			width4,
			height4
		);
	}

	function drawBall(): void {
		if (!ctx) return;
		ctx.beginPath();
		ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
		ctx.fillStyle = state.color.ballColor;
		ctx.fill();
		ctx.closePath();
	}

	function updateScores(): void {
		if (elements.score1) {
			elements.score1.textContent = state.scores.player1.toString();
		}
		if (elements.score2) {
			elements.score2.textContent = state.scores.player2.toString();
		}
		if (elements.score3) {
			elements.score3.textContent = state.scores.player3.toString();
		}
		if (elements.score4) {
			elements.score4.textContent = state.scores.player4.toString();
		}
	}

	function checkPaddleCollision(): void {
		if (!canvas) return;

		const ballRadius = state.ball.radius;
		const deltaTime = (performance.now() - state.lastTime) / 1000;
		
		// Calculate ball movement vector
		const ballVelocityX = state.ball.speedX * deltaTime;
		const ballVelocityY = state.ball.speedY * deltaTime;
		
		// Previous ball position
		const prevBallX = state.ball.x - ballVelocityX;
		const prevBallY = state.ball.y - ballVelocityY;

		// Check collision with top paddle (player1)
		if (state.ball.speedY < 0 && // Moving upward
			state.ball.y - ballRadius <= state.paddles.player1Y + state.paddles.height &&
			prevBallY - ballRadius > state.paddles.player1Y + state.paddles.height &&
			state.ball.x >= state.paddles.player1X &&
			state.ball.x <= state.paddles.player1X + state.paddles.width) {
			
			// Collision with top paddle
			state.ball.y = state.paddles.player1Y + state.paddles.height + ballRadius;
			handlePaddleBounce("player1");
		}
		
		// Check collision with right paddle (player2)
		if (state.ball.speedX > 0 && // Moving right
			state.ball.x + ballRadius >= state.paddles.player2X &&
			prevBallX + ballRadius < state.paddles.player2X &&
			state.ball.y >= state.paddles.player2Y &&
			state.ball.y <= state.paddles.player2Y + state.paddles.width) {
			
			// Collision with right paddle
			state.ball.x = state.paddles.player2X - ballRadius;
			handlePaddleBounce("player2");
		}
		
		// Check collision with bottom paddle (player3)
		if (state.ball.speedY > 0 && // Moving downward
			state.ball.y + ballRadius >= state.paddles.player3Y &&
			prevBallY + ballRadius < state.paddles.player3Y &&
			state.ball.x >= state.paddles.player3X &&
			state.ball.x <= state.paddles.player3X + state.paddles.width) {
			
			// Collision with bottom paddle
			state.ball.y = state.paddles.player3Y - ballRadius;
			handlePaddleBounce("player3");
		}
		
		// Check collision with left paddle (player4)
		if (state.ball.speedX < 0 && // Moving left
			state.ball.x - ballRadius <= state.paddles.player4X + state.paddles.height &&
			prevBallX - ballRadius > state.paddles.player4X + state.paddles.height &&
			state.ball.y >= state.paddles.player4Y &&
			state.ball.y <= state.paddles.player4Y + state.paddles.width) {
			
			// Collision with left paddle
			state.ball.x = state.paddles.player4X + state.paddles.height + ballRadius;
			handlePaddleBounce("player4");
		}
	}

	function handlePaddleBounce(player: "player1" | "player2" | "player3" | "player4"): void {
		// Start paddle animation
		state.paddles.animations[player] = {
			scale: 1.05,
			phase: "grow",
			time: 0
		};
	
		// Calculate bounce angle based on where the ball hit the paddle
		const speedMultiplier = 1.05; // Speed increase on bounce
		const currentSpeed = Math.hypot(state.ball.speedX, state.ball.speedY);
		const newSpeed = Math.min(currentSpeed * speedMultiplier, state.ball.maxSpeed);
	
		// Add a little randomness
		const randomVariation = (Math.random() * 0.1) - 0.05;
	
		// Handle bounce based on which paddle was hit
		switch (player) {
			case "player1": // Top paddle - bounce down
				{
					// Calculate relative intersection point (-1 to 1)
					const relativeIntersect = (state.ball.x - state.paddles.player1X) / state.paddles.width - 0.5;
					// Convert to angle (-π/3 to π/3 radians)
					const bounceAngle = relativeIntersect * (Math.PI / 3) + randomVariation;
					
					// Set new velocities
					state.ball.speedX = newSpeed * Math.sin(bounceAngle);
					state.ball.speedY = Math.abs(newSpeed * Math.cos(bounceAngle)); // Ensure downward
				}
				break;
			
			case "player2": // Right paddle - bounce left
				{
					const relativeIntersect = (state.ball.y - state.paddles.player2Y) / state.paddles.width - 0.5;
					const bounceAngle = relativeIntersect * (Math.PI / 3) + randomVariation;
					
					state.ball.speedX = -Math.abs(newSpeed * Math.cos(bounceAngle)); // Ensure leftward
					state.ball.speedY = newSpeed * Math.sin(bounceAngle);
				}
				break;
			
			case "player3": // Bottom paddle - bounce up
				{
					const relativeIntersect = (state.ball.x - state.paddles.player3X) / state.paddles.width - 0.5;
					const bounceAngle = relativeIntersect * (Math.PI / 3) + randomVariation;
					
					state.ball.speedX = newSpeed * Math.sin(bounceAngle);
					state.ball.speedY = -Math.abs(newSpeed * Math.cos(bounceAngle)); // Ensure upward
				}
				break;
			
			case "player4": // Left paddle - bounce right
				{
					const relativeIntersect = (state.ball.y - state.paddles.player4Y) / state.paddles.width - 0.5;
					const bounceAngle = relativeIntersect * (Math.PI / 3) + randomVariation;
					
					state.ball.speedX = Math.abs(newSpeed * Math.cos(bounceAngle)); // Ensure rightward
					state.ball.speedY = newSpeed * Math.sin(bounceAngle);
				}
				break;
		}
		
		// Ensure minimum speed in both directions
		const minComponentSpeed = 50;
		if (Math.abs(state.ball.speedX) < minComponentSpeed) {
			state.ball.speedX = minComponentSpeed * Math.sign(state.ball.speedX || 1);
		}
		if (Math.abs(state.ball.speedY) < minComponentSpeed) {
			state.ball.speedY = minComponentSpeed * Math.sign(state.ball.speedY || 1);
		}
	}

	function checkWallCollision(): void {
		if (!canvas) return;
	
		// Check for scoring (when ball goes past paddles)
		// Top wall (player1 misses)
		if (state.ball.y - state.ball.radius < 0) {
			state.scores.player3++; // Bottom player scores
			resetBall();
			updateScores();
		}
		// Right wall (player2 misses)
		else if (state.ball.x + state.ball.radius > canvas.width) {
			state.scores.player4++; // Left player scores
			resetBall();
			updateScores();
		}
		// Bottom wall (player3 misses)
		else if (state.ball.y + state.ball.radius > canvas.height) {
			state.scores.player1++; // Top player scores
			resetBall();
			updateScores();
		}
		// Left wall (player4 misses)
		else if (state.ball.x - state.ball.radius < 0) {
			state.scores.player2++; // Right player scores
			resetBall();
			updateScores();
		}
	}

	function update(deltaTime: number): void {
		if (!canvas) return;
	
		// Handle countdown
		const currentTime = performance.now();
		
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
	
		// Update paddle animations
		(["player1", "player2", "player3", "player4"] as const).forEach((player) => {
			const anim = state.paddles.animations[player];
			if (anim.phase !== "none") {
				anim.time += deltaTime;
	
				if (anim.phase === "grow") {
					if (anim.time >= 0.2) {
						anim.phase = "shrink";
						anim.scale = 0.9;
						anim.time = 0;
					}
				} else if (anim.phase === "shrink") {
					if (anim.time >= 0.2) {
						anim.phase = "return";
						anim.scale = 1;
						anim.time = 0;
					}
				} else if (anim.phase === "return") {
					if (anim.time >= 0.6) {
						anim.phase = "none";
					}
				}
			}
		});
	
		// Update paddle positions based on controls
		// Player 1 (top) - horizontal movement
		if (state.controls.player1Left && state.paddles.player1X > 5) {
			state.paddles.player1X -= state.paddles.speed * deltaTime;
		}
		if (state.controls.player1Right && state.paddles.player1X < canvas.width - state.paddles.width - 5) {
			state.paddles.player1X += state.paddles.speed * deltaTime;
		}
		
		// Player 2 (right) - vertical movement
		if (state.controls.player2Up && state.paddles.player2Y > 5) {
			state.paddles.player2Y -= state.paddles.speed * deltaTime;
		}
		if (state.controls.player2Down && state.paddles.player2Y < canvas.height - state.paddles.width - 5) {
			state.paddles.player2Y += state.paddles.speed * deltaTime;
		}
		
		// Player 3 (bottom) - horizontal movement
		if (state.controls.player3Left && state.paddles.player3X > 5) {
			state.paddles.player3X -= state.paddles.speed * deltaTime;
		}
		if (state.controls.player3Right && state.paddles.player3X < canvas.width - state.paddles.width - 5) {
			state.paddles.player3X += state.paddles.speed * deltaTime;
		}
		
		// Player 4 (left) - vertical movement
		if (state.controls.player4Up && state.paddles.player4Y > 5) {
			state.paddles.player4Y -= state.paddles.speed * deltaTime;
		}
		if (state.controls.player4Down && state.paddles.player4Y < canvas.height - state.paddles.width - 5) {
			state.paddles.player4Y += state.paddles.speed * deltaTime;
		}
		
		// Update ball position
		state.ball.x += state.ball.speedX * deltaTime;
		state.ball.y += state.ball.speedY * deltaTime;
		state.lastTime = currentTime;
	
		// Check for collisions
		checkWallCollision();
		checkPaddleCollision();
	
		// Check for game end
		const maxScore = Math.max(
			state.scores.player1,
			state.scores.player2,
			state.scores.player3,
			state.scores.player4
		);
		
		if (maxScore >= state.scores.winning) {
			endGame();
		}
	}

	function resetBall(): void {
		if (!canvas) return;
		
		// Place ball in center
		state.ball.x = canvas.width / 2;
		state.ball.y = canvas.height / 2;
		
		// Random initial direction with fixed speed
		const initialSpeed = 250;
		const randomAngle = Math.random() * Math.PI * 2; // Any direction (0 to 2π)
		
		state.ball.speedX = initialSpeed * Math.cos(randomAngle);
		state.ball.speedY = initialSpeed * Math.sin(randomAngle);
		
		// Ensure minimum speed in both directions
		const minComponentSpeed = 100;
		if (Math.abs(state.ball.speedX) < minComponentSpeed) {
			state.ball.speedX = minComponentSpeed * Math.sign(state.ball.speedX || 1);
		}
		if (Math.abs(state.ball.speedY) < minComponentSpeed) {
			state.ball.speedY = minComponentSpeed * Math.sign(state.ball.speedY || 1);
		}
	}

	function endGame(): void {
		state.running = false;
		
		// Determine winner
		const scores = [
			{ player: "Player 1 (Top)", score: state.scores.player1 },
			{ player: "Player 2 (Right)", score: state.scores.player2 },
			{ player: "Player 3 (Bottom)", score: state.scores.player3 },
			{ player: "Player 4 (Left)", score: state.scores.player4 }
		];
		
		// Sort by score (descending)
		scores.sort((a, b) => b.score - a.score);
		
		// Display winner message
		const winnerMessage = document.createElement("div");
		winnerMessage.className = "winner-message";
		winnerMessage.innerHTML = `
			<h2>${scores[0].player} Wins!</h2>
			<p>Final Scores:</p>
			<ul>
				${scores.map(s => `<li>${s.player}: ${s.score}</li>`).join('')}
			</ul>
		`;
		
		// Show menu with winner message
		elements.menu?.classList.remove("hidden");
		elements.menu?.classList.add("show");
		
		// Clear any existing winner message
		const existingMessage = elements.menu?.querySelector(".winner-message");
		if (existingMessage) {
			existingMessage.remove();
		}
		
		// Add new winner message
		elements.menu?.appendChild(winnerMessage);
		
		resetBall();
	}

	function handleKeyDown(e: KeyboardEvent): void {
		switch (e.key) {
			// Player 1 (top) controls - A & D
			case "a":
				state.controls.player1Left = true;
				break;
			case "d":
				state.controls.player1Right = true;
				break;
				
			// Player 2 (right) controls - ArrowUp & ArrowDown
			case "ArrowUp":
				state.controls.player2Up = true;
				break;
			case "ArrowDown":
				state.controls.player2Down = true;
				break;
				
			// Player 3 (bottom) controls - J & L
			case "j":
				state.controls.player3Left = true;
				break;
			case "l":
				state.controls.player3Right = true;
				break;
				
			// Player 4 (left) controls - W & S
			case "w":
				state.controls.player4Up = true;
				break;
			case "s":
				state.controls.player4Down = true;
				break;
		}
	}

	function handleKeyUp(e: KeyboardEvent): void {
		switch (e.key) {
			// Player 1 (top) controls
			case "a":
				state.controls.player1Left = false;
				break;
			case "d":
				state.controls.player1Right = false;
				break;
				
			// Player 2 (right) controls
			case "ArrowUp":
				state.controls.player2Up = false;
				break;
			case "ArrowDown":
				state.controls.player2Down = false;
				break;
				
			// Player 3 (bottom) controls
			case "j":
				state.controls.player3Left = false;
				break;
			case "l":
				state.controls.player3Right = false;
				break;
				
			// Player 4 (left) controls
			case "w":
				state.controls.player4Up = false;
				break;
			case "s":
				state.controls.player4Down = false;
				break;
		}
	}

	function drawCountdown(): void {
		if (state.countdownActive) {
			const currentCount = Math.ceil(state.countdown);
			if (currentCount > 0) {
				drawCountElement(currentCount.toString());
			}
		} else if (state.fadingOut) {
			drawCountElement("GO", state.countdownOpacity);
		}
	}

	function drawCountElement(text: string, opacity: number = 1.0): void {
		if (!ctx || !canvas)
			return;

		ctx.beginPath();
		ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
		ctx.fillStyle = `rgba(187, 112, 173, ${opacity * 1})`;
		ctx.fill();

		ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
		ctx.font = "50px Aeonik";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 5);

		ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
		ctx.lineWidth = 4;
		ctx.stroke();
		ctx.closePath();
	}

	function startGame(): void {
		// Reset scores
		state.scores.player1 = 0;
		state.scores.player2 = 0;
		state.scores.player3 = 0;
		state.scores.player4 = 0;
		updateScores();
		
		// Remove any winner message
		const existingMessage = elements.menu?.querySelector(".winner-message");
		if (existingMessage) {
			existingMessage.remove();
		}
		
		// Hide menu
		elements.menu?.classList.remove("show");
		setTimeout(() => {
			elements.menu?.classList.add("hidden");
		}, 500);
		
		// Start countdown
		state.countdown = 3;
		state.countdownActive = true;
		state.fadingOut = false;
		state.countdownOpacity = 1.0;
		
		resetBall();
	}

	function gameLoop(currentTime: number): void {
		if (!ctx || !canvas) return;

		const deltaTime = (currentTime - state.lastTime) / 1000;
		state.lastTime = currentTime;

		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw center lines
		ctx.fillStyle = state.color.groundColor;
		ctx.fillRect(canvas.width / 2 - 1, 0, 2, canvas.height); // Vertical center line
		ctx.fillRect(0, canvas.height / 2 - 1, canvas.width, 2); // Horizontal center line
		
		// Draw center circle
		ctx.beginPath();
		ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
		ctx.strokeStyle = state.color.groundColor;
		ctx.lineWidth = 2;
		ctx.stroke();

		// Draw game elements
		drawPaddles();
		drawBall();
		
		// Update game state
		update(deltaTime);

		// Draw countdown if active
		if (state.countdownActive || state.fadingOut) {
			drawCountdown();
		}
		
		state.animationFrameId = requestAnimationFrame(gameLoop);
	}
}