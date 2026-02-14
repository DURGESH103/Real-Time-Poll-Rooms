const ProgressBar = ({ option, percentage, isLeading }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 truncate flex-1">
          {option.text}
        </span>
        <span className="text-sm font-bold text-gray-900 ml-2">
          {percentage}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isLeading 
              ? 'bg-gradient-to-r from-green-500 to-green-600' 
              : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
