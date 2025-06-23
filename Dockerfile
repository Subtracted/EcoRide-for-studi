# Dockerfile multi-stage pour EcoRide
# Stage 1: Build de l'application React
FROM node:18-alpine AS react-build

WORKDIR /app

# Copie des fichiers de dépendances React
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copie du code source React
COPY src/ ./src/
COPY public/ ./public/

# Build de production React
RUN npm run build

# Stage 2: Application Node.js finale
FROM node:18-alpine AS production

# Variables d'environnement
ENV NODE_ENV=production

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Répertoire de travail
WORKDIR /app

# Installation des dépendances système nécessaires
RUN apk add --no-cache \
    postgresql-client \
    curl

# Copie des fichiers de dépendances du serveur
COPY package.json package-lock.json ./
COPY routes/ ./routes/
COPY middleware/ ./middleware/
COPY services/ ./services/
COPY migrations/ ./migrations/
COPY server.js ./
COPY db.js ./

# Installation des dépendances de production uniquement
RUN npm ci --only=production && npm cache clean --force

# Copie du build React depuis le stage précédent
COPY --from=react-build /app/build ./build

# Création des répertoires nécessaires
RUN mkdir -p logs uploads temp

# Attribution des permissions au bon utilisateur
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exposition du port
EXPOSE 3001

# Health check pour vérifier la santé du conteneur
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Commande de démarrage
CMD ["node", "server.js"] 