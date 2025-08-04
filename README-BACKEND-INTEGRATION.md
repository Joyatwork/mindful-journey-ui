# Mindful Journey - Application de Bien-être Mental

Une application complète de bien-être mental avec un frontend React et un backend Laravel.

## 🏗️ Architecture du Projet

```
mindful-journey-ui/
├── src/                          # Frontend React
│   ├── components/              # Composants React
│   ├── hooks/                   # Hooks personnalisés (API)
│   ├── lib/                     # Utilitaires et services API
│   └── pages/                   # Pages principales
├── back-mindful-journey-iu/     # Backend Laravel
│   └── mindful-journey-back/    # Application Laravel
└── start-dev.ps1               # Script de démarrage
```

## 🚀 Démarrage Rapide

### Prérequis
- Node.js (v18+)
- PHP (v8.1+)
- Composer
- MySQL/SQLite

### 1. Installation Frontend
```powershell
npm install
```

### 2. Installation Backend
```powershell
cd back-mindful-journey-iu\mindful-journey-back
composer install
cp .env.example .env
php artisan key:generate
```

### 3. Configuration Base de Données
Dans le fichier `.env` du backend :
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mindful_journey
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Migrations
```powershell
php artisan migrate
```

### 5. Démarrage Automatique
```powershell
.\start-dev.ps1
```

Ou démarrage manuel :
```powershell
# Terminal 1 - Backend
cd back-mindful-journey-iu\mindful-journey-back
php artisan serve

# Terminal 2 - Frontend
npm run dev
```

## 🔗 Configuration de la Connexion Frontend/Backend

### Configuration API
Le service API est configuré dans `src/lib/api.ts` :
- URL de base : `http://localhost:8000/api`
- Gestion automatique des erreurs
- Support des cookies de session

### Proxy Vite
Le fichier `vite.config.ts` configure un proxy pour éviter les problèmes CORS :
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    secure: false,
  },
}
```

### Hooks API
Utilisez les hooks dans `src/hooks/useApi.ts` :
```typescript
import { useAppointments, useSpecialists, useAuth } from '@/hooks/useApi';

// Dans un composant
const { appointments, createAppointment } = useAppointments();
const { specialists } = useSpecialists();
const { user, login, logout } = useAuth();
```

## 📡 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/user` - Utilisateur actuel

### Rendez-vous
- `GET /api/appointments` - Liste des rendez-vous
- `POST /api/appointments` - Créer un rendez-vous
- `PUT /api/appointments/{id}` - Modifier un rendez-vous
- `DELETE /api/appointments/{id}` - Supprimer un rendez-vous
- `PUT /api/appointments/{id}/cancel` - Annuler un rendez-vous

### Spécialistes
- `GET /api/specialists` - Liste des spécialistes
- `GET /api/specialists/{id}` - Détails d'un spécialiste
- `GET /api/specialists/search?q=terme` - Recherche

### Données de Santé
- `GET /api/health-data/mood` - Données d'humeur
- `POST /api/health-data/mood` - Sauvegarder humeur
- `GET /api/health-data/progress` - Données de progrès

## 🛠️ Fonctionnalités

### Frontend
- ✅ Interface utilisateur moderne (Tailwind CSS + shadcn/ui)
- ✅ Gestion d'état avec React Query
- ✅ Système de routing
- ✅ PWA (Application Web Progressive)
- ✅ Mode sombre/clair
- ✅ Responsive design

### Intégration API
- ✅ Service API centralisé
- ✅ Hooks personnalisés pour l'API
- ✅ Fallback localStorage si API indisponible
- ✅ Gestion d'erreurs
- ✅ Cache intelligent avec React Query

### Backend (Routes créées)
- 🔄 Contrôleurs API à créer
- 🔄 Modèles de données
- 🔄 Authentification Sanctum
- 🔄 Validation des données

## 🔧 Développement

### Structure des Composants
```typescript
// Exemple d'utilisation de l'API dans un composant
import { useAppointments } from '@/hooks/useApi';

const MyComponent = () => {
  const { 
    appointments, 
    isLoading, 
    createAppointment,
    updateAppointment 
  } = useAppointments();

  // Le composant fonctionne avec ou sans backend
  // Fallback automatique vers localStorage
};
```

### Ajout d'une nouvelle API
1. Ajouter l'endpoint dans `src/lib/api.ts`
2. Créer le hook dans `src/hooks/useApi.ts`
3. Utiliser le hook dans les composants

## 🐛 Dépannage

### Problèmes CORS
- Vérifiez que `config/cors.php` inclut votre domaine frontend
- Le proxy Vite devrait résoudre les problèmes en développement

### Problèmes de connexion
- Backend : http://localhost:8000
- Frontend : http://localhost:8080
- Vérifiez que les deux serveurs tournent

### Mode Offline
L'application fonctionne en mode déconnecté avec localStorage comme fallback.

## 📱 URLs de l'Application

- **Frontend** : http://localhost:8080
- **Backend** : http://localhost:8000
- **API Documentation** : http://localhost:8000/api/documentation (à configurer)

## 🏗️ Prochaines Étapes

1. **Créer les contrôleurs Laravel** dans `app/Http/Controllers/Api/`
2. **Créer les modèles** dans `app/Models/`
3. **Configurer l'authentification Sanctum**
4. **Créer les migrations** pour la base de données
5. **Implémenter la validation** des données
6. **Ajouter les tests** API et Frontend

## Technologies Utilisées

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Composants UI
- **React Query** - Gestion d'état serveur
- **React Router** - Routing

### Backend
- **Laravel 11** - Framework PHP
- **Sanctum** - Authentification API
- **MySQL/SQLite** - Base de données
