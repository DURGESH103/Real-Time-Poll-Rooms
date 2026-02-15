import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users } from 'lucide-react';
import ProgressBar from './ProgressBar';

const getStatusBadge = (status) => {
  const badges = {
    LIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Live', dot: 'bg-emerald-500' },
    ENDING_SOON: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Ending Soon', dot: 'bg-yellow-500' },
    EXPIRED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired', dot: 'bg-red-500' },
    CLOSED: { bg: 'bg-gray-200', text: 'text-gray-600', label: 'Closed', dot: 'bg-gray-500' }
  };
  return badges[status] || badges.LIVE;
};

const getTimeText = (poll) => {
  if (!poll.pollExpiryTime) return null;
  
  const now = new Date();
  const expiry = new Date(poll.pollExpiryTime);
  const diff = expiry - now;
  
  if (diff < 0) {
    const hours = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
    if (hours < 24) return `Expired ${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `Expired ${days}d ago`;
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours < 1) return `Ends in ${minutes}m`;
  if (hours < 24) return `Ends in ${hours}h ${minutes}m`;
  return null;
};

const PollCard = ({ poll }) => {
  const navigate = useNavigate();
  
  const sortedOptions = [...poll.options].sort((a, b) => b.votes - a.votes);
  const leader = sortedOptions[0];
  const status = poll.status || 'LIVE';
  const badge = getStatusBadge(status);
  const timeText = getTimeText(poll);
  const isClosed = status === 'EXPIRED' || status === 'CLOSED';

  return (
    <div
      onClick={() => navigate(`/poll/${poll.pollId}`)}
      className={`bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300 p-6 cursor-pointer group ${
        isClosed ? 'opacity-75' : 'hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-lg font-semibold line-clamp-2 flex-1 transition-colors ${
          isClosed ? 'text-slate-600' : 'text-slate-900 group-hover:text-indigo-600'
        }`}>
          {poll.question}
        </h3>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${badge.dot} ${status === 'LIVE' ? 'animate-pulse' : ''}`} />
          {badge.label}
        </div>
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
          <Users className="w-4 h-4" />
          <span>{poll.totalVotes} votes</span>
        </div>
      </div>

      {timeText && (
        <div className="text-xs text-slate-500 mb-3">{timeText}</div>
      )}

      {isClosed && (
        <div className="text-xs font-medium text-slate-500 mb-3">Voting closed</div>
      )}

      <div className="space-y-3 mb-4">
        {sortedOptions.slice(0, 2).map((option, idx) => {
          const percentage = poll.totalVotes > 0 
            ? Math.round((option.votes / poll.totalVotes) * 100) 
            : 0;
          
          return (
            <ProgressBar
              key={option.id}
              option={option}
              percentage={percentage}
              isLeading={idx === 0 && poll.totalVotes > 0}
              muted={isClosed}
            />
          );
        })}
      </div>

      {poll.totalVotes > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-slate-500">Leading</span>
          </div>
          <span className="text-sm font-semibold text-slate-900 truncate max-w-[150px]">
            {leader.text}
          </span>
        </div>
      )}
    </div>
  );
};

export default PollCard;
