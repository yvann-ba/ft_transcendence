// src/game/ai/ai-opponent.ts

// Define the interfaces needed for the AI
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
    animations: any;
}

interface GameState {
    ball: Ball;
    paddles: Paddles;
    running: boolean;
    [key: string]: any; // To allow for other properties
}

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export class AIOpponent {
    private lastUpdateTime: number = 0;
    private updateInterval: number = 1000; // 1 second refresh rate as required
    private gameState: GameState | null = null;
    private predictedBallPath: { x: number, y: number }[] = [];
    private difficulty: AIDifficulty = 'medium';
    private canvasWidth: number;
    private canvasHeight: number;
    
    constructor(canvasWidth: number, canvasHeight: number) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }
    
    public getPredictedPath(): { x: number, y: number }[] {
        return this.predictedBallPath;
    }
    
    public setDifficulty(difficulty: AIDifficulty): void {
        this.difficulty = difficulty;
    }
    
    public update(currentGameState: GameState, currentTime: number): { moveUp: boolean, moveDown: boolean } {
        this.gameState = currentGameState;
        
        if (currentTime - this.lastUpdateTime >= this.updateInterval) {
            this.lastUpdateTime = currentTime;
            this.predictBallPath();
        }
        
        return this.getControls();
    }
    
    private predictBallPath(): void {
        if (!this.gameState) return;
        
        this.predictedBallPath = [];
        
        const ball = {
            x: this.gameState.ball.x,
            y: this.gameState.ball.y,
            speedX: this.gameState.ball.speedX,
            speedY: this.gameState.ball.speedY,
            radius: this.gameState.ball.radius
        };
        
        const paddleHeight = this.gameState.paddles.height;
        const paddleWidth = this.gameState.paddles.width;
        const player1Y = this.gameState.paddles.player1Y;
        const player2Y = this.gameState.paddles.player2Y;
        
        let simulationTime = 0;
        const timeStep = 0.016; // 60 FPS simulation
        const maxPredictionTime = 3; // Predict 3 seconds ahead
        
        while (simulationTime < maxPredictionTime) {
            ball.x += ball.speedX * timeStep;
            ball.y += ball.speedY * timeStep;
            
            if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= this.canvasHeight) {
                ball.speedY *= -1;
            }
            
            if (ball.x - ball.radius < paddleWidth + 3 &&
                ball.y > player1Y && ball.y < player1Y + paddleHeight) {
                ball.speedX = Math.abs(ball.speedX);
                const relativeIntersect = (ball.y - player1Y) / paddleHeight - 0.5;
                ball.speedY = relativeIntersect * (ball.speedX * 0.8);
            }
            
            if (ball.x + ball.radius > this.canvasWidth - (paddleWidth + 3) &&
                ball.y > player2Y && ball.y < player2Y + paddleHeight) {
                ball.speedX = -Math.abs(ball.speedX);
                const relativeIntersect = (ball.y - player2Y) / paddleHeight - 0.5;
                ball.speedY = relativeIntersect * (Math.abs(ball.speedX) * 0.8);
            }
            
            this.predictedBallPath.push({ x: ball.x, y: ball.y });
            
            if (ball.x < 0 || ball.x > this.canvasWidth) {
                break;
            }
            
            simulationTime += timeStep;
        }
    }
    
    private getControls(): { moveUp: boolean, moveDown: boolean } {
        if (!this.gameState || this.predictedBallPath.length === 0) {
            return { moveUp: false, moveDown: false };
        }
        
        const paddleY = this.gameState.paddles.player2Y;
        const paddleHeight = this.gameState.paddles.height;
        const paddleCenter = paddleY + (paddleHeight / 2);
        
        let targetY = paddleCenter;
        
        const aiSidePredictions = this.predictedBallPath.filter(pos => pos.x > this.canvasWidth / 2);
        
        if (aiSidePredictions.length > 0) {
            const crossingPoints = aiSidePredictions.filter(pos => 
                pos.x >= this.canvasWidth - (this.gameState!.paddles.width + 5) && 
                pos.x <= this.canvasWidth - (this.gameState!.paddles.width)
            );
            
            if (crossingPoints.length > 0) {
                targetY = crossingPoints[0].y;
            } else if (aiSidePredictions.length > 0) {
                targetY = aiSidePredictions[aiSidePredictions.length - 1].y;
            }
        }
        
        let imperfectionRange = 0;
        switch (this.difficulty) {
            case 'easy':
                imperfectionRange = 50;
                break;
            case 'medium':
                imperfectionRange = 20;
                break;
            case 'hard':
                imperfectionRange = 5;
                break;
        }
        
        const imperfection = Math.random() * imperfectionRange * 2 - imperfectionRange;
        targetY += imperfection;
        
        const moveUp = targetY < paddleCenter - 5;
        const moveDown = targetY > paddleCenter + 5;
        
        return { moveUp, moveDown };
    }
}