# 🔧 Guide de configuration Google OAuth

## État actuel
✅ **Serveurs fonctionnels :**
- Backend Laravel : http://127.0.0.1:8081
- Frontend React : http://localhost:8080

❌ **Google OAuth désactivé temporairement**
- Les boutons Google OAuth sont désactivés
- Utilisez l'authentification par email/mot de passe pour tester

## 📋 Pour activer Google OAuth

### 1. Créer le projet Google Cloud
1. Allez sur https://console.cloud.google.com/
2. Créez un nouveau projet : "mindful-journey-app"
3. Activez l'API "Google Identity Services"

### 2. Configurer l'écran de consentement
- Type : Externe
- Nom de l'application : Mindful Journey
- Email d'assistance : votre email
- Utilisateurs de test : ajoutez votre email

### 3. Créer les identifiants OAuth
- Type : Application Web
- Origines JavaScript autorisées :
  ```
  http://localhost:8080
  http://127.0.0.1:8080
  ```
- URI de redirection (optionnel pour ce mode) :
  ```
  http://127.0.0.1:8081/api/auth/google/callback
  ```

### 4. Configurer les fichiers d'environnement

**Frontend (.env) :**
```env
# Configuration Google OAuth
VITE_GOOGLE_CLIENT_ID=votre_client_id_ici
```

**Backend (.env) :**
```env
GOOGLE_CLIENT_ID=votre_client_id_ici
GOOGLE_CLIENT_SECRET=votre_client_secret_ici
```

### 5. Redémarrer les serveurs
```powershell
# Arrêter les serveurs actuels (Ctrl+C dans chaque terminal)
# Puis redémarrer :
npm run dev  # Frontend
cd back-mindful-journey-iu/mindful-journey-back && php artisan serve --port=8081  # Backend
```

## 🧪 Test de l'authentification

En attendant la configuration Google OAuth, vous pouvez :

1. **Créer un compte** avec email/mot de passe
2. **Se connecter** avec les utilisateurs de test existants :
   - Email : `alice.martin@email.com` / Mot de passe : `password123`
   - Email : `julien.durand@email.com` / Mot de passe : `password123`
   - Email : `sophie.bernard@email.com` / Mot de passe : `password123`

## 📱 Application prête !

L'application fonctionne parfaitement avec :
- ✅ Authentification par email/mot de passe
- ✅ Gestion des profils
- ✅ Interface personnalisée
- ✅ Toutes les fonctionnalités de bien-être
- ⏳ Google OAuth (à configurer selon vos besoins)

---

**Note :** Les boutons Google OAuth affichent maintenant un message informatif au lieu de générer une erreur.
