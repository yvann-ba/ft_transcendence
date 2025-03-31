import { FastifyInstance } from 'fastify';
import createUsersTable from '../../database/migrations/001_create_users_table';

export default async function (fastify: FastifyInstance) {
  fastify.get('/migrate', async (request, reply) => {
    try {
      createUsersTable();
      return reply.send({ message: 'Migration Success' });
    } catch (err) {
      reply.status(500).send({ message: 'Migration error', error: err });
    }
  });
}
