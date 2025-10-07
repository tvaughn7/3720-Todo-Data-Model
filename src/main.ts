import './style.css'

import { addCategory, createTodo, deleteCategory, deleteTodo, getAllCategories, getAllTodos, editTodo } from './todoModel.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <h1 class="text-4xl font-bold text-gray-800 mb-8 text-center">Todo App</h1>

      <!-- Controls Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Controls</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <button id="add-category" type="button" class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Add Category
          </button>
          <button id="add-todo" type="button" class="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Add Todo
          </button>
          <button id="delete-category" type="button" class="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Delete Category
          </button>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Select Category:</label>
          <select id="categoriesDropdown" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="" disabled selected>Select a category</option>
          </select>
        </div>
      </div>

      <!-- Todo Viewer Section -->
      <div id="todo-viewer" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Todo Items</h2>
        <div id="todo-list" class="space-y-4">
          <!-- Todos will be rendered here -->
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div id="add-category-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden items-center justify-center">
      <div class="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Add Category</h2>
        <form id="add-category-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
            <input 
              type="text" 
              id="category-name-input" 
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Enter category name..."
            />
          </div>
          <div class="flex gap-3 pt-4">
            <button 
              type="submit" 
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Add Category
            </button>
            <button 
              type="button" 
              id="cancel-category" 
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Todo Modal -->
    <div id="add-todo-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden items-center justify-center">
      <div class="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Add Todo</h2>
        <form id="add-todo-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
            <input 
              type="text" 
              id="todo-name-input" 
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Enter task name..."
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select 
              id="todo-category-input" 
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="" disabled selected>Select category</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select 
              id="todo-status-input" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <input 
              type="date" 
              id="todo-date-input" 
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div class="flex gap-3 pt-4">
            <button 
              type="submit" 
              class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Add Todo
            </button>
            <button 
              type="button" 
              id="cancel-todo" 
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
`

// Your original button event handlers
document.querySelector<HTMLButtonElement>('#add-category')!.onclick = () => {
  openAddCategoryModal();
}

document.querySelector<HTMLButtonElement>("#add-todo")!.onclick = () => {
  openAddTodoModal();
}

document.querySelector<HTMLButtonElement>("#delete-category")!.onclick = () => {
  const categoryId = prompt("Enter category ID to delete:")
  if (categoryId) {
    const success = deleteCategory(categoryId)
    alert(success ? `Category with ID ${categoryId} deleted.` : `Category with ID ${categoryId} not found.`)
  }
}

// Modal functions
function openAddCategoryModal() {
  const modal = document.getElementById('add-category-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeAddCategoryModal() {
  const modal = document.getElementById('add-category-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  const form = document.getElementById('add-category-form') as HTMLFormElement;
  form?.reset();
}

function openAddTodoModal() {
  updateTodoCategoryDropdown();
  const modal = document.getElementById('add-todo-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeAddTodoModal() {
  const modal = document.getElementById('add-todo-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  const form = document.getElementById('add-todo-form') as HTMLFormElement;
  form?.reset();
}

// Add Category Form Handler
document.getElementById('add-category-form')!.addEventListener('submit', (e) => {
  e.preventDefault();
  const nameInput = document.getElementById('category-name-input') as HTMLInputElement;
  const categoryName = nameInput.value.trim();
  
  if (categoryName) {
    addCategory(categoryName);
    updateCategoriesDropdown();
    closeAddCategoryModal();
  }
});

document.getElementById('cancel-category')!.addEventListener('click', closeAddCategoryModal);

// Add Todo Form Handler
document.getElementById('add-todo-form')!.addEventListener('submit', (e) => {
  e.preventDefault();
  const nameInput = document.getElementById('todo-name-input') as HTMLInputElement;
  const categoryInput = document.getElementById('todo-category-input') as HTMLSelectElement;
  const statusInput = document.getElementById('todo-status-input') as HTMLSelectElement;
  const dateInput = document.getElementById('todo-date-input') as HTMLInputElement;
  
  const todoName = nameInput.value.trim();
  const categoryId = categoryInput.value;
  const status = statusInput.value as 'pending' | 'in-progress' | 'completed';
  const dueDate = new Date(dateInput.value);
  
  if (todoName && categoryId) {
    createTodo({ name: todoName, status, categoryId, dueDate });
    todoViewer.renderTodos();
    closeAddTodoModal();
  }
});

document.getElementById('cancel-todo')!.addEventListener('click', closeAddTodoModal);

// Function to populate categories dropdown
function updateCategoriesDropdown() {
  const dropdown = document.querySelector<HTMLSelectElement>("#categoriesDropdown")!;
  const categories = getAllCategories();

  // Clear existing options (except the first placeholder)
  dropdown.innerHTML = '<option value="" disabled selected>Select a category</option>';

  // Add each category as an option
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    dropdown.appendChild(option);
  });
}

// Function to populate todo category dropdown in the modal
function updateTodoCategoryDropdown() {
  const dropdown = document.getElementById('todo-category-input') as HTMLSelectElement;
  const categories = getAllCategories();

  // Clear existing options
  dropdown.innerHTML = '<option value="" disabled selected>Select category</option>';

  // Add each category as an option
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    dropdown.appendChild(option);
  });
}

// Todo Viewer Component
class TodoViewer {
  private todoListElement: HTMLElement;

  constructor() {
    this.todoListElement = document.getElementById('todo-list')!;
    this.initialize();
  }

  private initialize(): void {
    this.renderTodos();
  }

  public renderTodos(): void {
    const todos = getAllTodos();
    const categories = getAllCategories();

    // Create a map for quick category lookup
    const categoryMap = new Map<string, string>();
    categories.forEach(category => {
      categoryMap.set(category.id, category.name);
    });

    // Clear existing content
    this.todoListElement.innerHTML = '';

    if (todos.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Render each todo
    todos.forEach(todo => {
      const todoElement = this.createTodoElement(todo, categoryMap);
      this.todoListElement.appendChild(todoElement);
    });
  }

  private renderEmptyState(): void {
    const emptyState = document.createElement('div');
    emptyState.className = 'text-center py-12';
    emptyState.innerHTML = `
      <div class="text-gray-400 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No todos yet</h3>
      <p class="text-gray-500">Get started by adding your first todo item!</p>
    `;
    this.todoListElement.appendChild(emptyState);
  }

  private createTodoElement(todo: any, categoryMap: Map<string, string>): HTMLElement {
    const todoElement = document.createElement('div');
    todoElement.className = 'bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow';

    const statusColor = this.getStatusColor(todo.status);
    const categoryName = categoryMap.get(todo.categoryId) || 'Unknown Category';
    const dueDateFormatted = this.formatDate(todo.dueDate);

    todoElement.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center space-x-3 mb-2">
            <h3 class="text-lg font-semibold text-gray-900">${this.escapeHtml(todo.name)}</h3>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
              ${this.capitalizeFirst(todo.status)}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span class="font-medium">Category:</span> ${this.escapeHtml(categoryName)}
            </div>
            <div>
              <span class="font-medium">Due Date:</span> ${dueDateFormatted}
            </div>
          </div>

          <div class="mt-2 text-xs text-gray-500">
            ID: ${todo.id}
          </div>
        </div>

        <div class="flex space-x-2 ml-4">
          <button class="edit-btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors" data-todo-id="${todo.id}">
            Edit
          </button>
          <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors" data-todo-id="${todo.id}">
            Delete
          </button>
        </div>
      </div>
    `;

    // Add event listeners for the buttons
    const editBtn = todoElement.querySelector('.edit-btn') as HTMLButtonElement;
    const deleteBtn = todoElement.querySelector('.delete-btn') as HTMLButtonElement;

    editBtn.addEventListener('click', () => this.handleEditTodo(todo.id));
    deleteBtn.addEventListener('click', () => this.handleDeleteTodo(todo.id));

    return todoElement;
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  private formatDate(date: Date): string {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private handleEditTodo(todoId: string): void {
    const newName = prompt('Enter new name for the todo:');
    if (newName && newName.trim()) {
      const success = editTodo(todoId, { name: newName.trim() });
      if (success) {
        this.renderTodos(); // Refresh the view
        alert('Todo updated successfully!');
      } else {
        alert('Todo not found!');
      }
    }
  }

  private handleDeleteTodo(todoId: string): void {
    if (confirm('Are you sure you want to delete this todo?')) {
      const success = deleteTodo(todoId);
      if (success) {
        this.renderTodos(); // Refresh the view
        alert('Todo deleted successfully!');
      } else {
        alert('Todo not found!');
      }
    }
  }
}

// Initialize the todo viewer
const todoViewer = new TodoViewer();