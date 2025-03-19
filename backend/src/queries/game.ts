import db from '../config/database';

export const addGameToHistory = (
  userId: number,
  opponentType: 'AI' | 'PLAYER',
  difficulty: string | null,
  userScore: number,
  opponentScore: number,
  result: 'WIN' | 'LOSS' | 'DRAW'
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO game_history (user_id, opponent_type, difficulty, user_score, opponent_score, result)
      VALUES (?, ?, ?, ?, ?, ?);
    `;

    db.run(
      query,
      [userId, opponentType, difficulty, userScore, opponentScore, result],
      function(err) {
        if (err) {
          console.error('Erreur lors de l\'ajout de la partie à l\'historique:', err.message);
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      }
    );
  });
};

export const getUserGameHistory = (userId: number, limit = 10): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          id, 
          opponent_type, 
          difficulty, 
          user_score, 
          opponent_score, 
          result, 
          played_at
        FROM game_history
        WHERE user_id = ?
        ORDER BY played_at DESC
        LIMIT ?;
      `;
  
      db.all(query, [userId, limit], (err, rows) => {
        if (err) {
          console.error('Erreur lors de la récupération de l\'historique:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  };

export const updateUserGameStats = (
    userId: number,
    isWin: boolean
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE users
        SET player_games = player_games + 1,
            player_wins = player_wins + ?
        WHERE id = ?
      `;
  
      db.run(query, [isWin ? 1 : 0, userId], function (err) {
        if (err) {
          console.error('Erreur lors de la mise à jour des statistiques:', err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };


