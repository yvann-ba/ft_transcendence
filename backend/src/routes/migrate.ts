import { FastifyInstance } from "fastify";
import { setupDatabase } from "../config/database";

export async function migrateRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post("/api/migrate", async (request, reply) => {
    try {
      const db = await setupDatabase();
      fastify.decorate("db", db);
      reply.send({ success: true, message: "Migrations applied!" });
    } catch (error) {
      const errorMessage = error instanceof Error;
      reply.status(500).send({ error: errorMessage });
    }
  });
}
