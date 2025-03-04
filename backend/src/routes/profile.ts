import { FastifyInstance } from "fastify";
import axios from "axios";

export default async function profileRoutes(fastify: FastifyInstance) {
    fastify.get('/api/user/profile', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        try {
            // Récupérer l'utilisateur depuis la base de données
            const user = await fastify.db.getUserById(request.user.id);
            
            // Si l'utilisateur s'est connecté via 42 et que vous avez stocké son access token
            if (user.oauth === '42' && user.oauthAccessToken) {
                try {
                    // Vous pouvez rafraîchir les données de 42 si besoin
                    const userResponse = await axios.get("https://api.intra.42.fr/v2/me", {
                        headers: { Authorization: `Bearer ${user.oauthAccessToken}` }
                    });
                    
                    // Mise à jour des données utilisateur si nécessaire
                    // ...
                    
                    return reply.send({
                        id: user.id,
                        login: user.username,
                        displayname: user.displayName,
                        image: { link: user.profileImage },
                        // Autres données à renvoyer
                    });
                } catch (apiError) {
                    // En cas d'erreur avec l'API 42, renvoyer les données locales
                    return reply.send({
                        id: user.id,
                        login: user.username,
                        displayname: user.displayName,
                        image: { link: user.profileImage }
                    });
                }
            } else {
                // Utilisateur normal, renvoyer ses données
                return reply.send({
                    id: user.id,
                    login: user.username,
                    displayname: user.displayName,
                    image: { link: user.profileImage || '/assets/default-avatar.png' }
                });
            }
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: "Erreur lors de la récupération du profil" });
        }
    });
}