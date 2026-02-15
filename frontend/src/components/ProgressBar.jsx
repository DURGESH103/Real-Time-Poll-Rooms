const ProgressBar = ({ option, percentage, isLeading, muted = false }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-sm font-medium truncate flex-1 ${
          muted ? 'text-gray-500' : 'text-gray-700'
        }`}>
          {option.text}
        </span>
        <span className={`text-sm font-bold ml-2 ${
          muted ? 'text-gray-600' : 'text-gray-900'
        }`}>
          {percentage}%
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            muted 
              ? 'bg-gray-300'
              : isLeading 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
