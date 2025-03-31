import { FastifyInstance } from 'fastify';
import { checkUserLogin } from '../queries/users';
import bcrypt from 'bcrypt';

export default async function authRoutes(fastify: FastifyInstance) {


  fastify.post("/login", async (request, reply) => {
    fastify.log.info("Login attempt:", request.body);
    try {
      const { username, password } = request.body as { username: string; password: string };
      const user = await checkUserLogin(username);

      if (!user) {
        return reply.status(401).send({ error: "User not found" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return reply.status(401).send({ error: "Incorrect password" });
      }

      const token = fastify.jwt.sign({ userId: user.id });
      reply
        .setCookie("sessionid", token, {
          httpOnly: true,
          secure: true,
          path: "/",
          maxAge: 60 * 60 * 24,
          sameSite: "none", 
        })
        .send({ message: "Login successful" });
    } catch (err) {
      fastify.log.error("Login error:", err);
      return reply.status(500).send({ error: "Error during login", details: err });
    }
  });

  fastify.get('/profile', { preHandler: fastify.authenticate }, async (request, reply) => {
	
    const user = request.user;

    return reply.send({ message: 'Welcome to your profile', user });
  });

  fastify.get("/check-auth", async (request, reply) => {
    try {
      await request.jwtVerify();
      return reply.send({ authenticated: true });
    } catch (err) {
      return reply.status(401).send({ authenticated: false });
    }
  });
  
  fastify.post('/logout', async (request, reply) => {
    try {
      reply.clearCookie('sessionid', {
        path: '/',
        httpOnly: true,
        secure: true
      });
      
      reply.clearCookie('auth_token', {
        path: '/',
        httpOnly: false
      });
      
      return { success: true, message: 'Logout successful' };
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'Logout failed' });
    }
  });

}