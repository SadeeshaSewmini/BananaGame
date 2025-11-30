<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $username = trim($input['username'] ?? '');
    $score = intval($input['score'] ?? 0);
    $level = trim($input['level'] ?? '');
    $timeTaken = intval($input['timeTaken'] ?? 0);
    
    if (empty($username) || empty($level)) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }
    
    try {
        // Get user_id
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $userId = $user ? $user['id'] : null;
        
        $stmt = $pdo->prepare("INSERT INTO scores (user_id, username, score, level, time_taken) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $username, $score, $level, $timeTaken]);
        
        echo json_encode(['success' => true, 'message' => 'Score saved successfully']);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to save score: ' . $e->getMessage()]);
    }
}
?>