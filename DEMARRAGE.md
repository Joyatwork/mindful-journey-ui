# 🚀 Mindful Journey - Scripts de démarrage

## Démarrage du backend (Laravel)
```powershell
cd backend
php artisan serve --port=8081
```

## Démarrage du frontend (React)
```powershell
cd frontend  
npm run dev
```

## Démarrage complet (les deux à la fois)
```powershell
# Terminal 1 - Backend
cd backend
php artisan serve --port=8081

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## URLs d'accès
- **Frontend React :** http://localhost:8080
- **Backend Laravel :** http://127.0.0.1:8081
- **API :** http://127.0.0.1:8081/api

## 🎯 **Vérifications importantes**
- **Base de données ACTUELLE** : `backend/database/database.sqlite` ⚠️ 
- **Vérifier les utilisateurs** : Double-clic sur `verifier-base.bat`
- **Attention** : N'utilisez plus l'ancienne base dans `back-mindful-journey-iu/`

## Installation des dépendances

### Backend
```powershell
cd backend
composer install
php artisan key:generate
php artisan migrate
```

### Frontend  
```powershell
cd frontend
npm install
```
