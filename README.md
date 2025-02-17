# EcoRide

## Configuration

1. Créer un compte sur [Resend](https://resend.com)
2. Obtenir une clé API
3. Copier le fichier `.env.example` en `.env`
4. Remplir les variables d'environnement dans `.env` avec vos propres valeurs

## Variables d'environnement requises

- `RESEND_API_KEY` : Votre clé API Resend
- `JWT_SECRET` : Une chaîne aléatoire pour sécuriser les tokens
- `DB_USER` : Utilisateur de la base de données
- `DB_PASSWORD` : Mot de passe de la base de données

## Configuration des emails

Pour la gestion des emails, plusieurs options sont possibles :

1. **Configuration Gmail** :
   - Créer un compte Gmail
   - Activer l'authentification à 2 facteurs
   - Générer un mot de passe d'application
   - Ajouter les identifiants dans le fichier .env

2. **Alternative sans email** :
   Les emails peuvent être désactivés en commentant les lignes concernées dans :
   - server.js : rechercher "transporter.sendMail"
   - src/services/emailService.js

3. **Pour les tests** :
   Utiliser console.log pour simuler l'envoi d'emails : 

# Installation

1. Cloner le projet :
   ```bash
   git clone [url-du-projet]
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Configurer les variables d'environnement :
   - Copier `.env.example` en `.env`
   - Créer un compte sur Resend.com
   - Obtenir une clé API
   - Remplir `.env` avec vos informations

4. Démarrer le projet :
   ```bash
   npm start
   ``` 