import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Try resolving via direct path first; TS sometimes lags recognizing new files. Extension kept explicit for bundler mode.
import MoodSelectorV2 from '@/components/MoodSelectorV2.tsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';

const MoodCheckPage: React.FC = () => {
  const navigate = useNavigate();
  const [mood, setMood] = useState<number | undefined>();
  const [savedMood, setSavedMood] = useState<number | undefined>();

  const [detailNotes, setDetailNotes] = useState<string | null>(null);

  // Intercepter l'événement sauvegarde détaillée via custom dispatch (optionnel). Pour l'instant MoodSelectorV2 ne remonte pas les notes, on pourrait l'étendre.
  // Placeholder: si plus tard on propage les notes, on les stockera ici.

  const handleContinue = () => {
    navigate('/mood-encouragement', { state: { mood: savedMood, notes: detailNotes } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-teal-50 p-4 md:p-10 flex items-center justify-center">
      <Card className="w-full max-w-3xl p-6 md:p-10 shadow-xl border-emerald-100">
        <div className="flex items-center gap-3 mb-6">
          <Button size="icon" variant="ghost" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-800 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-500" />
            Comment vous sentez-vous aujourd'hui ?
          </h1>
        </div>
        <p className="text-emerald-900/80 mb-6 text-sm md:text-base">
          Choisissez l'option qui reflète le mieux votre état actuel. Cela nous permet d'adapter instantanément vos recommandations et priorités bien-être.
        </p>
        <MoodSelectorV2
          value={mood}
          onChange={setMood}
          onSaved={(m) => setSavedMood(m)}
          autoSave
        />
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button
            disabled={!savedMood}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleContinue}
          >
            Étape suivante
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            onClick={() => navigate('/dashboard')}
          >
            Passer pour l'instant
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MoodCheckPage;
