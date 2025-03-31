import db from '../../src/config/database';

const createGameHistoryTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS game_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        opponent_type TEXT NOT NULL,  /* 'AI' ou 'PLAYER' */
        difficulty TEXT,              /* null si opponent_type = 'PLAYER' */
        user_score INTEGER NOT NULL,
        opponent_score INTEGER NOT NULL,
        result TEXT NOT NULL,         /* 'WIN', 'LOSS', 'DRAW' */
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    `;

    db.run(query, (err) => {
        if (err) {
            console.error('Error creating game_history table:', err.message);
        } else {
            console.log('Table game_history created successfully');
        }
    });
};

export default createGameHistoryTable;