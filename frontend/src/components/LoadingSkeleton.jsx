const LoadingSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 rounded-lg w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
        ))}
      </div>
      <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
    </div>
  );
};

export default LoadingSkeleton;
