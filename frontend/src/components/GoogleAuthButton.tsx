import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  text?: string;
  variant?: 'default' | 'outline';
  mode?: 'signin' | 'signup';
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ 
  onSuccess, 
  text = "Continuer avec Google",
  variant = "outline",
  mode = "signin"
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const { toast } = useToast();
  const { loginWithGoogle } = useAuth();

  const handleGoogleSuccess = async (user: any, credential: string) => {
    setIsLoading(true);
    console.log('🔐 Google Auth Success:', { user, credential: credential.substring(0, 50) + '...' });
    
    try {
      const googleData = {
        access_token: credential,
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.picture || null, // Gérer le cas où picture est undefined
      };
      
      console.log('📤 Sending to backend:', googleData);
      
      await loginWithGoogle(googleData);

      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${user.name} !`,
        variant: "default",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la connexion Google:', error);
      toast({
        title: "Erreur de connexion",
        description: error.message || "Une erreur est survenue lors de la connexion Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error: any) => {
    console.error('Erreur Google Auth:', error);
    setIsLoading(false);
    toast({
      title: "Erreur de connexion",
      description: "Impossible de se connecter avec Google. Veuillez réessayer.",
      variant: "destructive",
    });
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const { renderButton, signIn } = useGoogleAuth({
    clientId,
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

  useEffect(() => {
    if (buttonRef.current && clientId && clientId !== 'test-client-id-for-development') {
      const timer = setTimeout(() => {
        renderButton(buttonRef.current!, {
          theme: variant === 'outline' ? 'outline' : 'filled_blue',
          size: 'large',
          width: buttonRef.current?.offsetWidth || 320,
          text: mode === 'signup' ? 'signup_with' : 'continue_with',
        });
        setGoogleLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [renderButton, variant, mode, clientId]);

  // Mode développement : afficher un bouton informatif
  if (!clientId || clientId === 'test-client-id-for-development') {
    return (
      <div className="w-full">
        <Button 
          variant={variant} 
          disabled
          className="w-full opacity-50 cursor-not-allowed"
          onClick={() => {
            toast({
              title: "Configuration Google OAuth requise",
              description: (
                <div className="space-y-2">
                  <p>Pour utiliser l'authentification Google :</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Créez un projet sur Google Cloud Console</li>
                    <li>Obtenez votre Client ID OAuth 2.0</li>
                    <li>Ajoutez-le dans le fichier .env</li>
                  </ol>
                  <p className="text-xs mt-2">En attendant, utilisez l'authentification par email/mot de passe.</p>
                </div>
              ),
              variant: "default",
            });
          }}
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {text} (Configuration requise)
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Google OAuth désactivé - Utilisez l'authentification par email
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {isLoading && (
        <div className="flex items-center justify-center p-2 mb-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Connexion en cours...</span>
        </div>
      )}
      <div ref={buttonRef} className="w-full" />
      {!googleLoaded && clientId && (
        <Button 
          variant={variant} 
          disabled={isLoading}
          className="w-full"
          onClick={signIn}
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {text}
        </Button>
      )}
    </div>
  );
};

export default GoogleAuthButton;
