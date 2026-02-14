import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart3, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePoll } from '../hooks/usePoll';
import { useSocket } from '../hooks/useSocket';
import { voteAPI } from '../services/api';
import { getDeviceFingerprint } from '../utils/fingerprint';
import VoteOption from '../components/VoteOption';
import ResultsChart from '../components/ResultsChart';
import ShareLink from '../components/ShareLink';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';

const PollRoom = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const { poll, loading, error, updatePollResults } = usePoll(pollId);
  
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [fingerprint, setFingerprint] = useState(null);

  // Real-time updates handler
  const handleVoteUpdate = useCallback((data) => {
    updatePollResults(data);
    toast.success('New vote received!', { icon: '📊' });
  }, [updatePollResults]);

  // Socket connection
  const { connected } = useSocket(pollId, handleVoteUpdate);

  // Get device fingerprint on mount
  useEffect(() => {
    const initFingerprint = async () => {
      const fp = await getDeviceFingerprint();
      setFingerprint(fp);
    };
    initFingerprint();
  }, []);

  // Check if user has already voted
  useEffect(() => {
    const checkVoteStatus = async () => {
      if (!fingerprint || !pollId) return;
      
      try {
        const response = await voteAPI.checkStatus({ pollId, fingerprint });
        if (response.data.hasVoted) {
          setHasVoted(true);
        }
      } catch (err) {
        console.error('Error checking vote status:', err);
      }
    };

    checkVoteStatus();
  }, [fingerprint, pollId]);

  const handleVote = async () => {
    if (!selectedOption || !fingerprint) {
      console.error('Missing data:', { selectedOption, fingerprint, pollId });
      toast.error('Please wait for the page to fully load');
      return;
    }

    console.log('Submitting vote:', JSON.stringify({ pollId, optionId: selectedOption, fingerprintLength: fingerprint?.length, fingerprintSample: fingerprint?.substring(0, 16) }));

    try {
      setVoting(true);
      
      await voteAPI.submit({
        pollId,
        optionId: selectedOption,
        fingerprint
      });

      setHasVoted(true);
      toast.success('Vote recorded successfully!');
    } catch (err) {
      console.error('Vote error:', err);
      if (err.code === 'ALREADY_VOTED') {
        setHasVoted(true);
        toast.error('You have already voted in this poll');
      } else {
        toast.error(err.message || 'Failed to submit vote');
      }
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <LoadingSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <ErrorMessage 
              message={error} 
              onRetry={() => window.location.reload()} 
            />
            <button
              onClick={() => navigate('/')}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Create Your Own Poll
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/poll/${pollId}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">{poll.question}</h1>
              </div>
              <p className="text-gray-600">
                {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'} • 
                {hasVoted ? ' You have voted' : ' Select an option to vote'}
              </p>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center gap-2 text-sm">
              {connected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Offline</span>
                </>
              )}
            </div>
          </div>

          {/* Voting or Results */}
          {!hasVoted ? (
            <div className="space-y-4">
              <div className="space-y-3">
                {poll.options.map((option) => (
                  <VoteOption
                    key={option.id}
                    option={option}
                    totalVotes={poll.totalVotes}
                    selected={selectedOption === option.id}
                    onSelect={setSelectedOption}
                    disabled={voting}
                    showResults={false}
                  />
                ))}
              </div>

              <button
                onClick={handleVote}
                disabled={!selectedOption || voting || !fingerprint}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                {voting ? 'Submitting Vote...' : !fingerprint ? 'Loading...' : 'Submit Vote'}
              </button>
            </div>
          ) : (
            <ResultsChart 
              poll={poll} 
              hasVoted={hasVoted} 
              selectedOption={selectedOption} 
            />
          )}
        </div>

        {/* Share Section */}
        <ShareLink url={shareUrl} />

        {/* Actions */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create Your Own Poll →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollRoom;
