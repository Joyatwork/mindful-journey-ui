import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Récupérer le token depuis les paramètres URL
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError('Erreur lors de l\'authentification Google');
          setLoading(false);
          return;
        }

        if (!token) {
          setError('Token manquant dans la réponse');
          setLoading(false);
          return;
        }

        // Traiter le callback avec le token
        await handleGoogleCallback(token);
        
        // Rediriger vers la page d'accueil (Index.tsx)
        navigate('/', { replace: true });
        
      } catch (error: any) {
        console.error('Erreur lors du traitement du callback Google:', error);
        setError(error.message || 'Erreur lors de la connexion');
        setLoading(false);
      }
    };

    processCallback();
  }, [searchParams, handleGoogleCallback, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Finalisation de la connexion avec Google...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-indigo-600 hover:text-indigo-800 underline"
              >
                Retour à la connexion
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default GoogleCallback;
