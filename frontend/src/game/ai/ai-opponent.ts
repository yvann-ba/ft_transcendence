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
    [key: string]: any; 
}

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export class AIOpponent {
    private lastUpdateTime: number = 0;
    private updateInterval: number = 1000; 
    private gameState: GameState | null = null;
    private predictedBallPath: { x: number, y: number }[] = [];
    private difficulty: AIDifficulty = 'medium';
    private canvasWidth: number;
    private canvasHeight: number;
    private targetY: number = 0;
    private lastTargetY: number = 0;
    private transitionProgress: number = 1.0;
    private transitionDuration: number = 0.3;
    private idleThreshold: number = 10;

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
            this.lastTargetY = this.targetY;
            this.transitionProgress = 0.0;
            this.predictBallPath();
        }
        this.transitionProgress += 1 / (60 * this.transitionDuration);
        this.transitionProgress = Math.min(this.transitionProgress, 1.0);
        
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
        const timeStep = 0.016; 
        const maxPredictionTime = 3; 
        
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
                ball.x - ball.radius < this.canvasWidth - 3 &&
                ball.y > player2Y && 
                ball.y < player2Y + paddleHeight) {
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
        let targetY = this.canvasHeight / 2 - paddleHeight / 2; // Default to center
        
        const aiSidePredictions = this.predictedBallPath.filter(pos => pos.x > this.canvasWidth / 2);
        
        if (aiSidePredictions.length > 0) {
            const gameStatePaddleWidth = this.gameState.paddles.width;
            
            const crossingPoints = aiSidePredictions.filter(pos => 
                pos.x >= this.canvasWidth - (gameStatePaddleWidth + 5) && 
                pos.x <= this.canvasWidth - gameStatePaddleWidth
            );
            
            if (crossingPoints.length > 0) {
                targetY = crossingPoints[0].y - paddleHeight / 2; // Center paddle on ball
            } else if (aiSidePredictions.length > 0) {
                targetY = aiSidePredictions[aiSidePredictions.length - 1].y - paddleHeight / 2;
            }
        }
        if (this.gameState.ball.speedX < 0 && this.gameState.ball.x < this.canvasWidth * 0.75) {
            targetY = this.canvasHeight / 2 - paddleHeight / 2;
        }
        let imperfectionRange = 0;
        switch (this.difficulty) {
            case 'easy':
                imperfectionRange = 70;
                break;
            case 'medium':
                imperfectionRange = 25;
                break;
            case 'hard':
                imperfectionRange = 5;
                break;
        }
        
        const imperfection = Math.random() * imperfectionRange * 2 - imperfectionRange;
        this.targetY = targetY + imperfection;
        this.targetY = Math.max(5, Math.min(this.canvasHeight - paddleHeight - 5, this.targetY));
    }
    
    private getControls(): { moveUp: boolean, moveDown: boolean } {
        if (!this.gameState) {
            return { moveUp: false, moveDown: false };
        }
        
        const paddleY = this.gameState.paddles.player2Y;
        const paddleHeight = this.gameState.paddles.height;
        const smoothY = this.lastTargetY + 
            (this.targetY - this.lastTargetY) * this.easeInOutQuad(this.transitionProgress);
        if (Math.abs(paddleY - smoothY) < this.idleThreshold) {
            return { moveUp: false, moveDown: false };
        }
        const moveUp = smoothY < paddleY;
        const moveDown = smoothY > paddleY;
        if (this.difficulty === 'easy' && Math.random() < 0.1) {
            return { moveUp: !moveUp, moveDown: !moveDown }; // Occasionally move the wrong way
        }
        
        if (this.difficulty === 'medium' && Math.random() < 0.05) {
            return { moveUp: false, moveDown: false }; // Occasional pause
        }
        
        return { moveUp, moveDown };
    }
    private easeInOutQuad(t: number): number {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
}