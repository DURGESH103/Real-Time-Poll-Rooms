import { TrendingUp, Users } from 'lucide-react';
import VoteOption from './VoteOption';

const ResultsChart = ({ poll, hasVoted, selectedOption }) => {
  const sortedOptions = [...poll.options].sort((a, b) => b.votes - a.votes);
  const winner = sortedOptions[0];

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Total Votes</p>
            <p className="text-2xl font-bold text-gray-900">{poll.totalVotes}</p>
          </div>
        </div>
        
        {poll.totalVotes > 0 && (
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div className="text-right">
              <p className="text-sm text-gray-600">Leading</p>
              <p className="text-lg font-semibold text-gray-900 truncate max-w-[150px]">
                {winner.text}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-3">
        {poll.options.map((option) => (
          <VoteOption
            key={option.id}
            option={option}
            totalVotes={poll.totalVotes}
            selected={hasVoted && selectedOption === option.id}
            disabled={true}
            showResults={true}
          />
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
