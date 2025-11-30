# GitHub Setup Instructions

## Steps to Push to GitHub and Create a Pull Request

### 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository:
   - **Repository name**: `Task-Management`
   - **Description**: Task tracking and management application backend
   - **Visibility**: Public (as required)
   - **Do NOT initialize** with README, .gitignore, or license (we have these already)
3. Click **Create repository**

### 2. Add Remote and Push Code

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
cd "C:\Users\vijay\OneDrive\Desktop\Personal Projects\Task_Management"

# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/Task-Management.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

### 3. Create a Pull Request

Since this is the initial project, you can create a PR from `main` branch to demonstrate the complete implementation:

1. Go to your repository on GitHub: `https://github.com/YOUR_USERNAME/Task-Management`
2. Click **"New pull request"** or **"Pull requests"** tab → **"New pull request"**
3. Fill in the PR details:

**Title**: 
```
feat: Initial Task Management Backend API Implementation
```

**Description** (copy and paste):
```markdown
# Task Management Backend API

## Overview
Comprehensive backend system for task tracking and management application with full team collaboration features.

## Features Implemented

### ✅ User Authentication & Management
- User registration with validation
- Secure login with JWT tokens
- Password hashing with bcryptjs
- User profile management
- Logout functionality

### ✅ Task Management
- Full CRUD operations for tasks
- Task filtering by status, priority, and team
- Task sorting and pagination
- Advanced search functionality
- Task assignment to team members
- Status tracking (open, in-progress, completed, on-hold)

### ✅ Team/Project Collaboration
- Team creation and management
- Member invitation and management
- Role-based access control (owner, admin, member)
- Team-based task organization
- Task assignment within teams

### ✅ Comments & Attachments
- Add comments to tasks
- Update and delete comments
- Comment pagination
- Attachment support in tasks
- Author tracking for comments

### ✅ Real-time Updates
- WebSocket integration with Socket.io
- Task update notifications
- User typing indicators
- Real-time collaboration features

### ✅ API Best Practices
- RESTful API design
- Comprehensive error handling
- Input validation with Joi
- JWT authentication middleware
- Request logging
- Status code conventions

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **Real-time**: Socket.io
- **Validation**: Joi

## Project Structure
```
src/
├── config/          # Database and configuration
├── models/          # MongoDB schemas
├── controllers/     # Route handlers
├── routes/          # API routes
├── middleware/      # Auth and error handling
├── utils/           # Helper functions
└── server.js        # Main server file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/my-tasks` - Get assigned tasks
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/assign` - Assign task
- `GET /api/tasks/search/:query` - Search tasks
- `DELETE /api/tasks/:id` - Delete task

### Teams
- `POST /api/teams` - Create team
- `GET /api/teams` - Get all teams
- `GET /api/teams/my-teams` - Get user's teams
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `POST /api/teams/:id/members` - Add member
- `DELETE /api/teams/:id/members/:userId` - Remove member
- `DELETE /api/teams/:id` - Delete team

### Comments
- `POST /api/tasks/:taskId/comments` - Create comment
- `GET /api/tasks/:taskId/comments` - Get comments
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## Setup Instructions

1. **Clone repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Task-Management.git
   cd Task-Management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

4. **Start server**
   ```bash
   npm run dev    # Development mode
   npm start      # Production mode
   ```

Server will run on `http://localhost:5000`

## Testing API

See README.md for detailed API examples and curl commands.

## Code Quality
✅ Modular and organized code structure
✅ Comprehensive error handling
✅ Input validation on all endpoints
✅ Password security with bcryptjs
✅ JWT authentication
✅ Full documentation in README

## User Stories Addressed
- ✅ User registration and login
- ✅ Profile management
- ✅ Task creation with title, description, due date
- ✅ View assigned tasks
- ✅ Mark tasks complete
- ✅ Assign tasks to team members
- ✅ Filter tasks by status
- ✅ Search tasks by title/description
- ✅ Collaboration via comments and attachments
- ✅ Create and manage teams
- ✅ Secure logout
- ✅ Real-time notifications (WebSocket)

## Files Modified/Created
- 23 files created
- 2,430 lines of code
- Complete backend implementation with all requirements met
```

4. Click **Create pull request**

### 4. Share Your Links

Once the PR is created, you'll have:

- **GitHub Repository**: `https://github.com/YOUR_USERNAME/Task-Management`
- **Pull Request**: `https://github.com/YOUR_USERNAME/Task-Management/pull/1`

## Quick Commands Summary

```bash
# Navigate to project
cd "C:\Users\vijay\OneDrive\Desktop\Personal Projects\Task_Management"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/Task-Management.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

**Note**: Replace `YOUR_USERNAME` with your actual GitHub username in all URLs.

After pushing, share these links as your deliverables:
1. **GitHub Repository Link**
2. **GitHub PR Link**
