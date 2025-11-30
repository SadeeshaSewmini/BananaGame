<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    // Validation
    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }
    
    // Enhanced Strong Password Validation
    if (strlen($password) < 8) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters long']);
        exit;
    }
    
    if (!preg_match('/[A-Z]/', $password)) {
        echo json_encode(['success' => false, 'message' => 'Password must contain at least one uppercase letter']);
        exit;
    }
    
    if (!preg_match('/[a-z]/', $password)) {
        echo json_encode(['success' => false, 'message' => 'Password must contain at least one lowercase letter']);
        exit;
    }
    
    if (!preg_match('/[0-9]/', $password)) {
        echo json_encode(['success' => false, 'message' => 'Password must contain at least one number']);
        exit;
    }
    
    if (!preg_match('/[!@#$%^&*()\-_=+{};:,<.>]/', $password)) {
        echo json_encode(['success' => false, 'message' => 'Password must contain at least one special character (!@#$%^&* etc.)']);
        exit;
    }
    
    // Email validation
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Please enter a valid email address']);
        exit;
    }
    
    // Username validation (alphanumeric and underscores)
    if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
        echo json_encode(['success' => false, 'message' => 'Username must be 3-20 characters long and contain only letters, numbers, and underscores']);
        exit;
    }
    
    try {
        // Check if username or email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
            exit;
        }
        
        // Hash password and insert user
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
        $stmt->execute([$username, $email, $passwordHash]);
        
        echo json_encode(['success' => true, 'message' => 'Registration successful']);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()]);
    }
}
?>