<?php
// ── Conexión y migración de BD ────────────────────────────────────────────────
$host     = getenv('DB_HOST')     ?: '127.0.0.1';
$dbname   = getenv('DB_DATABASE') ?: '';
$username = getenv('DB_USERNAME') ?: '';
$password = getenv('DB_PASSWORD') ?: '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("CREATE TABLE IF NOT EXISTS tasks (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        description VARCHAR(150) NOT NULL,
        completed   TINYINT(1)   NOT NULL DEFAULT 0
    )");
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./frontend/css/styles.css">
    <title>TaskFlow</title>
</head>
<body>
    <div id="main">
        <!-- Encabezado -->
        <header class="app-header">
            <div class="brand-wrapper">
                <div class="brand-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 11l3 3L22 4"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                    </svg>
                </div>
                <div class="brand-text">
                    <h1>TaskFlow</h1>
                    <p>Gestor de tareas</p>
                </div>
            </div>
            <div class="homelab-badge">
                <span class="pulse-dot"></span>
                <span>CI/CD Live</span>
            </div>
        </header>

        <!-- Métricas -->
        <section class="stats-card">
            <div class="stats-grid">
                <div class="stat-item total">
                    <span class="stat-label">Total</span>
                    <span class="stat-value" id="stat-total">0</span>
                </div>
                <div class="stat-item pending">
                    <span class="stat-label">Pendientes</span>
                    <span class="stat-value" id="stat-pending">0</span>
                </div>
                <div class="stat-item completed">
                    <span class="stat-label">Completadas</span>
                    <span class="stat-value" id="stat-completed">0</span>
                </div>
            </div>
            <div class="progress-wrapper">
                <div class="progress-header">
                    <span>Progreso</span>
                    <span class="progress-percent" id="stat-progress-pct">0%</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" id="stat-progress-fill"></div>
                </div>
            </div>
        </section>

        <!-- Formulario nueva tarea -->
        <form id="form_create_task">
            <div class="input-glow-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                <input required type="text" name="task" id="input_task" placeholder="Nueva tarea..." autocomplete="off">
            </div>
            <button type="submit" class="btn-primary" id="btn_submit_task">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Agregar
            </button>
        </form>

        <!-- Filtros y búsqueda -->
        <div class="toolbar-row">
            <div class="filter-tabs">
                <button type="button" class="filter-tab active" data-filter="all">Todas</button>
                <button type="button" class="filter-tab" data-filter="pending">Pendientes</button>
                <button type="button" class="filter-tab" data-filter="completed">Completadas</button>
            </div>
            <div class="search-wrap">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input type="text" id="search_task" placeholder="Buscar..." autocomplete="off">
            </div>
        </div>

        <!-- Lista de tareas -->
        <div class="container"></div>
    </div>

    <script src="frontend/js/app.js"></script>
</body>
</html>
