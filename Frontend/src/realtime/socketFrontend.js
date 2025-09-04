import { io } from 'socket.io-client';
import { axiosInstance as axios} from '../utils/axiosInstance';

let socket ;
export async function connectSocket() {
  if (socket?.connected) return socket;
  const res = await axios.get("/api/get-token", { credentials: 'include' });
  const {token} = res.data;
  socket = io(import.meta.env.VITE_API_URL, {
    transports: ['websocket'],
    withCredentials: true,
    timeout: 20000,
    auth: { token },
    reconnectionAttempts: 5,
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
