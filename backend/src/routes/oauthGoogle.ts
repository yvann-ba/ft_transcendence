import { FastifyInstance } from 'fastify';
import config from '../config/fastifyconfig';
import { checkUserLogin, createUserOAuth } from '../queries/users';

export default async function oauthGoogleRoutes(fastify: FastifyInstance) {

  // Redirection vers Google pour connexion
  fastify.get('/auth/google', async (request, reply) => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.googleClientId}&redirect_uri=${encodeURIComponent(config.googleRedirectUri as string|number|boolean)}&response_type=code&scope=openid%20email%20profile`;
    reply.redirect(url);
  });

  // Callback Google
  fastify.get('/auth/google/callback', async (request, reply) => {
    const code = (request.query as any).code as string;
    if (!code) return reply.redirect('/login?error=auth_failed');

    try {
      // Échange le code contre un token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: config.googleClientId!,
          client_secret: config.googleClientSecret!,
          redirect_uri: config.googleRedirectUri!,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(tokenData.error_description || 'Erreur OAuth Google');

      const accessToken = tokenData.access_token;
      if (!accessToken) throw new Error('Access token not received from Google');

      // Récupérer les informations de l'utilisateur
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (!userRes.ok) {
        throw new Error(`Failed to fetch user info: ${userRes.status} ${userRes.statusText}`);
      }

      const googleUser = await userRes.json();

      const userData = {
        username: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.picture,
      };

      fastify.log.info(`Google user data: ${JSON.stringify(userData)}`);

      // Vérifier si utilisateur existe, sinon le créer
      let user = await checkUserLogin(userData.email);
      if (!user) {
        user = await createUserOAuth(userData.username, userData.email, userData.avatar);
      }

      // Générer JWT et cookie
      const jwtToken = fastify.jwt.sign({ userId: user.id });
      
      // Store token in localStorage via a cookie that the frontend can read
      reply
        .setCookie('sessionid', jwtToken, {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: 'lax', // Use 'lax' instead of 'none'
          secure: process.env.NODE_ENV === 'production'
        })
        // Set a non-httpOnly cookie that frontend JS can access to know auth state
        .setCookie('auth_token', 'true', {
          httpOnly: false,
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        })
        .redirect('/home');

    } catch (err) {
      fastify.log.error(err);
      return reply.redirect('/login?error=auth_failed');
    }
  });
}