// Test de l'intégration Google OAuth
// Ce script teste l'endpoint Google OAuth du backend

const API_BASE_URL = 'http://127.0.0.1:8081/api';

// Test des données Google simulées
const testGoogleData = {
    access_token: 'test_access_token_123',
    id: 'google_user_123',
    name: 'Test User',
    email: 'test.user@gmail.com',
    avatar: 'https://lh3.googleusercontent.com/a/default-user'
};

async function testGoogleOAuthLogin() {
    console.log('🧪 Test de l\'authentification Google OAuth...\n');
    
    try {
        console.log('📤 Envoi des données vers:', `${API_BASE_URL}/google/login`);
        console.log('📋 Données envoyées:', JSON.stringify(testGoogleData, null, 2));
        
        const response = await fetch(`${API_BASE_URL}/google/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(testGoogleData)
        });

        console.log(`\n📡 Statut de la réponse: ${response.status} ${response.statusText}`);
        
        const data = await response.json();
        console.log('📥 Réponse du serveur:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('\n✅ Test réussi ! L\'authentification Google fonctionne.');
            console.log(`👤 Utilisateur créé/connecté: ${data.user.name} (${data.user.email})`);
            console.log(`🔑 Token généré: ${data.token ? 'Oui' : 'Non'}`);
            
            // Test avec le token reçu
            if (data.token) {
                await testAuthenticatedRequest(data.token);
            }
        } else {
            console.log('\n❌ Test échoué.');
            console.log('🔍 Erreurs:', data.errors || data.message);
        }

    } catch (error) {
        console.error('\n💥 Erreur lors du test:', error.message);
        console.error('🔍 Détails:', error);
    }
}

async function testAuthenticatedRequest(token) {
    console.log('\n🔐 Test d\'une requête authentifiée...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Requête authentifiée réussie !');
            console.log(`👤 Profil utilisateur récupéré: ${data.name} (${data.email})`);
        } else {
            console.log('❌ Échec de la requête authentifiée:', data.message);
        }
    } catch (error) {
        console.error('💥 Erreur lors de la requête authentifiée:', error.message);
    }
}

// Fonction pour tester la disponibilité du serveur
async function testServerAvailability() {
    console.log('🔍 Vérification de la disponibilité du serveur...\n');
    
    try {
        const response = await fetch(`${API_BASE_URL}/health-check`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            console.log('✅ Serveur disponible et accessible');
        } else {
            console.log(`⚠️  Serveur accessible mais retourne: ${response.status}`);
        }
    } catch (error) {
        console.log('❌ Serveur non accessible:', error.message);
        console.log('💡 Assurez-vous que le serveur Laravel fonctionne sur http://127.0.0.1:8081');
    }
}

// Exécution des tests
async function runTests() {
    console.log('🚀 Démarrage des tests d\'intégration Google OAuth\n');
    console.log('='.repeat(50));
    
    await testServerAvailability();
    console.log('\n' + '='.repeat(50));
    await testGoogleOAuthLogin();
    
    console.log('\n' + '='.repeat(50));
    console.log('🏁 Tests terminés');
}

// Exécuter si ce script est appelé directement
if (typeof module !== 'undefined' && require.main === module) {
    runTests();
}

// Pour usage dans le navigateur
if (typeof window !== 'undefined') {
    window.testGoogleOAuth = runTests;
    console.log('💡 Tapez testGoogleOAuth() dans la console pour lancer les tests');
}
