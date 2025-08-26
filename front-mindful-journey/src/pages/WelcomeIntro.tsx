import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Heart, Clock } from 'lucide-react';

// Page d'accueil chaleureuse avec invitation à commencer le check d'humeur
const WelcomeIntro: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Si la session a déjà différé ou passé l'intro, rediriger vers dashboard
  useEffect(() => {
    const deferred = sessionStorage.getItem('welcome_deferred');
    const completed = sessionStorage.getItem('welcome_completed');
    if (completed || deferred) {
      // Laisser l'utilisateur revenir via /welcome explicitement si besoin
      // mais sur / on redirige vers dashboard
      if (window.location.pathname === '/') navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleStart = () => {
    sessionStorage.setItem('welcome_completed', '1');
    navigate('/mood-check');
  };

  const handleLater = () => {
    sessionStorage.setItem('welcome_deferred', '1');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-10">
      <Card className="w-full max-w-2xl p-10 shadow-xl border-emerald-100 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_30%_20%,#34d399,transparent_60%)]" />
        <div className="relative space-y-7">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Sparkles className="h-6 w-6" />
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-800">
              {user ? `Bonjour ${user.name.split(' ')[0]} !` : 'Bienvenue !'}
            </h1>
          </div>
          <p className="text-lg leading-relaxed text-emerald-900/80">
            Prenons un instant pour vous. Une courte vérification de votre état émotionnel nous aidera à
            personnaliser vos recommandations de bien-être, dès maintenant.
          </p>
          <ul className="grid sm:grid-cols-3 gap-4 text-sm text-emerald-800/80">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-600"><Heart className="h-4 w-4" /></span>
              <span>Soutien adapté à votre humeur</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-600"><Clock className="h-4 w-4" /></span>
              <span>Moins d'une minute</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-600">✨</span>
              <span>Recommandations instantanées</span>
            </li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button size="lg" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleStart}>
              Oui je commence
            </Button>
            <Button size="lg" variant="outline" className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50" onClick={handleLater}>
              Rappelle-moi plus tard
            </Button>
          </div>
          <p className="text-xs text-emerald-700/70 pt-2">
            Vous pourrez toujours revenir à cette étape plus tard depuis votre tableau de bord.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeIntro;
