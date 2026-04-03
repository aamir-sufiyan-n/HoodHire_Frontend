import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, IndianRupee, Clock, Navigation, Bookmark, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { jobsAPI } from '../../api/jobs';
import { seekerAPI } from '../../api/seeker';
import { toast } from 'react-hot-toast';

const SavedJobs = () => {
    const navigate = useNavigate();
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const fetchSavedJobs = async () => {
        try {
            // Fetch saved job records AND all full jobs (which include Business + Description)
            const [savedRes, allJobsRes] = await Promise.all([
                seekerAPI.getSavedJobs(),
                jobsAPI.getAllJobs().catch(() => ({ jobs: [] }))
            ]);

            const savedItems = savedRes?.saved || [];
            const allJobs = allJobsRes?.jobs || [];

            // Build a quick lookup map from full jobs
            const jobMap = {};
            allJobs.forEach(j => { jobMap[j.ID] = j; });

            // Merge: use full job data (has Business + Description), attach save metadata
            const enriched = savedItems.map(item => {
                const fullJob = jobMap[item.JobID];
                return fullJob
                    ? { ...fullJob, _savedId: item.ID, _jobID: item.JobID }
                    : { _savedId: item.ID, _jobID: item.JobID, _fallback: true };
            }).filter(j => !j._fallback); // skip any that couldn't be matched

            setSavedJobs(enriched);
        } catch (error) {
            console.error("Failed to fetch saved jobs:", error);
            toast.error("Failed to load saved jobs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const handleUnsave = async (e, jobId) => {
        e.stopPropagation();
        try {
            await seekerAPI.unsaveJob(jobId);
            setSavedJobs(prev => prev.filter(job => job._jobID !== jobId && job.ID !== jobId));
            toast.success("Job removed from saved list");
            
            // Adjust current page if last item on page was deleted
            const newTotalItems = savedJobs.length - 1;
            const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
        } catch (error) {
            console.error("Failed to unsave job:", error);
            toast.error("Failed to unsave job");
        }
    };

    // Pagination calculations
    const totalPages = Math.ceil(savedJobs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedJobs = savedJobs.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-white dark:bg-[#16181d] rounded-xl border border-slate-100 dark:border-[#262933] animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (savedJobs.length === 0) {
        return (
            <div className="bg-white dark:bg-[#16181d] rounded-xl border border-slate-100 dark:border-[#262933] p-12 text-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bookmark size={32} className="text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Saved Jobs</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                    You haven't saved any jobs yet. Browse listings and bookmark opportunities you're interested in.
                </p>
                <button
                    onClick={() => navigate('/jobs')}
                    className="bg-[#009966] text-white px-6 py-2.5 rounded-md font-bold hover:bg-[#008855] transition-all"
                >
                    Browse Jobs
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedJobs.map((job) => (
                    <div 
                        key={job.ID || job._jobID} 
                        onClick={() => navigate(`/jobs/${job.ID || job._jobID}`)}
                        className="bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-md p-4 premium-shadow hover:shadow-xl hover:-translate-y-0.5 transition-all group cursor-pointer flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 shrink-0 bg-slate-50 dark:bg-[#1a1d24] border border-slate-100 dark:border-[#303340] rounded-sm flex items-center justify-center p-0 overflow-hidden shadow-sm">
                                        {(job.Business?.ProfilePicture || job.Business?.Hirer?.ProfilePicture || job.Hirer?.ProfilePicture || job.ProfilePicture) ? (
                                            <img
                                                src={job.Business?.ProfilePicture || job.Business?.Hirer?.ProfilePicture || job.Hirer?.ProfilePicture || job.ProfilePicture}
                                                alt={job.Business?.BusinessName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xl font-extrabold text-[#009966]">{job.Business?.BusinessName?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-[15px] font-bold text-slate-900 dark:text-white group-hover:text-[#009966] transition-colors line-clamp-1">{job.Description?.Title}</h4>
                                        <p className="text-[12px] font-semibold text-slate-500">{job.Business?.BusinessName}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => handleUnsave(e, job._jobID || job.ID)}
                                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors bg-transparent border-none"
                                    title="Remove from Saved"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2">
                                <span className="flex items-center gap-1"><MapPin size={12} />{job.Business?.Locality || job.Business?.City || 'Local'}</span>
                                <span className="flex items-center gap-1 capitalize"><Navigation size={12} />{job.Description?.JobType?.replace('_', ' ')}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-50 dark:border-[#262933] flex items-center justify-between">
                            <span className="text-[12px] font-bold text-[#009966] bg-emerald-50 dark:bg-emerald-900/10 px-2 py-0.5 rounded">
                                ₹{job.Description?.SalaryMin}-{job.Description?.SalaryMax}
                            </span>
                            <div className="flex items-center text-[12px] font-bold text-blue-600 hover:text-blue-700">
                                Apply Now <ChevronRight size={14} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-2 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-md p-3 shadow-sm">
                    <span className="text-sm font-medium text-slate-500 ml-2">
                        Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-sm border border-slate-200 dark:border-[#303340] text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#262933] transition-colors bg-transparent"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-sm border border-slate-200 dark:border-[#303340] text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#262933] transition-colors bg-transparent"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavedJobs;
