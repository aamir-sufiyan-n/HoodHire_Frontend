import React, { useState,useEffect } from 'react';
import { User, Mail, Shield, Camera, Lock, X, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../../api/admin/admin';
import { authAPI } from '../../api/auth';

const AdminProfile = () => {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [fetchingProfile, setFetchingProfile] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
    const [passwords, setPasswords] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const [profileData, permissionsData] = await Promise.all([
                    adminAPI.getAdminMe(),
                    authAPI.getMyPermissions()
                ]);
                
                setUser(profileData);
                // Extract keys where value is true
                const allowedPerms = Object.keys(permissionsData.permissions || {})
                    .filter(key => permissionsData.permissions[key] === true);
                setPermissions(allowedPerms);
                
                localStorage.setItem('user', JSON.stringify(profileData));
            } catch (err) {
                console.error('Failed to fetch profile data:', err);
                toast.error('Failed to load profile data');
                const localUser = JSON.parse(localStorage.getItem('user') || '{}');
                setUser(localUser);
            } finally {
                setFetchingProfile(false);
            }
        };
        fetchProfileData();
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (passwords.new_password !== passwords.confirm_password) {
            return toast.error('New passwords do not match');
        }

        if (passwords.new_password.length < 6) {
            return toast.error('New password must be at least 6 characters');
        }

        setLoading(true);
        try {
            await adminAPI.changePassword({
                old_password: passwords.old_password,
                new_password: passwords.new_password
            });
            toast.success('Password changed successfully');
            setShowPasswordModal(false);
            setPasswords({ old_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            toast.error(err.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

    if (fetchingProfile) {
        return (
            <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                <p className="text-slate-500 font-bold tracking-tight">Authenticating profile...</p>
            </div>
        );
    }

    if (!user) return null;

    const userRole = user.role || user.Role || 'ADMIN';

    return (
        <div className="max-w-4xl animate-fade-in space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Profile</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your administrator account credentials.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-md">
                    <Shield size={16} className="text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest">
                        {userRole}
                    </span>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a1d24] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-12 mb-6 inline-block">
                        <div className="w-24 h-24 rounded-lg bg-white dark:bg-[#0f1115] p-1 shadow-lg">
                            <div className="w-full h-full rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <User size={40} className="text-slate-400" />
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
                            <Shield size={14} className="text-emerald-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
                                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md">
                                    <User size={18} className="text-slate-400" />
                                    <span className="text-sm font-semibold dark:text-white uppercase tracking-tight">{user.username || user.Username || 'Admin'}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md">
                                    <Mail size={18} className="text-slate-400" />
                                    <span className="text-sm font-semibold dark:text-white">{user.email || user.Email || 'admin@hoodhire.com'}</span>
                                </div>
                            </div>

                            {permissions.length > 0 && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Allowed Access</label>
                                    <div className="flex flex-wrap gap-2">
                                        {permissions.map((perm) => (
                                            <span 
                                                key={perm} 
                                                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700"
                                            >
                                                {perm.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-end space-y-6">
                            <div className="p-4 bg-emerald-50/30 dark:bg-emerald-900/5 rounded-md border border-emerald-100/50 dark:border-emerald-900/10">
                                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-2 mb-2">
                                    <Shield size={16} /> Verified {capitalize(userRole)}
                                </h3>
                                <p className="text-xs text-emerald-700/70 dark:text-emerald-400/50 leading-relaxed">
                                    Your account (ID: {user.id || user.ID}) has full administrative privileges over users, businesses, and platform configurations.
                                </p>
                            </div>
                            
                            <button 
                                onClick={() => setShowPasswordModal(true)}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-bold rounded-md shadow-lg shadow-slate-900/10 transition-all text-sm group"
                            >
                                <KeyRound size={18} className="group-hover:rotate-12 transition-transform" />
                                Change {capitalize(userRole)} Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#1a1d24] w-full max-w-md rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Lock size={20} className="text-emerald-500" />
                                Change Password
                            </h3>
                            <button 
                                onClick={() => setShowPasswordModal(false)}
                                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input 
                                        type={showPasswords.old ? "text" : "password"}
                                        required
                                        className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white"
                                        value={passwords.old_password}
                                        onChange={(e) => setPasswords({...passwords, old_password: e.target.value})}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => togglePasswordVisibility('old')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        {showPasswords.old ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                                <div className="relative group">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input 
                                        type={showPasswords.new ? "text" : "password"}
                                        required
                                        className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white"
                                        value={passwords.new_password}
                                        onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => togglePasswordVisibility('new')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                                <div className="relative group">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input 
                                        type={showPasswords.confirm ? "text" : "password"}
                                        required
                                        className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white"
                                        value={passwords.confirm_password}
                                        onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-md hover:bg-slate-200 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProfile;
