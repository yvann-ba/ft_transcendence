import { FastifyInstance } from 'fastify';
import { checkUserLogin } from '../queries/users';
import bcrypt from 'bcrypt';

export default async function authRoutes(fastify: FastifyInstance) {


fastify.post('/login', async (request, reply) => {
  try {
    const { username, password } = request.body as {
      username: string;
      password: string;
    };
    
    if (!username || !password) {
      return reply.send({
        success: false,
        error: "Username and password are required"
      });
    }
    
    const userResult = await checkUserLogin(username);
    
    if (!userResult.success || !userResult.user) {
      return reply.send({
        success: false,
        error: "Invalid username or password"
      });
    }
    
    const isValidPassword = await bcrypt.compare(password, userResult.user.password);
    
    if (!isValidPassword) {
      return reply.send({
        success: false,
        error: "Invalid username or password"
      });
    }
    
    const token = fastify.jwt.sign({ userId: userResult.user.id });
    
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
        message: "Login successful",
        token: token
      });
  } catch (err) {
    fastify.log.error("Login error:", err);
    return reply.send({
      success: false,
      error: "Server error"
    });
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