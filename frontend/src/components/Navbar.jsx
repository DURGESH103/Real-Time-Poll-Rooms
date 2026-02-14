import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Home, Plus } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:inline">Poll Rooms</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                isActive('/') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                isActive('/dashboard') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              onClick={() => navigate('/create')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
