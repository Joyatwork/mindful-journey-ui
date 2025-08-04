# 🚀 Guide de Démarrage - Mindful Journey

## Intégration Frontend React + Backend Laravel

### 📋 Prérequis
- ✅ Node.js (v18+) 
- ✅ PHP (v8.1+)
- ✅ Composer
- ✅ Base de données (MySQL ou SQLite)

### 🏃‍♂️ Démarrage Rapide

#### Option 1: Script Automatique (Recommandé)
```powershell
# Exécuter le script de démarrage
.\start-dev.ps1
```

#### Option 2: Démarrage Manuel

**1. Installation Frontend**
```powershell
npm install
```

**2. Installation Backend**
```powershell
cd back-mindful-journey-iu\mindful-journey-back
composer install
copy .env.example .env
php artisan key:generate
```

**3. Configuration Base de Données**
Éditez le fichier `.env` dans le backend :
```env
# Pour SQLite (plus simple pour commencer)
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

# Ou pour MySQL
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mindful_journey
DB_USERNAME=root
DB_PASSWORD=
```

**4. Configuration CORS et Session**
Ajoutez dans le `.env` backend :
```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:8080
SANCTUM_STATEFUL_DOMAINS=localhost:8080,127.0.0.1:8080
SESSION_DOMAIN=localhost
SESSION_DRIVER=cookie
```

**5. Migrations (Optionnel)**
```powershell
php artisan migrate
```

**6. Démarrage des Serveurs**
```powershell
# Terminal 1 - Backend Laravel
cd back-mindful-journey-iu\mindful-journey-back
php artisan serve --port=8000

# Terminal 2 - Frontend React  
npm run dev
```

### 🌐 URLs d'Accès
- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:8000
- **API Base**: http://localhost:8000/api

### 📡 Endpoints API Disponibles

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion  
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/user` - Utilisateur connecté

#### Rendez-vous
- `GET /api/appointments` - Liste des rendez-vous
- `POST /api/appointments` - Créer un rendez-vous
- `PUT /api/appointments/{id}` - Modifier un rendez-vous
- `DELETE /api/appointments/{id}` - Supprimer un rendez-vous
- `PUT /api/appointments/{id}/cancel` - Annuler un rendez-vous

#### Spécialistes
- `GET /api/specialists` - Liste des spécialistes
- `GET /api/specialists/{id}` - Détails d'un spécialiste
- `GET /api/specialists/search?q=terme` - Rechercher

#### Données de Santé
- `GET /api/health-data/mood` - Données d'humeur
- `POST /api/health-data/mood` - Sauvegarder humeur
- `GET /api/health-data/progress` - Données de progression

### 🔧 Comment utiliser l'API dans les Composants

```typescript
// 1. Utilisation des hooks API
import { useAppointments, useSpecialists } from '@/hooks/useApi';

const MonComposant = () => {
  // Récupérer les données
  const { appointments, isLoading, createAppointment } = useAppointments();
  const { specialists } = useSpecialists();

  // Créer un nouveau rendez-vous
  const handleCreateAppointment = (data) => {
    createAppointment(data);
  };

  return (
    <div>
      {isLoading ? 'Chargement...' : 'Données chargées'}
    </div>
  );
};
```

```typescript
// 2. Appel direct à l'API
import apiService from '@/lib/api';

const getData = async () => {
  try {
    const appointments = await apiService.appointments.getAll();
    console.log(appointments);
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

### 🔄 Mode Hybride (API + localStorage)

L'application fonctionne automatiquement avec deux modes :

**Mode API (Préféré)**
- ✅ Connexion backend disponible
- ✅ Données en temps réel
- ✅ Synchronisation multi-appareil

**Mode Fallback (localStorage)**
- ✅ Backend indisponible
- ✅ Fonctionnement offline
- ✅ Données locales persistantes

### 🐛 Dépannage

**Problème CORS**
- Vérifiez que `config/cors.php` inclut `localhost:8080`
- Le proxy Vite devrait résoudre le problème

**Backend ne démarre pas**
- Vérifiez le fichier `.env`
- Assurez-vous que le port 8000 est libre

**Frontend ne charge pas l'API**
- Vérifiez la console navigateur
- L'app basculera automatiquement vers localStorage

**Erreurs d'authentification**
- Vérifiez `config/sanctum.php`
- Videz le cache navigateur

### 📁 Structure du Projet

```
mindful-journey-ui/
├── src/
│   ├── lib/api.ts              # ✅ Service API centralisé
│   ├── hooks/useApi.ts         # ✅ Hooks React Query
│   └── components/             # ✅ Composants avec API
├── back-mindful-journey-iu/
│   └── mindful-journey-back/
│       ├── app/Http/Controllers/Api/  # ✅ Contrôleurs API
│       ├── config/cors.php           # ✅ Configuration CORS
│       └── routes/api.php           # ✅ Routes API
└── start-dev.ps1              # ✅ Script de démarrage
```

### ✅ Points de Contrôle

1. **✅ Backend répond** : http://localhost:8000/api/specialists
2. **✅ Frontend charge** : http://localhost:8080  
3. **✅ API connectée** : Vérifiez la console réseau dans le navigateur
4. **✅ Fallback fonctionne** : Arrêtez le backend, l'app doit continuer à marcher

### 🚀 Prochaines Étapes

1. **Créer la base de données** avec migrations
2. **Implémenter l'authentification** complète
3. **Ajouter la validation** des données
4. **Créer les modèles** Eloquent
5. **Ajouter les tests** API et Frontend

---

🎉 **Votre application est maintenant connectée!** 

L'intégration React ↔ Laravel est opérationnelle avec fallback automatique.
