import { open } from "sqlite";
import * as sqlite3 from "sqlite3";

export async function up(db: any) {
	await db.exec(`
	  CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		email TEXT NOT NULL
	  );
	`);
	console.log("✅ Table 'users' created!");
  }
  
  export async function down(db: any) {
	await db.exec(`DROP TABLE IF EXISTS users;`);
	console.log("❌ Table 'users' dropped!");
  }
  