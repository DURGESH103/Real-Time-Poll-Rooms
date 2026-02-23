import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Plus, Activity, TrendingUp, RefreshCw } from 'lucide-react';
import { pollAPI } from '../services/api';
import PollCard from '../components/PollCard';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async (showToast = false) => {
    try {
      setLoading(true);
      const response = await pollAPI.getAll();
      setPolls(response.data || []);
      if (showToast) toast.success('Polls refreshed');
    } catch (err) {
      console.error('❌ Error fetching polls:', err);
      toast.error(err.message || 'Failed to load polls');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPolls(true);
  };

  const totalPolls = polls.length;
  const activePolls = polls.filter(p => p.status === 'LIVE' || p.status === 'ENDING_SOON').length;
  const totalVotes = polls.reduce((sum, p) => sum + (p.totalVotes || 0), 0);

  if (loading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Dashboard</h1>
                <p className="text-sm font-semibold text-slate-500 mt-0.5">Manage your polls</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                title="Refresh polls"
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => navigate('/create')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Create Poll</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {polls.length > 0 ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <StatsCard 
                icon={BarChart3} 
                label="Total Polls" 
                value={totalPolls}
              />
              <StatsCard 
                icon={Activity} 
                label="Active Polls" 
                value={activePolls}
                trend={activePolls > 0 ? `${activePolls} live now` : null}
              />
              <StatsCard 
                icon={TrendingUp} 
                label="Total Votes" 
                value={totalVotes}
              />
            </div>

            {/* Poll Grid */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Polls</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {polls.map((poll, index) => (
                  <div 
                    key={poll.pollId} 
                    className="animate-in fade-in slide-in-from-bottom-8 duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <PollCard poll={poll} />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/20">
              <BarChart3 className="w-16 h-16 text-blue-600" />
            </div>
            <h3 className="text-4xl font-bold text-slate-900 mb-4">Create your first poll</h3>
            <p className="text-lg text-slate-600 font-medium mb-10 max-w-md mx-auto">
              Get started by creating a poll. Share the link and watch votes come in real-time!
            </p>
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-6 h-6" />
              Create Your First Poll
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
