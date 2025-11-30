// API Usage Examples and Testing Guide
// Use these examples to test the Task Management API endpoints

// ============================================
// 1. AUTHENTICATION EXAMPLES
// ============================================

// Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

// Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

// Get Profile (requires token)
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

// Update Profile
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Software Developer",
    "phone": "555-1234",
    "department": "Engineering"
  }'

// ============================================
// 2. TASK MANAGEMENT EXAMPLES
// ============================================

// Create a Task
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication with bcrypt password hashing",
    "dueDate": "2024-12-31",
    "priority": "high",
    "team": "TEAM_ID_HERE",
    "tags": ["backend", "authentication"]
  }'

// Get All Tasks with Filters
curl "http://localhost:5000/api/tasks?status=open&priority=high&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

// Get My Assigned Tasks
curl "http://localhost:5000/api/tasks/my-tasks?status=open&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

// Get Single Task Details
curl -X GET http://localhost:5000/api/tasks/TASK_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

// Update Task
curl -X PUT http://localhost:5000/api/tasks/TASK_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "priority": "medium",
    "description": "Updated description"
  }'

// Assign Task to Users
curl -X PUT http://localhost:5000/api/tasks/TASK_ID_HERE/assign \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedTo": ["USER_ID_1", "USER_ID_2"]
  }'

// Search Tasks
curl "http://localhost:5000/api/tasks/search/authentication?team=TEAM_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

// Delete Task
curl -X DELETE http://localhost:5000/api/tasks/TASK_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

// ============================================
// 3. TEAM MANAGEMENT EXAMPLES
// ============================================

// Create Team
curl -X POST http://localhost:5000/api/teams \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Development Team",
    "description": "Our backend development team"
  }'

// Get All Teams
curl -X GET http://localhost:5000/api/teams \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

// Get My Teams
curl -X GET http://localhost:5000/api/teams/my-teams \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

// Get Team Details
curl -X GET http://localhost:5000/api/teams/TEAM_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

// Add Member to Team
curl -X POST http://localhost:5000/api/teams/TEAM_ID_HERE/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teammate@example.com"
  }'

// Remove Member from Team
curl -X DELETE http://localhost:5000/api/teams/TEAM_ID_HERE/members/USER_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

// Update Team
curl -X PUT http://localhost:5000/api/teams/TEAM_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Team Name",
    "description": "Updated description"
  }'

// Delete Team
curl -X DELETE http://localhost:5000/api/teams/TEAM_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

// ============================================
// 4. COMMENTS EXAMPLES
// ============================================

// Add Comment to Task
curl -X POST http://localhost:5000/api/tasks/TASK_ID_HERE/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Great progress on this task! Let me know if you need help."
  }'

// Get Task Comments
curl "http://localhost:5000/api/tasks/TASK_ID_HERE/comments?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

// Update Comment
curl -X PUT http://localhost:5000/api/comments/COMMENT_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Updated comment text"
  }'

// Delete Comment
curl -X DELETE http://localhost:5000/api/comments/COMMENT_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

// ============================================
// 5. REAL-TIME UPDATES (WebSocket)
// ============================================

// Connect to WebSocket (JavaScript example)
const socket = io('http://localhost:5000');

// Join a task room for updates
socket.emit('join-task', 'TASK_ID_HERE');

// Listen for notifications
socket.on('notification', (data) => {
  console.log('Notification:', data);
  // Output: { type: 'task-updated', message: '...', data: {...} }
});

// Emit task update
socket.emit('task-updated', {
  taskId: 'TASK_ID_HERE',
  taskTitle: 'Task Title',
  status: 'completed'
});

// Listen for user typing
socket.on('user-typing', (data) => {
  console.log(`${data.userName} is typing...`);
});

// Emit typing indicator
socket.emit('user-typing', {
  userId: 'USER_ID',
  taskId: 'TASK_ID_HERE',
  userName: 'John Doe'
});

// ============================================
// 6. ERROR RESPONSES
// ============================================

// Unauthorized (401)
{
  "success": false,
  "message": "Invalid token",
  "error": "JsonWebTokenError"
}

// Bad Request (400)
{
  "success": false,
  "message": "Validation Error",
  "details": ["email must be a valid email"]
}

// Not Found (404)
{
  "success": false,
  "message": "Task not found"
}

// Conflict (400)
{
  "success": false,
  "message": "email already exists"
}

// ============================================
// 7. RESPONSE EXAMPLES
// ============================================

// Successful Registration
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "USER_ID",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

// Task Created
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "TASK_ID",
    "title": "Implement authentication",
    "description": "Add JWT-based auth",
    "status": "open",
    "priority": "high",
    "createdBy": {
      "_id": "USER_ID",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "dueDate": "2024-12-31",
    "team": "TEAM_ID",
    "assignedTo": [],
    "comments": [],
    "tags": ["backend", "auth"],
    "createdAt": "2024-11-30T10:00:00.000Z",
    "updatedAt": "2024-11-30T10:00:00.000Z"
  }
}

// Paginated Response
{
  "success": true,
  "data": [...tasks],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
