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
  </div>
`

// Your original button event handlers
document.querySelector<HTMLButtonElement>('#add-category')!.onclick = () => {
  const categoryName = prompt('Enter category name:')
  if (categoryName) {
    const newCategory = addCategory(categoryName)
    updateCategoriesDropdown(); // Update the dropdown after adding a new category
    alert(`Category "${newCategory.name}" added!`)
  }
}

document.querySelector<HTMLButtonElement>("#add-todo")!.onclick = () => {
  const todoName = prompt("Enter todo name:")
  const newCategory = addCategory("Default Category")

  if (todoName && newCategory) {
    const dueDate = new Date("2025-09-18")
    const newTodo = createTodo({ name: todoName, status: "pending", categoryId: newCategory.id, dueDate })
    alert(`Todo added with ID: ${newTodo.id}, name: ${newTodo.name}, categoryId: ${newTodo.categoryId}, dueDate: ${newTodo.dueDate}`)
    todoViewer.renderTodos(); // Refresh the todo view
  }
}

document.querySelector<HTMLButtonElement>("#delete-category")!.onclick = () => {
  const categoryId = prompt("Enter category ID to delete:")
  if (categoryId) {
    const success = deleteCategory(categoryId)
    alert(success ? `Category with ID ${categoryId} deleted.` : `Category with ID ${categoryId} not found.`)
  }
}

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