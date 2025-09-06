export interface Category {
    id: string; // unique identifier
    name: string; // name of the category
}

export interface Todo {
    readonly id: string; // unique identifier
    readonly name: string; // name of the todo
    readonly status: 'pending' | 'in-progress' | 'completed'; // status of the todo
    readonly categoryId: string; // category of the todo
    readonly dueDate: Date; // due date of the todo
}

const store = {
    todos: [] as Todo[],
    categories: [] as Category[],
}



// Function to create a new todo
export function createTodo(input: Todo): Todo {
    const newTodo = { 
        id: generateID(),
        name: input.name,
        status: input.status,
        categoryId: input.categoryId,
        dueDate: typeof input.dueDate === 'string' ? new Date(input.dueDate) : input.dueDate
    };
    store.todos = [...store.todos, newTodo];
    return newTodo;
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
    return newCategory;
}

export function deleteTodo(id: string): boolean {
    const originalLength = store.todos.length;
    store.todos = store.todos.filter(todo => todo.id !== id);
    return store.todos.length < originalLength; // returns true if a todo was deleted
}

