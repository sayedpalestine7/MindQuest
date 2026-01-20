import { io } from 'socket.io-client';
import { API_URL } from '../constants';

let socket;

export const getSocket = () => socket;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(API_URL, {
    transports: ['websocket'],
    autoConnect: false,
    auth: { token },
  });

  socket.connect();
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
