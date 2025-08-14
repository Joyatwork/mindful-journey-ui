// Service API de test pour le développement
const API_BASE_URL = '/api';

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
  const method = options.method || 'GET';
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    await getCsrfToken();
  }
  
  const config = {
    credentials: 'include' as RequestCredentials,
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Service API de test
const testApiService = {
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
