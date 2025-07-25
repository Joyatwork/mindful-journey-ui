
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MoodSelector from '@/components/MoodSelector';
import WellnessCard from '@/components/WellnessCard';
import ProgressPage from '@/components/ProgressPage';
import ProfilePage from '@/components/ProfilePage';
import DiagnosticStep from '@/components/DiagnosticStep';
import {
  Heart,
  Brain,
  Moon,
  Activity,
  Target,
  Award,
  Calendar,
  TrendingUp,
  Sparkles,
  User,
  Settings,
  ArrowRight,
  Plus,
  CheckCircle,
  Clock,
  Star,
  Zap,
  Shield,
  Bell,
  Play
} from 'lucide-react';

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'progress' | 'profile' | 'diagnostic'>('home');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<any[]>([]);

  const diagnosticSteps = [
    {
      id: 'mood',
      question: "Comment vous sentez-vous aujourd'hui ?",
      type: "emoji" as const,
      options: [
        "Très stressé",
        "Stressé", 
        "Neutre",
        "Calme",
        "Très calme"
      ]
    },
    {
      id: 'stress',
      question: "Quel est votre niveau de stress ?",
      type: "slider" as const,
      min: 1,
      max: 5,
      labels: { min: "Très faible", max: "Très élevé" }
    },
    {
      id: 'sleep',
      question: "Comment avez-vous dormi cette nuit ?",
      type: "slider" as const,
      min: 1,
      max: 5,
      labels: { min: "Très mal", max: "Très bien" }
    },
    {
      id: 'energy',
      question: "Quel est votre niveau d'énergie ?",
      type: "slider" as const,
      min: 1,
      max: 5,
      labels: { min: "Très faible", max: "Très élevé" }
    },
    {
      id: 'priorities',
      question: "Quelles sont vos priorités aujourd'hui ?",
      type: "choice" as const,
      options: [
        "Réduire le stress",
        "Améliorer le sommeil",
        "Booster l'énergie",
        "Gérer les émotions",
        "Améliorer la concentration"
      ]
    }
  ];

  const wellnessCards = [
    {
      id: 1,
      title: "Respiration profonde",
      description: "Exercice de 5 minutes pour se détendre",
      duration: "5 min",
      difficulty: "Facile" as const,
      category: "Relaxation",
      icon: <Heart className="h-5 w-5" />,
      color: "text-red-500",
      bgColor: "bg-red-50",
      gradient: "from-red-500 to-pink-500",
      onAction: () => console.log("Starting breathing exercise")
    },
    {
      id: 2,
      title: "Méditation guidée",
      description: "Session de pleine conscience",
      duration: "10 min",
      difficulty: "Facile" as const,
      category: "Mental",
      icon: <Brain className="h-5 w-5" />,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      gradient: "from-purple-500 to-indigo-500",
      onAction: () => console.log("Starting meditation")
    },
    {
      id: 3,
      title: "Routine sommeil",
      description: "Préparez-vous pour une nuit réparatrice",
      duration: "15 min",
      difficulty: "Facile" as const,
      category: "Sommeil",
      icon: <Moon className="h-5 w-5" />,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      gradient: "from-blue-500 to-cyan-500",
      onAction: () => console.log("Starting sleep routine")
    },
    {
      id: 4,
      title: "Étirements énergisants",
      description: "Réveillez votre corps en douceur",
      duration: "8 min",
      difficulty: "Facile" as const,
      category: "Physique",
      icon: <Activity className="h-5 w-5" />,
      color: "text-green-500",
      bgColor: "bg-green-50",
      gradient: "from-green-500 to-emerald-500",
      onAction: () => console.log("Starting stretching")
    }
  ];

  const handleDiagnosticComplete = () => {
    setCurrentStep(0);
    setDiagnosticAnswers([]);
    setCurrentView('home');
  };

  const handleDiagnosticValueChange = (value: any) => {
    const newAnswers = [...diagnosticAnswers];
    newAnswers[currentStep] = value;
    setDiagnosticAnswers(newAnswers);
  };

  const canGoNext = diagnosticAnswers[currentStep] !== undefined && diagnosticAnswers[currentStep] !== null;

  const renderHome = () => (
    <div className="space-y-6">
      {/* Header avec profil */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback className="bg-wellness-gradient text-white">MD</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Bonjour Marie ! 👋</h1>
            <p className="text-muted-foreground">Comment vous sentez-vous aujourd'hui ?</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentView('profile')}
            className="rounded-full"
          >
            <User className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Sélecteur d'humeur */}
      <Card className="glass-card border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Mon humeur aujourd'hui</CardTitle>
          <CardDescription>Choisissez comment vous vous sentez</CardDescription>
        </CardHeader>
        <CardContent>
          <MoodSelector selectedMood={selectedMood} onMoodSelect={setSelectedMood} />
        </CardContent>
      </Card>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-8 w-8 text-wellness-primary" />
            </div>
            <div className="text-xl font-bold">7</div>
            <div className="text-sm text-muted-foreground">Jours de suite</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-xl font-bold">420</div>
            <div className="text-sm text-muted-foreground">Points</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => setCurrentView('diagnostic')}
          className="h-16 bg-wellness-gradient hover:bg-wellness-gradient/90 text-white rounded-xl"
        >
          <div className="flex flex-col items-center space-y-1">
            <Heart className="h-5 w-5" />
            <span className="text-sm">Check-up</span>
          </div>
        </Button>
        <Button 
          onClick={() => setCurrentView('progress')}
          variant="outline"
          className="h-16 border-wellness-primary/20 rounded-xl"
        >
          <div className="flex flex-col items-center space-y-1">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm">Mes progrès</span>
          </div>
        </Button>
      </div>

      {/* Suggestions personnalisées */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Suggestions pour vous</h2>
          <Badge className="bg-wellness-gradient text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            IA
          </Badge>
        </div>
        
        <div className="space-y-3">
          {wellnessCards.map((card) => (
            <WellnessCard key={card.id} {...card} />
          ))}
        </div>
      </div>

      {/* Défi du jour */}
      <Card className="glass-card border-0 shadow-lg bg-gradient-to-r from-wellness-primary/5 to-wellness-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Défi du jour</CardTitle>
              <CardDescription>Prenez 2 minutes pour vous</CardDescription>
            </div>
            <Award className="h-8 w-8 text-wellness-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Respiration consciente</h3>
              <p className="text-sm text-muted-foreground">
                Prenez 5 respirations profondes et concentrez-vous sur le moment présent
              </p>
            </div>
            <Button className="bg-wellness-gradient hover:bg-wellness-gradient/90 text-white">
              <Play className="h-4 w-4 mr-2" />
              Commencer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDiagnostic = () => (
    <div className="space-y-6">
      <DiagnosticStep
        question={diagnosticSteps[currentStep]}
        currentStep={currentStep + 1}
        totalSteps={diagnosticSteps.length}
        value={diagnosticAnswers[currentStep]}
        onValueChange={handleDiagnosticValueChange}
        onNext={() => {
          if (currentStep < diagnosticSteps.length - 1) {
            setCurrentStep(currentStep + 1);
          } else {
            handleDiagnosticComplete();
          }
        }}
        onPrevious={() => {
          if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
          } else {
            setCurrentView('home');
          }
        }}
        canGoNext={canGoNext}
      />
    </div>
  );

  // Render based on current view
  if (currentView === 'progress') {
    return <ProgressPage onBack={() => setCurrentView('home')} />;
  }

  if (currentView === 'profile') {
    return <ProfilePage onBack={() => setCurrentView('home')} />;
  }

  if (currentView === 'diagnostic') {
    return renderDiagnostic();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-bg via-white to-wellness-bg/50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {renderHome()}
      </div>
    </div>
  );
};

export default Index;
