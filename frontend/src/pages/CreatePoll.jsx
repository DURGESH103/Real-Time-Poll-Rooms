import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <span className="text-sm font-medium">← Back to Dashboard</span>
        </button>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <PlusCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Create Your Poll</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Get instant feedback with real-time results
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {!createdPoll ? (
            <>
              {error && (
                <div className="mb-6">
                  <ErrorMessage message={error} onRetry={() => setError(null)} />
                </div>
              )}
              <PollForm onSubmit={handleCreatePoll} loading={loading} />
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75" />
                  <div className="relative w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Poll Created!
                </h2>
                <p className="text-gray-600">
                  Share the link below to start collecting votes
                </p>
              </div>

              <ShareLink url={createdPoll.shareUrl} />

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">{createdPoll.question}</h3>
                <div className="space-y-2">
                  {createdPoll.options.map((opt, i) => (
                    <div key={opt.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-xs">
                        {i + 1}
                      </span>
                      {opt.text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleViewPoll}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  View Poll
                </button>
                <button
                  onClick={() => {
                    setCreatedPoll(null);
                    setError(null);
                  }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-gray-500">
          Free • No sign-up required • Polls expire in 30 days
        </p>
      </div>
    </div>
  );
};

export default CreatePoll;
