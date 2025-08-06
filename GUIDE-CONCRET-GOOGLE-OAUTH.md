# 🚀 CONFIGURATION GOOGLE OAUTH - EXEMPLE CONCRET

## 📸 Étape 1 : Créer votre projet Google

1. **Allez sur [Google Cloud Console](https://console.cloud.google.com/)**
2. **Créez un nouveau projet** :
   ```
   Nom du projet : Mindful Journey
   ```
3. **Activez les APIs nécessaires** :
   - Google+ API (legacy)
   - People API
   - Google OAuth2 API

## 🔑 Étape 2 : Créer les credentials OAuth

1. **Allez dans "APIs & Services" > "Credentials"**
2. **Cliquez "CREATE CREDENTIALS" > "OAuth 2.0 Client IDs"**
3. **Configurez l'écran de consentement OAuth** :
   ```
   User Type : External
   App name : Mindful Journey
   User support email : votre-email@gmail.com
   Developer contact : votre-email@gmail.com
   ```

4. **Créez OAuth 2.0 Client ID** :
   ```
   Application type : Web application
   Name : Mindful Journey Web Client
   ```

5. **IMPORTANT - Configurez exactement ces URIs** :

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

## 📝 Étape 3 : Configuration dans votre projet

Une fois vos credentials créés, vous obtiendrez :
- **Client ID** : quelque chose comme `123456789-abc123def456.apps.googleusercontent.com`
- **Client Secret** : quelque chose comme `GOCSPX-AbCdEf123456`

**Ajoutez-les dans le fichier `.env` du backend** :

```env
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEf123456
```

## 🧪 Étape 4 : Test de la configuration

Une fois configuré, testez avec :
```powershell
.\test-google-oauth.ps1
```

Ou testez directement dans le navigateur :
```
http://127.0.0.1:8081/api/auth/google
```

## 🎯 Flux d'authentification Google

1. **Frontend** appelle : `GET /api/auth/google`
2. **Backend** redirige vers Google avec vos credentials
3. **Utilisateur** s'authentifie sur Google
4. **Google** redirige vers : `http://127.0.0.1:8081/api/auth/google/callback`
5. **Backend** récupère les informations utilisateur de Google
6. **Backend** crée/met à jour l'utilisateur en base
7. **Backend** retourne un token d'authentification au frontend

## ⚠️ Dépannage

**Erreur "Session store not set on request"** :
- Vérifiez que GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET sont bien configurés
- Vérifiez que les URIs de redirection sont exactement ceux configurés

**Erreur "redirect_uri_mismatch"** :
- Vérifiez que l'URI de redirection dans Google Cloud Console est exactement :
  `http://127.0.0.1:8081/api/auth/google/callback`

**Erreur "access_denied"** :
- L'utilisateur a refusé l'autorisation Google
- C'est normal pendant les tests

## 🎉 Test de succès

Si tout fonctionne, vous devriez voir :
1. La redirection vers Google fonctionne
2. Après connexion Google, redirection vers votre callback
3. Création automatique du compte utilisateur
4. Token d'authentification généré

Votre application supportera alors :
- ✅ Inscription/connexion classique
- ✅ Inscription/connexion via Google
- ✅ Fusion automatique des comptes par email
