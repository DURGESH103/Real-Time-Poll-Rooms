import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Plus, Activity, CheckCircle2, TrendingUp } from 'lucide-react';
import axios from 'axios';
import PollCard from '../components/PollCard';
import StatsCard from '../components/StatsCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/polls`);
      console.log('✅ API Response:', response.data);
      console.log('✅ Polls count:', response.data.data?.length);
      setPolls(response.data.data || []);
    } catch (err) {
      console.error('❌ Error fetching polls:', err);
      setError(err.response?.data?.error?.message || 'Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const totalPolls = polls.length;
  const activePolls = polls.filter(p => !p.isClosed && (!p.pollExpiryTime || new Date(p.pollExpiryTime) > new Date())).length;
  const totalVotes = polls.reduce((sum, p) => sum + (p.totalVotes || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-10 bg-slate-200 rounded-xl w-1/3 animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
                <div className="h-8 bg-slate-200 rounded w-2/3" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded" />
                  <div className="h-4 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-slate-900">Poll Dashboard</h1>
                <p className="text-sm font-medium text-slate-500 mt-0.5">Real-time voting platform</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/create')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>Create Poll</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
            <p className="text-rose-800 font-medium">{error}</p>
            <button
              onClick={fetchPolls}
              className="mt-3 text-sm text-rose-600 hover:text-rose-700 font-semibold underline"
            >
              Try Again
            </button>
          </div>
        )}

        {!error && polls.length > 0 && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Your Polls</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {polls.map(poll => (
                  <PollCard key={poll.pollId} poll={poll} />
                ))}
              </div>
            </div>
          </>
        )}

        {!error && polls.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/10">
              <BarChart3 className="w-12 h-12 text-indigo-600" />
            </div>
            <h3 className="text-3xl font-semibold text-slate-900 mb-3">Create your first poll</h3>
            <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto">
              Get started by creating a poll. Share the link and watch votes come in real-time!
            </p>
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Create Your First Poll
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
