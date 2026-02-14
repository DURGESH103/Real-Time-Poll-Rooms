import { useEffect, useState } from 'react';
import socketService from '../services/socket';

export const useSocket = (pollId, onVoteUpdate) => {
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    if (!pollId) return;

    const socket = socketService.connect();
    socketService.joinPoll(pollId);

    const handleConnect = () => {
      setConnected(true);
      setReconnecting(false);
    };
    
    const handleDisconnect = () => {
      setConnected(false);
      setReconnecting(true);
    };
    
    const handleReconnecting = () => {
      setReconnecting(true);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnecting', handleReconnecting);

    setConnected(socket.connected);

    if (onVoteUpdate) {
      socketService.onVoteUpdate(onVoteUpdate);
    }

    return () => {
      socketService.leavePoll(pollId);
      socketService.offVoteUpdate();
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnecting', handleReconnecting);
    };
  }, [pollId, onVoteUpdate]);

  return { connected, reconnecting };
};
