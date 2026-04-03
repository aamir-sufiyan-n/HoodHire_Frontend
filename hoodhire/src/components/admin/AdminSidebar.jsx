import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  UserCircle, 
  LogOut,
  Search,
  ChevronRight,
  TicketCheck
} from 'lucide-react';

const AdminSidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Manage Users', path: '/admin/users' },
    { icon: Building2, label: 'Manage Businesses', path: '/admin/businesses' },
    { icon: TicketCheck, label: 'Tickets', path: '/admin/tickets' },
    { icon: UserCircle, label: 'Profile', path: '/admin/profile' },
  ];

  return (
    <div className="w-64 h-screen bg-white dark:bg-[#0f1115] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">H</span>
        </div>
        <span className="text-xl font-bold tracking-tight dark:text-white">
          <span className="text-emerald-600">Hood</span>Hire
        </span>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900/50 border-none rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none dark:text-slate-300"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded uppercase pointer-events-none">
            ⌘F
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group
              ${isActive 
                ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-900 dark:hover:text-white'}
            `}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 transition-colors group-hover:text-emerald-500" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
