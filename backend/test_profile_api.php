<?php
// Script de test pour l'API de profil

$token = ""; // On récupérera le token

// 1. Se connecter pour obtenir un token
$loginData = json_encode([
    'email' => 'backend@test.com',
    'password' => 'password123'
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8081/api/auth/login');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $loginData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$loginResponse = curl_exec($ch);
$loginData = json_decode($loginResponse, true);

if (isset($loginData['token'])) {
    $token = $loginData['token'];
    echo "Token récupéré: " . substr($token, 0, 20) . "...\n";
} else {
    echo "Erreur de connexion: " . $loginResponse . "\n";
    exit;
}

// 2. Tester la mise à jour du profil
$profileData = json_encode([
    'name' => 'Jean Dupont',
    'email' => 'backend@test.com',
    'phone' => '0123456789',
    'location' => 'Paris, France',
    'birthDate' => '1990-01-01',
    'jobPosition' => 'Développeur',
    'company' => 'TechCorp',
    'bio' => 'Développeur passionné',
    'goals' => 'Améliorer mon bien-être'
]);

curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8081/api/auth/profile');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
curl_setopt($ch, CURLOPT_POSTFIELDS, $profileData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);

$profileResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

echo "Code HTTP: $httpCode\n";
echo "Réponse: $profileResponse\n";

curl_close($ch);
?>
