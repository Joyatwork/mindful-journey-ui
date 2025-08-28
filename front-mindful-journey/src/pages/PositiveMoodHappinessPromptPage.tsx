import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SmilePlus } from 'lucide-react';
import MobilePageShell from '@/components/MobilePageShell';

const PositiveMoodHappinessPromptPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { mood?: number } | undefined;

  return (
    <MobilePageShell gradient="emerald">
      <Card className="p-6 md:p-8 shadow-xl border-emerald-100 space-y-8">
        <div className="flex flex-col items-center text-center gap-6 animate-fade-in">
          <SmilePlus className="h-14 w-14 text-emerald-500" />
          <h1 className="text-2xl font-bold text-emerald-700 leading-snug">
            Je suis persuadé que faire ce qui te rend heureux va améliorer ton quotidien.
          </h1>
          <p className="text-emerald-900/80 text-sm whitespace-pre-line leading-relaxed">
            Un loisir, une sortie entre amis, en famille, une activité physique, artistique ...
          </p>
          <p className="text-emerald-900/90 text-sm font-medium">
            A tout de suite dans les suggestions personnalisées pour t'épanouir!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-2">
            <Button
              variant="outline"
              className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              onClick={() => navigate(-1)}
            >Retour</Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => navigate('/mood-encouragement', { state: { mood: state?.mood } })}
            >Voir les suggestions personnalisées</Button>
          </div>
        </div>
      </Card>
    </MobilePageShell>
  );
};

export default PositiveMoodHappinessPromptPage;
