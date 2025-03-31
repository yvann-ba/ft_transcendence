import { FastifyInstance } from 'fastify';
import config from '../config/fastifyconfig';
import { checkUserLogin, createUserOAuth, checkUserByGoogleId, updateUserAvatar } from '../queries/users';

export default async function oauthGoogleRoutes(fastify: FastifyInstance) {

  // Redirection vers Google pour connexion
  fastify.get('/auth/google', async (request, reply) => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.googleClientId}&redirect_uri=${encodeURIComponent(config.googleRedirectUri as string|number|boolean)}&response_type=code&scope=openid%20email%20profile`;
    reply.redirect(url);
  });

  // Callback Google
  fastify.get('/auth/google/callback', async (request, reply) => {
    
    console.log("1. Callback route reached");
    const code = (request.query as any).code as string;
    console.log("2. Auth code received:", code ? "Yes" : "No");
    if (!code) return reply.redirect('/login?error=auth_failed');

    try {
      console.log("3. Starting token exchange with Google");
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

      console.log("4. Token response received:", tokenRes.status);
      const tokenData = await tokenRes.json();
      console.log("5. Token data parsed");
      if (!tokenRes.ok) throw new Error(tokenData.error_description || 'Erreur OAuth Google');

      const accessToken = tokenData.access_token;
      console.log("6. Access token extracted:", accessToken ? "Yes" : "No");
      if (!accessToken) throw new Error('Access token not received from Google');

      // Récupérer les informations de l'utilisateur
      console.log("7. Fetching user info from Google");
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      console.log("8. User info response:", userRes.status);
      if (!userRes.ok) {
        throw new Error(`Failed to fetch user info: ${userRes.status} ${userRes.statusText}`);
      }

      console.log("9. Parsing user data from Google");
      const googleUser = await userRes.json();
      console.log("10. Google user data:", JSON.stringify(googleUser));

      // Formater les données de l'utilisateur
      const firstName = googleUser.given_name || "Firstname";
      const lastName = googleUser.family_name || "Lastname";

      const username = lastName.toLowerCase() + firstName.toLowerCase() + Math.floor(Math.random() * 100000);

      const userData = {
        username: username,
        googleID: googleUser.id,
        firstName: firstName,
        lastName: lastName,
        email: googleUser.email,
        avatar: googleUser.picture,
      };
      
      fastify.log.info(`User data: ${JSON.stringify(userData)}`);

      console.log('11. Formatted user data:', userData);
      fastify.log.info(`12. User data for fastify logger: ${JSON.stringify(userData)}`);
      console.log("13. Google picture URL:", googleUser.picture);

      // Vérifier si utilisateur existe, sinon le créer
      let user = await checkUserByGoogleId(userData.googleID);
      fastify.log.info(`User found: ${JSON.stringify(user)}`);
      if (user === null) {
        user = await createUserOAuth(userData.googleID, userData.username, userData.firstName, userData.lastName, userData.email, userData.avatar);
      } else {
        // Update the avatar for existing users
        if (user.avatar !== userData.avatar) {
          user = await updateUserAvatar(user.id, userData.avatar);
          fastify.log.info(`Updated user avatar: ${user.avatar}`);
        }
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
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <script>
                // This page will be loaded in the popup
                if (window.opener) {
                    // Communicate success to the opener window
                    window.opener.postMessage('auth-success', window.location.origin);
                    window.close();
                } else {
                    // Fallback if somehow not in a popup
                    window.location.href = '/home';
                }
            </script>
        </head>
        <body>Authentication successful! You can close this window.</body>
        </html>
    `;
    
    reply.type('text/html').send(html);

    } catch (err) {
      fastify.log.error(err);
      return reply.redirect('/login?error=auth_failed');
    }
  });
}