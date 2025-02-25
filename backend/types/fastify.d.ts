import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

console.log("ayo oui jsuis charge"  );

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}
