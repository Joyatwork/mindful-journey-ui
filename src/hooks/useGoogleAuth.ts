import { useEffect, useCallback } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface UseGoogleAuthProps {
  clientId: string;
  onSuccess: (user: GoogleUser, credential: string) => void;
  onError: (error: any) => void;
}

export const useGoogleAuth = ({ clientId, onSuccess, onError }: UseGoogleAuthProps) => {
  const handleCredentialResponse = useCallback((response: any) => {
    try {
      if (!response.credential) {
        throw new Error('Aucun credential reçu de Google');
      }

      // Décoder le JWT token pour récupérer les informations utilisateur
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      // Log pour debugging
      console.log('🔍 Google JWT Payload:', payload);
      
      const user: GoogleUser = {
        id: payload.sub || payload.id,
        name: payload.name || (payload.given_name && payload.family_name ? `${payload.given_name} ${payload.family_name}` : 'Utilisateur Google'),
        email: payload.email,
        picture: payload.picture || null,
      };

      console.log('👤 User object created:', user);
      onSuccess(user, response.credential);
    } catch (error) {
      console.error('Erreur lors du décodage du token Google:', error);
      onError(error);
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    // Vérifier si le script Google est déjà chargé
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    
    if (existingScript) {
      // Si le script existe déjà, initialiser directement
      if (window.google) {
        initializeGoogle();
      }
      return;
    }

    // Charger le script Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google) {
        initializeGoogle();
      }
    };

    script.onerror = () => {
      onError(new Error('Impossible de charger le script Google Identity Services'));
    };

    document.body.appendChild(script);

    return () => {
      // Ne pas supprimer le script pour éviter de le recharger
    };
  }, [clientId, handleCredentialResponse]);

  const initializeGoogle = () => {
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation Google:', error);
      onError(error);
    }
  };

  const signIn = useCallback(() => {
    if (window.google) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google prompt non affiché:', notification.getNotDisplayedReason());
        }
      });
    } else {
      onError(new Error('Google Identity Services non disponible'));
    }
  }, [onError]);

  const renderButton = useCallback((element: HTMLElement, options?: any) => {
    if (window.google && element) {
      try {
        window.google.accounts.id.renderButton(element, {
          theme: 'outline',
          size: 'large',
          width: element.offsetWidth || 320,
          type: 'standard',
          shape: 'rectangular',
          text: 'continue_with',
          locale: 'fr',
          ...options,
        });
      } catch (error) {
        console.error('Erreur lors du rendu du bouton Google:', error);
        onError(error);
      }
    }
  }, [onError]);

  return {
    signIn,
    renderButton,
  };
};
