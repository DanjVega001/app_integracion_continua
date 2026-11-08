<?php
/**
 * api.php — Endpoint único para todas las operaciones de tareas.
 * Acciones: list | create | update | delete | toggle
 */

header('Content-Type: application/json');

// ── Conexión BD ───────────────────────────────────────────────────────────────
$host     = getenv('DB_HOST')     ?: '127.0.0.1';
$dbname   = getenv('DB_DATABASE') ?: '';
$username = getenv('DB_USERNAME') ?: '';
$password = getenv('DB_PASSWORD') ?: '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(503);
    echo json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$body   = json_decode(file_get_contents('php://input'), true) ?? [];

// ── Enrutamiento ──────────────────────────────────────────────────────────────
switch (true) {

    // GET ?action=list → listar todas las tareas
    case $method === 'GET' && $action === 'list':
        $stmt = $pdo->query('SELECT id, description, completed FROM tasks ORDER BY id DESC');
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    // POST ?action=create → crear tarea
    case $method === 'POST' && $action === 'create':
        $desc = trim($body['description'] ?? '');
        if ($desc === '') {
            http_response_code(422);
            echo json_encode(['error' => 'La descripción es requerida']);
            break;
        }
        $stmt = $pdo->prepare('INSERT INTO tasks (description, completed) VALUES (:d, 0)');
        $stmt->execute([':d' => $desc]);
        http_response_code(201);
        echo json_encode(['message' => 'Tarea creada exitosamente']);
        break;

    // PUT ?action=update → editar descripción
    case $method === 'PUT' && $action === 'update':
        $id   = (int)($body['id'] ?? 0);
        $desc = trim($body['description'] ?? '');
        if (!$id || $desc === '') {
            http_response_code(422);
            echo json_encode(['error' => 'ID y descripción son requeridos']);
            break;
        }
        $stmt = $pdo->prepare('UPDATE tasks SET description = :d WHERE id = :id');
        $stmt->execute([':d' => $desc, ':id' => $id]);
        echo json_encode(['message' => 'Tarea actualizada']);
        break;

    // DELETE ?action=delete&id=X → eliminar tarea
    case $method === 'DELETE' && $action === 'delete':
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) { http_response_code(422); echo json_encode(['error' => 'ID requerido']); break; }
        $stmt = $pdo->prepare('DELETE FROM tasks WHERE id = :id');
        $stmt->execute([':id' => $id]);
        echo json_encode(['success' => true]);
        break;

    // GET ?action=toggle&id=X → alternar completado/pendiente
    case $method === 'GET' && $action === 'toggle':
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) { http_response_code(422); echo json_encode(['error' => 'ID requerido']); break; }
        $stmt = $pdo->prepare('UPDATE tasks SET completed = NOT completed WHERE id = :id');
        $stmt->execute([':id' => $id]);
        echo json_encode(['success' => true]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Acción no encontrada']);
}
