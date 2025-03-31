import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "path";
import fastifyFormbody from "@fastify/formbody";
import jwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import { FastifyRequest, FastifyReply } from 'fastify';

import config from './config/fastifyconfig';
import migrateRoutes from './routes/migrate';
import createUsersTable from '../database/migrations/001_create_users_table'
import createGameHistoryTable from '../database/migrations/002_create_game_history_table'
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import oauthGoogleRoutes from './routes/oauthGoogle';
import gameHistoryRoutes from "./routes/game";

const fastify = Fastify({ logger: true });
fastify.register(oauthGoogleRoutes);

fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST"],
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "../public"),
  prefix: "/",
});

fastify.setNotFoundHandler((request, reply) => {
  reply.sendFile("index.html"); 
});

fastify.register(fastifyFormbody);
fastify.register(fastifyCookie);

fastify.register(jwt, {
  secret: config.jwtSecret,
  cookie: {
    cookieName: "sessionid",
    signed: false
  }
  
});

fastify.decorate("authenticate", async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    fastify.log.error("JWT Verify Error:", err);
    reply.status(401).send({ error: "Unauthorized" });
  }
});

fastify.register(migrateRoutes);

fastify.get("/hello", async (request, reply) => {
  fastify.log.info("Request received for /hello");
  return { message: "Hello from Fastify API!" };
});

fastify.get("/", async (request, reply) => {
  return reply.sendFile("index.html");
});

fastify.register(userRoutes);
fastify.register(authRoutes);
fastify.register(gameHistoryRoutes);

fastify.get("/auth/status", async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
    return { authenticated: true };
  } catch (err) {
    return { authenticated: false };
  }
});

fastify.get("/debug/auth", async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const cookie = request.cookies.sessionid;
    if (cookie) {
      try {
        const decoded = fastify.jwt.verify(cookie);
        return { 
          hasCookie: true, 
          isValid: true,
          decoded 
        };
      } catch (err) {
        return { 
          hasCookie: true, 
          isValid: false,
          error: (err as Error).message 
        };
      }
    }
    return { hasCookie: false };
  } catch (err) {
    return { error: (err as Error).message };
  }
});


const start = async () => {
  try {


    createUsersTable();
    createGameHistoryTable();

    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    fastify.log.info("Server running on http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
