import { FastifyInstance } from 'fastify';
import { addGameToHistory, getUserGameHistory, updateUserGameStats } from '../queries/game';

export default async function gameHistoryRoutes(fastify: FastifyInstance) {
  fastify.get('/game-history', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const userId = (request.user as { userId: number }).userId;
      const gameHistory = await getUserGameHistory(userId, 10);
      
      return reply.send(gameHistory);
    } catch (err) {
      fastify.log.error("Error fetching game history:", err);
      return reply.status(500).send({ error: "Server Error" });
    }
  });

  fastify.post('/game-history', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const userId = (request.user as { userId: number }).userId;
      const {
        opponentType,
        difficulty,
        userScore,
        opponentScore,
        result
      } = request.body as {
        opponentType: 'AI' | 'PLAYER',
        difficulty: string | null,
        userScore: number,
        opponentScore: number,
        result: 'WIN' | 'LOSS' | 'DRAW'
      };

      const gameRecord = await addGameToHistory(
        userId,
        opponentType,
        difficulty,
        userScore,
        opponentScore,
        result
      );

      await updateUserGameStats(userId, result === 'WIN');
      
      return reply.status(201).send({
        message: 'Game successfully registered',
        gameId: gameRecord.id
      });
    } catch (err) {
      fastify.log.error("Error saving game history:", err);
      return reply.status(500).send({ error: "Server error" });
    }
  });
}