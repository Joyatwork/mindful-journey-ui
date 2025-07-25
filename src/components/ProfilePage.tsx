
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import EditProfileForm from './EditProfileForm';
import { 
  User, 
  Edit, 
  Star, 
  Award, 
  Heart, 
  Brain, 
  Moon, 
  Zap,
  Bell, 
  Settings, 
  Shield, 
  HelpCircle,
  LogOut,
  Camera,
  Calendar,
  Target,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';

interface ProfilePageProps {
  onBack: () => void;
}

interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  birthDate: string;
  goals: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileData>({
    name: 'Sarah Martin',
    email: 'sarah.martin@email.com',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, France',
    bio: 'Passionnée de bien-être et de développement personnel. J\'aime méditer, faire du yoga et explorer de nouvelles techniques de relaxation.',
    birthDate: '1990-05-15',
    goals: 'Améliorer ma gestion du stress, développer une routine de méditation quotidienne et optimiser mon sommeil.'
  });

  const userStats = {
    totalPoints: 1247,
    level: 8,
    streak: 12,
    completedChallenges: 34,
    totalSessions: 156,
    averageMood: 4.2,
    improvementRate: 18
  };

  const achievements = [
    { id: 1, name: "Première semaine", icon: Calendar, color: "text-blue-500" },
    { id: 2, name: "Méditant régulier", icon: Brain, color: "text-purple-500" },
    { id: 3, name: "Dormeur optimisé", icon: Moon, color: "text-indigo-500" },
    { id: 4, name: "Gestion du stress", icon: Heart, color: "text-red-500" },
  ];

  const preferences = [
    { id: 'morning', label: 'Rappels matinaux', enabled: true },
    { id: 'evening', label: 'Rappels du soir', enabled: true },
    { id: 'weekend', label: 'Rappels week-end', enabled: false },
    { id: 'meditation', label: 'Méditation guidée', enabled: true },
  ];

  const handleSaveProfile = (data: UserProfileData) => {
    setUserProfile(data);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <EditProfileForm
        initialData={userProfile}
        onSave={handleSaveProfile}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-wellness-gradient rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-white hover:bg-white/20"
            >
              ← Retour
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <Button 
                size="icon" 
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white text-purple-600 hover:bg-gray-100"
              >
                <Camera className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex-1">
              <h1 className="text-xl font-bold">{userProfile.name}</h1>
              <p className="text-white/90 text-sm">Membre depuis mars 2024</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className="bg-white/20 text-white border-white/20 text-xs">
                  Niveau {userStats.level}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/20 text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  {userStats.totalPoints} pts
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
        <div className="absolute bottom-0 right-8 w-20 h-20 bg-white/5 rounded-full" />
      </div>

      {/* Contact Info */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Informations personnelles</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="text-wellness-lavender hover:bg-wellness-lavender/10"
          >
            <Edit className="h-4 w-4 mr-1" />
            Modifier
          </Button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{userProfile.email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{userProfile.phone}</span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{userProfile.location}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Fuseau horaire: Europe/Paris</span>
          </div>
          {userProfile.bio && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{userProfile.bio}</p>
            </div>
          )}
          {userProfile.goals && (
            <div className="mt-2 p-3 bg-wellness-lavender/10 rounded-lg">
              <h4 className="text-sm font-medium text-wellness-lavender mb-1">Mes objectifs</h4>
              <p className="text-sm text-gray-700">{userProfile.goals}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Mes statistiques</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-wellness-lavender">{userStats.streak}</div>
            <div className="text-sm text-gray-600">Jours consécutifs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-wellness-lavender">{userStats.completedChallenges}</div>
            <div className="text-sm text-gray-600">Défis complétés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-wellness-lavender">{userStats.totalSessions}</div>
            <div className="text-sm text-gray-600">Sessions totales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-wellness-lavender">{userStats.averageMood}/5</div>
            <div className="text-sm text-gray-600">Humeur moyenne</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              Amélioration de {userStats.improvementRate}% ce mois-ci
            </span>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Mes récompenses</h2>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <achievement.icon className={`h-5 w-5 ${achievement.color}`} />
              <span className="text-sm font-medium">{achievement.name}</span>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-3">
          <Award className="h-4 w-4 mr-2" />
          Voir toutes les récompenses
        </Button>
      </Card>

      {/* Preferences */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Préférences de notifications</h2>
        <div className="space-y-4">
          {preferences.map((pref) => (
            <div key={pref.id} className="flex items-center justify-between">
              <span className="text-sm">{pref.label}</span>
              <Switch 
                checked={pref.enabled}
                onCheckedChange={() => {}}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Settings */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Paramètres</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Notifications</span>
            </div>
            <Switch 
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Moon className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Mode sombre</span>
            </div>
            <Switch 
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Partage de données</span>
            </div>
            <Switch 
              checked={dataSharing}
              onCheckedChange={setDataSharing}
            />
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button variant="outline" className="w-full justify-start">
          <HelpCircle className="h-4 w-4 mr-3" />
          Centre d'aide
        </Button>
        
        <Button variant="outline" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-3" />
          Paramètres avancés
        </Button>
        
        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
          <LogOut className="h-4 w-4 mr-3" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
