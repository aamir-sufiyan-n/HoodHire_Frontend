import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldBan, 
  Unlock, 
  Trash2,
  User,
  Loader2,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { adminAPI } from '../../api/admin';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const filters = {
        page,
        search: searchTerm,
      };

      if (roleFilter === 'blocked') {
        filters.blocked = true;
      } else if (roleFilter !== 'all') {
        filters.role = roleFilter;
      }

      const data = await adminAPI.getUsers(filters);
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500); // Debounce search

    return () => clearTimeout(delayDebounceFn);
  }, [roleFilter, searchTerm, page]);

  const handleBlock = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This user will no longer be able to access their account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, block user!',
      background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
    });

    if (result.isConfirmed) {
      try {
        await adminAPI.blockUser(id);
        Swal.fire({
          title: 'Blocked!',
          text: 'User has been blocked.',
          icon: 'success',
          background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
        setUsers(users.map(u => u.ID === id ? { ...u, IsBlocked: true } : u));
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: err.message || 'Failed to block user',
          icon: 'error',
          background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
      }
    }
  };

  const handleUnblock = async (id) => {
    const result = await Swal.fire({
      title: 'Unblock User?',
      text: "This will restore the user's access to the platform.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, unblock!',
      background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
    });

    if (result.isConfirmed) {
      try {
        await adminAPI.unblockUser(id);
        Swal.fire({
          title: 'Unblocked!',
          text: 'User access has been restored.',
          icon: 'success',
          background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
        setUsers(users.map(u => u.ID === id ? { ...u, IsBlocked: false } : u));
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: err.message || 'Failed to unblock user',
          icon: 'error',
          background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you absolutely sure?',
      text: "You won't be able to revert this! All user data will be permanently removed.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently!',
      background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
    });

    if (result.isConfirmed) {
      try {
        await adminAPI.deleteUser(id);
        Swal.fire({
          title: 'Deleted!',
          text: 'User account has been removed.',
          icon: 'success',
          background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
        setUsers(users.filter(u => u.ID !== id));
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: err.message || 'Failed to delete user',
          icon: 'error',
          background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Users</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Search and manage all platform users.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-[#1a1d24] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 shrink-0">
            <Filter size={16} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Filter:</span>
        </div>
        
        <div className="relative group flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none dark:text-slate-300"
          />
        </div>

        <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors dark:text-slate-300 font-medium cursor-pointer w-full md:w-auto"
        >
            <option value="all">All Users</option>
            <option value="seeker">Seekers</option>
            <option value="hirer">Hirers</option>
            <option value="blocked">Blocked Users</option>
        </select>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading users...</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                          No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.ID} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                              <User className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.Username}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{user.Email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                            (user.role || user.Role)?.toLowerCase() === 'admin' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                            (user.role || user.Role)?.toLowerCase() === 'hirer' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                            'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {user.role || user.Role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                            !user.IsBlocked ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${!user.IsBlocked ? 'bg-emerald-600' : 'bg-red-600'}`} />
                            {!user.IsBlocked ? 'active' : 'blocked'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!user.IsBlocked ? (
                              <button 
                                onClick={() => handleBlock(user.ID)}
                                title="Block User"
                                className=" cursor-pointer hover:bg-gray-200  duration-300  rounded-full p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              >
                                <ShieldBan size={18} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleUnblock(user.ID)}
                                title="Unblock User"
                                className=" cursor-pointer hover:bg-gray-200 rounded-full p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
                              >
                                <Unlock size={18} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(user.ID)}
                              title="Delete User"
                              className=" cursor-pointer hover:bg-red-100 rounded-full p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1 || loading}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-slate-500">
                  Page {page}
                </span>
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={users.length < 20 || loading} // Assuming limit is 20
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
