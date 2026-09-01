'use client';

import { io, type Socket } from 'socket.io-client';

import { API_BASE_URL } from '../api/axios';
import { tokenStore } from '../auth/tokenStore';

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

let socket: Socket | null = null;

/** The shared client socket. Created on first use, never auto-connected. */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket'],
      auth: { token: tokenStore.getAccess() },
    });
    // Each reconnect picks up whatever token the refresh flow last stored.
    socket.io.on('reconnect_attempt', () => {
      if (socket) socket.auth = { token: tokenStore.getAccess() };
    });
  }
  return socket;
}

/** Connect (or reconnect) with the current access token. */
export function connectSocket(): void {
  const s = getSocket();
  s.auth = { token: tokenStore.getAccess() };
  if (!s.connected) s.connect();
}

export function disconnectSocket(): void {
  socket?.disconnect();
}
