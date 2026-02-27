import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// Try resolving via direct path first; TS sometimes lags recognizing new files. Extension kept explicit for bundler mode.
import MoodSelectorV2 from '@/components/MoodSelectorV2.tsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import MobilePageShell from '@/components/MobilePageShell';

const MoodCheckPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mood, setMood] = useState<number | undefined>();
  const [savedMood, setSavedMood] = useState<number | undefined>();

  const [detailNotes, setDetailNotes] = useState<string | null>(null);

  const handleContinue = () => {
    navigate('/mood-encouragement', { state: { mood: savedMood, notes: detailNotes } });
  };

  // Redirections immédiates selon l'humeur
  useEffect(() => {
    if (!mood) return;
    const t = setTimeout(() => {
      if (mood >= 3) {
        navigate('/mood-positive', { state: { mood } });
      } else if (mood <= 2) {
        navigate('/mood-negative', { state: { mood } });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [mood, navigate]);
  return (
    <MobilePageShell gradient="emerald">
      <Card className="p-6 shadow-xl border-emerald-100 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <Button size="icon" variant="ghost" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-800 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-500" />
            {t('mood.title')}
          </h1>
        </div>
        <p className="text-emerald-900/80 mb-6 text-sm">
          {t('mood.subtitle')}
        </p>
        <MoodSelectorV2
          value={mood}
          onChange={setMood}
          onSaved={(m) => setSavedMood(m)}
          autoSave
        />
        {(!mood || mood < 3) && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              disabled={!savedMood}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={handleContinue}
            >
              {t('mood.nextStep')}
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              onClick={() => navigate('/dashboard')}
            >
              {t('mood.skipForNow')}
            </Button>
          </div>
        )}
      </Card>
    </MobilePageShell>
  );
};

export default MoodCheckPage;
