import { FastifyInstance } from 'fastify';
import userQueries  from '../queries/users';

export default async function userRoutes(fastify: FastifyInstance) {
  

fastify.get('/users/me', { preHandler: fastify.authenticate }, async (request, reply) => {
	try {
	  const userId = (request.user as { userId: number }).userId;
	  
	  const getUserByIdPromise = (userId: number): Promise<any> => {
		return new Promise((resolve, reject) => {
		  userQueries.getUserById(userId, (err, user) => {
			if (err) reject(err);
			else resolve(user);
		  });
		});
	  };
	  
	  console.log("Fetching user profile for user ID:", userId);

	  const user = await getUserByIdPromise(userId);
	  
	  if (!user) {
		return reply.status(404).send({ error: "Utilisateur non trouvé" });
	  }
	  
	  const { password, ...userWithoutPassword } = user;
	  
	  return reply.send(userWithoutPassword);
	} catch (err) {
	  fastify.log.error("Error fetching user profile:", err);
	  return reply.status(500).send({ error: "Erreur serveur" });
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

  fastify.put('/users/me', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const userId = (request.user as { userId: number }).userId;
      const { username, firstname, lastname } = request.body as { 
        username?: string;
        firstname?: string;
        lastname?: string;
      };
      
      // Check if username is already taken (if changing username)
      if (username) {
        const existingUser = await userQueries.checkUserLogin(username);
        if (existingUser && existingUser.id !== userId) {
          return reply.status(400).send({ error: "Ce nom d'utilisateur est déjà utilisé" });
        }
      }
      
      const updatedUser = await userQueries.updateUser(userId, { 
        username, 
        first_name: firstname, 
        last_name: lastname 
      });
      
      if (!updatedUser) {
        return reply.status(404).send({ error: "Utilisateur non trouvé" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      return reply.send(userWithoutPassword);
    } catch (err) {
      fastify.log.error("Error updating user profile:", err);
      return reply.status(500).send({ error: "Erreur lors de la mise à jour du profil" });
    }
  });
  
  // Delete avatar route
  fastify.delete('/users/me/avatar', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const userId = (request.user as { userId: number }).userId;
      
      const success = await userQueries.removeAvatar(userId);
      
      if (!success) {
        return reply.status(404).send({ error: "Utilisateur non trouvé ou avatar déjà supprimé" });
      }
      
      return reply.send({ success: true, message: "Avatar supprimé avec succès" });
    } catch (err) {
      fastify.log.error("Error removing avatar:", err);
      return reply.status(500).send({ error: "Erreur lors de la suppression de l'avatar" });
    }
  });
  
  // Download user data route
  fastify.get('/users/me/data', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const userId = (request.user as { userId: number }).userId;
      
      const userData = await userQueries.getUserData(userId);
      
      if (!userData) {
        return reply.status(404).send({ error: "Utilisateur non trouvé" });
      }
      
      if (userData.user && userData.user.password) {
        delete userData.user.password;
      }
      
      return reply.send(userData);
    } catch (err) {
      fastify.log.error("Error downloading user data:", err);
      return reply.status(500).send({ error: "Erreur lors du téléchargement des données utilisateur" });
    }
  });
  
  fastify.post('/users/me/anonymize', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const userId = (request.user as { userId: number }).userId;
      
      const success = await userQueries.anonymizeUser(userId);
      
      if (!success) {
        return reply.status(404).send({ error: "Utilisateur non trouvé" });
      }
      
      reply.clearCookie("sessionid");
	  reply.clearCookie("auth_token");
      
      return reply.send({ success: true, message: "Compte anonymisé avec succès" });
    } catch (err) {
      fastify.log.error("Error anonymizing user:", err);
      return reply.status(500).send({ error: "Erreur lors de l'anonymisation du compte" });
    }
  });
  
  // Delete account route
  fastify.delete('/users/me', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const userId = (request.user as { userId: number }).userId;
      
      const success = await userQueries.deleteUser(userId);
      
      if (!success) {
        return reply.status(404).send({ error: "Utilisateur non trouvé" });
      }
      
      // Clear session cookie
      reply.clearCookie("sessionid");
	  reply.clearCookie("auth_token");

      
      return reply.send({ success: true, message: "Compte supprimé avec succès" });
    } catch (err) {
      fastify.log.error("Error deleting user:", err);
      return reply.status(500).send({ error: "Erreur lors de la suppression du compte" });
    }
  });

}
