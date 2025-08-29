<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <title>Code de connexion</title>
    <style>
        body { font-family: Arial, sans-serif; color:#222; }
        .code { font-size: 32px; letter-spacing: 8px; font-weight: bold; background:#f5f5f5; padding:12px 18px; display:inline-block; border-radius:8px; }
        .container { max-width:600px; margin:0 auto; }
    </style>
</head>
<body>
<div class="container">
    <h2>{{ $appName }} - Connexion sécurisée</h2>
    <p>Voici votre code de vérification (valide {{ $minutes }} minutes) :</p>
    <p class="code">{{ $code }}</p>
    <p>Si vous n'êtes pas à l'origine de cette tentative, vous pouvez ignorer cet email.</p>
    <p style="font-size:12px;color:#666;">Ne partagez jamais ce code.</p>
</div>
</body>
</html>
