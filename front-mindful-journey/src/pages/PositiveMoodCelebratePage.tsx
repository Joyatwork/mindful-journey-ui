import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PartyPopper } from 'lucide-react';
import MobilePageShell from '@/components/MobilePageShell';

// Page simple de célébration pour humeur positive (Bien, Très bien, Excellent)
// Affiche le message demandé puis option pour continuer automatiquement ou manuellement.

const PositiveMoodCelebratePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { mood?: number } | undefined;

  const handleContinue = () => {
    navigate('/mood-positive-motivation', { state: { mood: state?.mood } });
  };

  return (
    <MobilePageShell gradient="emerald">
      <div className="space-y-6">
        <Card className="p-8 text-center shadow-xl border-emerald-100 relative overflow-hidden">
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <PartyPopper className="h-14 w-14 text-emerald-500 animate-bounce" />
            <h1 className="text-2xl font-bold text-emerald-700 leading-snug">
              Chouette, content de savoir que tu vas de mieux en mieux !
            </h1>
            <p className="text-emerald-900/80 text-sm md:text-base max-w-md">
              Nous allons ajuster tes recommandations pour entretenir cette dynamique positive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full mt-2">
              <Button
                variant="outline"
                className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                onClick={() => navigate(-1)}
              >Retour</Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={handleContinue}
              >Continuer</Button>
            </div>
          </div>
        </Card>
      </div>
    </MobilePageShell>
  );
};

export default PositiveMoodCelebratePage;
