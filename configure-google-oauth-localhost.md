# Configuration Google OAuth pour Localhost

## 🚨 Problème Identifié
L'erreur "The given origin is not allowed for the given client ID" indique que localhost:8080 n'est pas autorisé.

## 🔧 Solution 1 : Modifier le Client ID Existant

1. **Aller à Google Cloud Console** :
   https://console.cloud.google.com/apis/credentials?project=mindful-journey-laravel

2. **Modifier votre Client ID** :
   - Client ID : `210024066224-tmmctnove78hoh8cnqpls2mt5iboccku.apps.googleusercontent.com`
   - Cliquer sur l'icône ✏️ pour modifier

3. **Ajouter les origines autorisées** :
   Dans "Origines JavaScript autorisées", ajoutez :
   - `http://localhost:8080`
   - `http://127.0.0.1:8080`
   - `http://localhost:3000` (au cas où)

4. **Ajouter les URI de redirection** :
   Dans "URI de redirection autorisés", ajoutez :
   - `http://localhost:8080/auth/google/callback`
   - `http://127.0.0.1:8080/auth/google/callback`

5. **Sauvegarder et attendre** :
   - Cliquer "SAUVEGARDER"
   - Attendre 5-10 minutes pour la propagation

## 🆕 Solution 2 : Créer un Nouveau Client ID

Si la solution 1 ne marche pas, créez un nouveau Client ID :

1. Dans Google Cloud Console, cliquer "CRÉER DES IDENTIFIANTS" > "ID client OAuth 2.0"
2. Type d'application : "Application Web"
3. Nom : "Mindful Journey - Localhost Dev"
4. Origines JavaScript autorisées :
   - `http://localhost:8080`
   - `http://127.0.0.1:8080`
5. URI de redirection autorisés :
   - `http://localhost:8080/auth/callback`

## ✅ Test après Configuration

Après avoir ajouté les origines :
1. Attendre 5-10 minutes
2. Rafraîchir la page http://localhost:8080/login
3. Tester le bouton Google OAuth

## 🔍 Vérification

Si le problème persiste :
- Vérifier que les origines sont bien sauvegardées
- Essayer en navigation privée
- Vérifier la console navigateur pour d'autres erreurs
