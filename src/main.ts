import './style.css'
import { ChatViewer } from './chatViewer'

import { addCategory, createTodo, deleteCategory, deleteTodo, getAllCategories, getAllTodos, editTodo } from './todoModel.ts'

// Simple router to handle page navigation
class AppRouter {
  private currentPage: 'todos' | 'chat' = 'todos'
  private appContainer: HTMLElement
  private todoViewer?: TodoViewer

  constructor() {
    this.appContainer = document.querySelector<HTMLDivElement>('#app')!
    this.initialize()
  }

  private initialize() {
    // Check URL hash for initial page
    const hash = window.location.hash.slice(1)
    if (hash === 'chat') {
      this.currentPage = 'chat'
    }

    this.render()

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.slice(1)
      if (newHash === 'chat' || newHash === 'todos') {
        this.currentPage = newHash
        this.render()
      }
    })
  }

  private render() {
    if (this.currentPage === 'chat') {
      this.renderChatPage()
    } else {
      this.renderTodoPage()
    }
  }

  private renderChatPage() {
    this.appContainer.innerHTML = `
      <div id="nav-bar"></div>
      <div id="chat-container"></div>
    `
    this.renderNavBar()
    new ChatViewer(document.getElementById('chat-container')!)
  }

  private renderTodoPage() {
    this.renderTodoUI()
  }

  private renderNavBar() {
    const navBar = document.getElementById('nav-bar')!
    const isTodoPage = this.currentPage === 'todos'
    const isChatPage = this.currentPage === 'chat'

    navBar.innerHTML = `
      <nav class="bg-white/90 backdrop-blur-xl shadow-lg border-b border-[#9ca3db]/30 sticky top-0 z-40">
        <div class="max-w-5xl mx-auto px-6">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center space-x-8">
              <h1 class="text-2xl font-black bg-gradient-to-r from-[#454b66] to-[#677db7] bg-clip-text text-transparent">✨ TaskFlow</h1>
              <div class="flex space-x-1 bg-[#9ca3db]/20 p-1 rounded-xl">
                <a
                  href="#todos"
                  class="px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    isTodoPage
                      ? 'bg-[#677db7] text-white shadow-md'
                      : 'text-[#454b66] hover:text-[#191308]'
                  }"
                >
                  📋 Todos
                </a>
                <a
                  href="#chat"
                  class="px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    isChatPage
                      ? 'bg-[#677db7] text-white shadow-md'
                      : 'text-[#454b66] hover:text-[#191308]'
                  }"
                >
                  🤖 AI Chat
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    `
  }

  private renderTodoUI() {
    // Render the complete HTML structure at once
    this.appContainer.innerHTML = `
  <div id="nav-bar"></div>
  <div class="min-h-screen py-10">
    <div class="max-w-5xl mx-auto px-6">
      <!-- Hero Header -->
      <div class="text-center mb-10">
        <h1 class="text-5xl font-black text-[#191308] mb-3 tracking-tight">Todo Manager</h1>
        <p class="text-[#454b66] text-lg">Organize your tasks efficiently ✨</p>
      </div>

      <!-- Quick Actions Bar -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-[#9ca3db]/30 p-6 mb-8">
        <div class="flex flex-wrap items-center gap-4">
          <button id="add-todo" type="button" class="inline-flex items-center gap-2 bg-gradient-to-r from-[#677db7] to-[#9ca3db] hover:from-[#5a6fa3] hover:to-[#8b93c9] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-[#677db7]/25 hover:shadow-xl hover:-translate-y-0.5">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            New Task
          </button>
          <button id="add-category" type="button" class="inline-flex items-center gap-2 bg-white hover:bg-[#9ca3db]/10 text-[#454b66] hover:text-[#191308] font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-[#9ca3db]/50 shadow-sm hover:shadow-md hover:-translate-y-0.5">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
            Add Category
          </button>
          <button id="delete-category" type="button" class="inline-flex items-center gap-2 bg-white hover:bg-red-50 text-[#454b66] hover:text-red-600 font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-[#9ca3db]/50 hover:border-red-300 shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Delete Category
          </button>
          <div class="flex-1 min-w-[200px]">
            <select id="categoriesDropdown" class="w-full p-3 bg-white border border-[#9ca3db]/50 rounded-xl focus:ring-2 focus:ring-[#677db7]/30 focus:border-[#677db7] transition-all text-[#454b66]">
              <option value="" disabled selected>🏷️ Filter by category</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Todo List Section -->
      <div id="todo-viewer" class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-[#9ca3db]/30 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-[#191308]">📝 Your Tasks</h2>
          <span class="text-sm text-[#454b66]" id="task-count"></span>
        </div>
        <div id="todo-list" class="space-y-3">
          <!-- Todos will be rendered here -->
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div id="add-category-modal" class="fixed inset-0 bg-[#191308]/50 backdrop-blur-sm z-50 hidden items-center justify-center">
      <div class="bg-white border border-[#9ca3db]/30 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-[#9ca3db]/20 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-[#677db7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
          </div>
          <h2 class="text-2xl font-bold text-[#191308]">New Category</h2>
        </div>
        <form id="add-category-form" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-[#454b66] mb-2">Category Name</label>
            <input 
              type="text" 
              id="category-name-input" 
              required
              class="w-full px-4 py-3 bg-[#9ca3db]/10 border border-[#9ca3db]/30 rounded-xl focus:ring-2 focus:ring-[#677db7]/30 focus:border-[#677db7] outline-none transition-all text-[#191308] placeholder-[#454b66]/50"
              placeholder="e.g., Work, Personal, Shopping..."
            />
          </div>
          <div class="flex gap-3 pt-2">
            <button 
              type="button" 
              id="cancel-category" 
              class="flex-1 bg-[#9ca3db]/20 hover:bg-[#9ca3db]/30 text-[#454b66] font-semibold py-3 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="flex-1 bg-gradient-to-r from-[#677db7] to-[#9ca3db] hover:from-[#5a6fa3] hover:to-[#8b93c9] text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-[#677db7]/25"
            >
              Create Category
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Todo Modal -->
    <div id="add-todo-modal" class="fixed inset-0 bg-[#191308]/50 backdrop-blur-sm z-50 hidden items-center justify-center">
      <div class="bg-white border border-[#9ca3db]/30 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-gradient-to-br from-[#677db7] to-[#9ca3db] rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          </div>
          <h2 class="text-2xl font-bold text-[#191308]">New Task</h2>
        </div>
        <form id="add-todo-form" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-[#454b66] mb-2">Task Name</label>
            <input 
              type="text" 
              id="todo-name-input" 
              required
              class="w-full px-4 py-3 bg-[#9ca3db]/10 border border-[#9ca3db]/30 rounded-xl focus:ring-2 focus:ring-[#677db7]/30 focus:border-[#677db7] outline-none transition-all text-[#191308] placeholder-[#454b66]/50"
              placeholder="What needs to be done?"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-[#454b66] mb-2">Category</label>
              <select 
                id="todo-category-input" 
                required
                class="w-full px-4 py-3 bg-[#9ca3db]/10 border border-[#9ca3db]/30 rounded-xl focus:ring-2 focus:ring-[#677db7]/30 focus:border-[#677db7] outline-none transition-all text-[#454b66]"
              >
                <option value="" disabled selected>Select</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#454b66] mb-2">Status</label>
              <select 
                id="todo-status-input" 
                class="w-full px-4 py-3 bg-[#9ca3db]/10 border border-[#9ca3db]/30 rounded-xl focus:ring-2 focus:ring-[#677db7]/30 focus:border-[#677db7] outline-none transition-all text-[#454b66]"
              >
                <option value="pending">⏳ Pending</option>
                <option value="in-progress">🔄 In Progress</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-[#454b66] mb-2">Due Date</label>
            <input 
              type="date" 
              id="todo-date-input" 
              required
              class="w-full px-4 py-3 bg-[#9ca3db]/10 border border-[#9ca3db]/30 rounded-xl focus:ring-2 focus:ring-[#677db7]/30 focus:border-[#677db7] outline-none transition-all text-[#454b66]"
            />
          </div>
          <div class="flex gap-3 pt-2">
            <button 
              type="button" 
              id="cancel-todo" 
              class="flex-1 bg-[#9ca3db]/20 hover:bg-[#9ca3db]/30 text-[#454b66] font-semibold py-3 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="flex-1 bg-gradient-to-r from-[#677db7] to-[#9ca3db] hover:from-[#5a6fa3] hover:to-[#8b93c9] text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-[#677db7]/25"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
`
    // NOW render the nav bar after all HTML is in place
    this.renderNavBar()

    // Initialize todo functionality after HTML is rendered
    this.initializeTodoHandlers()
  }

  private initializeTodoHandlers() {
    // Initialize categories dropdown
    updateCategoriesDropdown();

    // Your original button event handlers
    document.querySelector<HTMLButtonElement>('#add-category')!.onclick = () => {
      openAddCategoryModal();
    }

    document.querySelector<HTMLButtonElement>("#add-todo")!.onclick = () => {
      openAddTodoModal();
    }

    document.querySelector<HTMLButtonElement>("#delete-category")!.onclick = async () => {
      const categoryId = prompt("Enter category ID to delete:")
      if (categoryId) {
        try {
          await deleteCategory(categoryId)
          alert(`Category with ID ${categoryId} deleted.`)
          updateCategoriesDropdown()
        } catch (error) {
          alert(`Failed to delete category: ${error}`)
        }
      }
    }

    // Initialize the todo viewer
    this.todoViewer = new TodoViewer();

    // Add Category Form Handler
    document.getElementById('add-category-form')!.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('category-name-input') as HTMLInputElement;
      const categoryName = nameInput.value.trim();
      
      if (categoryName) {
        try {
          await addCategory(categoryName);
          await updateCategoriesDropdown();
          closeAddCategoryModal();
        } catch (error) {
          alert(`Failed to add category: ${error}`);
        }
      }
    });

    document.getElementById('cancel-category')!.addEventListener('click', closeAddCategoryModal);

    // Add Todo Form Handler
    document.getElementById('add-todo-form')!.addEventListener('submit', async (e) => {
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
        try {
          await createTodo({ name: todoName, status, categoryId, dueDate });
          await this.todoViewer?.renderTodos();
          closeAddTodoModal();
        } catch (error) {
          alert(`Failed to create todo: ${error}`);
        }
      }
    });

    document.getElementById('cancel-todo')!.addEventListener('click', closeAddTodoModal);
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

// Function to populate categories dropdown
async function updateCategoriesDropdown() {
  const dropdown = document.querySelector<HTMLSelectElement>("#categoriesDropdown")!;
  const categories = await getAllCategories();

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
async function updateTodoCategoryDropdown() {
  const dropdown = document.getElementById('todo-category-input') as HTMLSelectElement;
  const categories = await getAllCategories();

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

  private async initialize(): Promise<void> {
    await this.renderTodos();
  }

  public async renderTodos(): Promise<void> {
    const todos = await getAllTodos();
    const categories = await getAllCategories();

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
    emptyState.className = 'text-center py-16';
    emptyState.innerHTML = `
      <div class="w-20 h-20 bg-gradient-to-br from-[#9ca3db]/30 to-[#677db7]/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <span class="text-4xl">📝</span>
      </div>
      <h3 class="text-xl font-bold text-[#191308] mb-2">No tasks yet</h3>
      <p class="text-[#454b66] mb-6">Create your first task to get started!</p>
      <button onclick="document.getElementById('add-todo').click()" class="inline-flex items-center gap-2 bg-gradient-to-r from-[#677db7] to-[#9ca3db] hover:from-[#5a6fa3] hover:to-[#8b93c9] text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-[#677db7]/25">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Add your first task
      </button>
    `;
    this.todoListElement.appendChild(emptyState);
  }

  private createTodoElement(todo: any, categoryMap: Map<string, string>): HTMLElement {
    const todoElement = document.createElement('div');
    todoElement.className = 'group bg-white hover:bg-[#9ca3db]/10 border border-[#9ca3db]/20 hover:border-[#677db7]/50 rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-[#677db7]/10';

    const statusConfig = this.getStatusConfig(todo.status);
    const categoryName = categoryMap.get(todo.categoryId) || 'Unknown Category';
    const dueDateFormatted = this.formatDate(todo.dueDate);
    const isOverdue = new Date(todo.dueDate) < new Date() && todo.status !== 'completed';

    todoElement.innerHTML = `
      <div class="flex items-center gap-4">
        <!-- Status Indicator -->
        <div class="flex-shrink-0">
          <div class="w-10 h-10 rounded-xl ${statusConfig.bg} flex items-center justify-center">
            <span class="text-lg">${statusConfig.icon}</span>
          </div>
        </div>
        
        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-base font-semibold text-[#191308] truncate ${todo.status === 'completed' ? 'line-through text-[#9ca3db]' : ''}">${this.escapeHtml(todo.name)}</h3>
            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusConfig.badge}">
              ${statusConfig.label}
            </span>
          </div>
          <div class="flex items-center gap-4 text-sm text-[#454b66]">
            <span class="inline-flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
              ${this.escapeHtml(categoryName)}
            </span>
            <span class="inline-flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              ${dueDateFormatted}${isOverdue ? ' (Overdue)' : ''}
            </span>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button class="edit-btn p-2 text-[#454b66] hover:text-[#677db7] hover:bg-[#9ca3db]/20 rounded-lg transition-colors" data-todo-id="${todo.id}" title="Edit">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button class="delete-btn p-2 text-[#454b66] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" data-todo-id="${todo.id}" title="Delete">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
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

  private getStatusConfig(status: string): { bg: string; badge: string; icon: string; label: string } {
    switch (status) {
      case 'completed':
        return { bg: 'bg-emerald-100', badge: 'bg-emerald-100 text-emerald-700', icon: '✅', label: 'Done' };
      case 'in-progress':
        return { bg: 'bg-amber-100', badge: 'bg-amber-100 text-amber-700', icon: '🔄', label: 'In Progress' };
      case 'pending':
      default:
        return { bg: 'bg-[#9ca3db]/30', badge: 'bg-[#9ca3db]/30 text-[#454b66]', icon: '⏳', label: 'Pending' };
    }
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

  private async handleEditTodo(todoId: string): Promise<void> {
    const newName = prompt('Enter new name for the todo:');
    if (newName && newName.trim()) {
      try {
        await editTodo(todoId, { name: newName.trim() });
        await this.renderTodos(); // Refresh the view
        alert('Todo updated successfully!');
      } catch (error) {
        alert(`Failed to update todo: ${error}`);
      }
    }
  }

  private async handleDeleteTodo(todoId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this todo?')) {
      try {
        await deleteTodo(todoId);
        await this.renderTodos(); // Refresh the view
        alert('Todo deleted successfully!');
      } catch (error) {
        alert(`Failed to delete todo: ${error}`);
      }
    }
  }
}

// Initialize the app router
new AppRouter()
