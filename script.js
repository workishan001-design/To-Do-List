

const STORAGE_KEY = 'todo.tasks';

// UI elements
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const clearCompletedBtn = document.getElementById('clear-completed');
const taskCountEl = document.getElementById('task-count');
const filterButtons = document.querySelectorAll('.filter-btn');

// state
let tasks = loadTasks();
let currentFilter = 'all';

renderTasks();

/* ---------- Event listeners ---------- */

// Add task
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = '';
  input.focus();
});

// Delegated clicks (toggle / delete)
list.addEventListener('click', (e) => {
  const li = e.target.closest('li.task-item');
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.matches('.task-checkbox')) {
    toggleTask(id);
    return;
  }
  if (e.target.matches('.delete-btn') || e.target.closest('.delete-btn')) {
    deleteTask(id);
    return;
  }
});

// Clear completed
clearCompletedBtn.addEventListener('click', () => {
  clearCompleted();
});

// Filter buttons
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active').classList.remove('active');
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

/* ---------- Core functions ---------- */

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function addTask(text) {
  const task = { id: uid(), text, completed: false };
  tasks.unshift(task); // newest on top
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(x => x.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
}

/* ---------- Rendering ---------- */

function renderTasks() {
  list.innerHTML = "";

  let filteredTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true; // all
  });

  if (filteredTasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'task-item';
    empty.innerHTML = `<div class="task-content" style="opacity:.6">No tasks to show</div>`;
    list.appendChild(empty);
    updateCount();
    return;
  }

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;

    const content = document.createElement('div');
    content.className = 'task-content' + (task.completed ? ' completed' : '');
    content.textContent = task.text;

    const actions = document.createElement('div');
    actions.className = 'action-btns';
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-btn delete-btn';
    deleteBtn.textContent = '❌';

    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);
    list.appendChild(li);
  });

  updateCount();
}

function updateCount() {
  const activeCount = tasks.filter(t => !t.completed).length;
  const total = tasks.length;
  taskCountEl.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} left • ${total} total`;
}

