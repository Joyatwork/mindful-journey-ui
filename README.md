# Mindful Journey UI - Application de Bien-être Mental

Une application complète de suivi du bien-être mental avec authentification, suivi de l'humeur, méditation, et gestion de rendez-vous avec des professionnels de santé.

## 🚀 Fonctionnalités

### ✅ Authentification
- Inscription et connexion avec email/mot de passe
- Gestion de sessions avec Laravel Sanctum
- Système de protection des routes
- Gestion de profil utilisateur avec mise à jour en temps réel

### ✅ Suivi du bien-être
- **Tracker d'humeur** : Suivi quotidien de l'état émotionnel
- **Méditation** : Sessions guidées et suivi des pratiques
- **Graphiques de progression** : Visualisation des données sur 7 jours
- **Objectifs personnalisés** : Définition et suivi d'objectifs de bien-être

### ✅ Rendez-vous médicaux
- Liste des professionnels de santé disponibles
- Système de réservation de rendez-vous
- Gestion du calendrier personnel

### ✅ Interface utilisateur
- Design moderne avec Tailwind CSS et shadcn/ui
- Interface responsive (mobile et desktop)
- Thème adaptatif
- Navigation intuitive

## 🛠 Stack Technique

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build et le développement
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants
- **React Router** pour la navigation
- **Context API** pour la gestion d'état

### Backend
- **Laravel 10+** avec PHP
- **Laravel Sanctum** pour l'authentification API
- **SQLite** pour la base de données (développement)
- **API RESTful** avec réponses JSON

## 📦 Installation et Démarrage

### Prérequis
- Node.js 18+ et npm
- PHP 8.1+ avec Composer
- Git

### 1. Cloner le repository
```bash
git clone https://github.com/Joyatwork/mindful-journey-ui.git
cd mindful-journey-ui
```

### 2. Configuration du Frontend
```bash
# Installer les dépendances
npm install

# Créer le fichier d'environnement (si nécessaire)
# Le fichier .env est déjà inclus dans le projet
```

### 3. Configuration du Backend
```bash
# Aller dans le dossier backend
cd back-mindful-journey-iu/mindful-journey-back

# Installer les dépendances PHP
composer install

# Créer le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Créer la base de données et lancer les migrations
php artisan migrate

# Peupler la base avec des données de test
php clean_and_populate.php
```

### 4. Démarrage en développement

**Option 1 : Script automatique (recommandé)**
```bash
# Depuis la racine du projet (Windows)
./start-dev.ps1
```

**Option 2 : Démarrage manuel**
```bash
# Terminal 1 : Backend Laravel
cd back-mindful-journey-iu/mindful-journey-back
php artisan serve --host=127.0.0.1 --port=8081

# Terminal 2 : Frontend React
# Depuis la racine du projet
npm run dev
```

### 5. Accès à l'application
- Frontend : http://localhost:3000 (ou le port affiché par Vite)
- Backend API : http://127.0.0.1:8081

## 👥 Comptes de test

Pour tester l'application, utilisez ces comptes :

```
Email: john.doe@example.com
Mot de passe: password123

Email: test@example.com  
Mot de passe: password123
```

## 📱 Pages disponibles

### Pages publiques
- `/login` - Connexion et inscription
- `/` - Page d'accueil (redirige vers login si non connecté)

### Pages protégées (nécessitent une connexion)
- `/dashboard` - Tableau de bord principal
- `/mood` - Tracker d'humeur
- `/meditation` - Hub de méditation
- `/profile` - Gestion du profil
- `/appointments` - Rendez-vous médicaux

### Pages de développement/test
- `/api-test` - Tests des APIs
- `/auth-test` - Tests d'authentification
- `/database-viewer` - Visualisation de la base de données

## 🗃 Structure du projet

```
mindful-journey-ui/
├── src/                          # Code source frontend
│   ├── components/              # Composants React réutilisables
│   ├── pages/                   # Pages de l'application
│   ├── contexts/               # Contexts React (AuthContext)
│   ├── hooks/                   # Hooks personnalisés
│   └── lib/                     # Utilitaires et services API
├── back-mindful-journey-iu/     # Backend Laravel
│   └── mindful-journey-back/
│       ├── app/                 # Code source Laravel
│       ├── database/            # Migrations et seeders
│       ├── routes/              # Routes API
│       └── config/              # Configuration Laravel
├── public/                      # Assets statiques
└── docs/                        # Documentation
```

## 🔧 Scripts disponibles

### Frontend
```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Preview du build
npm run lint         # Vérification du code
```

### Backend
```bash
php artisan serve    # Serveur de développement
php artisan migrate  # Migrations de base de données
php artisan db:seed  # Insertion de données de test
php artisan tinker   # Console interactive
```

## 🚀 Déploiement

### Frontend (Vercel/Netlify)
1. Build du projet : `npm run build`
2. Déployer le dossier `dist/`
3. Configurer les variables d'environnement

### Backend (Laravel)
1. Configurer l'environnement de production
2. Optimiser les routes et configurations
3. Configurer la base de données de production
4. Déployer sur un serveur compatible PHP

## 🤝 Contribution

### Workflow Git
1. Créer une branche depuis `main` : `git checkout -b feature/nom-feature`
2. Développer et commiter les changements
3. Pousser la branche : `git push origin feature/nom-feature`
4. Créer une Pull Request vers `main`

### Standards de code
- **Frontend** : ESLint + Prettier configurés
- **Backend** : PSR-12 + Laravel standards
- **Commits** : Messages descriptifs en français ou anglais

## 📚 Documentation technique

- [Guide de démarrage détaillé](GUIDE-DEMARRAGE.md)
- [Intégration backend](README-BACKEND-INTEGRATION.md)
- [Tests et rapports](RAPPORT-TESTS-OAUTH.md)

## 🐛 Problèmes connus et solutions

- **Données de profil** : Système de persistance amélioré avec récupération automatique des données fraîches
- **CORS** : Configuration automatique pour le développement local
- **Base de données** : Script de nettoyage et population inclus

## 📞 Support

Pour toute question ou problème :
1. Vérifier la documentation existante dans le dossier du projet
2. Consulter les fichiers de test et d'exemple
3. Contacter l'équipe de développement

---

**Version actuelle** : 1.0.0  
**Dernière mise à jour** : Août 2025  
**Équipe** : Joyatwork Development Team

## Project info (Lovable)

**URL**: https://lovable.dev/projects/4b8db73f-378a-4ee5-98e9-03c55f5fe1e7

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4b8db73f-378a-4ee5-98e9-03c55f5fe1e7) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4b8db73f-378a-4ee5-98e9-03c55f5fe1e7) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
