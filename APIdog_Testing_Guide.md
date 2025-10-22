# APIdog Testing Guide - Todo API

This guide provides step-by-step instructions for testing your Todo API endpoints using APIdog.

---

## Prerequisites

1. **Server Running:** Make sure your Express server is running
   ```bash
   npm run server
   ```
   You should see: `🚀 Server running on http://localhost:3000`

2. **APIdog Installed:** Have APIdog application open and ready

---

## Base URL

All endpoints use the base URL:
```
http://localhost:3000/api
```

---

## Test 1: Health Check ✅

### Purpose
Verify that the server is running and responding correctly.

### Request Details
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/health`
- **Headers:** None required

### Steps in APIdog
1. Click **"New Request"**
2. Name: `Health Check`
3. Select method: `GET`
4. Enter URL: `http://localhost:3000/api/health`
5. Click **"Send"**

### Expected Response
**Status Code:** `200 OK`

**Response Body:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-22T12:34:56.789Z"
}
```

### What to Verify
- ✅ Status code is 200
- ✅ Response contains `status: "ok"`
- ✅ Response contains a valid `timestamp`

---

## Test 2: Get All Todos 📋

### Purpose
Retrieve all todo items from the database.

### Request Details
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/todos`
- **Headers:** None required

### Steps in APIdog
1. Click **"New Request"**
2. Name: `Get All Todos`
3. Select method: `GET`
4. Enter URL: `http://localhost:3000/api/todos`
5. Click **"Send"**

### Expected Response
**Status Code:** `200 OK`

**Response Body:**
```json
[
  {
    "id": "mfxc0llaulvfx6",
    "name": "Mow the Lawn",
    "status": "pending",
    "categoryId": "mfxc0kjdefault",
    "dueDate": "2025-10-10T00:00:00.000Z"
  },
  {
    "id": "mfxc0px7xahgbi",
    "name": "Finish my homework",
    "status": "in-progress",
    "categoryId": "mfxc0kjdefault",
    "dueDate": "2025-10-08T00:00:00.000Z"
  },
  {
    "id": "mfxc0rx8yahijk",
    "name": "Watch the October 2, 2025 class session video",
    "status": "completed",
    "categoryId": "mfxc0kjdefault",
    "dueDate": "2025-10-03T00:00:00.000Z"
  }
]
```

### What to Verify
- ✅ Status code is 200
- ✅ Response is an array
- ✅ Contains 3 seed todos (if server just started)
- ✅ Each todo has: `id`, `name`, `status`, `categoryId`, `dueDate`

---

## Test 3: Get All Categories 🏷️

### Purpose
Retrieve all categories from the database.

### Request Details
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/categories`
- **Headers:** None required

### Steps in APIdog
1. Click **"New Request"**
2. Name: `Get All Categories`
3. Select method: `GET`
4. Enter URL: `http://localhost:3000/api/categories`
5. Click **"Send"**

### Expected Response
**Status Code:** `200 OK`

**Response Body:**
```json
[
  {
    "id": "mfxc0kjdefault",
    "name": "School"
  }
]
```

### What to Verify
- ✅ Status code is 200
- ✅ Response is an array
- ✅ Contains at least the "School" category
- ✅ Each category has: `id`, `name`

---

## Test 4: Create Todo (POST) ➕

### Purpose
Create a new todo item.

### Request Details
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/todos`
- **Headers:** 
  - `Content-Type: application/json`

### Steps in APIdog
1. Click **"New Request"**
2. Name: `Create Todo`
3. Select method: `POST`
4. Enter URL: `http://localhost:3000/api/todos`
5. Go to **"Body"** tab
6. Select **"JSON"** format
7. Enter the following JSON:

**Request Body:**
```json
{
  "name": "Buy groceries",
  "status": "pending",
  "categoryId": "mfxc0kjdefault",
  "dueDate": "2025-10-25"
}
```

8. Click **"Send"**

### Expected Response
**Status Code:** `201 Created`

**Response Body:**
```json
{
  "id": "mfxc2d4tbjcotd",
  "name": "Buy groceries",
  "status": "pending",
  "categoryId": "mfxc0kjdefault",
  "dueDate": "2025-10-25T00:00:00.000Z"
}
```

### What to Verify
- ✅ Status code is 201
- ✅ Response contains the new todo with a generated `id`
- ✅ All fields match the request body
- ✅ `dueDate` is converted to ISO format

### Notes
⚠️ **Important:** Replace `"categoryId"` with an actual category ID from your "Get All Categories" test!

---

## Test 5: Update Todo (PUT) ✏️

### Purpose
Update an existing todo item.

### Request Details
- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/todos/{id}`
- **Headers:** 
  - `Content-Type: application/json`

### Steps in APIdog
1. Click **"New Request"**
2. Name: `Update Todo`
3. Select method: `PUT`
4. Enter URL: `http://localhost:3000/api/todos/mfxc0llaulvfx6`
   - Replace `mfxc0llaulvfx6` with an actual todo ID from "Get All Todos"
5. Go to **"Body"** tab
6. Select **"JSON"** format
7. Enter the following JSON:

**Request Body:**
```json
{
  "name": "Mow the Lawn - UPDATED",
  "status": "in-progress"
}
```

8. Click **"Send"**

### Expected Response
**Status Code:** `200 OK`

**Response Body:**
```json
{
  "id": "mfxc0llaulvfx6",
  "name": "Mow the Lawn - UPDATED",
  "status": "in-progress",
  "categoryId": "mfxc0kjdefault",
  "dueDate": "2025-10-10T00:00:00.000Z"
}
```

### What to Verify
- ✅ Status code is 200
- ✅ Response contains the updated todo
- ✅ Updated fields are changed (`name`, `status`)
- ✅ Unchanged fields remain the same (`categoryId`, `dueDate`)

### Notes
- You can update one or multiple fields
- Valid status values: `"pending"`, `"in-progress"`, `"completed"`

---

## Test 6: Delete Todo (DELETE) 🗑️

### Purpose
Delete an existing todo item.

### Request Details
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/api/todos/{id}`
- **Headers:** None required

### Steps in APIdog
1. Click **"New Request"**
2. Name: `Delete Todo`
3. Select method: `DELETE`
4. Enter URL: `http://localhost:3000/api/todos/mfxc0rx8yahijk`
   - Replace `mfxc0rx8yahijk` with an actual todo ID from "Get All Todos"
5. Click **"Send"**

### Expected Response
**Status Code:** `204 No Content`

**Response Body:** (Empty - no body returned)

### What to Verify
- ✅ Status code is 204
- ✅ No response body
- ✅ Running "Get All Todos" again shows the todo is removed

### Testing Deletion
After deletion, verify by:
1. Run "Get All Todos" again
2. Confirm the deleted todo is no longer in the list

---

## Common Error Responses

### 400 Bad Request
**Cause:** Missing required fields or invalid data

**Example Response:**
```json
{
  "error": "Name and categoryId are required"
}
```

### 404 Not Found
**Cause:** Todo or Category ID doesn't exist

**Example Response:**
```json
{
  "error": "Todo not found"
}
```

### 500 Internal Server Error
**Cause:** Server-side error

**Example Response:**
```json
{
  "error": "Failed to fetch todos"
}
```

---

## Creating a Collection in APIdog

To organize all these tests:

1. Create a new collection: **"Todo API Tests"**
2. Add all 6 requests to this collection
3. Set collection-level variables:
   - `BASE_URL`: `http://localhost:3000/api`
   - `TODO_ID`: (Update after creating a todo)
   - `CATEGORY_ID`: (Update after getting categories)

4. Use variables in requests:
   - URL: `{{BASE_URL}}/todos/{{TODO_ID}}`

---

## Test Sequence Workflow

For a complete test workflow, run tests in this order:

1. ✅ **Health Check** - Verify server is running
2. ✅ **Get All Categories** - Get a valid `categoryId`
3. ✅ **Get All Todos** - See initial seed data
4. ✅ **Create Todo** - Add a new todo (save the returned ID)
5. ✅ **Update Todo** - Modify the newly created todo
6. ✅ **Get All Todos** - Verify the updates
7. ✅ **Delete Todo** - Remove the todo
8. ✅ **Get All Todos** - Confirm deletion

---

## Tips for Testing

### 1. Copy IDs from Responses
After creating/getting todos or categories, copy the IDs from responses to use in update/delete requests.

### 2. Use Environment Variables
Set up APIdog environment variables for:
- Base URL
- Commonly used IDs
- API tokens (for future authentication)

### 3. Save Responses
APIdog can save response examples to compare future test results.

### 4. Automation
Create test scripts in APIdog to automatically verify:
- Status codes
- Response structure
- Specific field values

### 5. Monitor Server Logs
Keep an eye on your terminal running `npm run server` to see console logs and any errors.

---

## Troubleshooting

### Server Not Responding
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```
**Solution:** Make sure `npm run server` is running

### CORS Errors
```
Access-Control-Allow-Origin error
```
**Solution:** Your server already has CORS enabled, but make sure `cors()` middleware is in `server/index.ts`

### Invalid Date Format
```
Invalid date format
```
**Solution:** Use ISO date format: `"2025-10-25"` or `"2025-10-25T12:00:00.000Z"`

### Category Not Found
```
Error: Category not found
```
**Solution:** First run "Get All Categories" and use a valid `categoryId` from the response

---

## Next Steps

After testing these basic endpoints, you can:

1. ✅ Test the "Clear Completed Todos" endpoint
2. ✅ Test individual todo retrieval: `GET /api/todos/{id}`
3. ✅ Test individual category retrieval: `GET /api/categories/{id}`
4. ✅ Test category deletion: `DELETE /api/categories/{id}`
5. ✅ Create automated test suites
6. ✅ Add authentication tests (when implemented)

---

## Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/todos` | GET | Get all todos |
| `/api/todos` | POST | Create todo |
| `/api/todos/{id}` | GET | Get one todo |
| `/api/todos/{id}` | PUT | Update todo |
| `/api/todos/{id}` | DELETE | Delete todo |
| `/api/categories` | GET | Get all categories |
| `/api/categories` | POST | Create category |
| `/api/categories/{id}` | GET | Get one category |
| `/api/categories/{id}` | DELETE | Delete category |

---

Happy Testing! 🚀
