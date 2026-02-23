const StatsCard = ({ icon: Icon, label, value, trend }) => {
  return (
    <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">{label}</p>
          <p className="text-5xl font-black bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-1">
            {value.toLocaleString()}
          </p>
          {trend && (
            <div className="flex items-center gap-2 mt-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs font-bold text-emerald-600">{trend}</p>
            </div>
          )}
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 group-hover:shadow-blue-500/60 transition-all group-hover:scale-110 group-hover:rotate-12">
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
