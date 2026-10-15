import { io } from 'socket.io-client';
import { getToken } from './api';

let socket = null;

export function initSocketClient() {
  const token = getToken();
  if (!token) return null;

  if (socket && socket.connected) {
    return socket;
  }

  socket = io('/', {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to server as ID:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
