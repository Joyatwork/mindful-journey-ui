// Script de test pour diagnostiquer l'API
const API_BASE_URL = 'http://127.0.0.1:8081/api';
const API_DOMAIN = 'http://127.0.0.1:8081';

// Test CSRF
console.log('🔒 Testing CSRF...');
fetch(`${API_DOMAIN}/sanctum/csrf-cookie`, {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Accept': 'application/json',
  },
})
.then(response => {
  console.log('✅ CSRF Status:', response.status);
  
  // Test Login
  console.log('🔐 Testing Login...');
  return fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({
      email: 'alice.martin@email.com',
      password: 'password123'
    })
  });
})
.then(response => {
  console.log('📨 Login Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ Login Success:', data);
})
.catch(error => {
  console.error('❌ Test Failed:', error);
});
