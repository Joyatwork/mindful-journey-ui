import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2, PencilLine } from 'lucide-react';
import apiService from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface MoodOption {
  emoji: string;
  label: string;
  description: string;
  value: number; // 1..5 scale
  color: string; // tailwind classes
  ring: string;  // focus/selected ring color
}

const moodOptions: MoodOption[] = [
  { emoji: '😔', label: 'Difficile', description: 'Brouillard émotionnel, besoin de soutien', value: 1, color: 'bg-red-50 hover:bg-red-100', ring: 'ring-red-400' },
  { emoji: '😐', label: 'Moyen', description: 'Équilibré mais neutre', value: 2, color: 'bg-orange-50 hover:bg-orange-100', ring: 'ring-orange-400' },
  { emoji: '🙂', label: 'Bien', description: 'Énergie stable, optimisme mesuré', value: 3, color: 'bg-yellow-50 hover:bg-yellow-100', ring: 'ring-yellow-400' },
  { emoji: '😊', label: 'Très bien', description: 'Belle énergie positive', value: 4, color: 'bg-green-50 hover:bg-green-100', ring: 'ring-green-400' },
  { emoji: '😁', label: 'Excellent', description: 'Humeur rayonnante', value: 5, color: 'bg-emerald-50 hover:bg-emerald-100', ring: 'ring-emerald-400' }
];

interface MoodSelectorV2Props {
  value?: number;
  onChange?: (value: number) => void;
  onSaved?: (value: number) => void;
  autoSave?: boolean; // saves automatically (debounced) when value changes
  debounceMs?: number; // default 600
  className?: string;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const MoodSelectorV2: React.FC<MoodSelectorV2Props> = ({
  value,
  onChange,
  onSaved,
  autoSave = false,
  debounceMs = 600,
  className = ''
}) => {
  const [internalValue, setInternalValue] = useState<number | undefined>(value);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const lastSavedRef = useRef<number | undefined>();
  const timerRef = useRef<number | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailValue, setDetailValue] = useState('');
  const [detailSaving, setDetailSaving] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [lastDetailSavedAt, setLastDetailSavedAt] = useState<string | null>(null);

  // Prefill today's existing entry details
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const today = await apiService.healthData.getTodayMood?.();
        if (mounted && today?.entry) {
          const e = today.entry as any;
            if (e.details) {
              setDetailValue(e.details);
              setLastDetailSavedAt(new Date().toISOString());
            }
            if (e.mood_level && !internalValue) {
              setInternalValue(e.mood_level);
              lastSavedRef.current = e.mood_level;
            }
        }
      } catch (err) {
        // silent
      }
    })();
    return () => { mounted = false; };
  }, []);

  // sync from outside
  useEffect(() => { setInternalValue(value); }, [value]);

  const selectMood = useCallback((v: number) => {
    setInternalValue(v);
    onChange?.(v);
  }, [onChange]);

  const saveMood = useCallback(async (v: number) => {
    if (v === lastSavedRef.current) return; // nothing new
    try {
      setSaveState('saving');
      setErrorMessage('');
      const payload = {
        date: new Date().toISOString().split('T')[0],
        mood_level: v,
        mood_emoji: moodOptions.find(o => o.value === v)?.emoji || '🙂',
        energy_level: 5,
        stress_level: 3,
        sleep_quality: null,
        notes: null,
  details: detailValue || null,
        activities: [],
        emotions: []
      };
      await apiService.healthData.saveMoodData(payload);
      lastSavedRef.current = v;
      setSaveState('saved');
      onSaved?.(v);
      window.setTimeout(() => setSaveState(s => s === 'saved' ? 'idle' : s), 2500);
    } catch (e: any) {
      setSaveState('error');
      setErrorMessage(e?.message || 'Erreur lors de la sauvegarde');
    }
  }, [onSaved]);

  const saveDetails = useCallback(async () => {
    if (!internalValue) return;
    setDetailSaving(true);
    setDetailError('');
    try {
      const payload = {
        date: new Date().toISOString().split('T')[0],
        mood_level: internalValue,
        mood_emoji: moodOptions.find(o => o.value === internalValue)?.emoji || '🙂',
        energy_level: 5,
        stress_level: 3,
        sleep_quality: null,
  notes: null, // legacy
  details: detailValue || null,
        activities: [],
        emotions: []
      };
      await apiService.healthData.saveMoodData(payload);
      setLastDetailSavedAt(new Date().toISOString());
      setDetailOpen(false);
      if (!autoSave) {
        lastSavedRef.current = internalValue; // marquer comme sauvegardé
      }
    } catch (e: any) {
      setDetailError(e?.message || 'Erreur lors de la sauvegarde détaillée');
    } finally {
      setDetailSaving(false);
    }
  }, [internalValue, detailValue, autoSave]);

  // auto-save with debounce
  useEffect(() => {
    if (!autoSave) return;
    if (internalValue == null) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => saveMood(internalValue), debounceMs) as unknown as number;
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [internalValue, autoSave, debounceMs, saveMood]);

  // keyboard navigation (arrow keys) when focusing wrapper
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (['ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const currentIndex = moodOptions.findIndex(o => o.value === internalValue) || 0;
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const next = moodOptions[(currentIndex + dir + moodOptions.length) % moodOptions.length];
        selectMood(next.value);
      }
      if (e.key === 'Enter' && internalValue && autoSave === false) {
        saveMood(internalValue);
      }
    };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [internalValue, selectMood, saveMood, autoSave]);

  return (
    <Card className={`p-6 glass-card border-0 shadow-lg ${className}`}>      
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold">Votre humeur actuelle</h3>
        {saveState === 'saving' && <span className="flex items-center gap-1 text-xs text-emerald-600"><Loader2 className="h-3 w-3 animate-spin"/>Sauvegarde...</span>}
        {saveState === 'saved' && <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="h-3 w-3"/>Sauvegardé</span>}
        {saveState === 'error' && <span className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="h-3 w-3"/>Erreur</span>}
      </div>

      {saveState === 'error' && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div 
        ref={containerRef}
        role="radiogroup"
        aria-label="Sélection d'humeur"
        tabIndex={0}
        className="grid grid-cols-2 sm:grid-cols-5 gap-3 outline-none"
      >
        {moodOptions.map(opt => {
          const selected = internalValue === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => selectMood(opt.value)}
              disabled={saveState === 'saving'}
              className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all text-center focus-visible:outline-none focus-visible:ring-2 ${opt.color} ${selected ? `ring-2 ${opt.ring} scale-105 shadow` : 'hover:scale-105'} ${saveState === 'saving' ? 'opacity-60 cursor-progress' : ''}`}
            >
              <span className="text-3xl mb-1" aria-hidden>{opt.emoji}</span>
              <span className="text-xs font-medium text-emerald-900 mb-0.5">{opt.label}</span>
              <span className="text-[10px] leading-snug text-emerald-800/70 hidden sm:block">{opt.description}</span>
              {selected && saveState === 'saved' && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px] shadow">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      {!autoSave && internalValue && saveState !== 'saved' && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => saveMood(internalValue)}
            className="px-4 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            disabled={saveState === 'saving'}
          >
            {saveState === 'saving' ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      )}
      {internalValue && (
        <div className="mt-4 flex flex-wrap items-center gap-3 justify-between">
          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md px-3 py-2 transition-colors"
          >
            <PencilLine className="h-4 w-4" />
            Voulez-vous détailler ?
          </button>
          {lastDetailSavedAt && (
            <span className="text-[11px] text-emerald-600">Dernière note sauvegardée {new Date(lastDetailSavedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
          )}
        </div>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Décrire votre état</DialogTitle>
            <DialogDescription>
              Ajoutez quelques précisions sur ce que vous ressentez maintenant. Cela enrichira votre suivi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="text-sm text-emerald-800/80 flex items-center gap-2">
              <span className="text-xl" aria-hidden>{moodOptions.find(o => o.value === internalValue)?.emoji}</span>
              <span>{moodOptions.find(o => o.value === internalValue)?.label}</span>
            </div>
            <Textarea
              value={detailValue}
              onChange={(e) => setDetailValue(e.target.value)}
              placeholder="Ex: Un peu tendu après une mauvaise nuit, besoin de respirations profondes..."
              className="min-h-[140px] resize-vertical"
            />
            {detailError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 text-xs">{detailError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setDetailOpen(false)} disabled={detailSaving}>Annuler</Button>
            <Button onClick={saveDetails} disabled={detailSaving || !detailValue.trim()} className="bg-emerald-600 hover:bg-emerald-700">
              {detailSaving ? 'Sauvegarde...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MoodSelectorV2;
