import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  TicketCheck,
  TrendingUp,
  Loader2,
  Briefcase,
  Shield,
  ArrowRight,
  IndianRupee
} from 'lucide-react';
import { adminAPI } from '../../api/admin/admin';
import { authAPI } from '../../api/auth';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
      <Icon size={48} className={color} />
    </div>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2.5 rounded-md bg-slate-50 dark:bg-slate-800`}>
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
  const [permissions, setPermissions] = useState({});
  const [stats, setStats] = useState({
    users: 0,
    hirers: 0,
    jobs: 0,
    tickets: 0,
    activeTickets: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const permsData = await authAPI.getMyPermissions();
        const perms = permsData.permissions || {};
        setPermissions(perms);

        const requests = [];

        if (perms.user_management) {
          requests.push(
            adminAPI.getUsers()
              .then(data => {
                const usersList = Array.isArray(data) ? data : (data.users || []);
                const totalCount = data.total || data.length || usersList.length || 0;
                setStats(prev => ({ ...prev, users: totalCount }));
                setRecentUsers(usersList.slice(0, 5));
              })
              .catch(err => console.error('Users stat error:', err))
          );
        }

        if (perms.business_management) {
          requests.push(
            adminAPI.getBusinesses()
              .then(data => {
                const bizList = Array.isArray(data) ? data : (data.businesses || []);
                const totalCount = data.total || data.length || bizList.length || 0;
                setStats(prev => ({ ...prev, hirers: totalCount }));
              })
              .catch(err => console.error('Businesses stat error:', err))
          );
        }

        if (perms.jobs_management) {
          requests.push(
            adminAPI.getJobs()
              .then(data => setStats(prev => ({ ...prev, jobs: data.jobs?.length || 0 })))
              .catch(err => console.error('Jobs stat error:', err))
          );
        }

        if (perms.ticket_management) {
          requests.push(
            adminAPI.getTickets()
              .then(data => {
                const tickets = data.tickets || [];
                setStats(prev => ({
                  ...prev,
                  tickets: data.total || tickets.length,
                  activeTickets: tickets.filter(t => t.Status === 'open').length
                }));
              })
              .catch(err => console.error('Tickets stat error:', err))
          );
        }
        
        if (perms.subscription_management) {
          requests.push(
            adminAPI.getTotalRevenue()
              .then(data => setStats(prev => ({ ...prev, revenue: data.total_revenue || 0 })))
              .catch(err => console.error('Revenue stat error:', err))
          );
        }

        await Promise.all(requests);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-fade-in">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold tracking-tight">Gathering platform insights...</p>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'View Users',
      desc: 'Manage and audit accounts',
      path: '/admin/users',
      permission: 'user_management',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Verify Businesses',
      desc: 'Approve pending hirers',
      path: '/admin/businesses',
      permission: 'business_management',
      icon: Building2,
      color: 'emerald'
    },
    {
      title: 'Platform Jobs',
      desc: 'Audit recent postings',
      path: '/admin/jobs',
      permission: 'jobs_management',
      icon: Briefcase,
      color: 'indigo'
    },
    {
      title: 'Solve Tickets',
      desc: 'Address user issues',
      path: '/admin/tickets',
      permission: 'ticket_management',
      icon: TicketCheck,
      color: 'amber'
    },
      {
        title: 'Account Settings',
        desc: 'Security & Preferences',
        path: '/admin/profile',
        permission: null,
        icon: Shield,
        color: 'slate'
      },
      {
        title: 'Subscription Revenue',
        desc: 'Financial growth & plans',
        path: '/admin/revenue',
        permission: 'subscription_management',
        icon: IndianRupee,
        color: 'emerald'
      }
    ].filter(action => !action.permission || permissions[action.permission] === true);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time overview of platform activity and growth.</p>
        </div>
      </div>

      {/* Conditional Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {permissions.user_management && (
          <StatCard title="Total Users" value={stats.users} icon={Users} color="text-blue-500" />
        )}
        {permissions.business_management && (
          <StatCard title="Active Businesses" value={stats.hirers} icon={Building2} color="text-emerald-500" />
        )}
        {permissions.jobs_management && (
          <StatCard title="Platform Jobs" value={stats.jobs} icon={Briefcase} color="text-indigo-500" />
        )}
        {permissions.ticket_management && (
          <StatCard title="Active Support" value={stats.activeTickets} icon={TrendingUp} color="text-purple-500" />
        )}
        {permissions.subscription_management && (
          <StatCard 
            title="Total Revenue" 
            value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.revenue )} 
            icon={IndianRupee} 
            color="text-emerald-500" 
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users Section - Only if user_management is allowed */}
        {permissions.user_management && (
          <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Users</h2>
              <a href="/admin/users" className="text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1 transition-colors">
                View All <ArrowRight size={14} />
              </a>
            </div>
            <div className="space-y-4 flex-1">
              {recentUsers.map((user) => (
                <div key={user.ID} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Users size={18} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold dark:text-white">{user.Username}</p>
                      <p className="text-xs text-slate-500">{new Date(user.CreatedAt).toLocaleDateString()} • {user.role || user.Role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${!user.IsBlocked ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {!user.IsBlocked ? 'Active' : 'Blocked'}
                    </span>
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Users size={40} className="mb-2 opacity-20" />
                  <p className="text-sm font-medium">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions - Dynamically filtered */}
        <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, idx) => (
              <a
                key={idx}
                href={action.path}
                className={`p-4 rounded-lg bg-${action.color}-50 dark:bg-${action.color}-900/10 border border-${action.color}-100 dark:border-${action.color}-900/20 hover:bg-${action.color}-100 dark:hover:bg-${action.color}-900/20 transition-all group`}
              >
                <action.icon size={24} className={`text-${action.color}-600 mb-2 group-hover:scale-110 transition-transform`} />
                <p className={`text-sm font-bold text-${action.color}-900 dark:text-${action.color}-300`}>{action.title}</p>
                <p className={`text-xs text-${action.color}-600/70 dark:text-${action.color}-500/70 mt-1`}>{action.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
