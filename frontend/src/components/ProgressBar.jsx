const ProgressBar = ({ option, percentage, isLeading, muted = false }) => {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-bold truncate flex-1 transition-colors ${
          muted ? 'text-slate-500' : 'text-slate-700 group-hover:text-slate-900'
        }`}>
          {option.text}
        </span>
        <span className={`text-sm font-black ml-3 px-2 py-0.5 rounded-lg transition-all ${
          muted 
            ? 'text-slate-600 bg-slate-100' 
            : isLeading
              ? 'text-emerald-700 bg-emerald-100 group-hover:bg-emerald-200'
              : 'text-blue-700 bg-blue-100 group-hover:bg-blue-200'
        }`}>
          {percentage}%
        </span>
      </div>
      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
            muted 
              ? 'bg-slate-300'
              : isLeading 
                ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/30' 
                : 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 shadow-lg shadow-blue-500/30'
          }`}
          style={{ width: `${percentage}%` }}
        >
          {!muted && percentage > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
