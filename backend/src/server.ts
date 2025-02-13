import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "path";
import { setupDatabase } from "./config/database";
import { migrateRoutes } from "./routes/migrate";

const fastify = Fastify({ logger: true });

// Configuration CORS pour autoriser le frontend à accéder au backend
fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST"],
});

// Servir les fichiers statiques du frontend
fastify.register(fastifyStatic, {
  root: path.join(__dirname, "../../frontend/public"),
  prefix: "/", // Permet d'accéder aux fichiers comme `localhost:3000/`
});

fastify.register(migrateRoutes);

fastify.setNotFoundHandler((request, reply) => {
	reply.sendFile("index.html"); 
  });

// Route API de test
fastify.get("/hello", async (request, reply) => {
  return { message: "Hello from Fastify API!" };
});

// Route pour servir index.html par défaut
fastify.get("/", async (request, reply) => {
  return reply.sendFile("index.html");
});

// Lancer le serveur
const start = async () => {
  try {

    const db = await setupDatabase();

    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    fastify.log.info("Server running on http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
