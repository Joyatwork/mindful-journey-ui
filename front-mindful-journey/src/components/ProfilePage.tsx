import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import testApiService from '@/lib/test-api';
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
  Download,
  CalendarCheck,
  Sun,
  Cloud,
  CloudRain,
  Briefcase,
  Edit
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useToast } from '@/hooks/use-toast';
import EditProfileForm from './EditProfileForm';
import AppointmentManagement from './AppointmentManagement';
import { useState, useEffect } from 'react';

const ProfilePage = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isInstallable, installPWA } = usePWAInstall();
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [ DoubleAuth, setDoubleAuth] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: user?.name || 'Utilisateur',
    email: user?.email || 'email@example.com',
    phone: user?.phone || '',
    location: user?.location || '',
    birthDate: user?.birth_date || '',
    jobPosition: user?.job_position || 'Non spécifié',
    company: user?.company || 'Non spécifiée',
    bio: user?.bio || '',
    goals: user?.goals || '',
    wellnessWeather: 'sunny' // sunny, cloudy, rainy
  });

  // Mettre à jour les données utilisateur quand elles changent
  useEffect(() => {
    if (user) {
      setUserInfo(prevInfo => ({
        ...prevInfo,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
        birthDate: user.birth_date || '',
        jobPosition: user.job_position || 'Non spécifié',
        company: user.company || 'Non spécifiée',
        bio: user.bio || '',
        goals: user.goals || ''
      }));
  // init 2FA toggle from user payload if present
  setDoubleAuth(Boolean(user.two_factor_enabled ?? true));
    }
  }, [user]);

  const toggle2FA = async () => {
    try {
      const endpoint = DoubleAuth ? '/auth/disable-2fa' : '/auth/enable-2fa';
      await testApiService.auth.toggle2FA(endpoint);
      const newVal = !DoubleAuth;
      setDoubleAuth(newVal);
      toast({
        title: newVal ? '2FA activée' : '2FA désactivée',
        description: newVal
          ? 'Un code sera demandé lors de vos prochaines connexions.'
          : 'Le code ne sera plus demandé lors de la connexion.'
      });
    } catch (error: any) {
      console.error('Erreur lors du changement de double AUTH', error);
      toast({
        title: 'Erreur',
        description: error?.message || 'Impossible de mettre à jour la 2FA',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async (newInfo: any) => {
    setIsUpdating(true);
    try {
      // Préparer les données pour l'API
      const profileData = {
        name: newInfo.name,
        email: newInfo.email,
        phone: newInfo.phone,
        location: newInfo.location,
        birthDate: newInfo.birthDate,
        jobPosition: newInfo.jobPosition,
        company: newInfo.company,
        bio: newInfo.bio,
        goals: newInfo.goals
      };

      await updateProfile(profileData);
      
      // Mettre à jour l'état local
      setUserInfo(newInfo);
      setIsEditing(false);
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
        variant: "default",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny':
        return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="w-4 h-4 text-gray-500" />;
      case 'rainy':
        return <CloudRain className="w-4 h-4 text-blue-500" />;
      default:
        return <Sun className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getWeatherLabel = (weather: string) => {
    switch (weather) {
      case 'sunny':
        return 'Excellente';
      case 'cloudy':
        return 'Moyenne';
      case 'rainy':
        return 'Fatigue';
      default:
        return 'Excellente';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Simplified Header Section */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              {/* First Row: Avatar and Basic Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <Avatar className="w-16 h-16 border-2 border-white shadow-lg flex-shrink-0">
                  <AvatarImage src="/placeholder.svg" alt="Photo de profil" />
                  <AvatarFallback className="bg-wellness-gradient text-white text-sm font-semibold">
                    JS
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center sm:text-left flex-grow min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {userInfo.name}
                  </h1>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 dark:text-gray-300 text-sm mb-1">
                    <Briefcase className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{userInfo.jobPosition}</span>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
                    {userInfo.company}
                  </div>
                </div>

                {/* Action Buttons - Right aligned on desktop */}
                <div className="flex gap-2 flex-shrink-0">
                  {isInstallable && (
                    <Button
                      onClick={installPWA}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Installer
                    </Button>
                  )}
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    {isEditing ? 'Annuler' : 'Modifier'}
                  </Button>
                </div>
              </div>

              {/* Second Row: Wellness Status and Badges centered */}
              <div className="flex flex-col items-center space-y-2">
                {/* Wellness Weather Indicator */}
                <div className="flex items-center gap-2">
                  {getWeatherIcon(userInfo.wellnessWeather)}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Forme: <span className="font-medium">{getWeatherLabel(userInfo.wellnessWeather)}</span>
                  </span>
                </div>
                
                {/* Badges centered under wellness indicator */}
                <div className="flex flex-wrap gap-1.5 justify-center">
                  <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs px-2 py-0.5">
                    <Heart className="w-3 h-3 mr-1" />
                    Bien-être
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5">
                    <Brain className="w-3 h-3 mr-1" />
                    Méditation
                  </Badge>
                  <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs px-2 py-0.5">
                    <Activity className="w-3 h-3 mr-1" />
                    Actif
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        {isEditing && (
          <EditProfileForm
            initialData={userInfo}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
            isLoading={isUpdating}
          />
        )}

        {/* Bio and Goals Section */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              À propos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Objectifs bien-être
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {userInfo.goals}
              </p>
            </div>
          </CardContent>
        </Card>

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
              <a href={`https://www.google.com/maps/place/${userInfo.location}`} target="_blank" rel="noopener noreferrer" className="hover:text-purple-500 dark:hover:text-purple-300">
                {userInfo.location}
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Calendar className="w-5 h-5" />
              Date de naissance: {new Date(userInfo.birthDate).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Mes rendez-vous */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => setShowAppointments(!showAppointments)}
            className="h-16 bg-wellness-gradient hover:opacity-90 text-white rounded-2xl"
          >
            <div className="text-center">
              <CalendarCheck className="h-6 w-6 mx-auto mb-1" />
              <div className="text-sm font-medium">Mes rendez-vous</div>
            </div>
          </Button>
        </div>

        {/* Appointment Management */}
        {showAppointments && (
          <AppointmentManagement onClose={() => setShowAppointments(false)} />
        )}

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Préférences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Mode sombre</span>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} id="dark-mode" />
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Notifications</span>
              <Switch disabled id="notifications" />
            </div>
          </CardContent>
        </Card>

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
              <Button onClick={toggle2FA} 
              variant="outline" size="sm" 
              className="border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800">
              {DoubleAuth ? 'Désactiver' :  'Activer'} 
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
