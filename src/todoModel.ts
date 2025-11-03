// Import API functions
import {
  fetchAllTodos,
  createTodoAPI,
  updateTodoAPI,
  deleteTodoAPI,
  clearCompletedTodosAPI,
  fetchAllCategories,
  createCategoryAPI,
  deleteCategoryAPI,
} from './apiService'

export interface Category {
    id: string; // unique identifier
    name: string; // name of the category
}

export interface Todo {
    id: string; // unique identifier
    name: string; // name of the todo
    status: 'pending' | 'in-progress' | 'completed'; // status of the todo
    categoryId: string; // category of the todo
    dueDate: Date; // due date of the todo
}

export interface TodoInput {
    name: string;
    status: 'pending' | 'in-progress' | 'completed';
    categoryId: string;
    dueDate: Date;
}

// Replace store functions with API calls
export async function getAllTodos(): Promise<Todo[]> {
  return fetchAllTodos()
}

export async function createTodo(input: TodoInput): Promise<Todo> {
  return createTodoAPI(input)
}

export async function editTodo(
  id: string,
  updates: Partial<Pick<Todo, 'name' | 'status' | 'categoryId' | 'dueDate'>>
): Promise<Todo> {
  return updateTodoAPI(id, updates)
}

export async function deleteTodo(id: string): Promise<void> {
  return deleteTodoAPI(id)
}

export async function clearCompletedTodos(): Promise<number> {
  const result = await clearCompletedTodosAPI()
  return result.deletedCount
}

export async function getAllCategories(): Promise<Category[]> {
  return fetchAllCategories()
}

export async function addCategory(name: string): Promise<Category> {
  return createCategoryAPI(name)
}

export async function deleteCategory(id: string): Promise<void> {
  return deleteCategoryAPI(id)
}
