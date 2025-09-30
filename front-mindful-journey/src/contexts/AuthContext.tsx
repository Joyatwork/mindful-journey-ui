import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import testApiService from '@/lib/test-api';

interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
  phone?: string;
  location?: string;
  birth_date?: string;
  job_position?: string;
  company?: string;
  bio?: string;
  goals?: string;
  two_factor_enabled?: boolean;
  notifications_enabled?: boolean;
  created_at: string;
}

interface TwoFactorPending {
  otpId: number;
  expiresAt: string; // ISO string
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  twoFactorPending: TwoFactorPending | null;
  login: (email: string, password: string) => Promise<{ twoFactor?: true }>;
  verifyOtp: (code: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: { email: string; token: string; password: string; password_confirmation: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  handleGoogleCallback: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [twoFactorPending, setTwoFactorPending] = useState<TwoFactorPending | null>(null);
  const [lastCredentials, setLastCredentials] = useState<{ email: string; password: string } | null>(null);

  const isAuthenticated = !!user && !!token;

  // Charger le token depuis localStorage au démarrage
  useEffect(() => {
    const loadUserData = async () => {
      console.log('🔄 Chargement des données utilisateur au démarrage...');
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');

      console.log('🔑 Token sauvé:', savedToken ? 'Présent' : 'Absent');
      console.log('👤 Utilisateur sauvé:', savedUser ? JSON.parse(savedUser) : 'Absent');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          console.log('📱 Données localStorage chargées:', parsedUser);

          // Vérifier si le token est encore valide en récupérant les données utilisateur
          try {
            console.log('🔄 Vérification du token et récupération des données fraîches...');
            const response = await testApiService.auth.getUser(savedToken);
            if (response.user) {
              console.log('✅ Données fraîches récupérées:', response.user);
              // Mettre à jour avec les données les plus récentes
              setUser(response.user);
              localStorage.setItem('auth_user', JSON.stringify(response.user));
              console.log('💾 Données fraîches sauvées dans localStorage');
            }
          } catch (error) {
            // Token invalide, nettoyer les données
            console.log('❌ Token expiré, déconnexion automatique');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('❌ Erreur lors du chargement des données d\'authentification:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }
      setIsLoading(false);
      console.log('✅ Chargement terminé');
    };

    loadUserData();
  }, []);

  const login = async (email: string, password: string): Promise<{ twoFactor?: true }> => {
    try {
      console.log('🔄 Début de la connexion...');
      const response = await testApiService.auth.login({ email, password });
      console.log('✅ Réponse login:', response);
      setLastCredentials({ email, password });

      if (response.two_factor) {
        // Étape 2FA : ne pas définir user/token maintenant
        const expiresAt = new Date(Date.now() + (response.expires_in_seconds || 600) * 1000).toISOString();
        setTwoFactorPending({ otpId: response.otp_id, expiresAt, email });
        return { twoFactor: true };
      }

      // Flux sans 2FA (fallback si désactivé côté backend)
      setUser(response.user);
      setToken(response.token || null);

      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
        console.log('💾 Données sauvées dans localStorage (login):', response.user);
        try {
          console.log('🔄 Récupération des données utilisateur fraîches...');
          const userResponse = await testApiService.auth.getUser(response.token);
          setUser(userResponse.user);
          localStorage.setItem('auth_user', JSON.stringify(userResponse.user));
        } catch (error) {
          console.warn('⚠️ Impossible de récupérer les données utilisateur fraîches:', error);
        }
      }
      return {};
    } catch (error: any) {
      // Rethrow original error to keep status/data for UI handling
      throw error;
    }
  };

  const verifyOtp = async (code: string) => {
    if (!twoFactorPending) throw new Error('Aucune vérification en attente');
    const { otpId } = { otpId: twoFactorPending.otpId };
    const response = await testApiService.auth.verifyOtp({ otp_id: otpId, code });
    // Succès -> enregistrer user/token
    setUser(response.user);
    setToken(response.token || null);
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    setTwoFactorPending(null);
    setLastCredentials(null);
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    try {
      const response = await testApiService.auth.register({
        name,
        email,
        password,
        password_confirmation
      });
      setUser(response.user);
      setToken(response.token || null);

      // Sauvegarder dans localStorage
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erreur d\'inscription');
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await testApiService.auth.forgotPassword(email);
    } catch (e: any) {
      throw new Error(e?.message || 'Erreur envoi lien de réinitialisation');
    }
  };

  const resetPassword = async (data: { email: string; token: string; password: string; password_confirmation: string }) => {
    try {
      await testApiService.auth.resetPassword(data);
    } catch (e: any) {
      throw new Error(e?.message || 'Erreur réinitialisation mot de passe');
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await testApiService.auth.logout(token);
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyage complet
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Force le rechargement pour s'assurer que tout est nettoyé
      window.location.reload();
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!token) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      console.log('🔄 Début de la mise à jour du profil...');
      // Si c'est un FormData, lister les paires pour debug (utile pour vérifier nom des champs et présence du fichier)
      if (typeof FormData !== 'undefined' && profileData instanceof FormData) {
        console.log('📝 FormData à envoyer:');
        try {
          for (const pair of (profileData as FormData).entries()) {
            const [k, v] = pair as [string, any];
            if (v instanceof File) {
              console.log(`  - ${k}: File(name=${v.name}, size=${v.size}, type=${v.type})`);
            } else {
              console.log(`  - ${k}: ${v}`);
            }
          }
        } catch (e) {
          console.log('  (impossible d' + "'" + 'itérer FormData dans cet environnement)', e);
        }
      } else {
        console.log('📝 Données à envoyer:', profileData);
      }

      // Appel API réel maintenant que le backend fonctionne
      // Si on envoie un FormData (upload d'avatar), utiliser l'endpoint profile.update
      // (gère multipart/form-data via POST+_method=PUT) ; sinon utiliser auth.updateProfile
      let response: any;
      if (typeof FormData !== 'undefined' && profileData instanceof FormData) {
        response = await testApiService.profile.update(token, profileData);
      } else {
        response = await testApiService.auth.updateProfile(token, profileData);
      }
      console.log('✅ Réponse mise à jour profil:', response);

      // Le backend peut renvoyer { data: user } ou { user: user }
      const returnedUser = response?.user ?? response?.data ?? null;

      if (returnedUser) {
        // If backend returned only 'avatar' (relative path) but not 'avatar_url',
        // construct a public URL so the UI can immediately display the uploaded image.
        if (!returnedUser.avatar_url && returnedUser.avatar) {
          try {
            const origin = window.location.origin.replace(/:\d+$/,'');
            // Use '/storage/' path where Laravel stores public files
            returnedUser.avatar_url = `${window.location.origin}/storage/${returnedUser.avatar}`;
          } catch (_) {
            // ignore if window not available
          }
        }
        setUser(returnedUser);
        localStorage.setItem('auth_user', JSON.stringify(returnedUser));
      }
      console.log('💾 Données mise à jour sauvées dans localStorage:', response.user);

      return response;
    } catch (error: any) {
      console.error('❌ Erreur mise à jour profil:', error);
      // Fallback vers la mise à jour locale en cas d'erreur API
      console.warn('Erreur API, utilisation du fallback local:', error);

      if (user) {
        const updatedUser = {
          ...user,
          name: profileData.name || user.name,
          email: profileData.email || user.email,
          phone: profileData.phone,
          location: profileData.location,
          birth_date: profileData.birthDate,
          job_position: profileData.jobPosition,
          company: profileData.company,
          bio: profileData.bio,
          goals: profileData.goals,
        };

        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));

        return { user: updatedUser };
      }

      throw new Error(error.message || 'Erreur lors de la mise à jour du profil');
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log('🔄 Début de l\'authentification Google...');

      // Obtenir l'URL de redirection Google
      const response = await fetch('/api/auth/google');
      const data = await response.json();

      if (data.url) {
        // Rediriger vers Google OAuth
        window.location.href = data.url;
      } else {
        throw new Error('Impossible d\'obtenir l\'URL Google');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'authentification Google:', error);
      throw new Error(error.message || 'Erreur lors de l\'authentification Google');
    }
  };

  const handleGoogleCallback = async (token: string) => {
    try {
      console.log('🔄 Traitement du callback Google...');

      // Utiliser le token reçu pour obtenir les informations utilisateur
      const response = await testApiService.auth.getUser(token);

      if (response.user) {
        setUser(response.user);
        setToken(token);

        // Sauvegarder dans localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
        console.log('✅ Connexion Google réussie:', response.user);
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du traitement du callback Google:', error);
      throw new Error(error.message || 'Erreur lors du traitement du callback Google');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    twoFactorPending,
    login,
    verifyOtp,
    register,
    forgotPassword,
    resetPassword,
    loginWithGoogle,
    handleGoogleCallback,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
