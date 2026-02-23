import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = async () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40 ring-4 ring-white">
                <User className="w-16 h-16 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left sm:mb-4">
                <h1 className="text-3xl font-bold text-slate-900">{user?.email?.split('@')[0]}</h1>
                <p className="text-slate-500 font-medium mt-1">{user?.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user?.role === 'admin' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Account Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900 font-medium">{user?.email}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">User ID</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-900 font-mono text-sm">{user?.id?.slice(0, 16)}...</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Member Since</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-900 font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Security Settings
            </h2>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-2 block">Current Password</label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-2 block">New Password</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-2 block">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="Confirm new password"
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-green-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="px-4 py-3 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-600 font-medium">Password</p>
                  <p className="text-slate-900 font-semibold mt-1">••••••••••••</p>
                </div>
                <p className="text-sm text-slate-500">Click "Edit Profile" to change your password</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
