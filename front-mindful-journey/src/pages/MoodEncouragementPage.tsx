import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft, Heart, Lightbulb, Anchor } from 'lucide-react';
import IntelligentSuggestions from '@/components/IntelligentSuggestions';

interface LocationState {
  mood?: number;
  notes?: string | null;
}

const encouragementMap: Record<number, { title: string; message: string; tone: string; }> = {
  1: {
    title: "On est avec vous",
    message: "Journée difficile, et c'est ok. Prenez une respiration lente maintenant. Une toute petite action bien-être peut déjà alléger un peu la charge.",
    tone: 'care'
  },
  2: {
    title: "Doucement mais sûrement",
    message: "Vous êtes dans une zone neutre. C'est un bon point de départ pour nourrir une énergie un peu plus positive aujourd'hui.",
    tone: 'neutral'
  },
  3: {
    title: "Bel équilibre",
    message: "Vous semblez plutôt bien. Consolidons cela avec une micro-pratique qui entretient votre stabilité émotionnelle.",
    tone: 'positive'
  },
  4: {
    title: "Belle énergie",
    message: "Excellente dynamique. C'est un super moment pour avancer sur un objectif personnel ou soutenir quelqu'un d'autre.",
    tone: 'high'
  },
  5: {
    title: "Humeur rayonnante",
    message: "Vous rayonnez aujourd'hui. Profitons-en pour ancrer cette énergie dans une action significative ou un moment de gratitude.",
    tone: 'peak'
  }
};

const MoodEncouragementPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as LocationState;
  const mood = state.mood;
  const notes = state.notes;

  const encouragement = useMemo(() => (mood ? encouragementMap[mood] : undefined), [mood]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      <div className="w-full max-w-5xl mx-auto flex-1 p-4 md:p-10 space-y-8">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-800 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-500" />
            Votre soutien personnalisé
          </h1>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-6 space-y-4 bg-white/90 backdrop-blur-sm border-emerald-100 shadow-md">
            {encouragement ? (
              <>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold flex items-center gap-2 text-emerald-800">
                    {mood && <span className="text-2xl" aria-hidden>{['','😔','😐','🙂','😊','😁'][mood]}</span>}
                    {encouragement.title}
                  </h2>
                  <p className="text-sm text-emerald-900/80 leading-relaxed">
                    {encouragement.message}
                  </p>
                </div>
                {notes && (
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
                    <p className="text-[11px] uppercase tracking-wider font-medium text-emerald-600 mb-1 flex items-center gap-1">
                      <Anchor className="h-3 w-3" />Votre note
                    </p>
                    <p className="text-sm text-emerald-800 whitespace-pre-line">{notes}</p>
                  </div>
                )}
                {/* Boutons déplacés en bas de page */}
              </>
            ) : (
              <p className="text-sm text-emerald-800">Aucune humeur fournie. Revenez à l'étape précédente.</p>
            )}
          </Card>
          <Card className="p-6 flex flex-col bg-white/90 backdrop-blur-sm border-emerald-100 shadow-md">
            <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-2 mb-4">
              <Lightbulb className="h-4 w-4 text-emerald-500" /> Recommandations personnalisées
            </h3>
            <div className="flex-1 overflow-visible">
              <IntelligentSuggestions
                userContext={{ mood: mood, stress: mood ? 6 - mood : 3, energy: mood || 3 }}
                onSuggestionSelect={() => {}}
              />
            </div>
            <div className="mt-4 text-[11px] text-emerald-600 flex items-center gap-1">
              <Heart className="h-3 w-3" /> Générées selon votre état actuel.
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button className="bg-emerald-600 hover:bg-emerald-700 flex-1" onClick={() => navigate('/dashboard')}>Aller au tableau de bord</Button>
              <Button variant="outline" className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50" onClick={() => navigate('/mood-check')}>Revenir modifier</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MoodEncouragementPage;
