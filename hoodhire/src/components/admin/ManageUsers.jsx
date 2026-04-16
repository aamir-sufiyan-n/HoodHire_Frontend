import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldBan, 
  Unlock, 
  Trash2,
  User,
  Loader2,
  Filter,
  Plus,
  X,
  Mail,
  Lock,
  Pencil,
  FileDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { adminAPI, API_BASE_URL } from '../../api/admin/admin';
import { rbacAPI } from '../../api/admin/rbac';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'seeker'
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState({
    ID: '',
    username: '',
    email: '',
    password: '',
    role: 'seeker'
  });
  const [updating, setUpdating] = useState(false);
  const [rolesList, setRolesList] = useState([]);

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
    const fetchRoles = async () => {
      try {
        const data = await rbacAPI.getRoles();
        setRolesList(data.roles || []);
      } catch (err) {
        console.error('Failed to fetch roles:', err);
      }
    };
    fetchRoles();
  }, []);

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

  const handleExport = () => {
    window.open(`${API_BASE_URL}/admin/users/export`, '_blank');
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await adminAPI.createUser(newUser);
      toast.success('User created successfully!');
      setIsCreateModalOpen(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'seeker'
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to create user:', err);
      toast.error(err.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (user) => {
    setEditUser({
      ID: user.ID,
      username: user.Username,
      email: user.Email,
      password: '', // Keep empty unless admin wants to change it
      role: (user.role || user.Role)?.toLowerCase() || 'seeker'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await adminAPI.updateUser(editUser.ID, editUser);
      toast.success('User updated successfully!');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user:', err);
      toast.error(err.message || 'Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Users</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Search and manage all platform users.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1d24] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-md transition-all border border-slate-200 dark:border-slate-800 active:scale-95 shrink-0"
          >
            <FileDown size={18} className="text-emerald-600" />
            Export PDF
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-md transition-all shadow-lg shadow-emerald-600/20 active:scale-95 shrink-0"
          >
            <Plus size={18} />
            Create New User
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-[#1a1d24] p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
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
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none dark:text-slate-300"
          />
        </div>

        <select 
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1); // Reset to first page on filter change
            }}
            className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors dark:text-slate-300 font-medium cursor-pointer w-full md:w-auto capitalize"
        >
            <option value="all">All Account Types</option>
            {rolesList
              .filter(role => role.Name.toLowerCase() !== 'admin')
              .map(role => (
                <option key={role.ID} value={role.Name.toLowerCase()}>
                  {role.Name.split('_').join(' ').toUpperCase()}
                </option>
              ))}
            <option value="blocked" className="text-red-500 font-bold border-t">Blocked Users Only</option>
        </select>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
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
                              onClick={() => handleEditClick(user)}
                              title="Edit User"
                              className=" cursor-pointer hover:bg-emerald-100 rounded-full p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
                            >
                              <Pencil size={18} />
                            </button>
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
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-slate-500">
                  Page {page}
                </span>
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={users.length < 20 || loading} // Assuming limit is 20
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/40 backdrop-blur-xl animate-fade-in transition-all duration-500">
          <div className="bg-white dark:bg-[#1a1d24] w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold dark:text-white">Provision User Access</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. johndoe"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white font-medium"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white font-medium"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Temporary Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white font-medium"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Account Role</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white font-medium cursor-pointer capitalize"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  {rolesList.length > 0 ? (
                    rolesList
                      .filter(role => role.Name.toLowerCase() !== 'admin')
                      .map(role => (
                        <option key={role.ID} value={role.Name.toLowerCase()}>
                          {role.Name.charAt(0).toUpperCase() + role.Name.slice(1)}
                        </option>
                      ))
                  ) : (
                    <>
                      <option value="seeker">Seeker (Job Hunter)</option>
                      <option value="hirer">Hirer (Business Owner)</option>
                    </>
                  )}
                </select>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>Create Account & Access</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/40 backdrop-blur-xl animate-fade-in transition-all duration-500">
          <div className="bg-white dark:bg-[#1a1d24] w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold dark:text-white">Modify User Profile</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. johndoe"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white font-medium"
                    value={editUser.username}
                    onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white font-medium"
                    value={editUser.email}
                    onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Change Password (Leave blank if same)</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white font-medium"
                    value={editUser.password}
                    onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Account Role</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white font-medium cursor-pointer capitalize"
                  value={editUser.role}
                  onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                >
                  {rolesList.length > 0 ? (
                    rolesList
                      .filter(role => role.Name.toLowerCase() !== 'admin')
                      .map(role => (
                        <option key={role.ID} value={role.Name.toLowerCase()}>
                          {role.Name.charAt(0).toUpperCase() + role.Name.slice(1)}
                        </option>
                      ))
                  ) : (
                    <>
                      <option value="seeker">Seeker (Job Hunter)</option>
                      <option value="hirer">Hirer (Business Owner)</option>
                    </>
                  )}
                </select>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Account...
                  </>
                ) : (
                  <>Update User Profile</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
