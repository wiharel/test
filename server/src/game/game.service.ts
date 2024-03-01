import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
    private game: any;

    startGame(player1: string, player2: string): void {
        this.game = {
            player1: {name: player1, score: 0},
            player2: {name: player2, score: 0},
            ball: { x: 0, y: 0, velocityX: 0, velocityY: 0 },
        };
    }

    updateGame(action: any): void {
        this.game.ball.x += this.game.ball.velocityX;
        this.game.ball.y += this.game.ball.velocityY;
    }

    getGame(): any {
        return this.game;
    }
}
