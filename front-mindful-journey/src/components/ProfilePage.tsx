import React from 'react';
import { useTranslation } from 'react-i18next';
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

// Utility: convert various ISO datetime strings to yyyy-MM-dd for <input type="date">
function formatDateForInput(value: string | undefined | null) {
  if (!value) return '';
  // If already in yyyy-MM-dd, return as-is
  const simpleMatch = value.match(/^\d{4}-\d{2}-\d{2}$/);
  if (simpleMatch) return value;

  // Parse as Date and format (avoid timezone shifting by using UTC components if ISO provided)
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';

  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function safeGetBirthDate(user: any) {
  if (!user) return '';
  // prefer snake_case stored value, fallback to camelCase
  return user.birth_date ? formatDateForInput(user.birth_date) : (user.birthDate ? formatDateForInput(user.birthDate) : '');
}

const ProfilePage = () => {
  const { t } = useTranslation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isInstallable, installPWA } = usePWAInstall();
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [DoubleAuth, setDoubleAuth] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: user?.name || t('common.loading'),
    email: user?.email || 'email@example.com',
    phone: user?.phone || '',
    location: user?.location || '',
    birthDate: safeGetBirthDate(user as any),
    jobPosition: user?.job_position || t('profile.notSpecified'),
    company: user?.company || t('profile.notSpecified'),
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
        birthDate: safeGetBirthDate(user as any),
        jobPosition: user.job_position || t('profile.notSpecified'),
        company: user.company || t('profile.notSpecified'),
        bio: user.bio || '',
        goals: user.goals || ''
      }));
      // init 2FA toggle from user payload if present
      setDoubleAuth(Boolean(user.two_factor_enabled ?? true));
      // init notifications toggle from user payload if present
      setNotificationsEnabled(Boolean(user.notifications_enabled ?? false));
    }
  }, [user]);

  const toggle2FA = async () => {
    try {
      const endpoint = DoubleAuth ? '/auth/disable-2fa' : '/auth/enable-2fa';
      await testApiService.auth.toggle2FA(endpoint);
      const newVal = !DoubleAuth;
      setDoubleAuth(newVal);
      toast({
        title: newVal ? t('profile.fa2Enabled') : t('profile.fa2Disabled'),
        description: newVal
          ? t('profile.fa2EnabledDesc')
          : t('profile.fa2DisabledDesc')
      });
    } catch (error: any) {
      console.error('Erreur lors du changement de double AUTH', error);
      toast({
        title: t('common.error'),
        description: error?.message || t('errors.generic'),
        variant: 'destructive',
      });
    }
  };

  const handleSave = async (newInfo: any) => {
    setIsUpdating(true);
    try {
      // Si newInfo est un FormData (upload avatar), on le passe tel quel
      const isForm = typeof FormData !== 'undefined' && newInfo instanceof FormData;
      const profilePayload = isForm
        ? newInfo
        : {
          name: newInfo.name,
          email: newInfo.email,
          phone: newInfo.phone,
          location: newInfo.location,
          // Normalize birth date to yyyy-MM-dd (Form input gives yyyy-MM-dd)
          birth_date: newInfo.birthDate ? formatDateForInput(newInfo.birthDate) : (newInfo.birth_date ? formatDateForInput(newInfo.birth_date) : null),
          job_position: newInfo.jobPosition ?? newInfo.job_position,
          company: newInfo.company,
          bio: newInfo.bio,
          goals: newInfo.goals,
        };

      const response = await updateProfile(profilePayload);

      // response.user ou response.data devrait contenir l'utilisateur mis à jour (backend)
      const updatedUser = response?.user ?? response?.data ?? user;

      // Mettre à jour l'état local affiché (mapping champs snake_case -> camelCase si besoin)
      if (updatedUser) {
        setUserInfo(prev => ({
          ...prev,
          name: updatedUser.name || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone || '',
          location: updatedUser.location || '',
          birthDate: safeGetBirthDate(updatedUser),
          jobPosition: updatedUser.job_position || updatedUser.jobPosition || '',
          company: updatedUser.company || '',
          bio: updatedUser.bio || '',
          goals: updatedUser.goals || '',
        }));
      } else if (!isForm) {
        // fallback: si la réponse n'a pas retourné d'utilisateur, utiliser newInfo (objet simple)
        setUserInfo(newInfo);
      }

      setIsEditing(false);

      toast({
        title: t('profile.profileUpdated'),
        description: t('profile.profileSaved'),
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast({
        title: t('common.error'),
        description: error?.message || t('errors.generic'),
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleNotifications = async (next: boolean) => {
    try {
      const endpoint = next ? '/auth/enable-notifications' : '/auth/disable-notifications';
      await testApiService.auth.toggleNotifications(endpoint);
      setNotificationsEnabled(next);
      toast({
        title: next ? t('profile.notificationsEnabled') : t('profile.notificationsDisabled'),
        description: next
          ? t('profile.notificationsEnabledDesc')
          : t('profile.notificationsDisabledDesc')
      });
    } catch (error: any) {
      toast({ title: t('common.error'), description: error?.message || t('errors.generic'), variant: 'destructive' });
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
        return t('profile.formExcellent');
      case 'cloudy':
        return t('profile.formAverage');
      case 'rainy':
        return t('profile.formFatigue');
      default:
        return t('profile.formExcellent');
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
                  <AvatarImage src={user?.avatar_url || '/placeholder.svg'} alt={t('profile.profilePhoto')} />
                  <AvatarFallback className="bg-wellness-gradient text-white text-sm font-semibold">
                    {user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'U'}
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
                      {t('profile.install')}
                    </Button>
                  )}
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    {isEditing ? t('common.cancel') : t('common.edit')}
                  </Button>
                </div>
              </div>

              {/* Second Row: Wellness Status and Badges centered */}
              <div className="flex flex-col items-center space-y-2">
                {/* Wellness Weather Indicator */}
                <div className="flex items-center gap-2">
                  {getWeatherIcon(userInfo.wellnessWeather)}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {t('profile.form')}: <span className="font-medium">{getWeatherLabel(userInfo.wellnessWeather)}</span>
                  </span>
                </div>

                {/* Badges centered under wellness indicator */}
                <div className="flex flex-wrap gap-1.5 justify-center">
                  <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs px-2 py-0.5">
                    <Heart className="w-3 h-3 mr-1" />
                    {t('profile.wellness')}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5">
                    <Brain className="w-3 h-3 mr-1" />
                    {t('profile.meditationBadge')}
                  </Badge>
                  <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs px-2 py-0.5">
                    <Activity className="w-3 h-3 mr-1" />
                    {t('profile.activeBadge')}
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
              {t('profile.about')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                {t('profile.wellnessGoals')}
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
              {t('profile.contactInfo')}
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
              {t('profile.birthDate')}: {new Date(userInfo.birthDate).toLocaleDateString()}
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
              <div className="text-sm font-medium">{t('profile.myAppointments')}</div>
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
              {t('profile.preferences')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">{t('profile.darkMode')}</span>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} id="dark-mode" />
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">{t('profile.notifications')}</span>
              <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={toggleNotifications} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('profile.achievements')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {t('profile.challengesCompleted', { count: 5 })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {t('profile.goalsAchieved', { count: 10 })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {t('profile.activityDays', { count: 7 })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('profile.security')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">
                {t('profile.twoFactorAuth')}
              </span>
              <Button onClick={toggle2FA}
                variant="outline" size="sm"
                className="border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800">
                {DoubleAuth ? t('profile.disable') : t('profile.enable')}
              </Button>
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">
                {t('profile.changePassword')}
              </span>
              <Button variant="outline" size="sm" className="border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-800">
                {t('common.edit')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
