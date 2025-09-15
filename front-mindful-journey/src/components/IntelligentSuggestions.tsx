import React, { useState, useEffect, useRef, useCallback } from 'react';
import DynamicAudioBackdrop from './DynamicAudioBackdrop';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  Heart,
  TrendingUp,
  UserCheck,
  Target,
  RefreshCw,
  Sparkles,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Zap,
  Star
} from 'lucide-react';
import apiService from '@/lib/api';

interface Suggestion {
  type: string;
  title: string;
  description: string;
  duration?: string;
  difficulty?: string;
  priority?: string;
  icon?: string;
  category?: string;
  score?: number;
  tags?: string[];
  action_steps?: string[];
  // URL d'un audio guidé optionnel pour ce défi / contenu
  audio_url?: string;
  // Transcription texte optionnelle
  transcription?: string;
  // Variante: tableau de paragraphes
  transcription_blocks?: string[];
  // Variantes audio multi-langues: { fr: '/audio/fr.mp3', en: '/audio/en.mp3' }
  audio_variants?: Record<string, string>;
}

interface HealthProfessional {
  id?: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  price: string | number;
  availability: string;
  consultationType?: 'video' | 'inPerson' | 'both';
  image?: string;
  reason?: string;
}

interface SuggestionGroup {
  challenges: Suggestion[];
  practitioners: HealthProfessional[];
  content: Suggestion[];
  immediate_actions: Suggestion[];
}

interface AppTrack {
  id: string;
  title: string;
  src: string; // e.g. "/audio/guided-default.mp3"
  languages?: string[];
  duration?: number; // seconds
}

interface IntelligentSuggestionsProps {
  userContext: {
    mood?: number;
    stress?: number;
    energy?: number;
    diagnostic?: any;
  };
  onSuggestionSelect?: (suggestion: Suggestion) => void;
  onPractitionerOpen?: (p: HealthProfessional) => void;
  onPractitionerBook?: (p: HealthProfessional) => void;
}

const IntelligentSuggestions: React.FC<IntelligentSuggestionsProps> = ({
  userContext,
  onSuggestionSelect,
  onPractitionerOpen,
  onPractitionerBook
}) => {
  const [suggestions, setSuggestions] = useState<SuggestionGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  // Audios intégrés à l'application
  const [appTracks, setAppTracks] = useState<AppTrack[]>([]);
  // Etat audio guidé pour les défis
  const [playingChallengeIndex, setPlayingChallengeIndex] = useState<number | null>(null);
  const [playingImmediateIndex, setPlayingImmediateIndex] = useState<number | null>(null);
  const [playingContentIndex, setPlayingContentIndex] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  // Séquence d'audio courante pour ignorer les callbacks obsolètes (évite lectures multiples)
  const currentAudioSeqRef = useRef(0);
  // URLs audio personnalisés par index de challenge (ObjectURL)
  const [customAudioUrls, setCustomAudioUrls] = useState<Record<number, string>>({}); // challenges
  const customUrlOriginalNames = useRef<Record<number, string>>({});
  const [customImmediateAudioUrls, setCustomImmediateAudioUrls] = useState<Record<number, string>>({});
  const customImmediateUrlOriginalNames = useRef<Record<number, string>>({});
  const [isPaused, setIsPaused] = useState(false);
  // Ref miroir pour accès stable dans les callbacks d'interval
  const isPausedRef = useRef(false);
  const [openChallengeTexts, setOpenChallengeTexts] = useState<Record<number, boolean>>({});
  const [openImmediateTexts, setOpenImmediateTexts] = useState<Record<number, boolean>>({});
  const [challengeLangSelections, setChallengeLangSelections] = useState<Record<number, string>>({});
  const [immediateLangSelections, setImmediateLangSelections] = useState<Record<number, string>>({});
  // Hauteurs verrouillées pour empêcher la réduction de la carte pendant la lecture
  const [lockedImmediateHeights, setLockedImmediateHeights] = useState<Record<number, number>>({});
  const [lockedChallengeHeights, setLockedChallengeHeights] = useState<Record<number, number>>({});
  const [lockedContentHeights, setLockedContentHeights] = useState<Record<number, number>>({});

  // Génère des variantes d'URL robustes (gère accents NFC/NFD et caractères spéciaux)
  const buildUrlCandidates = useCallback((src?: string): string[] => {
    if (!src) return [];
    if (src.startsWith('blob:')) return [src];
    try {
      // Garder l'original en premier
      const out: string[] = [src];
      // Ne traite que les chemins /audio/xxx
      const m = src.match(/^(.*\/)([^\/]+)$/);
      if (!m) return Array.from(new Set(out));
      const base = m[1];
      const file = decodeURIComponent(m[2]);
      const nfc = file.normalize('NFC');
      const nfd = file.normalize('NFD');
      const enc = (name: string) => base + encodeURIComponent(name);
      out.push(enc(nfc));
      out.push(enc(nfd));
      // Variante: remplacer # non encodé
      if (file.includes('#')) {
        out.push(base + encodeURIComponent(file.replace('#', '#'))); // redondant mais garde l'intention
      }
      return Array.from(new Set(out));
    } catch {
      return [src];
    }
  }, []);

  // Charger le manifest des audios intégrés (public/audio/manifest.json)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/audio/manifest.json', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data?.tracks)) setAppTracks(data.tracks);
      } catch { }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Parse "5 min" / "10 minutes" / "7m" -> minutes number
  const parseDurationMinutes = (d?: string): number => {
    if (!d) return 5; // valeur par défaut
    const match = d.match(/(\d+)(?=\s*(min|m|minutes?))/i);
    if (match) return parseInt(match[1], 10);
    const num = parseInt(d, 10);
    return isNaN(num) ? 5 : num;
  };

  const clearAudio = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.loop = false;
        try { audioRef.current.currentTime = 0; } catch { }
        try {
          // Détacher la source pour empêcher toute lecture résiduelle
          audioRef.current.src = '';
          audioRef.current.removeAttribute('src');
          audioRef.current.load();
        } catch { }
      } catch { }
      // Conserver l'élément pour réutilisation, évite des instances multiples
    }
    setPlayingChallengeIndex(null);
    setPlayingImmediateIndex(null);
    setPlayingContentIndex(null);
    setRemainingSeconds(0);
    setTotalSeconds(0);
    setAudioLoading(false);
    setIsPaused(false);
  }, []);

  const stopCurrent = useCallback(() => {
    clearAudio();
  }, [clearAudio]);

  const startChallengeAudio = useCallback((index: number, challenge: Suggestion, overrideSrc?: string, forceRestart: boolean = false) => {
    // Si on clique le même -> stop, sauf si on force un redémarrage (changement de source/langue)
    if (!forceRestart && !overrideSrc && playingChallengeIndex === index) {
      stopCurrent();
      return;
    }
    // Capturer la hauteur actuelle de la carte avant masquage du contenu
    try {
      const el = document.querySelector<HTMLElement>(`[data-ch-card='${index}']`);
      if (el) {
        const h = el.getBoundingClientRect().height;
        if (h > 0) setLockedChallengeHeights(prev => ({ ...prev, [index]: h }));
      }
      // Remesure post-layout pour stabiliser la hauteur avant overlay
      setTimeout(() => {
        try {
          const el2 = document.querySelector<HTMLElement>(`[data-ch-card='${index}']`);
          if (el2) {
            const h2 = el2.getBoundingClientRect().height;
            if (h2 > 0) setLockedChallengeHeights(prev => ({ ...prev, [index]: Math.max(prev[index] || 0, h2) }));
          }
        } catch { }
      }, 80);
    } catch { }
    // Stop précédent (après mesure)
    stopCurrent();
    setAudioError(null);
    const minutes = parseDurationMinutes(challenge.duration);
    const total = minutes * 60;
    setTotalSeconds(total);
    setRemainingSeconds(total);
    setPlayingChallengeIndex(index);
    setPlayingImmediateIndex(null);
    setPlayingContentIndex(null);
    setAudioLoading(true);
    setIsPaused(false);

    // Choix de langue si variantes
    let variantUrl: string | undefined;
    if (challenge.audio_variants) {
      const selected = challengeLangSelections[index];
      variantUrl = (selected && challenge.audio_variants[selected]) || challenge.audio_variants['fr'] || Object.values(challenge.audio_variants)[0];
    }
    const defaultApp = appTracks[0]?.src;
    const chosen = overrideSrc || customAudioUrls[index] || variantUrl || challenge.audio_url || defaultApp;
    if (!chosen) {
      setAudioLoading(false);
      setAudioError("Aucune source audio disponible. Sélectionnez un 'Audio intégré'.");
      return;
    }
    // Incrémente la séquence pour invalider les handlers précédents
    const mySeq = ++currentAudioSeqRef.current;
    const candidates = buildUrlCandidates(chosen);

    const tryIndex = (ci: number) => {
      if (mySeq !== currentAudioSeqRef.current) return; // obsolète
      const url = candidates[ci];
      setCurrentAudioUrl(url);
      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      // Préparer l'élément unique
      try {
        audio.pause();
        audio.loop = false;
      } catch { }
      audio.preload = 'auto';
      try { audio.src = url; audio.load(); } catch { }
      const onReady = () => {
        if (mySeq !== currentAudioSeqRef.current) {
          try { audio.removeEventListener('canplay', onReady as any); } catch { }
          try { audio.removeEventListener('loadedmetadata', onReady as any); } catch { }
          try { audio.removeEventListener('error', onError as any); } catch { }
          return;
        }
        // Décider si on loop : uniquement si durée intrinsèque < durée challenge
        try {
          if (isFinite(audio.duration) && audio.duration > 0) {
            audio.loop = audio.duration < total - 1; // marge 1s
          } else {
            // Si pas d'info (stream ou metadata tardive) on active loop par sécurité
            audio.loop = true;
          }
        } catch { /* noop */ }
        try {
          audio.muted = true;
          audio.play()
            .then(() => { try { audio.muted = false; } catch { } })
            .catch(err => {
              setAudioError('Lecture audio bloquée (interaction requise)');
              console.warn('Audio play error', err);
            });
        } catch (err) {
          setAudioError('Lecture audio bloquée (interaction requise)');
          console.warn('Audio play error', err);
        }
        setAudioLoading(false);
        // Démarrer timer
        timerRef.current = window.setInterval(() => {
          setRemainingSeconds(prev => {
            if (prev <= 1) {
              clearAudio();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      };
      const onError = () => {
        if (mySeq !== currentAudioSeqRef.current) {
          try { audio.removeEventListener('canplay', onReady as any); } catch { }
          try { audio.removeEventListener('loadedmetadata', onReady as any); } catch { }
          try { audio.removeEventListener('error', onError as any); } catch { }
          return;
        }
        // Essayer la variante suivante
        if (ci + 1 < candidates.length) {
          try { audio.removeEventListener('canplay', onReady as any); } catch { }
          try { audio.removeEventListener('loadedmetadata', onReady as any); } catch { }
          try { audio.removeEventListener('error', onError as any); } catch { }
          tryIndex(ci + 1);
          return;
        }
        setAudioError(`Impossible de charger l'audio (${url})`);
        clearAudio();
      };
      audio.addEventListener('canplay', onReady, { once: true });
      audio.addEventListener('loadedmetadata', onReady, { once: true });
      // Tentative immédiate (au cas où canplay tarde)
      try { audio.muted = true; void audio.play(); } catch { }
      audio.addEventListener('error', onError, { once: true });
    };
    tryIndex(0);
    // Sécurité: si canplay ne vient pas dans 6s -> erreur
    setTimeout(() => {
      if (mySeq === currentAudioSeqRef.current && audioLoading) {
        setAudioError('Chargement audio trop long');
        clearAudio();
      }
    }, 6000);
  }, [audioLoading, clearAudio, playingChallengeIndex, stopCurrent, customAudioUrls, challengeLangSelections, appTracks]);

  const startImmediateAudio = useCallback((index: number, action: Suggestion, overrideSrc?: string, forceRestart: boolean = false) => {
    if (!forceRestart && !overrideSrc && playingImmediateIndex === index) {
      stopCurrent();
      return;
    }
    // Capturer hauteur avant masquage
    try {
      const el = document.querySelector<HTMLElement>(`[data-imm-card='${index}']`);
      if (el) {
        const h = el.getBoundingClientRect().height;
        setLockedImmediateHeights(prev => ({ ...prev, [index]: h }));
      }
    } catch { }
    stopCurrent();
    setAudioError(null);
    const minutes = parseDurationMinutes(action.duration);
    const total = minutes * 60;
    setTotalSeconds(total);
    setRemainingSeconds(total);
    setPlayingImmediateIndex(index);
    setPlayingChallengeIndex(null);
    setAudioLoading(true);
    setIsPaused(false);
    let variantUrl: string | undefined;
    if (action.audio_variants) {
      const selected = immediateLangSelections[index];
      variantUrl = (selected && action.audio_variants[selected]) || action.audio_variants['fr'] || Object.values(action.audio_variants)[0];
    }
    const defaultAppImm = appTracks[0]?.src;
    const chosenImm = overrideSrc || customImmediateAudioUrls[index] || variantUrl || action.audio_url || defaultAppImm;
    if (!chosenImm) {
      setAudioLoading(false);
      setAudioError("Aucune source audio disponible. Sélectionnez un 'Audio intégré'.");
      return;
    }
    const mySeq = ++currentAudioSeqRef.current;
    const candidatesImm = buildUrlCandidates(chosenImm);
    const tryImm = (ci: number) => {
      if (mySeq !== currentAudioSeqRef.current) return;
      const url = candidatesImm[ci];
      setCurrentAudioUrl(url);
      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      try {
        audio.pause();
        audio.loop = false;
      } catch { }
      audio.preload = 'auto';
      try { audio.src = url; audio.load(); } catch { }
      const onReady = () => {
        if (mySeq !== currentAudioSeqRef.current) {
          try { audio.removeEventListener('canplay', onReady as any); } catch { }
          try { audio.removeEventListener('loadedmetadata', onReady as any); } catch { }
          try { audio.removeEventListener('error', onError as any); } catch { }
          return;
        }
        try {
          if (isFinite(audio.duration) && audio.duration > 0) {
            audio.loop = audio.duration < total - 1;
          } else {
            audio.loop = true;
          }
        } catch { }
        try {
          audio.muted = true;
          audio.play()
            .then(() => { try { audio.muted = false; } catch { } })
            .catch(err => {
              setAudioError('Lecture audio bloquée (interaction requise)');
              console.warn('Audio play error', err);
            });
        } catch (err) {
          setAudioError('Lecture audio bloquée (interaction requise)');
          console.warn('Audio play error', err);
        }
        setAudioLoading(false);
        timerRef.current = window.setInterval(() => {
          setRemainingSeconds(prev => {
            if (prev <= 1) {
              clearAudio();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      };
      const onError = () => {
        if (mySeq !== currentAudioSeqRef.current) {
          try { audio.removeEventListener('canplay', onReady as any); } catch { }
          try { audio.removeEventListener('loadedmetadata', onReady as any); } catch { }
          try { audio.removeEventListener('error', onError as any); } catch { }
          return;
        }
        if (ci + 1 < candidatesImm.length) {
          try { audio.removeEventListener('canplay', onReady as any); } catch { }
          try { audio.removeEventListener('loadedmetadata', onReady as any); } catch { }
          try { audio.removeEventListener('error', onError as any); } catch { }
          tryImm(ci + 1);
          return;
        }
        setAudioError(`Impossible de charger l'audio (${url})`);
        clearAudio();
      };
      audio.addEventListener('canplay', onReady, { once: true });
      audio.addEventListener('loadedmetadata', onReady, { once: true });
      try { audio.muted = true; void audio.play(); } catch { }
      audio.addEventListener('error', onError, { once: true });
    };
    tryImm(0);
    setTimeout(() => {
      if (mySeq === currentAudioSeqRef.current && audioLoading) {
        setAudioError('Chargement audio trop long');
        clearAudio();
      }
    }, 6000);
  }, [audioLoading, clearAudio, playingImmediateIndex, customImmediateAudioUrls, stopCurrent, immediateLangSelections, appTracks]);

  // Lecture audio pour un contenu (style identique aux autres)
  const startContentAudio = useCallback((index: number, item: Suggestion, overrideSrc?: string, forceRestart: boolean = false) => {
    if (!forceRestart && !overrideSrc && playingContentIndex === index) {
      stopCurrent();
      return;
    }
    try {
      const el = document.querySelector<HTMLElement>(`[data-co-card='${index}']`);
      if (el) {
        const h = el.getBoundingClientRect().height;
        setLockedContentHeights(prev => ({ ...prev, [index]: h }));
      }
    } catch { }
    stopCurrent();
    setAudioError(null);
    const minutes = parseDurationMinutes(item.duration);
    const total = minutes * 60;
    setTotalSeconds(total);
    setRemainingSeconds(total);
    setPlayingContentIndex(index);
    setPlayingImmediateIndex(null);
    setPlayingChallengeIndex(null);
    setAudioLoading(true);
    setIsPaused(false);
    const chosen = overrideSrc || item.audio_url || appTracks[0]?.src;
    if (!chosen) {
      setAudioLoading(false);
      setAudioError("Aucune source audio disponible pour ce contenu.");
      return;
    }
    const mySeq = ++currentAudioSeqRef.current;
    const candidates = buildUrlCandidates(chosen);
    const tryIndex = (ci: number) => {
      if (mySeq !== currentAudioSeqRef.current) return;
      const url = candidates[ci];
      setCurrentAudioUrl(url);
      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      try { audio.pause(); audio.loop = false; } catch { }
      audio.preload = 'auto';
      try { audio.src = url; audio.load(); } catch { }
      const onReady = () => {
        if (mySeq !== currentAudioSeqRef.current) return;
        try {
          if (isFinite(audio.duration) && audio.duration > 0) {
            audio.loop = audio.duration < total - 1;
          } else {
            audio.loop = true;
          }
        } catch { }
        try {
          audio.muted = true;
          audio.play().then(() => { try { audio.muted = false; } catch { } }).catch(err => {
            setAudioError('Lecture audio bloquée (interaction requise)');
            console.warn('Audio play error', err);
          });
        } catch (err) {
          setAudioError('Lecture audio bloquée (interaction requise)');
          console.warn('Audio play error', err);
        }
        setAudioLoading(false);
        timerRef.current = window.setInterval(() => {
          setRemainingSeconds(prev => {
            if (prev <= 1) {
              clearAudio();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      };
      const onError = () => {
        if (mySeq !== currentAudioSeqRef.current) return;
        if (ci + 1 < candidates.length) {
          tryIndex(ci + 1); return;
        }
        setAudioError(`Impossible de charger l'audio (${url})`);
        clearAudio();
      };
      audio.addEventListener('canplay', onReady, { once: true });
      audio.addEventListener('loadedmetadata', onReady, { once: true });
      try { audio.muted = true; void audio.play(); } catch { }
      audio.addEventListener('error', onError, { once: true });
    };
    tryIndex(0);
    setTimeout(() => {
      if (mySeq === currentAudioSeqRef.current && audioLoading) {
        setAudioError('Chargement audio trop long');
        clearAudio();
      }
    }, 6000);
  }, [audioLoading, clearAudio, playingContentIndex, stopCurrent, appTracks]);

  // Sélection d'un fichier audio local pour un challenge
  const handleSelectAudio = (index: number, file: File) => {
    if (!file || !file.type.startsWith('audio/')) return;
    // Révoquer ancien éventuel
    const prev = customAudioUrls[index];
    if (prev) URL.revokeObjectURL(prev);
    const url = URL.createObjectURL(file);
    setCustomAudioUrls(prevMap => ({ ...prevMap, [index]: url }));
    customUrlOriginalNames.current[index] = file.name;
    // Si ce challenge est en cours -> redémarrer avec nouveau son
    if (playingChallengeIndex === index) {
      startChallengeAudio(index, suggestions!.challenges[index]);
    }
  };
  // Sélection d'un audio intégré pour un challenge
  const handleSelectAppAudio = (index: number, track: AppTrack) => {
    const prev = customAudioUrls[index];
    if (prev && prev.startsWith('blob:')) {
      try { URL.revokeObjectURL(prev); } catch { }
    }
    setCustomAudioUrls(prevMap => ({ ...prevMap, [index]: track.src }));
    customUrlOriginalNames.current[index] = `App: ${track.title}`;
    // Démarrer automatiquement la lecture avec l'audio intégré sélectionné
    if (suggestions && suggestions.challenges && suggestions.challenges[index]) {
      startChallengeAudio(index, suggestions.challenges[index], track.src, true);
    }
  };
  const handleSelectImmediateAudio = (index: number, file: File) => {
    if (!file || !file.type.startsWith('audio/')) return;
    const prev = customImmediateAudioUrls[index];
    if (prev) URL.revokeObjectURL(prev);
    const url = URL.createObjectURL(file);
    setCustomImmediateAudioUrls(prevMap => ({ ...prevMap, [index]: url }));
    customImmediateUrlOriginalNames.current[index] = file.name;
    if (playingImmediateIndex === index) {
      startImmediateAudio(index, suggestions!.immediate_actions[index]);
    }
  };
  const handleSelectImmediateAppAudio = (index: number, track: AppTrack) => {
    const prev = customImmediateAudioUrls[index];
    if (prev && prev.startsWith('blob:')) {
      try { URL.revokeObjectURL(prev); } catch { }
    }
    setCustomImmediateAudioUrls(prevMap => ({ ...prevMap, [index]: track.src }));
    customImmediateUrlOriginalNames.current[index] = `App: ${track.title}`;
    // Démarrer automatiquement la lecture avec l'audio intégré sélectionné
    if (suggestions && suggestions.immediate_actions && suggestions.immediate_actions[index]) {
      startImmediateAudio(index, suggestions.immediate_actions[index], track.src, true);
    }
  };

  const pauseChallenge = () => {
    if (!audioRef.current) return;
    try { audioRef.current.pause(); } catch { }
    // Stop interval so countdown freezes
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Recalibrate remaining time based on real audio currentTime if possible
    try {
      if (totalSeconds > 0 && audioRef.current && isFinite(audioRef.current.currentTime)) {
        const elapsed = Math.floor(audioRef.current.currentTime);
        const newRemaining = Math.max(0, totalSeconds - elapsed);
        setRemainingSeconds(prev => (Math.abs(prev - newRemaining) > 1 ? newRemaining : prev));
      }
    } catch { }
    setIsPaused(true);
    isPausedRef.current = true;
  };

  const resumeChallenge = () => {
    if (!audioRef.current) return;
    // Sync remainingSeconds with currentTime in case user scrubbed externally
    try {
      if (totalSeconds > 0 && isFinite(audioRef.current.currentTime)) {
        const elapsed = Math.floor(audioRef.current.currentTime);
        setRemainingSeconds(Math.max(0, totalSeconds - elapsed));
      }
    } catch { }
    audioRef.current.play().then(() => {
      if (!timerRef.current) {
        timerRef.current = window.setInterval(() => {
          setRemainingSeconds(prev => {
            if (isPausedRef.current) return prev; // protection supplémentaire
            if (prev <= 1) {
              clearAudio();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      setIsPaused(false);
      isPausedRef.current = false;
    }).catch(err => {
      setAudioError('Impossible de reprendre');
      console.warn('Resume error', err);
    });
  };

  const toggleChallengeText = (index: number) => setOpenChallengeTexts(p => ({ ...p, [index]: !p[index] }));
  const toggleImmediateText = (index: number) => setOpenImmediateTexts(p => ({ ...p, [index]: !p[index] }));

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAudio();
      // Revoke all custom object URLs
      Object.values(customAudioUrls).forEach(u => URL.revokeObjectURL(u));
      Object.values(customImmediateAudioUrls).forEach(u => URL.revokeObjectURL(u));
    };
  }, [clearAudio, customAudioUrls, customImmediateAudioUrls]);

  // Diagnostic positif ? (stress ≤ 2, mood ≥ 4, energy ≥ 3)
  const isPositive = (() => {
    const s = userContext?.stress;
    const m = userContext?.mood;
    const e = userContext?.energy;
    if (s == null || m == null || e == null) return false;
    return s <= 2 && m >= 4 && e >= 3;
  })();

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const context = {
        ...userContext,
        time_of_day: new Date().getHours()
      };

      const response = await apiService.recommendations.getPersonalized(context);
      // Normalisation: injecter audio_variants si une seule url fournie pour permettre le sélecteur
      const norm = { ...response.suggestions } as SuggestionGroup;
      try {
        const ensureVariants = (arr?: Suggestion[]) => {
          if (!arr) return;
          arr.forEach(s => {
            if (!s) return;
            // Si pas de variants mais une url simple, créer un objet par défaut
            if (!s.audio_variants && s.audio_url) {
              s.audio_variants = { fr: s.audio_url };
            }
            // Si transcription_blocks absent mais transcription string contient des \n\n, splitter
            if (!s.transcription_blocks && s.transcription && s.transcription.includes('\n')) {
              const blocks = s.transcription.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
              if (blocks.length > 1) s.transcription_blocks = blocks;
            }
          });
        };
        ensureVariants(norm.challenges);
        ensureVariants(norm.immediate_actions);
        ensureVariants(norm.content);
      } catch (e) {
        console.warn('Normalization error', e);
      }
      // Debug: inspect audio_variants presence après normalisation
      try { console.log('[IntelligentSuggestions] suggestions fetched (normalized)', norm); } catch { }
      // Exclure les "Psychologue" des praticiens suggérés
      try {
        if (Array.isArray(norm.practitioners)) {
          norm.practitioners = norm.practitioners.filter(p => {
            const s = (p as any)?.specialty || '';
            return !/psychologue/i.test(s);
          });
        }
      } catch { }
      setSuggestions(norm);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des suggestions');
      console.error('Erreur suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userContext?.mood, userContext?.stress, userContext?.energy]);

  // Capturer les hauteurs de base après chargement des suggestions (avant lecture)
  useEffect(() => {
    // Immediate actions
    try {
      if (suggestions?.immediate_actions) {
        suggestions.immediate_actions.forEach((_, idx) => {
          if (lockedImmediateHeights[idx]) return; // déjà capturé
          const el = document.querySelector<HTMLElement>(`[data-imm-card='${idx}']`);
          if (el) {
            const h = el.getBoundingClientRect().height;
            if (h > 0) setLockedImmediateHeights(prev => ({ ...prev, [idx]: h }));
          }
        });
      }
    } catch { }
    // Challenges
    try {
      if (suggestions?.challenges) {
        suggestions.challenges.forEach((_, idx) => {
          if (lockedChallengeHeights[idx]) return;
          const el = document.querySelector<HTMLElement>(`[data-ch-card='${idx}']`);
          if (el) {
            const h = el.getBoundingClientRect().height;
            if (h > 0) setLockedChallengeHeights(prev => ({ ...prev, [idx]: h }));
          }
        });
      }
    } catch { }
    // Content
    try {
      if (suggestions?.content) {
        suggestions.content.forEach((_, idx) => {
          if (lockedContentHeights[idx]) return;
          const el = document.querySelector<HTMLElement>(`[data-co-card='${idx}']`);
          if (el) {
            const h = el.getBoundingClientRect().height;
            if (h > 0) setLockedContentHeights(prev => ({ ...prev, [idx]: h }));
          }
        });
      }
    } catch { }
  }, [suggestions, lockedImmediateHeights, lockedChallengeHeights]);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'facile': return '🟢';
      case 'moyen': return '🟡';
      case 'difficile': return '🔴';
      default: return '⚪';
    }
  };

  const renderEmoji = (emoji?: string) => {
    if (!emoji) return <Sparkles className="h-5 w-5" />;
    return <span className="text-lg">{emoji}</span>;
  };

  const renderImmediateActions = () => {
    if (!suggestions?.immediate_actions?.length) return null;

    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-red-700">
            <Zap className="h-5 w-5" />
            Actions immédiates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.immediate_actions.map((action, index) => {
            const isPlaying = playingImmediateIndex === index;
            const progress = isPlaying && totalSeconds > 0 ? (1 - remainingSeconds / totalSeconds) : 0;
            const mm = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
            const ss = (remainingSeconds % 60).toString().padStart(2, '0');
            const audioLangs = action.audio_variants ? Object.keys(action.audio_variants) : [];
            return (
              <div
                key={index}
                data-imm-card={index}
                className={`${isPlaying ? 'p-0' : 'p-4 pb-6'} rounded-lg border border-red-200 relative overflow-hidden transition-colors ${isPlaying ? 'ring-2 ring-red-300 bg-transparent' : 'bg-white/60 backdrop-blur-sm'}`}
                style={isPlaying ? { minHeight: Math.max(lockedImmediateHeights[index] || 0, 260) } : undefined}
              >
                {isPlaying && !audioLoading && (
                  <DynamicAudioBackdrop playing darkOverlayOpacity={0.2} paused={isPaused} className="opacity-100" />
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/25 pointer-events-none" />
                )}
                {isPlaying && (
                  <div className="absolute top-0 left-0 right-0 pt-4 px-4 text-center z-20 pointer-events-none">
                    <h4 className="text-white text-sm font-semibold tracking-wide drop-shadow-md truncate max-w-full">
                      {action.title}
                    </h4>
                  </div>
                )}
                <div className={isPlaying ? 'relative z-10 px-4 pt-4' : 'relative'}>
                  <div className={isPlaying ? 'invisible pointer-events-none select-none' : ''}>
                    <>
                      <div className="flex items-start justify-between mb-2 gap-2 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          {renderEmoji(action.icon)}
                          <h4 className="font-medium text-red-800 line-clamp-1 break-anywhere">{action.title}</h4>
                        </div>
                        <Badge className={getPriorityColor(action.priority)}>
                          {action.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2 break-anywhere">{action.description}</p>
                      {action.action_steps && (
                        <div className="space-y-1 mb-2">
                          <p className="text-xs font-medium text-gray-700">Étapes :</p>
                          <ol className="text-xs text-gray-600 space-y-1">
                            {action.action_steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="flex items-start gap-2 break-anywhere">
                                <span className="text-red-500 font-bold">{stepIndex + 1}.</span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </>
                  </div>
                  {audioError && (
                    <div className="mt-1 text-xs text-red-600 flex items-center gap-2">
                      <span>{audioError}</span>
                      {audioError.includes('interaction requise') && (
                        <Button size="sm" variant="outline" onClick={() => {
                          if (!audioRef.current) return;
                          try { audioRef.current.muted = false; } catch { }
                          audioRef.current.play().then(() => setAudioError(null)).catch(() => { });
                        }}>Débloquer</Button>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    {!isPlaying && (
                      <div className="flex gap-2 flex-wrap">
                        {audioLangs.length > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <label htmlFor={`imm-lang-${index}`} className="text-gray-600">Langue:</label>
                            <select
                              id={`imm-lang-${index}`}
                              className="border rounded px-1 py-0.5 text-xs"
                              value={immediateLangSelections[index] || ''}
                              onChange={e => {
                                setImmediateLangSelections(prev => ({ ...prev, [index]: e.target.value }));
                                if (isPlaying) startImmediateAudio(index, action, undefined, true);
                              }}
                            >
                              <option value="">Auto</option>
                              {audioLangs.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                            </select>
                          </div>
                        )}
                        <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => startImmediateAudio(index, action)}>Commencer avec audio</Button>
                        <Button size="sm" variant={openImmediateTexts[index] ? 'default' : 'outline'} onClick={() => toggleImmediateText(index)}>
                          {openImmediateTexts[index] ? 'Masquer texte' : 'Texte'}
                        </Button>
                        {appTracks.length > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <label htmlFor={`imm-app-audio-${index}`} className="text-gray-600">Audio intégré:</label>
                            <select
                              id={`imm-app-audio-${index}`}
                              className="border rounded px-1 py-0.5 text-xs"
                              defaultValue=""
                              onChange={e => {
                                const id = e.target.value;
                                const tr = appTracks.find(t => t.id === id);
                                if (tr) handleSelectImmediateAppAudio(index, tr);
                              }}
                            >
                              <option value="">Choisir…</option>
                              {appTracks.map(t => (
                                <option key={t.id} value={t.id}>{t.title}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className="relative">
                          <input id={`file-imm-audio-${index}`} type="file" accept="audio/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleSelectImmediateAudio(index, f); }} />
                          <Button type="button" size="sm" variant="outline" onClick={() => document.getElementById(`file-imm-audio-${index}`)?.click()}>Choisir audio</Button>
                        </div>
                      </div>
                    )}
                    {isPlaying && <div className="hidden" />}
                  </div>
                  {!isPlaying && customImmediateAudioUrls[index] && (
                    <div className="mt-1 text-xs text-gray-500 truncate">{(customImmediateUrlOriginalNames.current[index] || '').startsWith('App:') ? 'Audio intégré: ' : 'Audio local: '}{customImmediateUrlOriginalNames.current[index]}</div>
                  )}
                  {openImmediateTexts[index] && (
                    <div className="mt-2 p-3 rounded border bg-red-50 text-sm max-h-56 overflow-auto space-y-2">
                      {action.transcription_blocks && action.transcription_blocks.length > 0 ? (
                        <div className="space-y-2">
                          {action.transcription_blocks.map((p, i) => (
                            <p key={i} className="whitespace-pre-wrap break-anywhere leading-relaxed">{p}</p>
                          ))}
                        </div>
                      ) : (
                        (() => {
                          const text = action.transcription || action.description || (customImmediateAudioUrls[index] ? "Transcription non disponible pour l'audio local." : 'Aucune transcription.');
                          return <div className="whitespace-pre-wrap break-anywhere">{text}</div>;
                        })()
                      )}
                      {(!action.transcription && action.action_steps?.length) && (
                        <div>
                          <p className="font-medium text-xs text-gray-600 mb-1">Étapes :</p>
                          <ol className="text-xs space-y-1 list-decimal list-inside">
                            {action.action_steps.map((s, i) => (<li key={i} className="break-anywhere">{s}</li>))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}
                  {isPlaying && remainingSeconds === 0 && (
                    <div className="mt-2 text-xs text-green-600 font-medium">Action complétée ✅</div>
                  )}
                  {/* controls moved outside inner wrapper */}
                </div>
                {isPlaying && (
                  <div className="absolute bottom-0 left-[-1px] right-[-1px] px-0 py-3 flex flex-col items-stretch gap-3 bg-black/60 backdrop-blur-sm border-t border-white/10 z-30">
                    <div className="w-full px-4">
                      <div className="h-2 bg-white/25 rounded overflow-hidden">
                        <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${progress * 100}%` }} />
                      </div>
                      <div className="mt-0.5 text-right text-[10px] text-white/70 tracking-wider font-medium">{mm}:{ss}</div>
                    </div>
                    <div className="flex items-center justify-center gap-6 text-white px-4">
                      <Button size="sm" variant="ghost" className="text-white disabled:opacity-30" disabled={audioLoading || index === 0} onClick={() => { if (index > 0) startImmediateAudio(index - 1, suggestions!.immediate_actions[index - 1], undefined, true); }} aria-label="Précédent">
                        <SkipBack className="h-7 w-7" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-white disabled:opacity-30" disabled={audioLoading} onClick={() => (isPaused ? resumeChallenge() : pauseChallenge())} aria-label={isPaused ? 'Lecture' : 'Pause'}>
                        {isPaused ? <Play className="h-8 w-8" /> : <Pause className="h-8 w-8" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  const renderChallenges = () => {
    if (!suggestions?.challenges?.length) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Défis recommandés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestions.challenges.map((challenge, index) => {
            const isPlaying = playingChallengeIndex === index;
            const progress = isPlaying && totalSeconds > 0 ? (1 - remainingSeconds / totalSeconds) : 0;
            const mm = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
            const ss = (remainingSeconds % 60).toString().padStart(2, '0');
            const audioLangs = challenge.audio_variants ? Object.keys(challenge.audio_variants) : [];
            return (
              <div
                key={index}
                data-ch-card={index}
                className={`${isPlaying ? 'p-0' : 'p-4 pb-6'} rounded-lg border relative overflow-hidden transition-colors ${isPlaying ? 'ring-2 ring-orange-300 bg-transparent flex flex-col' : 'bg-white/60 backdrop-blur-sm'}`}
                style={isPlaying ? { height: Math.max((lockedChallengeHeights[index] || 0), 300) } : undefined}
              >
                {isPlaying && !audioLoading && (
                  <DynamicAudioBackdrop playing darkOverlayOpacity={0.2} paused={isPaused} className="opacity-100" />
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/5 to-black/30 pointer-events-none" />
                )}
                {isPlaying && (
                  <div className="absolute top-0 left-0 right-0 pt-4 px-4 text-center z-20 pointer-events-none">
                    <h4 className="text-white text-sm font-semibold tracking-wide drop-shadow-md truncate max-w-full">
                      {challenge.title}
                    </h4>
                  </div>
                )}
                <div className={isPlaying ? 'relative z-10 flex-1 flex flex-col px-4 pt-4' : 'relative'}>
                  <div className={isPlaying ? 'invisible pointer-events-none select-none' : ''}>
                    <>
                      <div className="flex items-start justify-between mb-2 gap-2 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          {renderEmoji(challenge.icon)}
                          <h4 className="font-medium line-clamp-1 break-anywhere">{challenge.title}</h4>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Badge variant="outline">{getDifficultyIcon(challenge.difficulty)} {challenge.duration}</Badge>
                          <Badge variant="secondary">{challenge.category}</Badge>
                          {challenge.score && (
                            <div className="flex items-center gap-1 text-xs text-gray-500"><Star className="h-3 w-3" />{challenge.score}% match</div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 break-anywhere">{challenge.description}</p>
                      {challenge.action_steps && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-gray-700">Étapes :</p>
                          <ol className="text-xs text-gray-600 space-y-1">
                            {challenge.action_steps.map((step, i) => (
                              <li key={i} className="flex items-start gap-2 break-anywhere">
                                <span className="text-orange-500 font-bold">{i + 1}.</span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </>
                  </div>
                  {audioError && (
                    <div className="mt-2 text-xs text-red-600 flex items-center gap-2">
                      <span>{audioError}</span>
                      {audioError.includes('interaction requise') && (
                        <Button size="sm" variant="outline" onClick={() => {
                          if (!audioRef.current) return;
                          try { audioRef.current.muted = false; } catch { }
                          audioRef.current.play().then(() => setAudioError(null)).catch(() => { });
                        }}>Débloquer</Button>
                      )}
                    </div>
                  )}
                  <div className="mt-3 flex flex-col gap-2">
                    {!isPlaying && (
                      <div className="flex gap-2 flex-wrap">
                        {audioLangs.length > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <label htmlFor={`ch-lang-${index}`} className="text-gray-600">Langue:</label>
                            <select
                              id={`ch-lang-${index}`}
                              className="border rounded px-1 py-0.5 text-xs"
                              value={challengeLangSelections[index] || ''}
                              onChange={e => {
                                setChallengeLangSelections(prev => ({ ...prev, [index]: e.target.value }));
                                if (isPlaying) startChallengeAudio(index, challenge, undefined, true);
                              }}
                            >
                              <option value="">Auto</option>
                              {audioLangs.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                            </select>
                          </div>
                        )}
                        <Button size="sm" className="flex-1" variant="outline" onClick={() => startChallengeAudio(index, challenge)}>Commencer avec audio</Button>
                        <Button size="sm" variant={openChallengeTexts[index] ? 'default' : 'outline'} onClick={() => toggleChallengeText(index)}>
                          {openChallengeTexts[index] ? 'Masquer texte' : 'Texte'}
                        </Button>
                        {appTracks.length > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <label htmlFor={`ch-app-audio-${index}`} className="text-gray-600">Audio intégré:</label>
                            <select
                              id={`ch-app-audio-${index}`}
                              className="border rounded px-1 py-0.5 text-xs"
                              defaultValue=""
                              onChange={e => {
                                const id = e.target.value;
                                const tr = appTracks.find(t => t.id === id);
                                if (tr) handleSelectAppAudio(index, tr);
                              }}
                            >
                              <option value="">Choisir…</option>
                              {appTracks.map(t => (
                                <option key={t.id} value={t.id}>{t.title}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className="relative">
                          <input id={`file-audio-${index}`} type="file" accept="audio/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleSelectAudio(index, f); }} />
                          <Button type="button" size="sm" variant="outline" onClick={() => document.getElementById(`file-audio-${index}`)?.click()}>Choisir audio</Button>
                        </div>
                      </div>
                    )}
                    {isPlaying && <div className="hidden" />}
                    {!isPlaying && customAudioUrls[index] && (
                      <div className="text-xs text-gray-500 truncate">{(customUrlOriginalNames.current[index] || '').startsWith('App:') ? 'Audio intégré: ' : 'Audio local: '}{customUrlOriginalNames.current[index]}</div>
                    )}
                    {openChallengeTexts[index] && (
                      <div className="mt-2 p-3 rounded border bg-orange-50 text-sm max-h-60 overflow-auto space-y-2">
                        {challenge.transcription_blocks && challenge.transcription_blocks.length > 0 ? (
                          <div className="space-y-2">
                            {challenge.transcription_blocks.map((p, i) => (
                              <p key={i} className="whitespace-pre-wrap break-anywhere leading-relaxed">{p}</p>
                            ))}
                          </div>
                        ) : (
                          (() => {
                            const text = challenge.transcription || challenge.description || (customAudioUrls[index] ? "Transcription non disponible pour l'audio local." : 'Aucune transcription.');
                            return <div className="whitespace-pre-wrap break-anywhere">{text}</div>;
                          })()
                        )}
                        {(!challenge.transcription && challenge.action_steps?.length) && (
                          <div>
                            <p className="font-medium text-xs text-gray-600 mb-1">Étapes :</p>
                            <ol className="text-xs space-y-1 list-decimal list-inside">
                              {challenge.action_steps.map((s, i) => (<li key={i} className="break-anywhere">{s}</li>))}
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                    {isPlaying && remainingSeconds === 0 && (
                      <div className="mt-2 text-xs text-green-600 font-medium">Défi complété 🎉</div>
                    )}
                    {/* controls moved outside inner wrapper */}
                  </div>
                  {isPlaying && (
                    <div className="absolute bottom-0 left-[-1px] right-[-1px] px-0 py-3 flex flex-col items-stretch gap-3 bg-black/60 backdrop-blur-sm border-t border-white/10 z-30">
                      <div className="w-full px-4">
                        <div className="h-2 bg-white/25 rounded overflow-hidden">
                          <div className="h-full bg-orange-400 transition-all duration-500" style={{ width: `${progress * 100}%` }} />
                        </div>
                        <div className="mt-0.5 text-right text-[10px] text-white/70 tracking-wider font-medium">{mm}:{ss}</div>
                      </div>
                      <div className="flex items-center justify-center gap-6 text-white px-4">
                        <Button size="sm" variant="ghost" className="text-white disabled:opacity-30" disabled={audioLoading || index === 0} onClick={() => { if (index > 0) startChallengeAudio(index - 1, suggestions!.challenges[index - 1], undefined, true); }} aria-label="Précédent">
                          <SkipBack className="h-7 w-7" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white disabled:opacity-30" disabled={audioLoading} onClick={() => (isPaused ? resumeChallenge() : pauseChallenge())} aria-label={isPaused ? 'Lecture' : 'Pause'}>
                          {isPaused ? <Play className="h-8 w-8" /> : <Pause className="h-8 w-8" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white disabled:opacity-30" disabled={audioLoading || index === suggestions!.challenges.length - 1} onClick={() => { if (index < suggestions!.challenges.length - 1) startChallengeAudio(index + 1, suggestions!.challenges[index + 1], undefined, true); }} aria-label="Suivant">
                          <SkipForward className="h-7 w-7" />
                        </Button>
                      </div>
                      {remainingSeconds === 0 && (
                        <div className="text-[11px] text-white/85 font-medium">Défi complété 🎉</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  const openProfile = (p: HealthProfessional) => {
    if (onPractitionerOpen) return onPractitionerOpen(p);
    const evt = new CustomEvent('openSpecialistProfile', { detail: p });
    window.dispatchEvent(evt);
  };

  const bookPractitioner = (p: HealthProfessional) => {
    if (onPractitionerBook) return onPractitionerBook(p);
    const evt = new CustomEvent('bookSpecialist', { detail: p });
    window.dispatchEvent(evt);
  };

  const renderPractitioners = () => {
    // Masquer complètement la section si humeur positive (>=4)
    const moodPositive = (userContext?.mood || 0) >= 4;
    if (moodPositive) return null;
    if (!suggestions?.practitioners?.length) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-500" />
            Praticiens recommandés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestions.practitioners.map((practitioner, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openProfile(practitioner)}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">{practitioner.name}</h4>
                  <p className="text-sm text-gray-600">{practitioner.specialty}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {practitioner.rating}
                  </div>
                  <p className="text-sm text-gray-500">{practitioner.experience}</p>
                </div>
              </div>
              <p className="text-sm text-blue-600 mb-2">{practitioner.reason}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {practitioner.availability} • {typeof practitioner.price === 'number' ? `${practitioner.price}€` : practitioner.price}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openProfile(practitioner); }}>
                    Consulter
                  </Button>
                  <Button size="sm" className="bg-wellness-gradient text-white" onClick={(e) => { e.stopPropagation(); bookPractitioner(practitioner); }}>
                    Prendre RDV
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (!suggestions?.content?.length) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Contenus suggérés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestions.content.map((content, index) => {
            const isPlaying = playingContentIndex === index;
            const progress = isPlaying && totalSeconds > 0 ? (1 - remainingSeconds / totalSeconds) : 0;
            const mm = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
            const ss = (remainingSeconds % 60).toString().padStart(2, '0');
            return (
              <div key={index} data-co-card={index} className={`p-4 ${isPlaying ? 'pb-0' : 'pb-6'} rounded-lg border relative overflow-hidden transition-colors ${isPlaying ? 'ring-2 ring-purple-300 bg-transparent' : 'bg-white/60 backdrop-blur-sm'}`} style={isPlaying ? { minHeight: Math.max(lockedContentHeights[index] || 0, 260) } : undefined}>
                {isPlaying && !audioLoading && (
                  <DynamicAudioBackdrop playing darkOverlayOpacity={0.25} paused={isPaused} className="opacity-100" />
                )}
                {isPlaying && (<div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/25 pointer-events-none" />)}
                {isPlaying && (
                  <div className="absolute top-0 left-0 right-0 pt-4 px-4 text-center z-20 pointer-events-none">
                    <h4 className="text-white text-sm font-semibold tracking-wide drop-shadow-md truncate max-w-full">{content.title}</h4>
                  </div>
                )}
                <div className={isPlaying ? 'relative z-10' : 'relative'}>
                  <div className={isPlaying ? 'invisible pointer-events-none select-none' : ''}>
                    <div className="flex items-start justify-between mb-2 gap-2 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        {renderEmoji(content.icon)}
                        <h4 className="font-medium line-clamp-1 break-anywhere">{content.title}</h4>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant="outline">{content.duration}</Badge>
                        <Badge variant="secondary">{content.category}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 break-anywhere">{content.description}</p>
                    {content.tags && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {content.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="text-xs bg-gray-100 px-2 py-1 rounded line-clamp-1 break-anywhere">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="flex-1" variant="outline" onClick={() => startContentAudio(index, content)}>Commencer avec audio</Button>
                      <Button size="sm" variant="secondary" className="flex-1" onClick={() => onSuggestionSelect?.(content)}>Ouvrir</Button>
                    </div>
                  </div>
                  {/* controls moved outside inner wrapper */}
                </div>
                {isPlaying && (
                  <div className="absolute bottom-0 left-[-1px] right-[-1px] px-0 py-3 flex flex-col items-stretch gap-3 bg-black/60 backdrop-blur-sm border-t border-white/10 z-30">
                    <div className="w-full px-4">
                      <div className="h-2 bg-white/25 rounded overflow-hidden">
                        <div className="h-full bg-purple-400 transition-all duration-500" style={{ width: `${progress * 100}%` }} />
                      </div>
                      <div className="mt-0.5 text-right text-[10px] text-white/70 tracking-wider font-medium">{mm}:{ss}</div>
                    </div>
                    <div className="flex items-center justify-center gap-6 text-white px-4">
                      <Button size="sm" variant="ghost" className="text-white disabled:opacity-30" disabled={audioLoading || index === 0} onClick={() => { if (index > 0) startContentAudio(index - 1, suggestions!.content[index - 1], undefined, true); }} aria-label="Précédent">
                        <SkipBack className="h-7 w-7" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-white disabled:opacity-30" disabled={audioLoading} onClick={() => (isPaused ? resumeChallenge() : pauseChallenge())} aria-label={isPaused ? 'Lecture' : 'Pause'}>
                        {isPaused ? <Play className="h-8 w-8" /> : <Pause className="h-8 w-8" />}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-white disabled:opacity-30" disabled={audioLoading || index === suggestions!.content.length - 1} onClick={() => { if (index < suggestions!.content.length - 1) startContentAudio(index + 1, suggestions!.content[index + 1], undefined, true); }} aria-label="Suivant">
                        <SkipForward className="h-7 w-7" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Génération de suggestions personnalisées...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-700">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  const anyAudioPlaying = playingChallengeIndex !== null || playingImmediateIndex !== null;

  return (
    <div className="space-y-6 relative">
      {/* Header avec mise à jour */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Suggestions personnalisées
          </h2>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-1">
              Dernière mise à jour : {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSuggestions}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Actions immédiates (priorité haute) */}
      {renderImmediateActions()}

      {/* Sections empilées pour meilleure lisibilité */}
      <div className="space-y-6">
        {renderChallenges()}
        {renderContent()}
      </div>

      {/* Praticiens (largeur complète) */}
      {renderPractitioners()}

      {/* Élément audio caché pour compatibilité autoplay (réutilisé via audioRef) */}
      <audio ref={audioRef} style={{ display: 'none' }} playsInline />
    </div>
  );
};

export default IntelligentSuggestions;
