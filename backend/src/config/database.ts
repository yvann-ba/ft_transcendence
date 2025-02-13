import * as sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import path from "path";


const dbPath = path.join(__dirname, "../../database/db.sqlite");

export async function setupDatabase() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await runMigrations(db);
  return db;
}

async function runMigrations(db: any) {
  const migrationsDir = path.join(__dirname, "../../database/migrations");
  const files = fs.readdirSync(migrationsDir).sort(); // Exécute dans l'ordre

  for (const file of files) {
    if (file.endsWith(".ts")) {
      const migration = require(path.join(migrationsDir, file));
      console.log(`🔄 Running migration: ${file}`);
      await migration.up(db);
    }
  }

  console.log("✅ All migrations applied!");
}
