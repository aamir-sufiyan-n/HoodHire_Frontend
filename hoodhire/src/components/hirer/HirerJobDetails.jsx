import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Briefcase, MapPin, IndianRupee, Clock, User, Building2,
    Calendar, CheckCircle2, Navigation, ArrowLeft,
    Phone, Mail, Globe, Settings, Building, Share2, Heart, Check, Users
} from 'lucide-react';
import { jobsAPI } from '../../api/jobs';
import Footer from '../Footer';
import toast from 'react-hot-toast';
import PostJobModal from './PostJobModal';
import GlobalNavbar from '../GlobalNavbar';

const HirerJobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchJobData = async () => {
            try {
                // Fetch Job
                const [res, catRes] = await Promise.all([
                    jobsAPI.getJobById(id),
                    jobsAPI.getCategories().catch(() => ({ categories: [] }))
                ]);
                let fetchedJob = null;
                if (res?.job) {
                    fetchedJob = res.job;
                } else if (res?.ID) {
                    fetchedJob = res;
                }

                if (fetchedJob) {
                    if (fetchedJob.CategoryID && catRes?.categories) {
                        const matchedCat = catRes.categories.find(c => c.ID === fetchedJob.CategoryID);
                        if (matchedCat) {
                            fetchedJob.Category = matchedCat;
                        }
                    }
                    setJob(fetchedJob);
                }
            } catch (error) {
                console.error("Failed to fetch job data:", error);
                toast.error("Failed to load job details.");
            } finally {
                setLoading(false);
            }
        };
        fetchJobData();
    }, [id]);

    const handleEditClick = () => {
        setIsEditModalOpen(true);
    };

    const handleJobUpdated = () => {
        setIsEditModalOpen(false);
        window.location.reload();
    };

    const handleSave = () => {
        toast.success("Job saved to your list!");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-[#f8fafc] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-[#009966] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <div className="text-xl font-bold dark:text-[#009966] text-[#009966]">Loading details...</div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] flex flex-col items-center justify-center text-center p-4">
                <Building2 size={64} className="text-slate-300 dark:text-[#303340] mb-6" />
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Job Not Found</h1>
                <p className="text-slate-500 font-medium mb-8">The opportunity you are looking for might have been closed or removed.</p>
                <button onClick={() => navigate('/jobs')} className="px-6 py-3 bg-[#009966] text-white font-bold rounded-md hover:bg-[#008855] transition">
                    Browse Other Jobs
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0f1115] text-slate-900 dark:text-[#f8fafc] font-sans flex flex-col relative selection:bg-[#009966]/30">
            <GlobalNavbar />
            <main className="flex-1 mt-20 w-full pt-4 pb-8 z-10">
                <div className="max-w-[1000px] mx-auto px-4 sm:px-6">

                    {/* Header Banner - Compact */}
                    <div className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md shadow-sm p-4 sm:p-5 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#262933] rounded-md text-slate-500 transition-colors"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <div className="w-12 h-12 shrink-0 bg-slate-50 dark:bg-[#262933] border border-slate-100 dark:border-[#303340] rounded-md flex items-center justify-center overflow-hidden shadow-sm">
                                {(job.Business?.ProfilePicture || job.Business?.Hirer?.ProfilePicture || job.Hirer?.ProfilePicture || job.ProfilePicture) ? (
                                    <img
                                        src={job.Business?.ProfilePicture || job.Business?.Hirer?.ProfilePicture || job.Hirer?.ProfilePicture || job.ProfilePicture}
                                        alt={job.Business?.BusinessName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Building2 size={24} className="text-[#009966]" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-[#009966] dark:text-[#3b9f87] capitalize leading-none mb-1">
                                    {job.Description?.Title || 'Untitled Job'}
                                </h1>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                                    Ref: {job.ID?.toString().substring(0, 8)}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={handleEditClick}
                                className="flex-1 sm:flex-none px-4 py-2 bg-[#009966] hover:bg-[#007744] text-white text-xs font-bold rounded-md shadow-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <Settings size={14} /> Edit Details
                            </button>
                        </div>
                    </div>

                    {/* Details Form View */}
                    <div className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md shadow-sm p-0 overflow-hidden">

                        {/* Section 1: Overview Specs */}
                        <div className="bg-slate-50 dark:bg-[#16181d] px-5 py-3 border-b border-slate-200 dark:border-[#303340]">
                            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                <Briefcase size={14} className="text-[#009966] dark:text-[#3b9f87]" /> Core Specifications
                            </h2>
                        </div>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6 border-b border-slate-200 dark:border-[#303340]">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Job Category</label>
                                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{job.Category?.DisplayName || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Job Type</label>
                                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">{job.Description?.JobType?.replace('_', ' ') || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Salary Range</label>
                                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">₹{job.Description?.SalaryMin} - ₹{job.Description?.SalaryMax}</div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</label>
                                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{job.Business?.Locality || job.Business?.City || 'Remote / Unspecified'}</div>
                            </div>
                        </div>

                        {/* Section 2: Text Blocks */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

                            {/* Left Col: Description */}
                            <div className="p-5 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-[#303340]">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Description</label>
                                <div className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50/50 dark:bg-[#16181d]/50 p-3 rounded-md border border-slate-100 dark:border-[#262933]">
                                    {job.Description?.Description || 'No description provided.'}
                                </div>
                            </div>

                            {/* Right Col: Lists */}
                            <div className="p-5 flex flex-col gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Key Responsibilities</label>
                                    {job.Description?.KeyResponsibilities && job.Description.KeyResponsibilities.length > 0 ? (
                                        <ul className="flex flex-col gap-2">
                                            {job.Description.KeyResponsibilities.map((resp, i) => (
                                                <li key={i} className="flex gap-2 text-slate-600 dark:text-slate-300 text-[13px] bg-slate-50/50 dark:bg-[#16181d]/50 p-2 rounded-sm border border-slate-100 dark:border-[#262933]">
                                                    <span className="text-[#009966] shrink-0 font-bold -mt-0.5">•</span>
                                                    <span className="leading-snug">{resp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <div className="text-sm italic text-slate-400">None Specified</div>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Required Skills / Experience</label>
                                    {job.Description?.Skills && job.Description.Skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {job.Description.Skills.map((skill, i) => (
                                                <span key={i} className="px-2 py-1 bg-[#EEF4ED] dark:bg-[#009966]/20 text-[#009966] dark:text-[#3b9f87] border border-[#009966]/20 text-[11px] font-bold rounded-sm uppercase tracking-wider">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : <div className="text-sm italic text-slate-400">None Specified</div>}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
            <Footer />

            {user?.role === 'hirer' && (
                <PostJobModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onJobPosted={handleJobUpdated}
                    editingJob={job}
                />
            )}
        </div>
    );
};

export default HirerJobDetails;
