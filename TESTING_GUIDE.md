# API Testing Guide

## Testing the Task Management Backend API

This guide helps you test all API endpoints with real examples.

### Prerequisites

1. **Start the server**
   ```bash
   npm install
   npm run dev
   ```

2. **Server will run on**: `http://localhost:5000`

3. **Install a tool for testing**:
   - [Postman](https://www.postman.com/downloads/) (recommended)
   - [Insomnia](https://insomnia.rest/)
   - Or use `curl` commands

---

## Step-by-Step Testing

### Step 1: Health Check

Test if server is running:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-11-30T..."
}
```

---

### Step 2: User Registration

Register a new user:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }'
```

Save the returned `token` for later use.

---

### Step 3: User Login

Login as the user:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

Save the token from response.

---

### Step 4: Get User Profile

Get your profile (replace `YOUR_TOKEN` with actual token):

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Step 5: Create a Team

Create a team:

```bash
curl -X POST http://localhost:5000/api/teams \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Engineering Team",
    "description": "Our engineering team"
  }'
```

Save the returned team `_id`.

---

### Step 6: Create a Task

Create a task (replace `TEAM_ID` with actual team ID):

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build user dashboard",
    "description": "Create a responsive dashboard UI",
    "dueDate": "2024-12-31",
    "priority": "high",
    "team": "TEAM_ID",
    "tags": ["frontend", "ui"]
  }'
```

Save the returned task `_id`.

---

### Step 7: Get All Tasks

Retrieve all tasks:

```bash
curl -X GET "http://localhost:5000/api/tasks?status=open&priority=high&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Query parameters:
- `status`: open, in-progress, completed, on-hold
- `priority`: low, medium, high, urgent
- `page`: page number
- `limit`: items per page

---

### Step 8: Update Task

Update a task (replace `TASK_ID` with actual task ID):

```bash
curl -X PUT http://localhost:5000/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "priority": "urgent"
  }'
```

---

### Step 9: Add Comment

Add a comment to task (replace `TASK_ID`):

```bash
curl -X POST http://localhost:5000/api/tasks/TASK_ID/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Starting work on this task!"
  }'
```

---

### Step 10: Search Tasks

Search for tasks:

```bash
curl -X GET "http://localhost:5000/api/tasks/search/dashboard" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Using Postman

### 1. Create Environment Variables

In Postman, create environment variables:

```
base_url: http://localhost:5000
token: YOUR_JWT_TOKEN
team_id: YOUR_TEAM_ID
task_id: YOUR_TASK_ID
```

### 2. Use in Requests

Use `{{base_url}}` and `{{token}}` in your requests:

**URL**: `{{base_url}}/api/tasks`

**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

---

## Common Issues & Solutions

### Issue: "Invalid token"
**Solution**: Make sure token is correct and not expired

### Issue: "User not found"
**Solution**: Register a user first before testing other endpoints

### Issue: "Team not found"
**Solution**: Create a team and use its ID

### Issue: Port 5000 already in use
**Solution**: Change PORT in .env file

### Issue: MongoDB connection failed
**Solution**: 
- Make sure MongoDB is running
- Check MONGODB_URI in .env

---

## Validation Rules

### User Registration
- firstName: 2+ characters
- lastName: 2+ characters
- email: valid email format
- password: 6+ characters
- passwords must match

### Task Creation
- title: 3+ characters
- description: required
- dueDate: valid date required
- priority: low, medium, high, or urgent
- team: valid team ID

### Team Creation
- name: 3+ characters
- description: optional

### Comment Creation
- text: 1+ characters required

---

## Expected Response Codes

- `200` - OK (successful GET, PUT)
- `201` - Created (successful POST)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (no permission)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error

---

## API Flow Example

1. Register user
2. Login (get token)
3. Create team
4. Create task for team
5. View tasks
6. Update task status
7. Add comments
8. Search tasks
9. Logout

---

## WebSocket Testing

### Using Node.js

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
  
  // Join a task room
  socket.emit('join-task', 'TASK_ID');
});

socket.on('notification', (data) => {
  console.log('Received notification:', data);
});

// Emit task update
socket.emit('task-updated', {
  taskId: 'TASK_ID',
  taskTitle: 'Task Title',
  status: 'completed'
});
```

---

## Performance Testing

### Test pagination

```bash
# Page 1 with 10 items
curl "http://localhost:5000/api/tasks?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Page 2 with 20 items
curl "http://localhost:5000/api/tasks?page=2&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test search performance

```bash
curl "http://localhost:5000/api/tasks/search/important" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## API Documentation

For complete API documentation, see `README.md`

---

**Ready to test? Start with the Health Check endpoint! 🚀**
