// This will be the entry point for the tournament mode
import "../styles/pong-game.css";
import "../styles/pong-tournament.css";

// Import the tournament implementation
export default function initializeTournamentMode() {
  // All the tournament logic is implemented in this file
  
  // Tournament player interface
  interface TournamentPlayer {
      name: string;
      score: number;
  }

  // Tournament match interface
  interface TournamentMatch {
      player1: TournamentPlayer;
      player2: TournamentPlayer;
      winner: TournamentPlayer | null;
      played: boolean;
  }

  // Ball interface (reusing from pong-game.ts)
  interface Ball {
      x: number;
      y: number;
      speedX: number;
      speedY: number;
      radius: number;
      maxSpeed: number;
  }

  // Paddle interface
  interface Paddles {
      width: number;
      height: number;
      player1Y: number;
      player2Y: number;
      speed: number;
  }

  // Controls interface
  interface Controls {
      player1Up: boolean;
      player1Down: boolean;
      player2Up: boolean;
      player2Down: boolean;
  }

  // Game state interface
  interface GameState {
      ball: Ball;
      paddles: Paddles;
      scores: {
          player1: number;
          player2: number;
          winning: number;
      };
      controls: Controls;
      running: boolean;
      countdown: number;
      countdownActive: boolean;
      lastTime: number;
      animationFrameId: number | null;
  }

  const canvas = document.getElementById("tournamentCanvas") as HTMLCanvasElement | null;
  if (!canvas) {
      console.error("Canvas not found");
      return null;
  }
  
  const ctx = canvas.getContext("2d");
  if (!ctx) {
      console.error("2D context not found");
      return null;
  }

  // UI elements
  const elements = {
      tournamentMenu: document.getElementById("tournament-menu"),
      registrationForm: document.getElementById("registration-form"),
      tournamentBracket: document.getElementById("tournament-bracket"),
      winnerAnnouncement: document.getElementById("winner-announcement"),
      startTournamentButton: document.getElementById("start-tournament-button"),
      playNextMatchButton: document.getElementById("play-next-match-button"),
      newTournamentButton: document.getElementById("new-tournament-button"),
      playerInputs: [
          document.getElementById("player1-name") as HTMLInputElement,
          document.getElementById("player2-name") as HTMLInputElement,
          document.getElementById("player3-name") as HTMLInputElement,
          document.getElementById("player4-name") as HTMLInputElement
      ],
      matchElements: {
          match1: {
              element: document.getElementById("match1"),
              player1: document.getElementById("match1-player1"),
              player2: document.getElementById("match1-player2")
          },
          match2: {
              element: document.getElementById("match2"),
              player1: document.getElementById("match2-player1"),
              player2: document.getElementById("match2-player2")
          },
          match3: {
              element: document.getElementById("match3"),
              player1: document.getElementById("match3-player1"),
              player2: document.getElementById("match3-player2")
          }
      },
      championName: document.getElementById("champion-name"),
      countdownContainer: document.getElementById("countdown-container"),
      countdown: document.getElementById("countdown"),
      score1: document.getElementById("player1-score"),
      score2: document.getElementById("player2-score"),
      currentMatch: document.getElementById("current-match")
  };

    const customizeElements = {
        customizeButton: document.getElementById("customize-button"),
        customizeMenu: document.getElementById("customize-menu"),
        backButton: document.getElementById("back-button"),
        ballColorInput: document.getElementById("ball-color") as HTMLInputElement,
        paddleColorInput: document.getElementById("paddle-color") as HTMLInputElement,
        lineColorInput: document.getElementById("line-color") as HTMLInputElement,
        pointsToWinSlider: document.getElementById("points-to-win") as HTMLInputElement,
        pointsDisplay: document.getElementById("points-display")
    };
    
    const customSettings = {
        ballColor: "#ffffff",
        paddleColor: "#ffffff",
        lineColor: "#ffffff",
        pointsToWin: 5
    };

  // Tournament state
  const tournamentState = {
      players: [] as TournamentPlayer[],
      matches: [] as TournamentMatch[],
      currentMatchIndex: 0,
      tournamentStarted: false,
      tournamentEnded: false
  };

  // Game state (reusing from pong-game.ts but simplified)
  const gameState: GameState = {
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
          speed: 300
      },
      scores: {
          player1: 0,
          player2: 0,
          winning: 5  // Points needed to win a match
      },
      controls: {
          player1Up: false,
          player1Down: false,
          player2Up: false,
          player2Down: false
      },
      running: false,
      countdown: 3,
      countdownActive: false,
      lastTime: performance.now(),
      animationFrameId: null
  };

  // Initialize tournament
  function initTournament(): void {
      // Get player names from inputs
      const playerNames = elements.playerInputs.map(input => 
          input.value.trim() === "" ? `Player ${elements.playerInputs.indexOf(input) + 1}` : input.value.trim()
      );

      // Create tournament players
      tournamentState.players = playerNames.map(name => ({
          name,
          score: 0
      }));

      // Create tournament matches
      tournamentState.matches = [
          // Semi-final 1
          {
              player1: tournamentState.players[0],
              player2: tournamentState.players[1],
              winner: null,
              played: false
          },
          // Semi-final 2
          {
              player1: tournamentState.players[2],
              player2: tournamentState.players[3],
              winner: null,
              played: false
          },
          // Final - players will be set after semi-finals
          {
              player1: {} as TournamentPlayer,
              player2: {} as TournamentPlayer,
              winner: null,
              played: false
          }
      ];

      // Update bracket display
      updateBracketDisplay();

      // Show tournament bracket
      elements.registrationForm?.classList.add("hidden");
      elements.tournamentBracket?.classList.remove("hidden");

      tournamentState.tournamentStarted = true;
      tournamentState.currentMatchIndex = 0;
  }

  // Update the tournament bracket display
  function updateBracketDisplay(): void {
      // Update semi-final 1
      if (elements.matchElements.match1.player1) {
          elements.matchElements.match1.player1.textContent = tournamentState.matches[0].player1.name;
      }
      if (elements.matchElements.match1.player2) {
          elements.matchElements.match1.player2.textContent = tournamentState.matches[0].player2.name;
      }

      // Update semi-final 2
      if (elements.matchElements.match2.player1) {
          elements.matchElements.match2.player1.textContent = tournamentState.matches[1].player1.name;
      }
      if (elements.matchElements.match2.player2) {
          elements.matchElements.match2.player2.textContent = tournamentState.matches[1].player2.name;
      }

      // Update final
      if (tournamentState.matches[0].winner && tournamentState.matches[1].winner) {
          if (elements.matchElements.match3.player1) {
              elements.matchElements.match3.player1.textContent = tournamentState.matches[0].winner.name;
          }
          if (elements.matchElements.match3.player2) {
              elements.matchElements.match3.player2.textContent = tournamentState.matches[1].winner.name;
          }
      }

      // Add winner class to won matches
      for (let i = 0; i < tournamentState.matches.length; i++) {
          const match = tournamentState.matches[i];
          if (match.played && match.winner) {
              // Match 1
              if (i === 0) {
                  if (match.winner === match.player1) {
                      elements.matchElements.match1.player1?.classList.add("winner");
                      elements.matchElements.match1.player2?.classList.remove("winner");
                  } else {
                      elements.matchElements.match1.player2?.classList.add("winner");
                      elements.matchElements.match1.player1?.classList.remove("winner");
                  }
              }
              // Match 2
              else if (i === 1) {
                  if (match.winner === match.player1) {
                      elements.matchElements.match2.player1?.classList.add("winner");
                      elements.matchElements.match2.player2?.classList.remove("winner");
                  } else {
                      elements.matchElements.match2.player2?.classList.add("winner");
                      elements.matchElements.match2.player1?.classList.remove("winner");
                  }
              }
              // Final
              else if (i === 2) {
                  if (match.winner === match.player1) {
                      elements.matchElements.match3.player1?.classList.add("winner");
                      elements.matchElements.match3.player2?.classList.remove("winner");
                  } else {
                      elements.matchElements.match3.player2?.classList.add("winner");
                      elements.matchElements.match3.player1?.classList.remove("winner");
                  }
              }
          }
      }

      // Highlight current match
      const allMatchElements = [
          elements.matchElements.match1.element,
          elements.matchElements.match2.element,
          elements.matchElements.match3.element
      ];
      
      allMatchElements.forEach(element => {
          element?.classList.remove("current-match");
      });

      if (tournamentState.currentMatchIndex < tournamentState.matches.length) {
          allMatchElements[tournamentState.currentMatchIndex]?.classList.add("current-match");
      }
  }

  // Play next match
  function playNextMatch(): void {
      if (tournamentState.currentMatchIndex >= tournamentState.matches.length) {
          endTournament();
          return;
      }

      const currentMatch = tournamentState.matches[tournamentState.currentMatchIndex];
      
      // If this is the final, set up the players
      if (tournamentState.currentMatchIndex === 2) {
          currentMatch.player1 = tournamentState.matches[0].winner!;
          currentMatch.player2 = tournamentState.matches[1].winner!;
          updateBracketDisplay();
      }

      // Set up the game
      gameState.scores.player1 = 0;
      gameState.scores.player2 = 0;
      
      // Hide tournament menu
      elements.tournamentMenu?.classList.add("hidden");
      
      // Update scoreboard with player names
      if (elements.score1) {
          elements.score1.textContent = "0";
      }
      if (elements.score2) {
          elements.score2.textContent = "0";
      }
      if (elements.currentMatch) {
          let matchName = "Semi-Final 1";
          if (tournamentState.currentMatchIndex === 1) {
              matchName = "Semi-Final 2";
          } else if (tournamentState.currentMatchIndex === 2) {
              matchName = "Final";
          }
          elements.currentMatch.textContent = `${matchName}: ${currentMatch.player1.name} vs ${currentMatch.player2.name}`;
      }

      // Start countdown
      startCountdown();
  }

    function openCustomizeMenu(): void {
        elements.registrationForm?.classList.add("hidden");
        customizeElements.customizeMenu?.classList.remove("hidden");
    }

    function closeCustomizeMenu(): void {
        customizeElements.customizeMenu?.classList.add("hidden");
        elements.registrationForm?.classList.remove("hidden");
    }

    function updateCustomSettings(): void {
        if (customizeElements.ballColorInput) {
            customSettings.ballColor = customizeElements.ballColorInput.value;
        }
        if (customizeElements.paddleColorInput) {
            customSettings.paddleColor = customizeElements.paddleColorInput.value;
        }
        if (customizeElements.lineColorInput) {
            customSettings.lineColor = customizeElements.lineColorInput.value;
        }
        if (customizeElements.pointsToWinSlider) {
            customSettings.pointsToWin = parseInt(customizeElements.pointsToWinSlider.value);
            gameState.scores.winning = customSettings.pointsToWin;
        }
        if (customizeElements.pointsDisplay) {
            customizeElements.pointsDisplay.textContent = `${customSettings.pointsToWin} points`;
        }
    }
    
    function applyCustomSettings(): void {
    // Les couleurs seront appliquées dans les fonctions de dessin
    }

  // Start countdown before match
  function startCountdown(): void {
      gameState.countdown = 3;
      gameState.countdownActive = true;
      
      if (elements.countdownContainer) {
          elements.countdownContainer.classList.remove("hidden");
      }
      if (elements.countdown) {
          elements.countdown.textContent = gameState.countdown.toString();
      }
      
      const countdownInterval = setInterval(() => {
          gameState.countdown--;
          
          if (elements.countdown) {
              elements.countdown.textContent = gameState.countdown.toString();
          }
          
          if (gameState.countdown <= 0) {
              clearInterval(countdownInterval);
              gameState.countdownActive = false;
              
              if (elements.countdownContainer) {
                  elements.countdownContainer.classList.add("hidden");
              }
              
              startMatch();
          }
      }, 1000);
  }

  // Start the current match
  function startMatch(): void {
      resetBall();
      gameState.running = true;
      gameState.lastTime = performance.now();
      
      if (gameState.animationFrameId !== null) {
          cancelAnimationFrame(gameState.animationFrameId);
      }
      
      gameState.animationFrameId = requestAnimationFrame(gameLoop);
  }

  // End the current match
  function endMatch(winner: number): void {
      gameState.running = false;
      
      const currentMatch = tournamentState.matches[tournamentState.currentMatchIndex];
      currentMatch.played = true;
      
      // Set the winner
      if (winner === 1) {
          currentMatch.winner = currentMatch.player1;
      } else {
          currentMatch.winner = currentMatch.player2;
      }
      
      // Move to next match
      tournamentState.currentMatchIndex++;
      
      // Show tournament menu
      elements.tournamentMenu?.classList.remove("hidden");
      
      // Update bracket display
      updateBracketDisplay();
      
      // Check if tournament is over
      if (tournamentState.currentMatchIndex >= tournamentState.matches.length) {
          endTournament();
      } else {
          // Enable play next match button
          if (elements.playNextMatchButton) {
              elements.playNextMatchButton.disabled = false;
          }
      }
  }

  // End the tournament
  function endTournament(): void {
      tournamentState.tournamentEnded = true;
      
      // Show winner announcement
      elements.tournamentBracket?.classList.add("hidden");
      elements.winnerAnnouncement?.classList.remove("hidden");
      
      // Set champion name
      if (elements.championName) {
          const finalMatch = tournamentState.matches[2];
          elements.championName.textContent = finalMatch.winner?.name || "Unknown";
      }
  }

  // Reset the tournament
  function resetTournament(): void {
      tournamentState.players = [];
      tournamentState.matches = [];
      tournamentState.currentMatchIndex = 0;
      tournamentState.tournamentStarted = false;
      tournamentState.tournamentEnded = false;
      
      // Reset input fields
      elements.playerInputs.forEach(input => {
          input.value = "";
      });
      
      // Remove winner classes
      elements.matchElements.match1.player1?.classList.remove("winner");
      elements.matchElements.match1.player2?.classList.remove("winner");
      elements.matchElements.match2.player1?.classList.remove("winner");
      elements.matchElements.match2.player2?.classList.remove("winner");
      elements.matchElements.match3.player1?.classList.remove("winner");
      elements.matchElements.match3.player2?.classList.remove("winner");
      
      // Show registration form
      elements.winnerAnnouncement?.classList.add("hidden");
      elements.tournamentBracket?.classList.add("hidden");
      elements.registrationForm?.classList.remove("hidden");
  }

  // Game loop
  function gameLoop(currentTime: number): void {
      if (!ctx || !canvas) return;
      
      const deltaTime = (currentTime - gameState.lastTime) / 1000;
      gameState.lastTime = currentTime;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = customSettings.lineColor;
      ctx.fillRect(canvas.width / 2 - 1, 0, 2, canvas.height);
      
      // Update game
      if (gameState.running) {
          updatePaddles(deltaTime);
          updateBall(deltaTime);
          checkCollisions();
          
          // Check for win condition
          if (gameState.scores.player1 >= gameState.scores.winning) {
              endMatch(1);
              return;
          } else if (gameState.scores.player2 >= gameState.scores.winning) {
              endMatch(2);
              return;
          }
      }
      
      // Draw game elements
      drawPaddles();
      drawBall();
      
      // Request next frame
      gameState.animationFrameId = requestAnimationFrame(gameLoop);
  }
  
  // Update paddles based on controls
  function updatePaddles(deltaTime: number): void {
      const paddleSpeed = gameState.paddles.speed * deltaTime;
      
      // Player 1 controls (W/S keys)
      if (gameState.controls.player1Up && gameState.paddles.player1Y > 0) {
          gameState.paddles.player1Y -= paddleSpeed;
      }
      if (gameState.controls.player1Down && gameState.paddles.player1Y < canvas.height - gameState.paddles.height) {
          gameState.paddles.player1Y += paddleSpeed;
      }
      
      // Player 2 controls (Arrow keys)
      if (gameState.controls.player2Up && gameState.paddles.player2Y > 0) {
          gameState.paddles.player2Y -= paddleSpeed;
      }
      if (gameState.controls.player2Down && gameState.paddles.player2Y < canvas.height - gameState.paddles.height) {
          gameState.paddles.player2Y += paddleSpeed;
      }
  }
  
  // Update ball position
  function updateBall(deltaTime: number): void {
      gameState.ball.x += gameState.ball.speedX * deltaTime;
      gameState.ball.y += gameState.ball.speedY * deltaTime;
  }
  
  // Check for collisions
  function checkCollisions(): void {
    // Ball radius
    const radius = gameState.ball.radius;
    
    // Wall collisions (top/bottom)
    if (gameState.ball.y - radius <= 0) {
        gameState.ball.y = radius; // Ensure the ball doesn't get stuck
        gameState.ball.speedY = Math.abs(gameState.ball.speedY);
    } else if (gameState.ball.y + radius >= canvas.height) {
        gameState.ball.y = canvas.height - radius; // Ensure the ball doesn't get stuck
        gameState.ball.speedY = -Math.abs(gameState.ball.speedY);
    }
    
    // Paddle collisions with improved detection
    const paddleWidth = gameState.paddles.width;
    const paddleHeight = gameState.paddles.height;
    
    // Left paddle (Player 1)
    if (gameState.ball.speedX < 0 && // Ball is moving left
        gameState.ball.x - radius <= paddleWidth && 
        gameState.ball.x + radius >= 0 && // Added to prevent sticking
        gameState.ball.y >= gameState.paddles.player1Y && 
        gameState.ball.y <= gameState.paddles.player1Y + paddleHeight) {
        
        // Push ball outside paddle to prevent sticking
        gameState.ball.x = paddleWidth + radius;
        
        // Reflect speed
        gameState.ball.speedX = Math.abs(gameState.ball.speedX);
        
        // Add angle based on where ball hits paddle
        const hitPosition = (gameState.ball.y - gameState.paddles.player1Y) / paddleHeight;
        gameState.ball.speedY += (hitPosition - 0.5) * gameState.ball.speedX * 1.5;
        
        // Limit max vertical speed
        const maxVerticalSpeed = gameState.ball.maxSpeed * 0.8;
        if (Math.abs(gameState.ball.speedY) > maxVerticalSpeed) {
            gameState.ball.speedY = Math.sign(gameState.ball.speedY) * maxVerticalSpeed;
        }
        
        // Slightly increase speed to make game more challenging
        const speedMultiplier = 1.05;
        const currentSpeed = Math.sqrt(gameState.ball.speedX * gameState.ball.speedX + gameState.ball.speedY * gameState.ball.speedY);
        const newSpeed = Math.min(currentSpeed * speedMultiplier, gameState.ball.maxSpeed);
        const angle = Math.atan2(gameState.ball.speedY, gameState.ball.speedX);
        gameState.ball.speedX = Math.cos(angle) * newSpeed;
        gameState.ball.speedY = Math.sin(angle) * newSpeed;
    }
    
    // Right paddle (Player 2)
    if (gameState.ball.speedX > 0 && // Ball is moving right
        gameState.ball.x + radius >= canvas.width - paddleWidth && 
        gameState.ball.x - radius <= canvas.width && // Added to prevent sticking
        gameState.ball.y >= gameState.paddles.player2Y && 
        gameState.ball.y <= gameState.paddles.player2Y + paddleHeight) {
        
        // Push ball outside paddle to prevent sticking
        gameState.ball.x = canvas.width - paddleWidth - radius;
        
        // Reflect speed
        gameState.ball.speedX = -Math.abs(gameState.ball.speedX);
        
        // Add angle based on where ball hits paddle
        const hitPosition = (gameState.ball.y - gameState.paddles.player2Y) / paddleHeight;
        gameState.ball.speedY += (hitPosition - 0.5) * -gameState.ball.speedX * 1.5;
        
        // Limit max vertical speed
        const maxVerticalSpeed = gameState.ball.maxSpeed * 0.8;
        if (Math.abs(gameState.ball.speedY) > maxVerticalSpeed) {
            gameState.ball.speedY = Math.sign(gameState.ball.speedY) * maxVerticalSpeed;
        }
        
        // Slightly increase speed to make game more challenging
        const speedMultiplier = 1.05;
        const currentSpeed = Math.sqrt(gameState.ball.speedX * gameState.ball.speedX + gameState.ball.speedY * gameState.ball.speedY);
        const newSpeed = Math.min(currentSpeed * speedMultiplier, gameState.ball.maxSpeed);
        const angle = Math.atan2(gameState.ball.speedY, gameState.ball.speedX);
        gameState.ball.speedX = Math.cos(angle) * newSpeed;
        gameState.ball.speedY = Math.sin(angle) * newSpeed;
    }
    
    // Score (ball goes out of bounds on left/right)
    if (gameState.ball.x - radius <= 0) {
        // Player 2 scores
        gameState.scores.player2++;
        updateScoreboard();
        resetBall();
    } else if (gameState.ball.x + radius >= canvas.width) {
        // Player 1 scores
        gameState.scores.player1++;
        updateScoreboard();
        resetBall();
    }
}
  
    // Remplacer la fonction resetBall dans pong-tournament.ts

    function resetBall(): void {
        // Position au centre
        gameState.ball.x = canvas.width / 2;
        gameState.ball.y = canvas.height / 2;
        
        // Direction aléatoire mais plus contrôlée
        // Angle entre -45° et 45° (±π/4)
        const maxAngle = Math.PI / 4;
        const angle = (Math.random() * maxAngle * 2 - maxAngle);
        
        // Direction horizontale aléatoire (gauche ou droite)
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        // Vitesse initiale constante
        const initialSpeed = 300;
        
        // Calcul des composantes de vitesse
        gameState.ball.speedX = direction * initialSpeed * Math.cos(angle);
        gameState.ball.speedY = initialSpeed * Math.sin(angle);
        
        // Ajout d'une petite pause avant de repartir (optionnel)
        if (gameState.running) {
            gameState.running = false;
            setTimeout(() => {
                if (!gameState.countdownActive) {
                    gameState.running = true;
                }
            }, 500);
        }
    }
  
    function drawPaddles(): void {
        if (!ctx) return;
        
        // Left paddle (Player 1)
        ctx.fillStyle = customSettings.paddleColor;
        ctx.fillRect(0, gameState.paddles.player1Y, gameState.paddles.width, gameState.paddles.height);
        
        // Right paddle (Player 2)
        ctx.fillRect(
            canvas.width - gameState.paddles.width,
            gameState.paddles.player2Y,
            gameState.paddles.width,
            gameState.paddles.height
        );
    }
  
  function drawBall(): void {
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = customSettings.ballColor;
    ctx.fill();
}
  
  // Update scoreboard
  function updateScoreboard(): void {
      if (elements.score1) {
          elements.score1.textContent = gameState.scores.player1.toString();
      }
      if (elements.score2) {
          elements.score2.textContent = gameState.scores.player2.toString();
      }
  }
  
  // Event handlers
  function handleKeyDown(e: KeyboardEvent): void {
      switch (e.key) {
          case "w":
          case "W":
              gameState.controls.player1Up = true;
              break;
          case "s":
          case "S":
              gameState.controls.player1Down = true;
              break;
          case "ArrowUp":
              gameState.controls.player2Up = true;
              break;
          case "ArrowDown":
              gameState.controls.player2Down = true;
              break;
      }
  }
  
  function handleKeyUp(e: KeyboardEvent): void {
      switch (e.key) {
          case "w":
          case "W":
              gameState.controls.player1Up = false;
              break;
          case "s":
          case "S":
              gameState.controls.player1Down = false;
              break;
          case "ArrowUp":
              gameState.controls.player2Up = false;
              break;
          case "ArrowDown":
              gameState.controls.player2Down = false;
              break;
      }
  }

    function initCustomization(): void {
        customizeElements.customizeButton?.addEventListener("click", openCustomizeMenu);
        customizeElements.backButton?.addEventListener("click", closeCustomizeMenu);
        
        // Écouteurs pour les changements de couleur
        customizeElements.ballColorInput?.addEventListener("input", () => {
            updateCustomSettings();
        });
        
        customizeElements.paddleColorInput?.addEventListener("input", () => {
            updateCustomSettings();
        });
        
        customizeElements.lineColorInput?.addEventListener("input", () => {
            updateCustomSettings();
        });
        
        // Écouteur pour le changement de points
        customizeElements.pointsToWinSlider?.addEventListener("input", () => {
            updateCustomSettings();
        });
    }
  
  // Initialize game and tournament
  function init(): void {
      // Add event listeners
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
      
      // Button event listeners
      elements.startTournamentButton?.addEventListener("click", initTournament);
      elements.playNextMatchButton?.addEventListener("click", playNextMatch);
      elements.newTournamentButton?.addEventListener("click", resetTournament);
      
      // Set default usernames
      elements.playerInputs[0].value = "Player 1";
      elements.playerInputs[1].value = "Player 2";
      elements.playerInputs[2].value = "Player 3";
      elements.playerInputs[3].value = "Player 4";

      initCustomization();
    
    // Initialiser les valeurs par défaut
    if (customizeElements.ballColorInput) {
        customizeElements.ballColorInput.value = customSettings.ballColor;
    }
    if (customizeElements.paddleColorInput) {
        customizeElements.paddleColorInput.value = customSettings.paddleColor;
    }
    if (customizeElements.lineColorInput) {
        customizeElements.lineColorInput.value = customSettings.lineColor;
    }
    if (customizeElements.pointsToWinSlider) {
        customizeElements.pointsToWinSlider.value = customSettings.pointsToWin.toString();
    }
    updateCustomSettings();
  }
  
  // Call init to set up the tournament
  init();
  
  // Cleanup function for router
  return function cleanup(): void {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      
      elements.startTournamentButton?.removeEventListener("click", initTournament);
      elements.playNextMatchButton?.removeEventListener("click", playNextMatch);
      elements.newTournamentButton?.removeEventListener("click", resetTournament);
      
      if (gameState.animationFrameId !== null) {
          cancelAnimationFrame(gameState.animationFrameId);
      }
      customizeElements.customizeButton?.removeEventListener("click", openCustomizeMenu);
    customizeElements.backButton?.removeEventListener("click", closeCustomizeMenu);
    customizeElements.ballColorInput?.removeEventListener("input", updateCustomSettings);
    customizeElements.paddleColorInput?.removeEventListener("input", updateCustomSettings);
    customizeElements.lineColorInput?.removeEventListener("input", updateCustomSettings);
    customizeElements.pointsToWinSlider?.removeEventListener("input", updateCustomSettings);
  };
}