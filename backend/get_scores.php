<?php
require_once 'config.php';

try {
    $stmt = $pdo->prepare("
        SELECT username, score, level, time_taken, played_at 
        FROM scores 
        ORDER BY score DESC, time_taken ASC 
        LIMIT 50
    ");
    $stmt->execute();
    $scores = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'scores' => $scores]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Failed to fetch scores: ' . $e->getMessage()]);
}
?>