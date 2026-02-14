const LiveBadge = ({ isActive }) => {
  const isPollActive = isActive !== undefined 
    ? isActive 
    : true;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
      isPollActive
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        : 'bg-slate-100 text-slate-600 border-slate-200'
    }`}>
      <div className={`w-2 h-2 rounded-full ${isPollActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
      <span>{isPollActive ? 'Live' : 'Closed'}</span>
    </div>
  );
};

export default LiveBadge;
