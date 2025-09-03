import { io } from 'socket.io-client';

let socket ;
export function connectSocket() {
  if (socket?.connected) return socket;
  socket = io("http://localhost:3000", {
    transports: ["websocket"],
    withCredentials: true,
    timeout: 10000,
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
