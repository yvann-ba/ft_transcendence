import "../styles/four-player-pong.css";

interface Ball {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  radius: number;
  originalSpeed: number;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  score: number;
  lastHitTime: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  active: boolean;
  playerIndex: number;
}

interface Colors {
  ballColor: string;
  backgroundColor: string;
}

export default function initializeMultiplayerGame(): (() => void) | null {
  console.log("Initializing 4-Player Game");
  
  const canvas = document.getElementById("multiplayerCanvas") as HTMLCanvasElement | null;
  if (!canvas) {
    console.error("Canvas not found");
    return null;
  }
  
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("2D context not found");
    return null;
  }
  
  // Game settings
  const GAME_WIDTH = canvas.width;
  const GAME_HEIGHT = canvas.height;
  let MAX_SCORE = 10; // Default winning score
  const PLAYER_COUNT = 4;
  const PADDLE_COOLDOWN = 300; // ms delay between paddle hits to prevent lag
  
  // Game elements
  const ball: Ball = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    speedX: 4,
    speedY: -4,
    radius: 10,
    originalSpeed: 4
  };
  
  // Custom colors
  const colors: Colors = {
    ballColor: "#FFFFFF",
    backgroundColor: "#000000"
  };
  
  // Paddle settings
  const paddleHeight = 20;
  const paddleWidth = 100;
  
  // Player colors
  const playerColors = ["#BB70AD", "#70BB88", "#7088BB", "#BBBB70"];
  
  // Create paddles for 4 players
  const paddles: Paddle[] = [
    // Bottom paddle (Player 1)
    {
      x: GAME_WIDTH / 2 - paddleWidth / 2,
      y: GAME_HEIGHT - paddleHeight - 10,
      width: paddleWidth,
      height: paddleHeight,
      color: playerColors[0],
      score: 0,
      lastHitTime: 0
    },
    // Top paddle (Player 2)
    {
      x: GAME_WIDTH / 2 - paddleWidth / 2,
      y: 10,
      width: paddleWidth,
      height: paddleHeight,
      color: playerColors[1],
      score: 0,
      lastHitTime: 0
    },
    // Left paddle (Player 3)
    {
      x: 10,
      y: GAME_HEIGHT / 2 - paddleWidth / 2,
      width: paddleHeight,
      height: paddleWidth,
      color: playerColors[2],
      score: 0,
      lastHitTime: 0
    },
    // Right paddle (Player 4)
    {
      x: GAME_WIDTH - paddleHeight - 10,
      y: GAME_HEIGHT / 2 - paddleWidth / 2,
      width: paddleHeight,
      height: paddleWidth,
      color: playerColors[3],
      score: 0,
      lastHitTime: 0
    }
  ];
  
  // Create bricks for all players
  const bricks: Brick[] = [];
  const BRICK_ROWS = 2;
  const BRICK_COLS = 4;
  const BRICK_WIDTH = 60;
  const BRICK_HEIGHT = 20;
  const BRICK_PADDING = 10;
  
  function createBricks() {
    bricks.length = 0; // Clear existing bricks
    
    // Create brick sets for each player - 4 regions of the screen
    
    // Top area (Player 1's bricks)
    const offsetTopY = 60;
    for (let c = 0; c < BRICK_COLS; c++) {
      for (let r = 0; r < BRICK_ROWS; r++) {
        const brickX = GAME_WIDTH / 2 - ((BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING)) / 2) + c * (BRICK_WIDTH + BRICK_PADDING);
        const brickY = offsetTopY + r * (BRICK_HEIGHT + BRICK_PADDING);
        
        bricks.push({
          x: brickX,
          y: brickY,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: playerColors[0],
          active: true,
          playerIndex: 0
        });
      }
    }
    
    // Bottom area (Player 2's bricks)
    const offsetBottomY = GAME_HEIGHT - BRICK_ROWS * (BRICK_HEIGHT + BRICK_PADDING) - 60;
    for (let c = 0; c < BRICK_COLS; c++) {
      for (let r = 0; r < BRICK_ROWS; r++) {
        const brickX = GAME_WIDTH / 2 - ((BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING)) / 2) + c * (BRICK_WIDTH + BRICK_PADDING);
        const brickY = offsetBottomY + r * (BRICK_HEIGHT + BRICK_PADDING);
        
        bricks.push({
          x: brickX,
          y: brickY,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: playerColors[1],
          active: true,
          playerIndex: 1
        });
      }
    }
    
    // Left area (Player 3's bricks) - rotated to be vertical
    const offsetLeftX = 60;
    for (let c = 0; c < BRICK_ROWS; c++) { // Swap rows/cols for vertical arrangement
      for (let r = 0; r < BRICK_COLS; r++) {
        const brickX = offsetLeftX + c * (BRICK_HEIGHT + BRICK_PADDING);
        const brickY = GAME_HEIGHT / 2 - ((BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING)) / 2) + r * (BRICK_WIDTH + BRICK_PADDING);
        
        bricks.push({
          x: brickX,
          y: brickY,
          width: BRICK_HEIGHT, // Swap width/height for vertical
          height: BRICK_WIDTH,
          color: playerColors[2],
          active: true,
          playerIndex: 2
        });
      }
    }
    
    // Right area (Player 4's bricks) - rotated to be vertical
    const offsetRightX = GAME_WIDTH - BRICK_ROWS * (BRICK_HEIGHT + BRICK_PADDING) - 60;
    for (let c = 0; c < BRICK_ROWS; c++) { // Swap rows/cols for vertical arrangement
      for (let r = 0; r < BRICK_COLS; r++) {
        const brickX = offsetRightX + c * (BRICK_HEIGHT + BRICK_PADDING);
        const brickY = GAME_HEIGHT / 2 - ((BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING)) / 2) + r * (BRICK_WIDTH + BRICK_PADDING);
        
        bricks.push({
          x: brickX,
          y: brickY,
          width: BRICK_HEIGHT, // Swap width/height for vertical
          height: BRICK_WIDTH,
          color: playerColors[3],
          active: true,
          playerIndex: 3
        });
      }
    }
  }
  
  // Controls for each player (fixed keymap)
  const playerControls = [
    { left: false, right: false }, // Player 1 (bottom)
    { left: false, right: false }, // Player 2 (top)
    { up: false, down: false },    // Player 3 (left)
    { up: false, down: false }     // Player 4 (right)
  ];
  
  // UI elements
  const elements = {
    playButton: document.getElementById("play-button") as HTMLElement | null,
    customizeButton: document.getElementById("custom-button") as HTMLElement | null,
    menu: document.getElementById("game-menu") as HTMLElement | null,
    customMenu: document.getElementById("pong-custom-menu") as HTMLElement | null,
    winningScoreSlider: document.getElementById("winning-score-slider") as HTMLInputElement | null,
    winningScoreDisplay: document.getElementById("pong-winning-score") as HTMLElement | null,
    ballColorPicker: document.getElementById("pong-ball-color") as HTMLInputElement | null,
    backgroundColorPicker: document.getElementById("pong-ground-color") as HTMLInputElement | null,
    customBackButton: document.getElementById("custom-back-button") as HTMLElement | null,
    scoreDisplay: document.getElementById("scoreboard") as HTMLElement | null,
    playerScores: [
      document.getElementById("player1-score") as HTMLElement | null,
      document.getElementById("player2-score") as HTMLElement | null,
      document.getElementById("player3-score") as HTMLElement | null,
      document.getElementById("player4-score") as HTMLElement | null
    ]
  };
  
  // Game state
  let gameRunning = false;
  let animationFrameId: number | null = null;
  let winner: number | null = null;
  let lastTime = performance.now();
  
  // Event handlers
  function handleKeyDown(e: KeyboardEvent): void {
    switch(e.key) {
      // Player 1 (bottom)
      case "ArrowLeft":
        playerControls[0].left = true;
        break;
      case "ArrowRight":
        playerControls[0].right = true;
        break;
        
      // Player 2 (top)
      case "a":
      case "A":
        playerControls[1].left = true;
        break;
      case "d":
      case "D":
        playerControls[1].right = true;
        break;
        
      // Player 3 (left)
      case "j":
      case "J":
        playerControls[2].up = true;
        break;
      case "l":
      case "L":
        playerControls[2].down = true;
        break;
        
      // Player 4 (right)
      case "q":
      case "Q":
        playerControls[3].up = true;
        break;
      case "e":
      case "E":
        playerControls[3].down = true;
        break;
        
      // Space to restart game
      case " ":
        if (!gameRunning && winner !== null) {
          resetGame();
        }
        break;
    }
  }
  
  function handleKeyUp(e: KeyboardEvent): void {
    switch(e.key) {
      // Player 1 (bottom)
      case "ArrowLeft":
        playerControls[0].left = false;
        break;
      case "ArrowRight":
        playerControls[0].right = false;
        break;
        
      // Player 2 (top)
      case "a":
      case "A":
        playerControls[1].left = false;
        break;
      case "d":
      case "D":
        playerControls[1].right = false;
        break;
        
      // Player 3 (left)
      case "j":
      case "J":
        playerControls[2].up = false;
        break;
      case "l":
      case "L":
        playerControls[2].down = false;
        break;
        
      // Player 4 (right)
      case "q":
      case "Q":
        playerControls[3].up = false;
        break;
      case "e":
      case "E":
        playerControls[3].down = false;
        break;
    }
  }
  
  // Color and customization event handlers
  function changeColors(event: Event): void {
    const input = event.target as HTMLInputElement;
    const id = input.id;
    const color = input.value;

    input.style.backgroundColor = color;

    switch (id) {
      case "pong-ground-color":
        colors.backgroundColor = color;
        break;
      case "pong-ball-color":
        colors.ballColor = color;
        break;
    }
  }

  function changeWinningScore(event: Event): void {
    const slider = event.target as HTMLInputElement;
    MAX_SCORE = Math.floor(parseFloat(slider.value));
    if (elements.winningScoreDisplay) {
      elements.winningScoreDisplay.textContent = "Winning score: " + MAX_SCORE;
    }
  }

  function sliderAnimation(event: Event): void {
    const slider = event.target as HTMLInputElement;
    
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const value = 5 + ((parseFloat(slider.value) - min) / (max - min)) * 90;
    slider.style.setProperty('--slider-track-bg', `linear-gradient(to right, #BB70AD 0%, #BB70AD ${value}%, #ffffff ${value}%)`);
  }
  
  // Draw functions
  function drawBall(): void {
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = colors.ballColor;
    ctx.fill();
    ctx.closePath();
  }
  
  function drawPaddles(): void {
    if (!ctx) return;
    
    paddles.forEach(paddle => {
      ctx.beginPath();
      ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
      ctx.fillStyle = paddle.color;
      ctx.fill();
      ctx.closePath();
    });
  }
  
  function drawBricks(): void {
    if (!ctx) return;
    
    bricks.forEach(brick => {
      if (brick.active) {
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, brick.width, brick.height);
        ctx.fillStyle = brick.color;
        ctx.fill();
        ctx.closePath();
        
        // Add a border to make bricks more visible
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, brick.width, brick.height);
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
      }
    });
  }
  
  function drawScoreboard(): void {
    if (!ctx || !elements.scoreDisplay) return;
    
    // Only update the scoreboard at the bottom of the canvas
    paddles.forEach((paddle, index) => {
      if (elements.playerScores[index]) {
        elements.playerScores[index].textContent = `${paddle.score}`;
        elements.playerScores[index].style.color = paddle.color;
      }
    });
  }
  
  function drawControlsHint(): void {
    if (!ctx) return;
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "12px Arial";
    
    // Bottom controls (Player 1)
    ctx.fillText("← / →", GAME_WIDTH / 2 - 10, GAME_HEIGHT - 25);
    
    // Top controls (Player 2)
    ctx.fillText("A / D", GAME_WIDTH / 2 - 10, 25);
    
    // Left controls (Player 3)
    ctx.save();
    ctx.translate(25, GAME_HEIGHT / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("J / L", -15, 0);
    ctx.restore();
    
    // Right controls (Player 4)
    ctx.save();
    ctx.translate(GAME_WIDTH - 25, GAME_HEIGHT / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillText("Q / E", -15, 0);
    ctx.restore();
  }
  
  function drawWinner(): void {
    if (!ctx || winner === null) return;
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    ctx.font = "36px Arial";
    ctx.fillStyle = playerColors[winner];
    ctx.textAlign = "center";
    ctx.fillText(`Player ${winner + 1} Wins!`, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    
    ctx.font = "24px Arial";
    ctx.fillText("Press SPACE to restart", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
  }
  
  // Game logic
  function checkCollisions(): void {
    const currentTime = performance.now();
    
    // Wall collisions - bounce off all walls for simplicity
    if (ball.x + ball.radius > GAME_WIDTH || ball.x - ball.radius < 0) {
      ball.speedX = -ball.speedX;
      
      // Add small random angle change to prevent repetitive patterns
      ball.speedY += (Math.random() - 0.5) * 0.5;
    }
    
    if (ball.y + ball.radius > GAME_HEIGHT || ball.y - ball.radius < 0) {
      ball.speedY = -ball.speedY;
      
      // Add small random angle change to prevent repetitive patterns
      ball.speedX += (Math.random() - 0.5) * 0.5;
    }
    
    // Paddle collisions with cooldown to prevent multiple hits
    paddles.forEach((paddle, index) => {
      // Only check collision if enough time has passed since last hit
      if (currentTime - paddle.lastHitTime < PADDLE_COOLDOWN) {
        return;
      }
      
      // For horizontal paddles (top and bottom)
      if (index < 2) {
        if (
          ball.x > paddle.x && 
          ball.x < paddle.x + paddle.width && 
          ((index === 0 && ball.y + ball.radius > paddle.y && ball.y < paddle.y + paddle.height) || // Bottom paddle
           (index === 1 && ball.y - ball.radius < paddle.y + paddle.height && ball.y > paddle.y)) // Top paddle
        ) {
          // Update last hit time
          paddle.lastHitTime = currentTime;
          
          // Reverse ball direction
          ball.speedY = -ball.speedY;
          
          // Add some angle based on where the ball hit the paddle
          const hitPosition = (ball.x - paddle.x) / paddle.width;
          ball.speedX = 6 * (hitPosition - 0.5);
          
          // Slightly increase ball speed for more dynamic gameplay
          const speedMultiplier = 1.05;
          const newSpeed = Math.min(Math.hypot(ball.speedX, ball.speedY) * speedMultiplier, 8);
          const angle = Math.atan2(ball.speedY, ball.speedX);
          ball.speedX = Math.cos(angle) * newSpeed;
          ball.speedY = Math.sin(angle) * newSpeed;
        }
      } 
      // For vertical paddles (left and right)
      else if (index >= 2) {
        if (
          ball.y > paddle.y && 
          ball.y < paddle.y + paddle.height && 
          ((index === 2 && ball.x - ball.radius < paddle.x + paddle.width && ball.x > paddle.x) || // Left paddle
           (index === 3 && ball.x + ball.radius > paddle.x && ball.x < paddle.x + paddle.width)) // Right paddle
        ) {
          // Update last hit time
          paddle.lastHitTime = currentTime;
          
          // Reverse ball direction
          ball.speedX = -ball.speedX;
          
          // Add some angle based on where the ball hit the paddle
          const hitPosition = (ball.y - paddle.y) / paddle.height;
          ball.speedY = 6 * (hitPosition - 0.5);
          
          // Slightly increase ball speed for more dynamic gameplay
          const speedMultiplier = 1.05;
          const newSpeed = Math.min(Math.hypot(ball.speedX, ball.speedY) * speedMultiplier, 8);
          const angle = Math.atan2(ball.speedY, ball.speedX);
          ball.speedX = Math.cos(angle) * newSpeed;
          ball.speedY = Math.sin(angle) * newSpeed;
        }
      }
    });
    
    // Brick collisions with improved collision detection
    for (let i = 0; i < bricks.length; i++) {
      const brick = bricks[i];
      if (brick.active) {
        // Check if ball is colliding with this brick
        if (
          ball.x + ball.radius > brick.x && 
          ball.x - ball.radius < brick.x + brick.width && 
          ball.y + ball.radius > brick.y && 
          ball.y - ball.radius < brick.y + brick.height
        ) {
          // Determine which side of the brick was hit
          const overlapLeft = ball.x + ball.radius - brick.x;
          const overlapRight = brick.x + brick.width - (ball.x - ball.radius);
          const overlapTop = ball.y + ball.radius - brick.y;
          const overlapBottom = brick.y + brick.height - (ball.y - ball.radius);
          
          // Find the smallest overlap to determine hit direction
          const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
          
          // Bounce based on which side was hit
          if (minOverlap === overlapTop || minOverlap === overlapBottom) {
            ball.speedY = -ball.speedY;
            
            // Add small variation to prevent repetitive patterns
            ball.speedX += (Math.random() - 0.5) * 0.3;
          } else {
            ball.speedX = -ball.speedX;
            
            // Add small variation to prevent repetitive patterns
            ball.speedY += (Math.random() - 0.5) * 0.3;
          }
          
          // Deactivate brick
          brick.active = false;
          
          // Award a point to the player who broke it (not the brick owner)
          // The brick's playerIndex indicates which player owns it
          // Award point to the player who hit it (all other players except the brick owner)
          for (let p = 0; p < PLAYER_COUNT; p++) {
            if (p !== brick.playerIndex) {
              paddles[p].score++;
            }
          }
          
          // Check if someone has won
          for (let p = 0; p < PLAYER_COUNT; p++) {
            if (paddles[p].score >= MAX_SCORE) {
              winner = p;
              gameRunning = false;
              break;
            }
          }
          
          // Only handle one brick collision per frame
          break;
        }
      }
    }
  }
  
  function updatePaddles(deltaTime: number): void {
    const paddleSpeed = 350 * deltaTime; // Speed adjusted for deltaTime
    
    // Player 1 (bottom - horizontal)
    if (playerControls[0].left && paddles[0].x > 0) {
      paddles[0].x -= paddleSpeed;
    }
    if (playerControls[0].right && paddles[0].x + paddles[0].width < GAME_WIDTH) {
      paddles[0].x += paddleSpeed;
    }
    
    // Player 2 (top - horizontal)
    if (playerControls[1].left && paddles[1].x > 0) {
      paddles[1].x -= paddleSpeed;
    }
    if (playerControls[1].right && paddles[1].x + paddles[1].width < GAME_WIDTH) {
      paddles[1].x += paddleSpeed;
    }
    
    // Player 3 (left - vertical)
    if (playerControls[2].up && paddles[2].y > 0) {
      paddles[2].y -= paddleSpeed;
    }
    if (playerControls[2].down && paddles[2].y + paddles[2].height < GAME_HEIGHT) {
      paddles[2].y += paddleSpeed;
    }
    
    // Player 4 (right - vertical)
    if (playerControls[3].up && paddles[3].y > 0) {
      paddles[3].y -= paddleSpeed;
    }
    if (playerControls[3].down && paddles[3].y + paddles[3].height < GAME_HEIGHT) {
      paddles[3].y += paddleSpeed;
    }
  }
  
  function updateBall(deltaTime: number): void {
    ball.x += ball.speedX * deltaTime * 60; // Adjust for deltaTime (assuming 60 FPS as baseline)
    ball.y += ball.speedY * deltaTime * 60;
    
    // Cap ball speed to prevent it from going too fast
    const maxSpeed = 12;
    const currentSpeed = Math.hypot(ball.speedX, ball.speedY);
    if (currentSpeed > maxSpeed) {
      const angle = Math.atan2(ball.speedY, ball.speedX);
      ball.speedX = Math.cos(angle) * maxSpeed;
      ball.speedY = Math.sin(angle) * maxSpeed;
    }
    
    // Prevent ball from stopping completely
    const minSpeed = 3;
    if (currentSpeed < minSpeed) {
      const angle = Math.atan2(ball.speedY, ball.speedX);
      ball.speedX = Math.cos(angle) * minSpeed;
      ball.speedY = Math.sin(angle) * minSpeed;
    }
  }
  
  function resetBall(): void {
    // Place ball in center
    ball.x = GAME_WIDTH / 2;
    ball.y = GAME_HEIGHT / 2;
    
    // Randomize initial direction
    const angle = Math.random() * Math.PI * 2;
    ball.speedX = Math.cos(angle) * ball.originalSpeed;
    ball.speedY = Math.sin(angle) * ball.originalSpeed;
    
    // Ensure the ball isn't moving too slow in either axis
    if (Math.abs(ball.speedX) < 2) {
      ball.speedX = 2 * Math.sign(ball.speedX) || 2;
    }
    if (Math.abs(ball.speedY) < 2) {
      ball.speedY = 2 * Math.sign(ball.speedY) || 2;
    }
  }
  
  function startGame(): void {
    // Create game elements
    createBricks();
    resetBall();
    
    // Reset scores
    paddles.forEach(paddle => paddle.score = 0);
    
    // Reset winner
    winner = null;
    
    // Hide menu
    if (elements.menu) {
      elements.menu.classList.add("hidden");
    }
    
    // Start game loop
    gameRunning = true;
    lastTime = performance.now();
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(gameLoop);
  }
  
  function resetGame(): void {
    startGame();
  }
  
  function showMenu(): void {
    gameRunning = false;
    if (elements.menu) {
      elements.menu.classList.remove("hidden");
    }
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }
  
  function openCustomMenu(): void {
    elements.menu?.classList.add("hidden");
    elements.customMenu?.classList.remove("hidden");
    elements.customMenu?.classList.add("show");

    const pongGame = document.getElementById("game-container");
    if (pongGame) {
      pongGame.classList.remove("main-menu");
      pongGame.classList.add("pong-custom-menu-canvas");
    }
  }

  function closeCustomMenu(): void {
    elements.customMenu?.classList.remove("show");
    elements.customMenu?.classList.add("hidden");
    elements.menu?.classList.remove("hidden");

    const pongGame = document.getElementById("game-container");
    if (pongGame) {
      pongGame.classList.remove("pong-custom-menu-canvas");
      pongGame.classList.add("main-menu");
    }
  }
  
  function gameLoop(timestamp: number): void {
    if (!ctx) return;
    
    // Calculate delta time
    const deltaTime = (timestamp - lastTime) / 1000; // Convert to seconds
    lastTime = timestamp;
    
    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw background
    ctx.fillStyle = colors.backgroundColor;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    if (gameRunning) {
      // Update game state
      updatePaddles(deltaTime);
      updateBall(deltaTime);
      checkCollisions();
      
      // Draw game elements
      drawBricks();
      drawPaddles();
      drawBall();
      drawScoreboard();
      drawControlsHint();
      
      // Continue game loop
      animationFrameId = requestAnimationFrame(gameLoop);
    } else if (winner !== null) {
      // Draw final state with winner overlay
      drawBricks();
      drawPaddles();
      drawBall();
      drawScoreboard();
      drawWinner();
      
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  }
  
  // Setup event listeners
  function init(): void {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    
    // Button event listeners
    elements.playButton?.addEventListener("click", startGame);
    elements.customizeButton?.addEventListener("click", openCustomMenu);
    elements.customBackButton?.addEventListener("click", closeCustomMenu);
    
    // Color picker and slider listeners
    elements.ballColorPicker?.addEventListener("input", changeColors);
    elements.backgroundColorPicker?.addEventListener("input", changeColors);
    elements.winningScoreSlider?.addEventListener("input", changeWinningScore);
    elements.winningScoreSlider?.addEventListener("input", sliderAnimation);
    
    // Show menu initially
    showMenu();
    
    // Pre-create bricks
    createBricks();
  }
  
  // Initialize the game
  init();
  
  // Return cleanup function
  return function cleanup(): void {
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("keyup", handleKeyUp);
    
    elements.playButton?.removeEventListener("click", startGame);
    elements.customizeButton?.removeEventListener("click", openCustomMenu);
    elements.customBackButton?.removeEventListener("click", closeCustomMenu);
    
    elements.ballColorPicker?.removeEventListener("input", changeColors);
    elements.backgroundColorPicker?.removeEventListener("input", changeColors);
    elements.winningScoreSlider?.removeEventListener("input", changeWinningScore);
    elements.winningScoreSlider?.removeEventListener("input", sliderAnimation);
    
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}