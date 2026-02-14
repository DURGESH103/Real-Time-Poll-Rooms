import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinPoll(pollId) {
    if (!this.socket) return;
    this.socket.emit('joinPoll', pollId);
  }

  leavePoll(pollId) {
    if (!this.socket) return;
    this.socket.emit('leavePoll', pollId);
  }

  onVoteUpdate(callback) {
    if (!this.socket) return;
    this.socket.on('voteUpdate', callback);
  }

  offVoteUpdate() {
    if (!this.socket) return;
    this.socket.off('voteUpdate');
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

export default new SocketService();
