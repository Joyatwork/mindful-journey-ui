import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Shield, User, Mail } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const { login, register, loginWithGoogle, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Rediriger si déjà connecté
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      showMessage('error', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      showMessage('success', 'Connexion réussie !');
    } catch (error: any) {
      // Utilise le message enrichi de testApiRequest (status, data)
      let msg = error?.message || `La connexion a échoué`;
      if (error?.status === 422 && error?.data) {
        if (typeof error.data.message === 'string') {
          msg = error.data.message;
        } else if (error.data.errors) {
          const firstKey = Object.keys(error.data.errors)[0];
          const firstVal = error.data.errors[firstKey];
          if (Array.isArray(firstVal) && firstVal.length > 0) {
            msg = firstVal[0];
          }
        }
      }
  toast({ title: msg, variant: "destructive" });
      console.error('error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.password_confirmation) {
      showMessage('error', 'Veuillez remplir tous les champs');
      return;
    }

    if (registerForm.password !== registerForm.password_confirmation) {
      showMessage('error', 'Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      await register(registerForm.name, registerForm.email, registerForm.password, registerForm.password_confirmation);
      showMessage('success', 'Inscription réussie !');
    } catch (error: any) {
      // Détecter un email déjà utilisé (souvent 409 ou 422 avec message spécifique)
      const rawMsg = error?.message || '';
      if (/existe déjà|already been taken|already exists/i.test(rawMsg)) {
        showMessage('error', 'Vous avez déjà un compte. Redirection vers la connexion...');
        // Basculer vers l'onglet connexion après un court délai
        setTimeout(() => {
          setActiveTab('login');
          // Pré-remplir l'email dans le formulaire de connexion
          setLoginForm(prev => ({ ...prev, email: registerForm.email }));
        }, 1200);
      } else {
        showMessage('error', rawMsg || 'Erreur lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (error: any) {
      showMessage('error', error.message || 'Erreur lors de la connexion avec Google');
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Heart className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Mindful Journey</CardTitle>
          <p className="text-gray-600">Votre voyage vers le bien-être commence ici</p>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className={`mb-4 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
              <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Connexion
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Inscription
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Ou continuer avec</span>
                </div>
              </div>

              {/* Google Login Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <Mail className="h-4 w-4 mr-2" />
                Continuer avec Google
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nom</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Votre nom"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Mot de passe</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password-confirm">Confirmer le mot de passe</Label>
                  <Input
                    id="register-password-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={registerForm.password_confirmation}
                    onChange={(e) => setRegisterForm({ ...registerForm, password_confirmation: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Inscription...' : 'S\'inscrire'}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Ou continuer avec</span>
                </div>
              </div>

              {/* Google Login Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <Mail className="h-4 w-4 mr-2" />
                Continuer avec Google
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
