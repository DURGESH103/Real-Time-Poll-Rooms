import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Plus } from 'lucide-react';
import axios from 'axios';
import PollCard from '../components/PollCard';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Poll Dashboard</h1>
                <p className="text-sm text-gray-600">Real-time voting platform</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/create')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Create Poll</span>
            </button>
          </div>
        </div>
      </div>

      {/* Poll Grid */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchPolls}
              className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium underline"
            >
              Try Again
            </button>
          </div>
        )}

        {!error && polls.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map(poll => (
              <PollCard key={poll.pollId} poll={poll} />
            ))}
          </div>
        )}

        {!error && polls.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No polls yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create your first poll to get started. Share the link and watch votes come in real-time!
            </p>
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all hover:scale-105"
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
