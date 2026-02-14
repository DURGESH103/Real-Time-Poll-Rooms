import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import PollForm from '../components/PollForm';
import ShareLink from '../components/ShareLink';
import ErrorMessage from '../components/ErrorMessage';
import { pollAPI } from '../services/api';

const CreatePoll = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdPoll, setCreatedPoll] = useState(null);

  const handleCreatePoll = async (pollData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await pollAPI.create(pollData);
      
      setCreatedPoll(response.data);
      toast.success('Poll created successfully!');
    } catch (err) {
      setError(err.message || 'Failed to create poll');
      toast.error(err.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPoll = () => {
    navigate(`/poll/${createdPoll.pollId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl mb-5 shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold text-slate-900 mb-3">Create New Poll</h1>
          <p className="text-slate-500 font-medium text-base sm:text-lg">
            Get instant feedback with real-time results
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-10">
          {!createdPoll ? (
            <>
              {error && (
                <div className="mb-8">
                  <ErrorMessage message={error} onRetry={() => setError(null)} />
                </div>
              )}
              <PollForm onSubmit={handleCreatePoll} loading={loading} />
            </>
          ) : (
            <div className="space-y-8">
              <div className="text-center py-8">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-3">
                  Poll Created!
                </h2>
                <p className="text-slate-500 font-medium">
                  Share the link below to start collecting votes
                </p>
              </div>

              <ShareLink url={createdPoll.shareUrl} />

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4 text-lg">{createdPoll.question}</h3>
                <div className="space-y-3">
                  {createdPoll.options.map((opt, i) => (
                    <div key={opt.id} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                      <span className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-xs">
                        {i + 1}
                      </span>
                      {opt.text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleViewPoll}
                  className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all hover:scale-105 active:scale-95"
                >
                  View Poll
                </button>
                <button
                  onClick={() => {
                    setCreatedPoll(null);
                    setError(null);
                  }}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-sm font-medium text-slate-500">
          Free • No sign-up required • Polls auto-expire
        </p>
      </div>
    </div>
  );
};

export default CreatePoll;
