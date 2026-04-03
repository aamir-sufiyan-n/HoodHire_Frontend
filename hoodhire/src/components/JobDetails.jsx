import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Briefcase, MapPin, IndianRupee, Clock, User, Building2,
    Calendar, CheckCircle2, Navigation, ArrowLeft,
    Phone, Mail, Globe, Settings, Building, Share2, Heart, Check, Users, Bookmark, MoreVertical
} from 'lucide-react';
import { jobsAPI } from '../api/jobs';
import { seekerAPI } from '../api/seeker';
import Footer from './Footer';
import GlobalNavbar from './GlobalNavbar';
import toast from 'react-hot-toast';
import ApplyJobModal from './seeker/ApplyJobModal';
import PostJobModal from './hirer/PostJobModal';

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    const [job, setJob] = useState(null);
    const [relatedJobs, setRelatedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);

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
                const res = await jobsAPI.getJobById(id);
                let fetchedJob = null;
                if (res?.job) {
                    fetchedJob = res.job;
                } else if (res?.ID) {
                    fetchedJob = res;
                }

                // Fetch Categories
                const catRes = await jobsAPI.getCategories().catch(() => ({ categories: [] }));
                const categoriesMap = {};
                if (catRes?.categories) {
                    catRes.categories.forEach(c => categoriesMap[c.ID] = c);
                }

                if (fetchedJob && fetchedJob.CategoryID && categoriesMap[fetchedJob.CategoryID]) {
                    fetchedJob.Category = categoriesMap[fetchedJob.CategoryID];
                }
                setJob(fetchedJob || res);

                if (user?.role === 'seeker') {
                    const appsRes = await jobsAPI.getMyApplications().catch(() => ({ applications: [] }));
                    const applications = appsRes?.applications || [];
                    const applied = applications.some(app => Number(app.JobID) === Number(id));
                    setHasApplied(applied);

                    const savedRes = await seekerAPI.getSavedJobs().catch(() => ({ saved: [] }));
                    const savedItems = savedRes?.saved || [];
                    const savedJobId = savedItems.some(item => Number(item.JobID) === Number(id));
                    setIsSaved(savedJobId);
                }

                // Fetch Related Jobs
                if (fetchedJob?.CategoryID) {
                    const allRes = await jobsAPI.getAllJobs();
                    if (allRes?.jobs) {
                        const related = allRes.jobs.filter(j =>
                            j.CategoryID === fetchedJob.CategoryID &&
                            j.ID !== fetchedJob.ID
                        ).slice(0, 5);

                        // Map categories to related jobs as well
                        related.forEach(j => {
                            if (j.CategoryID && categoriesMap[j.CategoryID]) {
                                j.Category = categoriesMap[j.CategoryID];
                            }
                        });
                        setRelatedJobs(related);
                    }
                }

            } catch (error) {
                console.error("Failed to fetch job data:", error);
                toast.error("Failed to load job details.");
            } finally {
                setLoading(false);
            }
        };
        fetchJobData();
    }, [id, user?.role]);

    const handleApplyClick = () => {
        if (!user) {
            toast.error("Please login to apply for jobs");
            navigate('/');
            return;
        }
        if (user.role !== 'seeker') {
            toast.error("Only seekers can apply for jobs");
            return;
        }
        setIsApplyModalOpen(true);
    };

    const handleEditClick = () => {
        setIsEditModalOpen(true);
    };

    const handleJobUpdated = () => {
        setIsEditModalOpen(false);
        window.location.reload();
    };

    const handleSaveToggle = async () => {
        if (!user) {
            toast.error("Please login to save jobs");
            navigate('/login');
            return;
        }

        if (user.role !== 'seeker') {
            toast.error("Only seekers can save jobs");
            return;
        }

        setIsSaveLoading(true);
        try {
            if (isSaved) {
                await seekerAPI.unsaveJob(id);
                setIsSaved(false);
                toast.success("Job unsaved");
            } else {
                await seekerAPI.saveJob(id);
                setIsSaved(true);
                toast.success("Job saved!");
            }
        } catch (error) {
            console.error("Save job failed:", error);
            toast.error(error.message || "Action failed");
        } finally {
            setIsSaveLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-[#f8fafc] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-[#134074] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <div className="text-xl font-bold dark:text-[#134074] text-[#134074]">Loading details...</div>
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
                <button onClick={() => navigate('/jobs')} className="px-6 py-3 bg-[#134074] text-white font-bold rounded-md hover:bg-[#13315C] transition">
                    Browse Other Jobs
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f1115] text-slate-900 dark:text-[#f8fafc] font-sans overflow-hidden flex flex-col relative selection:bg-[#134074]/30 transition-colors duration-300">
            {/* Ambient Backgrounds Removed for cleaner white aesthetic */}

            {/* Global Navbar */}
            <GlobalNavbar />

            <main className="flex-1 mt-20 w-full pt-8 pb-16 z-10">
                <div className="max-w-[1100px] mx-auto px-4 sm:px-8">

                    {/* Back Navigation */}
                    <div className="flex justify-between items-start mb-6 w-full">
                        <div className="invisible w-[40px]"></div> {/* spacer for right offset */}
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md p-2 flex items-center justify-center text-slate-500 hover:text-[#134074] hover:border-[#134074]/30 dark:text-slate-400 dark:hover:text-[#134074] transition-colors shadow-sm w-fit mr-1 lg:-mr-4"
                        >
                            <ArrowLeft size={16} />
                        </button>
                    </div>

                    {/* Top Header & Apply Section */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                        {/* Left: Job Title, Company, Info inline */}
                        <div className="flex gap-4 md:gap-5 items-start">
                            <div className="mt-1 w-[50px] h-[50px] md:w-[60px] md:h-[60px] shrink-0 bg-transparent flex items-center justify-center relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-rose-400 via-fuchsia-500 to-indigo-500 rounded-full blur-[2px] opacity-80"></div>
                                <div className="relative w-full h-full bg-white dark:bg-[#1a1d24] rounded-full border border-slate-100 dark:border-[#303340] flex items-center justify-center shadow-sm overflow-hidden">
                                    {(job.Business?.ProfilePicture || job.Business?.Hirer?.ProfilePicture || job.Hirer?.ProfilePicture || job.ProfilePicture) ? (
                                        <img
                                            src={job.Business?.ProfilePicture || job.Business?.Hirer?.ProfilePicture || job.Hirer?.ProfilePicture || job.ProfilePicture}
                                            alt={job.Business?.BusinessName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-black text-slate-800 dark:text-white">
                                            {job.Business?.BusinessName?.charAt(0).toUpperCase() || 'C'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-[30px] font-extrabold text-slate-900 dark:text-white capitalize tracking-tight mb-1">
                                    {job.Description?.Title}
                                </h1>
                                <p
                                    className="text-[15px] font-bold text-[#134074] mb-4 block cursor-pointer hover:underline decoration-2 underline-offset-4 transition-all"
                                    onClick={() => navigate(`/companies/${job.Business?.ID}`)}
                                >
                                    {job.Business?.BusinessName}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-bold text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-2"><Briefcase size={16} strokeWidth={2} className="text-[#3b9f87]" /> {job.Category?.DisplayName || 'General'}</span>
                                    <span className="flex items-center gap-2 capitalize"><Clock size={16} strokeWidth={2} className="text-[#3b9f87]" /> {job.Description?.JobType?.replace('_', ' ') || 'Flexible'}</span>
                                    <span className="flex items-center gap-2"><IndianRupee size={16} strokeWidth={2} className="text-[#3b9f87]" /> {job.Description?.SalaryMin}-{job.Description?.SalaryMax}</span>
                                    <span className="flex items-center gap-2"><MapPin size={16} strokeWidth={2} className="text-[#3b9f87]" /> {job.Business?.Locality || job.Business?.City || 'Location hidden'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Three-dots actions menu (seeker only) \u2014 top right */}
                        {user?.role === 'seeker' && (
                            <div className="relative self-start mt-1">
                                <button
                                    onClick={() => setShowActionsMenu(v => !v)}
                                    className="p-2 bg-transparent border-none text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-[#262933]"
                                    title="More actions"
                                >
                                    <MoreVertical size={20} />
                                </button>
                                {showActionsMenu && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setShowActionsMenu(false)} />
                                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md shadow-lg z-40 overflow-hidden min-w-[160px]">
                                            <button
                                                onClick={() => { handleSaveToggle(); setShowActionsMenu(false); }}
                                                disabled={isSaveLoading}
                                                className="w-full px-4 py-2.5 text-left text-[13px] font-semibold flex items-center gap-2.5 bg-transparent border-none hover:bg-slate-50 dark:hover:bg-[#262933] transition-colors"
                                            >
                                                {isSaveLoading ? (
                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} className={isSaved ? 'text-blue-600' : 'text-slate-500'} />
                                                )}
                                                <span className={isSaved ? 'text-blue-600' : 'text-slate-700 dark:text-slate-200'}>
                                                    {isSaved ? 'Unsave Job' : 'Save Job'}
                                                </span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Right: Apply / Edit Button */}
                        <div className="w-full md:w-auto shrink-0 mt-4 md:mt-2">
                            {user?.role === 'hirer' ? (
                                <button
                                    onClick={handleEditClick}
                                    className="w-full md:w-[220px] py-3 text-[#0B2545] bg-white text-[13px] tracking-wide font-extrabold rounded-md shadow-sm border border-[#8DA9C4]/40 hover:bg-[#8DA9C4]/20 dark:bg-[#134074]/10 dark:text-[#00cf8a] dark:border-[#134074]/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Settings size={16} /> Edit Job
                                </button>
                            ) : (
                                <button
                                    onClick={() => hasApplied ? navigate('/applications') : handleApplyClick()}
                                    className={`w-full md:w-[220px] py-3 text-white text-[13px] tracking-wide font-extrabold rounded-md transition-all shadow-md transform hover:-translate-y-0.5 border-none flex items-center justify-center gap-2 ${hasApplied ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30' : 'bg-[#379d85] hover:bg-[#2b856e] shadow-[#379d85]/30'}`}
                                >
                                    {hasApplied ? <CheckCircle2 size={16} /> : null}
                                    {hasApplied ? 'View Application' : 'Apply Job'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] gap-10 lg:gap-14">

                        {/* Left Column (Job Details & Story) */}
                        <div className="space-y-10">

                            {/* Job Description */}
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-5 tracking-tight">Job Description</h3>
                                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                                    <p className="whitespace-pre-line leading-relaxed text-[15px]">{job.Description?.Description}</p>
                                </div>
                            </div>

                            {/* Key Responsibilities */}
                            {job.Description?.KeyResponsibilities && job.Description.KeyResponsibilities.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-5 tracking-tight">Key Responsibilities</h3>
                                    <ul className="flex flex-col gap-4">
                                        {job.Description.KeyResponsibilities.map((resp, i) => (
                                            <li key={i} className="flex gap-4 text-slate-600 dark:text-slate-300 text-[15px]">
                                                <Check size={18} strokeWidth={2.5} className="text-[#3b9f87] shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{resp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Professional Skills */}
                            {job.Description?.Skills && job.Description.Skills.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-5 tracking-tight">Professional Skills</h3>
                                    <ul className="flex flex-col gap-4">
                                        {job.Description.Skills.map((skill, i) => (
                                            <li key={i} className="flex items-start gap-4 text-slate-600 dark:text-slate-300 text-[15px]">
                                                <Check size={18} strokeWidth={2.5} className="text-[#3b9f87] shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{skill}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Similar Jobs Section */}
                            {job.CategoryID && (
                                <div className="pt-8 border-t border-slate-100 dark:border-[#262933]">
                                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-5 tracking-tight">Similar Jobs</h3>

                                    {relatedJobs && relatedJobs.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {relatedJobs.map((rjob) => (
                                                <div
                                                    key={rjob.ID}
                                                    onClick={() => { navigate(`/jobs/${rjob.ID}`); window.scrollTo(0, 0); }}
                                                    className="bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#303340] rounded-md p-5 hover:border-[#3b9f87] dark:hover:border-[#3b9f87] transition-colors cursor-pointer group premium-shadow-sm flex flex-col justify-between h-full"
                                                >
                                                    <div>
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 shrink-0 bg-white dark:bg-[#1a1d24] border border-slate-100 dark:border-[#303340] rounded-md flex items-center justify-center shadow-sm overflow-hidden">
                                                                    {(rjob.Business?.ProfilePicture || rjob.Business?.Hirer?.ProfilePicture || rjob.Hirer?.ProfilePicture || rjob.ProfilePicture) ? (
                                                                        <img
                                                                            src={rjob.Business?.ProfilePicture || rjob.Business?.Hirer?.ProfilePicture || rjob.Hirer?.ProfilePicture || rjob.ProfilePicture}
                                                                            alt={rjob.Business?.BusinessName}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-xl font-bold text-[#3b9f87] group-hover:scale-110 transition-transform">
                                                                            {rjob.Business?.BusinessName?.charAt(0).toUpperCase() || 'H'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize group-hover:text-[#3b9f87] transition-colors">
                                                                        {rjob.Description?.Title}
                                                                    </h4>
                                                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                                        {rjob.Business?.BusinessName}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 pt-4 mt-auto">
                                                        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#262933] px-2 py-1 rounded truncate max-w-[100px]">
                                                            <MapPin size={12} className="shrink-0" />{rjob.Business?.City || 'Local'}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#262933] px-2 py-1 rounded capitalize">
                                                            <Clock size={12} />{rjob.Description?.JobType?.replace('_', ' ')}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#3b9f87] bg-[#3b9f87]/10 dark:bg-[#3b9f87]/20 px-2 py-1 rounded">
                                                            <IndianRupee size={12} />{rjob.Description?.SalaryMin}-{rjob.Description?.SalaryMax}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 border border-dashed border-slate-200 dark:border-[#303340] rounded-md text-center bg-slate-50/50 dark:bg-[#1a1d24]/50">
                                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No jobs similar to this one available.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Column (Sidebar Widgets) */}
                        <div className="space-y-6">

                            {/* Job Overview Card */}
                            <div className="bg-[#ffffff]/80 dark:bg-[#13221d] rounded-md p-5 lg:p-6 border border-white dark:border-[#1a2d26] premium-shadow-sm">
                                <h4 className="text-[16px] tracking-tight font-extrabold text-slate-900 dark:text-white mb-4">Job Overview</h4>
                                <ul className="space-y-4">
                                    <li className="flex gap-4">
                                        <User size={18} strokeWidth={2} className="text-[#3b9f87] shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[13px] font-extrabold text-slate-800 dark:text-gray-100 leading-tight mb-1">Job Title</p>
                                            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 capitalize">{job.Description?.Title}</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <Clock size={18} strokeWidth={2} className="text-[#3b9f87] shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[13px] font-extrabold text-slate-800 dark:text-gray-100 leading-tight mb-1">Job Type</p>
                                            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 capitalize">{job.Description?.JobType?.replace('_', ' ')}</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <Briefcase size={18} strokeWidth={2} className="text-[#3b9f87] shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[13px] font-extrabold text-slate-800 dark:text-gray-100 leading-tight mb-1">Category</p>
                                            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 capitalize">{job.Category?.DisplayName || 'General'}</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <CheckCircle2 size={18} strokeWidth={2} className="text-[#3b9f87] shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[13px] font-extrabold text-slate-800 dark:text-gray-100 leading-tight mb-1">Experience</p>
                                            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 capitalize">{job.Description?.ExperienceRequired ? 'Required' : 'No Exp. Needed'}</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <IndianRupee size={18} strokeWidth={2} className="text-[#3b9f87] shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[13px] font-extrabold text-slate-800 dark:text-gray-100 leading-tight mb-1">Offered Salary</p>
                                            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">₹{job.Description?.SalaryMin}-₹{job.Description?.SalaryMax}</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <MapPin size={18} strokeWidth={2} className="text-[#3b9f87] shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[13px] font-extrabold text-slate-800 dark:text-gray-100 leading-tight mb-1">Location</p>
                                            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">{job.Business?.Locality || job.Business?.City || 'Not specified'}</p>
                                        </div>
                                    </li>
                                </ul>

                            </div>

                            {/* About the Business */}
                            <div className="bg-white dark:bg-[#1a1d24] rounded-md p-5 lg:p-6 border border-slate-200 dark:border-[#303340] premium-shadow-sm">
                                <h4 className="text-[16px] tracking-tight font-extrabold text-slate-900 dark:text-white mb-6">About the Business</h4>

                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-[50px] h-[50px] shrink-0 bg-transparent flex items-center justify-center relative">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-rose-400 via-fuchsia-500 to-indigo-500 rounded-full blur-[2px] opacity-80"></div>
                                        <div className="relative w-full h-full bg-white dark:bg-[#1a1d24] rounded-full border border-slate-100 dark:border-[#303340] flex items-center justify-center shadow-sm overflow-hidden">
                                            {(job.Business?.ProfilePicture || job.Business?.Hirer?.ProfilePicture || job.Hirer?.ProfilePicture || job.ProfilePicture) ? (
                                                <img
                                                    src={job.Business?.ProfilePicture || job.Business?.Hirer?.ProfilePicture || job.Hirer?.ProfilePicture || job.ProfilePicture}
                                                    alt={job.Business?.BusinessName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-[18px] font-black text-slate-800 dark:text-white">
                                                    {job.Business?.BusinessName?.charAt(0).toUpperCase() || 'C'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3
                                            className="text-[16px] font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight cursor-pointer hover:text-[#134074] transition-colors"
                                            onClick={() => navigate(`/companies/${job.Business?.ID}`)}
                                        >
                                            {job.Business?.BusinessName || 'Company Name'}
                                        </h3>
                                        <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                                            <span className="flex items-center gap-1"><Users size={12} /> {job.Business?.EmployeeCount || '1-10'} Employees</span>
                                            <span className="flex items-center gap-1"><Calendar size={12} /> Est. {job.Business?.EstablishedYear || '2020'}</span>
                                        </p>
                                    </div>
                                </div>

                                {job.Business?.Bio && (
                                    <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 mb-5">
                                        {job.Business.Bio}
                                    </p>
                                )}

                                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-[#262933]">
                                    <div className="flex gap-3 items-center">
                                        <MapPin size={16} strokeWidth={2} className="text-slate-400 dark:text-slate-500 shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">Location</h4>
                                            <p className="text-[13px] font-medium text-slate-800 dark:text-slate-300">{job.Business?.Address || job.Business?.Locality || job.Business?.City || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    {job.Business?.Website && (
                                        <div className="flex gap-3 items-center">
                                            <Globe size={16} strokeWidth={2} className="text-slate-400 dark:text-slate-500 shrink-0" />
                                            <div className="flex-1">
                                                <h4 className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">Website</h4>
                                                <a href={job.Business.Website.startsWith('http') ? job.Business.Website : `https://${job.Business.Website}`} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-[#134074] hover:underline">
                                                    {job.Business.Website}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                    </div>



                </div>
            </main>
            <Footer />

            <ApplyJobModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                jobId={job.ID}
                jobTitle={job.Description?.Title}
            />
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

export default JobDetails;
