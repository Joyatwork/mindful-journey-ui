import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Settings,
  Bell,
  Shield,
  Target,
  Trophy,
  Activity,
  Heart,
  Brain,
  Zap,
  Download
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import EditProfileForm from './EditProfileForm';
import { useState } from 'react';

const ProfilePage = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isInstallable, installPWA } = usePWAInstall();

  const [isEditing, setIsEditing] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '123-456-7890',
    address: '123 Main St, Anytown',
    birthday: '1990-01-01',
    bio: 'A short bio about the user. This could include their interests, hobbies, or anything else they want to share.',
  });

  const handleSave = (newInfo: any) => {
    setUserInfo(newInfo);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-purple-200 dark:border-purple-700">
                <AvatarImage src="/placeholder.svg" alt="Photo de profil" />
                <AvatarFallback className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-xl">
                  JS
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {userInfo.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
                  {userInfo.bio}
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
                    <Heart className="w-3 h-3 mr-1" />
                    Bien-être
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                    <Brain className="w-3 h-3 mr-1" />
                    Méditation
                  </Badge>
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                    <Activity className="w-3 h-3 mr-1" />
                    Actif
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                {isInstallable && (
                  <Button
                    onClick={installPWA}
                    variant="outline"
                    size="sm"
                    className="border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Installer l'app
                  </Button>
                )}
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  size="sm"
                  className="border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {isEditing ? 'Annuler' : 'Modifier'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        {isEditing && (
          <EditProfileForm
            userInfo={userInfo}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        )}

        {/* Contact Information Section */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Informations de contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Mail className="w-5 h-5" />
              <a href={`mailto:${userInfo.email}`} className="hover:text-purple-500 dark:hover:text-purple-300">
                {userInfo.email}
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Phone className="w-5 h-5" />
              <a href={`tel:${userInfo.phone}`} className="hover:text-purple-500 dark:hover:text-purple-300">
                {userInfo.phone}
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <MapPin className="w-5 h-5" />
              <a href={`https://www.google.com/maps/place/${userInfo.address}`} target="_blank" rel="noopener noreferrer" className="hover:text-purple-500 dark:hover:text-purple-300">
                {userInfo.address}
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Calendar className="w-5 h-5" />
              Date de naissance: {new Date(userInfo.birthday).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Préférences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Mode sombre</span>
              <Switch checked={isDark} onCheckedChange={toggleTheme} id="dark-mode" />
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Notifications</span>
              <Switch disabled id="notifications" />
            </div>
          </CardContent>
        </Card>

        {/* Achievements Section */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Réalisations
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-gray-700 dark:text-gray-300">
                5 défis complétés
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300">
                10 objectifs atteints
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">
                7 jours d'activité
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">
                Authentification à deux facteurs
              </span>
              <Button variant="outline" size="sm" className="border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800">
                Activer
              </Button>
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">
                Changer le mot de passe
              </span>
              <Button variant="outline" size="sm" className="border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800">
                Modifier
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
