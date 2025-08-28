import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobilePageShell from '@/components/MobilePageShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const NegativeMoodInspirationPromptPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { mood?: number; factors?: string[] } | undefined;
  const moodLevel = state?.mood ?? 2;
  const factors = state?.factors || [];

  const goNext = () => {
    navigate('/mood-encouragement', { state: { mood: moodLevel, factors } });
  };

  return (
    <MobilePageShell gradient="emerald">
      <Card className="p-6 md:p-8 shadow-xl border-emerald-100 space-y-8">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={() => navigate(-1)}>Retour</Button>
          <h1 className="text-lg font-bold text-emerald-800">Inspiration</h1>
        </div>
        <div className="space-y-6 text-emerald-900/90 leading-relaxed text-sm">
          <p className="font-medium text-emerald-800">Je suis persuadé que faire ce qui te rend heureux va améliorer ton quotidien.</p>
          <p>Un loisir, une sortie entre amis, en famille, une activité physique, artistique ...</p>
          <p className="font-semibold text-emerald-700">A tout de suite dans les suggestions personnalisées pour t'épanouir!</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={goNext}>Voir les suggestions personnalisées</Button>
        </div>
      </Card>
    </MobilePageShell>
  );
};

export default NegativeMoodInspirationPromptPage;
