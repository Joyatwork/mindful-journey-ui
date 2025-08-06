# Mindful Journey - Guide de Démarrage

## 🎯 Vue d'ensemble du projet

**Mindful Journey** est une application de bien-être mental avec :
- **Frontend** : React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend** : Laravel 12 + PHP 8.2
- **Base de données** : SQLite
- **Authentification** : Laravel Sanctum + Google OAuth

## ⚡ Démarrage rapide

### Option 1 : Script automatique (Recommandé)
```powershell
.\start-project.ps1
```

### Option 2 : Démarrage manuel

#### Backend Laravel
```powershell
cd back-mindful-journey-iu\mindful-journey-back
php artisan serve --host=127.0.0.1 --port=8081
```

#### Frontend React
```powershell
npm run dev
```

## 🔗 URLs d'accès

- **Application** : http://localhost:8080
- **API Backend** : http://127.0.0.1:8081/api
- **Documentation API** : voir section ci-dessous

## 🔐 Fonctionnalités d'authentification

### Inscription/Connexion classique
- **Inscription** : `POST /api/auth/register`
- **Connexion** : `POST /api/auth/login`
- **Déconnexion** : `POST /api/auth/logout` (avec token)
- **Profil utilisateur** : `GET /api/auth/user` (avec token)

### Google OAuth
- **Redirection Google** : `GET /api/auth/google`
- **Callback Google** : `GET /api/auth/google/callback`
- **Login frontend** : `POST /api/auth/google/login`

## 🗄️ Base de données

La base de données SQLite est automatiquement configurée avec :
- ✅ Tables utilisateurs avec champs OAuth
- ✅ Tables de sessions et cache
- ✅ Tables pour les fonctionnalités wellness (mood, meditation)
- ✅ Système de tokens d'accès personnel (Sanctum)

**Emplacement** : `back-mindful-journey-iu/mindful-journey-back/database/database.sqlite`

## 🔧 Configuration Google OAuth

1. **Créer un projet Google Cloud Console**
2. **Activer l'API Google OAuth2**
3. **Configurer les credentials OAuth 2.0**
4. **Ajouter les variables dans `.env`** :
   ```env
   GOOGLE_CLIENT_ID=votre_client_id
   GOOGLE_CLIENT_SECRET=votre_client_secret
   ```

📖 **Voir** : `CONFIGURATION-GOOGLE-OAUTH.md` pour les détails complets

## 📁 Structure du projet

```
mindful-journey-ui/
├── 📱 Frontend React
│   ├── src/
│   │   ├── components/     # Composants UI
│   │   ├── pages/         # Pages de l'application
│   │   ├── contexts/      # Context React (Auth, Theme)
│   │   ├── hooks/         # Hooks personnalisés
│   │   └── lib/          # Utilitaires et API
│   ├── package.json
│   └── .env
└── 🔧 Backend Laravel
    ├── app/Http/Controllers/Api/  # Controllers API
    ├── routes/api.php            # Routes API
    ├── database/                 # Migrations et SQLite
    ├── composer.json
    └── .env
```

## 🧪 Tests API

### Test de base
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8081/api/test/login" -Method POST -ContentType "application/json"
```

### Test d'inscription
```powershell
$body = @{
    name = "John Doe"
    email = "john@example.com"
    password = "password123"
    password_confirmation = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://127.0.0.1:8081/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

## 🚀 Prochaines étapes

1. ✅ **Serveurs démarrés**
2. ⏳ **Configurer Google OAuth** (optionnel)
3. ⏳ **Tester l'authentification**
4. ⏳ **Explorer les fonctionnalités wellness**

## 🛠️ Dépendances installées

### Frontend
- ✅ React 18 + TypeScript
- ✅ Vite (serveur de développement)
- ✅ Tailwind CSS + shadcn/ui
- ✅ React Router + React Query
- ✅ Support Google OAuth

### Backend
- ✅ Laravel 12 + PHP 8.2
- ✅ Laravel Sanctum (authentification)
- ✅ Laravel Socialite (OAuth)
- ✅ SQLite configurée
- ✅ Migrations exécutées

## 📞 Support

En cas de problème :
1. Vérifier que les serveurs sont démarrés
2. Contrôler les logs dans les terminaux
3. Vérifier la configuration `.env`
4. Consulter la documentation Laravel/React
