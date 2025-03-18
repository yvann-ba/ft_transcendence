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
        return reply.status(401).send({ error: "Utilisateur non trouvé" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return reply.status(401).send({ error: "Mot de passe incorrect" });
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
        .send({ message: "Connexion réussie" });
    } catch (err) {
      fastify.log.error("Login error:", err);
      return reply.status(500).send({ error: "Erreur lors de la connexion", details: err });
    }
  });

  fastify.get('/profile', { preHandler: fastify.authenticate }, async (request, reply) => {
	
    const user = request.user;

    return reply.send({ message: 'Bienvenue sur votre profil', user });
  });

  fastify.get("/check-auth", async (request, reply) => {
    try {
      await request.jwtVerify();
      return reply.send({ authenticated: true });
    } catch (err) {
      return reply.status(401).send({ authenticated: false });
    }
  });

}