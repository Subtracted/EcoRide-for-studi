# EcoRide - Application de covoiturage écologique

## Description
EcoRide est une application de covoiturage écologique développée avec React et Node.js. Elle permet aux utilisateurs de proposer et réserver des trajets, avec un système de crédits et une validation des trajets écologiques.


## Stack technique
### Frontend
- React.js 18
- React Router v6
- Context API pour la gestion d'état
- CSS Modules pour le style

### Backend
- Node.js
- Express.js
- PostgreSQL (base de données principale)
- JWT pour l'authentification
- Bcrypt pour le hashage des mots de passe

### Outils de développement
- Git pour le versioning
- ESLint pour la qualité du code
- Prettier pour le formatage
- Nodemon pour le développement

## Prérequis
- Node.js v18+
- PostgreSQL 14+
- npm ou yarn

## Installation locale

### Étapes d'installation

1. Cloner le projet
```bash
git clone https://github.com/Subtracted/EcoRide-for-studi
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer la base de données
```bash
# Créer la base de données
psql -U postgres
CREATE DATABASE ecoride;
\q

# Importer la structure et les données
psql -U postgres -d ecoride -f migrations/database.sql
```


### Collections MongoDB
- connection_logs : Logs de connexion des utilisateurs
- daily_stats : Statistiques journalières
- ecoride : Données principales
- trajet_logs : Logs des trajets

4. Configurer l'environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Modifier les variables dans .env
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_DATABASE=ecoride
JWT_SECRET=votre_secret
```

5. Lancer l'application
```bash
npm start
```


## Sécurité
- Authentification JWT
- Hashage des mots de passe avec bcrypt
- Validation des entrées
- Protection CSRF

