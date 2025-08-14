import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { Toaster, toast } from "react-hot-toast";
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
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedMood, setSelectedMood] = useState<number>();
  const [challengeFilters, setChallengeFilters] = useState<string[]>([]);
  const [diagnosticStep, setDiagnosticStep] = useState(1);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, any>>({});
  const [selectedSpecialist, setSelectedSpecialist] = useState<any>(null);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Déconnexion réussie !");
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const progressData = [
    { date: 'Lun', mood: 3, stress: 4, energy: 3, sleep: 4 },
    { date: 'Mar', mood: 4, stress: 3, energy: 4, sleep: 3 },
    { date: 'Mer', mood: 3, stress: 5, energy: 2, sleep: 4 },
    { date: 'Jeu', mood: 4, stress: 2, energy: 4, sleep: 5 },
    { date: 'Ven', mood: 5, stress: 2, energy: 5, sleep: 4 },
    { date: 'Sam', mood: 4, stress: 3, energy: 4, sleep: 5 },
    { date: 'Dim', mood: 4, stress: 2, energy: 4, sleep: 4 },
  ];

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
      toast.success(`Bienvenue ${user.name} ! Comment vas-tu aujourd'hui ?`);
    }
  }
), [user];

  const handleBookAppointment = (specialist: any) => {
    setSelectedSpecialist(specialist);
    setCurrentView('booking');
  };

  const handleViewProfile = (specialist: any) => {
    setSelectedSpecialist(specialist);
    setCurrentView('specialist-profile');
  };

  const handleWellnessCardAction = (contentType: string) => {
    switch (contentType) {
      case 'meditation':
        setCurrentView('meditation');
        break;
      case 'breathing':
        setCurrentView('breathing');
        break;
      case 'sleep':
        setCurrentView('sleep-routine');
        break;
      default:
        console.log(`Starting ${contentType}`);
    }
  };

  const handleChallengeComplete = () => {
    console.log('Challenge completed!');
    // Ici on pourrait ajouter des points, sauvegarder le progrès, etc.
  };

  const renderSuggestions = () => (
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
          mood: selectedMood,
          stress: 3, // Valeur par défaut, pourrait venir du diagnostic
          energy: 3, // Valeur par défaut, pourrait venir du diagnostic
          diagnostic: null // Ajout du champ diagnostic
        }}
        onSuggestionSelect={(suggestion) => {
          console.log('Suggestion selected:', suggestion);
          // Ici on pourrait naviguer vers l'action suggérée
        }}
      />
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6 animate-fadeIn pt-4">
      <div className="bg-wellness-gradient rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Bonjour {user?.name || 'Utilisateur'} ! 👋</h1>
              <p className="text-white/90">Comment vous sentez-vous aujourd'hui ?</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Bell className="h-5 w-5" />
              </Button>
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
          className="h-16 bg-gradient-to-br from-orange-400 to-pink-400 hover:opacity-90 text-white rounded-2xl"
        >
          <div className="text-center">
            <Target className="h-6 w-6 mx-auto mb-1" />
            <div className="text-sm font-medium">Mes Défis</div>
          </div>
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

      <HealthSpecialistSuggestions
        selectedMood={selectedMood}
        diagnosticAnswers={diagnosticAnswers}
        onBookAppointment={handleBookAppointment}
        onViewProfile={handleViewProfile}
      />

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

  const renderDiagnostic = () => {
    const currentQuestion = diagnosticQuestions[diagnosticStep - 1];
    const currentAnswer = diagnosticAnswers[currentQuestion?.id];

    const handleNext = () => {
      if (diagnosticStep < diagnosticQuestions.length) {
        setDiagnosticStep(diagnosticStep + 1);
      } else {
        console.log('Diagnostic completed:', diagnosticAnswers);
        setCurrentView('dashboard');
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
        <h1 className="text-2xl font-bold">Mes Défis</h1>
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
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="pt-4">
      <ProgressPage onBack={() => setCurrentView('dashboard')} />
    </div>
  );

  const renderProfessionals = () => (
    <HealthProfessionalsList
      onBack={() => setCurrentView('dashboard')}
      onBookAppointment={handleBookAppointment}
      onViewProfile={handleViewProfile}
    />
  );

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
    />
  );

  const renderMeditation = () => (
    <MeditationContent
      onBack={() => setCurrentView('dashboard')}
      onComplete={handleChallengeComplete}
    />
  );

  const renderBreathing = () => (
    <BreathingContent
      onBack={() => setCurrentView('dashboard')}
      onComplete={handleChallengeComplete}
    />
  );

  const renderSleepRoutine = () => (
    <SleepRoutineContent
      onBack={() => setCurrentView('dashboard')}
      onComplete={handleChallengeComplete}
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
            <Toaster position="top-center"
            reverseOrder={false} />
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
