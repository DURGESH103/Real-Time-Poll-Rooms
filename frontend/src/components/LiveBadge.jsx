const LiveBadge = ({ isActive }) => {
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
      isActive 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        : 'bg-gray-100 text-gray-600 border-gray-200'
    }`}>
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
      <span>{isActive ? 'Live' : 'Closed'}</span>
    </div>
  );
};

export default LiveBadge;
