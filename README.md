# 3720 Todo Data Model

A full-stack Todo application built with TypeScript, Express.js, and Tailwind CSS. Features a modern UI with modal dialogs, REST API backend, and comprehensive CRUD operations for managing todos and categories.

🌐 **Live Demo:** [https://3720-todo-data-model.vercel.app/](https://3720-todo-data-model.vercel.app/)

---

## 🚀 Features

### Frontend
- ✅ **Modern UI** with Tailwind CSS 4
- ✅ **Modal Dialogs** for adding todos and categories
- ✅ **Card-based Layout** for todo visualization
- ✅ **Real-time Status Updates** (pending, in-progress, completed)
- ✅ **Category Management** with color-coded display
- ✅ **Due Date Tracking** with visual indicators
- ✅ **Responsive Design** for all screen sizes

### Backend
- ✅ **RESTful API** with Express.js 5
- ✅ **TypeScript** for type safety
- ✅ **CORS enabled** for cross-origin requests
- ✅ **In-memory data store** (ready for database integration)
- ✅ **Seed data** for testing and development
- ✅ **Error handling** and validation

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Scripts](#-scripts)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Development Workflow](#-development-workflow)
- [Roadmap](#-roadmap)

---

## 🛠️ Tech Stack

### Frontend
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **Vanilla JavaScript** - No framework dependencies

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 5** - Web framework
- **TypeScript** - Static typing
- **tsx** - TypeScript execution
- **nodemon** - Auto-restart during development

### Tools
- **APIdog** - API testing (see [APIdog_Testing_Guide.md](./APIdog_Testing_Guide.md))
- **Vercel** - Deployment platform

---

## 📁 Project Structure

```
3720-Todo-Data-Model/
├── public/                 # Static assets
├── src/                    # Frontend source code
│   ├── main.ts            # Main application entry point
│   ├── todoModel.ts       # Data models and business logic
│   ├── apiService.ts      # API service layer
│   ├── ui.ts              # UI components
│   └── style.css          # Tailwind CSS imports
├── server/                 # Backend source code
│   ├── index.ts           # Express server entry point
│   ├── models/
│   │   └── todoStore.ts   # In-memory data store
│   ├── controllers/
│   │   ├── todoController.ts
│   │   └── categoryController.ts
│   └── routes/
│       ├── todoRoutes.ts
│       └── categoryRoutes.ts
├── index.html             # HTML entry point
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript config (frontend)
├── tsconfig.server.json   # TypeScript config (backend)
└── vite.config.ts         # Vite configuration
```

---

## 🏁 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tvaughn7/3720-Todo-Data-Model.git
   cd 3720-Todo-Data-Model
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server** (Frontend)
   ```bash
   npm run dev
   ```
   Frontend will be available at `http://localhost:5173`

4. **Start the API server** (Backend)
   ```bash
   npm run server
   ```
   API will be available at `http://localhost:3000`

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (frontend) |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build |
| `npm run server` | Start Express API server with auto-reload |
| `npm run server:build` | Build server TypeScript to JavaScript |

---

## 🔌 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Health Check
```http
GET /api/health
```
Returns server status and timestamp.

#### Todos

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/todos` | Get all todos |
| `GET` | `/api/todos/:id` | Get todo by ID |
| `POST` | `/api/todos` | Create new todo |
| `PUT` | `/api/todos/:id` | Update todo |
| `DELETE` | `/api/todos/:id` | Delete todo |
| `DELETE` | `/api/todos/completed` | Clear completed todos |

#### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/categories` | Get all categories |
| `GET` | `/api/categories/:id` | Get category by ID |
| `POST` | `/api/categories` | Create new category |
| `DELETE` | `/api/categories/:id` | Delete category |

### Example Requests

**Create Todo:**
```json
POST /api/todos
{
  "name": "Buy groceries",
  "status": "pending",
  "categoryId": "mfxc0kjdefault",
  "dueDate": "2025-11-05"
}
```

**Update Todo:**
```json
PUT /api/todos/:id
{
  "name": "Buy groceries - UPDATED",
  "status": "completed"
}
```

---

## 🧪 Testing

### API Testing with APIdog

Comprehensive API testing guide available: [APIdog_Testing_Guide.md](./APIdog_Testing_Guide.md)

**Quick Start:**
1. Install [APIdog](https://apidog.com/)
2. Start the server: `npm run server`
3. Follow the guide to test all endpoints

**Test Coverage:**
- ✅ Health Check
- ✅ Get All Todos
- ✅ Get All Categories
- ✅ Create Todo
- ✅ Update Todo
- ✅ Delete Todo

---

## 💻 Development Workflow

### Frontend Development
1. Make changes in `src/` directory
2. Vite will auto-reload the browser
3. Build for production: `npm run build`

### Backend Development
1. Make changes in `server/` directory
2. nodemon will auto-restart the server
3. Test with APIdog or frontend

### Adding New Features
1. **Update Data Models** - Modify types in `src/todoModel.ts` and `server/models/todoStore.ts`
2. **Add API Endpoints** - Create routes and controllers
3. **Update API Service** - Add functions in `src/apiService.ts`
4. **Update UI** - Modify `src/main.ts` and templates

---

## 🗺️ Roadmap

### ✅ Completed
- [x] Basic todo CRUD operations
- [x] Category management
- [x] Tailwind CSS 4 integration
- [x] Modal-based UI
- [x] Express API server
- [x] API service layer
- [x] APIdog testing documentation
- [x] Vercel deployment

### 🔄 In Progress
- [ ] Connect frontend to API (replace local store with API calls)
- [ ] Database integration (Prisma ORM + SQLite)

### 📅 Planned
- [ ] User authentication
- [ ] Todo filtering and search
- [ ] Drag-and-drop reordering
- [ ] Dark mode
- [ ] Todo prioritization
- [ ] Recurring tasks
- [ ] Email notifications

---

## 📚 Additional Documentation

- **[Week1_Express_API.md](./Week1_Express_API.md)** - Express API setup tutorial
- **[APIdog_Testing_Guide.md](./APIdog_Testing_Guide.md)** - API testing guide

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**tvaughn7**
- GitHub: [@tvaughn7](https://github.com/tvaughn7)
- Live Demo: [https://3720-todo-data-model.vercel.app/](https://3720-todo-data-model.vercel.app/)

---

## 🙏 Acknowledgments

- Built as part of course 3720
- Tailwind CSS for the amazing utility-first framework
- Express.js community for excellent documentation
- Vercel for seamless deployment

---

**Happy Coding! 🚀**
