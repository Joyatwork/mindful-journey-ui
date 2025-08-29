import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Heart, 
  Zap, 
  Clock, 
  Star, 
  TrendingUp, 
  UserCheck,
  Target,
  RefreshCw,
  Sparkles
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
  // Etat audio guidé pour les défis
  const [playingChallengeIndex, setPlayingChallengeIndex] = useState<number | null>(null);
  const [playingImmediateIndex, setPlayingImmediateIndex] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  // URLs audio personnalisés par index de challenge (ObjectURL)
  const [customAudioUrls, setCustomAudioUrls] = useState<Record<number, string>>({}); // challenges
  const customUrlOriginalNames = useRef<Record<number, string>>({});
  const [customImmediateAudioUrls, setCustomImmediateAudioUrls] = useState<Record<number, string>>({});
  const customImmediateUrlOriginalNames = useRef<Record<number, string>>({});
  const [isPaused, setIsPaused] = useState(false);

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
      try { audioRef.current.pause(); } catch {}
      audioRef.current = null;
    }
  setPlayingChallengeIndex(null);
  setPlayingImmediateIndex(null);
    setRemainingSeconds(0);
    setTotalSeconds(0);
    setAudioLoading(false);
  setIsPaused(false);
  }, []);

  const stopCurrent = useCallback(() => {
    clearAudio();
  }, [clearAudio]);

  const startChallengeAudio = useCallback((index: number, challenge: Suggestion) => {
    // Si on clique le même -> stop
    if (playingChallengeIndex === index) {
      stopCurrent();
      return;
    }
    // Stop précédent
    stopCurrent();
    setAudioError(null);
    const minutes = parseDurationMinutes(challenge.duration);
    const total = minutes * 60;
    setTotalSeconds(total);
    setRemainingSeconds(total);
    setPlayingChallengeIndex(index);
    setPlayingImmediateIndex(null);
    setAudioLoading(true);
  setIsPaused(false);

  const src = customAudioUrls[index] || challenge.audio_url || '/audio/guided-default.mp3'; // Priorité audio custom
  const audio = new Audio(src);
  audioRef.current = audio;
  // Support M4A (container MP4 + AAC) et MP3. La boucle ne sera activée qu'en fonction de la durée réelle.
  audio.preload = 'auto';
    const onCanPlay = () => {
      // Décider si on loop : uniquement si durée intrinsèque < durée challenge
      try {
        if (isFinite(audio.duration) && audio.duration > 0) {
          audio.loop = audio.duration < total - 1; // marge 1s
        } else {
          // Si pas d'info (stream ou metadata tardive) on active loop par sécurité
          audio.loop = true;
        }
      } catch { /* noop */ }
      audio.play().catch(err => {
        setAudioError('Lecture audio bloquée (interaction requise)');
        console.warn('Audio play error', err);
      });
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
      setAudioError('Impossible de charger l\'audio');
      clearAudio();
    };
    audio.addEventListener('canplay', onCanPlay, { once: true });
    audio.addEventListener('error', onError, { once: true });
    // Sécurité: si canplay ne vient pas dans 6s -> erreur
    setTimeout(() => {
      if (audioLoading) {
        setAudioError('Chargement audio trop long');
        clearAudio();
      }
    }, 6000);
  }, [audioLoading, clearAudio, playingChallengeIndex, stopCurrent, customAudioUrls]);

  const startImmediateAudio = useCallback((index: number, action: Suggestion) => {
    if (playingImmediateIndex === index) {
      stopCurrent();
      return;
    }
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
    const src = customImmediateAudioUrls[index] || action.audio_url || '/audio/guided-default.mp3';
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.preload = 'auto';
    const onCanPlay = () => {
      try {
        if (isFinite(audio.duration) && audio.duration > 0) {
          audio.loop = audio.duration < total - 1;
        } else {
          audio.loop = true;
        }
      } catch {}
      audio.play().catch(err => {
        setAudioError('Lecture audio bloquée (interaction requise)');
        console.warn('Audio play error', err);
      });
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
      setAudioError('Impossible de charger l\'audio');
      clearAudio();
    };
    audio.addEventListener('canplay', onCanPlay, { once: true });
    audio.addEventListener('error', onError, { once: true });
    setTimeout(() => {
      if (audioLoading) {
        setAudioError('Chargement audio trop long');
        clearAudio();
      }
    }, 6000);
  }, [audioLoading, clearAudio, playingImmediateIndex, customImmediateAudioUrls, stopCurrent]);

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

  const pauseChallenge = () => {
    if (!audioRef.current) return;
    try { audioRef.current.pause(); } catch {}
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPaused(true);
  };

  const resumeChallenge = () => {
    if (!audioRef.current) return;
    audioRef.current.play().catch(err => {
      setAudioError('Impossible de reprendre');
      console.warn('Resume error', err);
    });
    if (!timerRef.current) {
      timerRef.current = window.setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearAudio();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    setIsPaused(false);
  };

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
      setSuggestions(response.suggestions);
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
            return (
              <div key={index} className={`bg-white p-4 rounded-lg border border-red-200 relative ${isPlaying ? 'ring-2 ring-red-300' : ''}`}>
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
                {isPlaying && (
                  <div className="mb-3">
                    <div className="h-2 bg-gray-200 rounded overflow-hidden">
                      <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${progress * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Guidage en cours</span>
                      <span>{mm}:{ss}</span>
                    </div>
                  </div>
                )}
                {audioError && isPlaying && (
                  <p className="mt-1 text-xs text-red-600">{audioError}</p>
                )}
                <div className="flex gap-2 flex-wrap">
                  {!isPlaying && (
                    <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => startImmediateAudio(index, action)}>
                      Commencer avec audio
                    </Button>
                  )}
                  {isPlaying && remainingSeconds > 0 && !audioLoading && (
                    <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => (isPaused ? resumeChallenge() : pauseChallenge())}>
                      {isPaused ? 'Reprendre' : `Pause (${mm}:${ss})`}
                    </Button>
                  )}
                  {isPlaying && (
                    <Button size="sm" variant="outline" onClick={() => stopCurrent()}>Stop</Button>
                  )}
                  {!isPlaying && (
                    <Button size="sm" variant="outline" onClick={() => onSuggestionSelect?.(action)}>Détails</Button>
                  )}
                  {isPlaying && audioLoading && (
                    <Button size="sm" disabled className="flex-1">Chargement...</Button>
                  )}
                  <div className="relative">
                    <input
                      id={`file-imm-audio-${index}`}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleSelectImmediateAudio(index, f);
                      }}
                    />
                    <Button type="button" size="sm" variant="outline" onClick={() => document.getElementById(`file-imm-audio-${index}`)?.click()}>
                      Choisir audio
                    </Button>
                  </div>
                </div>
                {customImmediateAudioUrls[index] && (
                  <div className="mt-1 text-xs text-gray-500 truncate">Audio local: {customImmediateUrlOriginalNames.current[index]}</div>
                )}
                {isPlaying && remainingSeconds === 0 && (
                  <div className="mt-2 text-xs text-green-600 font-medium">Action complétée ✅</div>
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
            return (
              <div key={index} className={`bg-white p-4 rounded-lg border relative ${isPlaying ? 'ring-2 ring-orange-300' : ''}`}>
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
                {isPlaying && (
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 rounded overflow-hidden">
                      <div className="h-full bg-orange-400 transition-all duration-500" style={{ width: `${progress * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Guidage en cours</span>
                      <span>{mm}:{ss}</span>
                    </div>
                  </div>
                )}
                {audioError && isPlaying && (
                  <p className="mt-2 text-xs text-red-600">{audioError}</p>
                )}
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex gap-2 flex-wrap">
                    {!isPlaying && (
                      <Button
                        size="sm"
                        className="flex-1"
                        variant="outline"
                        onClick={() => startChallengeAudio(index, challenge)}
                      >
                        Commencer avec audio
                      </Button>
                    )}
                    {isPlaying && remainingSeconds > 0 && !audioLoading && (
                      <Button
                        size="sm"
                        className="flex-1"
                        variant="default"
                        onClick={() => (isPaused ? resumeChallenge() : pauseChallenge())}
                      >
                        {isPaused ? 'Reprendre' : `Pause (${mm}:${ss})`}
                      </Button>
                    )}
                    {isPlaying && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => stopCurrent()}
                      >
                        Stop
                      </Button>
                    )}
                    {!isPlaying && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSuggestionSelect?.(challenge)}
                      >
                        Détails
                      </Button>
                    )}
                    {isPlaying && audioLoading && (
                      <Button size="sm" disabled className="flex-1">Chargement...</Button>
                    )}
                    <div className="relative">
                      <input
                        id={`file-audio-${index}`}
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) handleSelectAudio(index, f);
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => document.getElementById(`file-audio-${index}`)?.click()}
                      >
                        Choisir audio
                      </Button>
                    </div>
                  </div>
                  {customAudioUrls[index] && (
                    <div className="text-xs text-gray-500 truncate">Audio local: {customUrlOriginalNames.current[index]}</div>
                  )}
                </div>
                {isPlaying && remainingSeconds === 0 && (
                  <div className="mt-2 text-xs text-green-600 font-medium">Défi complété 🎉</div>
                )}
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
          {suggestions.content.map((content, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border">
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
                    <span key={tagIndex} className="text-xs bg-gray-100 px-2 py-1 rounded line-clamp-1 break-anywhere">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => onSuggestionSelect?.(content)}>
                Regarder
              </Button>
            </div>
          ))}
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

  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default IntelligentSuggestions;
