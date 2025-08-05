# Mindful Journey UI - Application de Bien-être Mental

Une application complète de suivi du bien-être mental avec authentification sécurisée, suivi de l'humeur, méditation, et gestion de rendez-vous avec des professionnels de santé.

## 🎯 Vision du Projet

**Connexion sécurisée via email ou lien magique - RGPD consentement / onboarding léger**

Cette application privilégie la simplicité d'utilisation tout en respectant les normes de sécurité et de confidentialité les plus strictes.

## 🚀 Fonctionnalités Principales

### 🔐 Authentification Sécurisée
- **Connexion par email/mot de passe** - Système d'authentification traditionnel
- **Lien magique** *(roadmap)* - Connexion sans mot de passe via email
- **Protection des données** - Chiffrement et sécurisation des sessions
- **Conformité RGPD** - Gestion du consentement et protection des données personnelles

### 🧠 Suivi du Bien-être
- **Tracker d'humeur quotidien** - Suivi simple et intuitif de l'état émotionnel
- **Sessions de méditation guidées** - Bibliothèque de méditations avec suivi des progrès
- **Graphiques de progression** - Visualisation des données sur 7 jours
- **Objectifs personnalisés** - Définition d'objectifs de bien-être adaptés

### 👩‍⚕️ Accompagnement Professionnel
- **Annuaire de professionnels** - Liste des thérapeutes et professionnels de santé
- **Prise de rendez-vous** - Système de réservation intégré
- **Gestion du calendrier** - Suivi des rendez-vous et rappels

### 🎨 Expérience Utilisateur
- **Onboarding léger** - Processus d'inscription simplifié avec consentement RGPD
- **Interface intuitive** - Design moderne et accessible
- **Responsive design** - Optimisé mobile et desktop
- **Thème adaptatif** - Mode clair/sombre

## 🛠 Stack Technique

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build et développement rapide
- **Tailwind CSS** + **shadcn/ui** pour le design system
- **React Router** pour la navigation
- **Context API** pour la gestion d'état

### Backend
- **Laravel 10+** avec PHP 8.1+
- **Laravel Sanctum** pour l'authentification API sécurisée
- **SQLite** (développement) / **MySQL** (production)
- **API RESTful** avec validation et sécurisation

### Sécurité & Conformité
- **Chiffrement des données** sensibles
- **Validation côté serveur** de toutes les entrées
- **Gestion du consentement RGPD** intégrée
- **Audit trail** pour la traçabilité

## � Installation Rapide

```bash
# 1. Cloner le projet
git clone [url-du-repo]
cd mindful-journey-ui

# 2. Installation frontend
cd frontend
npm install

# 3. Configuration backend
cd ../backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed

# 4. Lancement automatique
cd ..
./start-project.ps1
```

### Accès
- **Application** : http://localhost:8080
- **API Backend** : http://127.0.0.1:8081

## 📁 Structure du Projet

```
mindful-journey-ui/
├── backend/                    # 🟢 Laravel API backend (ACTUEL)
│   ├── app/                   # Controllers, Models Laravel
│   ├── database/              # 📊 Base de données SQLite ACTIVE
│   └── routes/                # Routes API
├── frontend/                   # 🟢 React TypeScript frontend (ACTUEL)
│   ├── src/                   # Components React
│   └── public/                # Assets statiques
├── start-project.ps1          # 🚀 Script de démarrage automatique
├── verifier-base.bat          # 🔍 Vérification base de données ACTIVE
├── DEMARRAGE.md              # 📖 Guide de démarrage détaillé
└── ⚠️_ANCIEN_BACKEND_NE_PLUS_UTILISER_⚠️/  # ❌ OBSOLÈTE - À ignorer
```

> **⚠️ Important** : Utilisez uniquement les dossiers `backend/` et `frontend/`. 
> L'ancien dossier avec le préfixe ⚠️ est obsolète et sera supprimé.

## 👥 Comptes de Test

```
Email: john.doe@example.com
Mot de passe: password123

Email: test@example.com  
Mot de passe: password123
```

## 📱 Structure de l'Application

### Pages Utilisateur
- `/login` - Connexion sécurisée avec consentement RGPD
- `/dashboard` - Tableau de bord personnalisé
- `/mood` - Tracker d'humeur quotidien
- `/meditation` - Hub de méditation guidée
- `/profile` - Gestion du profil et préférences
- `/appointments` - Rendez-vous avec professionnels

### Fonctionnalités RGPD
- **Consentement éclairé** lors de l'inscription
- **Gestion des préférences** de confidentialité
- **Export de données** personnelles
- **Suppression de compte** avec effacement des données

## 🔧 Développement

### Frontend
```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Preview du build
```

### Backend
```bash
php artisan serve    # Serveur de développement
php artisan migrate  # Migrations de base
php artisan tinker   # Console interactive
```

## 🚀 Déploiement

### Frontend (Vercel/Netlify)
- Build automatique depuis GitHub
- Variables d'environnement configurées
- HTTPS automatique

### Backend (Production)
- Serveur PHP compatible Laravel
- Base de données MySQL/PostgreSQL
- SSL/TLS obligatoire
- Sauvegarde automatique

## 🤝 Contribution

### Workflow Git
```bash
git checkout -b feature/nouvelle-fonctionnalite
# Développement...
git push origin feature/nouvelle-fonctionnalite
# Pull Request vers main
```

### Standards
- **Code** : ESLint + Prettier (Frontend), PSR-12 (Backend)
- **Commits** : Messages descriptifs et conventionnels
- **Tests** : Couverture obligatoire pour les nouvelles fonctionnalités

## 📚 Documentation

- [Guide de démarrage détaillé](GUIDE-DEMARRAGE.md)
- [Intégration backend](README-BACKEND-INTEGRATION.md)
- [Conformité RGPD](docs/rgpd.md) *(à venir)*

---

**Version** : 1.0.0  
**Équipe** : Joyatwork Development Team  
**Contact** : [Créer une issue](https://github.com/Joyatwork/mindful-journey-ui/issues)

## Project Info (Lovable)

**URL**: https://lovable.dev/projects/4b8db73f-378a-4ee5-98e9-03c55f5fe1e7

### Technologies Used
- Vite
- TypeScript  
- React
- shadcn-ui
- Tailwind CSS
- Laravel (Backend)

### Quick Start (Lovable)
```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

### Déploiement
Simply open [Lovable](https://lovable.dev/projects/4b8db73f-378a-4ee5-98e9-03c55f5fe1e7) and click on Share → Publish.
