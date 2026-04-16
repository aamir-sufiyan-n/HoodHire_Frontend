// src/components/admin/WebConfig.jsx
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Loader2, 
  CheckCircle2, 
  Info,
  Zap,
  Globe,
  AlertCircle
} from 'lucide-react';
import { configAPI } from '../../api/admin/config';
import { toast } from 'react-hot-toast';

const WebConfig = () => {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingKey, setUpdatingKey] = useState(null);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const data = await configAPI.getConfigs();
            setConfigs(data.configs || []);
        } catch (err) {
            console.error('Failed to fetch configurations:', err);
            toast.error(err.message || 'Failed to load system settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const handleToggle = async (key, currentStatus) => {
        if (updatingKey) return;
        
        const newStatus = !currentStatus;
        setUpdatingKey(key);

        try {
            // Optimistic Update
            setConfigs(prev => prev.map(c => c.Key === key ? { ...c, IsActive: newStatus } : c));
            
            await configAPI.toggleConfig(key, newStatus);
            toast.success(`${key.split('_').join(' ').toUpperCase()} status updated`);
        } catch (err) {
            console.error('Failed to toggle configuration:', err);
            toast.error(err.message || 'Failed to update configuration');
            // Rollback
            setConfigs(prev => prev.map(c => c.Key === key ? { ...c, IsActive: currentStatus } : c));
        } finally {
            setUpdatingKey(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                <p className="text-slate-500 font-bold">Initializing System Configurations...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Globe className="text-emerald-500" /> Web Configuration
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Control global system features and platform access.</p>
                </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1a1d24] overflow-hidden shadow-sm">
                <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                    {configs.map((config) => (
                        <div 
                            key={config.ID}
                            className={`px-6 py-5 flex items-center justify-between transition-colors group ${
                                config.IsActive 
                                ? 'bg-emerald-500/[0.01]' 
                                : 'opacity-70'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
                                    config.IsActive 
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                }`}>
                                    <Settings size={18} className={updatingKey === config.Key ? 'animate-spin' : ''} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">
                                        {config.Label || config.Key.split('_').join(' ').toUpperCase()}
                                    </h3>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                        {config.Key} • Updated {new Date(config.UpdatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="hidden sm:block">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${config.IsActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        {config.IsActive ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                                
                                <button
                                    onClick={() => handleToggle(config.Key, config.IsActive)}
                                    disabled={updatingKey === config.Key}
                                    className={`w-10 h-5 rounded-full p-1 transition-all duration-300 relative ${
                                        config.IsActive 
                                        ? 'bg-emerald-500 shadow-md shadow-emerald-500/20' 
                                        : 'bg-slate-300 dark:bg-slate-700'
                                    }`}
                                >
                                    <div className={`w-3 h-3 rounded-full bg-white transition-all duration-300 shadow-sm ${
                                        config.IsActive ? 'translate-x-5' : 'translate-x-0'
                                    }`} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl flex items-start gap-4">
                <div className="p-3 bg-white dark:bg-[#1a1d24] rounded-lg shadow-sm">
                    <Info size={24} className="text-blue-500" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Global Configuration Impact</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
                        Disabling a system-wide feature will immediately restrict access for all users. For example, disabling "User Registration" will prevent new sign-ups globally. These changes are logged and audited in real-time.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WebConfig;
