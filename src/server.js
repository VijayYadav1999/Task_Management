const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const config = require('./config/config');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const teamRoutes = require('./routes/teamRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks/:taskId/comments', commentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Management Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      teams: '/api/teams',
      health: '/api/health',
    },
  });
});

// WebSocket connection for real-time updates
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Join room for task updates
  socket.on('join-task', (taskId) => {
    socket.join(`task-${taskId}`);
    console.log(`User ${socket.id} joined task-${taskId}`);
  });

  // Send notification to task room
  socket.on('task-updated', (data) => {
    io.to(`task-${data.taskId}`).emit('notification', {
      type: 'task-updated',
      message: `Task "${data.taskTitle}" has been updated`,
      data,
    });
  });

  // User typing indicator
  socket.on('user-typing', (data) => {
    io.to(`task-${data.taskId}`).emit('user-typing', {
      userId: data.userId,
      taskId: data.taskId,
      userName: data.userName,
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.PORT;

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Task Management Backend API           ║
║  Server running on port ${PORT}              ║
║  Environment: ${config.NODE_ENV}               ║
╚════════════════════════════════════════╝
  `);
});

module.exports = { app, io, server };
