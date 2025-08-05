# Configuration Google OAuth - Guide Rapide

## Étapes pour configurer Google OAuth

### 1. Créer un projet Google Cloud
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Nom du projet suggéré : `mindful-journey-oauth`

### 2. Activer l'API Google OAuth
1. Dans le menu de navigation, allez à "APIs & Services" > "Library"
2. Recherchez "Google+ API" ou "People API"
3. Cliquez sur "Enable"

### 3. Créer les identifiants OAuth
1. Allez à "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "OAuth Client ID"
3. Si c'est votre première fois, configurez l'écran de consentement OAuth :
   - Type d'application : External
   - Nom de l'application : "Mindful Journey"
   - Email de support : votre email
   - Domaines autorisés : `localhost`

### 4. Configurer le Client ID
1. Type d'application : "Web application"
2. Nom : "Mindful Journey Web Client"
3. Origines JavaScript autorisées :
   - `http://localhost:8080`
   - `http://127.0.0.1:8080`
4. URIs de redirection autorisées :
   - `http://localhost:8080`
   - `http://127.0.0.1:8080`

### 5. Copier le Client ID
1. Une fois créé, copiez le "Client ID" (format : xxxx.apps.googleusercontent.com)
2. Remplacez dans votre fichier `.env` :
   ```
   VITE_GOOGLE_CLIENT_ID=votre_vrai_client_id_ici
   ```

### 6. Redémarrer le serveur
```bash
# Arrêtez le serveur (Ctrl+C) puis redémarrez
npm run dev
```

## Test rapide avec un Client ID temporaire

Si vous voulez tester rapidement sans configurer Google OAuth maintenant, vous pouvez :

1. Utiliser notre système de simulation intégré
2. Tester la connexion email/mot de passe classique
3. Voir que les boutons Google apparaissent (même s'ils ne fonctionnent pas complètement)

## URLs de test

- **Application React** : http://localhost:8080
- **Backend Laravel** : http://127.0.0.1:8081
- **Page de connexion** : http://localhost:8080 (onglet "Connexion")
- **Page d'inscription** : http://localhost:8080 (onglet "Inscription")

## Que tester maintenant

1. **Interface utilisateur** : Vérifiez que les boutons Google apparaissent
2. **Connexion classique** : Testez email/mot de passe
3. **Design responsive** : Testez sur mobile
4. **Navigation** : Vérifiez les redirections après connexion

---

**Note** : Pour une utilisation en production, vous devrez aussi configurer le domaine de production dans Google Cloud Console.
