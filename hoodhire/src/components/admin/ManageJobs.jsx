// src/components/admin/ManageJobs.jsx
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Trash2, 
  Loader2, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  ExternalLink,
  FileDown
} from 'lucide-react';
import { adminAPI, API_BASE_URL } from '../../api/admin/admin';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

const ManageJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [updatingID, setUpdatingID] = useState(null);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const data = await adminAPI.getJobs({
                page,
                status: statusFilter,
                search: searchTerm
            });
            setJobs(data.jobs || []);
        } catch (err) {
            console.error('Failed to fetch jobs:', err);
            toast.error(err.message || 'Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        window.open(`${API_BASE_URL}/admin/jobs/export`, '_blank');
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchJobs();
        }, 500); // Debounce search
        return () => clearTimeout(delayDebounceFn);
    }, [statusFilter, searchTerm, page]);

    const handleDeleteJob = async (id, title) => {
        const result = await Swal.fire({
            title: 'Delete Job Posting?',
            text: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });

        if (result.isConfirmed) {
            try {
                await adminAPI.deleteJob(id);
                toast.success('Job deleted successfully');
                fetchJobs(); // Refetch
            } catch (err) {
                toast.error(err.message || 'Failed to delete job');
            }
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        setUpdatingID(id);
        try {
            await adminAPI.updateJobStatus(id, newStatus);
            toast.success(`Job status updated to ${newStatus}`);
            // Optimistic Update
            setJobs(prev => prev.map(job => job.ID === id ? { ...job, Status: newStatus } : job));
        } catch (err) {
            toast.error(err.message || 'Failed to update status');
        } finally {
            setUpdatingID(null);
        }
    };

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'open':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            case 'closed':
                return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
            case 'filled':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            default:
                return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-800';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Briefcase className="text-emerald-500" /> Manage Jobs
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor and control all platform job postings.</p>
                </div>
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1d24] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-md transition-all border border-slate-200 dark:border-slate-800 active:scale-95 shrink-0"
                >
                  <FileDown size={18} className="text-emerald-600" />
                  Export PDF
                </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-[#1a1d24] p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 shrink-0">
                    <Filter size={16} className="text-slate-400 ml-2" />
                    <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Filter:</span>
                </div>
                
                <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search jobs by title or business..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-slate-300 font-medium"
                    />
                </div>

                <select 
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                    }}
                    className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg px-6 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all dark:text-slate-300 font-bold cursor-pointer w-full md:w-auto capitalize shadow-sm"
                >
                    <option value="all">All Statuses</option>
                    <option value="open">Open Positions</option>
                    <option value="closed">Closed Positions</option>
                    <option value="filled">Filled Positions</option>
                </select>
            </div>

            <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none">
                <div className="overflow-x-auto">
                    {loading && jobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
                            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Synchronizing Positions...</p>
                        </div>
                    ) : (
                        <>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Job Details</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Category</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Salary</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Administrative Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {jobs.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center opacity-40">
                                                    <Briefcase size={48} className="text-slate-300 mb-4" />
                                                    <p className="text-slate-500 font-bold text-lg leading-none">No positions found</p>
                                                    <p className="text-xs mt-2 font-medium">Try adjusting your filters or search criteria.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        jobs.map((job) => (
                                            <tr key={job.ID} className="hover:bg-slate-50/[0.02] dark:hover:bg-slate-400/[0.02] transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center border border-slate-100 dark:border-slate-800 shrink-0 group-hover:scale-105 transition-transform duration-300">
                                                            <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{job.Description?.Title || 'Untitled Position'}</p>
                                                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 font-bold tracking-tight">
                                                                <Building2 size={12} className="text-slate-400" />
                                                                <span className="truncate">{job.Business?.BusinessName || 'System Business'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-xs font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 tracking-tighter">
                                                        {job.CategoryID || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-xs font-black text-slate-900 dark:text-white">
                                                            ₹{job.Description?.SalaryMin} - {job.Description?.SalaryMax}
                                                        </p>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{job.Description?.SalaryType}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusStyles(job.Status)}`}>
                                                        {job.Status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Status Update Quick Actions */}
                                                        <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 p-1 rounded-md border border-slate-100 dark:border-slate-800 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => handleStatusUpdate(job.ID, 'open')}
                                                                disabled={job.Status === 'open' || updatingID === job.ID}
                                                                className={`p-1.5 rounded-md transition-colors ${job.Status === 'open' ? 'text-emerald-500 bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-emerald-500'}`}
                                                                title="Set Open"
                                                            >
                                                                <CheckCircle2 size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleStatusUpdate(job.ID, 'filled')}
                                                                disabled={job.Status === 'filled' || updatingID === job.ID}
                                                                className={`p-1.5 rounded-md transition-colors ${job.Status === 'filled' ? 'text-amber-500 bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-amber-500'}`}
                                                                title="Set Filled"
                                                            >
                                                                <Clock size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleStatusUpdate(job.ID, 'closed')}
                                                                disabled={job.Status === 'closed' || updatingID === job.ID}
                                                                className={`p-1.5 rounded-md transition-colors ${job.Status === 'closed' ? 'text-rose-500 bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-rose-500'}`}
                                                                title="Set Closed"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </div>

                                                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

                                                        <button 
                                                            onClick={() => handleDeleteJob(job.ID, job.Description?.Title)}
                                                            className="p-2.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 transition-all active:scale-95 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
                                                            title="Delete Position"
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
                            
                            {/* Pagination */}
                            <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <button
                                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                    disabled={page === 1 || loading}
                                    className="flex items-center gap-2 px-5 py-2 text-xs font-black text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 shadow-sm"
                                >
                                    Previous
                                </button>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                    Page <span className="text-emerald-500">{page}</span>
                                </span>
                                <button
                                    onClick={() => setPage(prev => prev + 1)}
                                    disabled={jobs.length < 20 || loading}
                                    className="flex items-center gap-2 px-5 py-2 text-xs font-black text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 shadow-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-xl flex items-start gap-4">
                <div className="p-3 bg-white dark:bg-[#1a1d24] rounded-lg shadow-sm">
                    <AlertCircle size={24} className="text-emerald-600" />
                </div>
                <div>
                    <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Administrative Oversight</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl font-medium">
                        Administrators have the authority to override job statuses to maintain platform integrity. Closing a job will prevent future applications, while deleting a job is a permanent action and will remove all associated meta-data from the primary database.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ManageJobs;
