const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cookie = require("cookie");
const ErrorHandler = require('../utils/ErrorHandler');

let io;
const userSockets = new Map();

function initSocket(server) {
  io = new Server(server, {
      cors: { origin: ['http://localhost:5173',process.env.FRONTEND_URI].filter(Boolean), 
      methods: ["GET", "POST"],
      credentials: true 
    }
  });

  io.use((socket, next) => {
    try {
      // prefer auth token sent via socket auth payload
      const authToken = socket.handshake?.auth?.token;
      const cookiesHeader = socket.handshake?.headers?.cookie || "";
      const cookieToken = cookie.parse(cookiesHeader).token;

      const token = authToken || cookieToken;
      console.log("AUth:",socket);
      console.log("cookie:",cookiesHeader);
      if (!token) {
        // call next with error so client receives connect_error
        return next(new ErrorHandler("No auth token", 401));
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;
      socket.userRole = payload.role;
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
