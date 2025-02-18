import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "path";
import migrateRoutes from './routes/migrate';
import createUsersTable from '../database/migrations/001_create_users_table'; // Assure-toi que tu importes ta migration
import createUser from '../database/seeders/createUser';
import fastifyFormbody from "@fastify/formbody";

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST"],
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "../../frontend/public"),
  prefix: "/",
});

fastify.setNotFoundHandler((request, reply) => {
  reply.sendFile("index.html"); 
});

fastify.register(migrateRoutes);

fastify.register(fastifyFormbody);

fastify.post('/users', async (request, reply) => {
  const { username, password, email } = request.body as { username: string; password: string; email: string };


  const userinfos = await createUser(username, password, email);

  reply.send(userinfos);
});
  
//test
fastify.get("/hello", async (request, reply) => {
  return { message: "Hello from Fastify API!" };
});

fastify.get("/", async (request, reply) => {
  return reply.sendFile("index.html");
});

const start = async () => {
  try {

    createUsersTable();

    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    fastify.log.info("Server running on http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
