import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import testApiService from '@/lib/test-api';

interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
  created_at: string;
}

interface AuthResponse {
  message: string;
  user: User;
  token?: string;
}

const AuthTestPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // États des formulaires
  const [registerForm, setRegisterForm] = useState({
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
    password_confirmation: 'password123'
  });

  const [loginForm, setLoginForm] = useState({
    email: 'testuser@example.com',
    password: 'password123'
  });

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response: AuthResponse = await testApiService.auth.register(registerForm);
      setUser(response.user);
      setToken(response.token || null);
      showMessage('success', response.message);
      console.log('Inscription réussie:', response);
    } catch (error: any) {
      showMessage('error', `Erreur d'inscription: ${error.message}`);
      console.error('Erreur d\'inscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response: AuthResponse = await testApiService.auth.login(loginForm);
      setUser(response.user);
      setToken(response.token || null);
      showMessage('success', response.message);
      console.log('Connexion réussie:', response);
    } catch (error: any) {
      showMessage('error', `Erreur de connexion: ${error.message}`);
      console.error('Erreur de connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await testApiService.auth.logout(token);
      setUser(null);
      setToken(null);
      showMessage('success', response.message);
      console.log('Déconnexion réussie:', response);
    } catch (error: any) {
      showMessage('error', `Erreur de déconnexion: ${error.message}`);
      console.error('Erreur de déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetUser = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await testApiService.auth.getUser(token);
      setUser(response.user);
      showMessage('success', 'Données utilisateur récupérées');
      console.log('Utilisateur récupéré:', response);
    } catch (error: any) {
      showMessage('error', `Erreur lors de la récupération: ${error.message}`);
      console.error('Erreur de récupération:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!token) return;
    
    const profileData = {
      name: user?.name || 'Test User',
      phone: '+33123456789',
      bio: 'Utilisateur test avec profil complet',
      birth_date: '1990-01-01',
      gender: 'prefer_not_to_say',
      preferences: {
        themes: ['meditation', 'wellness'],
        notifications: 'daily'
      },
      health_goals: {
        primary: ['reduce_stress', 'improve_sleep'],
        target_minutes: 15
      }
    };

    setLoading(true);
    try {
      const response = await testApiService.profile.update(token, profileData);
      showMessage('success', 'Profil mis à jour avec succès');
      console.log('Profil mis à jour:', response);
      
      // Récupérer le profil mis à jour
      const updatedProfile = await testApiService.profile.get(token);
      console.log('Profil récupéré:', updatedProfile);
    } catch (error: any) {
      showMessage('error', `Erreur de mise à jour: ${error.message}`);
      console.error('Erreur de mise à jour:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">
          🔐 Test d'authentification Laravel Sanctum
        </h1>
        <p className="text-gray-600 mb-6">
          Testez l'inscription, la connexion et la gestion des tokens avec votre API Laravel
        </p>
      </div>

      {/* Messages d'état */}
      {message && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Statut utilisateur actuel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👤 Statut d'authentification
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500">Connecté</Badge>
                <span className="font-medium">{user.name}</span>
                <span className="text-gray-500">({user.email})</span>
              </div>
              {token && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    🔑 Voir le token
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono break-all">
                    {token}
                  </div>
                </details>
              )}
              <div className="flex gap-2 mt-4">
                <Button onClick={handleGetUser} disabled={loading} size="sm">
                  🔄 Actualiser les données
                </Button>
                <Button onClick={handleUpdateProfile} disabled={loading} size="sm" variant="secondary">
                  📝 Mettre à jour le profil
                </Button>
                <Button onClick={handleLogout} disabled={loading} size="sm" variant="outline">
                  🚪 Se déconnecter
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="outline">Non connecté</Badge>
              <span className="text-gray-500">Utilisez les formulaires ci-dessous pour vous connecter</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Formulaire d'inscription */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Inscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="register-name">Nom</Label>
              <Input
                id="register-name"
                value={registerForm.name}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Votre nom"
              />
            </div>
            <div>
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <Label htmlFor="register-password">Mot de passe</Label>
              <Input
                id="register-password"
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Minimum 8 caractères"
              />
            </div>
            <div>
              <Label htmlFor="register-password-confirm">Confirmer le mot de passe</Label>
              <Input
                id="register-password-confirm"
                type="password"
                value={registerForm.password_confirmation}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, password_confirmation: e.target.value }))}
                placeholder="Répéter le mot de passe"
              />
            </div>
            <Button onClick={handleRegister} disabled={loading} className="w-full">
              {loading ? '⏳ Inscription...' : '✅ S\'inscrire'}
            </Button>
          </CardContent>
        </Card>

        {/* Formulaire de connexion */}
        <Card>
          <CardHeader>
            <CardTitle>🔑 Connexion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <Label htmlFor="login-password">Mot de passe</Label>
              <Input
                id="login-password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Votre mot de passe"
              />
            </div>
            <Button onClick={handleLogin} disabled={loading} className="w-full">
              {loading ? '⏳ Connexion...' : '🚀 Se connecter'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthTestPage;
