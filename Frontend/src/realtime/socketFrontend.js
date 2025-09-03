import { io } from 'socket.io-client';


let socket ;
function getTokenFromCookie() {
  const m = document.cookie.match('(^|;)\\s*token\\s*=\\s*([^;]+)');
  return m ? decodeURIComponent(m[2]) : null;
}

export function connectSocket() {
  if (socket?.connected) return socket;
  const token = getTokenFromCookie();
  console.log("TokenSocket:",token);
  socket = io("https://trendnest-rety.onrender.com", {
    auth: { token }, 
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
