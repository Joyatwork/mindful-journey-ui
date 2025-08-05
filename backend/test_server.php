<?php
// Test simple pour vérifier les routes API
echo "Test API Server\n";
echo "================\n";

// Simuler quelques endpoints de base
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

echo "Request: $method $requestUri\n";

// Routes simples pour tester
if ($requestUri === '/api/test') {
    header('Content-Type: application/json');
    echo json_encode(['message' => 'API is working', 'timestamp' => time()]);
    exit;
}

if ($requestUri === '/api/auth/register' && $method === 'POST') {
    header('Content-Type: application/json');
    $input = json_decode(file_get_contents('php://input'), true);
    echo json_encode([
        'message' => 'Register endpoint called',
        'data' => $input,
        'timestamp' => time()
    ]);
    exit;
}

// Route par défaut
if ($requestUri === '/') {
    echo "<h1>Test Server Running</h1>";
    echo "<p>API endpoints available:</p>";
    echo "<ul>";
    echo "<li>GET /api/test</li>";
    echo "<li>POST /api/auth/register</li>";
    echo "</ul>";
    exit;
}

// 404 pour les autres routes
http_response_code(404);
echo json_encode(['error' => 'Route not found: ' . $requestUri]);
?>
