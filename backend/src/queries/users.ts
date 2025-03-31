import db from '../config/database';
import bcrypt from 'bcrypt';


const getUserById = (userId: number, callback: (err: Error | null, row: any) => void) => {
  const query = `
    SELECT id, username, email, first_name, last_name, created_at, player_games, player_wins, avatar
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
    const MAX_USERNAME_LENGTH = 20;
    const MAX_NAME_LENGTH = 50;
    
    if (username.length > MAX_USERNAME_LENGTH) {
      return resolve({
        success: false,
        error: `Username cannot exceed ${MAX_USERNAME_LENGTH} characters`
      });
    }
    if (firstName.length > MAX_NAME_LENGTH) {
      return resolve({
        success: false,
        error: `First name cannot exceed ${MAX_NAME_LENGTH} characters`
      });
    }
    if (lastName.length > MAX_NAME_LENGTH) {
      return resolve({
        success: false,
        error: `Last name cannot exceed ${MAX_NAME_LENGTH} characters`
      });
    }

    const query = `
      INSERT INTO users (username, password, first_name, last_name, email)
      VALUES (?, ?, ?, ?, ?);
    `;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    db.run(query, [username, hashedPassword, firstName, lastName, email], function (err) {
      if (err) {
        return resolve({
          success: false,
          error: err.message
        });
      } else {
        getUserById(this.lastID, (err, row) => {
          if (err) {
            return resolve({
              success: false,
              error: err.message
            });
          } else {
            resolve({ 
              success: true,
              message: 'User successfully created', 
              user: row 
            });
          }
        });
      }
    });
  });
};

export const checkUserLogin = async (username: string): Promise<any> => {
  return new Promise((resolve) => {
    const query = `SELECT id, username, email, password FROM users WHERE username = ?`;

    db.get(query, [username], (err, row) => {
      if (err) {
        return resolve({
          success: false,
          error: err.message
        });
      }
      
      if (!row) {
        return resolve({
          success: true,
          user: null
        });
      }
      
      resolve({
        success: true,
        user: row
      });
    });
  });
};

export const createUserOAuth = (googleId: string, username: string, firstName: string, lastName: string , email: string, avatar: string) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO users (google_id, username, password, email, avatar, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [googleId, username, 'google_oauth', email, avatar, firstName, lastName], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, username, email, avatar});
    });
  });
};

export const checkUserByGoogleId = async (email: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id, username, email, password, avatar FROM users WHERE google_id = ?`;

    db.get(query, [email], (err, row) => {
      if (err) {
        console.error("Error retrieving user by email:", err.message);
        return reject(err);
      }
      resolve(row || null);
    });
  });
};

export const updateUserAvatar = async (userId: number, avatar: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE users SET avatar = ? WHERE id = ?`;
    
    db.run(query, [avatar, userId], function(err) {
      if (err) {
        console.error("Error updating user avatar:", err.message);
        return reject(err);
      }
      
      getUserById(userId, (err, user) => {
        if (err) return reject(err);
        resolve(user);
      });
    });
  });
};

export const updateUser = async (userId: number, userData: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const updates: string[] = [];
    const values: any[] = [];
    
    const MAX_USERNAME_LENGTH = 20;
    const MAX_NAME_LENGTH = 50;
    
    if (userData.username !== undefined) {
      if (userData.username.length > MAX_USERNAME_LENGTH) {
        return resolve({
          success: false,
          error: `Username cannot exceed ${MAX_USERNAME_LENGTH} characters`
        });
      }
      updates.push('username = ?');
      values.push(userData.username);
    }
    
    if (userData.first_name !== undefined) {
      if (userData.first_name.length > MAX_NAME_LENGTH) {
        return resolve({
          success: false,
          error: `First name cannot exceed ${MAX_NAME_LENGTH} characters`
        });
      }
      updates.push('first_name = ?');
      values.push(userData.first_name);
    }
    
    if (userData.last_name !== undefined) {
      if (userData.last_name.length > MAX_NAME_LENGTH) {
        return resolve({
          success: false,
          error: `Last name cannot exceed ${MAX_NAME_LENGTH} characters`
        });
      }
      updates.push('last_name = ?');
      values.push(userData.last_name);
    }
    
    if (updates.length === 0) {
      return resolve({
        success: true,
        user: {} 
      });
    }
    values.push(userId);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    db.run(query, values, function(err) {
      if (err) {
        return resolve({ 
          success: false, 
          error: err.message
        });
      }
      
      if (this.changes === 0) {
        return resolve({
          success: false,
          error: 'User not found'
        });
      }
      
      getUserById(userId, (err, user) => {
        if (err) {
          return resolve({
            success: false,
            error: err.message
          });
        }
        resolve({
          success: true,
          user: user
        });
      });
    });
  });
};

export const removeAvatar = async (userId: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE users SET avatar = NULL WHERE id = ?`;
    
    db.run(query, [userId], function(err) {
      if (err) {
        console.error("Error removing avatar:", err.message);
        return reject(err);
      }
      
      resolve(this.changes > 0);
    });
  });
};

export const getUserData = async (userId: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    getUserById(userId, (err, user) => {
      if (err) {
        console.error("Error fetching user data:", err.message);
        return reject(err);
      }
      
      if (!user) {
        return resolve(null);
      }
      
      const userCopy = { ...user };
      if (userCopy.password) {
        delete userCopy.password;
      }
      
      const gameHistoryPromise = new Promise<any[]>((resolveGames) => {
        const query = `
          SELECT * FROM game_history
          WHERE user_id = ?
          ORDER BY played_at DESC
        `;
        
        db.all(query, [userId], (err, rows) => {
          if (err) {
            console.error("Error fetching game history:", err.message);
            resolveGames([]);
          } else {
            resolveGames(rows || []);
          }
        });
      });
      
      
      Promise.all([gameHistoryPromise])
        .then(([gameHistory]) => {
          const userData = {
            user: userCopy,
            gameHistory,
          };
          
          resolve(userData);
        })
        .catch(error => {
          console.error("Error assembling user data:", error);
          resolve({
            user: userCopy,
            gameHistory: [],
            friends: [],
            messages: []
          });
        });
    });
  });
};

export const anonymizeUser = async (userId: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const anonymousUsername = 'anonymous_' + Math.random().toString(36).substring(2, 10);
    const anonymousEmail = `${anonymousUsername}@anonymous.com`;
    
    const query = `
      UPDATE users 
      SET username = ?, 
          first_name = 'Anonymous', 
          last_name = 'User', 
          email = ?,
          avatar = NULL 
      WHERE id = ?
    `;
    
    db.run(query, [anonymousUsername, anonymousEmail, userId], function(err) {
      if (err) {
        console.error("Error anonymizing user:", err.message);
        return reject(err);
      }
      
      resolve(this.changes > 0);
    });
  });
};

export const deleteUser = async (userId: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    
    const deletionPromises = [];
    
    deletionPromises.push(new Promise<void>((resolveMsg) => {
      db.run('DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?', [userId, userId], (err) => {
        if (err) {
          console.error("Error deleting user messages:", err.message);
        }
        resolveMsg();
      });
    }));
    
    deletionPromises.push(new Promise<void>((resolveFriend) => {
      db.run('DELETE FROM friendships WHERE user1_id = ? OR user2_id = ?', [userId, userId], (err) => {
        if (err) {
          console.error("Error deleting user friendships:", err.message);
        }
        resolveFriend();
      });
    }));
    
    deletionPromises.push(new Promise<void>((resolveGame) => {
      db.run('DELETE FROM games WHERE player1_id = ? OR player2_id = ?', [userId, userId], (err) => {
        if (err) {
          console.error("Error deleting user games:", err.message);
        }
        resolveGame();
      });
    }));
    
    Promise.all(deletionPromises)
      .then(() => {
        // Finally delete the user
        db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
          if (err) {
            console.error("Error deleting user:", err.message);
            return reject(err);
          }
          
          const wasDeleted = this.changes > 0;
          resolve(wasDeleted);
        });
      })
      .catch(err => {
        console.error("Error during account deletion:", err);
        reject(err);
      });
  });
};

export default { 
  createUser, 
  getUserById, 
  checkUserLogin, 
  updateUser, 
  removeAvatar, 
  getUserData, 
  anonymizeUser, 
  deleteUser,
  updateUserAvatar
};