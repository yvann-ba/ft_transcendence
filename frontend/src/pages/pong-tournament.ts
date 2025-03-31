import "../styles/pong-game.css";
import "../styles/pong-tournament.css";
import { languageService } from "../utils/languageContext";
import { navigate } from "../router";

export default function initializeTournamentMode() {
  interface TournamentPlayer {
      name: string;
      score: number;
  }
  interface TournamentMatch {
      player1: TournamentPlayer;
      player2: TournamentPlayer;
      winner: TournamentPlayer | null;
      played: boolean;
  }
  interface Ball {
      x: number;
      y: number;
      speedX: number;
      speedY: number;
      radius: number;
      maxSpeed: number;
  }
  interface Paddles {
      width: number;
      height: number;
      player1Y: number;
      player2Y: number;
      speed: number;
  }
  interface Controls {
      player1Up: boolean;
      player1Down: boolean;
      player2Up: boolean;
      player2Down: boolean;
  }
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

  function updatePageTranslations(): void {
    // Translate all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        element.textContent = languageService.translate(key);
      }
    });
    
    // Update input placeholders
    const inputs = document.querySelectorAll('[data-i18n-placeholder]');
    inputs.forEach(input => {
      const key = input.getAttribute('data-i18n-placeholder');
      if (key) {
        (input as HTMLInputElement).placeholder = languageService.translate(key);
      }
    });
    
    // Get player input fields directly
    const player1Input = document.getElementById("player1-name") as HTMLInputElement;
    const player2Input = document.getElementById("player2-name") as HTMLInputElement;
    const player3Input = document.getElementById("player3-name") as HTMLInputElement;
    const player4Input = document.getElementById("player4-name") as HTMLInputElement;
    
    // Update default values if they match any of the standard translations
    if (player1Input && (player1Input.value === "Player 1" || player1Input.value === "Joueur 1" || player1Input.value === "Jugador 1")) {
      player1Input.value = languageService.translate("game.tournament_mode.default_player1", "Player 1");
    }
    
    if (player2Input && (player2Input.value === "Player 2" || player2Input.value === "Joueur 2" || player2Input.value === "Jugador 2")) {
      player2Input.value = languageService.translate("game.tournament_mode.default_player2", "Player 2");
    }
    
    if (player3Input && (player3Input.value === "Player 3" || player3Input.value === "Joueur 3" || player3Input.value === "Jugador 3")) {
      player3Input.value = languageService.translate("game.tournament_mode.default_player3", "Player 3");
    }
    
    if (player4Input && (player4Input.value === "Player 4" || player4Input.value === "Joueur 4" || player4Input.value === "Jugador 4")) {
      player4Input.value = languageService.translate("game.tournament_mode.default_player4", "Player 4");
    }
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
        pointsToWin: 3
    };
  const tournamentState = {
      players: [] as TournamentPlayer[],
      matches: [] as TournamentMatch[],
      currentMatchIndex: 0,
      tournamentStarted: false,
      tournamentEnded: false
  };
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
          winning: 3
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
  function initTournament(): void {
      const playerNames = elements.playerInputs.map(input => 
          input.value.trim() === "" ? `Player ${elements.playerInputs.indexOf(input) + 1}` : input.value.trim()
      );
      tournamentState.players = playerNames.map(name => ({
          name,
          score: 0
      }));
      tournamentState.matches = [
          {
              player1: tournamentState.players[0],
              player2: tournamentState.players[1],
              winner: null,
              played: false
          },
          {
              player1: tournamentState.players[2],
              player2: tournamentState.players[3],
              winner: null,
              played: false
          },
          {
              player1: {} as TournamentPlayer,
              player2: {} as TournamentPlayer,
              winner: null,
              played: false
          }
      ];
      updateBracketDisplay();
      elements.registrationForm?.classList.add("hidden");
      elements.tournamentBracket?.classList.remove("hidden");

      tournamentState.tournamentStarted = true;
      tournamentState.currentMatchIndex = 0;
  }
  function endTournament(): void {
    tournamentState.tournamentEnded = true;
    elements.tournamentBracket?.classList.add("hidden");
    elements.winnerAnnouncement?.classList.remove("hidden");
    
    // Get the champion (winner of the final match)
    const champion = tournamentState.matches[2].winner;
    
    if (elements.championName && champion) {
        elements.championName.textContent = champion.name;
    }
}
  function updateBracketDisplay(): void {
      if (elements.matchElements.match1.player1) {
          elements.matchElements.match1.player1.textContent = tournamentState.matches[0].player1.name;
      }
      if (elements.matchElements.match1.player2) {
          elements.matchElements.match1.player2.textContent = tournamentState.matches[0].player2.name;
      }
      if (elements.matchElements.match2.player1) {
          elements.matchElements.match2.player1.textContent = tournamentState.matches[1].player1.name;
      }
      if (elements.matchElements.match2.player2) {
          elements.matchElements.match2.player2.textContent = tournamentState.matches[1].player2.name;
      }
      if (tournamentState.matches[0].winner && tournamentState.matches[1].winner) {
          if (elements.matchElements.match3.player1) {
              elements.matchElements.match3.player1.textContent = tournamentState.matches[0].winner.name;
          }
          if (elements.matchElements.match3.player2) {
              elements.matchElements.match3.player2.textContent = tournamentState.matches[1].winner.name;
          }
      }
      for (let i = 0; i < tournamentState.matches.length; i++) {
          const match = tournamentState.matches[i];
          if (match.played && match.winner) {
              if (i === 0) {
                  if (match.winner === match.player1) {
                      elements.matchElements.match1.player1?.classList.add("winner");
                      elements.matchElements.match1.player2?.classList.remove("winner");
                  } else {
                      elements.matchElements.match1.player2?.classList.add("winner");
                      elements.matchElements.match1.player1?.classList.remove("winner");
                  }
              }
              else if (i === 1) {
                  if (match.winner === match.player1) {
                      elements.matchElements.match2.player1?.classList.add("winner");
                      elements.matchElements.match2.player2?.classList.remove("winner");
                  } else {
                      elements.matchElements.match2.player2?.classList.add("winner");
                      elements.matchElements.match2.player1?.classList.remove("winner");
                  }
              }
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
  function playNextMatch(): void {
      if (tournamentState.currentMatchIndex >= tournamentState.matches.length) {
          endTournament();
          return;
      }

      const currentMatch = tournamentState.matches[tournamentState.currentMatchIndex];
      if (tournamentState.currentMatchIndex === 2) {
          currentMatch.player1 = tournamentState.matches[0].winner!;
          currentMatch.player2 = tournamentState.matches[1].winner!;
          updateBracketDisplay();
      }
      gameState.scores.player1 = 0;
      gameState.scores.player2 = 0;
      elements.tournamentMenu?.classList.add("hidden");
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
      startCountdown();
  }
    function resetBall(): void {
        if (canvas) {
            gameState.ball.x = canvas.width / 2;
            gameState.ball.y = canvas.height / 2;
        }
        const maxAngle = Math.PI / 4;
        const angle = (Math.random() * maxAngle * 2 - maxAngle);
        const direction = Math.random() > 0.5 ? 1 : -1;
        const initialSpeed = 300;
        gameState.ball.speedX = direction * initialSpeed * Math.cos(angle);
        gameState.ball.speedY = initialSpeed * Math.sin(angle);
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
        ctx.fillStyle = customSettings.paddleColor;
        ctx.fillRect(0, gameState.paddles.player1Y, gameState.paddles.width, gameState.paddles.height);
        if (canvas) {
            ctx.fillRect(
                canvas.width - gameState.paddles.width,
                gameState.paddles.player2Y,
                gameState.paddles.width,
                gameState.paddles.height
            );
        }
    }

    function drawBall(): void {
        if (!ctx) return;
        
        ctx.beginPath();
        ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = customSettings.ballColor;
        ctx.fill();
    }
  function openCustomMenu(): void {
    // Hide registration form without removing from DOM
    elements.registrationForm?.classList.add("hidden");
    
    // Show customize menu
    customizeElements.customizeMenu?.classList.remove("hidden");
    
    // This ensures the tournament mode title doesn't show behind the customize menu
    const gameTitle = document.querySelector('.game-title-container');
    if (gameTitle) {
        (gameTitle as HTMLElement).style.display = 'none';
    }
}
function closeCustomMenu(): void {
    // Hide customize menu
    customizeElements.customizeMenu?.classList.add("hidden");
    
    // Show registration form again
    elements.registrationForm?.classList.remove("hidden");
    
    // Restore title
    const gameTitle = document.querySelector('.game-title-container');
    if (gameTitle) {
        (gameTitle as HTMLElement).style.display = '';
    }
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
            customizeElements.pointsDisplay.textContent = `Winning score: ${customSettings.pointsToWin}`;
        }
    }
    
    function applyCustomSettings(): void {
    }
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
  function startMatch(): void {
      resetBall();
      gameState.running = true;
      gameState.lastTime = performance.now();
      
      if (gameState.animationFrameId !== null) {
          cancelAnimationFrame(gameState.animationFrameId);
      }
      
      gameState.animationFrameId = requestAnimationFrame(gameLoop);
  }
  function endMatch(winner: number): void {
      gameState.running = false;
      
      const currentMatch = tournamentState.matches[tournamentState.currentMatchIndex];
      currentMatch.played = true;
      if (winner === 1) {
          currentMatch.winner = currentMatch.player1;
      } else {
          currentMatch.winner = currentMatch.player2;
      }
      tournamentState.currentMatchIndex++;
      elements.tournamentMenu?.classList.remove("hidden");
      updateBracketDisplay();
      if (tournamentState.currentMatchIndex >= tournamentState.matches.length) {
          endTournament();
      } else {
          if (elements.playNextMatchButton) {
            (elements.playNextMatchButton as HTMLButtonElement).disabled = false;
        }
      }
  }

  function backToGameModes(event?: Event): void {
    navigate("/pong-selection");
  }
  function resetTournament(): void {
      tournamentState.players = [];
      tournamentState.matches = [];
      tournamentState.currentMatchIndex = 0;
      tournamentState.tournamentStarted = false;
      tournamentState.tournamentEnded = false;
      elements.playerInputs.forEach(input => {
          input.value = "";
      });
      elements.matchElements.match1.player1?.classList.remove("winner");
      elements.matchElements.match1.player2?.classList.remove("winner");
      elements.matchElements.match2.player1?.classList.remove("winner");
      elements.matchElements.match2.player2?.classList.remove("winner");
      elements.matchElements.match3.player1?.classList.remove("winner");
      elements.matchElements.match3.player2?.classList.remove("winner");
      elements.winnerAnnouncement?.classList.add("hidden");
      elements.tournamentBracket?.classList.add("hidden");
      elements.registrationForm?.classList.remove("hidden");
  }
  function gameLoop(currentTime: number): void {
      if (!ctx || !canvas) return;
      
      const deltaTime = (currentTime - gameState.lastTime) / 1000;
      gameState.lastTime = currentTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = customSettings.lineColor;
      ctx.fillRect(canvas.width / 2 - 1, 0, 2, canvas.height);
      if (gameState.running) {
          updatePaddles(deltaTime);
          updateBall(deltaTime);
          checkCollisions();
          if (gameState.scores.player1 >= gameState.scores.winning) {
              endMatch(1);
              return;
          } else if (gameState.scores.player2 >= gameState.scores.winning) {
              endMatch(2);
              return;
          }
      }
      drawPaddles();
      drawBall();
      gameState.animationFrameId = requestAnimationFrame(gameLoop);
  }
  
    function sliderAnimation(event: Event): void {
        const slider = event.target as HTMLInputElement;
        
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const value = 5 + ((parseFloat(slider.value) - min) / (max - min)) * 90;
        slider.style.setProperty('--slider-track-bg', `linear-gradient(to right, #BB70AD 0%, #BB70AD ${value}%, #ffffff ${value}%)`);
    }
  function updatePaddles(deltaTime: number): void {
      const paddleSpeed = gameState.paddles.speed * deltaTime;
      if (gameState.controls.player1Up && gameState.paddles.player1Y > 0) {
          gameState.paddles.player1Y -= paddleSpeed;
      }
      if (gameState.controls.player1Down && canvas && gameState.paddles.player1Y < canvas.height - gameState.paddles.height) {
        gameState.paddles.player1Y += paddleSpeed;
      }
      if (gameState.controls.player2Up && gameState.paddles.player2Y > 0) {
          gameState.paddles.player2Y -= paddleSpeed;
      }
      if (gameState.controls.player2Down && canvas && gameState.paddles.player2Y < canvas.height - gameState.paddles.height) {
        gameState.paddles.player2Y += paddleSpeed;
      }
  }
  function updateBall(deltaTime: number): void {
      gameState.ball.x += gameState.ball.speedX * deltaTime;
      gameState.ball.y += gameState.ball.speedY * deltaTime;
  }

  
    function checkCollisions(): void {
        const radius = gameState.ball.radius;
        if (gameState.ball.y - radius <= 0) {
            gameState.ball.y = radius;
            gameState.ball.speedY = Math.abs(gameState.ball.speedY);
        } if (canvas && gameState.ball.y + radius >= canvas.height) {
            gameState.ball.y = canvas.height - radius;
            gameState.ball.speedY = -Math.abs(gameState.ball.speedY);
        }
        const paddleWidth = gameState.paddles.width;
        const paddleHeight = gameState.paddles.height;
        if (gameState.ball.speedX < 0 &&
            gameState.ball.x - radius <= paddleWidth && 
            gameState.ball.x + radius >= 0 &&
            gameState.ball.y >= gameState.paddles.player1Y && 
            gameState.ball.y <= gameState.paddles.player1Y + paddleHeight) {
            gameState.ball.x = paddleWidth + radius;
            gameState.ball.speedX = Math.abs(gameState.ball.speedX);
            const hitPosition = (gameState.ball.y - gameState.paddles.player1Y) / paddleHeight;
            gameState.ball.speedY += (hitPosition - 0.5) * gameState.ball.speedX * 1.5;
            const maxVerticalSpeed = gameState.ball.maxSpeed * 0.8;
            if (Math.abs(gameState.ball.speedY) > maxVerticalSpeed) {
                gameState.ball.speedY = Math.sign(gameState.ball.speedY) * maxVerticalSpeed;
            }
            const speedMultiplier = 1.05;
            const currentSpeed = Math.sqrt(gameState.ball.speedX * gameState.ball.speedX + gameState.ball.speedY * gameState.ball.speedY);
            const newSpeed = Math.min(currentSpeed * speedMultiplier, gameState.ball.maxSpeed);
            const angle = Math.atan2(gameState.ball.speedY, gameState.ball.speedX);
            gameState.ball.speedX = Math.cos(angle) * newSpeed;
            gameState.ball.speedY = Math.sin(angle) * newSpeed;
        }
        if (gameState.ball.speedX > 0 && canvas &&
            gameState.ball.x + radius >= canvas.width - paddleWidth && 
            gameState.ball.x - radius <= canvas.width &&
            gameState.ball.y >= gameState.paddles.player2Y && 
            gameState.ball.y <= gameState.paddles.player2Y + paddleHeight) {
            gameState.ball.x = canvas.width - paddleWidth - radius;
            gameState.ball.speedX = -Math.abs(gameState.ball.speedX);
            const hitPosition = (gameState.ball.y - gameState.paddles.player2Y) / paddleHeight;
            gameState.ball.speedY += (hitPosition - 0.5) * -gameState.ball.speedX * 1.5;
            const maxVerticalSpeed = gameState.ball.maxSpeed * 0.8;
            if (Math.abs(gameState.ball.speedY) > maxVerticalSpeed) {
                gameState.ball.speedY = Math.sign(gameState.ball.speedY) * maxVerticalSpeed;
            }
            const speedMultiplier = 1.05;
            const currentSpeed = Math.sqrt(gameState.ball.speedX * gameState.ball.speedX + gameState.ball.speedY * gameState.ball.speedY);
            const newSpeed = Math.min(currentSpeed * speedMultiplier, gameState.ball.maxSpeed);
            const angle = Math.atan2(gameState.ball.speedY, gameState.ball.speedX);
            gameState.ball.speedX = Math.cos(angle) * newSpeed;
            gameState.ball.speedY = Math.sin(angle) * newSpeed;
        }
        if (gameState.ball.x - radius <= 0) {
            gameState.scores.player2++;
            updateScoreboard();
            resetBall();
        }  // Added closing bracket here
        if (canvas && gameState.ball.x + radius >= canvas.width) {
            gameState.scores.player1++;
            updateScoreboard();
            resetBall();
        }
    }




  function updateScoreboard(): void {
      if (elements.score1) {
          elements.score1.textContent = gameState.scores.player1.toString();
      }
      if (elements.score2) {
          elements.score2.textContent = gameState.scores.player2.toString();
      }
  }
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
              gameState.controls.player2Up = true;break;
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
        customizeElements.customizeButton?.addEventListener("click", openCustomMenu);
        customizeElements.backButton?.addEventListener("click", closeCustomMenu);
        
        customizeElements.ballColorInput?.addEventListener("input", updateCustomSettings);
        customizeElements.paddleColorInput?.addEventListener("input", updateCustomSettings);
        customizeElements.lineColorInput?.addEventListener("input", updateCustomSettings);
        
        customizeElements.pointsToWinSlider?.addEventListener("input", (event) => {
            updateCustomSettings();
            sliderAnimation(event);
        });
        
        // Initialize with default values
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
      function init(): void {
          updatePageTranslations();
          window.addEventListener('languageChanged', updatePageTranslations);
          document.addEventListener("keydown", handleKeyDown);
          document.addEventListener("keyup", handleKeyUp);
          elements.startTournamentButton?.addEventListener("click", initTournament);
          elements.playNextMatchButton?.addEventListener("click", playNextMatch);
          elements.newTournamentButton?.addEventListener("click", resetTournament);
          // Initialize player input fields with default values
          elements.playerInputs[0].value = languageService.translate("game.tournament_mode.default_player1", "Player 1");
          elements.playerInputs[1].value = languageService.translate("game.tournament_mode.default_player2", "Player 2");
          elements.playerInputs[2].value = languageService.translate("game.tournament_mode.default_player3", "Player 3");
          elements.playerInputs[3].value = languageService.translate("game.tournament_mode.default_player4", "Player 4");
    
          initCustomization();
          // Initialize all Back to Game Modes buttons
        const backButtons = [
            document.getElementById("back-to-modes-button"),
            document.getElementById("back-to-modes-button-winner")
        ];
        
        backButtons.forEach(button => {
            if (button) {
            // Remove existing event listeners first to avoid duplicates
            button.removeEventListener('click', backToGameModes);
            // Add our improved event listener
            button.addEventListener('click', backToGameModes);
            }
        });
        
        // Set initial values for color inputs and slider
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
        init();
        function cleanup(): void {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);

            window.removeEventListener('languageChanged', updatePageTranslations);
            
            elements.startTournamentButton?.removeEventListener("click", initTournament);
            elements.playNextMatchButton?.removeEventListener("click", playNextMatch);
            elements.newTournamentButton?.removeEventListener("click", resetTournament);
            document.getElementById("back-to-modes-button")?.removeEventListener("click", backToGameModes);
            document.getElementById("back-to-modes-button-winner")?.removeEventListener("click", backToGameModes);
        
            if (gameState.animationFrameId !== null) {
                cancelAnimationFrame(gameState.animationFrameId);
            }
            customizeElements.customizeButton?.removeEventListener("click", openCustomMenu);
            customizeElements.backButton?.removeEventListener("click", closeCustomMenu);
            customizeElements.ballColorInput?.removeEventListener("input", updateCustomSettings);
            customizeElements.paddleColorInput?.removeEventListener("input", updateCustomSettings);
            customizeElements.lineColorInput?.removeEventListener("input", updateCustomSettings);
            customizeElements.pointsToWinSlider?.removeEventListener("input", updateCustomSettings);
        }
        return cleanup;
    }