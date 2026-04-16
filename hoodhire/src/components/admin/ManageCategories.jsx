import React, { useState, useEffect } from 'react';
import { 
    Tag, 
    Plus, 
    Loader2, 
    Pencil, 
    Trash2, 
    X, 
    Search,
    Briefcase,
    Layers,
    Filter,
    Hash,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    BarChart3
} from 'lucide-react';
import { adminAPI } from '../../api/admin/admin';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sort, setSort] = useState('most');
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ name: '', DisplayName: '' });
    const [actionLoading, setActionLoading] = useState(false);

    const LIMIT = 20;

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await adminAPI.getCategoryStats({ 
                sort, 
                page, 
                limit: LIMIT 
            });
            // The API returns { categories: [...] }
            setCategories(data.categories || []);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchData();
        }, searchTerm ? 500 : 0); // debounce only if searching

        return () => clearTimeout(delayDebounceFn);
    }, [sort, page, searchTerm]);

    const handleOpenAddModal = () => {
        setIsEditing(false);
        setCurrentCategory({ name: '', DisplayName: '' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (category) => {
        setIsEditing(true);
        setCurrentCategory({ 
            id: category.id, 
            name: category.name, 
            DisplayName: category.display_name || category.DisplayName 
        });
        setIsModalOpen(true);
    };

    const handleAction = async (e) => {
        e.preventDefault();
        if (!currentCategory.name || !currentCategory.DisplayName) {
            return toast.error('Both name and display name are required');
        }

        setActionLoading(true);
        try {
            if (isEditing) {
                await adminAPI.updateCategory(currentCategory.id, {
                    name: currentCategory.name,
                    DisplayName: currentCategory.DisplayName
                });
                toast.success('Category updated successfully');
            } else {
                await adminAPI.createCategory({
                    name: currentCategory.name,
                    DisplayName: currentCategory.DisplayName
                });
                toast.success('Category created successfully');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        const result = await Swal.fire({
            title: 'Delete Category?',
            text: `Are you sure you want to delete "${name}"? This will affect jobs associated with this category.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!',
            background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });

        if (result.isConfirmed) {
            try {
                await adminAPI.deleteCategory(id);
                toast.success('Category deleted successfully');
                fetchData();
            } catch (err) {
                toast.error(err.message || 'Deletion failed');
            }
        }
    };

    // Client-side mapping for cleaner display if specific names aren't in response
    const getSafeDisplayName = (cat) => cat.display_name || cat.DisplayName || cat.name.replace('_', ' ').toUpperCase();

    // Local filtering for search (if backend doesn't support search on stats endpoint)
    const displayCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        getSafeDisplayName(cat).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Category Insights</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Audit platform job sectors and vacuum metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-md transition-all shadow-lg shadow-emerald-600/20 active:scale-95 shrink-0"
                    >
                        <Plus size={18} /> New Sector
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-[#1a1d24] p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative group flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Filter current view..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none dark:text-slate-300"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                        <Filter size={16} className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Sort by:</span>
                    </div>
                    <select 
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                            setPage(1);
                        }}
                        className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors dark:text-slate-300 font-bold cursor-pointer min-w-[160px]"
                    >
                        <option value="most">Most active</option>
                        <option value="least">Least active</option>
                    </select>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-[#1a1d24] rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Processing platform data...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sector Label</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Popularity Score</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registry ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {displayCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center">
                                            <Layers className="mx-auto text-slate-200 dark:text-slate-800 mb-4" size={48} />
                                            <p className="text-slate-500 dark:text-slate-400 font-bold">No sectors found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    displayCategories.map((category) => (
                                        <tr key={category.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                                                        <Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {getSafeDisplayName(category)}
                                                        </p>
                                                        <p className="text-xs font-mono text-slate-400 font-bold uppercase tracking-tighter">
                                                            {category.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 rounded-full">
                                                        <Briefcase size={12} className="text-emerald-600" />
                                                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                                                            {category.job_count || 0} Jobs
                                                        </span>
                                                    </div>
                                                    {category.job_count > 1 && (
                                                        <TrendingUp size={14} className="text-emerald-500 animate-pulse" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-xs font-mono font-bold text-slate-500">
                                                <div className="flex items-center gap-1.5 opacity-60">
                                                    <Hash size={12} />
                                                    {category.id}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right space-x-1">
                                                <button 
                                                    onClick={() => handleOpenEditModal(category)}
                                                    title="Modify Profile"
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full transition-all active:scale-90"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(category.id, getSafeDisplayName(category))}
                                                    title="Permanently Remove"
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all active:scale-90"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Controls */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1 || loading}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-all shadow-sm border border-slate-200 dark:border-slate-700 disabled:opacity-50 active:scale-95"
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Page</span>
                             <span className="w-8 h-8 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/20">
                                {page}
                             </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={categories.length < LIMIT || loading}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-all shadow-sm border border-slate-200 dark:border-slate-700 disabled:opacity-50 active:scale-95"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl animate-fade-in transition-all duration-500">
                    <div className="bg-white dark:bg-[#1a1d24] w-full max-w-md rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                                <Layers size={22} className="text-emerald-500" />
                                {isEditing ? 'MODIFY SECTOR' : 'PROVISION SECTOR'}
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/10 rounded-md transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAction} className="p-8 space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                    <Tag size={12} className="text-emerald-500" /> Sector Display Label
                                </label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="e.g., Hospitality and Dining"
                                    className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white font-bold"
                                    value={currentCategory.DisplayName}
                                    onChange={(e) => setCurrentCategory({...currentCategory, DisplayName: e.target.value})}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                    <BarChart3 size={12} className="text-blue-500" /> Registry Identifier (Slug)
                                </label>
                                <div className="relative group">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input 
                                        type="text"
                                        required
                                        disabled={isEditing}
                                        placeholder="hospitality_dining"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-mono font-bold disabled:opacity-50"
                                        value={currentCategory.name}
                                        onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                                    />
                                </div>
                                {!isEditing && (
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold leading-relaxed uppercase tracking-widest">
                                            Unique identifier used for mapping. Cannot be changed once sector is provisioned.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-[2] px-4 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 size={18} className="animate-spin" /> : isEditing ? 'Sync Profile' : 'Execute Creation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCategories;
