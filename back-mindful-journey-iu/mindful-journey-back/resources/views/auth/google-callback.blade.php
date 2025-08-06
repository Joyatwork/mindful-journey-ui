<!DOCTYPE html>
<html>
<head>
    <title>Authentification Google réussie</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border-left-color: #ffffff;
            animation: spin 1s ease infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Authentification Google réussie!</h1>
        <div class="spinner"></div>
        <p>Redirection en cours vers l'application...</p>
        <p><small>Si la redirection ne fonctionne pas, <a href="{{ $frontendUrl }}" style="color: #ffffff;">cliquez ici</a></small></p>
    </div>

    <script>
        // Données d'authentification depuis Laravel
        const authData = @json($authData);

        console.log('🎯 Données d\'authentification reçues:', authData);

        // Sauvegarder le token et les données utilisateur dans localStorage
        if (authData.success && authData.token) {
            localStorage.setItem('auth_token', authData.token);
            localStorage.setItem('user', JSON.stringify(authData.user));

            console.log('✅ Token et utilisateur sauvegardés dans localStorage');

            // Rediriger vers le frontend avec un message de succès
            setTimeout(() => {
                window.location.href = '{{ $frontendUrl }}?auth=success&provider=google';
            }, 2000);
        } else {
            console.error('❌ Erreur dans les données d\'authentification');
            setTimeout(() => {
                window.location.href = '{{ $frontendUrl }}?auth=error&provider=google';
            }, 3000);
        }
    </script>
</body>
</html>
