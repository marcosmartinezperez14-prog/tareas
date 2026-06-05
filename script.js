document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const timeframeSelect = document.getElementById('timeframe-select');
    
    const lists = {
        daily: document.getElementById('list-daily'),
        weekly: document.getElementById('list-weekly'),
        monthly: document.getElementById('list-monthly')
    };

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        // Clear all lists
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
                
                // SVG for delete icon
                const deleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

                taskEl.innerHTML = `
                    <input type="checkbox" class="custom-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${escapeHTML(task.text)}</span>
                    <button class="delete-btn" aria-label="Eliminar tarea">${deleteIcon}</button>
                `;

                // Event listeners for this task
                const checkbox = taskEl.querySelector('.custom-checkbox');
                checkbox.addEventListener('change', () => toggleTaskComplete(task.id));

                const deleteBtn = taskEl.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', () => deleteTask(task.id));

                listElement.appendChild(taskEl);
            });
        }
    }

    function addTask(e) {
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

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        
        taskInput.value = '';
        taskInput.focus();
    }

    function toggleTaskComplete(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }

    // Helper to prevent XSS
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    taskForm.addEventListener('submit', addTask);

    // Initial render
    renderTasks();
});
