import { Check } from 'lucide-react';

const VoteOption = ({ option, totalVotes, selected, onSelect, disabled, showResults }) => {
  const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

  return (
    <button
      onClick={() => !disabled && onSelect(option.id)}
      disabled={disabled}
      className={`
        relative w-full p-4 rounded-xl border-2 transition-all duration-300 text-left overflow-hidden min-h-[56px]
        ${selected 
          ? 'border-blue-600 bg-blue-50 shadow-md scale-[1.02]' 
          : 'border-gray-200 hover:border-blue-400 hover:shadow-md bg-white'
        }
        ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'}
      `}
    >
      {/* Progress Bar Background */}
      {showResults && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50 transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      )}

      {/* Content */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {selected && (
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 animate-scale-in">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="font-medium text-gray-900 text-base sm:text-lg">{option.text}</span>
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
