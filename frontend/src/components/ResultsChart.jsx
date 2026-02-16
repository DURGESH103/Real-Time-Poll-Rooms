import { TrendingUp, Users } from 'lucide-react';
import VoteOption from './VoteOption';

const ResultsChart = ({ poll, hasVoted, selectedOption }) => {
  const sortedOptions = [...poll.options].sort((a, b) => b.votes - a.votes);
  const winner = sortedOptions[0];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Votes</p>
              <p className="text-2xl font-bold text-gray-900">{poll.totalVotes}</p>
            </div>
          </div>
        </div>
        
        {poll.totalVotes > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 font-medium">Leading</p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {winner.text}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-3">
        {poll.options.map((option, index) => (
          <div 
            key={option.id}
            style={{ animationDelay: `${index * 100}ms` }}
            className="animate-slide-up"
          >
            <VoteOption
              option={option}
              totalVotes={poll.totalVotes}
              selected={hasVoted && selectedOption === option.id}
              disabled={true}
              showResults={true}
            />
          </div>
        ))}
      </div>

      {/* Live Indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Live results updating in real-time</span>
      </div>
    </div>
  );
};

export default ResultsChart;
