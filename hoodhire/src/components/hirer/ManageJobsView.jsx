import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Edit3, Trash2, Power, Loader2, Sparkles, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { jobsAPI } from '../../api/jobs';
import toast from 'react-hot-toast';
import PostJobModal from './PostJobModal';

const ManageJobsView = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 6;

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const [jobsRes, categoriesRes] = await Promise.all([
                jobsAPI.getMyJobs(),
                jobsAPI.getCategories().catch(() => ({ categories: [] }))
            ]);

            const jobsList = jobsRes?.jobs || [];
            const categoriesMap = {};
            if (categoriesRes && categoriesRes.categories) {
                categoriesRes.categories.forEach(c => categoriesMap[c.ID] = c);
            }

            jobsList.forEach(job => {
                if (job.CategoryID && categoriesMap[job.CategoryID]) {
                    job.Category = categoriesMap[job.CategoryID];
                }
            });

            setJobs(jobsList);
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
            toast.error("Failed to load your jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleCreateNew = () => {
        setEditingJob(null);
        setIsPostModalOpen(true);
    };

    const handleEdit = (job) => {
        setEditingJob(job);
        setIsPostModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) return;

        try {
            await jobsAPI.deleteJob(id);
            toast.success("Job deleted successfully");
            fetchJobs();
        } catch (err) {
            toast.error("Failed to delete job");
        }
    };

    const handleToggleStatus = async (job) => {
        const newStatus = job.Status === 'open' ? 'closed' : 'open';

        try {
            await jobsAPI.updateJobStatus(job.ID, { status: newStatus });
            toast.success(`Job marked as ${newStatus}`);
            fetchJobs();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 w-full">
                <Loader2 size={40} className="text-[#009966] animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading your job postings...</p>
            </div>
        );
    }

    // Pagination calculations
    const totalPages = Math.ceil(jobs.length / jobsPerPage);
    const paginatedJobs = jobs.slice(
        (currentPage - 1) * jobsPerPage,
        currentPage * jobsPerPage
    );

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Manage Postings</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Create, edit, and track applicants for your job listings.</p>
                </div>
                <button onClick={handleCreateNew} className="bg-[#009966] hover:bg-[#008855] text-white font-bold py-2.5 px-6 rounded-md transition-colors shadow-sm flex items-center gap-2">
                    <Briefcase size={18} /> Post a New Job
                </button>
            </div>

            {jobs.length === 0 ? (
                <div className="bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-md p-12 text-center flex flex-col items-center premium-shadow">
                    <div className="w-20 h-20 bg-white dark:bg-[#007744]/10 rounded-xl flex items-center justify-center text-[#009966] mb-6 border border-[#3b9f87]/20 dark:border-[#008855]/30">
                        <Sparkles size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No active job listings</h3>
                    <p className="text-slate-500 max-w-sm mb-6">You haven't posted any jobs yet. Create your first listing to start receiving applications from local talents.</p>
                    <button onClick={handleCreateNew} className="text-[#009966] font-bold hover:underline">Create a posting now</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {paginatedJobs.map(job => (
                        <div key={job.ID} className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md p-6 hover:shadow-md transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-6 premium-shadow">

                            <div
                                className="flex-1 cursor-pointer p-2 -m-2 rounded-md hover:bg-slate-50 dark:hover:bg-[#16181d] transition-colors"
                                onClick={() => navigate(`/hirer/jobs/${job.ID}`)}
                            >
                                <div className="flex items-start gap-4 mb-2">
                                    <div className="w-12 h-12 shrink-0 bg-slate-50 dark:bg-[#262933] border border-slate-100 dark:border-[#303340] rounded-md flex items-center justify-center overflow-hidden shadow-sm">
                                        {(job.Business?.ProfilePicture || job.Business?.Hirer?.ProfilePicture || job.Hirer?.ProfilePicture || job.ProfilePicture) ? (
                                            <img
                                                src={job.Business?.ProfilePicture || job.Business?.Hirer?.ProfilePicture || job.Hirer?.ProfilePicture || job.ProfilePicture}
                                                alt={job.Business?.BusinessName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Briefcase size={20} className="text-[#009966]" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#009966] transition-colors">
                                                {job.Description?.Title || 'Untitled Job'}
                                            </h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${job.Status === 'open' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' :
                                                job.Status === 'filled' || job.Status === 'closed' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/40' :
                                                    'bg-slate-100 text-slate-600 dark:bg-[#262933] dark:text-slate-400 border-slate-200 dark:border-[#303340]'
                                                }`}>
                                                {job.Status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 mb-4">
                                    <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-md shadow-sm"><Briefcase size={12} className="text-blue-500" /> {job.Category?.DisplayName || 'Category'}</span>
                                    <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#262933] border border-slate-100 dark:border-[#303340] px-2.5 py-1 rounded-md capitalize shadow-sm"><Clock size={12} className="text-slate-400" /> {job.Description?.JobType?.replace('_', ' ')}</span>
                                    {job.Deadline && (
                                        <span className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/30 px-2 py-1 rounded-sm text-rose-600 dark:text-rose-400">
                                            Deadline: {new Date(job.Deadline).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-slate-600 dark:text-[#64748b] line-clamp-2 pr-4">{job.Description?.Description}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-[#262933] pt-4 md:pt-0 md:pl-5">
                                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                    <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-sm bg-slate-50 dark:bg-[#16181d] border border-slate-200 dark:border-[#262933]" title={job.Status === 'open' ? 'Close Job' : 'Open Job'}>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${job.Status === 'open' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {job.Status === 'open' ? 'Active' : 'Closed'}
                                        </span>
                                        <button
                                            onClick={() => handleToggleStatus(job)}
                                            className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${job.Status === 'open' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${job.Status === 'open' ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    <button onClick={() => handleEdit(job)} title="Edit Job" className="flex-1 sm:flex-none p-2 rounded-sm text-slate-400 hover:text-[#009966] bg-slate-50 dark:bg-[#16181d] hover:bg-white dark:hover:bg-[#009966]/10 transition-colors border border-slate-200 dark:border-[#262933]">
                                        <Edit3 size={16} className="mx-auto" />
                                    </button>
                                    <button onClick={() => handleDelete(job.ID)} title="Delete Job" className="flex-1 sm:flex-none p-2 rounded-sm text-slate-400 hover:text-rose-600 bg-slate-50 dark:bg-[#16181d] hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors border border-slate-200 dark:border-[#262933]">
                                        <Trash2 size={16} className="mx-auto" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] premium-shadow rounded-md p-3">
                            <span className="text-sm font-medium text-slate-500 ml-2">
                                Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-sm border border-slate-200 dark:border-[#303340] text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#262933] transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-sm border border-slate-200 dark:border-[#303340] text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#262933] transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <PostJobModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                onJobPosted={fetchJobs}
                editingJob={editingJob}
            />
        </div>
    );
};

export default ManageJobsView;
