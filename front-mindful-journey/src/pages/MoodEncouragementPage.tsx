import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft, Heart, Lightbulb, Anchor } from 'lucide-react';
import IntelligentSuggestions from '@/components/IntelligentSuggestions';
import PractitionerBookingInline from '@/components/PractitionerBookingInline';
import apiService from '@/lib/api';
import MobilePageShell from '@/components/MobilePageShell';
import { useToast } from '@/hooks/use-toast';

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
  const [moodValue, setMoodValue] = React.useState<number | undefined>(state.mood);
  const [notesValue, setNotesValue] = React.useState<string | null | undefined>(state.notes);
  const [loadingMood, setLoadingMood] = React.useState(false);

  const encouragement = useMemo(() => (moodValue ? encouragementMap[moodValue] : undefined), [moodValue]);


  const forwardSuggestion = (_s: any) => {
    // Pour l'instant: simple toast possible ou placeholder (aucune navigation)
  };

  // Gestion locale des praticiens (consultation / prise RDV) sans quitter la page
  const [selectedPractitioner, setSelectedPractitioner] = React.useState<any | null>(null);
  const [practitionerMode, setPractitionerMode] = React.useState<'profile' | 'booking' | null>(null);
  const { toast } = useToast();

  // Mise à jour de l'URL pour refléter l'état (persistance refresh)
  const updateQuery = (practId?: string | null, mode?: 'profile' | 'booking' | null) => {
    const params = new URLSearchParams(location.search);
    if (practId) {
      params.set('practitioner', practId);
      if (mode) params.set('mode', mode); else params.delete('mode');
    } else {
      params.delete('practitioner');
      params.delete('mode');
    }
    navigate({ pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
  };

  const openPractitionerProfile = (p: any) => {
    // Mettre à jour l'état local et l'URL (même si déjà sur place) pour que le bouton "Consulter" fonctionne toujours
    setSelectedPractitioner(p);
    setPractitionerMode('profile');
    updateQuery(p.id, 'profile');
  };
  const openPractitionerBooking = (p: any) => {
    setSelectedPractitioner(p);
    setPractitionerMode('booking');
    updateQuery(p.id, 'booking');
  };
  const closePractitionerPanel = () => {
    setPractitionerMode(null);
    setSelectedPractitioner(null);
    updateQuery(null, null);
  };

  // Au chargement : reconstituer panneau depuis query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('practitioner');
    const mode = params.get('mode') as 'profile' | 'booking' | null;
    if (pid && !selectedPractitioner) {
      // fetch spécialiste
      apiService.specialists.getById(pid)
        .then(sp => {
          setSelectedPractitioner({
            id: sp.data?.id || pid,
            name: sp.data?.name || sp.name,
            specialty: sp.data?.specialty || sp.specialty,
            experience: sp.data?.experience || sp.experience,
            availability: sp.data?.availability || sp.availability,
            price: sp.data?.price || sp.price,
            consultationType: sp.data?.consultationType || sp.consultationType || 'both',
            reason: sp.data?.reason || sp.reason,
          });
          setPractitionerMode(mode || 'profile');
        })
        .catch(() => {
          toast({ title: 'Impossible de charger le spécialiste', variant: 'destructive' });
          updateQuery(null, null);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Charger une humeur si absente (accès direct via URL)
  useEffect(() => {
    if (moodValue == null) {
      setLoadingMood(true);
      apiService.healthData.getTodayMood()
        .then(res => {
          const entry = res.entry;
          if (entry?.mood_level) {
            // normaliser si >5 (base 1-10 vers 1-5)
            const raw = entry.mood_level;
            const normalized = raw > 5 ? Math.min(5, Math.max(1, Math.round(raw / 2))) : raw;
            setMoodValue(normalized);
            if (!notesValue) setNotesValue(entry.details || entry.notes || null);
          } else {
            // défaut neutre
            setMoodValue(3);
          }
        })
        .catch(() => {
          setMoodValue(3); // fallback neutre
        })
        .finally(() => setLoadingMood(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MobilePageShell gradient="emerald">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-800 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-500" />
            Votre soutien personnalisé
          </h1>
        </div>
        <Card className="p-6 space-y-4 bg-white/90 backdrop-blur-sm border-emerald-100 shadow-md">
          {encouragement ? (
            <>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-emerald-800">
                  {moodValue && <span className="text-2xl" aria-hidden>{['','😔','😐','🙂','😊','😁'][moodValue]}</span>}
                  {encouragement.title}
                </h2>
                <p className="text-sm text-emerald-900/80 leading-relaxed">
                  {encouragement.message}
                </p>
              </div>
              {notesValue && (
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
                  <p className="text-[11px] uppercase tracking-wider font-medium text-emerald-600 mb-1 flex items-center gap-1">
                    <Anchor className="h-3 w-3" />Votre note
                  </p>
                  <p className="text-sm text-emerald-800 whitespace-pre-line">{notesValue}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-emerald-800">
              {loadingMood ? 'Chargement de votre humeur...' : ''}
            </p>
          )}
        </Card>
        <Card className="p-6 flex flex-col bg-white/90 backdrop-blur-sm border-emerald-100 shadow-md">
          <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-2 mb-4">
            <Lightbulb className="h-4 w-4 text-emerald-500" /> Recommandations personnalisées
          </h3>
          <div className="flex-1 overflow-visible">
            <IntelligentSuggestions
              userContext={{
                mood: moodValue,
                // Si humeur positive (>=4), forcer des valeurs stress/energy qui déclenchent isPositive dans IntelligentSuggestions pour masquer praticiens
                stress: moodValue && moodValue >= 4 ? 1 : (moodValue ? 6 - moodValue : 3),
                energy: moodValue && moodValue >= 4 ? 4 : (moodValue || 3)
              }}
              onSuggestionSelect={forwardSuggestion}
              // Ne pas fournir les callbacks praticiens si mood positif: empêche même les clics potentiels
              onPractitionerOpen={moodValue && moodValue >= 4 ? undefined : openPractitionerProfile}
              onPractitionerBook={moodValue && moodValue >= 4 ? undefined : openPractitionerBooking}
            />
            {(! (moodValue && moodValue >= 4) && selectedPractitioner && practitionerMode) && (
              <div className="mt-6 border rounded-xl p-5 bg-white/80 backdrop-blur-sm shadow-sm animate-fadeIn">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-emerald-800">{selectedPractitioner.name}</h4>
                    <p className="text-sm text-emerald-700">{selectedPractitioner.specialty}</p>
                    {practitionerMode === 'profile' && selectedPractitioner.reason && (
                      <p className="mt-2 text-sm text-emerald-600/80 whitespace-pre-line">{selectedPractitioner.reason}</p>
                    )}
                  </div>
                  <button onClick={closePractitionerPanel} className="text-xs text-emerald-600 hover:underline">Fermer</button>
                </div>
                {practitionerMode === 'profile' && (
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Expérience:</span> {selectedPractitioner.experience}</p>
                    <p><span className="font-medium">Disponibilités:</span> {selectedPractitioner.availability}</p>
                    <p><span className="font-medium">Tarif:</span> {typeof selectedPractitioner.price === 'number' ? `${selectedPractitioner.price}€` : selectedPractitioner.price}</p>
                    <div className="pt-2 flex gap-3">
                      <button onClick={() => openPractitionerBooking(selectedPractitioner)} className="px-4 py-2 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-700">Prendre RDV</button>
                      <button onClick={closePractitionerPanel} className="px-4 py-2 text-xs rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100">Retour</button>
                    </div>
                  </div>
                )}
                {practitionerMode === 'booking' && (
                  <PractitionerBookingInline practitioner={selectedPractitioner} onCancel={closePractitionerPanel} onBack={() => setPractitionerMode('profile')} />
                )}
              </div>
            )}
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
    </MobilePageShell>
  );
};

export default MoodEncouragementPage;
