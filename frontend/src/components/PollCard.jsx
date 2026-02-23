import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, ArrowRight } from 'lucide-react';
import LiveBadge from './LiveBadge';
import ProgressBar from './ProgressBar';

const PollCard = ({ poll }) => {
  const navigate = useNavigate();
  
  const sortedOptions = [...poll.options].sort((a, b) => b.votes - a.votes);
  const leader = sortedOptions[0];
  const isExpired = poll.pollExpiryTime && new Date() > new Date(poll.pollExpiryTime);
  const isClosed = poll.isClosed || isExpired;

  return (
    <div
      onClick={() => navigate(`/poll/${poll.pollId}`)}
      className={`group relative bg-white/80 backdrop-blur-xl border-2 rounded-3xl shadow-xl transition-all duration-500 p-7 cursor-pointer overflow-hidden ${
        isClosed 
          ? 'border-slate-200 opacity-75 hover:opacity-90' 
          : 'border-slate-200/50 hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 hover:scale-[1.02]'
      }`}
    >
      {/* Animated Background Gradient */}
      {!isClosed && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500" />
        </>
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <h3 className={`text-xl font-bold line-clamp-2 flex-1 pr-4 transition-all duration-300 ${
            isClosed ? 'text-slate-600' : 'text-slate-900 group-hover:text-blue-600'
          }`}>
            {poll.question}
          </h3>
          {!isClosed && (
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-6">
          <LiveBadge poll={poll} />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 group-hover:bg-blue-50 rounded-xl transition-colors">
            <Users className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
              {poll.totalVotes.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-5">
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

        {/* Leader */}
        {poll.totalVotes > 0 && (
          <div className="flex items-center justify-between pt-5 border-t-2 border-slate-100 group-hover:border-blue-100 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-600">Leading</span>
            </div>
            <span className="text-sm font-black text-slate-900 truncate max-w-[150px] px-3 py-1 bg-slate-100 group-hover:bg-blue-50 rounded-lg transition-colors">
              {leader.text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollCard;
