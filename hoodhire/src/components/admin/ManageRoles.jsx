import React, { useState, useEffect } from 'react';
import {
    Shield,
    Plus,
    Loader2,
    CheckCircle2,
    XCircle,
    Info,
    Settings,
    UserCircle,
    Lock,
    Trash2
} from 'lucide-react';
import { rbacAPI } from '../../api/admin/rbac';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

const ManageRoles = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const [updatingPermissions, setUpdatingPermissions] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesData, permsData] = await Promise.all([
                rbacAPI.getRoles(),
                rbacAPI.getPermissions()
            ]);
            setRoles(rolesData.roles || []);
            setPermissions(permsData.permissions || []);

            // Auto-select first role if none selected
            if (rolesData.roles?.length > 0 && !selectedRole) {
                setSelectedRole(rolesData.roles[0]);
            }
        } catch (err) {
            console.error('Failed to fetch RBAC data:', err);
            toast.error('Failed to load roles and permissions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateRole = async (e) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;

        try {
            await rbacAPI.createRole({ name: newRoleName });
            toast.success('Role created successfully');
            setNewRoleName('');
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to create role');
        }
    };

    const handleTogglePermission = async (permissionID, currentIsAllowed) => {
        if (!selectedRole || updatingPermissions) return;

        const newIsAllowed = !currentIsAllowed;
        setUpdatingPermissions(true);

        try {
            // 1. Compute the new set of RolePermissions for this role
            const existingRP = selectedRole.RolePermissions?.find(rp => rp.PermissionID === permissionID);
            let updatedRolePermissions;

            if (existingRP) {
                updatedRolePermissions = selectedRole.RolePermissions.map(rp =>
                    rp.PermissionID === permissionID ? { ...rp, IsAllowed: newIsAllowed } : rp
                );
            } else {
                updatedRolePermissions = [
                    ...(selectedRole.RolePermissions || []),
                    { PermissionID: permissionID, IsAllowed: newIsAllowed, RoleID: selectedRole.ID }
                ];
            }

            const updatedRole = { ...selectedRole, RolePermissions: updatedRolePermissions };

            // 2. Compute the payload for the API based on ALL permissions
            const apiPayload = permissions.map(p => {
                const rp = updatedRolePermissions.find(rp => rp.PermissionID === p.ID);
                return {
                    permission_id: p.ID,
                    is_allowed: rp ? rp.IsAllowed : false
                };
            });

            // 3. Optimistic UI Update
            setSelectedRole(updatedRole);
            setRoles(prevRoles => prevRoles.map(r => r.ID === selectedRole.ID ? updatedRole : r));

            // 4. API Call
            // 4. API Call
            await rbacAPI.updateRolePermissions(selectedRole.ID, apiPayload);
            // await fetchData();
            toast.success('Permissions synchronized');
        } catch (err) {
            console.error('Permission sync failed:', err);
            toast.error(err.message || 'Failed to sync permissions');
            fetchData(); // Rollback to server state
        } finally {
            setUpdatingPermissions(false);
        }
    };
    const handleDeleteRole = async (e, roleID, roleName) => {
        e.stopPropagation();
        if (roleName.toLowerCase() === 'admin' || roleName.toLowerCase() === 'seeker' || roleName.toLowerCase() === 'hirer') {
            toast.error("System roles cannot be deleted.");
            return;
        }

        const result = await Swal.fire({
            title: 'Delete Role?',
            text: `Are you sure you want to delete the "${roleName}" role? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await rbacAPI.deleteRole(roleID);
            toast.success('Role deleted successfully');
            if (selectedRole?.ID === roleID) {
                setSelectedRole(null);
            }
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to delete role');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                <p className="text-slate-500 font-bold">Initializing Role management...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Shield className="text-emerald-500" /> RBAC Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Configure role-based access control and system permissions.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-md transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                    <Plus size={18} /> Create New Role
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Roles Sidebar */}
                <div className="lg:col-span-4 space-y-4">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Access Roles</h2>
                    <div className="space-y-2">
                        {roles.map((role) => (
                            <button
                                key={role.ID}
                                onClick={() => setSelectedRole(role)}
                                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${selectedRole?.ID === role.ID
                                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                                        : 'bg-white dark:bg-[#1a1d24] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500/50'
                                    }`}
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-md ${selectedRole?.ID === role.ID ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
                                            <UserCircle size={18} className={selectedRole?.ID === role.ID ? 'text-white' : 'text-emerald-500'} />
                                        </div>
                                        <div>
                                            <p className="font-bold tracking-tight capitalize">{role.Name}</p>
                                            <p className={`text-[10px] font-medium ${selectedRole?.ID === role.ID ? 'text-emerald-100' : 'text-slate-500'}`}>
                                                Created {new Date(role.CreatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selectedRole?.ID === role.ID && <Settings size={16} className="animate-spin-slow opacity-50" />}
                                        <button
                                            onClick={(e) => handleDeleteRole(e, role.ID, role.Name)}
                                            className={`p-2 rounded-md transition-all duration-200 ${
                                                selectedRole?.ID === role.ID 
                                                ? 'hover:bg-white/20 text-white' 
                                                : 'hover:bg-red-50 text-slate-400 hover:text-red-600'
                                            }`}
                                            title="Delete Role"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                {selectedRole?.ID === role.ID && (
                                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Permissions Grid */}
                <div className="lg:col-span-8">
                    {selectedRole ? (
                        <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-fade-in-up">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                                <div className="flex items-center gap-3">
                                    {/* <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                        <Lock size={20} />
                                    </div> */}
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white capitalize">{selectedRole.Name} Permissions</h3>
                                        <p className="text-xs text-slate-500 font-medium">Fine-tune system capabilities for this role.</p>
                                    </div>
                                </div>
                                {updatingPermissions && (
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 animate-pulse">
                                        <Loader2 size={14} className="animate-spin" />
                                        Syncing...
                                    </div>
                                )}
                            </div>

                            <div className="p-0 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                                    {permissions.map((perm) => {
                                        const rolePerm = selectedRole.RolePermissions?.find(rp => rp.PermissionID === perm.ID);
                                        const isAllowed = rolePerm ? rolePerm.IsAllowed : false;

                                        return (
                                            <div
                                                key={perm.ID}
                                                className={`px-6 py-5 flex items-center justify-between transition-colors group ${isAllowed
                                                        ? 'bg-emerald-500/[0.01]'
                                                        : 'opacity-70'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
                                                        isAllowed 
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' 
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                    }`}>
                                                        <Lock size={18} />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-bold tracking-tight transition-colors ${isAllowed ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                                            {perm.Name.split('_').join(' ').toUpperCase()}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Permission</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="hidden sm:block">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isAllowed ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                            {isAllowed ? 'Allowed' : 'Denied'}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleTogglePermission(perm.ID, isAllowed)}
                                                        disabled={updatingPermissions}
                                                        className={`w-10 h-5 rounded-full p-1 transition-all duration-300 relative ${isAllowed ? 'bg-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-slate-300 dark:bg-slate-700'
                                                            }`}
                                                    >
                                                        <div className={`w-3 h-3 rounded-full bg-white transition-all duration-300 shadow-sm ${isAllowed ? 'translate-x-5' : 'translate-x-0'
                                                            }`} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="p-6">
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-lg flex items-start gap-3">
                                        <Info className="text-amber-600 shrink-0 mt-0.5" size={18} />
                                        <p className="text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
                                            Changes to role permissions are applied in real-time. Any user currently assigned to this role may need to refresh their session to see updated capabilities.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#1a1d24]/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400">
                            <Shield size={48} className="mb-4 opacity-10" />
                            <p className="font-bold tracking-tight text-lg">No role selected</p>
                            <p className="text-sm mt-1">Select a role from the sidebar to manage its system-wide permissions.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Role Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/40 backdrop-blur-xl animate-fade-in transition-all duration-500">
                    <div className="bg-white dark:bg-[#1a1d24] w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-xl font-bold dark:text-white">Create New Role</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-400"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateRole} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Role Label</label>
                                <input
                                    type="text"
                                    required
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    placeholder="e.g. Moderator, Support Lead"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white font-medium"
                                />
                                <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Unique identifier for system access control</p>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
                            >
                                Provision Role Access
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRoles;
