import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, User, Briefcase, Building2, DollarSign, Navigation,
    Home, ChevronRight, Star, MapPin, MessageSquare, TrendingUp, Compass, Sparkles, Clock, CheckCircle2
} from 'lucide-react';
import { seekerAPI } from '../api/seeker';
import { jobsAPI } from '../api/jobs';
import Footer from './Footer';
import SeekerSidebar from './seeker/SeekerSidebar';
import MyApplicationsView from './seeker/MyApplicationsView';

const SeekerHome = () => {
    const navigate = useNavigate();

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const [profileData, setProfileData] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [appliedJobIds, setAppliedJobIds] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [topCompanies, setTopCompanies] = useState([]);
    const [trendingCategories, setTrendingCategories] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [activeRecommendedTab, setActiveRecommendedTab] = useState('matches');
    const [favoriteBusinessIds, setFavoriteBusinessIds] = useState([]);

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
        const fetchDashboardData = async () => {
            if (user?.role === 'seeker') {
                try {
                    const [profileRes, jobsRes, appsRes, bizRes, favRes, catStatsRes] = await Promise.all([
                        seekerAPI.getSeekerProfile().catch(() => null),
                        jobsAPI.getAllJobs().catch(() => null),
                        jobsAPI.getMyApplications().catch(() => null),
                        jobsAPI.getAllBusinesses().catch(() => null),
                        seekerAPI.getFavoriteBusinesses().catch(() => ({ saved: [] })),
                        seekerAPI.getCategoryStats().catch(() => null)
                    ]);

                    if (profileRes?.profile) setProfileData(profileRes.profile);

                    const allJobs = jobsRes?.jobs || [];
                    if (allJobs.length > 0) setJobs(allJobs);

                    if (appsRes?.applications) {
                        setMyApplications(appsRes.applications);
                        setAppliedJobIds(appsRes.applications.map(app => Number(app.JobID)));
                    }

                    if (favRes?.saved) {
                        setFavoriteBusinessIds(favRes.saved.map(f => Number(f.BusinessID)));
                    }

                    // Compute Top Companies based on open roles count
                    const allBusinesses = bizRes?.businesses || [];
                    if (allBusinesses.length > 0) { // Safely process even if 0 jobs
                        const jobCounts = allJobs.reduce((acc, job) => {
                            const bizId = job.BusinessID || job.Business?.ID;
                            if (bizId) {
                                acc[bizId] = (acc[bizId] || 0) + 1;
                            }
                            return acc;
                        }, {});

                        const businessesWithCounts = allBusinesses.map(biz => ({
                            ...biz,
                            openRolesCount: jobCounts[biz.ID] || 0
                        }));

                        // Sort desc by open roles (greatest number of job posts first)
                        businessesWithCounts.sort((a, b) => b.openRolesCount - a.openRolesCount);

                        setTopCompanies(businessesWithCounts.slice(0, 3));
                    }


                    // Use fetched Category Stats if available
                    if (catStatsRes?.categories) {
                        setTrendingCategories(catStatsRes.categories.slice(0, 5));
                    } else if (allJobs.length > 0) {
                        // Fallback to local computation if API fails
                        const categoryCounts = allJobs.reduce((acc, job) => {
                            if (job.Category) {
                                const catName = job.Category.DisplayName || job.Category.Name;
                                if (catName) {
                                    acc[catName] = (acc[catName] || 0) + 1;
                                }
                            }
                            return acc;
                        }, {});

                        const sortedCategories = Object.entries(categoryCounts)
                            .sort((a, b) => b[1] - a[1]) // highest count first
                            .map(entry => ({ display_name: entry[0], job_count: entry[1] }))
                            .slice(0, 5); // Top 5

                        setTrendingCategories(sortedCategories);
                    }
                } catch (err) {
                    console.log("Failed to fetch dashboard data.", err);
                } finally {
                    setLoadingData(false);
                }
            }
        };
        fetchDashboardData();
    }, [user?.role]);

    // Matching Algorithm
    const getMatchedJobs = () => {
        if (activeRecommendedTab === 'followed') {
            return jobs.filter(job => {
                const bizId = job.BusinessID || job.Business?.ID;
                return favoriteBusinessIds.includes(Number(bizId));
            }).slice(0, 5);
        }

        if (!profileData) return jobs?.slice(0, 5) || []; // Fallback to recent jobs if no profile

        const interestedCategoryIds = profileData.JobInterests?.map(ji => ji.CategoryID) || [];
        const pref = profileData.WorkPreference || {};

        const matched = jobs.filter(job => {
            let matches = false;
            // 1. Matches Category
            if (interestedCategoryIds.includes(job.CategoryID)) matches = true;

            // 2. Matches Work Preference
            if (pref.PreferredShift && job.Description?.Shift === pref.PreferredShift) matches = true;
            if (pref.PartTime && job.Description?.JobType === 'part_time') matches = true;
            if (pref.FullTime && job.Description?.JobType === 'full_time') matches = true;

            return matches;
        });

        // Return up to 5 best matches
        return matched.length > 0 ? matched.slice(0, 5) : jobs?.slice(0, 5) || [];
    };

    const matchedJobs = getMatchedJobs();

    const handleApplyClick = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f1115] text-slate-900 dark:text-[#f8fafc] font-sans flex flex-col relative selection:bg-emerald-500/30 transition-colors duration-300">
            {/* Ambient Background Blobs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 dark:bg-emerald-600/5 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-emerald-400/10 dark:bg-emerald-600/5 blur-[120px]"></div>
            </div>

            {/* Navbar */}
            <header className="fixed top-0 left-0 w-full h-20 bg-transparent flex items-center px-4 lg:px-8 z-50 transition-colors duration-300">
                <div className="flex justify-between items-center gap-8 w-full max-w-7xl mx-auto">
                    {/* Logo */}
                    <div className="text-2xl font-extrabold tracking-tight cursor-pointer shrink-0" onClick={() => navigate('/seeker')}>
                        <span className="text-emerald-600 dark:text-emerald-500">Hood</span>Hire
                    </div>

                    {/* Spacer to push items to the right */}
                    <div className="flex-1 hidden md:block"></div>

                    <div className="flex-1 md:hidden"></div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-4 lg:gap-6 shrink-0">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 border border-transparent rounded-full hover:bg-slate-100 dark:hover:bg-[#262933] hover:border-slate-200 dark:hover:border-[#303340] transition-all"
                            aria-label="Toggle Theme"
                        >
                            {!isDarkMode ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            )}
                        </button>

                        <button
                            onClick={() => navigate('/profile/seeker')}
                            className="flex items-center gap-3 bg-white/80 dark:bg-[#1a1d24]/80 backdrop-blur-md hover:bg-white dark:hover:bg-[#262933] border border-slate-200 dark:border-[#303340] pl-4 pr-1.5 py-1.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md group"
                        >
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#009966] transition-colors">{user?.username || 'Profile'}</p>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#009966] to-[#007744] flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                                {profileData?.ProfilePicture || profileData?.profile_picture || profileData?.profile_picture_url || profileData?.ProfilePictureUrl || profileData?.Seeker?.ProfilePicture ? (
                                    <img 
                                        src={profileData.ProfilePicture || profileData.profile_picture || profileData.profile_picture_url || profileData.ProfilePictureUrl || profileData.Seeker?.ProfilePicture} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User size={16} className="text-white" />
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Dashboard */}
            <main className="flex-1 w-full pt-28 pb-12 z-10">
                <div className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_300px] gap-8 items-start">

                    {/* Left Sidebar */}
                    <SeekerSidebar profileData={profileData} user={user} currentRoute="home" />

                    {/* Center Column */}
                    <div className="flex flex-col gap-6">
                        {/* Highlights Banner */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800/30 rounded-sm premium-shadow p-6 sm:p-8 relative overflow-hidden group">
                            <div className="absolute top-[-20%] right-[-10%] w-[150px] h-[150px] bg-orange-200/50 dark:bg-orange-500/10 rounded-full blur-[40px] group-hover:bg-amber-300/50 transition-colors duration-700"></div>
                            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2">
                                        Find a part-time that works for you <Sparkles size={24} className="text-blue-500 dark:text-blue-400 inline-block animate-pulse" />
                                    </h2>
                                    <p className="text-slate-600 dark:text-orange-200/70 text-sm sm:text-base max-w-lg mb-0 font-medium leading-relaxed">
                                        We're personalizing your job feed. Explore roles tailored to your unique skills and ambitions.
                                    </p>
                                </div>
                                <div className="hidden sm:flex w-20 h-20 bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-sm premium-shadow items-center justify-center transform rotate-6 border border-white/40 dark:border-white/10 shadow-lg">
                                    <Star size={36} className="text-yellow-500" fill="currentColor" />
                                </div>
                            </div>
                        </div>

                        {/* Recommended Jobs Card List */}
                        <div className="bg-white/80 dark:bg-[#16181d]/80 backdrop-blur-md border border-slate-200/60 dark:border-[#262933]/60 rounded-sm premium-shadow p-6 premium-shadow">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                    Recommended
                                </h3>
                                <button onClick={() => navigate('/jobs')} className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:text-blue-700 flex items-center gap-1 group bg-transparent border-none p-0">
                                    View all <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>

                            <div className="flex gap-6 border-b border-slate-200 dark:border-[#262933] mb-8">
                                <button 
                                    onClick={() => setActiveRecommendedTab('matches')}
                                    className={`pb-3 text-sm font-bold transition-all ${activeRecommendedTab === 'matches' ? 'text-[#008855] dark:text-[#009966] border-b-2 border-[#009966]' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                                >
                                    Matches Profile
                                </button>
                                <button 
                                    onClick={() => setActiveRecommendedTab('followed')}
                                    className={`pb-3 text-sm font-bold transition-all ${activeRecommendedTab === 'followed' ? 'text-[#008855] dark:text-[#009966] border-b-2 border-[#009966]' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                                >
                                    Followed
                                </button>
                            </div>

                            {/* Job List or Empty State */}
                            {loadingData ? (
                                <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-slate-300 dark:border-[#303340] rounded-sm premium-shadow p-8 bg-slate-50/50 dark:bg-[#1a1d24]/50">
                                    <div className="w-12 h-12 border-4 border-[#009966] border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">Scouring the best matches...</p>
                                </div>
                            ) : matchedJobs.length > 0 ? (
                                <div className="flex flex-col gap-5">
                                    {matchedJobs.map(job => (
                                        <div key={job.ID} onClick={() => handleApplyClick(job.ID)} className="bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-sm premium-shadow p-5 shadow-sm hover:shadow-md hover:border-[#7ddfba] dark:hover:border-[#007744] transition-all cursor-pointer group flex flex-col sm:flex-row gap-5">
                                            <div className={`w-16 h-16 shrink-0 bg-slate-50 dark:bg-[#1a1d24] rounded-sm premium-shadow flex items-center justify-center shadow-sm overflow-hidden ${(job.Business?.Hirer?.IsPRO || job.Business?.IsPRO) ? 'border-2 border-[#0095F6]' : 'border border-slate-100 dark:border-[#303340]'}`}>
                                                {(job.Business?.ProfilePicture || job.Business?.Hirer?.ProfilePicture || job.Hirer?.ProfilePicture || job.ProfilePicture) ? (
                                                    <img 
                                                        src={job.Business?.ProfilePicture || job.Business?.Hirer?.ProfilePicture || job.Hirer?.ProfilePicture || job.ProfilePicture} 
                                                        alt={job.Business?.BusinessName} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-2xl font-extrabold text-slate-400/50 dark:text-[#303340] group-hover:text-[#7ddfba] dark:group-hover:text-[#007744] transition-colors uppercase">
                                                        {job.Business?.BusinessName?.charAt(0) || 'H'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize group-hover:text-[#008855] dark:group-hover:text-[#009966] transition-colors">{job.Description?.Title}</h3>
                                                    {appliedJobIds.includes(Number(job.ID)) ? (
                                                        <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full border border-blue-100 dark:border-blue-800/30">Applied</span>
                                                    ) : null}
                                                </div>
                                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                                                    {job.Business?.BusinessName}
                                                    {(job.Business?.Hirer?.IsPRO || job.Business?.IsPRO) && (
                                                        <CheckCircle2 size={14} className="text-[#0095F6] fill-[#0095F6]/10 shrink-0" title="Verified Business" />
                                                    )}
                                                    • <span className="font-medium text-slate-500">{job.Business?.Locality || 'Local'}</span>
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    {job.Category && (
                                                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-[#262933] text-slate-600 dark:text-slate-300 rounded-md capitalize">
                                                            {job.Category.DisplayName}
                                                        </span>
                                                    )}
                                                    <span className="text-xs font-bold px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md capitalize">
                                                        {job.Description?.JobType?.replace('_', ' ')}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#262933] px-2 py-1 rounded-md">
                                                        <DollarSign size={12} className="text-[#009966]" /> {job.Description?.SalaryMin}-{job.Description?.SalaryMax} / {job.Description?.SalaryType}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-slate-300 dark:border-[#303340] rounded-sm premium-shadow p-8 bg-slate-50/50 dark:bg-[#1a1d24]/50 hover:bg-slate-50 dark:hover:bg-[#1a1d24] transition-colors duration-300">
                                    {/* ... Existing empty state UI ... */}
                                    <div className="relative mb-8">
                                        <div className="absolute top-[-20px] left-[-30px] w-12 h-12 bg-white dark:bg-[#262933] rounded-sm premium-shadow flex items-center justify-center shadow-md transform -rotate-12 border border-slate-100 dark:border-[#303340] z-0">
                                            <Briefcase size={20} className="text-slate-400" />
                                        </div>
                                        <div className="w-24 h-24 bg-white dark:bg-[#262933] rounded-xl flex items-center justify-center shadow-xl transform rotate-3 border border-slate-100 dark:border-[#303340] z-10 relative premium-glow">
                                            <div className="w-16 h-16 bg-[#f0faf5] dark:bg-[#009966]/10 rounded-sm premium-shadow flex justify-center items-center">
                                                <Search size={32} className="text-[#009966] animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-[-15px] right-[-20px] w-10 h-10 bg-white dark:bg-[#262933] rounded-sm premium-shadow flex items-center justify-center shadow-md transform rotate-12 border border-slate-100 dark:border-[#303340] z-0">
                                            <Star size={18} className="text-yellow-400" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3 text-center tracking-tight">Hang tight!</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm font-medium mb-6 leading-relaxed">
                                        We're scanning exactly what matches your unique profile. Adjust preferences or complete your profile to expand options.
                                    </p>
                                    <button onClick={() => navigate('/profile/seeker')} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform shadow-md">
                                        Update Preferences
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Recent Applications Widget */}
                        {myApplications.length > 0 && (
                            <div className="bg-white/80 dark:bg-[#16181d]/80 backdrop-blur-md border border-slate-200/60 dark:border-[#262933]/60 rounded-sm premium-shadow p-6 premium-shadow">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                        Recent Applications
                                    </h3>
                                    <button onClick={() => navigate('/applications')} className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:text-blue-700 flex items-center gap-1 group bg-transparent border-none p-0">
                                        View all <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {myApplications.slice(0, 3).map(app => {
                                        const job = jobs.find(j => j.ID === app.JobID) || {};
                                        const statusColors = {
                                            pending: 'bg-[#dff5ea] text-amber-700 dark:bg-[#f0faf5]0/20 dark:text-amber-400',
                                            accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
                                            rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
                                            withdrawn: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400'
                                        };
                                        return (
                                            <div key={app.ID} onClick={() => navigate(`/jobs/${app.JobID}`)} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-[#303340] hover:border-[#bdf0d9] dark:hover:border-emerald-900/40 hover:bg-[#f0faf5]/30 dark:hover:bg-[#009966]/5 transition-all cursor-pointer group">
                                                <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-50 dark:bg-[#1a1d24] rounded-xl flex items-center justify-center font-bold text-slate-400 overflow-hidden">
                                                    {(job.Business?.ProfilePicture || job.Business?.Hirer?.ProfilePicture || job.Hirer?.ProfilePicture || job.ProfilePicture) ? (
                                                        <img 
                                                            src={job.Business?.ProfilePicture || job.Business?.Hirer?.ProfilePicture || job.Hirer?.ProfilePicture || job.ProfilePicture} 
                                                            alt={job.Business?.BusinessName} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        job.Business?.BusinessName?.charAt(0) || 'J'
                                                    )}
                                                </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-[#008855] dark:group-hover:text-[#009966] transition-colors">{job.Description?.Title || 'Untitled Position'}</h4>
                                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{job.Business?.BusinessName} • Applied {new Date(app.CreatedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[app.Status] || statusColors.pending}`}>
                                                    {app.Status}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="hidden xl:flex flex-col lg:sticky lg:top-28">
                        {/* unified block for right column items */}
                        <div className="bg-white/80 dark:bg-[#16181d]/80 backdrop-blur-md border border-slate-200/60 dark:border-[#262933]/60 rounded-sm premium-shadow premium-shadow overflow-hidden">
                            {/* Trending Categories Widget */}
                            <div className="p-6">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
                                    <TrendingUp size={16} className="text-[#009966]" /> Trending Categories
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {loadingData ? (
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Loading categories...</p>
                                    ) : trendingCategories.length > 0 ? (
                                        trendingCategories.map((cat, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-[#262933] text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-[#dff5ea] dark:hover:bg-emerald-900/40 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors border border-transparent hover:border-[#bdf0d9] dark:hover:border-[#007744]/50 flex items-center gap-2">
                                                {cat.display_name || cat.name}
                                                <span className="text-[10px] bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded-full text-emerald-600 dark:text-emerald-400 font-bold">
                                                    {cat.job_count}
                                                </span>
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-500 dark:text-slate-400">No categories trending yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="h-px w-full bg-slate-200/60 dark:bg-[#262933]/60"></div>

                            {/* Top Employers Widget */}
                            <div className="p-6">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
                                    <Building2 size={16} className="text-[#009966]" /> Top Employers
                                </h3>
                                <div className="flex flex-col gap-4">
                                    {loadingData ? (
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Loading top employers...</p>
                                    ) : topCompanies.length > 0 ? topCompanies.map((company, i) => (
                                        <div key={company.ID} onClick={() => navigate(`/companies/${company.ID}`)} className="flex items-center gap-3 group cursor-pointer transition-all hover:translate-x-1">
                                            <div className={`w-10 h-10 bg-slate-100 dark:bg-[#262933] rounded-sm premium-shadow flex items-center justify-center overflow-hidden group-hover:border-[#7ddfba] dark:group-hover:border-[#007744] transition-colors shrink-0 ${(company.Hirer?.IsPRO || company.IsPRO) ? 'border-2 border-[#0095F6]' : 'border border-slate-200 dark:border-[#303340]'}`}>
                                                {(company.ProfilePicture || company.LogoUrl) ? (
                                                    <img src={company.ProfilePicture || company.LogoUrl} alt={company.BusinessName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-slate-400 group-hover:text-[#009966] transition-colors">
                                                        {company.BusinessName?.charAt(0) || 'B'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="overflow-hidden">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#008855] dark:group-hover:text-[#009966] transition-colors truncate flex items-center gap-1.5">
                                                    {company.BusinessName}
                                                    {(company.Hirer?.IsPRO || company.IsPRO) && (
                                                        <CheckCircle2 size={12} className="text-[#0095F6] fill-[#0095F6]/10 shrink-0" title="Verified Business" />
                                                    )}
                                                </h4>
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Hiring {company.openRolesCount} active roles</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-slate-500 dark:text-slate-400">No top employers found.</p>
                                    )}
                                </div>
                                <button onClick={() => navigate('/companies')} className="w-full mt-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#1a1d24] hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-900/50 rounded-xl border border-slate-200 dark:border-[#262933] transition-colors">
                                    View all companies
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SeekerHome;

