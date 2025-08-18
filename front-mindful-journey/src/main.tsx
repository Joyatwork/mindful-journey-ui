
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

// Enregistrer le service worker pour PWA avec gestion d'erreurs améliorée
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Vérifier les mises à jour du service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nouveau service worker disponible
                console.log('Nouvelle version de l\'application disponible');
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });

    // Écouter les messages du service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('Cache mis à jour');
      }
    });
  });

  // Gérer les changements de statut réseau
  window.addEventListener('online', () => {
    console.log('Application en ligne');
  });

  window.addEventListener('offline', () => {
    console.log('Application hors ligne');
  });
}
