# 🤖 AI Chat Feature Implementation Plan

## 📋 Overview
Add an AI-powered chat interface to your Todo app using Ollama (local AI) with OpenAI-compatible API syntax. The chat will be accessible as a separate route/page in your application.

---

## ❓ Clarification Questions

Before we proceed, I need to understand a few things:

1. **Model Selection**: Which Ollama model do you want to use? (e.g., `llama3.2`, `mistral`, `codellama`, `phi3`)

2. **Ollama Configuration**: 
   - Is Ollama already running on your machine?
   - Default Ollama runs on `http://localhost:11434` - is this correct for your setup?

3. **Chat History**:
   - Should chat messages be persisted in the database (SQLite via Prisma)?
   - Or just keep them in-memory/client-side for the session?

4. **UI Navigation**:
   - Should there be a navigation menu to switch between "Todo Manager" and "AI Chat"?
   - Or would you prefer a button/link to open chat in a modal/separate page?

5. **Chat Features**:
   - Do you want conversation history (multi-turn conversations)?
   - Should there be a "Clear Chat" button?
   - Any special features like code highlighting, markdown rendering, or copying responses?

6. **Streaming vs Non-Streaming**:
   - Do you want real-time streaming responses (words appear as they're generated)?
   - Or wait for the complete response before displaying?

---

## 🏗️ Architecture Overview

```
Frontend (Vite/TypeScript)
├── src/
│   ├── main.ts (updated - routing logic)
│   ├── pages/
│   │   ├── todoPage.ts (NEW - existing todo UI)
│   │   └── chatPage.ts (NEW - chat UI component)
│   ├── apiService.ts (updated - add chat endpoints)
│   └── style.css (updated - chat styles)

Backend (Express/TypeScript)
├── server/
│   ├── index.ts (updated - add chat routes)
│   ├── controllers/
│   │   ├── todoController.ts (existing)
│   │   ├── categoryController.ts (existing)
│   │   └── chatController.ts (NEW - AI chat logic)
│   ├── routes/
│   │   ├── todoRoutes.ts (existing)
│   │   ├── categoryRoutes.ts (existing)
│   │   └── chatRoutes.ts (NEW - chat endpoints)
│   ├── services/
│   │   └── ollamaService.ts (NEW - Ollama API wrapper)
│   └── models/
│       └── chatStore.ts (NEW - optional, if persisting)

Database (Optional - if persisting)
├── prisma/
│   └── schema.prisma (updated - add ChatMessage model)
```

---

## 📝 Detailed Implementation Steps

### **Phase 1: Backend Setup** 🔧

#### Step 1.1: Install Dependencies
```bash
npm install
# If we need streaming:
# npm install eventsource-parser
```

#### Step 1.2: Create Ollama Service
**File**: `server/services/ollamaService.ts`

```typescript
interface OllamaMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OllamaChatRequest {
  model: string
  messages: OllamaMessage[]
  stream?: boolean
  options?: {
    temperature?: number
    max_tokens?: number
  }
}

export class OllamaService {
  private baseURL: string
  private model: string

  constructor(baseURL = 'http://localhost:11434', model = 'llama3.2') {
    this.baseURL = baseURL
    this.model = model
  }

  async chat(messages: OllamaMessage[], stream = false) {
    // Implementation for calling Ollama API
    // Uses OpenAI-compatible syntax
  }

  async listModels() {
    // Fetch available models
  }
}
```

#### Step 1.3: Create Chat Controller
**File**: `server/controllers/chatController.ts`

```typescript
import { Request, Response } from 'express'
import { OllamaService } from '../services/ollamaService.js'

const ollamaService = new OllamaService()

// POST /api/chat
export async function sendChatMessage(req: Request, res: Response) {
  // Handle chat request
  // Call Ollama service
  // Return AI response
}

// GET /api/chat/models
export async function getAvailableModels(req: Request, res: Response) {
  // Return list of available Ollama models
}

// If streaming:
// POST /api/chat/stream
export async function streamChatMessage(req: Request, res: Response) {
  // Stream response using Server-Sent Events (SSE)
}
```

#### Step 1.4: Create Chat Routes
**File**: `server/routes/chatRoutes.ts`

```typescript
import { Router } from 'express'
import {
  sendChatMessage,
  getAvailableModels,
  streamChatMessage,
} from '../controllers/chatController.js'

const router = Router()

router.post('/', sendChatMessage)
router.post('/stream', streamChatMessage) // If streaming
router.get('/models', getAvailableModels)

export default router
```

#### Step 1.5: Register Routes
**File**: `server/index.ts` (update)

```typescript
import chatRoutes from './routes/chatRoutes.js'

// Add after existing routes:
app.use('/api/chat', chatRoutes)
```

---

### **Phase 2: Frontend Setup** 🎨

#### Step 2.1: Create Chat Page Component
**File**: `src/pages/chatPage.ts`

```typescript
export class ChatPage {
  private container: HTMLElement
  private messages: Array<{ role: string; content: string }> = []

  constructor(container: HTMLElement) {
    this.container = container
    this.render()
  }

  private render() {
    // Render chat UI:
    // - Header with title
    // - Message container (scrollable)
    // - Input area (textarea + send button)
    // - Optional: model selector, clear button
  }

  private async sendMessage(userMessage: string) {
    // Add user message to UI
    // Call API
    // Add AI response to UI
  }

  private renderMessage(role: string, content: string) {
    // Render individual message bubble
  }
}
```

#### Step 2.2: Create Todo Page Component
**File**: `src/pages/todoPage.ts`

Extract existing todo UI from `main.ts` into this component.

#### Step 2.3: Update API Service
**File**: `src/apiService.ts` (update)

```typescript
// Add to existing file:

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  model?: string
}

export interface ChatResponse {
  message: {
    role: string
    content: string
  }
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  return fetchJSON<ChatResponse>(`${API_BASE_URL}/chat`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function getAvailableModels(): Promise<string[]> {
  return fetchJSON<string[]>(`${API_BASE_URL}/chat/models`)
}
```

#### Step 2.4: Add Routing Logic
**File**: `src/main.ts` (major update)

```typescript
import { TodoPage } from './pages/todoPage.js'
import { ChatPage } from './pages/chatPage.js'

// Simple client-side routing
class Router {
  private routes: Map<string, () => void> = new Map()
  private currentPage: string = 'todos'

  constructor() {
    this.setupRoutes()
    this.setupNavigation()
    this.navigate(window.location.hash || '#todos')
  }

  private setupRoutes() {
    this.routes.set('#todos', () => this.renderTodoPage())
    this.routes.set('#chat', () => this.renderChatPage())
  }

  private setupNavigation() {
    // Create navigation menu
    // Add event listeners for route changes
  }

  navigate(hash: string) {
    const handler = this.routes.get(hash)
    if (handler) {
      window.location.hash = hash
      handler()
    }
  }
}

const router = new Router()
```

#### Step 2.5: Update HTML Structure
**File**: `index.html` (update)

```html
<body>
  <nav id="main-nav">
    <!-- Navigation menu will be injected here -->
  </nav>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
```

#### Step 2.6: Add Chat Styles
**File**: `src/style.css` (update)

```css
/* Chat-specific styles */
.chat-container { /* ... */ }
.chat-messages { /* ... */ }
.chat-message { /* ... */ }
.chat-message.user { /* ... */ }
.chat-message.assistant { /* ... */ }
.chat-input-area { /* ... */ }
/* etc. */
```

---

### **Phase 3: Optional Database Persistence** 💾

If you want to persist chat history:

#### Step 3.1: Update Prisma Schema
**File**: `prisma/schema.prisma`

```prisma
model ChatMessage {
  id        String   @id @default(cuid())
  role      String   // 'user' | 'assistant' | 'system'
  content   String
  model     String?  // Which AI model was used
  createdAt DateTime @default(now())
}
```

#### Step 3.2: Run Migration
```bash
npm run prisma:migrate
# Name: add_chat_messages
```

#### Step 3.3: Create Chat Store
**File**: `server/models/chatStore.ts`

```typescript
import prisma from '../db/prisma.js'

export async function saveChatMessage(role: string, content: string, model?: string) {
  return prisma.chatMessage.create({
    data: { role, content, model }
  })
}

export async function getChatHistory(limit = 50) {
  return prisma.chatMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}

export async function clearChatHistory() {
  return prisma.chatMessage.deleteMany()
}
```

---

### **Phase 4: Environment Configuration** ⚙️

#### Step 4.1: Update .env
**File**: `.env`

```bash
DATABASE_URL="file:./dev.db"
PORT=3000
FRONTEND_URL="http://localhost:5173"

# Ollama Configuration
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.2"  # or your preferred model
```

#### Step 4.2: Update .env.example
**File**: `.env.example`

```bash
# Add Ollama config
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.2"
```

---

## 🎯 Implementation Checklist

### Backend
- [ ] Create `OllamaService` class
- [ ] Create `chatController.ts`
- [ ] Create `chatRoutes.ts`
- [ ] Register chat routes in `server/index.ts`
- [ ] Add environment variables
- [ ] Test API endpoints with Postman/Thunder Client

### Frontend
- [ ] Create `chatPage.ts` component
- [ ] Extract existing UI into `todoPage.ts`
- [ ] Add routing logic to `main.ts`
- [ ] Update `apiService.ts` with chat methods
- [ ] Add chat styles to `style.css`
- [ ] Create navigation menu

### Optional (Persistence)
- [ ] Update Prisma schema
- [ ] Run migration
- [ ] Create `chatStore.ts`
- [ ] Update controller to save messages

### Testing
- [ ] Ensure Ollama is running (`ollama serve`)
- [ ] Test backend API with curl/Postman
- [ ] Test frontend chat UI
- [ ] Test navigation between pages
- [ ] Test error handling (Ollama offline, invalid model, etc.)

---

## 🧪 Testing the Setup

### 1. Verify Ollama is Running
```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Pull a model if needed
ollama pull llama3.2
```

### 2. Test Backend Endpoint
```bash
# Test chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, who are you?"}
    ]
  }'
```

### 3. Test Frontend
- Navigate to `http://localhost:5173/#chat`
- Send a message
- Verify response appears

---

## 🚀 Advanced Features (Future Enhancements)

1. **Streaming Responses**: Real-time word-by-word display
2. **Markdown Rendering**: Format code blocks, lists, etc.
3. **Code Syntax Highlighting**: Use Prism.js or highlight.js
4. **Copy to Clipboard**: Button to copy AI responses
5. **Model Switching**: Dropdown to change models mid-conversation
6. **System Prompts**: Allow users to set custom system prompts
7. **Export Chat**: Download conversation as JSON/Markdown
8. **Context from Todos**: "Ask AI about my pending tasks"
9. **Voice Input**: Web Speech API integration
10. **Rate Limiting**: Prevent API abuse

---

## 📚 Key Files Summary

| File | Purpose | Status |
|------|---------|--------|
| `server/services/ollamaService.ts` | Ollama API wrapper | NEW |
| `server/controllers/chatController.ts` | Chat request handlers | NEW |
| `server/routes/chatRoutes.ts` | Chat API routes | NEW |
| `server/models/chatStore.ts` | Database operations (optional) | NEW |
| `src/pages/chatPage.ts` | Chat UI component | NEW |
| `src/pages/todoPage.ts` | Todo UI component (extracted) | NEW |
| `src/apiService.ts` | API calls | UPDATE |
| `src/main.ts` | Routing logic | UPDATE |
| `server/index.ts` | Register routes | UPDATE |
| `prisma/schema.prisma` | Database schema (optional) | UPDATE |

---

## 💡 Example Chat UI Design

```
┌─────────────────────────────────────────┐
│  🤖 AI Chat Assistant                   │
├─────────────────────────────────────────┤
│                                         │
│  You: Hello! How can you help me?      │
│                                         │
│  🤖: I'm an AI assistant powered by     │
│      Ollama. I can help with coding,   │
│      questions, and more!              │
│                                         │
│  You: What's the weather like?         │
│                                         │
│  🤖: I don't have access to real-time  │
│      weather data, but I can help      │
│      with other questions!             │
│                                         │
├─────────────────────────────────────────┤
│ Type your message...          [Send] 📤 │
└─────────────────────────────────────────┘
```

---

## ⏱️ Estimated Time

- **Backend Setup**: 2-3 hours
- **Frontend Setup**: 3-4 hours
- **Database Persistence**: 1-2 hours (optional)
- **Testing & Polish**: 1-2 hours
- **Total**: ~6-10 hours

---

## 🎓 Learning Outcomes

✅ Client-side routing in vanilla TypeScript  
✅ Integrating local AI models (Ollama)  
✅ Server-Sent Events (SSE) for streaming  
✅ Component-based UI architecture  
✅ API service layer pattern  
✅ Error handling for external services  

---

**Questions? Let me know your answers to the clarification questions above, and I can provide more specific code implementations for each file!** 🚀
