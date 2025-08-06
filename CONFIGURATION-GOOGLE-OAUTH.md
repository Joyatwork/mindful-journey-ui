# Configuration Google OAuth

## Étapes pour configurer Google OAuth

### 1. Créer un projet Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ API et Google OAuth2 API

### 2. Configurer OAuth 2.0

1. Dans la console Google Cloud, allez dans "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "OAuth 2.0 Client IDs"
3. Sélectionnez "Web application"
4. Configurez les URIs autorisées :
   - **Authorized JavaScript origins** : 
     - `http://localhost:8080` (frontend)
     - `http://localhost:5173` (frontend alternatif)
   - **Authorized redirect URIs** :
     - `http://127.0.0.1:8081/api/auth/google/callback` (backend)

### 3. Configuration des variables d'environnement

Une fois les credentials obtenus, ajoutez-les dans le fichier `.env` du backend :

```env
GOOGLE_CLIENT_ID=votre_client_id_google
GOOGLE_CLIENT_SECRET=votre_client_secret_google
```

### 4. Fichiers de configuration déjà en place

✅ **Backend (Laravel)** :
- Routes d'authentification configurées dans `routes/api.php`
- Controller `GoogleAuthController` pour gérer l'OAuth
- Configuration Socialite pour Google
- Base de données SQLite configurée
- Migrations exécutées

✅ **Frontend (React)** :
- Configuration des types Google OAuth dans `package.json`
- Variables d'environnement pour l'API dans `.env`

## URLs de test

- **Frontend** : http://localhost:8080
- **Backend API** : http://127.0.0.1:8081/api
- **Test d'authentification** : http://127.0.0.1:8081/api/auth/google

## Prochaines étapes

1. Configurer les credentials Google OAuth
2. Tester l'inscription/connexion classique
3. Tester l'authentification Google
4. Vérifier la persistance des sessions
