import React, { useState, useEffect } from 'react';
import { Briefcase, Users, CheckCircle, XCircle, Clock, User, MessageSquare, Loader2, ExternalLink, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { jobsAPI } from '../../api/jobs';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ApplicationsView = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedJobIds, setExpandedJobIds] = useState([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 6;

    const fetchJobsAndApplications = async () => {
        setLoading(true);
        try {
            // First get all jobs by this hirer and categories
            const [res, catRes] = await Promise.all([
                jobsAPI.getMyJobs(),
                jobsAPI.getCategories().catch(() => ({ categories: [] }))
            ]);
            const myJobs = res?.jobs || [];

            const categoriesMap = {};
            if (catRes && catRes.categories) {
                catRes.categories.forEach(c => categoriesMap[c.ID] = c);
            }

            myJobs.forEach(job => {
                if (job.CategoryID && categoriesMap[job.CategoryID]) {
                    job.Category = categoriesMap[job.CategoryID];
                }
            });

            // Then fetch applicants for each job
            const jobsWithApps = await Promise.all(myJobs.map(async (job) => {
                try {
                    const appsRes = await jobsAPI.getApplicationsForJob(job.ID);
                    return {
                        ...job,
                        applications: appsRes?.applications || []
                    };
                } catch (err) {
                    console.error(`Failed to fetch apps for job ${job.ID}:`, err);
                    return { ...job, applications: [] };
                }
            }));

            // Filter to only show jobs that actually have applications
            const jobsWithRealApps = jobsWithApps.filter(job => job.applications.length > 0);
            setJobs(jobsWithRealApps);

        } catch (err) {
            console.error("Failed to fetch jobs/applications:", err);
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobsAndApplications();
    }, []);

    const handleUpdateStatus = async (applicationId, status) => {
        try {
            await jobsAPI.updateApplicationStatus(applicationId, { status });
            toast.success(`Applicant marked as ${status}`);
            fetchJobsAndApplications();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const toggleJobExpansion = (jobId) => {
        setExpandedJobIds(prev => 
            prev.includes(jobId) 
                ? prev.filter(id => id !== jobId) 
                : [...prev, jobId]
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 w-full">
                <Loader2 size={40} className="text-[#009966] animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading applications...</p>
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
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Review Applications</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Review candidate profiles, read cover messages, and manage their status.</p>
                </div>
            </div>

            {jobs.length === 0 ? (
                <div className="bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-md p-12 text-center flex flex-col items-center premium-shadow">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl flex items-center justify-center text-slate-400 mb-6">
                        <Users size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No applications yet</h3>
                    <p className="text-slate-500 text-sm max-w-sm mb-6">None of your job postings have received applications yet. Once job seekers apply, they will appear here organized by job.</p>
                </div>
            ) : (
                <div className="bg-white/50 dark:bg-[#16181d]/50 border border-slate-200 dark:border-[#262933] rounded-md overflow-hidden premium-shadow">
                    <div className="flex flex-col">
                        {paginatedJobs.map((job, index) => (
                            <div key={job.ID} className={`${index !== 0 ? 'border-t border-slate-200 dark:border-[#262933]' : ''}`}>

                                {/* Job Header (Accordion Toggle) */}
                                <div 
                                    onClick={() => toggleJobExpansion(job.ID)}
                                    className="bg-white dark:bg-[#1a1d24] px-5 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-[#20242b] transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                                {job.Description?.Title || 'Untitled Job'}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${job.Status === 'open' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                job.Status === 'filled' || job.Status === 'closed' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/40' :
                                                    'bg-slate-100 text-slate-600 dark:bg-[#262933] dark:text-slate-400'
                                                }`}>
                                                {job.Status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                                            <span className="text-slate-500 font-extrabold">{job.applications.length} Applicant{job.applications.length !== 1 ? 's' : ''}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                                            <span>{job.Description?.Shift || 'Any Shift'}</span>
                                            {(job.Description?.SalaryMin || job.Description?.SalaryMax) && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                                                    <span className="text-emerald-600 dark:text-emerald-500">
                                                        ₹{job.Description.SalaryMin || 0}-₹{job.Description.SalaryMax || 0}
                                                    </span>
                                                </>
                                            )}
                                            {job.Description?.JobType && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                                                    <span className="capitalize">{job.Description.JobType.replace('_', ' ')}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {expandedJobIds.includes(job.ID) ? (
                                            <ChevronUp size={18} className="text-slate-400" />
                                        ) : (
                                            <ChevronDown size={18} className="text-slate-400" />
                                        )}
                                    </div>
                                </div>

                                {/* Applicant List (Conditional Render) */}
                                {expandedJobIds.includes(job.ID) && (
                                    <div className="p-4 grid grid-cols-1 gap-3 bg-slate-50/50 dark:bg-[#12141a]/50 border-t border-slate-100 dark:border-[#262933]">
                                        {job.applications.map((app) => (
                                            <div key={app.ID} className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md p-3 hover:shadow-md transition-shadow">
                                                <div className="flex flex-col md:flex-row justify-between gap-3">
                                                    <div className="flex gap-3 w-full">
                                                        {/* Profile Picture or Default Avatar */}
                                                        <div className="w-10 h-10 bg-slate-100 dark:bg-[#262933] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
                                                            {app.Seeker?.ProfilePicture ? (
                                                                <img src={app.Seeker.ProfilePicture} alt={app.Seeker?.FullName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User size={20} className="text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4
                                                                onClick={() => navigate(`/hirer/seeker/${app.Seeker?.UserID || app.SeekerID}`, { state: { applicationStatus: app.Status, applicationMessage: app.Message, applicationId: app.ID } })}
                                                                className="font-bold text-slate-900 dark:text-white text-[15px] flex items-center gap-1.5 cursor-pointer hover:text-[#009966] transition-colors group/name"
                                                            >
                                                                {app.Seeker?.FullName || app.Seeker?.full_name || app.Seeker?.DisplayName || 'Applicant'}
                                                                <ExternalLink size={12} className="text-slate-400 group-hover/name:text-[#009966] opacity-0 group-hover/name:opacity-100 transition-opacity" />
                                                            </h4>
                                                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5 capitalize">
                                                                <span>{app.Seeker?.Gender || 'Not Specified'}</span>
                                                                <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                                <span>{app.Seeker?.Age ? `${app.Seeker.Age} yrs` : 'Age Unspecified'}</span>
                                                                {app.Seeker?.CurrentStatus && (
                                                                    <>
                                                                        <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                                        <span className="text-[#009966] dark:text-blue-400 font-bold">{app.Seeker.CurrentStatus}</span>
                                                                    </>
                                                                )}
                                                                <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(app.CreatedAt).toLocaleDateString()}</span>
                                                            </p>

                                                            {app.Message && (
                                                                <div className="mt-2 bg-slate-50 dark:bg-[#16181d] p-2 rounded border border-slate-100 dark:border-[#262933]">
                                                                    <p className="text-[12px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                                                                        <MessageSquare size={13} className="text-[#009966] mt-0.5 shrink-0 opactiy-70" />
                                                                        <span className="italic line-clamp-2">"{app.Message}"</span>
                                                                    </p>
                                                                </div>
                                                            )}

                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end justify-between shrink-0 gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-[#262933] pt-3 md:pt-0 md:pl-4 min-w-[140px]">
                                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider block ml-auto w-fit ${app.Status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                            app.Status === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : app.Status === 'rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                                                                'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                                                            }`}>
                                                            {app.Status}
                                                        </span>

                                                        {app.Status === 'pending' && (
                                                            <div className="flex gap-1.5 w-full mt-1">
                                                                <button
                                                                    onClick={() => handleUpdateStatus(app.ID, 'rejected')}
                                                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded text-[11px] font-bold transition-colors"
                                                                >
                                                                    <XCircle size={13} /> Skip
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(app.ID, 'accepted')}
                                                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-[#009966] hover:bg-[#008855] text-white rounded text-[11px] font-bold transition-colors shadow-sm border-none"
                                                                >
                                                                    <CheckCircle size={13} /> Hire
                                                                </button>
                                                            </div>
                                                        )}

                                                        {app.Status === 'accepted' && (
                                                            <button
                                                                onClick={() => navigate('/messages', { state: { userId: app.Seeker?.UserID || app.SeekerID } })}
                                                                className="w-full mt-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[#009966] dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded text-[11px] font-bold transition-colors shadow-sm"
                                                            >
                                                                Message <MessageCircle size={12} />
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => navigate(`/hirer/seeker/${app.SeekerID}`, { state: { applicationStatus: app.Status, applicationMessage: app.Message, applicationId: app.ID } })}
                                                            className="w-full mt-1 flex items-center justify-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-[#303340] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#262933] rounded text-[11px] font-bold transition-colors bg-white dark:bg-[#1a1d24] shadow-sm"
                                                        >
                                                            Details <ExternalLink size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200 dark:border-[#262933] bg-white/50 dark:bg-[#16181d]/50 p-3">
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
        </div>
    );
};

export default ApplicationsView;
