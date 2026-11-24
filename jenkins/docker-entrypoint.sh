#!/bin/bash
set -e

# ── Acceso al socket de Docker (agnóstico al host) ──────────────
# En Linux el socket tiene un GID específico (961, 999, 998…).
# Detectamos ese GID y añadimos a jenkins a ese grupo.
# En Windows/macOS (Docker Desktop) el socket ya es accesible y
# este bloque simplemente no hace nada.
if [ -S /var/run/docker.sock ]; then
    SOCK_GID=$(stat -c '%g' /var/run/docker.sock)
    if ! getent group "$SOCK_GID" >/dev/null 2>&1; then
        groupadd -g "$SOCK_GID" dockersock
    fi
    usermod -aG "$SOCK_GID" jenkins 2>/dev/null || true
fi

# ── Arrancar Jenkins como usuario jenkins ────────────────────────
exec gosu jenkins /usr/local/bin/jenkins.sh "$@"
