import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Shield, User, Mail, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const { login, verifyOtp, twoFactorPending, register, forgotPassword, resetPassword, loginWithGoogle, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    entreprise_id: '' as string
  });
  const [entreprises, setEntreprises] = useState<{ id: number; name: string }[]>([]);
  // Charger les entreprises pour l'onglet inscription
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await (await import('@/lib/test-api')).default.entreprises.list();
        if (!cancelled) {
          setEntreprises(res.items || []);
        }
      } catch (e) {
        console.warn('Impossible de charger la liste des entreprises', e);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetMode, setResetMode] = useState(false); // when user clicks link with token (future integration)
  const [resetData, setResetData] = useState({ token: '', email: '', password: '', password_confirmation: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterPasswordConfirm, setShowRegisterPasswordConfirm] = useState(false);

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
      const result = await login(loginForm.email, loginForm.password);
      if (result.twoFactor) {
        showMessage('success', 'Code envoyé par email');
        return;
      }
      // Flux sans 2FA: AuthContext a déjà enregistré user/token
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (otpCode.length !== 5) {
      setOtpError('Code à 5 chiffres requis');
      return;
    }
    try {
      setLoading(true);
      await verifyOtp(otpCode);
      setOtpSuccess(true);
      showMessage('success', 'Vérification réussie');
    } catch (err: any) {
      const msg = err?.message || 'Code invalide';
      setOtpError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      showMessage('error', 'Veuillez entrer votre email');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(forgotEmail);
      showMessage('success', 'Si un compte existe, un lien a été envoyé.');
      setShowForgot(false);
    } catch (err: any) {
      showMessage('error', err.message || 'Erreur envoi email');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetData.email || !resetData.token || !resetData.password || !resetData.password_confirmation) {
      showMessage('error', 'Champs manquants');
      return;
    }
    if (resetData.password !== resetData.password_confirmation) {
      showMessage('error', 'Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({
        email: resetData.email,
        token: resetData.token,
        password: resetData.password,
        password_confirmation: resetData.password_confirmation
      });
      showMessage('success', 'Mot de passe réinitialisé. Connectez-vous.');
      setResetMode(false);
      setActiveTab('login');
      setLoginForm(prev => ({ ...prev, email: resetData.email }));
    } catch (err: any) {
      showMessage('error', err.message || 'Erreur réinitialisation');
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
      const entId = registerForm.entreprise_id ? parseInt(registerForm.entreprise_id, 10) : undefined;
      // Si une liste d'entreprises existe, rendre obligatoire la sélection
      if (entreprises.length > 0 && !entId) {
        showMessage('error', 'Veuillez choisir votre entreprise');
        return;
      }
      await register(registerForm.name, registerForm.email, registerForm.password, registerForm.password_confirmation, entId);
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
            <div className="w-full flex justify-center">
              <img src="/visuals/annual/Joyatwork.png" alt="Joyatwork" className="max-h-40 w-auto h-auto object-contain" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Joyatwork</CardTitle>
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
              {!twoFactorPending && (
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
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                        autoComplete="current-password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(v => !v)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                        aria-label={showLoginPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        title={showLoginPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        aria-pressed={showLoginPassword}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="text-right mt-1">
                      <button type="button" onClick={() => { setShowForgot(true); setForgotEmail(loginForm.email); }} className="text-xs text-indigo-600 hover:underline">
                        Mot de passe oublié ?
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>
              )}

              {twoFactorPending && !otpSuccess && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Code de vérification</Label>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={5}
                      placeholder="12345"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
                      className="tracking-widest text-center text-lg"
                      autoFocus
                    />
                    {otpError && <p className="text-xs text-red-600">{otpError}</p>}
                    {twoFactorPending && (
                      <>
                        <p className="text-xs text-gray-500">Code envoyé à {twoFactorPending.email}. Expire dans 10 min.</p>
                        {twoFactorPending.devCode && (
                          <p className="text-xs text-amber-600">Astuce dev: code local {twoFactorPending.devCode}</p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Vérification...' : 'Valider'}</Button>
                    <Button type="button" variant="outline" className="flex-1" disabled={loading} onClick={(e) => handleLogin(e)}>Renvoyer</Button>
                  </div>
                </form>
              )}
              {otpSuccess && <p className="text-center text-green-600 text-sm">Connexion validée...</p>}

              {!twoFactorPending && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Ou continuer avec</span>
                    </div>
                  </div>
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
                </>
              )}
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
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showRegisterPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(v => !v)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                      aria-label={showRegisterPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      title={showRegisterPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      aria-pressed={showRegisterPassword}
                    >
                      {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password-confirm">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="register-password-confirm"
                      type={showRegisterPasswordConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={registerForm.password_confirmation}
                      onChange={(e) => setRegisterForm({ ...registerForm, password_confirmation: e.target.value })}
                      required
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPasswordConfirm(v => !v)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                      aria-label={showRegisterPasswordConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      title={showRegisterPasswordConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      aria-pressed={showRegisterPasswordConfirm}
                    >
                      {showRegisterPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {/* Sélection de l'entreprise */}
                <div className="space-y-2">
                  <Label htmlFor="register-entreprise">Entreprise</Label>
                  <select
                    id="register-entreprise"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={registerForm.entreprise_id}
                    onChange={(e) => setRegisterForm({ ...registerForm, entreprise_id: e.target.value })}
                    required={entreprises.length > 0}
                  >
                    <option value="">{entreprises.length > 0 ? 'Sélectionnez votre entreprise' : 'Aucune entreprise disponible'}</option>
                    {entreprises.map((ent) => (
                      <option key={ent.id} value={ent.id}>{ent.name}</option>
                    ))}
                  </select>
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
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">Réinitialiser le mot de passe</h2>
            {!resetMode && (
              <form onSubmit={handleForgot} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForgot(false)}>Annuler</Button>
                  <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Envoi...' : 'Envoyer le lien'}</Button>
                </div>
                <p className="text-xs text-gray-500">Vous recevrez un email avec un lien si le compte existe.</p>
              </form>
            )}
            {resetMode && (
              <form onSubmit={handleReset} className="space-y-3">
                <Input placeholder="Token" value={resetData.token} onChange={(e) => setResetData({ ...resetData, token: e.target.value })} />
                <Input placeholder="Email" type="email" value={resetData.email} onChange={(e) => setResetData({ ...resetData, email: e.target.value })} />
                <Input placeholder="Nouveau mot de passe" type="password" value={resetData.password} onChange={(e) => setResetData({ ...resetData, password: e.target.value })} />
                <Input placeholder="Confirmer" type="password" value={resetData.password_confirmation} onChange={(e) => setResetData({ ...resetData, password_confirmation: e.target.value })} />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForgot(false)}>Annuler</Button>
                  <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Validation...' : 'Réinitialiser'}</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
