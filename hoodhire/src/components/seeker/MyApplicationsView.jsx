import React, { useState, useEffect, useMemo } from 'react';
import { Briefcase, MapPin, DollarSign, Clock, XCircle, Loader2, FileText, ExternalLink, Filter, ChevronLeft, ChevronRight, CheckCircle, IndianRupee, MessageCircle, CheckCircle2 } from 'lucide-react';
import { jobsAPI } from '../../api/jobs';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyApplicationsView = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({ all: 0, pending: 0, accepted: 0, rejected: 0 });

    // New states for formatting and functionality
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'accepted', 'rejected'
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (latest), 'asc' (oldest)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const navigate = useNavigate();

    const fetchApplications = async (status = activeTab, isInitial = false) => {
        setLoading(true);
        try {
            const appsRes = await jobsAPI.getMyApplications(status);
            setApplications(appsRes?.applications || []);

            if (status === 'all' || isInitial) {
                const allRes = await jobsAPI.getMyApplications('all');
                const all = allRes?.applications || [];
                setCounts({
                    all: all.length,
                    pending: all.filter(a => a.Status === 'pending').length,
                    accepted: all.filter(a => a.Status === 'accepted').length,
                    rejected: all.filter(a => a.Status === 'rejected').length
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load your applications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications(activeTab, true);
    }, []);

    const prevTabRef = React.useRef(activeTab);
    useEffect(() => {
        if (prevTabRef.current !== activeTab) {
            fetchApplications(activeTab);
            prevTabRef.current = activeTab;
        }
    }, [activeTab]);

    // Derived Data
    const processedApplications = useMemo(() => {
        let sorted = [...applications];

        sorted.sort((a, b) => {
            const dateA = new Date(a.CreatedAt).getTime();
            const dateB = new Date(b.CreatedAt).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return sorted;
    }, [applications, sortOrder]);

    const totalPages = Math.ceil(processedApplications.length / itemsPerPage);
    const paginatedApplications = processedApplications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, sortOrder]);

    const handleWithdraw = async (appId) => {
        if (!window.confirm("Are you sure you want to withdraw this application? This cannot be undone.")) return;

        try {
            await jobsAPI.withdrawApplication(appId);
            toast.success("Application withdrawn successfully");
            fetchApplications(activeTab, true);
        } catch (error) {
            toast.error("Failed to withdraw application");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 w-full">
                <Loader2 size={40} className="text-[#009966] animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading your applications...</p>
            </div>
        );
    }

    const tabs = [
        { id: 'all', label: 'All Applications' },
        { id: 'pending', label: 'Pending' },
        { id: 'accepted', label: 'Accepted' },
        { id: 'rejected', label: 'Rejected' }
    ];

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Applications</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Track your job applications and their current status.</p>
                </div>

                <div className="flex items-center gap-2 border border-slate-200 dark:border-[#303340] rounded-md p-1 bg-white dark:bg-[#16181d] shadow-sm shrink-0">
                    <Filter size={16} className="text-slate-400 ml-2" />
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-300 py-1.5 px-2 cursor-pointer"
                    >
                        <option value="desc" className="bg-white dark:bg-[#1a1d24]">Latest to Oldest</option>
                        <option value="asc" className="bg-white dark:bg-[#1a1d24]">Oldest to Latest</option>
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 dark:border-[#262933] mb-6 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all shrink-0 px-1
                            ${activeTab === tab.id
                                ? 'border-[#009966] text-[#009966] dark:text-[#009966]'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                            } `}
                    >
                        {tab.label}
                        <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-[#262933] text-slate-600 dark:text-slate-400">
                            {counts[tab.id] || 0}
                        </span>
                    </button>
                ))}
            </div>

            {applications.length === 0 ? (
                <div className="bg-white/80 dark:bg-[#16181d]/80 border border-slate-200 dark:border-[#262933] rounded-md p-12 text-center flex flex-col items-center shadow-sm premium-shadow">
                    <div className="w-20 h-20 bg-[#009966]/10 dark:bg-[#009966]/5 rounded-md flex items-center justify-center text-[#009966] mb-6">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No applications yet</h3>
                    <p className="text-slate-500 max-w-sm mb-6">You haven't applied to any jobs yet. Start exploring jobs to find your next opportunity.</p>
                    <button onClick={() => navigate('/jobs')} className="text-[#009966] font-bold hover:underline">Browse Job Listings</button>
                </div>
            ) : processedApplications.length === 0 ? (
                <div className="bg-white/80 dark:bg-[#16181d]/80 border border-slate-200 dark:border-[#262933] rounded-md p-12 text-center flex flex-col items-center shadow-sm premium-shadow">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-[#262933] rounded-md flex items-center justify-center text-slate-400 mb-6">
                        <Filter size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No {activeTab} applications</h3>
                    <p className="text-slate-500 max-w-sm">There are no applications matching this status.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {paginatedApplications.map(app => {
                        const job = app.Job || {};
                        const jobStatus = job.Status || job.status || '';
                        const isJobClosed = jobStatus === 'closed' || jobStatus === 'filled';
                        const isJobDeleted = !job.ID;
 
                        const statusColors = {
                             pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-900/40',
                             accepted: 'bg-[#dff5ea] text-[#007744] dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
                             rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-900/40',
                             withdrawn: 'bg-slate-100 text-slate-600 dark:bg-[#262933] dark:text-slate-400 border-slate-200 dark:border-[#303340]'
                        };

                        return (
                            <div key={app.ID} className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md p-5 hover:shadow-md transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-5 premium-shadow">

                                <div className="flex-1 cursor-pointer w-full flex gap-4" onClick={() => navigate(`/jobs/${job.ID}`)}>
                                    <div className={`w-14 h-14 shrink-0 bg-slate-50 dark:bg-[#262933] rounded-md flex items-center justify-center overflow-hidden shadow-sm ${(job.Business?.Hirer?.IsPRO || job.Business?.IsPRO) ? 'border-2 border-[#0095F6]' : 'border border-slate-100 dark:border-[#303340]'}`}>
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
                                    <div>
                                         <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-[#009966] transition-colors">
                                            {job.Description?.Title || job.title || 'Untitled Job'}
                                            {!isJobClosed && !isJobDeleted && <ExternalLink size={14} className="inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                             <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[app.Status] || statusColors.pending}`}>
                                                 {app.Status}
                                             </span>
                                             {isJobDeleted ? (
                                                 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/40">
                                                     Job No Longer Available
                                                 </span>
                                             ) : isJobClosed && (
                                                 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                                                     Closed
                                                 </span>
                                             )}
                                        </div>
                                    </div>

                                    <p className="font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                                        <Briefcase size={14} className="text-[#009966]" /> 
                                        {job.Business?.BusinessName || job.business?.name || job.BusinessName || 'Company'}
                                        {(job.Business?.Hirer?.IsPRO || job.Business?.IsPRO) && (
                                            <CheckCircle2 size={14} className="text-[#0095F6] fill-[#0095F6]/10 shrink-0" title="Verified Business" />
                                        )}
                                    </p>

                                     <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 mb-4">
                                        <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#262933] border border-slate-100 dark:border-[#303340] px-2 py-1 rounded-sm">
                                            <MapPin size={12} className="text-slate-400" /> {job.Business?.Locality || job.Business?.City || job.business?.city || 'Local'}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#262933] border border-slate-100 dark:border-[#303340] px-2 py-1 rounded-sm capitalize">
                                            <Briefcase size={12} className="text-slate-400" /> {(job.Description?.JobType || job.job_type || 'N/A').replace('_', ' ')}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#262933] border border-slate-100 dark:border-[#303340] px-2 py-1 rounded-sm text-[#009966]">
                                            <IndianRupee size={12} /> {job.Description?.SalaryMin || job.salary_min || '0'}-{job.Description?.SalaryMax || job.salary_max || '0'}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-400 dark:text-[#64748b] flex items-center gap-1.5">
                                        <Clock size={12} /> Applied on {new Date(app.CreatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-[#262933] pt-4 md:pt-0 md:pl-5">
                                    {app.Status === 'accepted' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate('/messages', { state: { userId: job.Business?.OwnerID || job.OwnerID } }); }}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[#009966] dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-sm font-bold text-sm transition-colors shadow-sm"
                                        >
                                            <MessageCircle size={16} /> Message
                                        </button>
                                    )}
                                    {app.Status === 'pending' && !isJobClosed && !isJobDeleted && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleWithdraw(app.ID); }}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-[#303340] text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:border-rose-200 dark:hover:text-rose-400 rounded-sm font-bold text-sm transition-colors"
                                        >
                                            <XCircle size={16} /> Withdraw
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] premium-shadow rounded-md p-3">
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

export default MyApplicationsView;
