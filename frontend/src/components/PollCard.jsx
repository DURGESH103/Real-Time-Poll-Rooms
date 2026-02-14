import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users } from 'lucide-react';
import LiveBadge from './LiveBadge';
import ProgressBar from './ProgressBar';

const PollCard = ({ poll }) => {
  const navigate = useNavigate();
  
  const sortedOptions = [...poll.options].sort((a, b) => b.votes - a.votes);
  const leader = sortedOptions[0];
  const isActive = !poll.isClosed && (!poll.pollExpiryTime || new Date(poll.pollExpiryTime) > new Date());

  return (
    <div
      onClick={() => navigate(`/poll/${poll.pollId}`)}
      className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 p-6 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 flex-1 group-hover:text-indigo-600 transition-colors">
          {poll.question}
        </h3>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <LiveBadge isActive={isActive} />
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
          <Users className="w-4 h-4" />
          <span>{poll.totalVotes} votes</span>
        </div>
      </div>

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
