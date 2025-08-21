import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import testApiService from '@/lib/test-api';
import apiService from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import MoodSelector from '@/components/MoodSelector';
import WellnessCard from '@/components/WellnessCard';
import ProgressChart from '@/components/ProgressChart';
import ProgressPage from '@/components/ProgressPage';
import ChallengeFilter from '@/components/ChallengeFilter';
import DiagnosticStep from '@/components/DiagnosticStep';
import ProfilePage from '@/components/ProfilePage';
import HealthSpecialistSuggestions from '@/components/HealthSpecialistSuggestions';
import SpecialistProfile from '@/components/SpecialistProfile';
import BookingPage from '@/components/BookingPage';
import HealthProfessionalsList from '@/components/HealthProfessionalsList';
import MeditationContent from '@/components/MeditationContent';
import BreathingContent from '@/components/BreathingContent';
import SleepRoutineContent from '@/components/SleepRoutineContent';
import IntelligentSuggestions from '@/components/IntelligentSuggestions';
import AppointmentManagement from '@/components/AppointmentManagement';
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from '@/hooks/useApi';
import { 
  Heart, 
  Brain, 
  Moon, 
  Zap, 
  Target, 
  TrendingUp, 
  Calendar,
  Star,
  Award,
  Bell,
  User,
  Settings,
  UserCheck,
  LogOut,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { appointments, isLoading: apptsLoading } = useAppointments();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedMood, setSelectedMood] = useState<number>();
  const [challengeFilters, setChallengeFilters] = useState<string[]>([]);
  const [diagnosticStep, setDiagnosticStep] = useState(1);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, any>>({});
  const [showPostDiagnosticSuggestions, setShowPostDiagnosticSuggestions] = useState(false);
  const { toast } = useToast();
  type NotificationItem = {
    id: string;
    title: string;
    description?: string;
    createdAt: string; // ISO string
    read?: boolean;
  };
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notifStorageKey = React.useMemo(() => (user?.id ? `notifications:${user.id}` : null), [user?.id]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (n: Omit<NotificationItem, 'id' | 'createdAt'>) => {
    const item: NotificationItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...n,
    };
    setNotifications(prev => [item, ...prev]);
  };

  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearNotifications = () => setNotifications([]);

  // Écouter les notifications envoyées depuis d'autres composants (ex: annulation/modification)
  useEffect(() => {
    const onBellNotify = (e: Event) => {
      const anyEvt = e as CustomEvent;
      const d = anyEvt?.detail as Partial<NotificationItem> | undefined;
      if (d && d.title) {
        addNotification({ title: d.title, description: d.description });
      }
    };
    window.addEventListener('bellNotification', onBellNotify as EventListener);
    return () => window.removeEventListener('bellNotification', onBellNotify as EventListener);
  }, []);

  // Charger les notifications persistées à la connexion / changement d'utilisateur
  useEffect(() => {
    if (!notifStorageKey) return;
    try {
      const raw = localStorage.getItem(notifStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as NotificationItem[];
        if (Array.isArray(parsed)) setNotifications(parsed);
      }
    } catch {}
  }, [notifStorageKey]);

  // Sauvegarder à chaque modification
  useEffect(() => {
    if (!notifStorageKey) return;
    try {
      localStorage.setItem(notifStorageKey, JSON.stringify(notifications));
    } catch {}
  }, [notifications, notifStorageKey]);
  const [savedDiagnostic, setSavedDiagnostic] = useState<any>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<any>(null);

  const handleLogout = async () => {
    try {
      await logout();
  toast({ title: "Déconnexion réussie" });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const initialProgressData = [
    { date: 'Lun', mood: 3, stress: 4, energy: 3, sleep: 4 },
    { date: 'Mar', mood: 4, stress: 3, energy: 4, sleep: 3 },
    { date: 'Mer', mood: 3, stress: 5, energy: 2, sleep: 4 },
    { date: 'Jeu', mood: 4, stress: 2, energy: 4, sleep: 5 },
    { date: 'Ven', mood: 5, stress: 2, energy: 5, sleep: 4 },
    { date: 'Sam', mood: 4, stress: 3, energy: 4, sleep: 5 },
    { date: 'Dim', mood: 4, stress: 2, energy: 4, sleep: 4 },
  ];
  const [progressData, setProgressData] = useState(initialProgressData);

  // Helpers: transformer le diagnostic en scores (1..5)
  const clamp = (n:number, min:number, max:number) => Math.max(min, Math.min(max, n));
  const toFiveScale = (val:number) => clamp(Math.round(val / 2), 1, 5);
  const sleepQualityToScore = (txt?: string) => {
    if (!txt) return 3;
    const t = txt.toLowerCase();
    if (t.includes('excellent')) return 5;
    if (t.includes('bon')) return 4;
    if (t.includes('moyen')) return 3;
    if (t.includes('difficile')) return 2;
    if (t.includes('très mauvais') || t.includes('tres mauvais') || t.includes('insomnie')) return 1;
    return 3;
  };
  const moodEmojiToScore = (emoji?: string) => {
    if (!emoji) return undefined;
    // Mapping simple
    const map: Record<string, number> = {
      '😞': 1, '☹️': 2, '😐': 3, '🙂': 4, '😊': 4, '😄': 5, '😁': 5, '😀': 5
    };
    return map[emoji] ?? undefined;
  };

  // Quand un diagnostic est sauvegardé, injecter un point "Aujourd'hui" dans les graphiques
  useEffect(() => {
    if (!savedDiagnostic) return;
    const stress = Number(savedDiagnostic.stress_level) || 5;
    const energy = Number(savedDiagnostic.energy_level) || 5;
    const energyScore = toFiveScale(energy);
    let moodScore = moodEmojiToScore(savedDiagnostic.answers?.mood_emoji);
    if (moodScore === undefined) {
      // approx: plus le stress est élevé, plus la note d'humeur est basse
      moodScore = clamp(6 - toFiveScale(stress), 1, 5);
    }
    const sleepScore = sleepQualityToScore(savedDiagnostic.answers?.sleep_quality);

    const todayPoint = {
      date: "Aujourd'hui",
      mood: moodScore,
      stress: toFiveScale(stress),
      energy: energyScore,
      sleep: sleepScore,
    };
    setProgressData(prev => {
      const filtered = prev.filter(p => p.date !== "Aujourd'hui");
      return [...filtered, todayPoint];
    });
  }, [savedDiagnostic]);

  const wellnessCards = [
    {
      title: "Méditation guidée",
      description: "Séance de relaxation pour réduire le stress et améliorer la concentration",
      duration: "10 min",
      difficulty: "Facile" as const,
      category: "Mindfulness",
      icon: <Brain className="h-5 w-5 text-wellness-lavender" />,
      gradient: "bg-gradient-to-r from-purple-400 to-pink-400",
      contentType: "meditation"
    },
    {
      title: "Exercices de respiration",
      description: "Techniques de respiration pour gérer l'anxiété au quotidien",
      duration: "5 min",
      difficulty: "Facile" as const,
      category: "Gestion du stress",
      icon: <Heart className="h-5 w-5 text-red-400" />,
      gradient: "bg-wellness-gradient",
      contentType: "breathing"
    },
    {
      title: "Routine sommeil",
      description: "Améliorez la qualité de votre sommeil avec ces conseils personnalisés",
      duration: "15 min",
      difficulty: "Moyen" as const,
      category: "Sommeil",
      icon: <Moon className="h-5 w-5 text-purple-400" />,
      gradient: "bg-gradient-to-r from-purple-500 to-blue-500",
      contentType: "sleep"
    }
  ];

  // Lancer une action depuis les suggestions personnalisées
  const handleSuggestionAction = async (s: any) => {
    const rawType = (s?.type || s?.category || '').toString().toLowerCase();
    const title = (s?.title || '').toString();
    const titleLc = title.toLowerCase();

    // Navigation vers contenus dédiés
    if (rawType.includes('breath') || titleLc.includes('respir')) {
      setCurrentView('breathing');
      toast({ title: 'Exercice de respiration démarré' });
      return;
    }
    if (rawType.includes('medit') || titleLc.includes('méditation') || titleLc.includes('meditation') || rawType.includes('mindfulness')) {
      setCurrentView('meditation');
      toast({ title: 'Méditation démarrée' });
      return;
    }
    if (rawType.includes('sleep') || titleLc.includes('sommeil')) {
      setCurrentView('sleep-routine');
      toast({ title: 'Routine sommeil ouverte' });
      return;
    }

    // Micro-mouvements / étirements rapides → enregistrer une petite activité
    if (
      rawType.includes('move') || rawType.includes('mouvement') ||
      titleLc.includes('micro') || titleLc.includes('mouvement') || titleLc.includes('étirement') || titleLc.includes('etirement')
    ) {
      try {
        await apiService.wellness.logActivity({
          activity_id: 999, // identifiant générique pour action rapide
          duration: 2,      // minutes
          completion_rate: 100,
          notes: `Action immédiate: ${title}`,
        });
        toast({ title: 'Activité enregistrée', description: title || 'Micro‑mouvement' });
        window.dispatchEvent(new CustomEvent('bellNotification', { detail: { title: 'Activité complétée', description: title || 'Micro‑mouvement' } }));
      } catch (_) {
        toast({ title: 'Action lancée', description: title || 'Micro‑mouvement' });
      }
      return;
    }

    // Par défaut: simple confirmation
    toast({ title: 'Action lancée', description: title || 'Suggestion' });
  };

  const diagnosticQuestions = [
    {
      id: 'stress_level',
      question: 'Sur une échelle de 1 à 10, comment évaluez-vous votre niveau de stress actuel ?',
      type: 'slider' as const,
      min: 1,
      max: 10,
      labels: { min: 'Très détendu', max: 'Très stressé' }
    },
    {
      id: 'mood_emoji',
      question: 'Comment décririez-vous votre humeur générale cette semaine ?',
      type: 'emoji' as const
    },
    {
      id: 'sleep_quality',
      question: 'Comment qualifiez-vous votre sommeil ces derniers temps ?',
      type: 'choice' as const,
      options: [
        'Excellent, je me réveille reposé(e)',
        'Bon, quelques réveils nocturnes',
        'Moyen, j\'ai du mal à m\'endormir',
        'Difficile, je me réveille fatigué(e)',
        'Très mauvais, insomnies fréquentes'
      ]
    },
    {
      id: 'energy_level',
      question: 'Quel est votre niveau d\'énergie habituel pendant la journée ?',
      type: 'slider' as const,
      min: 1,
      max: 10,
      labels: { min: 'Très fatigué', max: 'Très énergique' }
    },
    {
      id: 'work_pressure',
      question: 'Ressentez-vous une pression importante dans votre travail ?',
      type: 'choice' as const,
      options: [
        'Jamais, mon travail est équilibré',
        'Rarement, seulement en période chargée',
        'Parfois, certaines semaines sont difficiles',
        'Souvent, je ressens une pression constante',
        'Toujours, je suis débordé(e) en permanence'
      ]
    }
  ];

  
  useEffect(() => {
    if (user) {
      toast({ title: `Bienvenue ${user.name} !`, description: "Comment vas-tu aujourd'hui ?" });
    }
  }, [user]);

  // Charger le diagnostic sauvegardé pour le réutiliser dans les suggestions
  useEffect(() => {
    const loadSavedDiagnostic = async () => {
      if (!user) return;
      try {
        const res = await apiService.diagnostic.get();
        setSavedDiagnostic(res?.data ?? null);
      } catch (_) {
        // pas de diagnostic sauvegardé ou non disponible
      }
    };
    loadSavedDiagnostic();
  }, [user]);

  // Ecoute des événements en provenance de IntelligentSuggestions (ouvrir profil / réserver)
  useEffect(() => {
    const onOpenProfile = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) handleViewProfile(detail);
    };
    const onBook = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) handleBookAppointment(detail);
    };
    window.addEventListener('openSpecialistProfile', onOpenProfile as EventListener);
    window.addEventListener('bookSpecialist', onBook as EventListener);
    return () => {
      window.removeEventListener('openSpecialistProfile', onOpenProfile as EventListener);
      window.removeEventListener('bookSpecialist', onBook as EventListener);
    };
  }, []);

  const handleBookAppointment = (specialist: any) => {
    setSelectedSpecialist(specialist);
    setCurrentView('booking');
  };

  const handleViewProfile = (specialist: any) => {
    setSelectedSpecialist(specialist);
    setCurrentView('specialist-profile');
  };

  const [currentChallengeId, setCurrentChallengeId] = useState<number | null>(null);
  const [challengeList, setChallengeList] = useState<Array<{id:number; title:string; description?:string; status:string; completed_at?:string|null}>>([]);

  const loadChallenges = async () => {
    try {
      const res = await testApiService.challenges.list();
      const items = res?.data || [];
      setChallengeList(items);
    } catch (e) {
      console.warn('Impossible de charger les défis:', e);
    }
  };

  const pickChallengeId = async (contentType?: string) => {
    try {
  const res = await testApiService.challenges.list();
  const items = res?.data || [];
      // Mapper chaque carte vers un titre précis de défi
      const titleByType: Record<string, string> = {
        meditation: 'Défi Quotidien: Méditation 5 min',
        breathing: 'Défi Quotidien: Respiration 4-7-8',
        sleep: 'Défi Hebdo: Routine de sommeil',
      };
      let id: number | null = null;
      if (contentType && titleByType[contentType]) {
        const found = items.find((c:any) => c.title === titleByType[contentType]);
        id = found?.id ?? null;
      } else {
        id = items.length > 0 ? items[0].id : null;
      }
      if (!id) throw new Error('Aucun défi disponible');
      setCurrentChallengeId(id);
      return id;
    } catch (e) {
      console.error('Impossible de récupérer un défi:', e);
  toast({ title: "Aucun défi disponible", variant: "destructive" });
      return null;
    }
  };

  const handleWellnessCardAction = async (contentType: string) => {
    switch (contentType) {
      case 'meditation':
        {
          const id = await pickChallengeId('meditation');
          if (!id) return;
          try {
            const r = await testApiService.challenges.start(id);
            toast({ title: 'Défi démarré' });
            await loadChallenges();
          } catch (e:any) {
            // si déjà démarré, continuer silencieusement
            console.log('Start défi:', e?.message || e);
            try { await loadChallenges(); } catch {}
          }
        }
        setCurrentView('meditation');
        break;
      case 'breathing':
        {
          const id = await pickChallengeId('breathing');
          if (!id) return;
          try {
            const r = await testApiService.challenges.start(id);
            toast({ title: 'Défi démarré' });
            await loadChallenges();
          } catch (e:any) {
            console.log('Start défi:', e?.message || e);
            try { await loadChallenges(); } catch {}
          }
        }
        setCurrentView('breathing');
        break;
      case 'sleep':
        {
          const id = await pickChallengeId('sleep');
          if (!id) return;
          try {
            const r = await testApiService.challenges.start(id);
            toast({ title: 'Défi démarré' });
            await loadChallenges();
          } catch (e:any) {
            console.log('Start défi:', e?.message || e);
            try { await loadChallenges(); } catch {}
          }
        }
        setCurrentView('sleep-routine');
        break;
      default:
        console.log(`Starting ${contentType}`);
    }
  };

  const handleChallengeComplete = async (contentType?: string) => {
    console.log('Challenge completed!');
  const challengeId = await pickChallengeId(contentType);
  if (!challengeId) return;
    try {
      await testApiService.challenges.finish(challengeId);
  toast({ title: 'Défi enregistré dans la base' });
      // Recharger la liste des défis pour mettre à jour les statuts
      try {
  await loadChallenges();
      } catch (e) {
        console.warn('Impossible de recharger la liste des défis:', e);
      }
    } catch (err: any) {
      const msg = err?.message || "Erreur lors de l'enregistrement du défi";
  toast({ title: msg, variant: 'destructive' });
      console.error(err);
    }
  };

  const renderSuggestions = () => {
    // Construire le contexte à partir du dernier diagnostic sauvegardé
    const computedStress = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.stress_level) || 3) : undefined;
    const computedEnergy = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.energy_level) || 3) : undefined;
    let computedMood = savedDiagnostic ? moodEmojiToScore(savedDiagnostic.answers?.mood_emoji) : undefined;
    if (computedMood === undefined && computedStress !== undefined) {
      computedMood = clamp(6 - computedStress, 1, 5);
    }

    return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView('dashboard')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Suggestions Personnalisées</h1>
      </div>

      <IntelligentSuggestions
        userContext={{
          mood: selectedMood ?? computedMood,
          stress: computedStress ?? 3,
          energy: computedEnergy ?? 3,
          diagnostic: savedDiagnostic // Diagnostic sauvegardé si dispo
        }}
        onSuggestionSelect={handleSuggestionAction}
      />
    </div>
  ); };

  const renderDashboard = () => (
    <div className="space-y-6 animate-fadeIn pt-4">
      {(() => {
        // Contexte pour les suggestions basées sur le dernier diagnostic
        const computedStress = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.stress_level) || 3) : undefined;
        const computedEnergy = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.energy_level) || 3) : undefined;
        let computedMood = savedDiagnostic ? moodEmojiToScore(savedDiagnostic.answers?.mood_emoji) : undefined;
        if (computedMood === undefined && computedStress !== undefined) {
          computedMood = clamp(6 - computedStress, 1, 5);
        }

        return (
          showPostDiagnosticSuggestions && (
            <div className="rounded-2xl border bg-white/80 p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Actions recommandées pour vous</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowPostDiagnosticSuggestions(false)}>Masquer</Button>
              </div>
              <IntelligentSuggestions
                userContext={{
                  mood: selectedMood ?? computedMood,
                  stress: computedStress ?? 3,
                  energy: computedEnergy ?? 3,
                  diagnostic: savedDiagnostic,
                }}
                onSuggestionSelect={handleSuggestionAction}
              />
            </div>
          )
        );
      })()}

      <div className="bg-wellness-gradient rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Bonjour {user?.name || 'Utilisateur'} ! 👋</h1>
              <p className="text-white/90">Comment vous sentez-vous aujourd'hui ?</p>
            </div>
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-[3px] shadow">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">Aucune notification</div>
                  ) : (
                    notifications.map((n) => (
                      <DropdownMenuItem key={n.id} className="flex flex-col items-start whitespace-normal h-auto py-2">
                        <div className="flex w-full justify-between">
                          <span className={`font-medium ${n.read ? 'text-gray-600' : ''}`}>{n.title}</span>
                          <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {n.description && (
                          <span className="text-sm text-gray-600">{n.description}</span>
                        )}
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator />
                  <div className="flex justify-between px-2 py-1">
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>Tout marquer comme lu</Button>
                    <Button variant="ghost" size="sm" onClick={clearNotifications}>Vider</Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge className="bg-white/20 text-white border-white/20">
              Semaine 3
            </Badge>
            <Badge className="bg-white/20 text-white border-white/20">
              <Star className="h-3 w-3 mr-1" />
              420 points
            </Badge>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
        <div className="absolute bottom-0 right-8 w-20 h-20 bg-white/5 rounded-full" />
      </div>

      <MoodSelector 
        selectedMood={selectedMood}
        onMoodSelect={setSelectedMood}
      />

      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => setCurrentView('diagnostic')}
          className="h-16 bg-wellness-gradient hover:opacity-90 text-white rounded-2xl"
        >
          <div className="text-center">
            <Brain className="h-6 w-6 mx-auto mb-1" />
            <div className="text-sm font-medium">Auto-diagnostic</div>
          </div>
        </Button>
        
        <Button 
          onClick={() => setCurrentView('challenges')}
          className="h-16 bg-gradient-to-br from-orange-400 to-pink-400 hover:opacity-90 text-white rounded-2xl relative"
        >
          <div className="text-center">
            <Target className="h-6 w-6 mx-auto mb-1" />
            <div className="text-sm font-medium">Mes Défis</div>
          </div>
          {challengeList.length > 0 && (
            <span className="absolute top-2 right-2 bg-white text-pink-600 text-[10px] font-bold rounded-full px-2 py-0.5 shadow">
              {challengeList.length}
            </span>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Button 
          onClick={() => setCurrentView('suggestions')}
          className="h-16 bg-gradient-to-br from-purple-500 to-blue-500 hover:opacity-90 text-white rounded-2xl"
        >
          <div className="text-center">
            <Sparkles className="h-6 w-6 mx-auto mb-1" />
            <div className="text-sm font-medium">Suggestions Personnalisées</div>
          </div>
        </Button>
        <Button 
          onClick={() => setCurrentView('appointments')}
          className="h-16 bg-gradient-to-br from-green-500 to-emerald-600 hover:opacity-90 text-white rounded-2xl"
        >
          <div className="text-center">
            <Calendar className="h-6 w-6 mx-auto mb-1" />
            <div className="text-sm font-medium">Mes rendez-vous</div>
          </div>
        </Button>
  {/* Bouton Démo Méditation retiré */}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ProgressChart 
          data={progressData}
          title="Humeur"
          metric="mood"
        />
        <ProgressChart 
          data={progressData}
          title="Énergie"
          metric="energy"
        />
      </div>

      {/* Résumé du dernier auto-diagnostic */}
      {savedDiagnostic && (
        <Card className="p-4 bg-white/80">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Votre état (auto‑diagnostic)</h3>
            <Badge variant="secondary">{new Date(savedDiagnostic.completed_at ?? savedDiagnostic.updated_at ?? Date.now()).toLocaleString()}</Badge>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Stress</span>
              <span className="font-medium">{savedDiagnostic.stress_level}/10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Énergie</span>
              <span className="font-medium">{savedDiagnostic.energy_level}/10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pression au travail</span>
              <span className="font-medium text-right">{savedDiagnostic.work_pressure}</span>
            </div>
            {savedDiagnostic.answers?.sleep_quality && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sommeil</span>
                <span className="font-medium text-right">{savedDiagnostic.answers.sleep_quality}</span>
              </div>
            )}
            {savedDiagnostic.answers?.mood_emoji && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Humeur</span>
                <span className="font-medium text-right">{savedDiagnostic.answers.mood_emoji}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {(() => {
  const hasAppointments = (appointments?.length ?? 0) > 0;
        // Déterminer si résultats positifs: stress bas (<=2/5), humeur haute (>=4/5), énergie ok (>=3/5)
        const computedStress = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.stress_level) || 3) : undefined;
        const computedEnergy = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.energy_level) || 3) : undefined;
        let computedMood = savedDiagnostic ? moodEmojiToScore(savedDiagnostic.answers?.mood_emoji) : undefined;
        if (computedMood === undefined && computedStress !== undefined) {
          computedMood = clamp(6 - computedStress, 1, 5);
        }
        // fallback à l'humeur choisie si pas de diagnostic sauvegardé
        if (computedMood === undefined && selectedMood !== undefined) computedMood = selectedMood;

        const isPositive = (computedStress !== undefined && computedEnergy !== undefined && computedMood !== undefined)
          ? (computedStress <= 2 && computedMood >= 4 && computedEnergy >= 3)
          : false; // si inconnu, on affiche par défaut
  // Masquer aussi les praticiens si l'utilisateur n'a aucun rendez-vous
  if (!hasAppointments) return null;
  if (isPositive) return null;

        return (
          <HealthSpecialistSuggestions
            selectedMood={selectedMood}
            diagnosticAnswers={diagnosticAnswers}
            onBookAppointment={handleBookAppointment}
            onViewProfile={handleViewProfile}
          />
        );
      })()}

      {(() => {
        // Masquer l'accès aux spécialistes si résultats positifs
        const computedStress = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.stress_level) || 3) : undefined;
        const computedEnergy = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.energy_level) || 3) : undefined;
        let computedMood = savedDiagnostic ? moodEmojiToScore(savedDiagnostic.answers?.mood_emoji) : undefined;
        if (computedMood === undefined && computedStress !== undefined) {
          computedMood = clamp(6 - computedStress, 1, 5);
        }
        if (computedMood === undefined && selectedMood !== undefined) computedMood = selectedMood;
        const isPositive = (computedStress !== undefined && computedEnergy !== undefined && computedMood !== undefined)
          ? (computedStress <= 2 && computedMood >= 4 && computedEnergy >= 3)
          : false;

        if (isPositive) return null;

        return (
          <div className="w-full">
            <Button 
              onClick={() => setCurrentView('professionals')}
              className="w-full h-16 bg-gradient-to-br from-teal-400 to-blue-500 hover:opacity-90 text-white rounded-2xl"
            >
              <div className="text-center">
                <UserCheck className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm font-medium">Tous les spécialistes</div>
              </div>
            </Button>
          </div>
        );
      })()}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Suggestions personnalisées</h2>
          <Button variant="ghost" size="sm">Voir tout</Button>
        </div>
        
        <div className="space-y-4">
          {wellnessCards.map((card, index) => (
            <WellnessCard
              key={index}
              {...card}
              onAction={() => handleWellnessCardAction(card.contentType)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView('dashboard')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Mes rendez-vous</h1>
      </div>
      <AppointmentManagement onClose={() => setCurrentView('dashboard')} />
    </div>
  );

  const renderDiagnostic = () => {
    const currentQuestion = diagnosticQuestions[diagnosticStep - 1];
    const currentAnswer = diagnosticAnswers[currentQuestion?.id];

    const handleNext = async () => {
      if (diagnosticStep < diagnosticQuestions.length) {
        setDiagnosticStep(diagnosticStep + 1);
      } else {
        console.log('Diagnostic completed:', diagnosticAnswers);
        // Sauvegarder le diagnostic côté backend (protégé Sanctum)
        try {
          await apiService.diagnostic.save({
            stress_level: Number(diagnosticAnswers.stress_level) || 5,
            energy_level: Number(diagnosticAnswers.energy_level) || 5,
            work_pressure: String(diagnosticAnswers.work_pressure || 'Non précisé'),
            answers: diagnosticAnswers,
          });
          // Recharger le diagnostic sauvegardé
          try {
            const res = await apiService.diagnostic.get();
            const sd = res?.data ?? null;
            setSavedDiagnostic(sd);
            // Décider de la redirection selon le résultat
            const computedStress = sd ? toFiveScale(Number(sd.stress_level) || 3) : undefined;
            const computedEnergy = sd ? toFiveScale(Number(sd.energy_level) || 3) : undefined;
            let computedMood = sd ? moodEmojiToScore(sd.answers?.mood_emoji) : undefined;
            if (computedMood === undefined && computedStress !== undefined) {
              computedMood = clamp(6 - computedStress, 1, 5);
            }
            const isPositive = (computedStress !== undefined && computedEnergy !== undefined && computedMood !== undefined)
              ? (computedStress <= 2 && computedMood >= 4 && computedEnergy >= 3)
              : false;
            // Rediriger vers la page "Suggestions" dans tous les cas
            setShowPostDiagnosticSuggestions(false);
            setCurrentView('suggestions');
            toast({ title: 'Diagnostic sauvegardé', description: 'Voici vos suggestions personnalisées.' });
          } catch (_) {}
          if (!savedDiagnostic) {
            // Fallback: si on n'a pas pu recharger, décider avec les réponses locales
            const stress10 = Number(diagnosticAnswers.stress_level) || 5;
            const energy10 = Number(diagnosticAnswers.energy_level) || 5;
            const stress5 = toFiveScale(stress10);
            const energy5 = toFiveScale(energy10);
            let mood5: number | undefined = undefined;
            // Si on n'a pas un emoji exploitable, approx via le stress
            if (mood5 === undefined) mood5 = clamp(6 - stress5, 1, 5);
            const isPositiveLocal = (stress5 <= 2 && (mood5 ?? 3) >= 4 && energy5 >= 3);
            // Fallback: redirection vers "Suggestions" également
            setShowPostDiagnosticSuggestions(false);
            setCurrentView('suggestions');
            toast({ title: 'Diagnostic sauvegardé', description: 'Voici vos suggestions personnalisées.' });
          }
        } catch (e: any) {
          console.error('Erreur sauvegarde diagnostic:', e);
          toast({ title: e?.message || 'Erreur lors de la sauvegarde', variant: 'destructive' });
          // En cas d'erreur, rester sur les suggestions pour guider l’utilisateur
          setShowPostDiagnosticSuggestions(false);
          setCurrentView('suggestions');
        }
      }
    };

    const handlePrevious = () => {
      if (diagnosticStep > 1) {
        setDiagnosticStep(diagnosticStep - 1);
      }
    };

    const handleAnswerChange = (value: any) => {
      setDiagnosticAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: value
      }));
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 pt-12">
        <DiagnosticStep
          question={currentQuestion}
          currentStep={diagnosticStep}
          totalSteps={diagnosticQuestions.length}
          value={currentAnswer}
          onValueChange={handleAnswerChange}
          onNext={handleNext}
          onPrevious={handlePrevious}
          canGoNext={currentAnswer !== undefined}
        />
      </div>
    );
  };

  const renderChallenges = () => (
    <div className="space-y-6 animate-fadeIn pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Mes Défis</h1>
          <Badge variant="secondary" className="text-xs">{challengeList.length}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCurrentView('dashboard')}>
          Retour
        </Button>
      </div>

      <ChallengeFilter 
        activeFilters={challengeFilters}
        onFilterChange={setChallengeFilters}
      />

      <div className="grid gap-4">
        {wellnessCards.map((card, index) => (
          <WellnessCard
            key={index}
            {...card}
            onAction={() => handleWellnessCardAction(card.contentType)}
            actionLabel="Je le fais !"
          />
        ))}
        {/* Liste des défis avec statut */}
        <div className="border rounded-lg p-4 bg-white/70">
          <h2 className="font-semibold mb-1">Mes défis (depuis la base)</h2>
          <div className="text-xs text-gray-500 mb-2">
            Total: {challengeList.length}
            {' '}·{' '}Terminés: {challengeList.filter(c => c.status === 'finished' || !!c.completed_at).length}
            {' '}·{' '}En cours: {challengeList.filter(c => c.status === 'in_progress').length}
            {' '}·{' '}Non démarrés: {challengeList.filter(c => c.status === 'not_started').length}
          </div>
          <ul className="space-y-1 text-sm">
            {challengeList.map((c) => (
              <li key={c.id} className="flex items-center justify-between">
                <span>{c.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                  {c.status}{c.completed_at ? ` • ${new Date(c.completed_at).toLocaleString()}` : ''}
                </span>
              </li>
            ))}
            {challengeList.length === 0 && (
              <li className="text-gray-500 text-sm">Aucun défi pour l’instant</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );

  // Charger la liste quand on ouvre l’onglet Défis
  useEffect(() => {
    if (currentView === 'challenges') {
      loadChallenges();
    }
  }, [currentView]);

  // Charger une première fois au montage (si l'utilisateur est connecté)
  useEffect(() => {
    if (user) {
      loadChallenges();
    }
  }, [user]);

  // Désactiver totalement l'accès à "Tous les spécialistes" si diagnostic positif
  useEffect(() => {
    const computedStress = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.stress_level) || 3) : undefined;
    const computedEnergy = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.energy_level) || 3) : undefined;
    let computedMood = savedDiagnostic ? moodEmojiToScore(savedDiagnostic.answers?.mood_emoji) : undefined;
    if (computedMood === undefined && computedStress !== undefined) {
      computedMood = clamp(6 - computedStress, 1, 5);
    }
    if (computedMood === undefined && selectedMood !== undefined) computedMood = selectedMood;
    const isPositive = (computedStress !== undefined && computedEnergy !== undefined && computedMood !== undefined)
      ? (computedStress <= 2 && computedMood >= 4 && computedEnergy >= 3)
      : false;

    if (isPositive && currentView === 'professionals') {
      setCurrentView('dashboard');
    }
  }, [currentView, savedDiagnostic, selectedMood]);

  const renderProgress = () => (
    <div className="pt-4">
      <ProgressPage onBack={() => setCurrentView('dashboard')} />
    </div>
  );

  const renderProfessionals = () => {
    // Masquer la page "Tous les spécialistes" si résultats positifs
    const computedStress = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.stress_level) || 3) : undefined;
    const computedEnergy = savedDiagnostic ? toFiveScale(Number(savedDiagnostic.energy_level) || 3) : undefined;
    let computedMood = savedDiagnostic ? moodEmojiToScore(savedDiagnostic.answers?.mood_emoji) : undefined;
    if (computedMood === undefined && computedStress !== undefined) {
      computedMood = clamp(6 - computedStress, 1, 5);
    }
    if (computedMood === undefined && selectedMood !== undefined) computedMood = selectedMood;
    const isPositive = (computedStress !== undefined && computedEnergy !== undefined && computedMood !== undefined)
      ? (computedStress <= 2 && computedMood >= 4 && computedEnergy >= 3)
      : false;

    if (isPositive) {
      return (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <h1 className="text-2xl font-bold">Spécialistes de santé</h1>
            <div></div>
          </div>
          <Card className="p-6 bg-white/80 text-center">
            <h2 className="text-lg font-semibold mb-2">Pas nécessaire pour le moment</h2>
            <p className="text-gray-600">Vos derniers résultats sont positifs. Aucun spécialiste n'est affiché.</p>
          </Card>
        </div>
      );
    }

    return (
      <HealthProfessionalsList
        onBack={() => setCurrentView('dashboard')}
        onBookAppointment={handleBookAppointment}
        onViewProfile={handleViewProfile}
      />
    );
  };

  const renderSpecialistProfile = () => (
    <SpecialistProfile
      specialist={selectedSpecialist}
      onBack={() => setCurrentView('dashboard')}
      onBookAppointment={handleBookAppointment}
    />
  );

  const renderBooking = () => (
    <BookingPage
      specialist={selectedSpecialist}
      onBack={() => setCurrentView('dashboard')}
      onBookingConfirmed={(b) => {
        addNotification({
          title: 'Rendez-vous confirmé',
          description: `${selectedSpecialist?.name ?? 'Spécialiste'} — ${b?.date} à ${b?.time}`,
        });
      }}
    />
  );

  const renderMeditation = () => (
    <MeditationContent
      onBack={() => setCurrentView('dashboard')}
  onComplete={() => handleChallengeComplete('meditation')}
    />
  );

  const renderBreathing = () => (
    <BreathingContent
      onBack={() => setCurrentView('dashboard')}
  onComplete={() => handleChallengeComplete('breathing')}
    />
  );

  const renderSleepRoutine = () => (
    <SleepRoutineContent
      onBack={() => setCurrentView('dashboard')}
  onComplete={() => handleChallengeComplete('sleep')}
    />
  );

  const renderBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2 z-50 safe-area-inset-bottom">
      <div className="flex justify-around max-w-md mx-auto">
        <Button 
          variant={currentView === 'dashboard' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('dashboard')}
          className="flex flex-col items-center space-y-1 h-12 px-3 min-w-0 flex-1"
        >
          <Heart className="h-4 w-4" />
          <span className="text-xs truncate">Accueil</span>
        </Button>
        
        <Button 
          variant={currentView === 'challenges' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('challenges')}
          className="flex flex-col items-center space-y-1 h-12 px-3 min-w-0 flex-1"
        >
          <Target className="h-4 w-4" />
          <span className="text-xs truncate">Défis</span>
        </Button>
        
        <Button 
          variant={currentView === 'progress' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('progress')}
          className="flex flex-col items-center space-y-1 h-12 px-3 min-w-0 flex-1"
        >
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs truncate">Progrès</span>
        </Button>
        
        <Button 
          variant={currentView === 'profile' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('profile')}
          className="flex flex-col items-center space-y-1 h-12 px-3 min-w-0 flex-1"
        >
          <User className="h-4 w-4" />
          <span className="text-xs truncate">Profil</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md mx-auto min-h-screen bg-white/50 backdrop-blur-sm">
        {/* Bouton de déconnexion discret */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}  
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 bg-white/70 backdrop-blur-sm"
            title="Se déconnecter">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-4 py-6 pb-32 safe-area-inset-top">
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'diagnostic' && renderDiagnostic()}
          {currentView === 'challenges' && renderChallenges()}
          {currentView === 'progress' && renderProgress()}
          {currentView === 'profile' && <ProfilePage />}
          {currentView === 'professionals' && renderProfessionals()}
          {currentView === 'specialist-profile' && renderSpecialistProfile()}
          {currentView === 'booking' && renderBooking()}
          {currentView === 'appointments' && renderAppointments()}
          {currentView === 'meditation' && renderMeditation()}
          {currentView === 'breathing' && renderBreathing()}
          {currentView === 'sleep-routine' && renderSleepRoutine()}
          {currentView === 'suggestions' && renderSuggestions()}
        </div>
        
        {renderBottomNav()}
      </div>
    </div>
  );
};

export default Index;

