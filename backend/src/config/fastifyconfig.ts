import dotenv from 'dotenv';

dotenv.config();

export default {
  jwtSecret: process.env.JWT_SECRET || 'defaultSecret',
  dbPath: process.env.DB_PATH || './database/db.sqlite',
};
