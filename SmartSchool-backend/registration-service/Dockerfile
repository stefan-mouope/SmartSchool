FROM node:20-alpine

WORKDIR /usr/src/app

# Copier uniquement les fichiers nécessaires
COPY package*.json ./
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port de ton app en dev
EXPOSE 3000

# Lancer le serveur en mode dev (avec ts-node-dev si tu l’utilises)
CMD ["npm", "run", "dev"]
