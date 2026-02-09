# Utiliser une image Node stable (Vite 7 nécessite Node 20+)
FROM node:22-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers
COPY . .

# Exposer le port de Vite
EXPOSE 5173

# Lancer l'application en mode développement
# --host est nécessaire pour que le port soit accessible hors du container
CMD ["npm", "run", "dev", "--", "--host"]
