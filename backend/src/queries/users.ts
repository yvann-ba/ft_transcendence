import db from '../config/database';
import bcrypt from 'bcrypt';


const getUserById = (userId: number, callback: (err: Error | null, row: any) => void) => {
  const query = `
    SELECT id, username, email, first_name, last_name, created_at, player_games, player_wins
    FROM users
    WHERE id = ?;
  `;

  db.get(query, [userId], (err, row) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, row);
    }
  });
};


const SALT_ROUNDS = 10;

const createUser = async (username: string, password: string, firstName: string, lastName: string, email: string): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const query = `
      INSERT INTO users (username, password, first_name, last_name, email)
      VALUES (?, ?, ?, ?, ?);
    `;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    db.run(query, [username, hashedPassword, lastName, firstName, email], function (err) {
      if (err) {
        console.error('Erreur lors de la création de l\'utilisateur:', err.message);
        reject(err);
      } else {
        console.log('Utilisateur créé avec succès, ID:', this.lastID);

        getUserById(this.lastID, (err, row) => {
          if (err) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', err.message);
            reject(err);
          } else {
            resolve({ message: 'Utilisateur créé avec succès', user: row });
          }
        });

      }
    });
  });
};

export const checkUserLogin = async (username: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id, username, email, password FROM users WHERE username = ?`;

    db.get(query, [username], (err, row) => {
      if (err) {
        console.error("Erreur lors de la récupération de l'utilisateur:", err.message);
        return reject(err);
      }
      resolve(row || null);
    });
  });
};

export const createUserOAuth = (username: string, email: string, avatar: string) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO users (username, password, email) VALUES (?, ?, ?)`;
    db.run(query, [username, 'google_oauth', email], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, username, email });
    });
  });
};

export const checkUserByEmail = async (email: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id, username, email, password FROM users WHERE email = ?`;

    db.get(query, [email], (err, row) => {
      if (err) {
        console.error("Erreur lors de la récupération de l'utilisateur par email:", err.message);
        return reject(err);
      }
      resolve(row || null);
    });
  });
};

export default { createUser, getUserById, checkUserLogin };