import { FastifyInstance } from 'fastify';
import userQueries  from '../queries/users';

export default async function userRoutes(fastify: FastifyInstance) {
  
//   fastify.post('/users', async (request, reply) => {
// 	try {
// 	  const { username, password, email } = request.body as { username: string; password: string; email: string };
// 	  const user = await userQueries.createUser(username, password, email);
// 	  return reply.send(user);
// 	} catch (err) {
// 	  return reply.status(500).send({ error: 'Erreur lors de la création de l\'utilisateur', details: err });
// 	}
//   });
  
  
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

  fastify.post('/register', async (request, reply) => {
    try {
      const { username, password, firstName, lastName } = request.body as {
        username: string;
        password: string;
        firstName: string;
        lastName: string;
      };

	  if (!username || !password || !firstName || !lastName) {
		return reply.status(400).send({ error: "Tous les champs sont requis" });
	  }
	  
	  if (password.length < 6) {
		return reply.status(400).send({ error: "Le mot de passe doit contenir au moins 6 caractères" });
	  }

      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

      const existingUser = await userQueries.checkUserLogin(username);
      if (existingUser) {
        return reply.status(400).send({ error: "Nom d'utilisateur déjà utilisé" });
      }

      // Create the user
      const result = await userQueries.createUser(username,
		 password, 
		 firstName,
		 lastName,
		 email);
      
      // Generate JWT token
      const token = fastify.jwt.sign({ userId: result.user.id });
      
      // Set cookie and send response
      reply
        .setCookie("sessionid", token, {
          httpOnly: true,
          secure: true, 
          path: "/",
          maxAge: 60 * 60 * 24,
          sameSite: "none",
        })
        .send({ 
          message: "Inscription réussie",
          token: token
        });
    } catch (err) {
      fastify.log.error("Registration error:", err);
      return reply.status(500).send({ 
        error: "Erreur lors de l'inscription",
        details: (err as Error).message
      });
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
