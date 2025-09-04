import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobilePageShell from '@/components/MobilePageShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

// Page de sélection des facteurs pour humeur négative

const FACTORS: { key: string; label: string }[] = [
  { key: 'famille', label: 'Famille' },
  { key: 'activite_physique', label: 'Activité physique' },
  { key: 'travail', label: 'Travail' },
  { key: 'amis', label: 'Amis' },
  { key: 'sorties', label: 'Sorties' },
  { key: 'loisirs', label: 'Loisirs' },
  { key: 'relation_manager', label: 'Relation-Manager' },
  { key: 'collegue', label: 'Collègue' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'sommeil', label: 'Sommeil' },
  { key: 'penibilite', label: 'Pénibilité' },
  { key: 'digestion', label: 'Digestion' },
  { key: 'anxiete', label: 'Anxiété' },
  { key: 'fatigue', label: 'Fatigue' },
  { key: 'reprise_travail_absence', label: 'Reprise travail après longue absence' },
  { key: 'nervosite', label: 'Nervosité' },
  { key: 'stress', label: 'Stress' },
  { key: 'douleurs', label: 'Douleurs' },
  { key: 'autre', label: 'Autre' }
];

const NegativeMoodFactorsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { mood?: number } | undefined;
  const moodLevel = state?.mood ?? 2;
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (key: string) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const goBack = () => navigate('/mood-negative', { state: { mood: moodLevel } });
  const goNext = () => {
    navigate('/mood-negative-details', { state: { mood: moodLevel, factors: selected } });
  };

  return (
    <MobilePageShell gradient="emerald">
      <Card className="p-6 md:p-8 shadow-xl border-emerald-100 space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-xl font-bold text-emerald-800">Qu'est-ce qui influence ton ressenti ?</h1>
          <p className="text-sm text-emerald-900/70">Coche un ou plusieurs éléments (optionnel).</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-auto pr-1">
          {FACTORS.map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => toggle(f.key)}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition text-sm select-none ${selected.includes(f.key) ? 'bg-emerald-600 border-emerald-600 text-white shadow' : 'bg-white border-emerald-200 hover:border-emerald-400'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            >
              <Checkbox checked={selected.includes(f.key)} onCheckedChange={() => toggle(f.key)} className="pointer-events-none border-white/70 data-[state=checked]:bg-white data-[state=checked]:text-emerald-600" />
              <span className="font-medium leading-snug">{f.label}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button
            variant="outline"
            className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            onClick={goBack}
          >Retour</Button>
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={goNext}
            disabled={selected.length === 0}
          >Continuer</Button>
        </div>
      </Card>
    </MobilePageShell>
  );
};

export default NegativeMoodFactorsPage;
