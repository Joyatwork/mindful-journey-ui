
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft,
  User,
  Settings,
  Award,
  Heart,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Edit3,
  Bell,
  Shield,
  Moon,
  Sun,
  Globe,
  Camera,
  Star,
  Target,
  Activity,
  Brain,
  Zap,
  Clock,
  Trophy,
  Gift,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage = ({ onBack }: ProfilePageProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    challenges: true,
    progress: true,
    reminders: true,
    achievements: false
  });

  // Mock user data
  const userData = {
    name: "Marie Dubois",
    email: "marie.dubois@company.com",
    phone: "+33 6 12 34 56 78",
    position: "Responsable Marketing",
    department: "Communication",
    joinDate: "Mars 2022",
    location: "Paris, France",
    avatar: "/placeholder.svg",
    initials: "MD",
    streak: 14,
    totalPoints: 1250,
    level: 3,
    completedChallenges: 28,
    badges: [
      { id: 1, name: "Première semaine", icon: Calendar, color: "bg-blue-500" },
      { id: 2, name: "Humeur stable", icon: Heart, color: "bg-green-500" },
      { id: 3, name: "Méditateur", icon: Brain, color: "bg-purple-500" },
      { id: 4, name: "Énergique", icon: Zap, color: "bg-yellow-500" }
    ],
    wellnessGoals: [
      { name: "Méditation quotidienne", progress: 85, target: "10 min/jour" },
      { name: "Sommeil de qualité", progress: 72, target: "8h/nuit" },
      { name: "Activité physique", progress: 60, target: "3x/semaine" },
      { name: "Gestion du stress", progress: 90, target: "Niveau < 3/5" }
    ],
    recentActivity: [
      { action: "Défi complété", name: "Respiration profonde", date: "Il y a 2h" },
      { action: "Méditation", name: "Session de 10 min", date: "Hier" },
      { action: "Badge obtenu", name: "Humeur stable", date: "Il y a 2 jours" },
      { action: "Objectif atteint", name: "Semaine sans stress", date: "Il y a 3 jours" }
    ]
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="glass-card border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback className="bg-wellness-gradient text-white text-lg">
                  {userData.initials}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white shadow-md"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">{userData.name}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="rounded-full"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span>{userData.position}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{userData.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Membre depuis {userData.joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="glass-card border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Informations de contact</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPersonalInfo(!showPersonalInfo)}
              className="rounded-full"
            >
              {showPersonalInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">{userData.email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">
              {showPersonalInfo ? userData.phone : "••• •• •• •• ••"}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">{userData.department}</span>
          </div>
        </CardContent>
      </Card>

      {/* Wellness Goals */}
      <Card className="glass-card border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Mes objectifs bien-être</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {userData.wellnessGoals.map((goal, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{goal.name}</span>
                <span className="text-xs text-muted-foreground">{goal.target}</span>
              </div>
              <Progress value={goal.progress} className="h-2" />
              <div className="text-xs text-right text-muted-foreground">
                {goal.progress}%
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-8 w-8 text-wellness-primary" />
            </div>
            <div className="text-2xl font-bold">{userData.streak}</div>
            <div className="text-sm text-muted-foreground">Jours consécutifs</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{userData.totalPoints}</div>
            <div className="text-sm text-muted-foreground">Points totaux</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-8 w-8 text-amber-500" />
            </div>
            <div className="text-2xl font-bold">Niveau {userData.level}</div>
            <div className="text-sm text-muted-foreground">Progression</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{userData.completedChallenges}</div>
            <div className="text-sm text-muted-foreground">Défis réalisés</div>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <Card className="glass-card border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Mes badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {userData.badges.map((badge) => (
              <div key={badge.id} className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
                <div className={`p-2 rounded-full ${badge.color} bg-opacity-20`}>
                  <badge.icon className={`h-4 w-4 ${badge.color.replace('bg-', 'text-')}`} />
                </div>
                <span className="text-sm font-medium">{badge.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="glass-card border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border-l-2 border-wellness-primary/20">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {activity.action}
                    </Badge>
                    <span className="text-sm font-medium">{activity.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {activity.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Notifications */}
      <Card className="glass-card border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Nouveaux défis</div>
              <div className="text-sm text-muted-foreground">Recevoir des notifications pour les nouveaux défis</div>
            </div>
            <Switch
              checked={notifications.challenges}
              onCheckedChange={(checked) => setNotifications({...notifications, challenges: checked})}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Suivi des progrès</div>
              <div className="text-sm text-muted-foreground">Rappels quotidiens de vos objectifs</div>
            </div>
            <Switch
              checked={notifications.progress}
              onCheckedChange={(checked) => setNotifications({...notifications, progress: checked})}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Rappels bien-être</div>
              <div className="text-sm text-muted-foreground">Moments de pause et exercices</div>
            </div>
            <Switch
              checked={notifications.reminders}
              onCheckedChange={(checked) => setNotifications({...notifications, reminders: checked})}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Récompenses</div>
              <div className="text-sm text-muted-foreground">Nouveaux badges et accomplissements</div>
            </div>
            <Switch
              checked={notifications.achievements}
              onCheckedChange={(checked) => setNotifications({...notifications, achievements: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card className="glass-card border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Paramètres de l'application</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <span className="font-medium">Mode sombre</span>
                <Moon className="h-4 w-4" />
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="h-4 w-4" />
              <span className="font-medium">Langue</span>
            </div>
            <Button variant="outline" size="sm">
              Français
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card className="glass-card border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Confidentialité et sécurité</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Lock className="h-4 w-4 mr-2" />
            Changer le mot de passe
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <Eye className="h-4 w-4 mr-2" />
            Paramètres de confidentialité
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <Gift className="h-4 w-4 mr-2" />
            Exporter mes données
          </Button>
        </CardContent>
      </Card>
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
            <h1 className="text-2xl font-bold">Mon Profil</h1>
            <p className="text-muted-foreground">Gérez vos informations personnelles</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-wellness-gradient text-white">
            <Star className="h-3 w-3 mr-1" />
            Niveau {userData.level}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Personnel</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>Statistiques</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Paramètres</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          {renderPersonalInfo()}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {renderStats()}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {renderSettings()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
