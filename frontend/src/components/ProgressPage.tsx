
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProgressChart from './ProgressChart';
import WeeklyHeatmap from './WeeklyHeatmap';
import StatCard from './StatCard';
import AchievementCard from './AchievementCard';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Award,
  Heart,
  Brain,
  Moon,
  Zap,
  Activity,
  Clock,
  BarChart3,
  ArrowLeft
} from 'lucide-react';

interface ProgressPageProps {
  onBack: () => void;
}

const ProgressPage = ({ onBack }: ProgressPageProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Sample data - in a real app, this would come from API
  const progressData = [
    { date: 'Lun', mood: 3, stress: 4, energy: 3, sleep: 4 },
    { date: 'Mar', mood: 4, stress: 3, energy: 4, sleep: 3 },
    { date: 'Mer', mood: 3, stress: 5, energy: 2, sleep: 4 },
    { date: 'Jeu', mood: 4, stress: 2, energy: 4, sleep: 5 },
    { date: 'Ven', mood: 5, stress: 2, energy: 5, sleep: 4 },
    { date: 'Sam', mood: 4, stress: 3, energy: 4, sleep: 5 },
    { date: 'Dim', mood: 4, stress: 2, energy: 4, sleep: 4 },
  ];

  const weeklyData = [
    { day: 'Lun', activities: 3, mood: 4 },
    { day: 'Mar', activities: 2, mood: 3 },
    { day: 'Mer', activities: 4, mood: 5 },
    { day: 'Jeu', activities: 1, mood: 3 },
    { day: 'Ven', activities: 5, mood: 5 },
    { day: 'Sam', activities: 3, mood: 4 },
    { day: 'Dim', activities: 2, mood: 4 },
  ];

  const achievements = [
    {
      id: 1,
      title: "Première semaine",
      description: "Complété 7 jours consécutifs",
      icon: <Calendar className="h-5 w-5" />,
      completed: true,
      date: "Il y a 2 jours"
    },
    {
      id: 2,
      title: "Humeur stable",
      description: "Maintenu une humeur > 3/5 pendant 5 jours",
      icon: <Heart className="h-5 w-5" />,
      completed: true,
      date: "Il y a 1 jour"
    },
    {
      id: 3,
      title: "Maître de la méditation",
      description: "Complété 10 séances de méditation",
      icon: <Brain className="h-5 w-5" />,
      completed: false,
      progress: 7
    },
    {
      id: 4,
      title: "Dormeur exemplaire",
      description: "7 nuits de sommeil de qualité",
      icon: <Moon className="h-5 w-5" />,
      completed: false,
      progress: 5
    }
  ];

  const stats = [
    {
      title: "Humeur moyenne",
      value: "4.1",
      unit: "/5",
      change: "+0.3",
      trend: "up" as const,
      icon: <Heart className="h-4 w-4" />,
      color: "text-green-500"
    },
    {
      title: "Niveau de stress",
      value: "2.8",
      unit: "/5",
      change: "-0.5",
      trend: "down" as const,
      icon: <Brain className="h-4 w-4" />,
      color: "text-blue-500"
    },
    {
      title: "Énergie",
      value: "3.7",
      unit: "/5",
      change: "+0.2",
      trend: "up" as const,
      icon: <Zap className="h-4 w-4" />,
      color: "text-yellow-500"
    },
    {
      title: "Qualité du sommeil",
      value: "4.2",
      unit: "/5",
      change: "+0.1",
      trend: "up" as const,
      icon: <Moon className="h-4 w-4" />,
      color: "text-purple-500"
    },
    {
      title: "Activités complétées",
      value: "18",
      unit: "",
      change: "+3",
      trend: "up" as const,
      icon: <Target className="h-4 w-4" />,
      color: "text-orange-500"
    },
    {
      title: "Streak actuel",
      value: "7",
      unit: "jours",
      change: "+1",
      trend: "up" as const,
      icon: <Activity className="h-4 w-4" />,
      color: "text-emerald-500"
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Period Selection */}
      <div className="flex space-x-2">
        {['7d', '30d', '90d'].map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
            className="rounded-full"
          >
            {period === '7d' && '7 jours'}
            {period === '30d' && '30 jours'}
            {period === '90d' && '3 mois'}
          </Button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Weekly Activity Heatmap */}
      <WeeklyHeatmap data={weeklyData} />

      {/* Progress Charts */}
      <div className="grid grid-cols-1 gap-4">
        <ProgressChart 
          data={progressData}
          title="Évolution de l'humeur"
          metric="mood"
        />
        <ProgressChart 
          data={progressData}
          title="Niveau de stress"
          metric="stress"
        />
      </div>
    </div>
  );

  const renderCharts = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <ProgressChart 
          data={progressData}
          title="Humeur"
          metric="mood"
        />
        <ProgressChart 
          data={progressData}
          title="Stress"
          metric="stress"
        />
        <ProgressChart 
          data={progressData}
          title="Énergie"
          metric="energy"
        />
        <ProgressChart 
          data={progressData}
          title="Sommeil"
          metric="sleep"
        />
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Réalisations</h3>
        <Badge className="bg-wellness-gradient text-white">
          {achievements.filter(a => a.completed).length}/{achievements.length}
        </Badge>
      </div>
      
      <div className="space-y-3">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} {...achievement} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Mes Progrès</h1>
            <p className="text-muted-foreground">Suivez votre évolution bien-être</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-wellness-gradient text-white">
            <Award className="h-3 w-3 mr-1" />
            420 pts
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Graphiques</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>Récompenses</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          {renderCharts()}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          {renderAchievements()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressPage;
