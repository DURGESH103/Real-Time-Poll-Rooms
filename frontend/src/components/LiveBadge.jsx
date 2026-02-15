const LiveBadge = ({ poll }) => {
  const isExpired = poll?.pollExpiryTime && new Date() > new Date(poll.pollExpiryTime);
  const isClosed = poll?.isClosed;

  if (isExpired) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-200">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <span>Expired</span>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-gray-200 text-gray-600 border-gray-300">
        <div className="w-2 h-2 rounded-full bg-gray-400" />
        <span>Closed</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span>Live</span>
    </div>
  );
};

export default LiveBadge;
