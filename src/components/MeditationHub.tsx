import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  Heart, 
  Clock, 
  Target, 
  Award,
  Sparkles,
  Moon,
  Wind,
  Brain,
  Smile
} from 'lucide-react';

interface Meditation {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  category: string;
  difficulty_level: number;
  image_url?: string;
  instructions: string[];
  benefits: string[];
  completed_count: number;
  is_new: boolean;
}

interface MeditationStats {
  total_minutes: number;
  total_sessions: number;
  current_streak: number;
  average_session_length: number;
  this_week_sessions: number;
  this_month_minutes: number;
}

interface ActiveSession {
  id: number;
  title: string;
  duration_minutes: number;
  category: string;
  instructions: string[];
}

const MeditationHub = () => {
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [stats, setStats] = useState<MeditationStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [sessionState, setSessionState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const [loading, setLoading] = useState(false);

  const categoryIcons = {
    breathing: <Wind className="h-5 w-5" />,
    mindfulness: <Brain className="h-5 w-5" />,
    sleep: <Moon className="h-5 w-5" />,
    stress: <Heart className="h-5 w-5" />,
    focus: <Target className="h-5 w-5" />,
    gratitude: <Sparkles className="h-5 w-5" />
  };

  const categoryColors = {
    breathing: 'bg-blue-500',
    mindfulness: 'bg-green-500',
    sleep: 'bg-purple-500',
    stress: 'bg-red-500',
    focus: 'bg-orange-500',
    gratitude: 'bg-pink-500'
  };

  const categories = {
    all: 'Toutes',
    breathing: 'Respiration',
    mindfulness: 'Pleine conscience',
    sleep: 'Sommeil',
    stress: 'Gestion du stress',
    focus: 'Concentration',
    gratitude: 'Gratitude'
  };

  useEffect(() => {
    fetchMeditations();
    fetchStats();
  }, [selectedCategory]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (sessionState === 'running' && activeSession) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const totalDuration = activeSession.duration_minutes * 60;
          
          // Changer d'instruction toutes les 2 minutes environ
          const instructionDuration = Math.floor(totalDuration / activeSession.instructions.length);
          const newInstructionIndex = Math.floor(newTime / instructionDuration);
          
          if (newInstructionIndex !== currentInstruction && newInstructionIndex < activeSession.instructions.length) {
            setCurrentInstruction(newInstructionIndex);
          }
          
          // Terminer automatiquement à la fin
          if (newTime >= totalDuration) {
            setSessionState('completed');
            return totalDuration;
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [sessionState, activeSession, currentInstruction]);

  const fetchMeditations = async () => {
    try {
      const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
      const response = await fetch(`http://localhost:8000/api/meditation${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMeditations(data.meditations);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des méditations:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/meditation/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  const startMeditation = async (meditation: Meditation) => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/meditation/start-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          title: meditation.title,
          duration_minutes: meditation.duration_minutes,
          category: meditation.category,
          difficulty_level: meditation.difficulty_level,
          description: meditation.description,
          instructions: meditation.instructions,
          benefits: meditation.benefits
        })
      });

      if (response.ok) {
        const data = await response.json();
        setActiveSession({
          id: data.session.id,
          title: meditation.title,
          duration_minutes: meditation.duration_minutes,
          category: meditation.category,
          instructions: meditation.instructions
        });
        setCurrentTime(0);
        setCurrentInstruction(0);
        setSessionState('running');
      } else {
        alert('Erreur lors du démarrage de la méditation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const pauseResumeMeditation = () => {
    setSessionState(sessionState === 'running' ? 'paused' : 'running');
  };

  const stopMeditation = () => {
    setSessionState('idle');
    setActiveSession(null);
    setCurrentTime(0);
    setCurrentInstruction(0);
  };

  const completeMeditation = async () => {
    if (!activeSession) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/meditation/complete-session/${activeSession.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          actual_duration_minutes: Math.floor(currentTime / 60),
          rating: 5, // Vous pourriez ajouter un système de notation
          mood_after: 8 // Vous pourriez demander à l'utilisateur
        })
      });

      if (response.ok) {
        alert('Félicitations ! Méditation terminée avec succès ! 🎉');
        fetchStats(); // Refresh stats
        stopMeditation();
      }
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyBadge = (level: number) => {
    const colors = ['bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 'bg-red-100 text-red-800'];
    const labels = ['Débutant', 'Intermédiaire', 'Avancé'];
    return <Badge className={colors[level - 1]}>{labels[level - 1]}</Badge>;
  };

  // Vue de session active
  if (activeSession && sessionState !== 'idle') {
    const progress = (currentTime / (activeSession.duration_minutes * 60)) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-2">{activeSession.title}</CardTitle>
              <div className="flex items-center justify-center gap-2 text-white/80">
                {categoryIcons[activeSession.category as keyof typeof categoryIcons]}
                <span>{categories[activeSession.category as keyof typeof categories]}</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Timer et progression */}
              <div className="text-center space-y-4">
                <div className="text-6xl font-light">
                  {formatTime(currentTime)}
                </div>
                <div className="text-white/60">
                  sur {activeSession.duration_minutes} minutes
                </div>
                <Progress value={progress} className="w-full h-2" />
              </div>

              {/* Instruction actuelle */}
              <div className="text-center p-6 bg-white/5 rounded-lg">
                <div className="text-sm text-white/60 mb-2">Instruction actuelle :</div>
                <div className="text-xl leading-relaxed">
                  {activeSession.instructions[currentInstruction] || 'Continuez à respirer consciemment...'}
                </div>
              </div>

              {/* Contrôles */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={pauseResumeMeditation}
                  variant="outline"
                  size="lg"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {sessionState === 'running' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  {sessionState === 'running' ? 'Pause' : 'Reprendre'}
                </Button>
                
                <Button
                  onClick={stopMeditation}
                  variant="outline"
                  size="lg"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Square className="h-5 w-5" />
                  Arrêter
                </Button>

                {sessionState === 'completed' && (
                  <Button
                    onClick={completeMeditation}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Award className="h-5 w-5" />
                    Terminer
                  </Button>
                )}
              </div>

              {sessionState === 'paused' && (
                <div className="text-center text-white/60">
                  Méditation en pause. Prenez votre temps.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vue principale du hub de méditation
  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🧘‍♀️ Méditations Guidées</h1>
        <p className="text-gray-600">
          Trouvez la paix intérieure avec nos méditations personnalisées
        </p>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.total_sessions}</div>
              <div className="text-sm text-gray-600">Sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total_minutes}min</div>
              <div className="text-sm text-gray-600">Total médité</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.current_streak}</div>
              <div className="text-sm text-gray-600">Série actuelle</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.this_week_sessions}</div>
              <div className="text-sm text-gray-600">Cette semaine</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2 justify-center">
        {Object.entries(categories).map(([key, label]) => (
          <Badge
            key={key}
            variant={selectedCategory === key ? "default" : "outline"}
            className="cursor-pointer px-3 py-1"
            onClick={() => setSelectedCategory(key)}
          >
            {key !== 'all' && categoryIcons[key as keyof typeof categoryIcons]}
            <span className="ml-1">{label}</span>
          </Badge>
        ))}
      </div>

      {/* Liste des méditations */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meditations.map((meditation) => (
          <Card key={meditation.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${categoryColors[meditation.category as keyof typeof categoryColors]} text-white`}>
                    {categoryIcons[meditation.category as keyof typeof categoryIcons]}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{meditation.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{meditation.duration_minutes} min</span>
                    </div>
                  </div>
                </div>
                {meditation.is_new && (
                  <Badge className="bg-yellow-100 text-yellow-800">Nouveau</Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">{meditation.description}</p>
              
              <div className="flex items-center justify-between">
                {getDifficultyBadge(meditation.difficulty_level)}
                {meditation.completed_count > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Smile className="h-4 w-4" />
                    {meditation.completed_count}x
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Bénéfices :</div>
                <div className="flex flex-wrap gap-1">
                  {meditation.benefits.slice(0, 3).map((benefit, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => startMeditation(meditation)}
                disabled={loading}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {loading ? 'Démarrage...' : 'Commencer'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {meditations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            Aucune méditation trouvée pour cette catégorie.
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditationHub;
