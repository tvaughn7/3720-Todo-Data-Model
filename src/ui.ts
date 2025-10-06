// UI Component for Todo App
import { addCategory, createTodo, deleteCategory, deleteTodo, getAllCategories, getAllTodos, editTodo, type Todo } from './todoModel.ts'

export class TodoUI {
  private app: HTMLElement;
  
  constructor(appElement: HTMLElement) {
    this.app = appElement;
    this.render();
    this.attachEventListeners();
  }

  private render(): void {
    this.app.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <!-- Header -->
        <header class="bg-white shadow-md">
          <div class="max-w-7xl mx-auto px-4 py-6">
            <h1 class="text-4xl font-bold text-gray-800">📝 Todo App</h1>
            <p class="text-gray-600 mt-2">Organize your tasks efficiently</p>
          </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 py-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left Sidebar - Actions -->
            <div class="lg:col-span-1 space-y-6">
              
              <!-- Add Todo Card -->
              <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">➕ Add Todo</h2>
                <form id="add-todo-form" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
                    <input 
                      type="text" 
                      id="todo-name" 
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Enter task name..."
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select 
                      id="todo-category" 
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    >
                      <option value="" disabled selected>Select category</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select 
                      id="todo-status" 
                      required
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
                      id="todo-date" 
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <button 
                    type="submit" 
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-md"
                  >
                    Add Todo
                  </button>
                </form>
              </div>

              <!-- Category Management Card -->
              <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">🏷️ Categories</h2>
                
                <form id="add-category-form" class="mb-4">
                  <div class="flex gap-2">
                    <input 
                      type="text" 
                      id="category-name" 
                      required
                      class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      placeholder="New category..."
                    />
                    <button 
                      type="submit" 
                      class="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </form>

                <div id="category-list" class="space-y-2 max-h-60 overflow-y-auto">
                  <!-- Categories will be rendered here -->
                </div>
              </div>

              <!-- Filter Options -->
              <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">🔍 Filter</h2>
                <div class="space-y-3">
                  <button data-filter="all" class="filter-btn w-full text-left px-4 py-2 rounded-lg bg-blue-100 text-blue-800 font-medium transition-colors hover:bg-blue-200">
                    All Tasks
                  </button>
                  <button data-filter="pending" class="filter-btn w-full text-left px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium transition-colors hover:bg-gray-200">
                    Pending
                  </button>
                  <button data-filter="in-progress" class="filter-btn w-full text-left px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium transition-colors hover:bg-gray-200">
                    In Progress
                  </button>
                  <button data-filter="completed" class="filter-btn w-full text-left px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium transition-colors hover:bg-gray-200">
                    Completed
                  </button>
                </div>
              </div>
            </div>

            <!-- Right Side - Todo List -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-2xl font-semibold text-gray-800">📋 Your Tasks</h2>
                  <div class="text-sm text-gray-600">
                    <span id="todo-count">0</span> tasks
                  </div>
                </div>
                
                <div id="todo-list" class="space-y-3">
                  <!-- Todos will be rendered here -->
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- Edit Modal -->
        <div id="edit-modal" class="fixed inset-0 bg-black bg-opacity-50 modal-backdrop z-50 hidden items-center justify-center">
          <div class="modal-content bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Edit Todo</h2>
            <form id="edit-todo-form" class="space-y-4">
              <input type="hidden" id="edit-todo-id" />
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
                <input 
                  type="text" 
                  id="edit-todo-name" 
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select 
                  id="edit-todo-category" 
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  id="edit-todo-status" 
                  required
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
                  id="edit-todo-date" 
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div class="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button 
                  type="button" 
                  id="cancel-edit" 
                  class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    // Add Todo Form
    const addTodoForm = document.getElementById('add-todo-form') as HTMLFormElement;
    addTodoForm?.addEventListener('submit', (e) => this.handleAddTodo(e));

    // Add Category Form
    const addCategoryForm = document.getElementById('add-category-form') as HTMLFormElement;
    addCategoryForm?.addEventListener('submit', (e) => this.handleAddCategory(e));

    // Edit Todo Form
    const editTodoForm = document.getElementById('edit-todo-form') as HTMLFormElement;
    editTodoForm?.addEventListener('submit', (e) => this.handleEditTodo(e));

    // Cancel Edit Button
    const cancelEditBtn = document.getElementById('cancel-edit');
    cancelEditBtn?.addEventListener('click', () => this.closeEditModal());

    // Filter Buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleFilter(e));
    });

    // Initial render
    this.updateCategoryDropdowns();
    this.renderCategories();
    this.renderTodos();
  }

  private handleAddTodo(e: Event): void {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    const name = (document.getElementById('todo-name') as HTMLInputElement).value;
    const categoryId = (document.getElementById('todo-category') as HTMLSelectElement).value;
    const status = (document.getElementById('todo-status') as HTMLSelectElement).value as 'pending' | 'in-progress' | 'completed';
    const dueDate = new Date((document.getElementById('todo-date') as HTMLInputElement).value);

    createTodo({ name, categoryId, status, dueDate });
    form.reset();
    this.renderTodos();
    this.showNotification('Todo added successfully!', 'success');
  }

  private handleAddCategory(e: Event): void {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (document.getElementById('category-name') as HTMLInputElement).value;

    if (name.trim()) {
      addCategory(name.trim());
      form.reset();
      this.renderCategories();
      this.updateCategoryDropdowns();
      this.showNotification('Category added successfully!', 'success');
    }
  }

  private handleEditTodo(e: Event): void {
    e.preventDefault();
    
    const id = (document.getElementById('edit-todo-id') as HTMLInputElement).value;
    const name = (document.getElementById('edit-todo-name') as HTMLInputElement).value;
    const categoryId = (document.getElementById('edit-todo-category') as HTMLSelectElement).value;
    const status = (document.getElementById('edit-todo-status') as HTMLSelectElement).value as 'pending' | 'in-progress' | 'completed';
    const dueDate = new Date((document.getElementById('edit-todo-date') as HTMLInputElement).value);

    const result = editTodo(id, { name, categoryId, status, dueDate });
    
    if (result) {
      this.closeEditModal();
      this.renderTodos();
      this.showNotification('Todo updated successfully!', 'success');
    } else {
      this.showNotification('Failed to update todo', 'error');
    }
  }

  public openEditModal(todo: Todo): void {
    (document.getElementById('edit-todo-id') as HTMLInputElement).value = todo.id;
    (document.getElementById('edit-todo-name') as HTMLInputElement).value = todo.name;
    (document.getElementById('edit-todo-category') as HTMLSelectElement).value = todo.categoryId;
    (document.getElementById('edit-todo-status') as HTMLSelectElement).value = todo.status;
    
    const dateStr = todo.dueDate instanceof Date 
      ? todo.dueDate.toISOString().split('T')[0]
      : new Date(todo.dueDate).toISOString().split('T')[0];
    (document.getElementById('edit-todo-date') as HTMLInputElement).value = dateStr;

    this.updateCategoryDropdowns();
    const modal = document.getElementById('edit-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  private closeEditModal(): void {
    const modal = document.getElementById('edit-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  public handleDeleteTodo(id: string): void {
    if (confirm('Are you sure you want to delete this todo?')) {
      const success = deleteTodo(id);
      if (success) {
        this.renderTodos();
        this.showNotification('Todo deleted successfully!', 'success');
      }
    }
  }

  public handleDeleteCategory(id: string): void {
    if (confirm('Are you sure you want to delete this category?')) {
      const success = deleteCategory(id);
      if (success) {
        this.renderCategories();
        this.updateCategoryDropdowns();
        this.renderTodos();
        this.showNotification('Category deleted successfully!', 'success');
      }
    }
  }

  private currentFilter: string = 'all';

  private handleFilter(e: Event): void {
    const btn = e.target as HTMLButtonElement;
    const filter = btn.dataset.filter || 'all';
    this.currentFilter = filter;

    // Update button styles
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('bg-blue-100', 'text-blue-800');
      b.classList.add('bg-gray-100', 'text-gray-700');
    });
    btn.classList.remove('bg-gray-100', 'text-gray-700');
    btn.classList.add('bg-blue-100', 'text-blue-800');

    this.renderTodos();
  }

  private updateCategoryDropdowns(): void {
    const categories = getAllCategories();
    
    const todoCategory = document.getElementById('todo-category') as HTMLSelectElement;
    const editCategory = document.getElementById('edit-todo-category') as HTMLSelectElement;
    
    const optionsHTML = categories.map(cat => 
      `<option value="${cat.id}">${this.escapeHtml(cat.name)}</option>`
    ).join('');

    if (todoCategory) {
      const currentValue = todoCategory.value;
      todoCategory.innerHTML = '<option value="" disabled selected>Select category</option>' + optionsHTML;
      if (currentValue && categories.find(c => c.id === currentValue)) {
        todoCategory.value = currentValue;
      }
    }

    if (editCategory) {
      const currentValue = editCategory.value;
      editCategory.innerHTML = optionsHTML;
      if (currentValue && categories.find(c => c.id === currentValue)) {
        editCategory.value = currentValue;
      }
    }
  }

  private renderCategories(): void {
    const categories = getAllCategories();
    const categoryList = document.getElementById('category-list');
    
    if (!categoryList) return;

    if (categories.length === 0) {
      categoryList.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No categories yet</p>';
      return;
    }

    categoryList.innerHTML = categories.map(category => `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <span class="text-gray-800 font-medium">${this.escapeHtml(category.name)}</span>
        <button 
          class="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
          onclick="window.todoUI.handleDeleteCategory('${category.id}')"
        >
          Delete
        </button>
      </div>
    `).join('');
  }

  private renderTodos(): void {
    let todos = getAllTodos();
    const categories = getAllCategories();
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    // Apply filter
    if (this.currentFilter !== 'all') {
      todos = todos.filter(todo => todo.status === this.currentFilter);
    }

    const todoList = document.getElementById('todo-list');
    const todoCount = document.getElementById('todo-count');
    
    if (!todoList) return;

    if (todoCount) {
      todoCount.textContent = todos.length.toString();
    }

    if (todos.length === 0) {
      todoList.innerHTML = `
        <div class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No todos found</h3>
          <p class="text-gray-500">${this.currentFilter === 'all' ? 'Start by adding a new task!' : `No ${this.currentFilter} tasks`}</p>
        </div>
      `;
      return;
    }

    todoList.innerHTML = todos.map(todo => {
      const statusColor = this.getStatusColor(todo.status);
      const categoryName = categoryMap.get(todo.categoryId) || 'Unknown';
      const formattedDate = this.formatDate(todo.dueDate);

      return `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-semibold text-gray-900">${this.escapeHtml(todo.name)}</h3>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
                  ${this.capitalizeFirst(todo.status)}
                </span>
              </div>
              
              <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>${this.escapeHtml(categoryName)}</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>${formattedDate}</span>
                </div>
              </div>
            </div>
            
            <div class="flex gap-2 ml-4">
              <button 
                class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                onclick='window.todoUI.openEditModal(${JSON.stringify(todo).replace(/'/g, "&#39;")})'
              >
                Edit
              </button>
              <button 
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                onclick="window.todoUI.handleDeleteTodo('${todo.id}')"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
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
      const d = date instanceof Date ? date : new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  }

  private capitalizeFirst(str: string): string {
    return str.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}
