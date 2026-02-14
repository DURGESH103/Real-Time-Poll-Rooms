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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PlusCircle className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Create Poll</h1>
          </div>
          <p className="text-gray-600">
            Create a poll and share it with anyone. Get real-time results instantly.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
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
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Poll Created Successfully!
                </h2>
                <p className="text-gray-600">
                  Share the link below to start collecting votes
                </p>
              </div>

              <ShareLink url={createdPoll.shareUrl} />

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{createdPoll.question}</h3>
                <ul className="space-y-1">
                  {createdPoll.options.map((opt) => (
                    <li key={opt.id} className="text-sm text-gray-600">
                      • {opt.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleViewPoll}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  View Poll
                </button>
                <button
                  onClick={() => {
                    setCreatedPoll(null);
                    setError(null);
                  }}
                  className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Polls are stored for 30 days • No registration required</p>
        </div>
      </div>
    </div>
  );
};

export default CreatePoll;
