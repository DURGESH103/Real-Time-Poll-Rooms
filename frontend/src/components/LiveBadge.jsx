const LiveBadge = ({ isActive }) => {
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
      isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
    }`}>
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
      <span>{isActive ? 'Live' : 'Closed'}</span>
    </div>
  );
};

export default LiveBadge;
