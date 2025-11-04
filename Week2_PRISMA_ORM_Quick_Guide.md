# Week 2: Prisma ORM - Quick Guide 🚀

> **Goal:** Replace in-memory storage with Prisma ORM to prepare for SQLite database integration

---

## 📚 Table of Contents
1. [What is Prisma?](#what-is-prisma)
2. [Installation](#installation)
3. [Schema Definition](#schema-definition)
4. [Prisma Client Setup](#prisma-client-setup)
5. [Update Code](#update-code)
6. [Common Commands](#common-commands)
7. [Checklist](#checklist)

---

## What is Prisma?

Prisma is a next-generation ORM that provides:

| Feature | Benefit |
|---------|---------|
| 🛡️ **Type Safety** | Auto-generated TypeScript types |
| 🎯 **Intuitive API** | No SQL required - use TypeScript |
| 📝 **Schema-First** | Single source of truth |
| 🔄 **Migrations** | Version control for database |
| 🌍 **Database Agnostic** | Works with SQLite, PostgreSQL, MySQL, etc. |

---

## Installation

### Step 1: Install Packages

```bash
npm install --save-dev prisma
npm install @prisma/client dotenv
```

### Step 2: Initialize Prisma

```bash
npx prisma init --datasource-provider sqlite
```

This creates:
- `prisma/schema.prisma` - Your database schema
- `.env` - Database connection URL

### Step 3: Update .gitignore

```gitignore
.env
*.db
*.db-journal
```

---

## Schema Definition

### File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ============================================
// MODELS
// ============================================

model Category {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  todos     Todo[]   // One-to-many relationship
}

model Todo {
  id         String   @id @default(uuid())
  name       String
  status     String   @default("pending")
  categoryId String
  dueDate    DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
}
```

### Schema Highlights

- `@id @default(uuid())` - Auto-generate unique IDs
- `@default(now())` - Auto-set creation timestamp
- `@updatedAt` - Auto-update on changes
- `onDelete: Cascade` - Delete todos when category is deleted

---

## Prisma Client Setup

### File: `server/db/prisma.ts` (NEW FILE)

```bash
mkdir server/db
```

```typescript
// Load environment variables FIRST
import dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'

// Create singleton instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Cleanup on shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma
```

> ⚠️ **IMPORTANT:** `dotenv.config()` MUST be called BEFORE importing `PrismaClient`

---

## Update Code

### File: `server/models/todoStore.ts`

**Key Changes:**
1. Import Prisma client
2. Remove in-memory store
3. Make all functions `async`
4. Use Prisma queries

```typescript
import prisma from '../db/prisma.js'
import { Category, Todo } from '@prisma/client'

export type { Category, Todo }

export interface CreateTodoInput {
  name: string
  status?: "pending" | "in-progress" | "completed"
  categoryId: string
  dueDate: Date | string
}

// ============================================
// TODO OPERATIONS
// ============================================

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  return await prisma.todo.create({
    data: {
      name: input.name,
      status: input.status || "pending",
      categoryId: input.categoryId,
      dueDate: typeof input.dueDate === "string" 
        ? new Date(input.dueDate) 
        : input.dueDate,
    },
  })
}

export async function getAllTodos(): Promise<Todo[]> {
  return await prisma.todo.findMany({
    orderBy: { dueDate: 'asc' }
  })
}

export async function getTodoById(id: string): Promise<Todo | null> {
  return await prisma.todo.findUnique({
    where: { id }
  })
}

export async function updateTodo(
  id: string,
  updates: Partial<Pick<Todo, "name" | "status" | "categoryId" | "dueDate">>
): Promise<Todo | null> {
  try {
    return await prisma.todo.update({
      where: { id },
      data: updates,
    })
  } catch (error) {
    return null
  }
}

export async function deleteTodo(id: string): Promise<boolean> {
  try {
    await prisma.todo.delete({ where: { id } })
    return true
  } catch (error) {
    return false
  }
}

export async function clearCompletedTodos(): Promise<number> {
  const result = await prisma.todo.deleteMany({
    where: { status: 'completed' }
  })
  return result.count
}

// ============================================
// CATEGORY OPERATIONS
// ============================================

export async function addCategory(name: string): Promise<Category> {
  return await prisma.category.create({
    data: { name }
  })
}

export async function getAllCategories(): Promise<Category[]> {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return await prisma.category.findUnique({
    where: { id }
  })
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    await prisma.category.delete({ where: { id } })
    return true
  } catch (error) {
    return false
  }
}

export async function initializeSeedData(): Promise<void> {
  const existingCategories = await prisma.category.count()
  
  if (existingCategories === 0) {
    console.log('Initializing seed data...')
    
    const schoolCategory = await addCategory('School')
    
    await createTodo({
      name: 'Mow the Lawn',
      status: 'pending',
      categoryId: schoolCategory.id,
      dueDate: new Date('2025-10-10')
    })
    
    await createTodo({
      name: 'Finish my homework',
      status: 'in-progress',
      categoryId: schoolCategory.id,
      dueDate: new Date('2025-10-08')
    })
    
    await createTodo({
      name: 'Watch the October 2, 2025 class session video',
      status: 'completed',
      categoryId: schoolCategory.id,
      dueDate: new Date('2025-10-03')
    })
    
    console.log('Seed data initialized!')
  }
}
```

---

### Update Controllers

**File: `server/controllers/todoController.ts`**

Add `async` keyword and `await` all store calls:

```typescript
// Before
export function getTodos(req: Request, res: Response) {
  const todos = getAllTodos()
  res.json(todos)
}

// After
export async function getTodos(req: Request, res: Response) {
  try {
    const todos = await getAllTodos()  // ✅ Added async/await
    res.json(todos)
  } catch (error) {
    console.error('Error fetching todos:', error)
    res.status(500).json({ error: 'Failed to fetch todos' })
  }
}
```

> Apply this pattern to ALL controller functions in `todoController.ts` and `categoryController.ts`

---

## Common Commands

### Generate Prisma Client

```bash
npx prisma generate
# or
npm run prisma:generate
```

### View Database (Prisma Studio)

```bash
npx prisma studio
# or
npm run prisma:studio
```

> ⚠️ Note: Studio won't work until Week 3 when we create the database

### Check Migrations Status

```bash
npx prisma migrate status
```

### Create Migration (Week 3)

```bash
npx prisma migrate dev --name init
```

---

## Package.json Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "server": "nodemon --watch server --exec tsx server/index.ts",
    "server:build": "tsc --project tsconfig.server.json",
    "prisma:generate": "prisma generate",
    "prisma:studio": "prisma studio",
    "prisma:migrate": "prisma migrate dev"
  }
}
```

---

## Useful Prisma Query Examples

### Find Operations

```typescript
// Find all
await prisma.todo.findMany()

// Find by ID
await prisma.todo.findUnique({ where: { id: '123' } })

// Find with filter
await prisma.todo.findMany({
  where: { status: 'pending' }
})

// Find with sorting
await prisma.todo.findMany({
  orderBy: { dueDate: 'asc' }
})

// Find with relations
await prisma.todo.findMany({
  include: { category: true }
})
```

### Create Operations

```typescript
// Create single record
await prisma.todo.create({
  data: {
    name: 'New Todo',
    status: 'pending',
    categoryId: 'cat-id',
    dueDate: new Date()
  }
})
```

### Update Operations

```typescript
// Update single record
await prisma.todo.update({
  where: { id: '123' },
  data: { status: 'completed' }
})

// Update many
await prisma.todo.updateMany({
  where: { status: 'pending' },
  data: { status: 'in-progress' }
})
```

### Delete Operations

```typescript
// Delete single
await prisma.todo.delete({ where: { id: '123' } })

// Delete many
await prisma.todo.deleteMany({
  where: { status: 'completed' }
})
```

### Count & Aggregation

```typescript
// Count
const count = await prisma.todo.count()

// Count with filter
const pending = await prisma.todo.count({
  where: { status: 'pending' }
})
```

---

## Checklist

Before moving to Week 3, verify:

- [ ] Prisma packages installed (`@prisma/client`, `prisma`, `dotenv`)
- [ ] `dotenv.config()` called in `server/db/prisma.ts` BEFORE PrismaClient import
- [ ] `prisma/schema.prisma` file exists with Category and Todo models
- [ ] `.env` file exists with `DATABASE_URL="file:./dev.db"`
- [ ] `.env` is in `.gitignore`
- [ ] `server/db/prisma.ts` creates Prisma Client instance
- [ ] `server/models/todoStore.ts` uses Prisma queries (all functions are `async`)
- [ ] All controller functions are `async` and `await` store operations
- [ ] No TypeScript compilation errors (`npm run server:build`)
- [ ] Prisma Client generated successfully (`npm run prisma:generate`)

---

## What's Next? Week 3 Preview

In Week 3, we'll:

1. ✅ Run `npx prisma migrate dev` to create the SQLite database
2. ✅ Apply our schema as actual database tables
3. ✅ Seed initial data
4. ✅ Test full data persistence
5. ✅ Explore with Prisma Studio

---

## Troubleshooting

### Issue: "Cannot find module '@prisma/client'"

```bash
npm install @prisma/client
npm run prisma:generate
```

### Issue: "Environment variable not found: DATABASE_URL"

1. Check `.env` file exists in project root:
   ```
   DATABASE_URL="file:./dev.db"
   ```

2. Verify `dotenv.config()` is called in `server/db/prisma.ts` BEFORE importing PrismaClient

3. Restart your server

### Issue: TypeScript errors about undefined types

```bash
npm run prisma:generate
```

Then restart TypeScript server in VS Code:
- `Cmd/Ctrl + Shift + P`
- Type: "TypeScript: Restart TS Server"

---

## Resources

- 📖 [Prisma Documentation](https://www.prisma.io/docs)
- 🎓 [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- 💻 [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- 🎮 [Prisma Playground](https://playground.prisma.io/)

---

**Congratulations!** 🎉 You've successfully integrated Prisma ORM. Your application is now prepared for true database persistence in Week 3!
