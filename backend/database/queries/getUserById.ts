import db from '../../src/config/database';

const getUserById = (userId: number, callback: (err: Error | null, row: any) => void) => {
  const query = `
    SELECT id, username, email, created_at
    FROM users
    WHERE id = ?;
  `;

  db.get(query, [userId], (err, row) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, row);  // Renvoie les informations de l'utilisateur
    }
  });
};

export default getUserById;