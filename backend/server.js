require('dotenv').config();

const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Attach a Socket.io server to the http server with CORS open for local development.
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

// Make the io instance available to route files via app.get('io').
app.set('io', io);

// Authenticate every incoming socket connection using a JWT.
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error: no token provided.'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error: invalid or expired token.'));
  }
});

io.on('connection', (socket) => {
  // Each authenticated user joins a private room named after their id.
  socket.join(socket.userId);
  console.log(`Socket connected: user ${socket.userId} (socket ${socket.id})`);

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: user ${socket.userId} (socket ${socket.id})`);
  });
});

// CORS enables the separately hosted frontend; this middleware parses JSON request bodies.
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Start accepting requests only after a successful MongoDB connection.
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully.');
    httpServer.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
