// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const tasksContainer = document.getElementById('tasksContainer');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');

// Local Storage Key
const STORAGE_KEY = 'todoTasks';

// Global State
let tasks = [];
let currentFilter = 'all';

// Initialize App
function init() {
    loadTasks();
    renderTasks();
    updateStats();
    setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);
    clearAllBtn.addEventListener('click', clearAll);
}

// Add Task
function addTask() {
    const text = taskInput.value.trim();

    if (text === '') {
        alert('Please enter a task!');
        return;
    }

    if (text.length > 100) {
        alert('Task must be less than 100 characters!');
        return;
    }

    const task = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    };

    tasks.unshift(task);
    taskInput.value = '';
    taskInput.focus();
    saveTasks();
    renderTasks();
    updateStats();
}

// Delete Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
}

// Toggle Task Complete
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// Edit Task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt('Edit task:', task.text);
    if (newText === null) return;

    const trimmed = newText.trim();
    if (trimmed === '') {
        alert('Task cannot be empty!');
        return;
    }

    if (trimmed.length > 100) {
        alert('Task must be less than 100 characters!');
        return;
    }

    task.text = trimmed;
    saveTasks();
    renderTasks();
}

// Render Tasks
function renderTasks() {
    tasksContainer.innerHTML = '';

    let visibleTasks = tasks;

    if (currentFilter === 'active') {
        visibleTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        visibleTasks = tasks.filter(task => task.completed);
    }

    if (visibleTasks.length === 0) {
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');

    visibleTasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''} new`;
        taskItem.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="task-text" ondblclick="editTask(${task.id})" title="Double-click to edit">
                ${escapeHtml(task.text)}
            </span>
            <span class="task-date">${task.createdAt}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})" title="Delete task">×</button>
        `;
        tasksContainer.appendChild(taskItem);
    });
}

// Clear Completed Tasks
function clearCompleted() {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
        alert('No completed tasks to clear!');
        return;
    }

    if (confirm(`Delete ${completedCount} completed task(s)?`)) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// Clear All Tasks
function clearAll() {
    if (tasks.length === 0) {
        alert('No tasks to delete!');
        return;
    }

    if (confirm('Delete ALL tasks? This cannot be undone!')) {
        tasks = [];
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// Update Statistics
function updateStats() {
    const total = tasks.length;
    const active = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;

    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;

    // Update button states
    clearCompletedBtn.disabled = completed === 0;
    clearAllBtn.disabled = total === 0;
}

// Save Tasks to Local Storage
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Load Tasks from Local Storage
function loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            tasks = JSON.parse(saved);
        } catch (error) {
            console.error('Error loading tasks:', error);
            tasks = [];
        }
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export tasks as JSON
function exportTasks() {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Import tasks from JSON
function importTasks(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                if (confirm('Import tasks? This will merge with existing tasks.')) {
                    tasks = [...imported, ...tasks];
                    saveTasks();
                    renderTasks();
                    updateStats();
                    alert('Tasks imported successfully!');
                }
            } else {
                alert('Invalid file format!');
            }
        } catch (error) {
            alert('Error importing tasks: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+S to focus input
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        taskInput.focus();
    }
});

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
