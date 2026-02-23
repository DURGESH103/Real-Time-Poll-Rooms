import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Shield, ArrowRight, BarChart3, CheckCircle2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl border-2 border-blue-200/50 rounded-full text-sm font-bold text-blue-700 mb-8 shadow-lg shadow-blue-500/20">
                  <Sparkles className="w-4 h-4" />
                  Real-Time Polling Platform
                </div>
                
                <h1 className="text-6xl lg:text-7xl font-black text-slate-900 mb-6 leading-tight">
                  Create Polls.
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Watch Live.
                  </span>
                </h1>
                
                <p className="text-xl text-slate-600 font-medium mb-10 leading-relaxed">
                  Build engaging polls in seconds. Share instantly. See results update in real-time with WebSocket technology.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate('/create')}
                    className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    Create Free Poll
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-10 py-5 bg-white/90 backdrop-blur-xl border-2 border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded-2xl font-black text-lg hover:scale-105 transition-all duration-300 shadow-xl"
                  >
                    View Dashboard
                  </button>
                </div>
              </div>
              
              <div className="hidden lg:block animate-in fade-in slide-in-from-bottom-8 duration-700 animation-delay-200">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-3xl opacity-20" />
                  <GlassCard className="relative p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900">Live Poll</div>
                        <div className="text-sm text-slate-500 font-semibold">Real-time results</div>
                      </div>
                      <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border-2 border-emerald-200 rounded-full">
                        <div className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <span className="text-xs font-black text-emerald-700">Live</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[{ label: 'Option A', value: 65 }, { label: 'Option B', value: 35 }].map((opt, i) => (
                        <div key={i}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-bold text-slate-700">{opt.label}</span>
                            <span className="text-sm font-black text-slate-900 px-2 py-0.5 bg-slate-100 rounded-lg">{opt.value}%</span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${
                                i === 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30' : 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30'
                              }`}
                              style={{ width: `${opt.value}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t-2 border-slate-100 flex items-center justify-between">
                      <span className="text-sm text-slate-600 font-semibold">156 votes</span>
                      <span className="text-sm font-black text-emerald-600 px-3 py-1 bg-emerald-50 rounded-lg">Leading: Option A</span>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features for modern polling
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <GlassCard className="p-8 group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Real-Time Updates</h3>
              <p className="text-gray-600 leading-relaxed">
                Watch votes pour in live with WebSocket technology. No refresh needed, instant synchronization.
              </p>
            </GlassCard>

            <GlassCard className="p-8 group">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Fair Voting</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced anti-abuse with device fingerprinting and IP rate limiting. Secure and reliable.
              </p>
            </GlassCard>

            <GlassCard className="p-8 group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Instant Sharing</h3>
              <p className="text-gray-600 leading-relaxed">
                Every poll gets a unique shareable link. Copy and share anywhere in seconds.
              </p>
            </GlassCard>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to get started
            </p>
          </div>

          <div className="space-y-8">
            {[
              { step: '01', title: 'Create Your Poll', desc: 'Add your question and options in seconds' },
              { step: '02', title: 'Share the Link', desc: 'Copy and share your unique poll URL' },
              { step: '03', title: 'Watch Live Results', desc: 'See votes update in real-time' }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                  {item.step}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-lg text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 lg:p-16 text-center shadow-2xl shadow-blue-500/30">
            <div className="relative">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Create your first poll in under 30 seconds. No signup required.
              </p>
              <button
                onClick={() => navigate('/create')}
                className="inline-flex items-center gap-2 px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Create Poll Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600">Built with React, Node.js, Socket.io & MongoDB</p>
            <p className="text-sm text-gray-500 mt-2">© 2024 Real-Time Poll Rooms</p>
          </div>
        </div>
      </div>
  );
}
