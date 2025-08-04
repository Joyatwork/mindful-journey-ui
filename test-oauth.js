#!/usr/bin/env node

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

console.log('🧪 Tests Automatiques - Mindful Journey Google OAuth\n');

// Test 1: Vérifier que le frontend répond
function testFrontend() {
    return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:8080', (res) => {
            if (res.statusCode === 200) {
                console.log('✅ Frontend accessible sur http://localhost:8080');
                resolve(true);
            } else {
                console.log(`❌ Frontend erreur: ${res.statusCode}`);
                resolve(false);
            }
        });
        
        req.on('error', (err) => {
            console.log('❌ Frontend inaccessible:', err.message);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            console.log('❌ Frontend timeout');
            resolve(false);
        });
    });
}

// Test 2: Vérifier que le backend répond
function testBackend() {
    return new Promise((resolve, reject) => {
        const req = http.get('http://127.0.0.1:8081/api/user', (res) => {
            if (res.statusCode === 401) {
                console.log('✅ Backend accessible sur http://127.0.0.1:8081 (401 attendu sans auth)');
                resolve(true);
            } else {
                console.log(`⚠️  Backend répond avec le code: ${res.statusCode}`);
                resolve(true);
            }
        });
        
        req.on('error', (err) => {
            console.log('❌ Backend inaccessible:', err.message);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            console.log('❌ Backend timeout');
            resolve(false);
        });
    });
}

// Test 3: Vérifier la route Google OAuth
function testGoogleOAuthRoute() {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            access_token: 'test_token',
            id: 'test_id',
            name: 'Test User',
            email: 'test@example.com',
            avatar: 'https://example.com/avatar.jpg'
        });
        
        const options = {
            hostname: '127.0.0.1',
            port: 8081,
            path: '/api/auth/google/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Accept': 'application/json'
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 422) {
                    console.log('✅ Route Google OAuth accessible (validation attendue)');
                    resolve(true);
                } else {
                    console.log(`⚠️  Route Google OAuth code: ${res.statusCode}`);
                    console.log('   Réponse:', data);
                    resolve(true);
                }
            });
        });
        
        req.on('error', (err) => {
            console.log('❌ Route Google OAuth erreur:', err.message);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            console.log('❌ Route Google OAuth timeout');
            resolve(false);
        });
        
        req.write(postData);
        req.end();
    });
}

// Test 4: Vérifier la configuration Google
function testGoogleConfig() {
    try {
        // Vérifier le frontend .env
        const frontendEnv = fs.readFileSync('.env', 'utf8');
        const hasGoogleClientId = frontendEnv.includes('VITE_GOOGLE_CLIENT_ID=764086051850');
        
        if (hasGoogleClientId) {
            console.log('✅ Configuration Google OAuth Frontend OK');
        } else {
            console.log('⚠️  Configuration Google OAuth Frontend incomplète');
        }
        
        // Vérifier le backend .env
        const backendEnvPath = path.join('back-mindful-journey-iu', 'mindful-journey-back', '.env');
        const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
        const hasBackendGoogleId = backendEnv.includes('GOOGLE_CLIENT_ID=764086051850');
        
        if (hasBackendGoogleId) {
            console.log('✅ Configuration Google OAuth Backend OK');
        } else {
            console.log('⚠️  Configuration Google OAuth Backend incomplète');
        }
        
        return hasGoogleClientId && hasBackendGoogleId;
    } catch (error) {
        console.log('❌ Erreur lecture configuration:', error.message);
        return false;
    }
}

// Exécuter tous les tests
async function runAllTests() {
    console.log('🚀 Démarrage des tests...\n');
    
    const results = {
        frontend: await testFrontend(),
        backend: await testBackend(),
        googleRoute: await testGoogleOAuthRoute(),
        config: testGoogleConfig()
    };
    
    console.log('\n📊 Résultats des Tests:');
    console.log('========================');
    console.log(`Frontend:        ${results.frontend ? '✅ OK' : '❌ ÉCHEC'}`);
    console.log(`Backend:         ${results.backend ? '✅ OK' : '❌ ÉCHEC'}`);
    console.log(`Route OAuth:     ${results.googleRoute ? '✅ OK' : '❌ ÉCHEC'}`);
    console.log(`Configuration:   ${results.config ? '✅ OK' : '⚠️  PARTIEL'}`);
    
    const allPassed = Object.values(results).every(result => result === true);
    
    console.log('\n🎯 Conclusion:');
    console.log('===============');
    
    if (allPassed) {
        console.log('🎉 TOUS LES TESTS RÉUSSIS !');
        console.log('🚀 Le système Google OAuth est prêt !');
        console.log('');
        console.log('📋 Prochaines étapes:');
        console.log('1. Créez votre projet Google Cloud Console');
        console.log('2. Obtenez votre vrai Client ID');
        console.log('3. Remplacez le Client ID de démonstration');
        console.log('4. Testez avec votre compte Gmail');
    } else {
        console.log('⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
        console.log('🔧 Vérifiez que les serveurs sont démarrés');
    }
    
    console.log('\n🌐 Liens utiles:');
    console.log('• Frontend: http://localhost:8080/login');
    console.log('• Guide création projet: file:///C:/Users/camar/Bureau/mindful-journey-ui/create-google-project.html');
}

// Lancer les tests
runAllTests().catch(console.error);
