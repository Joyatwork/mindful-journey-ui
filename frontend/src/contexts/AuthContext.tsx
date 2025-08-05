import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import testApiService from '@/lib/test-api';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  birth_date?: string;
  job_position?: string;
  company?: string;
  bio?: string;
  goals?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  loginWithGoogle: (googleData: any) => Promise<void>;
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

  const login = async (email: string, password: string) => {
    try {
      console.log('🔄 Début de la connexion...');
      const response = await testApiService.auth.login({ email, password });
      console.log('✅ Réponse login:', response);
      
      setUser(response.user);
      setToken(response.token || null);
      
      // Sauvegarder dans localStorage
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
        console.log('💾 Données sauvées dans localStorage (login):', response.user);
      }
      
      // Récupérer les données utilisateur fraîches pour s'assurer d'avoir les dernières modifications
      if (response.token) {
        try {
          console.log('🔄 Récupération des données utilisateur fraîches...');
          const userResponse = await testApiService.auth.getUser(response.token);
          console.log('✅ Données utilisateur fraîches:', userResponse);
          
          setUser(userResponse.user);
          localStorage.setItem('auth_user', JSON.stringify(userResponse.user));
          console.log('💾 Données fraîches sauvées dans localStorage:', userResponse.user);
        } catch (error) {
          console.warn('⚠️ Impossible de récupérer les données utilisateur fraîches:', error);
          // On continue avec les données de login de base
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erreur de connexion');
    }
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
      console.log('📝 Données à envoyer:', profileData);
      
      // Appel API réel maintenant que le backend fonctionne
      const response = await testApiService.auth.updateProfile(token, profileData);
      console.log('✅ Réponse mise à jour profil:', response);
      
      setUser(response.user);
      
      // Mettre à jour localStorage
      localStorage.setItem('auth_user', JSON.stringify(response.user));
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

  const loginWithGoogle = async (googleData: any) => {
    try {
      console.log('🔄 Début de la connexion Google...');
      console.log('📊 Données Google reçues:', googleData);
      
      const response = await testApiService.auth.loginWithGoogle(googleData);
      console.log('✅ Réponse login Google:', response);
      
      setUser(response.user);
      setToken(response.token || null);
      
      // Sauvegarder dans localStorage
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
        console.log('💾 Données Google sauvées dans localStorage:', response.user);
      }
    } catch (error: any) {
      console.error('❌ Erreur connexion Google:', error);
      throw new Error(error.message || 'Erreur de connexion Google');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
