import React from 'react';
import { User, Mail, Shield, Camera } from 'lucide-react';

const AdminProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="max-w-4xl animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your administrator account settings.</p>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6 inline-block">
            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-[#0f1115] p-1 shadow-lg">
                <div className="w-full h-full rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <User size={40} className="text-slate-400" />
                </div>
            </div>
            <button className="absolute bottom-1 right-1 p-2 bg-white dark:bg-slate-700 rounded-lg shadow-md border border-slate-200 dark:border-slate-600 text-emerald-600">
                <Camera size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Username</label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg">
                        <User size={18} className="text-slate-400" />
                        <span className="text-sm font-medium dark:text-white">{user.Username || 'Admin'}</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg">
                        <Mail size={18} className="text-slate-400" />
                        <span className="text-sm font-medium dark:text-white">{user.Email || 'admin@hoodhire.com'}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Role Permissions</label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-lg">
                        <Shield size={18} className="text-emerald-600" />
                        <span className={`text-sm font-bold text-emerald-600 uppercase tracking-wider`}>
                            {user.role || user.Role || 'ADMINISTRATOR'}
                        </span>
                    </div>
                </div>

                <div className="pt-4">
                    <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg shadow-emerald-600/20 transition-all text-sm">
                        Update Settings
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
