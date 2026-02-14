import { useNavigate } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-gray-300 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          This poll doesn't exist or the link is invalid.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            <Home className="w-5 h-5" />
            Go Home
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all"
          >
            <Search className="w-5 h-5" />
            Browse Polls
          </button>
        </div>
      </div>
    </div>
  );
}
