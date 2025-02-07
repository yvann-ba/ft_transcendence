# Utiliser une image Node.js
FROM node:18

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json pour installer les dépendances
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm install

# Copier tous les fichiers du frontend dans le conteneur
COPY . .

# Exposer le port
EXPOSE 8080

# Démarrer Vite en mode dev
CMD ["npm", "run", "dev"]
