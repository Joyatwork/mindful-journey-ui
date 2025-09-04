// Configuration de base pour l'API Laravel
const API_BASE_URL = '/api';

// Récupère le token CSRF (Laravel Sanctum) et le place en cookie (XSRF-TOKEN)
const getCsrfToken = async () => {
  try {
    const csrfUrl = '/sanctum/csrf-cookie';
    console.log('🔒 Fetching CSRF from:', csrfUrl);
    
    const response = await fetch(csrfUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('✅ CSRF response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`CSRF fetch failed: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('❌ CSRF token fetch failed:', error);
    throw error;
  }
};

// Lit un cookie par nom
function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()\[\]\\\/\+^]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

// Normalise un HeadersInit en instance Headers
function normalizeHeaders(h?: HeadersInit): Headers {
  const headers = new Headers();
  if (!h) return headers;
  if (h instanceof Headers) {
    h.forEach((v, k) => headers.set(k, v));
  } else if (Array.isArray(h)) {
    for (const [k, v] of h) headers.set(k, v);
  } else {
    Object.entries(h).forEach(([k, v]) => headers.set(k, String(v)));
  }
  return headers;
}

// Configuration par défaut pour fetch
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  credentials: 'include' as RequestCredentials,
};

// Fonction helper pour les requêtes API avec gestion d'erreurs améliorée
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('🌐 API Request:', {
    url,
    method: options.method || 'GET'
  });
  
  // Récupérer le token d'authentification
  const token = localStorage.getItem('auth_token');
  
  // Construire la config de base avec Headers normalisé
  const headers = normalizeHeaders(defaultOptions.headers as HeadersInit);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.headers) {
    const extra = normalizeHeaders(options.headers);
    extra.forEach((v, k) => headers.set(k, v));
  }

  const config: RequestInit = {
    ...defaultOptions,
    ...options,
    headers,
  };

  // Pour les requêtes avec effet de bord, assurer le CSRF (Sanctum)
  const method = (config.method || 'GET').toString().toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    try {
      await getCsrfToken();
      const xsrf = getCookie('XSRF-TOKEN');
      if (xsrf && config.headers instanceof Headers) {
        config.headers.set('X-XSRF-TOKEN', xsrf);
      }
    } catch (e) {
      console.warn('CSRF bootstrap failed, continuing:', e);
    }
  }

  try {
    console.log('📡 Sending request...');
    const response = await fetch(url, config);
    
    console.log('📨 Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any = null;
      try { errorData = JSON.parse(errorText); } catch {}
      console.error('❌ Error response:', errorData ?? errorText);
      const message = (errorData && (errorData.message || errorData.error)) || `HTTP ${response.status}: ${response.statusText}`;
      throw new ApiError(message, response.status, errorData ?? errorText);
    }

    const data = await response.json();
    console.log('✅ Success:', data);
    return data;
  } catch (error) {
    console.error('🚨 Request failed:', error);
    throw error;
  }
}

// Classe d'erreur personnalisée pour l'API
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Services API pour différentes fonctionnalités
export const apiService = {
  // Authentification
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    
    register: (userData: { name: string; email: string; password: string }) =>
      apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    
    logout: () =>
      apiRequest('/auth/logout', {
        method: 'POST',
      }),
    
    user: () => apiRequest('/auth/user'),
  },

  // Profil utilisateur
  profile: {
    get: () => apiRequest('/profile'),
    
    update: (profileData: any) =>
      apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
  },

  // Rendez-vous
  appointments: {
    getAll: () => apiRequest('/appointments'),
    
    create: (appointmentData: any) =>
      apiRequest('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
      }),
    
    update: (id: string, appointmentData: any) =>
      apiRequest(`/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(appointmentData),
      }),
    
    delete: (id: string) =>
      apiRequest(`/appointments/${id}`, {
        method: 'DELETE',
      }),
    
    cancel: (id: string) =>
      apiRequest(`/appointments/${id}/cancel`, {
        method: 'PUT',
      }),
  },

  // Spécialistes de santé
  specialists: {
    getAll: (filters?: any) => {
      const queryParams = filters ? new URLSearchParams(filters).toString() : '';
      // Utiliser l'endpoint public pour la liste afin d'éviter une 401 si non connecté
      return apiRequest(`/specialists/public${queryParams ? `?${queryParams}` : ''}`);
    },
    
    getById: (id: string) => apiRequest(`/specialists/${id}`),
    
    search: (query: string) => apiRequest(`/specialists/search?q=${encodeURIComponent(query)}`),
  },

  // Données de santé (humeur, stress, etc.)
  healthData: {
    getMoodData: (period?: string) => {
      const queryParams = period ? `?period=${period}` : '';
      return apiRequest(`/mood${queryParams}`);
    },
    
    getTodayMood: () => apiRequest('/mood/today'),
    
    saveMoodData: (moodData: any) =>
      apiRequest('/mood', {
        method: 'POST',
        body: JSON.stringify(moodData),
      }),
    
    getProgressData: (period?: string) => {
      const queryParams = period ? `?period=${period}` : '';
      return apiRequest(`/health-data/progress${queryParams}`);
    },
  },

  // Activités wellness (méditation, respiration, etc.)
  wellness: {
    getActivities: () => apiRequest('/wellness/activities'),
    
    logActivity: (activityData: any) =>
      apiRequest('/wellness/activities/log', {
        method: 'POST',
        body: JSON.stringify(activityData),
      }),
    
    getProgress: () => apiRequest('/wellness/progress'),
  },

  // Diagnostic
  diagnostic: {
    save: (diagnosticData: any) =>
      apiRequest('/diagnostic', {
        method: 'POST',
        body: JSON.stringify(diagnosticData),
      }),
    
    get: () => apiRequest('/diagnostic'),
    
    getByScope: (scope: 'quick' | 'annual') => apiRequest(`/diagnostic?scope=${scope}`),
    
  saveAnnual: (data: any) => apiRequest('/diagnostic/annual', { method: 'POST', body: JSON.stringify(data) }),
  getAnnual: () => apiRequest('/diagnostic/annual'),
  getAnnualHistory: () => apiRequest('/diagnostic/annual/history'),
    
    saveQuick: (data: any) => apiRequest('/diagnostic', { method: 'POST', body: JSON.stringify({ ...data, scope: 'quick' }) }),
  },

  // Système de recommandations intelligent
  recommendations: {
    getPersonalized: (context: {
      mood?: number;
      stress?: number;
      energy?: number;
      time_of_day?: number;
      diagnostic?: any;
    }) => {
      const params = new URLSearchParams();
      if (context.mood !== undefined) params.append('mood', context.mood.toString());
      if (context.stress !== undefined) params.append('stress', context.stress.toString());
      if (context.energy !== undefined) params.append('energy', context.energy.toString());
      if (context.time_of_day !== undefined) params.append('time_of_day', context.time_of_day.toString());
      if (context.diagnostic) params.append('diagnostic', JSON.stringify(context.diagnostic));
      
      return apiRequest(`/recommendations/personalized?${params.toString()}`);
    },
    
    getHistoryBased: () => apiRequest('/recommendations/history-based'),
  },
};

export default apiService;
