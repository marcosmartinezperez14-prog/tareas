document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const timeframeSelect = document.getElementById('timeframe-select');
    
    const lists = {
        daily: document.getElementById('list-daily'),
        weekly: document.getElementById('list-weekly'),
        monthly: document.getElementById('list-monthly')
    };

    let tasks = [];

    // Cargar tareas desde el backend Vercel Serverless API
    async function loadTasks() {
        try {
            const response = await fetch('/api/tasks');
            if (response.ok) {
                tasks = await response.json() || [];
                renderTasks();
            } else {
                console.error("Error al cargar tareas:", response.statusText);
            }
        } catch (error) {
            console.error("Error de red al cargar tareas:", error);
        }
    }

    function renderTasks() {
        Object.values(lists).forEach(list => list.innerHTML = '');

        const categorizedTasks = {
            daily: tasks.filter(t => t.timeframe === 'daily'),
            weekly: tasks.filter(t => t.timeframe === 'weekly'),
            monthly: tasks.filter(t => t.timeframe === 'monthly')
        };

        for (const [timeframe, timeframeTasks] of Object.entries(categorizedTasks)) {
            const listElement = lists[timeframe];
            
            if (timeframeTasks.length === 0) {
                listElement.innerHTML = '<div class="empty-state">No hay tareas</div>';
                continue;
            }

            timeframeTasks.forEach(task => {
                const taskEl = document.createElement('div');
                taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
                
                const deleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

                taskEl.innerHTML = `
                    <input type="checkbox" class="custom-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${escapeHTML(task.text)}</span>
                    <button class="delete-btn" aria-label="Eliminar tarea">${deleteIcon}</button>
                `;

                const checkbox = taskEl.querySelector('.custom-checkbox');
                checkbox.addEventListener('change', () => toggleTaskComplete(task.id));

                const deleteBtn = taskEl.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', () => deleteTask(task.id));

                listElement.appendChild(taskEl);
            });
        }
    }

    async function addTask(e) {
        e.preventDefault();
        
        const text = taskInput.value.trim();
        const timeframe = timeframeSelect.value;
        
        if (!text) return;

        const newTask = {
            id: Date.now().toString(),
            text,
            timeframe,
            completed: false
        };

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask)
            });

            if (response.ok) {
                const savedTask = await response.json();
                tasks.push(savedTask);
                renderTasks();
            } else {
                console.error("Error al añadir tarea:", response.statusText);
            }
        } catch (error) {
            console.error("Error de red al añadir tarea:", error);
        }
        
        taskInput.value = '';
        taskInput.focus();
    }

    async function toggleTaskComplete(id) {
        try {
            const response = await fetch(`/api/tasks?id=${id}`, {
                method: 'PUT'
            });

            if (response.ok) {
                const updatedTask = await response.json();
                tasks = tasks.map(task => task.id === id ? updatedTask : task);
                renderTasks();
            } else {
                console.error("Error al actualizar tarea:", response.statusText);
            }
        } catch (error) {
            console.error("Error de red al actualizar tarea:", error);
        }
    }

    async function deleteTask(id) {
        try {
            const response = await fetch(`/api/tasks?id=${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                tasks = tasks.filter(task => task.id !== id);
                renderTasks();
            } else {
                console.error("Error al eliminar tarea:", response.statusText);
            }
        } catch (error) {
            console.error("Error de red al eliminar tarea:", error);
        }
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    taskForm.addEventListener('submit', addTask);

    // Initial load
    loadTasks();
});
