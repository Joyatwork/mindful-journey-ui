<?php

try {
    $pdo = new PDO('sqlite:database/database.sqlite');
    
    echo "=== DONNÉES UTILISATEURS DANS LA BASE ===\n\n";
    
    $stmt = $pdo->query('SELECT id, name, email, phone, bio, birth_date, preferences, updated_at FROM users LIMIT 5');
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "ID: " . $row['id'] . "\n";
        echo "Nom: " . $row['name'] . "\n";
        echo "Email: " . $row['email'] . "\n";
        echo "Téléphone: " . ($row['phone'] ?: 'NULL') . "\n";
        echo "Bio: " . ($row['bio'] ?: 'NULL') . "\n";
        echo "Date naissance: " . ($row['birth_date'] ?: 'NULL') . "\n";
        echo "Préférences: " . ($row['preferences'] ?: 'NULL') . "\n";
        echo "Mis à jour: " . $row['updated_at'] . "\n";
        echo "---\n";
    }
    
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
