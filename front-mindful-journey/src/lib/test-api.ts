// Service API de test pour le développement
const API_BASE_URL = '/api';

// Lit un cookie par nom
function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()\[\]\\\/\+^]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

// Fonction pour obtenir le token CSRF
async function getCsrfToken() {
  try {
    await fetch('/sanctum/csrf-cookie', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });
    return true;
  } catch (error) {
    console.error('CSRF Error:', error);
    return false;
  }
}

// Fonction helper avec gestion CSRF automatique
async function testApiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Pour les requêtes POST/PUT/PATCH/DELETE, obtenir d'abord le token CSRF
  const incomingMethod = options.method || 'GET';
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(incomingMethod.toString().toUpperCase())) {
    await getCsrfToken();
  }
  
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  });
  if (options.headers) {
    const extra = new Headers(options.headers as HeadersInit);
    extra.forEach((v, k) => headers.set(k, v));
  }

  const config: RequestInit = {
    credentials: 'include',
    ...options,
    headers,
  };

  // Injecter automatiquement le token Bearer si disponible et non fourni
  try {
    const savedToken = localStorage.getItem('auth_token');
    const hasAuthHeader = !!(config.headers as any)['Authorization'];
    if (savedToken && config.headers instanceof Headers && !hasAuthHeader) {
      config.headers.set('Authorization', `Bearer ${savedToken}`);
    }
  } catch (_) {
    // localStorage non accessible (p.ex. SSR) : ignorer
  }

  // CSRF header for state-changing requests
  const normalizedMethod = (config.method || 'GET').toString().toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(normalizedMethod)) {
    const xsrf = getCookie('XSRF-TOKEN');
    if (xsrf && config.headers instanceof Headers) {
      config.headers.set('X-XSRF-TOKEN', xsrf);
    }
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // Tenter d'extraire un message d'erreur utile depuis la réponse JSON (Laravel)
      let data: any = null;
      try {
        data = await response.json();
      } catch (_) {
        // ignore parse error
      }

      // Construire un message pertinent
      let message = `HTTP error! status: ${response.status}`;
      if (data) {
        if (typeof data.message === 'string' && data.message.trim().length > 0) {
          message = data.message;
        } else if (data.errors && typeof data.errors === 'object') {
          // Prendre le premier message de validation
          const firstKey = Object.keys(data.errors)[0];
          const firstVal = data.errors[firstKey];
          if (Array.isArray(firstVal) && firstVal.length > 0) {
            message = firstVal[0];
          }
        }
      }

      const err: any = new Error(message);
      err.status = response.status;
      err.data = data;
      // Fournir un objet "response" minimal pour compatibilité avec les appels existants
      err.response = { status: response.status, data };
      throw err;
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Service API de test
const testApiService = {
  challenges: {
  list: () => testApiRequest('/challenges'),
    start: (challengeId: number) => testApiRequest(`/challenges/${challengeId}/start`, {
      method: 'POST'
    }),
    finish: (challengeId: number) => testApiRequest(`/challenges/${challengeId}/finish`, {
      method: 'POST'
    }),
  },
  userChallenges: {
    store: (data: { challenge_id: number }) => testApiRequest('/user/challenges', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  },
  // Test de santé de l'API
  health: {
    check: () => testApiRequest('/health')
  },

  // Spécialistes (routes de test)
  specialists: {
    getAll: () => testApiRequest('/test/specialists'),
    getById: (id: string) => testApiRequest(`/test/specialists/${id}`)
  },

  // Rendez-vous (routes de test)
  appointments: {
    getAll: () => testApiRequest('/test/appointments')
  },

  // Données de santé (routes de test)
  health_data: {
    getMood: () => testApiRequest('/test/mood')
  },

  // Test d'authentification
  auth: {
    register: (userData: any) => testApiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    login: (credentials: any) => testApiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    verifyOtp: (data: { otp_id: number; code: string }) => testApiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    forgotPassword: (email: string) => testApiRequest('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
    resetPassword: (data: { email: string; token: string; password: string; password_confirmation: string }) => testApiRequest('/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    logout: (token: string) => testApiRequest('/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }),
    getUser: (token: string) => testApiRequest('/auth/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }),
    updateProfile: (token: string, profileData: any) => testApiRequest('/auth/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    }),
    toggle2FA: (endpoint: '/auth/enable-2fa' | '/auth/disable-2fa') => testApiRequest(endpoint, {
      method: 'POST',
    }),
    testLogin: (credentials: any) => testApiRequest('/test/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  },

  // Profil utilisateur
  profile: {
    get: (token: string) => testApiRequest('/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }),
    update: (token: string, profileData: any) => testApiRequest('/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    })
  }
};

export default testApiService;
