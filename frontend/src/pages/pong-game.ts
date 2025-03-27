import "../styles/pong-game.css";
import "../styles/pong-selection.css";
import { AIOpponent, AIDifficulty } from '../game/ai/ai-opponent';
import { languageService } from "../utils/languageContext";

declare global {
  interface Window {
    initializePongGame?: () => void;
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
  player1Y: number;
  player2Y: number;
  speed: number;
  animations: {
    player1: PaddleAnimation;
    player2: PaddleAnimation;
  };
}

interface Scores {
  player1: number;
  player2: number;
  winning: number;
}

interface Controls {
  player1Up: boolean;
  player1Down: boolean;
  player2Up: boolean;
  player2Down: boolean;
}

interface Colors {
  groundColor: string;
  ballColor: string;
  paddleColor: string;
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

function backToGameModes(event?: Event): void {
  if (event) event.preventDefault();
  
  const href = (event?.target as HTMLElement)?.getAttribute('href') || '/pong-selection';
  
  const transitionOverlay = document.createElement('div');
  transitionOverlay.style.position = 'fixed';
  transitionOverlay.style.top = '0';
  transitionOverlay.style.left = '0';
  transitionOverlay.style.width = '100%';
  transitionOverlay.style.height = '100%';
  transitionOverlay.style.backgroundColor = '#000';
  transitionOverlay.style.zIndex = '9999';
  transitionOverlay.style.opacity = '0';
  transitionOverlay.style.transition = 'opacity 0.2s ease-in';
  document.body.appendChild(transitionOverlay);
  
  setTimeout(() => {
    transitionOverlay.style.opacity = '1';
    
    setTimeout(() => {
      window.location.href = href;
    }, 200);
  }, 10);
}
 
export default async function initializePongGame(): Promise<(() => void) | null> {
  const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement | null;
  if (!canvas) {
    return null;
  }
  
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  const elements = {
    playButton: document.getElementById("play-button") as HTMLElement | null,
    menu: document.getElementById("pong-menu") as HTMLElement | null,
    score1: document.getElementById("player1-score") as HTMLElement | null,
    score2: document.getElementById("player2-score") as HTMLElement | null,
    customButton: document.getElementById("custom-button") as HTMLElement | null,
    customBackButton: document.getElementById("custom-back-button") as HTMLElement | null,
    customColorsInputs: document.querySelectorAll(".color-input") as NodeListOf<HTMLInputElement>,
    customSliders: document.querySelectorAll(".pong-custom-slider") as NodeListOf<HTMLInputElement>,
    winningScoreSlider: document.getElementById("winning-score-slider") as HTMLInputElement | null,
    difficultySelector: document.getElementById("ai-difficulty") as HTMLSelectElement | null,
    difficultySelectorContainer: document.getElementById("difficulty-selector-container") as HTMLElement | null
  };

  const isAIMode = window.location.search.includes('ai=true');
  
  if (isAIMode && elements.difficultySelectorContainer) {
    elements.difficultySelectorContainer.classList.remove("hidden");
  }

  const state: any = {
    ball: {
      x: canvas.width / 2,
      y: canvas.height / 2,
      speedX: 250,
      speedY: 250,
      radius: 6,
      maxSpeed: 850
    },
    paddles: {
      width: 7,
      height: 100,
      player1Y: (canvas.height - 100) / 2,
      player2Y: (canvas.height - 100) / 2,
      speed: 300,
      animations: {
        player1: { scale: 1, phase: "none", time: 0 },
        player2: { scale: 1, phase: "none", time: 0 }
      }
    },
    scores: {
      player1: 0,
      player2: 0,
      winning: 3
    },
    controls: {
      player1Up: false,
      player1Down: false,
      player2Up: false,
      player2Down: false
    },
    color: {
      groundColor: "#fff",
      ballColor: "#fff",
      paddleColor: "#fff"
    },
    running: false,
    countdown: 3,
    countdownActive: false,
    countdownOpacity: 1.0,
    fadingOut: false,
    lastTime: performance.now(),
    animationFrameId: null,
    aiEnabled: isAIMode,
    aiOpponent: null,
    debugMode: false,
  };

  if (state.aiEnabled && canvas) {
    state.aiOpponent = new AIOpponent(canvas.width, canvas.height);
    const difficulty = elements.difficultySelector ? 
      elements.difficultySelector.value as AIDifficulty : 'medium';
    state.aiOpponent.setDifficulty(difficulty);
  }

  function drawPaddles(): void {
    if (!ctx || !canvas) return;
    
    ctx.fillStyle = state.color.paddleColor;

    const anim1 = state.paddles.animations.player1;
    const width1 = state.paddles.width * anim1.scale;
    const height1 = state.paddles.height * anim1.scale;
    ctx.fillRect(
      3 - (width1 - state.paddles.width) / 2,
      state.paddles.player1Y - (height1 - state.paddles.height) / 2,
      width1,
      height1
    );

    const anim2 = state.paddles.animations.player2;
    const width2 = state.paddles.width * anim2.scale;
    const height2 = state.paddles.height * anim2.scale;
    ctx.fillRect(
      canvas.width - width2 - 3 - (width2 - state.paddles.width) / 2,
      state.paddles.player2Y - (height2 - state.paddles.height) / 2,
      width2,
      height2
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
  }

  function checkPaddleCollision(): void {
    if (!canvas) return;
  
    const pw = state.paddles.width;
    const ph = state.paddles.height;
    const ballRadius = state.ball.radius;
  
    const deltaTime = (performance.now() - state.lastTime) / 1000;
    
    const ballVelocityX = state.ball.speedX * deltaTime;
    const ballVelocityY = state.ball.speedY * deltaTime;
    
    const prevBallX = state.ball.x - ballVelocityX;
    const prevBallY = state.ball.y - ballVelocityY;
    
    const leftPaddleRight = pw + 3;
    const leftPaddleLeft = 3;
    
    if (state.ball.speedX < 0) {
      if ((prevBallX - ballRadius > leftPaddleRight && state.ball.x - ballRadius <= leftPaddleRight) ||
        (state.ball.x - ballRadius <= leftPaddleRight && state.ball.x + ballRadius >= leftPaddleLeft)) {

        let t = 0;
        if (Math.abs(ballVelocityX) > 0.0001) {
          t = (leftPaddleRight - (state.ball.x - ballRadius)) / ballVelocityX;
          t = Math.max(0, Math.min(1, t));
        }
        const intersectionY1 = state.ball.y - (1 - t) * ballVelocityY;
        
        const ratio = (leftPaddleRight - (state.ball.x - ballRadius)) / 
               ((prevBallX - ballRadius) - (state.ball.x - ballRadius) || 0.0001);
        const intersectionY2 = state.ball.y + (prevBallY - state.ball.y) * ratio;
        
        const intersectionY3 = state.ball.y;
        
        const paddleTop = state.paddles.player1Y - ballRadius; 
        const paddleBottom = state.paddles.player1Y + ph + ballRadius; 
        
        if ((intersectionY1 >= paddleTop && intersectionY1 <= paddleBottom) ||
          (intersectionY2 >= paddleTop && intersectionY2 <= paddleBottom) ||
          (intersectionY3 >= paddleTop && intersectionY3 <= paddleBottom)) {
          
          const ballLeft = state.ball.x - ballRadius;
          const ballRight = state.ball.x + ballRadius;
          const ballTop = state.ball.y - ballRadius;
          const ballBottom = state.ball.y + ballRadius;
          
          const paddleBoxLeft = leftPaddleLeft;
          const paddleBoxRight = leftPaddleRight;
          const paddleBoxTop = state.paddles.player1Y;
          const paddleBoxBottom = state.paddles.player1Y + ph;
          
          const overlaps = !(
            ballRight < paddleBoxLeft ||
            ballLeft > paddleBoxRight ||
            ballBottom < paddleBoxTop ||
            ballTop > paddleBoxBottom
          );
          
          if (overlaps || 
            state.ball.x - ballRadius <= leftPaddleRight || 
            Math.abs(prevBallX - ballRadius - leftPaddleRight) < Math.abs(ballVelocityX * 1.2)) {
            
            state.ball.x = leftPaddleRight + ballRadius + 1; 
            
            handlePaddleBounce("player1");
            return; 
          }
        }
      }
      
      if (state.ball.x - ballRadius < leftPaddleRight + 2 && 
        state.ball.x + ballRadius > leftPaddleLeft - 2 &&  
        state.ball.y + ballRadius > state.paddles.player1Y - 2 && 
        state.ball.y - ballRadius < state.paddles.player1Y + ph + 2) { 
        
        state.ball.x = leftPaddleRight + ballRadius + 1;
        handlePaddleBounce("player1");
        return;
      }
    }
    
    const rightPaddleLeft = canvas.width - (pw + 3);
    const rightPaddleRight = canvas.width - 3;
    
    if (state.ball.speedX > 0 && 
      ((prevBallX + ballRadius < rightPaddleLeft && state.ball.x + ballRadius >= rightPaddleLeft) ||
       (state.ball.x + ballRadius > rightPaddleLeft && state.ball.x - ballRadius < rightPaddleRight))) {
      
      let t = 0;
      if (Math.abs(ballVelocityX) > 0.0001) {
        t = (rightPaddleLeft - (state.ball.x + ballRadius)) / -ballVelocityX;
        t = Math.max(0, Math.min(1, t));
      }
      
      const intersectionY = state.ball.y - (1 - t) * ballVelocityY;
      
      if (intersectionY + ballRadius >= state.paddles.player2Y && 
        intersectionY - ballRadius <= state.paddles.player2Y + ph) {
        
        state.ball.x = rightPaddleLeft - ballRadius - 0.1;
        handlePaddleBounce("player2");
        return;
      }
      
      if (state.ball.x + ballRadius > rightPaddleLeft &&
        state.ball.x - ballRadius < rightPaddleRight &&
        state.ball.y + ballRadius > state.paddles.player2Y &&
        state.ball.y - ballRadius < state.paddles.player2Y + ph) {
        
        state.ball.x = rightPaddleLeft - ballRadius - 0.1;
        handlePaddleBounce("player2");
      }
    }
  }

  function handlePaddleBounce(player: "player1" | "player2"): void {
    state.paddles.animations[player] = {
      scale: 1.05,
      phase: "grow",
      time: 0
    };
  
    const paddleY = player === "player1" ? state.paddles.player1Y : state.paddles.player2Y;
    const paddleHeight = state.paddles.height;
    
    let relativeIntersect = (state.ball.y - (paddleY + paddleHeight/2)) / (paddleHeight/2);
    
    const isTopEdge = relativeIntersect < -0.8;
    const isBottomEdge = relativeIntersect > 0.8;
    
    relativeIntersect = Math.max(-0.8, Math.min(0.8, relativeIntersect));
    
    const bounceAngle = relativeIntersect * (Math.PI / 3.5);
  
    const randomVariation = (Math.random() * 0.1) - 0.05; 
    
    const speedMultiplier = 1.05; 
    const currentSpeed = Math.hypot(state.ball.speedX, state.ball.speedY);
    const newSpeed = Math.min(currentSpeed * speedMultiplier, state.ball.maxSpeed);
  
    if (isTopEdge || isBottomEdge) {
      const strongerVerticalComponent = 0.6; 
      const weakerHorizontalComponent = 0.8; 
      
      if (player === "player1") {
        state.ball.speedX = newSpeed * weakerHorizontalComponent;
      } else {
        state.ball.speedX = -newSpeed * weakerHorizontalComponent;
      }
      
      state.ball.speedY = (isTopEdge ? -1 : 1) * newSpeed * strongerVerticalComponent;
      
      return; 
    }
  
    if (player === "player1") {
      const minXComponent = 0.7; 
      const xComponent = Math.max(minXComponent, Math.cos(bounceAngle + randomVariation));
      state.ball.speedX = newSpeed * xComponent;
    } else {
      const minXComponent = 0.7; 
      const xComponent = Math.max(minXComponent, Math.cos(bounceAngle + randomVariation));
      state.ball.speedX = -newSpeed * xComponent;
    }
    
    let ySpeed = newSpeed * Math.sin(bounceAngle + randomVariation);
    if (Math.abs(ySpeed) < 50) { 
      ySpeed = 50 * Math.sign(ySpeed || 1);
    }
    state.ball.speedY = ySpeed;
  }

  function checkWallCollision(): void {
    if (!canvas) return;
  
    const ballRadius = state.ball.radius;
    
    if (state.ball.y - ballRadius <= 0) {
      state.ball.y = ballRadius + 1;
      
      state.ball.speedY = Math.abs(state.ball.speedY) * (1 + (Math.random() * 0.1 - 0.05));
      
      if (Math.abs(state.ball.speedY) < 50) {
        state.ball.speedY = 50 * Math.sign(state.ball.speedY);
      }
    }
    
    if (state.ball.y + ballRadius >= canvas.height) {
      state.ball.y = canvas.height - ballRadius - 1;
      
      state.ball.speedY = -Math.abs(state.ball.speedY) * (1 + (Math.random() * 0.1 - 0.05));
      
      if (Math.abs(state.ball.speedY) < 50) {
        state.ball.speedY = -50;
      }
      
      const leftCornerProximity = state.ball.x - ballRadius < 20;
      const rightCornerProximity = state.ball.x + ballRadius > canvas.width - 20;
      
      if (leftCornerProximity || rightCornerProximity) {
        if (Math.abs(state.ball.speedX) < 100) {
          state.ball.speedX = (leftCornerProximity ? 1 : -1) * 
                 (100 + Math.random() * 50);
        }
        
        state.ball.speedY = -Math.abs(state.ball.speedY) * 1.2;
      }
    }
  
    if (state.ball.x - ballRadius < 0) {
      state.scores.player2++;
      resetBall();
      updateScores();
    } 
    
    else if (state.ball.x + ballRadius > canvas.width) {
      state.scores.player1++;
      resetBall();
      updateScores();
    }
  }

  function update(deltaTime: number): void {
    if (!canvas) return;
  
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
  
    (["player1", "player2"] as const).forEach((player) => {
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
    
    if (state.controls.player1Up && state.paddles.player1Y > 5) {
      state.paddles.player1Y -= state.paddles.speed * deltaTime;
    }
    if (state.controls.player1Down && state.paddles.player1Y < canvas.height - state.paddles.height - 5) {
      state.paddles.player1Y += state.paddles.speed * deltaTime;
    }
    
    if (state.aiEnabled && state.aiOpponent) {
      const aiControls = state.aiOpponent.update(state, currentTime);
      state.controls.player2Up = aiControls.moveUp;
      state.controls.player2Down = aiControls.moveDown;
    }
    
    if (state.controls.player2Up && state.paddles.player2Y > 5) {
      state.paddles.player2Y -= state.paddles.speed * deltaTime;
    }
    if (state.controls.player2Down && state.paddles.player2Y < canvas.height - state.paddles.height - 5) {
      state.paddles.player2Y += state.paddles.speed * deltaTime;
    }
    
    state.ball.x += state.ball.speedX * deltaTime;
    state.ball.y += state.ball.speedY * deltaTime;
  
    state.lastTime = currentTime;
  
    checkWallCollision();
    checkPaddleCollision();
  
    if (state.scores.player1 >= state.scores.winning || state.scores.player2 >= state.scores.winning) {
      endGame();
    }
  }

  function setupAIModeUI(): void {
    const isAIMode = window.location.search.includes('ai=true');
    
    const titleElem = document.getElementById('game-title');
    const subtitleElem = document.getElementById('game-subtitle');
    
    if (isAIMode) {
      if (titleElem) {
        titleElem.textContent = languageService.translate('game.ai_mode.title', 'AI PONG');
        
        const badge = document.createElement('span');
        badge.className = 'ai-mode-badge';
        badge.textContent = 'AI';
        titleElem.appendChild(badge);
      }
      
      if (subtitleElem) {
        subtitleElem.textContent = languageService.translate('game.ai_mode.subtitle', 'Challenge the Computer');
      }
      
      const rulesCard = document.getElementById('rules-card');
      if (rulesCard) {
        const rulesPara = rulesCard.querySelector('p');
        if (rulesPara) {
          rulesPara.textContent = languageService.translate('game.ai_mode.description', 
            'Play against an AI opponent with multiple difficulty levels. Use precise timing and anticipate the AI\'s movements to win!');
        }
      }
      
      const controlsList = document.getElementById('controls-list');
      if (controlsList) {
        controlsList.innerHTML = `
          <div><span>${languageService.translate('game.controls_info.player1', 'Player 1')}:</span> W / S ${languageService.translate('game.controls_info.keys', 'Keys')}</div>
          <div><span>${languageService.translate('game.controls_info.player2', 'Player 2')}:</span> ↑ / ↓ ${languageService.translate('game.controls_info.arrow_keys', 'Arrow Keys')}</div>
        `;
      }
      
      const difficultyContainer = document.getElementById('difficulty-selector-container');
      if (difficultyContainer) {
        difficultyContainer.classList.remove('hidden');
      }
      
      const difficultyBtns = document.querySelectorAll('.difficulty-btn');
      difficultyBtns.forEach(btn => {
        const difficultyKey = btn.getAttribute('data-difficulty') || 'medium';
        btn.textContent = languageService.translate(`game.ai_mode.difficulty.${difficultyKey}`, 
          difficultyKey.charAt(0).toUpperCase() + difficultyKey.slice(1));
        
        btn.addEventListener('click', function(this: HTMLElement) {
          difficultyBtns.forEach(b => b.classList.remove('active'));
          
          this.classList.add('active');
          
          const difficultySelector = document.getElementById('ai-difficulty') as HTMLSelectElement;
          if (difficultySelector) {
            difficultySelector.value = this.getAttribute('data-difficulty') || 'medium';
            
            const event = new Event('change');
            difficultySelector.dispatchEvent(event);
          }
        });
      });
    } else {
      if (titleElem) {
        titleElem.textContent = languageService.translate('game.classic_pong', 'PONG');
      }
      
      if (subtitleElem) {
        subtitleElem.textContent = languageService.translate('game.original_experience', 'Classic 1v1 Experience');
      }
      
      const rulesCard = document.getElementById('rules-card');
      if (rulesCard) {
        const rulesTitle = rulesCard.querySelector('h3');
        if (rulesTitle) {
          rulesTitle.textContent = languageService.translate('game.rules', 'Game Rules');
        }
        
        const rulesPara = rulesCard.querySelector('p');
        if (rulesPara) {
          rulesPara.textContent = languageService.translate('game.rules_description', 
            'Score points by getting the ball past your opponent\'s paddle. First to reach the winning score wins!');
        }
      }
      
      const controlsList = document.getElementById('controls-list');
      if (controlsList) {
        controlsList.innerHTML = `
          <div><span>${languageService.translate('game.controls_info.player', 'Player')}:</span> W / S ${languageService.translate('game.controls_info.keys', 'Keys')}</div>
          <div><span>${languageService.translate('game.controls_info.ai_opponent', 'AI Opponent')}:</span> ${languageService.translate('game.controls_info.computer_controlled', 'Computer Controlled')}</div>
          <div class="debug-hint">${languageService.translate('game.controls_info.toggle_ai_debug', 'Press Alt+Q to toggle AI prediction visualization')}</div>
        `;
      }
    }
  }

  function resetBall(): void {
    if (!canvas) return;
    
    state.ball.x = canvas.width / 2;
    state.ball.y = canvas.height / 2;
    
    const initialSpeed = 250;
    const directionX = Math.random() > 0.5 ? 1 : -1;
    const directionY = Math.random() > 0.5 ? 1 : -1;
    
    const randomAngle = (Math.random() * 0.5 + 0.25) * (Math.PI / 3); 
    
    state.ball.speedX = directionX * initialSpeed * Math.cos(randomAngle);
    state.ball.speedY = directionY * initialSpeed * Math.sin(randomAngle);
    
    if (Math.abs(state.ball.speedX) < 100) {
      state.ball.speedX = directionX * 100;
    }
    if (Math.abs(state.ball.speedY) < 100) {
      state.ball.speedY = directionY * 100;
    }
  }

  async function endGame(): Promise<void> {
		state.running = false;
		
		let winner = null;
		if (state.scores.player1 >= state.scores.winning) {
			winner = languageService.translate('game.player1', "Player 1");
		  } else if (state.scores.player2 >= state.scores.winning) {
			winner = state.aiEnabled ? 
			  languageService.translate('game.ai_opponent', "AI Opponent") : 
			  languageService.translate('game.player2', "Player 2");
		}

		if (state.aiEnabled) {
			try {
			  const result = winner === "Player 1" ? "WIN" : "LOSS";
			  const difficulty = document.getElementsByClassName("difficulty-btn active")[0].getAttribute("data-difficulty");
			  
			  const response = await fetch('/api/game-history', {
				method: 'POST',
				headers: {
				  'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
				  opponentType: 'AI',
				  difficulty: difficulty,
				  userScore: state.scores.player1,
				  opponentScore: state.scores.player2,
				  result: result
				}),
			  });
			  
			} catch (error) {
			  console.error('Erreur lors de l\'enregistrement de la partie:', error);
			}
		  }

		  if (winner) {
			const championName = document.getElementById("pong-champion-name");
			if (championName) {
			  championName.textContent = winner;
			}
			
			const winnerTitle = document.querySelector("#pong-winner-announcement h2");
			if (winnerTitle) {
			  winnerTitle.textContent = languageService.translate('game.champion', "Champion!");
			}
			
			const newGameButton = document.getElementById("new-game-button");
			if (newGameButton) {
			  newGameButton.textContent = languageService.translate('game.new_game', "New Game");
			}
			
			const winnerAnnouncement = document.getElementById("pong-winner-announcement");
			if (winnerAnnouncement) {
			  winnerAnnouncement.classList.remove("hidden");
			}
		  } else {
			elements.menu?.classList.remove("hidden");
			elements.menu?.classList.add("show");
		  }
		  
		  resetBall();
		}

  function handleKeyDown(e: KeyboardEvent): void {
    switch (e.key) {
      case "w":
      case "W":
        state.controls.player1Up = true;
        break;
      case "s":
      case "S":
        state.controls.player1Down = true;
        break;
      case "ArrowUp":
        if (!state.aiEnabled) {
          state.controls.player2Up = true;
        }
        break;
      case "ArrowDown":
        if (!state.aiEnabled) {
          state.controls.player2Down = true;
        }
        break;
    }
  }

  function handleKeyUp(e: KeyboardEvent): void {
    switch (e.key) {
      case "w":
      case "W":
        state.controls.player1Up = false;
        break;
      case "s":
      case "S":
        state.controls.player1Down = false;
        break;
      case "ArrowUp":
        if (!state.aiEnabled) {
          state.controls.player2Up = false;
        }
        break;
      case "ArrowDown":
        if (!state.aiEnabled) {
          state.controls.player2Down = false;
        }
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
    if (!ctx || !canvas) return;

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
    elements.menu?.classList.remove("show");
    setTimeout(() => {
      elements.menu?.classList.add("hidden");
    }, 500);
    
    state.running = false;
    state.scores.player1 = 0;
    state.scores.player2 = 0;
    elements.menu?.classList.add("hidden");
    updateScores();
    resetBall();
    
    if (state.aiEnabled && state.aiOpponent && elements.difficultySelector) {
      const difficulty = elements.difficultySelector.value as AIDifficulty;
      state.aiOpponent.setDifficulty(difficulty);
    }

    state.countdown = 3;
    state.countdownActive = true;
    state.fadingOut = false;
    state.countdownOpacity = 1.0;
  }

  function gameLoop(currentTime: number): void {
    if (!ctx || !canvas) return;

    const deltaTime = (currentTime - state.lastTime) / 1000;
    state.lastTime = currentTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = state.color.groundColor;
    ctx.fillRect(canvas.width / 2 - 1, 0, 2, canvas.height);

    drawPaddles();
    drawBall();
    update(deltaTime);

    if (state.countdownActive || state.fadingOut) {
      drawCountdown();
    }
    
    if (state.debugMode) {
      drawDebug();
    }
    
    state.animationFrameId = requestAnimationFrame(gameLoop);
  }

  function openCustomMenu(): void {
    elements.menu?.classList.remove("show");
    const customMenu = document.getElementById("pong-custom-menu");
    if (customMenu) {
      customMenu.classList.remove("hidden");
      customMenu.classList.add("show");
    }

    setTimeout(() => {
      elements.menu?.classList.add("hidden");
    }, 350);

    const pongGame = document.getElementById("pong-game");
    if (pongGame) {
      pongGame.classList.remove("main-menu");
      pongGame.classList.add("pong-custom-menu-canvas");
    }
  }

  function closeCustomMenu(): void {
    const customMenu = document.getElementById("pong-custom-menu");
    if (customMenu) {
      customMenu.classList.remove("show");
      customMenu.classList.add("hidden");
    }
    
    elements.menu?.classList.remove("hidden");

    setTimeout(() => {
      elements.menu?.classList.add("show");
    }, 50);

    const pongGame = document.getElementById("pong-game");
    if (pongGame) {
      pongGame.classList.remove("pong-custom-menu-canvas");
      pongGame.classList.add("main-menu");
    }
  }

  function changeColors(event: Event): void {
    const input = event.target as HTMLInputElement;const id = input.id;
	const color = input.value;
	
	input.style.backgroundColor = color;
	
	switch (id) {
	  case "pong-ground-color":
		state.color.groundColor = color;
		document.getElementById("pongCanvas")?.style.setProperty('--ground-color', `${color}`);
		break;
	  case "pong-ball-color":
		state.color.ballColor = color;
		break;
	  case "pong-paddle-color":
		state.color.paddleColor = color;
		break;
	}}
	function sliderAnimation(event: Event): void {
	const slider = event.target as HTMLInputElement;const min = parseFloat(slider.min);
	const max = parseFloat(slider.max);
	const value = 5 + ((parseFloat(slider.value) - min) / (max - min)) * 90;
	slider.style.setProperty('--slider-track-bg', `linear-gradient(to right, #BB70AD 0%, #BB70AD ${value}%, #ffffff ${value}%)`);}
	
  function changeWinningScore(event: Event): void {
    const slider = event.target as HTMLInputElement;
    state.scores.winning = Math.floor(parseFloat(slider.value));
    const winningScoreElem = document.getElementById("pong-winning-score");
    if (winningScoreElem) {
      winningScoreElem.textContent = languageService.translate('game.winning_score', "Winning score: ") + state.scores.winning;
    }
  }

	function changeAIDifficulty(): void {
	if (state.aiEnabled && state.aiOpponent && elements.difficultySelector) {
	const difficulty = elements.difficultySelector.value as AIDifficulty;
	state.aiOpponent.setDifficulty(difficulty);
	}
	}
	function drawDebug(): void {
	if (!state.debugMode || !state.aiOpponent || !ctx) return;const predictedPath = state.aiOpponent.getPredictedPath();

	if (predictedPath.length === 0) return;
	
	ctx.beginPath();
	ctx.moveTo(predictedPath[0].x, predictedPath[0].y);
	
	for (let i = 1; i < predictedPath.length; i++) {
	  ctx.lineTo(predictedPath[i].x, predictedPath[i].y);
	}
	
	ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
	ctx.lineWidth = 2;
	ctx.stroke();
	
	if (predictedPath.length > 0) {
	  const lastPoint = predictedPath[predictedPath.length - 1];
	  ctx.beginPath();
	  ctx.arc(lastPoint.x, lastPoint.y, 5, 0, Math.PI * 2);
	  ctx.fillStyle = 'yellow';
	  ctx.fill();
	}}
	function init(): void {
	if (elements.menu) {
	elements.menu.classList.add("show");
	}document.addEventListener("keydown", handleKeyDown);
	document.addEventListener("keyup", handleKeyUp);
	elements.playButton?.addEventListener("click", startGame);
	elements.customButton?.addEventListener("click", openCustomMenu);
	elements.customBackButton?.addEventListener("click", closeCustomMenu);
	
	elements.customColorsInputs.forEach((input) => {
	  input.addEventListener("input", changeColors);
	});
	
	elements.customSliders.forEach((slider) => {
	  slider.addEventListener("input", sliderAnimation);
	});
	
	elements.winningScoreSlider?.addEventListener("input", changeWinningScore);
	
	if (state.aiEnabled && elements.difficultySelector) {
	  elements.difficultySelector.addEventListener("change", changeAIDifficulty);
	}
	
	state.animationFrameId = requestAnimationFrame(gameLoop);
	
	document.addEventListener("keydown", (e) => {
	  if (e.key === "q" && e.altKey) {
		e.preventDefault();
		state.debugMode = !state.debugMode;
	  }
	});
	
	const backButtons = [
	  document.getElementById("back-to-modes-button"),
	  document.getElementById("back-to-modes-button-winner")
	];
	
	backButtons.forEach(button => {
	  if (button) {
		button.removeEventListener("click", backToGameModes);
		button.addEventListener("click", backToGameModes);
	  }
	});
	
	const newGameButton = document.getElementById("new-game-button");
	if (newGameButton) {
	  newGameButton.addEventListener("click", () => {
		const winnerAnnouncement = document.getElementById("pong-winner-announcement");
		if (winnerAnnouncement) {
		  winnerAnnouncement.classList.add("hidden");
		}
		
		state.scores.player1 = 0;
		state.scores.player2 = 0;
		updateScores();
		startGame();
	  });
	}
	
	setupAIModeUI();}
	init();
	function cleanup(): void {
	document.removeEventListener("keydown", handleKeyDown);
	document.removeEventListener("keyup", handleKeyUp);
	elements.playButton?.removeEventListener("click", startGame);
	elements.customButton?.removeEventListener("click", openCustomMenu);
	elements.customBackButton?.removeEventListener("click", closeCustomMenu);elements.customColorsInputs.forEach((input) => {
		input.removeEventListener("input", changeColors);
	  });
	  
	  elements.customSliders.forEach((slider) => {
		slider.removeEventListener("input", sliderAnimation);
	  });
	  
	  elements.winningScoreSlider?.removeEventListener("input", changeWinningScore);
	  
	  if (state.aiEnabled && elements.difficultySelector) {
		elements.difficultySelector.removeEventListener("change", changeAIDifficulty);
	  }
	  
	  document.removeEventListener("keydown", (e) => {
		if (e.key === "q" && e.altKey) {
		  e.preventDefault();
		  state.debugMode = !state.debugMode;
		}
	  });
	  
	  if (state.animationFrameId) {
		cancelAnimationFrame(state.animationFrameId);
	  }
	  
	  const backButtons = [
		document.getElementById("back-to-modes-button"),
		document.getElementById("back-to-modes-button-winner")
	  ];
	  
	  backButtons.forEach(button => {
		if (button) {
		  button.removeEventListener("click", backToGameModes);
		}
	  });
	  
	  const newGameButton = document.getElementById("new-game-button");
	  if (newGameButton) {
		newGameButton.removeEventListener("click", () => {});
	  }}
	  return cleanup;
	  }