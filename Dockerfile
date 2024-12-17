# Étape 1 : Utiliser l'image officielle de Node.js 22
FROM node:22-alpine

# Étape 2 : Définir le répertoire de travail
WORKDIR /app

# Étape 3 : Copier les fichiers package.json et package-lock.json
COPY package.json package-lock.json ./

# Étape 4 : Installer les dépendances
RUN npm install --production

# Étape 5 : Copier le reste des fichiers
COPY . .

# Étape 6 : Exposer le port 3030
EXPOSE 3030

# Étape 7 : Démarrer l'application
CMD ["node", "index.js"]