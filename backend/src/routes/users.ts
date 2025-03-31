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
	  
	  const user = await getUserByIdPromise(userId);
	  
	  if (!user) {
		return reply.status(404).send({ error: "User not found" });
	  }
	  
	  const { password, ...userWithoutPassword } = user;
	  
	  return reply.send(userWithoutPassword);
	} catch (err) {
	  fastify.log.error("Error fetching user profile:", err);
	  return reply.status(500).send({ error: "Server error" });
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
		return reply.status(404).send({ error: 'User not found' });
	  }
  
	  return reply.send(user);
	} catch (err) {
	  return reply.status(500).send({ error: 'Error retrieving user', details: err });
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
        return reply.send({ 
          success: false,
          error: "All fields are required" 
        });
      }
      
      if (password.length < 6 || password.length > 50) {
        return reply.send({ 
          success: false,
          error: "Password must be between 6 and 50 characters" 
        });
      }
      
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
  
      const userCheck = await userQueries.checkUserLogin(username);
      if (userCheck.success && userCheck.user) {
        return reply.send({ 
          success: false,
          error: "Username already in use" 
        });
      }

      const result = await userQueries.createUser(username, password, firstName, lastName, email);
      
      if (!result.success) {
        return reply.send({
          success: false,
          error: result.error
        });
      }
      
      const token = fastify.jwt.sign({ userId: result.user.id });
      
      reply
        .setCookie("sessionid", token, {
          httpOnly: true,
          secure: true, 
          path: "/",
          maxAge: 60 * 60 * 24,
          sameSite: "none",
        })
        .send({ 
          success: true,
          message: "Registration successful",
          token: token
        });
    } catch (err) {
      fastify.log.error("Registration error:", err);
      return reply.status(500).send({ 
        success: false,
        error: "Error during registration"
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
      
      if (updatedUser.password) 
        delete updatedUser.password;

      const { password, ...userWithoutPassword } = updatedUser;
      
      return reply.send(userWithoutPassword);
    } catch (err) {
      fastify.log.error("Error updating user profile:", err);
      return reply.status(500).send({ error: "Server error" });
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