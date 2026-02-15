import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import LiveBadge from '../components/LiveBadge';
import { usePoll } from '../hooks/usePoll';
import { useSocket } from '../hooks/useSocket';
import { voteAPI } from '../services/api';
import { getDeviceFingerprint } from '../utils/fingerprint';
import VoteOption from '../components/VoteOption';
import ResultsChart from '../components/ResultsChart';
import ShareLink from '../components/ShareLink';
import LoadingSkeleton from '../components/LoadingSkeleton';
import VoteSuccessBanner from '../components/VoteSuccessBanner';
import ReconnectBanner from '../components/ReconnectBanner';

const PollRoom = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEmbed = searchParams.get('mode') === 'embed';
  const { poll, loading, error, updatePollResults } = usePoll(pollId);
  
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [fingerprint, setFingerprint] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  const handleVoteUpdate = useCallback((data) => {
    updatePollResults(data);
    toast.success('New vote received!', { icon: '📊' });
  }, [updatePollResults]);

  const { connected, reconnecting, socket } = useSocket(pollId, handleVoteUpdate);

  useEffect(() => {
    if (!poll?.pollExpiryTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(poll.pollExpiryTime).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
        if (socket) {
          socket.emit('poll_closed', pollId);
        }
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [poll, pollId, socket]);

  useEffect(() => {
    const initFingerprint = async () => {
      const fp = await getDeviceFingerprint();
      setFingerprint(fp);
    };
    initFingerprint();
  }, []);

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
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😕</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Poll Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:scale-105"
          >
            Create Your Own Poll
          </button>
        </div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/poll/${pollId}`;
  const isPollClosed = poll.isClosed || (poll.pollExpiryTime && new Date() > new Date(poll.pollExpiryTime));

  return (
    <>
      <ReconnectBanner show={reconnecting} />
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{poll.question}</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'} • 
                {hasVoted ? ' ✓ You voted' : ' Select an option to vote'}
              </p>
              <div className="mt-2">
                <LiveBadge poll={poll} />
              </div>
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              connected ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {connected ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <Wifi className="w-4 h-4" />
                  <span className="hidden sm:inline">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </div>
          </div>

          {isPollClosed ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Poll Closed</h3>
              <p className="text-gray-600 mb-6">This poll is no longer accepting votes</p>
              <ResultsChart 
                poll={poll} 
                hasVoted={hasVoted} 
                selectedOption={selectedOption} 
              />
            </div>
          ) : !hasVoted ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cast Your Vote</h2>
              
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
                className="hidden sm:block w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                {voting ? 'Submitting Vote...' : !fingerprint ? 'Loading...' : 'Submit Vote'}
              </button>
              
              <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50">
                <button
                  onClick={handleVote}
                  disabled={!selectedOption || voting || !fingerprint}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-all text-lg"
                >
                  {voting ? 'Submitting...' : !fingerprint ? 'Loading...' : 'Submit Vote'}
                </button>
              </div>
              
              <div className="h-20 sm:hidden" />
            </div>
          ) : (
            <div className="space-y-6">
              <VoteSuccessBanner 
                optionText={poll.options.find(o => o.id === selectedOption)?.text || 'your choice'} 
              />
              <ResultsChart 
                poll={poll} 
                hasVoted={hasVoted} 
                selectedOption={selectedOption} 
              />
            </div>
          )}
        </div>

        {!isEmbed && <ShareLink url={shareUrl} />}
      </div>
    </>
  );
};

export default PollRoom;
