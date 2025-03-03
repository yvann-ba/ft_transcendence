import { FastifyInstance } from 'fastify';
import userQueries  from '../queries/users';

export default async function userRoutes(fastify: FastifyInstance) {
  
  fastify.post('/users', async (request, reply) => {
	try {
	  const { username, password, email } = request.body as { username: string; password: string; email: string };
	  const user = await userQueries.createUser(username, password, email);
	  return reply.send(user);
	} catch (err) {
	  return reply.status(500).send({ error: 'Erreur lors de la création de l\'utilisateur', details: err });
	}
  });
  
  
  fastify.get('/users/:id', async (request, reply) => {
	try {
	  const { id } = request.params as { id: string };
  
	  const user = await new Promise((resolve, reject) => {
		userQueries.getUserById(parseInt(id, 10), (err, user) => {
		  if (err) {
			reject(err);
		  } else {
			resolve(user);
		  }
		});
	  });
  
	  if (!user) {
		return reply.status(404).send({ error: 'Utilisateur non trouvé' });
	  }
  
	  return reply.send(user);
	} catch (err) {
	  return reply.status(500).send({ error: 'Erreur lors de la récupération de l\'utilisateur', details: err });
	}
  });

//   fastify.put('/users/:id', async (request, reply) => {
//     try {
//       const { id } = request.params as { id: string };
//       const { username, email } = request.body as { username?: string; email?: string };
//       const updatedUser = await updateUser(parseInt(id, 10), username, email);
//       return reply.send(updatedUser);
//     } catch (err) {
//       return reply.status(500).send({ error: 'Erreur lors de la mise à jour de l\'utilisateur', details: err });
//     }
//   });

//   fastify.delete('/users/:id', async (request, reply) => {
//     try {
//       const { id } = request.params as { id: string };
//       await deleteUser(parseInt(id, 10));
//       return reply.send({ message: 'Utilisateur supprimé avec succès' });
//     } catch (err) {
//       return reply.status(500).send({ error: 'Erreur lors de la suppression de l\'utilisateur', details: err });
//     }
//   });

}
