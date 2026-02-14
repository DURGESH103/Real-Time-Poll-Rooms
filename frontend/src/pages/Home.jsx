import { useNavigate } from 'react-router-dom';
import { Sparkles, Users, Zap, Shield, TrendingUp, ArrowRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Real-Time Polling Made Simple
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Create Polls.<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Watch Votes Live.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Build engaging polls in seconds. Share a link. See results update in real-time. 
            No signup required.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/create')}
              className="group w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
            >
              Create Free Poll
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all border-2 border-gray-200 hover:border-gray-300"
            >
              View All Polls
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-600 mt-1">Free Forever</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">&lt;1s</div>
              <div className="text-sm text-gray-600 mt-1">Vote Speed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">Real-Time</div>
              <div className="text-sm text-gray-600 mt-1">Updates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-600">
            Powerful features for effortless polling
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600">
              Create polls in seconds. No forms, no hassle. Just type and share.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Results</h3>
            <p className="text-gray-600">
              Watch votes pour in live. No refresh needed. WebSocket magic.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Anti-Abuse</h3>
            <p className="text-gray-600">
              Device fingerprinting and IP limits prevent spam and duplicate votes.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Beautiful Charts</h3>
            <p className="text-gray-600">
              Animated progress bars and clean stats make results easy to read.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Shareable Links</h3>
            <p className="text-gray-600">
              Every poll gets a unique URL. Share anywhere, vote from any device.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Ready</h3>
            <p className="text-gray-600">
              Responsive design works perfectly on phones, tablets, and desktops.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Create your first poll in under 30 seconds
          </p>
          <button
            onClick={() => navigate('/create')}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Create Poll Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>Built with React, Node.js, Socket.io & MongoDB</p>
          <p className="text-sm mt-2">© 2024 Real-Time Poll Rooms. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
