import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, CheckCircle, Clock, Brain } from 'lucide-react';

interface MeditationContentProps {
  onBack: () => void;
  onComplete: () => void;
}

const MeditationContent = ({ onBack, onComplete }: MeditationContentProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(600); // fallback 10 min (only used for MP3 mode)
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Playback mode: 'file' uses the MP3 in public/audio, 'tts' uses Web Speech API
  const [mode, setMode] = useState<'file' | 'tts'>('file');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<string>('fr-FR');
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const timerRef = useRef<number | null>(null); // for TTS progression timer
  const lastSpokenStepRef = useRef<number>(-1); // track last spoken step in TTS
  const [mp3Src, setMp3Src] = useState<string>('/audio/track-4.mp3');
  // TTS: guidage continu
  const [ttsContinuous, setTtsContinuous] = useState<boolean>(true);
  const [ttsDuration, setTtsDuration] = useState<number>(30 * 60); // 30 min par défaut
  const phraseIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const isCompletedRef = useRef<boolean>(isCompleted);
  const currentTimeRef = useRef<number>(currentTime);
  const effectiveDurationRef = useRef<number>(0);

  const [mp3Presets] = useState<Array<{ key: string; label: string; url: string }>>([
    { key: 'track-4', label: 'Track 4 (local)', url: '/audio/track-4.mp3' },
    { key: 'track-2', label: 'Track 2 (local)', url: '/audio/track-2.m4a' },
    { key: 'track-3', label: 'Track 3 (local)', url: '/audio/track-3.m4a' },
    { key: 'meditation-midi', label: 'Meditation MIDI (local)', url: '/audio/meditation-midi.m4a' },
  ]);
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('track-4');

  const stepsByLang = {
    fr: [
      { title: "Préparation", instruction: "Installez-vous confortablement, fermez les yeux et détendez vos épaules.", duration: 60 },
      { title: "Respiration consciente", instruction: "Concentrez-vous sur votre respiration naturelle. Observez l'air qui entre et sort de vos poumons.", duration: 180 },
      { title: "Scan corporel", instruction: "Portez votre attention sur chaque partie de votre corps, de la tête aux pieds.", duration: 240 },
      { title: "Pensées et émotions", instruction: "Observez vos pensées sans jugement, laissez-les passer comme des nuages dans le ciel.", duration: 180 },
      { title: "Retour en douceur", instruction: "Bougez doucement vos doigts et orteils, puis ouvrez lentement les yeux.", duration: 60 },
    ],
    en: [
      { title: "Preparation", instruction: "Get comfortable, close your eyes, and relax your shoulders.", duration: 60 },
      { title: "Mindful breathing", instruction: "Focus on your natural breath. Notice the air moving in and out.", duration: 180 },
      { title: "Body scan", instruction: "Bring attention to each part of your body, from head to toes.", duration: 240 },
      { title: "Thoughts and emotions", instruction: "Notice thoughts without judgment; let them pass like clouds.", duration: 180 },
      { title: "Gentle return", instruction: "Gently move your fingers and toes, then slowly open your eyes.", duration: 60 },
    ],
    es: [
      { title: "Preparación", instruction: "Ponte cómodo, cierra los ojos y relaja los hombros.", duration: 60 },
      { title: "Respiración consciente", instruction: "Enfócate en tu respiración natural. Observa el aire entrar y salir.", duration: 180 },
      { title: "Escaneo corporal", instruction: "Lleva tu atención a cada parte del cuerpo, de la cabeza a los pies.", duration: 240 },
      { title: "Pensamientos y emociones", instruction: "Observa los pensamientos sin juzgar, déjalos pasar como nubes.", duration: 180 },
      { title: "Regreso suave", instruction: "Mueve suavemente los dedos y abre lentamente los ojos.", duration: 60 },
    ],
  } as const;
  const meditationSteps = useMemo(() => {
    const key = selectedLang.split('-')[0].toLowerCase();
    if (key === 'en') return stepsByLang.en;
    if (key === 'es') return stepsByLang.es;
    return stepsByLang.fr;
  }, [selectedLang]);

  const totalDuration = useMemo(
    () => meditationSteps.reduce((sum, s) => sum + s.duration, 0),
    [meditationSteps]
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const effectiveDuration = mode === 'file' ? duration : (ttsContinuous ? ttsDuration : totalDuration);

  const progress = useMemo(() => {
    if (effectiveDuration <= 0) return 0;
    return (currentTime / effectiveDuration) * 100;
  }, [currentTime, effectiveDuration]);

  const timeRemaining = Math.max(0, Math.round(effectiveDuration - currentTime));

  // sync refs used by continuous TTS
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { isCompletedRef.current = isCompleted; }, [isCompleted]);
  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { effectiveDurationRef.current = effectiveDuration; }, [effectiveDuration]);

  const handlePlayPause = async () => {
    if (mode === 'file') {
      const el = audioRef.current;
      if (!el) return;
      try {
        if (isPlaying) {
          el.pause();
          setIsPlaying(false);
        } else {
          // Assurer que l'élément audio pointe sur la source sélectionnée
          try { if (el.src !== mp3Src) { el.src = mp3Src; el.load(); } } catch {}
          // Déverrouille le son et force le volume
          try { el.muted = false; } catch {}
          try { el.volume = 1; } catch {}
          // Tente la lecture immédiate
          try {
            await el.play();
            setIsPlaying(true);
          } catch (err) {
            // Si la lecture échoue, attendre canplay puis relancer
            const once = () => {
              el.removeEventListener('canplay', once);
              el.play().then(() => setIsPlaying(true)).catch((e) => {
                console.error('Audio play error after canplay:', e);
                setAudioError("Impossible de démarrer la lecture. Vérifiez l'URL ou réessayez.");
              });
            };
            el.addEventListener('canplay', once, { once: true } as any);
            // Force un chargement si nécessaire
            try { el.load(); } catch {}
          }
        }
      } catch (e: any) {
        setAudioError("Impossible de lire l'audio. Vérifiez le fichier ou l'autorisation du navigateur.");
        console.error('Audio play error:', e);
      }
    } else {
      // TTS mode
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setAudioError('Synthèse vocale indisponible. Bascule sur le mode MP3.');
        setMode('file');
        // lancer la lecture MP3 après le changement de mode
        setTimeout(() => {
          handlePlayPause();
        }, 0);
        return;
      }
      if (isPlaying) {
        // pause
        setIsPlaying(false);
        try { window.speechSynthesis.cancel(); } catch {}
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else {
        // play / resume
        setIsPlaying(true);
        try { window.speechSynthesis.resume(); } catch {}
        if (ttsContinuous) {
          if (currentTime === 0) phraseIndexRef.current = 0;
          speakNextPhrase();
        } else {
          // ensure we will speak current step if not yet spoken
          if (lastSpokenStepRef.current !== currentStep) {
            speakCurrentStep();
          } else if (currentTime === 0) {
            // force speaking at start even if ref is 0
            lastSpokenStepRef.current = -1;
            speakCurrentStep();
          }
        }
        timerRef.current = window.setInterval(() => {
          setCurrentTime((prev) => {
            const next = prev + 0.5; // advance 0.5s
            if (next >= effectiveDurationRef.current) {
              window.clearInterval(timerRef.current!);
              timerRef.current = null;
              try { window.speechSynthesis.cancel(); } catch {}
              handleComplete();
              return effectiveDurationRef.current;
            }
            return next;
          });
        }, 500);
      }
    }
  };

  const handleReset = () => {
    if (mode === 'file') {
      const el = audioRef.current;
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
    } else {
      try { window.speechSynthesis.cancel(); } catch {}
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    setIsPlaying(false);
    setIsCompleted(false);
    setAudioError(null);
    setCurrentTime(0);
    setCurrentStep(0);
    lastSpokenStepRef.current = -1;
  phraseIndexRef.current = 0;
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setIsPlaying(false);
    onComplete();
  };

  // Sync step with currentTime using cumulative durations
  const stepBoundaries = useMemo(() => {
    let sum = 0;
    return meditationSteps.map((s) => (sum += s.duration));
  }, [meditationSteps]);

  useEffect(() => {
    if (!ttsContinuous) {
      const idx = stepBoundaries.findIndex((end) => currentTime < end);
      const nextStep = idx === -1 ? meditationSteps.length - 1 : idx;
      setCurrentStep(nextStep);
      // In TTS mode, speak at step change (non-continu)
      if (mode === 'tts' && isPlaying && nextStep !== lastSpokenStepRef.current) {
        speakCurrentStep();
      }
    }
  }, [currentTime, stepBoundaries, mode, isPlaying, ttsContinuous]);

  // Setup audio events
  useEffect(() => {
    if (mode !== 'file') return;
    const el = audioRef.current;
    if (!el) return;

    const onLoaded = () => {
      if (el.duration && isFinite(el.duration)) {
        setDuration(Math.round(el.duration));
      }
    };
    const onTime = () => setCurrentTime(el.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(el.duration || duration);
      setIsCompleted(true);
      onComplete();
    };
    const onError = () => {
      const failing = el.currentSrc || mp3Src;
      setAudioError(`Erreur de chargement audio: ${failing}. Essayez un préréglage (Pluie/Forêt).`);
    };

    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
    };
  }, [onComplete, duration, mode, mp3Src]);

  // Cancel media and reset when switching mode
  useEffect(() => {
    handleReset();
  }, [mode]);

  // Web Speech API: load voices list
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      try {
        const savedLang = localStorage.getItem('tts_lang') || '';
        const savedVoice = localStorage.getItem('tts_voice') || '';
        if (savedLang) setSelectedLang(savedLang);
        if (savedVoice) setSelectedVoiceName(savedVoice);
      } catch {}
      if (v.length) {
        // Prefer FR by default if nothing saved
        if (!localStorage.getItem('tts_lang')) {
          const fr = v.find((vv) => vv.lang?.toLowerCase().startsWith('fr'));
          setSelectedLang(fr?.lang || v[0].lang || 'fr-FR');
        }
        if (!localStorage.getItem('tts_voice')) {
          const fr = v.find((vv) => vv.lang?.toLowerCase().startsWith('fr'));
          setSelectedVoiceName(fr?.name || v[0].name);
        }
      }
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try { localStorage.setItem('tts_lang', selectedLang); } catch {}
  }, [selectedLang]);
  useEffect(() => {
    try { localStorage.setItem('tts_voice', selectedVoiceName); } catch {}
  }, [selectedVoiceName]);

  const languageOptions = useMemo(() => {
    // Build a list of unique language tags from available voices
    const set = new Set<string>();
    voices.forEach(v => { if (v.lang) set.add(v.lang); });
    return Array.from(set).sort();
  }, [voices]);

  const selectedLangBase = useMemo(() => selectedLang.split('-')[0].toLowerCase(), [selectedLang]);
  const filteredVoices = useMemo(() => {
    const list = voices.filter(v => (v.lang || '').toLowerCase().startsWith(selectedLangBase));
    return list.length ? list : voices;
  }, [voices, selectedLangBase]);

  useEffect(() => {
    // If current selected voice not in filtered list, pick first
    if (filteredVoices.length && !filteredVoices.find(v => v.name === selectedVoiceName)) {
      setSelectedVoiceName(filteredVoices[0].name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredVoices]);

  const handleReplay = async () => {
    // Réinitialiser puis relancer immédiatement
    if (mode === 'file') {
      const el = audioRef.current;
      if (el) {
        try { el.pause(); } catch {}
        el.currentTime = 0;
        setIsCompleted(false);
        setCurrentTime(0);
        setCurrentStep(0);
        setAudioError(null);
        lastSpokenStepRef.current = -1;
        phraseIndexRef.current = 0;
        try {
          await el.play();
          setIsPlaying(true);
        } catch (e) {
          setAudioError("Lecture impossible au redémarrage.");
          setIsPlaying(false);
        }
      }
    } else {
      try { window.speechSynthesis.cancel(); } catch {}
      setIsCompleted(false);
      setAudioError(null);
      setCurrentTime(0);
      setCurrentStep(0);
      lastSpokenStepRef.current = -1;
      phraseIndexRef.current = 0;
      setIsPlaying(true);
      try { window.speechSynthesis.resume(); } catch {}
      if (ttsContinuous) {
        speakNextPhrase();
      } else {
        speakCurrentStep();
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.5;
          if (next >= effectiveDurationRef.current) {
            window.clearInterval(timerRef.current!);
            timerRef.current = null;
            try { window.speechSynthesis.cancel(); } catch {}
            handleComplete();
            return effectiveDurationRef.current;
          }
          return next;
        });
      }, 500);
    }
  };

  const guidancePhrases = useMemo(() => {
    const key = selectedLang.split('-')[0].toLowerCase();
    if (key === 'en') {
      return [
        "Breathe in deeply, feel the air filling your lungs.",
        "Exhale slowly, release tension from face and shoulders.",
        "Let your breath find a natural, calm rhythm.",
        "Relax the jaw, soften the neck muscles.",
        "Gently bring your attention back to the breath when it wanders.",
        "Feel the weight of your body supported, stable and safe.",
        "Scan your body from head to toes, welcome each sensation.",
        "If a thought arises, notice it and let it pass.",
        "Inhale softness; exhale what you no longer need.",
        "Smile slightly, offer yourself kindness.",
      ];
    }
    if (key === 'es') {
      return [
        "Inhala profundamente, siente el aire llenar tus pulmones.",
        "Exhala lentamente, suelta la tensión del rostro y hombros.",
        "Deja que tu respiración encuentre un ritmo natural y calmado.",
        "Relaja la mandíbula, suaviza los músculos del cuello.",
        "Trae suavemente tu atención a la respiración cuando se disperse.",
        "Siente el peso del cuerpo apoyado, estable y seguro.",
        "Escanea el cuerpo de la cabeza a los pies, acoge cada sensación.",
        "Si surge un pensamiento, obsérvalo y déjalo pasar.",
        "Inhala suavidad; exhala lo que ya no necesitas.",
        "Sonríe ligeramente, ofrécete amabilidad.",
      ];
    }
    return [
      "Inspirez profondément, sentez l'air remplir vos poumons.",
      "Expirez lentement, relâchez les tensions du visage et des épaules.",
      "Laissez votre respiration trouver un rythme naturel et calme.",
      "Relâchez la mâchoire, détendez les muscles du cou.",
      "Ramenez doucement votre attention au souffle lorsqu'elle s'échappe.",
      "Sentez le poids du corps soutenu, stable et en sécurité.",
      "Balayez votre corps de la tête aux pieds, accueillez chaque sensation.",
      "Si une pensée survient, remarquez-la et laissez-la passer.",
      "Inspirez, accueillez la douceur; expirez, relâchez ce qui est de trop.",
      "Souriez légèrement, offrez-vous de la bienveillance.",
    ];
  }, [selectedLang]);

  const buildUtterance = (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.name === selectedVoiceName);
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang || utter.lang;
    } else {
      utter.lang = selectedLang || 'fr-FR';
    }
    utter.rate = rate;
    utter.pitch = pitch;
    utter.volume = 1;
    return utter;
  };

  const speakCurrentStep = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const step = meditationSteps[currentStep];
    if (!step) return;
    try {
      // Stop any current speech before speaking new step
      window.speechSynthesis.cancel();
      const utter = buildUtterance(`${step.title}. ${step.instruction}`);
      try { window.speechSynthesis.resume(); } catch {}
      window.speechSynthesis.speak(utter);
      lastSpokenStepRef.current = currentStep;
    } catch (e) {
      console.warn('TTS non disponible:', e);
    }
  };

  const speakTest = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAudioError("Synthèse vocale indisponible dans ce navigateur.");
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = buildUtterance('ceci est un teste pour la meditation guidé');
      try { window.speechSynthesis.resume(); } catch {}
      window.speechSynthesis.speak(utter);
    } catch (e) {
      setAudioError("Échec du test de voix TTS.");
      console.warn('TTS test error:', e);
    }
  };

  const speakNextPhrase = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!isPlayingRef.current || isCompletedRef.current) return;
    if (currentTimeRef.current >= (effectiveDurationRef.current - 0.25)) return;
    try {
      // Ne pas annuler systématiquement pour éviter de bloquer la reprise; s'assurer que la synthèse n'est pas en pause
      try { window.speechSynthesis.resume(); } catch {}
      const phrase = guidancePhrases[phraseIndexRef.current % guidancePhrases.length];
      const utter = buildUtterance(phrase);
      utter.onend = () => {
        if (!isPlayingRef.current || isCompletedRef.current) return;
        if (currentTimeRef.current >= (effectiveDurationRef.current - 0.25)) return;
        phraseIndexRef.current += 1;
        speakNextPhrase();
      };
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('TTS continu indisponible:', e);
    }
  };

  // Appliquer l'URL saisie dans le champ (et persister)
  // Suppression de l'action "Appliquer" : la lecture utilise directement l'URL affichée

  // Petit test de son local (bip) via Web Audio API
  // Outil de test bip retiré

  useEffect(() => {
    // Définir par défaut le préréglage sélectionné et utiliser sa source
    const p = mp3Presets.find(x => x.key === selectedPresetKey) || mp3Presets[0];
    if (p?.url) {
      setSelectedPresetKey(p.key);
      setMp3Src(p.url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPresetChange = (key: string) => {
    setSelectedPresetKey(key);
    const p = mp3Presets.find(x => x.key === key);
    if (p?.url) setMp3Src(p.url);
  };

  // Suppression de la définition d'URL par préréglage

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Retour
        </Button>
        <Badge className="bg-purple-100 text-purple-800">
          <Brain className="h-3 w-3 mr-1" />
          Mindfulness
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-800">
            Méditation guidée
          </CardTitle>
          <p className="text-purple-600">
            Une séance de relaxation pour réduire le stress
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Mode selector: MP3 file vs TTS */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm cursor-pointer border ${mode === 'file' ? 'bg-white border-purple-300 text-purple-700' : 'bg-transparent border-gray-300 text-gray-600'}`} onClick={() => setMode('file')}>
              Audio MP3
            </div>
            <div className={`px-3 py-1 rounded-full text-sm cursor-pointer border ${mode === 'tts' ? 'bg-white border-purple-300 text-purple-700' : 'bg-transparent border-gray-300 text-gray-600'}`} onClick={() => setMode('tts')}>
              Synthèse vocale (TTS)
            </div>
          </div>

          {/* Guided audio (placer le fichier dans public/audio/guided-meditation-fr.mp3) */}
          {mode === 'file' && (
            <>
              <audio
                ref={audioRef}
                src={mp3Src}
                preload="none"
                controls
                playsInline
              />
              <div className="text-xs text-gray-600 mt-1">Lecture: MP3 → {mp3Src}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-3">
                  <label className="block text-sm text-gray-600 mb-1">Préréglages</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 bg-white"
                    onChange={(e) => onPresetChange(e.target.value)}
                    value={selectedPresetKey}
                  >
                    {mp3Presets.map((p) => (
                      <option key={p.key} value={p.key}>{p.label}{p.url ? '' : ' (à définir)'}</option>
                    ))}
                  </select>
                </div>
                {/* Champ URL du MP3 et aide supprimés */}
              </div>
            </>
          )}

          {mode === 'tts' && (
            <>
              <div className="text-xs text-gray-600">Lecture: Synthèse vocale (TTS)</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Langue</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 bg-white"
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                  >
                    {languageOptions.length === 0 && <option>Aucune langue détectée</option>}
                    {languageOptions.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Voix</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 bg-white"
                    value={selectedVoiceName}
                    onChange={(e) => setSelectedVoiceName(e.target.value)}
                  >
                    {filteredVoices.length === 0 && <option>Voix non disponibles</option>}
                    {filteredVoices.map((v) => (
                      <option key={v.name + v.lang} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3 md:col-span-3 md:grid-cols-2">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Vitesse</label>
                    <input
                      type="range"
                      min={0.7}
                      max={1.3}
                      step={0.05}
                      value={rate}
                      onChange={(e) => setRate(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Timbre</label>
                    <input
                      type="range"
                      min={0.7}
                      max={1.3}
                      step={0.05}
                      value={pitch}
                      onChange={(e) => setPitch(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <Button variant="outline" onClick={speakTest}>Tester la voix</Button>
                </div>
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="ttsContinuous"
                      type="checkbox"
                      className="h-4 w-4"
                      checked={ttsContinuous}
                      onChange={(e) => setTtsContinuous(e.target.checked)}
                    />
                    <label htmlFor="ttsContinuous" className="text-sm text-gray-700">Guidage continu (paroles toute la séance)</label>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-3 gap-2">
                    <button
                      className={`px-2 py-1 text-sm border rounded ${ttsDuration===10*60?'border-purple-500 text-purple-700':'border-gray-300 text-gray-700'}`}
                      onClick={() => setTtsDuration(10*60)}
                    >10 min</button>
                    <button
                      className={`px-2 py-1 text-sm border rounded ${ttsDuration===20*60?'border-purple-500 text-purple-700':'border-gray-300 text-gray-700'}`}
                      onClick={() => setTtsDuration(20*60)}
                    >20 min</button>
                    <button
                      className={`px-2 py-1 text-sm border rounded ${ttsDuration===30*60?'border-purple-500 text-purple-700':'border-gray-300 text-gray-700'}`}
                      onClick={() => setTtsDuration(30*60)}
                    >30 min</button>
                  </div>
                </div>
                <div className="md:col-span-3 -mt-2 text-xs text-gray-500">
                  Astuce: si aucune voix n’apparaît, ouvrez cette page dans Chrome/Edge, attendez 2-3 secondes, puis relancez la lecture.
                </div>
              </div>
            </>
          )}

          <div className="text-center">
            <div className="text-4xl font-bold text-purple-800 mb-2">
              {formatTime(timeRemaining)}
            </div>
            <Progress value={progress} className="w-full" />
            {audioError && (
              <div className="text-xs text-red-600 mt-2">{audioError}</div>
            )}
            {mode === 'file' && (
              <div className="text-xs text-gray-500 mt-1">
                Placez un MP3 libre de droits dans public/audio/guided-meditation-fr.mp3 (voir README), ou collez une URL dans le champ ci-dessus.
              </div>
            )}
          </div>

          {!isCompleted && (
            <Card className="bg-white/70">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-purple-800">
                      {currentStep + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    {meditationSteps[currentStep]?.title}
                  </h3>
                </div>
                <p className="text-gray-600 ml-11">
                  {meditationSteps[currentStep]?.instruction}
                </p>
              </CardContent>
            </Card>
          )}

          {isCompleted && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800 mb-1">
                  Félicitations !
                </h3>
                <p className="text-green-600">
                  Vous avez terminé votre séance de méditation
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex space-x-3 justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              className="rounded-full"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            {isCompleted ? (
              <>
                <Button
                  onClick={handleReplay}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 rounded-full"
                >
                  Rejouer
                </Button>
                <Button
                  onClick={onBack}
                  className="px-8 rounded-full"
                  variant="outline"
                >
                  Terminé
                </Button>
              </>
            ) : (
              <Button
                onClick={handlePlayPause}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 rounded-full"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Commencer
                  </>
                )}
              </Button>
            )}
            
            {!isCompleted && (
              <Button
                variant="ghost"
                onClick={handleComplete}
                className="text-gray-600"
              >
                Terminer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeditationContent;
