import { useState, useEffect, useRef } from 'react';

export const useActivityIndicator = (connected, poll) => {
  const [isActive, setIsActive] = useState(false);
  const lastVoteCount = useRef(poll?.totalVotes || 0);
  const activityTimeout = useRef(null);

  useEffect(() => {
    if (!poll) return;

    // Detect vote activity
    if (poll.totalVotes > lastVoteCount.current) {
      setIsActive(true);
      
      // Clear existing timeout
      if (activityTimeout.current) {
        clearTimeout(activityTimeout.current);
      }
      
      // Set inactive after 5 seconds
      activityTimeout.current = setTimeout(() => {
        setIsActive(false);
      }, 5000);
    }
    
    lastVoteCount.current = poll.totalVotes;

    return () => {
      if (activityTimeout.current) {
        clearTimeout(activityTimeout.current);
      }
    };
  }, [poll?.totalVotes]);

  // Show active if connected and has votes
  const showActivity = connected && (isActive || poll?.totalVotes > 0);

  return { isActive: showActivity };
};
