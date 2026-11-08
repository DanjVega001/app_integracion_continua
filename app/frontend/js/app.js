// ── app.js — Lógica completa de TaskFlow ─────────────────────────────────────

const API = (action, params = '') => `/api.php?action=${action}${params}`;

let allTasks   = [];
let activeFilter = 'all';

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
        error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    };
    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `<div class="toast-content"><span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-msg">${msg}</span></div><button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('toast-exit'); setTimeout(() => toast.remove(), 250); }, 3500);
}

// ── Modal de confirmación ─────────────────────────────────────────────────────
function showConfirm(title, message, onConfirm) {
    let modal = document.getElementById('confirm-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'confirm-modal';
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-card">
                <div class="modal-header">
                    <div class="modal-icon-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </div>
                    <h3 class="modal-title" id="modal-title"></h3>
                </div>
                <p class="modal-body" id="modal-msg"></p>
                <div class="modal-actions">
                    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
                    <button class="btn btn-danger"    id="modal-confirm">Eliminar</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-msg').textContent   = message;
    modal.classList.add('active');
    const close = () => modal.classList.remove('active');
    modal.onclick = e => { if (e.target === modal) close(); };
    document.getElementById('modal-cancel').onclick  = close;
    document.getElementById('modal-confirm').onclick = () => { close(); onConfirm(); };
}

// ── Renderizado ───────────────────────────────────────────────────────────────
function renderTasks(tasks) {
    allTasks = tasks;
    updateStats(tasks);
    applyFilterAndRender();
}

function applyFilterAndRender() {
    const query = (document.getElementById('search_task')?.value || '').toLowerCase();
    let list = allTasks;
    if (activeFilter === 'pending')   list = list.filter(t => !+t.completed);
    if (activeFilter === 'completed') list = list.filter(t =>  +t.completed);
    if (query) list = list.filter(t => t.description.toLowerCase().includes(query));

    const container = document.querySelector('.container');
    if (!container) return;

    if (!list.length) {
        container.innerHTML = `<div class="empty-state"><p>No hay tareas para mostrar</p></div>`;
        return;
    }

    container.innerHTML = list.map(t => {
        const done = +t.completed;
        return `
        <div class="task${done ? ' task-is-completed' : ''}" data-id="${t.id}">
            <input class="task-description" type="text" value="${escHtml(t.description)}" disabled>
            <div class="task-actions">
                <button class="task-action-btn task_btn_complete" title="${done ? 'Reactivar' : 'Completar'}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
                <button class="task-action-btn task_btn_edit" title="Editar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="task-action-btn task_btn_delete" title="Eliminar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
            </div>
        </div>`;
    }).join('');

    attachEvents();
}

function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function updateStats(tasks) {
    const total     = tasks.length;
    const completed = tasks.filter(t => +t.completed).length;
    const pending   = total - completed;
    const pct       = total ? Math.round((completed / total) * 100) : 0;

    document.getElementById('stat-total').textContent     = total;
    document.getElementById('stat-pending').textContent   = pending;
    document.getElementById('stat-completed').textContent = completed;
    document.getElementById('stat-progress-pct').textContent = pct + '%';
    document.getElementById('stat-progress-fill').style.width = pct + '%';
}

// ── Eventos de las tarjetas ───────────────────────────────────────────────────
function attachEvents() {
    // Completar / toggle
    document.querySelectorAll('.task_btn_complete').forEach(btn => {
        btn.addEventListener('click', async () => {
            const card = btn.closest('.task');
            const id   = card.dataset.id;
            const isCompleted = card.classList.contains('task-is-completed');
            const res  = await fetch(API('toggle', `&id=${id}`));
            if (res.ok) {
                showToast(isCompleted ? 'Tarea reactivada' : '¡Tarea completada!', isCompleted ? 'info' : 'success');
                renderTasks(await loadTasks());
            }
        });
    });

    // Editar
    document.querySelectorAll('.task_btn_edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const card  = btn.closest('.task');
            const input = card.querySelector('input.task-description');
            if (!input.disabled) { input.disabled = true; return; } // cancelar
            input.disabled = false;
            input.focus();

            const save = async () => {
                const desc = input.value.trim();
                if (!desc) { showToast('La tarea no puede estar vacía', 'error'); input.focus(); return; }
                const res = await fetch(API('update'), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: card.dataset.id, description: desc })
                });
                if (res.ok) { showToast('Tarea actualizada', 'info'); renderTasks(await loadTasks()); }
                else showToast('Error al actualizar', 'error');
            };

            input.addEventListener('keydown', e => {
                if (e.key === 'Enter')  { e.preventDefault(); save(); }
                if (e.key === 'Escape') { input.disabled = true; }
            }, { once: true });
        });
    });

    // Eliminar
    document.querySelectorAll('.task_btn_delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.task');
            const desc = card.querySelector('input.task-description').value;
            showConfirm('¿Eliminar tarea?', `¿Seguro que deseas eliminar "${desc}"?`, async () => {
                const res = await fetch(API('delete', `&id=${card.dataset.id}`), { method: 'DELETE' });
                if (res.ok) { showToast('Tarea eliminada', 'info'); renderTasks(await loadTasks()); }
            });
        });
    });
}

// ── API helpers ───────────────────────────────────────────────────────────────
async function loadTasks() {
    try {
        const res = await fetch(API('list'));
        return res.ok ? await res.json() : [];
    } catch { return []; }
}

// ── Inicialización ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    // Cargar tareas
    renderTasks(await loadTasks());

    // Crear tarea
    document.getElementById('form_create_task')?.addEventListener('submit', async e => {
        e.preventDefault();
        const input = document.getElementById('input_task');
        const btn   = document.getElementById('btn_submit_task');
        const desc  = input.value.trim();
        if (!desc) return;
        btn.disabled = true;
        try {
            const res  = await fetch(API('create'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: desc })
            });
            const data = await res.json();
            if (!res.ok) { showToast(data.error || 'Error al crear la tarea', 'error'); return; }
            showToast(data.message || '¡Tarea agregada!', 'success');
            e.target.reset();
            renderTasks(await loadTasks());
        } catch { showToast('Error de conexión', 'error'); }
        finally { btn.disabled = false; }
    });

    // Filtros
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeFilter = tab.dataset.filter;
            applyFilterAndRender();
        });
    });

    // Búsqueda
    document.getElementById('search_task')?.addEventListener('input', applyFilterAndRender);
});
