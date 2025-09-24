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

const store = {
    todos: [] as Todo[],
    categories: [] as Category[],
}



export function createTodo(input: TodoInput): Todo {
    const newTodo = { 
        id: generateID(),
        name: input.name,
        status: input.status,
        categoryId: input.categoryId,
        dueDate: typeof input.dueDate === 'string' ? new Date(input.dueDate) : input.dueDate
    };

    // Create a new array with the added todo
    store.todos = [...store.todos, newTodo];
    console.log('Todo created:', newTodo);
    return newTodo;
}

export function editTodo(id: string, updates: Partial<Pick<Todo, 'name' | 'status' | 'categoryId' | 'dueDate'>>): Todo | undefined {
    const todoIndex = store.todos.findIndex(todo => todo.id === id);
    
    if (todoIndex === -1) {
        console.warn(`Todo with ID ${id} not found.`);
        return undefined; // Todo not found
    }
    if (updates.name !== undefined) {
         const newTodoName = updates.name.trim();
         if (!newTodoName) {
             console.warn('Todo name cannot be empty.');
             return undefined; // Invalid name
         }
         store.todos[todoIndex].name = newTodoName;
    }
if (updates.status !== undefined) {
    store.todos[todoIndex].status = updates.status;
}
    if (updates.categoryId !== undefined) {
        store.todos[todoIndex].categoryId = updates.categoryId;
    }
    if (updates.dueDate !== undefined) {
        store.todos[todoIndex].dueDate = updates.dueDate;
    }
    return store.todos[todoIndex];
}

// Helper function to generate a unique ID
function generateID(): string {
    const now=Date.now().toString(36);
    const random=Math.random().toString(36).substring(2,8);
    return now + random;
}

// function to create a new category
export function addCategory(name: string): Category {
    const newCategory = {
        id: generateID(),
        name
    };
    store.categories = [...store.categories, newCategory];
    console.log(store.categories);
    return newCategory;
}

export function deleteTodo(id: string): boolean {
    const originalLength = store.todos.length;
    store.todos = store.todos.filter(todo => todo.id !== id);
    console.log(store.todos);
    return store.todos.length < originalLength; // returns true if a todo was deleted
}

export function deleteCategory(id: string): boolean {
    const originalLength = store.categories.length;
    // Create a new array excluding the category with the given id
    store.categories = store.categories.filter(category => category.id !== id);
    console.log(store.categories);
    return store.categories.length < originalLength; // returns true if a category was deleted
}

export function getAllCategories(): Category[] {
    return [...store.categories]; 
}

export function getAllTodos(): Todo[] {
    return [...store.todos]; 
}
