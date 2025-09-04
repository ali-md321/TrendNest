const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cookie = require("cookie");
const ErrorHandler = require('../utils/ErrorHandler');

let io;
const userSockets = new Map();

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URI, 'http://localhost:5173'].filter(Boolean),
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    try {
      const authToken = socket.handshake?.auth?.token || null;
      const cookieHeader = socket.handshake?.headers?.cookie || '';
      const cookieToken = cookie.parse(cookieHeader || '').token || null;

      const token = authToken || cookieToken;
      console.log("Token:",token);
      if (!token) return next(new Error('No auth token'));

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;
      socket.role = payload.role;
      return next();
    } catch (err) {
      return next(new ErrorHandler("Invalid auth token", 401));
    }
  });

  io.on('connection', (socket) => {
    if (!userSockets.has(socket.userId)) userSockets.set(socket.userId, new Set());
    userSockets.get(socket.userId).add(socket.id);

    socket.join(`user:${socket.userId}`);
        
    socket.on('disconnect', () => {
      const set = userSockets.get(socket.userId);
      if (set) {
        set.delete(socket.id);
        if (!set.size) userSockets.delete(socket.userId);
      }
    });
  });

  return io;
}

function getUserActiveSocketIds(userId) {
  const set = userSockets.get(String(userId));
  return set ? Array.from(set) : [];
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}

module.exports = { initSocket,getIO, getUserActiveSocketIds };