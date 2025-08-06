# 🔐 Configuration Google OAuth - Guide Interactif

## 📋 Étapes de configuration

### ÉTAPE 1 : Créer un projet Google Cloud Console

1. **Allez sur [Google Cloud Console](https://console.cloud.google.com/)**
2. **Créez un nouveau projet** :
   - Nom suggéré : "Mindful Journey"
   - Cliquez sur "CREATE"

### ÉTAPE 2 : Activer l'API Google OAuth

1. **Dans votre projet, allez dans "APIs & Services" > "Library"**
2. **Recherchez "Google+ API"** et activez-la
3. **Recherchez "People API"** et activez-la aussi

### ÉTAPE 3 : Configurer OAuth 2.0

1. **Allez dans "APIs & Services" > "Credentials"**
2. **Cliquez sur "CREATE CREDENTIALS" > "OAuth 2.0 Client IDs"**
3. **Configurez l'écran de consentement OAuth** (si demandé) :
   - User Type : External
   - App name : Mindful Journey
   - User support email : votre email
   - Developer contact : votre email

4. **Créez les OAuth 2.0 Client IDs** :
   - Application type : Web application
   - Name : Mindful Journey Web Client

5. **Ajoutez les URIs autorisées** :
   
   **Authorized JavaScript origins :**
   ```
   http://localhost:8080
   http://localhost:5173
   http://127.0.0.1:8081
   ```
   
   **Authorized redirect URIs :**
   ```
   http://127.0.0.1:8081/api/auth/google/callback
   ```

6. **Sauvegardez et récupérez** :
   - Client ID
   - Client Secret

### ÉTAPE 4 : Configuration dans votre projet

Une fois les credentials obtenus, ajoutez-les dans le fichier `.env` :

```env
GOOGLE_CLIENT_ID=votre_client_id_ici
GOOGLE_CLIENT_SECRET=votre_client_secret_ici
```

## 🧪 Test après configuration

Une fois configuré, testez avec :
```powershell
.\test-google-oauth.ps1
```

## 🔗 URLs importantes pour les tests

- **Redirection Google** : http://127.0.0.1:8081/api/auth/google
- **Callback Google** : http://127.0.0.1:8081/api/auth/google/callback
- **Frontend** : http://localhost:8080

## ⚠️ Notes importantes

1. **URLs de développement** : Les URLs configurées sont pour le développement local
2. **Production** : Pour la production, vous devrez ajouter vos vrais domaines
3. **Sécurité** : Ne jamais commiter vos credentials dans le code source

## 🚀 Après configuration

Votre application supportera :
- ✅ Inscription/connexion classique (déjà fonctionnel)
- ✅ Inscription/connexion via Google
- ✅ Fusion automatique des comptes par email
- ✅ Avatar et informations Google récupérées automatiquement
