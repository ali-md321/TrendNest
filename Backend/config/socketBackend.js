const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cookie = require("cookie");
const ErrorHandler = require('../utils/ErrorHandler');

let io;
const userSockets = new Map();

function initSocket(server) {
  io = new Server(server, {
      cors: { origin: ['http://localhost:5173',process.env.FRONTEND_URI], 
      credentials: true 
    }
  });

  io.use((socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.token; // your JWT cookie
    if (!token){
      throw next(new ErrorHandler("No auth token",400));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;
      socket.userRole = payload.role;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
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
