# Task Management Backend API

A comprehensive backend system for task tracking and management application that facilitates collaboration and organization within teams or projects.

## Features

- 🔐 **Secure User Authentication** - JWT-based authentication with bcrypt password hashing
- 📝 **Task Management** - Full CRUD operations with filtering, sorting, and searching
- 👥 **Team Collaboration** - Create teams, invite members, and manage roles
- 💬 **Comments & Attachments** - Collaborate on tasks with comments and file attachments
- 🔔 **Real-time Notifications** - WebSocket-based real-time updates and notifications
- 🔍 **Advanced Search** - Full-text search for tasks by title, description, or tags
- 📊 **Task Filtering** - Filter by status, priority, team, and more

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Validation**: Joi
- **Security**: bcryptjs for password hashing

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Task_Management
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/task-management
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRE=7d
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the server**

   ```bash
   # Development with auto-reload
   npm run dev

   # Production
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update user profile |
| POST | `/api/auth/logout` | Logout user |

### Task Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks` | Get all tasks with filters |
| GET | `/api/tasks/my-tasks` | Get tasks assigned to current user |
| GET | `/api/tasks/:id` | Get a specific task |
| PUT | `/api/tasks/:id` | Update a task |
| PUT | `/api/tasks/:id/assign` | Assign task to users |
| GET | `/api/tasks/search/:query` | Search tasks |
| DELETE | `/api/tasks/:id` | Delete a task |

### Team Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/teams` | Create a new team |
| GET | `/api/teams` | Get all teams |
| GET | `/api/teams/my-teams` | Get teams for current user |
| GET | `/api/teams/:id` | Get a specific team |
| PUT | `/api/teams/:id` | Update a team |
| POST | `/api/teams/:id/members` | Add member to team |
| DELETE | `/api/teams/:id/members/:userId` | Remove member from team |
| DELETE | `/api/teams/:id` | Delete a team |

### Comment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks/:taskId/comments` | Create a comment |
| GET | `/api/tasks/:taskId/comments` | Get task comments |
| PUT | `/api/comments/:id` | Update a comment |
| DELETE | `/api/comments/:id` | Delete a comment |

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

Tokens are returned after successful login or registration and expire after 7 days.

## Data Models

### User Schema

```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  profilePicture: String,
  bio: String,
  phone: String,
  department: String,
  teams: [ObjectId],
  createdTasks: [ObjectId],
  assignedTasks: [ObjectId],
  isActive: Boolean,
  timestamps: true
}
```

### Task Schema

```javascript
{
  title: String,
  description: String,
  status: String (open, in-progress, completed, on-hold),
  priority: String (low, medium, high, urgent),
  createdBy: ObjectId,
  assignedTo: [ObjectId],
  dueDate: Date,
  team: ObjectId,
  comments: [ObjectId],
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: Date,
    uploadedBy: ObjectId
  }],
  tags: [String],
  completedAt: Date,
  timestamps: true
}
```

### Team Schema

```javascript
{
  name: String,
  description: String,
  owner: ObjectId,
  members: [{
    user: ObjectId,
    role: String (owner, admin, member),
    joinedAt: Date
  }],
  tasks: [ObjectId],
  isActive: Boolean,
  timestamps: true
}
```

### Comment Schema

```javascript
{
  text: String,
  task: ObjectId,
  author: ObjectId,
  mentions: [ObjectId],
  timestamps: true
}
```

## Example Usage

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Team

```bash
curl -X POST http://localhost:5000/api/teams \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Development Team",
    "description": "Our development team"
  }'
```

### Create Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build API",
    "description": "Create RESTful API endpoints",
    "dueDate": "2024-12-31",
    "priority": "high",
    "team": "<team-id>",
    "tags": ["backend", "api"]
  }'
```

## Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Field validation error"]
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## WebSocket Events

### Real-time Task Updates

```javascript
// Connect to WebSocket
const socket = io('http://localhost:5000');

// Join task room
socket.emit('join-task', 'task-id');

// Listen for updates
socket.on('notification', (data) => {
  console.log('Task updated:', data);
});

// Emit task update
socket.emit('task-updated', {
  taskId: 'task-id',
  taskTitle: 'Task Title',
  status: 'completed'
});
```

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── config.js     # Environment configuration
│   └── database.js   # MongoDB connection
├── models/           # Mongoose schemas
│   ├── User.js
│   ├── Task.js
│   ├── Team.js
│   └── Comment.js
├── controllers/      # Route controllers
│   ├── authController.js
│   ├── taskController.js
│   ├── teamController.js
│   └── commentController.js
├── routes/           # API routes
│   ├── authRoutes.js
│   ├── taskRoutes.js
│   ├── teamRoutes.js
│   └── commentRoutes.js
├── middleware/       # Express middleware
│   ├── authMiddleware.js
│   └── errorHandler.js
├── utils/            # Utility functions
│   ├── auth.js       # JWT & password utilities
│   └── validators.js # Data validation
└── server.js         # Main server file
```

## Code Quality

- ESLint configuration for code consistency
- Joi validation for input validation
- Error handling middleware
- Request logging
- Comments and documentation

## Testing

Run tests with:

```bash
npm test
```

## Best Practices Implemented

✅ Secure password hashing with bcryptjs
✅ JWT-based authentication
✅ Input validation with Joi
✅ Comprehensive error handling
✅ RESTful API design
✅ Code organization and modularity
✅ Environment-based configuration
✅ Real-time WebSocket support
✅ Full-text search capability
✅ Role-based access control

## Future Enhancements

- [ ] File upload and attachment storage (AWS S3, Cloudinary)
- [ ] Email notifications
- [ ] Task reminders and scheduling
- [ ] Analytics and reporting
- [ ] Two-factor authentication (2FA)
- [ ] Advanced permission system
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Time tracking integration
- [ ] Mobile app support

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support, email support@example.com or open an issue on GitHub.

---

**Built with ❤️ for collaborative task management**
