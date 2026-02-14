import { Check } from 'lucide-react';

const VoteOption = ({ option, totalVotes, selected, onSelect, disabled, showResults }) => {
  const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

  return (
    <button
      onClick={() => !disabled && onSelect(option.id)}
      disabled={disabled}
      className={`
        relative w-full p-4 rounded-lg border-2 transition-all text-left overflow-hidden
        ${selected 
          ? 'border-blue-600 bg-blue-50' 
          : 'border-gray-300 hover:border-blue-400 bg-white'
        }
        ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
      `}
    >
      {/* Progress Bar Background */}
      {showResults && (
        <div 
          className="absolute inset-0 bg-blue-100 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      )}

      {/* Content */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {selected && (
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="font-medium text-gray-900">{option.text}</span>
        </div>
        
        {showResults && (
          <div className="flex items-center gap-3 ml-4">
            <span className="text-sm font-semibold text-gray-700">
              {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
            </span>
            <span className="text-lg font-bold text-blue-600 min-w-[3rem] text-right">
              {percentage}%
            </span>
          </div>
        )}
      </div>
    </button>
  );
};

export default VoteOption;
