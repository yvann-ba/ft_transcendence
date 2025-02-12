import { FastifyInstance } from "fastify";
import * as sqlite3 from 'sqlite3';
import { open } from "sqlite";

export async function Database(fastify: FastifyInstance) {
  const db = await open({
    filename: "./database/db.sqlite",
    driver: sqlite3.Database,
  });

  fastify.decorate("db", db);

  fastify.addHook("onClose", async () => {
    await db.close();
  });
}
