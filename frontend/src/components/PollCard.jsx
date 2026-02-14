import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users } from 'lucide-react';
import LiveBadge from './LiveBadge';
import ProgressBar from './ProgressBar';

const PollCard = ({ poll }) => {
  const navigate = useNavigate();
  
  const sortedOptions = [...poll.options].sort((a, b) => b.votes - a.votes);
  const leader = sortedOptions[0];

  return (
    <div
      onClick={() => navigate(`/poll/${poll.pollId}`)}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
          {poll.question}
        </h3>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4">
        <LiveBadge isActive={poll.isActive} />
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{poll.totalVotes} votes</span>
        </div>
      </div>

      {/* Progress Bars - Top 2 options */}
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
            />
          );
        })}
      </div>

      {/* Leading Option */}
      {poll.totalVotes > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Leading</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
            {leader.text}
          </span>
        </div>
      )}
    </div>
  );
};

export default PollCard;
