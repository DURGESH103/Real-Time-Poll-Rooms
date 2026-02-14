import { useEffect, useState } from 'react';
import socketService from '../services/socket';

export const useSocket = (pollId, onVoteUpdate) => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!pollId) return;

    // Connect socket
    const socket = socketService.connect();

    // Join poll room
    socketService.joinPoll(pollId);

    // Listen for connection status
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Set initial connection status
    setConnected(socket.connected);

    // Listen for vote updates
    if (onVoteUpdate) {
      socketService.onVoteUpdate(onVoteUpdate);
    }

    // Cleanup
    return () => {
      socketService.leavePoll(pollId);
      socketService.offVoteUpdate();
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [pollId, onVoteUpdate]);

  return { connected };
};
