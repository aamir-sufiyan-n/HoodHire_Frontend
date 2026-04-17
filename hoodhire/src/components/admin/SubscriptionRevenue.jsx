import React, { useState, useEffect } from 'react';
import { 
    CreditCard, 
    TrendingUp, 
    Calendar, 
    Search, 
    Filter, 
    ArrowUpRight, 
    ArrowDownRight, 
    Loader2, 
    Clock, 
    IndianRupee, 
    Users,
    Download,
    AlertCircle
} from 'lucide-react';
import { 
    ResponsiveContainer, 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    AreaChart, 
    Area 
} from 'recharts';
import { adminAPI } from '../../api/admin/admin';
import { toast } from 'react-hot-toast';

const SubscriptionRevenue = () => {
    const [loading, setLoading] = useState(true);
    const [revenueStats, setRevenueStats] = useState({
        total: 0,
        monthly: []
    });
    const [subscriptions, setSubscriptions] = useState([]);
    const [filtering, setFiltering] = useState({
        status: 'all',
        daysToExpiry: '',
        search: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        total: 0,
        limit: 10
    });

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [totalRes, monthlyRes, subsRes] = await Promise.all([
                adminAPI.getTotalRevenue(),
                adminAPI.getMonthlyRevenue(),
                adminAPI.getSubscriptions({ 
                    page: pagination.currentPage, 
                    limit: pagination.limit,
                    status: filtering.status !== 'all' ? filtering.status : undefined,
                    search: filtering.search || undefined
                })
            ]);

            setRevenueStats({
                total: totalRes?.total_revenue || 0,
                monthly: (monthlyRes?.monthly_revenue || []).map(item => ({
                    month: new Date(item.Month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                    amount: item.Amount / 100 // Convert paise to INR
                }))
            });

            // If we have an "expiring soon" filter, fetch that specifically
            let finalSubs = subsRes?.subscriptions || [];
            if (filtering.daysToExpiry) {
                try {
                    const expiringRes = await adminAPI.getSubscriptionsExpiring(filtering.daysToExpiry);
                    finalSubs = expiringRes?.subscriptions || [];
                } catch (err) {
                    console.error('Expiring fetch failed:', err);
                }
            }

            setSubscriptions(finalSubs);
            setPagination(prev => ({ ...prev, total: subsRes?.total || finalSubs.length }));

        } catch (err) {
            console.error('Failed to fetch revenue data:', err);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [filtering, pagination.currentPage]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amount);
    };

    if (loading && revenueStats.monthly.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40 animate-fade-in">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                <p className="text-slate-500 font-bold tracking-tight">Processing revenue insights...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                        <TrendingUp className="text-emerald-600" /> Subscription & Revenue
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">
                        Comprehensive analytics for platform subscriptions and financial growth.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                        <Download size={14} /> Export CSV
                    </button>
                    <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-sm">
                        Refresh Stats
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600">
                            <IndianRupee size={24} />
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                            <ArrowUpRight size={14} /> +12.5%
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Revenue</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                        {formatCurrency(revenueStats.total)}
                    </h3>
                </div>

                <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 text-left">
                            <Calendar size={24} />
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 font-bold text-xs">
                            Current Month
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Monthly Revenue</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                        {formatCurrency(revenueStats.monthly[revenueStats.monthly.length - 1]?.amount || 0)}
                    </h3>
                </div>

                <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                            <CreditCard size={24} />
                        </div>
                        <div className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                            Real-time
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active Subscriptions</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                        {pagination.total}
                    </h3>
                </div>
            </div>
            {/* Middle Section: Chart */}
            <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Growth</h3>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Growth trend across the last several months.</p>
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueStats.monthly}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={document.documentElement.classList.contains('dark') ? '#262933' : '#f1f5f9'} />
                            <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                                tickFormatter={(val) => `₹${val}`}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#ffffff', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                                }}
                                itemStyle={{ color: '#059669', fontSize: '12px', fontWeight: 800 }}
                                labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px', fontWeight: 700 }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="amount" 
                                stroke="#059669" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorAmount)" 
                                dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Subscriptions List */}
            <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-left">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Subscriptions</h3>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Detailed breakdown of current business plans.</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 lg:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search by hirer or plan..." 
                                    value={filtering.search}
                                    onChange={(e) => setFiltering({...filtering, search: e.target.value})}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:text-white font-medium shadow-inner"
                                />
                            </div>
                            
                            <select 
                                value={filtering.status}
                                onChange={(e) => setFiltering({...filtering, status: e.target.value})}
                                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-inner"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <select 
                                value={filtering.daysToExpiry}
                                onChange={(e) => setFiltering({...filtering, daysToExpiry: e.target.value})}
                                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-inner"
                            >
                                <option value="">Expiry Filter</option>
                                <option value="7">Next 7 Days</option>
                                <option value="30">Next 30 Days</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4">Hirer</th>
                                <th className="px-6 py-4">Plan Details</th>
                                <th className="px-6 py-4">Payment Info</th>
                                <th className="px-6 py-4">Period</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-left">
                            {subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <CreditCard size={48} />
                                            <span className="text-sm font-bold">No matching subscriptions found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                subscriptions.map((sub) => (
                                    <tr key={sub.ID} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center font-bold text-emerald-600 text-sm shadow-sm border border-emerald-100 dark:border-emerald-800/30">
                                                    {(sub.Hirer?.FullName || 'U').charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{sub.Hirer?.FullName || 'Unknown Hirer'}</span>
                                                    <span className="text-[10px] font-medium text-slate-500">{sub.Hirer?.PhoneNumber || 'No Phone'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{sub.Plan?.Name || 'N/A'}</span>
                                                <span className="text-[11px] font-bold text-emerald-600">{formatCurrency(sub.Amount / 100)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 font-mono tracking-tighter uppercase">{sub.RazorPayOrderID || 'ORDER_ID'}</span>
                                                <span className="text-[10px] text-slate-400 italic">via RazorPay</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                                    <Calendar size={12} className="text-slate-400" /> {new Date(sub.StartDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-500">
                                                    <Clock size={12} className="text-rose-400" /> Ends {new Date(sub.EndDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                                                sub.Status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                                sub.Status === 'expired' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' :
                                                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                                {sub.Status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination placeholder */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Showing {subscriptions.length} of {pagination.total} subscriptions</span>
                    <div className="flex gap-2">
                        <button 
                            disabled={pagination.currentPage === 1}
                            onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
                            className="px-3 py-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-100 transition-all disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <button 
                            disabled={subscriptions.length < pagination.limit}
                            onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
                            className="px-3 py-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-100 transition-all disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionRevenue;
