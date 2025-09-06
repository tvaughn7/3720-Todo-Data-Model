/* // Todo name
// Status
// ID
// Category
// Due Date */

export interface Todo {
    readonly id: string; // unique identifier
    readonly name: string; // name of the todo
    readonly status: 'pending' | 'in-progress' | 'completed'; // status of the todo
    readonly categoryId: string; // category of the todo
    readonly dueDate: Date; // due date of the todo
}

// Example usage:
const exampleTodo: Todo = {
    id: '1',
    name: 'Finish TypeScript project',
    status: 'in-progress',
    categoryId: 'work',
    dueDate: new Date('2023-10-01'),
};

// Helper function to generate a unique ID
function generateID(): string {
    return Math.random().toString(36).substr(2, 9);
}

// Function to create a new todo
export function createTodo(input: Omit<Todo, 'id' | 'dueDate'> & { dueDate: Date | string }): Todo {
    return { 
        id: generateID(),
        name: input.name,
        status: input.status,
        categoryId: input.categoryId,
        dueDate: typeof input.dueDate === 'string' ? new Date(input.dueDate) : input.dueDate
    };
}
