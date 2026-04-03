import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  TicketCheck, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { adminAPI } from '../../api/admin';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
        <Icon size={48} className={color} />
    </div>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    hirers: 0,
    tickets: 0,
    activeTickets: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [usersData, businessesData, ticketsData] = await Promise.all([
          adminAPI.getUsers(),
          adminAPI.getBusinesses(),
          adminAPI.getTickets()
        ]);

        const allUsers = usersData || [];
        setStats({
          users: allUsers.length,
          hirers: (businessesData || []).length,
          tickets: (ticketsData || []).length,
          activeTickets: (ticketsData || []).filter(t => t.Status === 'open').length
        });
        
        // Filter for last 5 joined users
        const sortedUsers = [...allUsers].sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
        setRecentUsers(sortedUsers.slice(0, 5));

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-fade-in">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold tracking-tight">Gathering platform insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time overview of platform activity and growth.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.users} icon={Users} color="text-blue-500" />
        <StatCard title="Active Businesses" value={stats.hirers} icon={Building2} color="text-emerald-500" />
        <StatCard title="Support Tickets" value={stats.tickets} icon={TicketCheck} color="text-amber-500" />
        <StatCard title="Open Tickets" value={stats.activeTickets} icon={TrendingUp} color="text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Newly Joined Registered Users</h2>
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.ID} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Users size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold dark:text-white">{user.Username}</p>
                    <p className="text-xs text-slate-500">{new Date(user.CreatedAt).toLocaleDateString()} • {user.role || user.Role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.Status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {user.Status}
                    </span>
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && <p className="text-center py-4 text-slate-400">No recent activity</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="/admin/users" className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 hover:bg-blue-100 transition-colors group">
                <Users size={24} className="text-blue-600 mb-2" />
                <p className="text-sm font-bold text-blue-900 dark:text-blue-300">View Users</p>
                <p className="text-xs text-blue-600/70">Manage all registered accounts</p>
            </a>
            <a href="/admin/businesses" className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 hover:bg-emerald-100 transition-colors">
                <Building2 size={24} className="text-emerald-600 mb-2" />
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Verify Businesses</p>
                <p className="text-xs text-emerald-600/70">Approve pending hirer requests</p>
            </a>
            <a href="/admin/tickets" className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 hover:bg-amber-100 transition-colors">
                <TicketCheck size={24} className="text-amber-600 mb-2" />
                <p className="text-sm font-bold text-amber-900 dark:text-amber-300">Solve Tickets</p>
                <p className="text-xs text-amber-600/70">Address pending support issues</p>
            </a>
            <a href="/admin/profile" className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 transition-colors">
                <Users size={24} className="text-slate-600 dark:text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">Admin Settings</p>
                <p className="text-xs text-slate-500">Update your account preferences</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
