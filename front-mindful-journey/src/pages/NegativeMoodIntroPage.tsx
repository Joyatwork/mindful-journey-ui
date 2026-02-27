import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MobilePageShell from '@/components/MobilePageShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Frown } from 'lucide-react';

// Page d'entrée pour humeur négative (mood 1 ou 2)
// Message demandé + possibilité facultative de préciser ce qui ne va pas (autosave léger)

const NegativeMoodIntroPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const state = location.state as { mood?: number } | undefined;
  const moodLevel = state?.mood ?? 2; // fallback neutre bas

  const goContinue = () => {
    navigate('/mood-negative-factors', { state: { mood: moodLevel } });
  };

  return (
    <MobilePageShell gradient="emerald">
      <Card className="p-6 md:p-8 shadow-xl border-emerald-100 space-y-6">
        <div className="flex flex-col items-center text-center gap-5">
          <Frown className="h-14 w-14 text-emerald-500" />
          <h1 className="text-2xl font-bold text-emerald-800 leading-snug">
            {t('negative.support')}
          </h1>
          <p className="text-emerald-900/80 text-sm">
            {t('negative.supportMessage')}
          </p>
        </div>
  {/* Champ texte supprimé à la demande - on garde uniquement le message et les actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button
            variant="outline"
            className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            onClick={() => navigate('/mood-check')}
          >{t('common.back')}</Button>
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={goContinue}
          >{t('common.next')}</Button>
        </div>
      </Card>
    </MobilePageShell>
  );
};

export default NegativeMoodIntroPage;
