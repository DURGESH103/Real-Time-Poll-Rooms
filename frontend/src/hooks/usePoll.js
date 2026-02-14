import { useState, useEffect } from 'react';
import { pollAPI } from '../services/api';

export const usePoll = (pollId) => {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pollId) return;

    const fetchPoll = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await pollAPI.getById(pollId);
        setPoll(response.data);
      } catch (err) {
        setError(err.message || 'Failed to load poll');
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [pollId]);

  const updatePollResults = (updatedData) => {
    setPoll(prev => ({
      ...prev,
      options: updatedData.options,
      totalVotes: updatedData.totalVotes
    }));
  };

  return { poll, loading, error, updatePollResults };
};
