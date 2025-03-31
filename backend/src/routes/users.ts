import { FastifyInstance } from 'fastify';
import userQueries  from '../queries/users';

export default async function userRoutes(fastify: FastifyInstance) {
  
//   fastify.post('/users', async (request, reply) => {
// 	try {
// 	  const { username, password, email } = request.body as { username: string; password: string; email: string };
// 	  const user = await userQueries.createUser(username, password, email);
// 	  return reply.send(user);
// 	} catch (err) {
// 	  return reply.status(500).send({ error: 'Error creating user', details: err });
// 	}
//   });
  
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
		return reply.status(400).send({ error: "All fields are required" });
	  }
	  
	  if (password.length < 6) {
		return reply.status(400).send({ error: "Password must be at least 6 characters" });
	  }

      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

      const existingUser = await userQueries.checkUserLogin(username);
      if (existingUser) {
        return reply.status(400).send({ error: "Username already in use" });
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
          message: "Registration successful",
          token: token
        });
    } catch (err) {
      fastify.log.error("Registration error:", err);
      return reply.status(500).send({ 
        error: "Error during registration",
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
//       return reply.status(500).send({ error: 'Error updating user', details: err });
//     }
//   });

//   fastify.delete('/users/:id', async (request, reply) => {
//     try {
//       const { id } = request.params as { id: string };
//       await deleteUser(parseInt(id, 10));
//       return reply.send({ message: 'User deleted successfully' });
//     } catch (err) {
//       return reply.status(500).send({ error: 'Error deleting user', details: err });
//     }
//   });

}