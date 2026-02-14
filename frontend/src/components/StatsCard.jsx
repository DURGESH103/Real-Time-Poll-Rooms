const StatsCard = ({ icon: Icon, label, value, trend }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          <p className="text-3xl font-semibold text-slate-900">{value}</p>
          {trend && (
            <p className="text-xs text-emerald-600 mt-1 font-medium">{trend}</p>
          )}
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
