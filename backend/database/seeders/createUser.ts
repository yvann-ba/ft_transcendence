import { resolve } from 'path';
import db from '../../src/config/database';
import getUserById from '../queries/getUserById';
import { rejects } from 'assert';

const createUser = (username: string, password: string, email: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO users (username, password, email)
      VALUES (?, ?, ?);
    `;

    db.run(query, [username, password, email], function (err) {
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

export default createUser;
