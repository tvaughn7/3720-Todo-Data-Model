import './style.css'

import { addCategory, createTodo, deleteCategory, deleteTodo, getAllCategories, getAllTodos, editTodo } from './todoModel.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Welcome to my Todo App!</h1>
    <button id="add-category" type="button">Add a Category</button>
    <button id="add-todo" type="button">Add a Todo</button>
    <button id="delete-category" type="button">Delete a Category</button>
    <button id="delete-todo" type="button">Delete a Todo</button>
    <br><br>
    <select id="categoriesDropdown">
      <option value="" disabled selected>Select a category</option>
    </select>

  <div>
  <button id="edit-todo" type="button">Edit a Todo</button>
  </div>
`

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

document.querySelector<HTMLButtonElement>('#add-category')!.onclick = () => {
  const categoryName = prompt('Enter category name:')
  if (categoryName) {
    const newCategory = addCategory(categoryName)
    updateCategoriesDropdown(); // Update the dropdown after adding a new category
    alert(`Category "${newCategory.name}" added!`)
    }
  }

  // Make similar onclick handlers for other buttons

document.querySelector<HTMLButtonElement>("#add-todo")!.onclick = () => {
  const todoName = prompt("Enter todo name:")
  const newCategory = addCategory("Default Category")
  
  if (todoName && newCategory) {
    const dueDate = new Date("2025-09-18")
    const newTodo = createTodo({ name: todoName, status: "pending", categoryId: newCategory.id, dueDate })
    alert(`Todo added with ID: ${newTodo.id}, name: ${newTodo.name}, categoryId: ${newTodo.categoryId}, dueDate: ${newTodo.dueDate}`)
  }
}

document.querySelector<HTMLButtonElement>("#delete-category")!.onclick = () => {
  const categoryId = prompt("Enter category ID to delete:")
  if (categoryId) {
    const success = deleteCategory(categoryId)
    alert(success ? `Category with ID ${categoryId} deleted.` : `Category with ID ${categoryId} not found.`)
  }
}

document.querySelector<HTMLButtonElement>("#delete-todo")!.onclick = () => {
  const todoId = prompt("Enter todo ID to delete:")
  if (todoId) {
    const success = deleteTodo(todoId)
    alert(success ? `Todo with ID ${todoId} deleted.` : `Todo with ID ${todoId} not found.`)
  }
}

document.querySelector<HTMLButtonElement>("#edit-todo")!.onclick = () => {
  const allTodos = getAllTodos();
  for (const todo of allTodos) {
    console.log(`Todo ID: ${todo.id}, Name: ${todo.name}, Status: ${todo.status}, Category ID: ${todo.categoryId}, Due Date: ${todo.dueDate}`);
  } 
  const todoId = prompt("Enter todo ID to edit:")
  if (todoId) {
    const success = editTodo(todoId, { name: "Updated Todo Name", status: "in-progress" })
    
    alert(success ? `Todo with ID ${todoId} has been edited` : `Todo with ID ${todoId} not found.`)
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