import { io } from 'socket.io-client';


let socket ;

export function connectSocket() {
  if (socket?.connected) return socket;
  socket = io("https://trendnest-rety.onrender.com", { 
    transports: ["websocket"],
    withCredentials: true,   // must be true for cookies
    timeout: 10000,          // increase timeout
  });


  socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
    });
  socket.on("disconnect", () => console.log("❌ Socket disconnected"));

  return socket;
}


export function getSocket() {
  return socket;
}