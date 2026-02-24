<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Laravel CORS Options
    |--------------------------------------------------------------------------
    */

    // Autoriser les endpoints API + le cookie CSRF de Sanctum
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Toutes les méthodes (GET, POST, PUT, PATCH, DELETE, OPTIONS…)
    'allowed_methods' => ['*'],

    // Origines explicites (courantes en dev + production)
    'allowed_origins' => array_filter(array_merge([
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://localhost:8081',
        'http://127.0.0.1:8081',
        'https://localhost:3000',
        'https://127.0.0.1:3000',
        'https://localhost:5173',
        'https://127.0.0.1:5173',
        'https://localhost:5174',
        'https://127.0.0.1:5174',
    ], array_filter(explode(',', env('CORS_ALLOWED_ORIGINS', ''))))),

    // Patterns pour couvrir localhost/127.0.0.1 sur n'importe quel port (http/https)
    // + tous les sous-domaines Vercel en production
    'allowed_origins_patterns' => [
        '/^http:\/\/localhost(:\d+)?$/',
        '/^http:\/\/127\.0\.0\.1(:\d+)?$/',
        '/^https:\/\/localhost(:\d+)?$/',
        '/^https:\/\/127\.0\.0\.1(:\d+)?$/',
        '/^https:\/\/.*\.vercel\.app$/',
    ],

    // Tous les headers
    'allowed_headers' => ['*'],

    // Headers exposés au client (garde vide, cookies non exposables ici)
    'exposed_headers' => [],

    // Mise en cache des préflights (en secondes)
    'max_age' => 3600,

    // Indispensable pour Sanctum (cookies cross-site)
    'supports_credentials' => true,

];
