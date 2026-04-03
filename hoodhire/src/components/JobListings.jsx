import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Briefcase, MapPin, IndianRupee, Clock, User, Building2,
    Calendar, CheckCircle2, Navigation, Search, Filter, Home, Compass, MessageSquare,
    ChevronLeft, ChevronRight, Bookmark, Star
} from 'lucide-react';
import { jobsAPI } from '../api/jobs';
import { seekerAPI } from '../api/seeker';
import Footer from './Footer';
import toast from 'react-hot-toast';
import SeekerSidebar from './seeker/SeekerSidebar';
import JobFilterSidebar from './seeker/JobFilterSidebar';
import GlobalNavbar from './GlobalNavbar';

const JobListings = () => {
    const navigate = useNavigate();
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const location = useLocation();

    // Initialize state with values from navigation state if they exist
    const initialSearch = location.state?.search || '';
    const initialLocation = location.state?.location || '';

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [searchLocation, setSearchLocation] = useState(initialLocation);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: initialSearch,
        location: initialLocation,
        categories: [],
        jobTypes: [],
        experience: [],
        datePosted: 'All',
        salaryRange: [0, 1000000]
    });
    const [appliedJobIds, setAppliedJobIds] = useState([]);
    const [savedJobIds, setSavedJobIds] = useState([]);
    const [favoritedBusinessIds, setFavoritedBusinessIds] = useState([]);
    const [profileData, setProfileData] = useState(null);
    const [isSavingJobId, setIsSavingJobId] = useState(null);
    const [isFavoritingId, setIsFavoritingId] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'applied' | 'saved'

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 6;

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
        const fetchJobsData = async () => {
            try {
                // Fetch all active jobs and categories
                const [res, catRes] = await Promise.all([
                    jobsAPI.getAllJobs(),
                    jobsAPI.getCategories().catch(() => ({ categories: [] }))
                ]);

                const jobsList = res?.jobs || [];
                const categoriesMap = {};
                if (catRes && catRes.categories) {
                    catRes.categories.forEach(c => categoriesMap[c.ID] = c);
                }

                jobsList.forEach(job => {
                    if (job.CategoryID && categoriesMap[job.CategoryID]) {
                        job.Category = categoriesMap[job.CategoryID];
                    }
                });

                if (jobsList.length > 0 || res?.jobs) {
                    setJobs(jobsList);
                }

                // If user is seeker, fetch their applications to disable buttons
                if (user?.role === 'seeker') {
                    const appsRes = await jobsAPI.getMyApplications();
                    const applications = appsRes?.applications || [];
                    setAppliedJobIds(applications.map(app => Number(app.JobID)));

                    const profileRes = await seekerAPI.getSeekerProfile().catch(() => null);
                    if (profileRes?.profile) {
                        setProfileData(profileRes.profile);
                    }

                    const savedRes = await seekerAPI.getSavedJobs().catch(() => ({ saved: [] }));
                    const savedItems = savedRes?.saved || [];
                    setSavedJobIds(savedItems.map(sj => Number(sj.JobID)));

                    const favRes = await seekerAPI.getFavoriteBusinesses().catch(() => ({ saved: [] }));
                    const favItems = favRes?.saved || [];
                    setFavoritedBusinessIds(favItems.map(f => Number(f.BusinessID)));
                }

            } catch (error) {
                console.error("Failed to fetch jobs data:", error);
                toast.error("Failed to load job listings.");
            } finally {
                setLoading(false);
            }
        };
        fetchJobsData();
    }, [user?.role]);

    const handleApplyClick = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };

    const handleInterested = (jobId) => {
        toast.success("Marked as interested!");
    };

    const handleSaveToggle = async (e, jobId) => {
        e.stopPropagation();
        if (!user) { toast.error("Please login to save jobs"); navigate('/login'); return; }
        if (user.role !== 'seeker') { toast.error("Only seekers can save jobs"); return; }

        const isSaved = savedJobIds.includes(Number(jobId));
        setIsSavingJobId(jobId);
        try {
            if (isSaved) {
                await seekerAPI.unsaveJob(jobId);
                setSavedJobIds(prev => prev.filter(id => id !== Number(jobId)));
                toast.success("Job unsaved");
            } else {
                await seekerAPI.saveJob(jobId);
                setSavedJobIds(prev => [...prev, Number(jobId)]);
                toast.success("Job saved!");
            }
        } catch (error) {
            toast.error(error.message || "Failed to update saved job");
        } finally {
            setIsSavingJobId(null);
        }
    };

    const handleFavoriteBusinessToggle = async (e, businessId) => {
        e.stopPropagation();
        if (!user) { toast.error("Please login to favorite businesses"); navigate('/login'); return; }
        if (user.role !== 'seeker') return;

        const isFav = favoritedBusinessIds.includes(Number(businessId));
        setIsFavoritingId(businessId);
        try {
            if (isFav) {
                await seekerAPI.unfavoriteBusiness(businessId);
                setFavoritedBusinessIds(prev => prev.filter(id => id !== Number(businessId)));
                toast.success("Removed from favorites");
            } else {
                await seekerAPI.favoriteBusiness(businessId);
                setFavoritedBusinessIds(prev => [...prev, Number(businessId)]);
                toast.success("Company favorited!");
            }
        } catch (error) {
            toast.error(error.message || "Action failed");
        } finally {
            setIsFavoritingId(null);
        }
    };

    const handleSearchSubmit = () => {
        setFilters(prev => ({ ...prev, search: searchTerm, location: searchLocation }));
        setCurrentPage(1);
        setShowSuggestions(false);
    };

    const handleSuggestionClick = (suggestionText) => {
        setSearchTerm(suggestionText);
        setFilters(prev => ({ ...prev, search: suggestionText }));
        setShowSuggestions(false);
    };

    // Calculate suggestions based on `searchTerm` instead of `filters.search`
    const searchSuggestions = jobs
        .map(job => [job.Description?.Title, job.Business?.BusinessName])
        .flat()
        .filter(Boolean)
        // Make unique
        .filter((value, index, self) => self.indexOf(value) === index)
        .filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 5);

    const filteredJobs = jobs.filter(job => {
        // Search
        if (filters.search) {
            const query = filters.search.toLowerCase();
            const matchesTitle = job.Description?.Title?.toLowerCase().includes(query);
            const matchesCompany = job.Business?.BusinessName?.toLowerCase().includes(query);
            if (!matchesTitle && !matchesCompany) return false;
        }

        // Location
        if (filters.location && job.Business?.City !== filters.location) return false;

        // Categories
        if (filters.categories.length > 0) {
            const cat = job.Category?.DisplayName || 'Other';
            if (!filters.categories.includes(cat)) return false;
        }

        // Job Types
        if (filters.jobTypes.length > 0) {
            const type = job.Description?.JobType || 'other';
            if (!filters.jobTypes.includes(type)) return false;
        }

        // Experience Level
        if (filters.experience.length > 0) {
            const reqExp = job.Description?.ExperienceRequired ? 'Experience Required' : 'No Experience';
            if (!filters.experience.includes(reqExp)) return false;
        }

        // Salary Range
        if (filters.salaryRange) {
            const [filterMin, filterMax] = filters.salaryRange;
            const jobMax = job.Description?.SalaryMax || 0;
            const jobMin = job.Description?.SalaryMin || 0;

            // Only filter if the job actually has salary data
            if (jobMax > 0 || jobMin > 0) {
                // A job matches if its minimum salary is AT QUITE LEAST above the minimum filter, 
                // and we shouldn't strictly require both bounds unless it's way outside the range.
                // The simplest check: does the job's range overlap with the filter's range at all?
                if (jobMax < filterMin || jobMin > filterMax) {
                    return false;
                }
            }
        }

        return true;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, activeTab]);

    // When switching to tabs, filter accordingly
    const displayedJobs = activeTab === 'saved'
        ? filteredJobs.filter(job => savedJobIds.includes(Number(job.ID)))
        : activeTab === 'applied'
            ? filteredJobs.filter(job => appliedJobIds.includes(Number(job.ID)))
            : filteredJobs.filter(job => !appliedJobIds.includes(Number(job.ID)));

    // Pagination calculations
    const totalPages = Math.ceil(displayedJobs.length / jobsPerPage);
    const paginatedJobs = displayedJobs.slice(
        (currentPage - 1) * jobsPerPage,
        currentPage * jobsPerPage
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-[#f8fafc] font-sans overflow-x-hidden flex flex-col relative selection:bg-orange-500/30 transition-colors duration-300">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#009966]/10 dark:bg-[#009966]/5 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/10 dark:bg-blue-600/5 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
            </div>

            {/* Global Navbar */}
            <GlobalNavbar />

            <main className="flex-1 mt-20 w-full pt-8 pb-16 z-10">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6">

                    {/* Header Section with Search */}
                    <div className="mb-8 p-6 lg:p-10 bg-gradient-to-br from-emerald-50/50 to-slate-50/50 dark:from-emerald-900/20 dark:to-slate-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-[12px] premium-shadow group overflow-visible relative">
                        <div className="absolute top-[-20%] right-[-10%] w-[150px] h-[150px] bg-emerald-200/50 dark:bg-[#009966]/10 rounded-[12px] blur-[40px] group-hover:bg-[#009966]/20 transition-colors duration-700"></div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Discover Opportunities</h1>
                                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium max-w-xl">
                                    Browse through local openings that match your skills. Find flexible part-time gigs seamlessly.
                                </p>
                            </div>

                            {/* Relocated Search Bar */}
                            <div className="flex-1 w-full max-w-2xl bg-white dark:bg-[#16181d] rounded-full border border-gray-200 dark:border-[#262933] p-1.5 flex items-center gap-2 transition-all hover:border-[#009966]/40 focus-within:border-[#009966]/60 premium-shadow relative z-50">
                                <div className="flex-[1.5] flex items-center px-4">
                                    <Search className="h-4 w-4 text-[#009966] mr-2 flex-shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Search roles, companies..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setShowSuggestions(e.target.value.length > 0);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearchSubmit();
                                                e.target.blur();
                                            }
                                        }}
                                        onFocus={() => {
                                            if (searchTerm.length > 0) setShowSuggestions(true);
                                        }}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        className="w-full bg-transparent border-none outline-none text-slate-700 dark:text-[#f8fafc] placeholder:text-slate-400 text-sm py-2"
                                    />
                                </div>

                                <div className="w-px h-8 bg-slate-200 dark:bg-[#262933]"></div>

                                <div className="flex-1 flex items-center px-3">
                                    <MapPin className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="City or location"
                                        value={searchLocation}
                                        onChange={(e) => setSearchLocation(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearchSubmit();
                                                e.target.blur();
                                            }
                                        }}
                                        className="w-full bg-transparent border-none outline-none text-slate-700 dark:text-[#f8fafc] placeholder:text-slate-400 text-sm py-2"
                                    />
                                </div>

                                <button
                                    onClick={handleSearchSubmit}
                                    className="px-6 py-2.5 bg-[#009966] hover:bg-[#008855] text-white font-bold rounded-full transition-all text-sm flex-shrink-0 shadow-md shadow-[#009966]/20 hover:shadow-lg hover:shadow-[#009966]/40 transform hover:-translate-y-0.5 border-none"
                                >
                                    Search
                                </button>

                                {/* Search Autosuggestions Dropdown */}
                                {showSuggestions && searchSuggestions.length > 0 && (
                                    <div className="absolute top-full mt-2 w-full left-0 bg-white dark:bg-[#16181d] border border-slate-100 dark:border-[#262933] rounded-xl premium-shadow overflow-hidden z-50">
                                        {searchSuggestions.map((suggestion, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-[#1f2229] cursor-pointer flex items-center gap-3 transition-colors text-sm text-slate-700 dark:text-slate-300"
                                            >
                                                <Search size={14} className="text-slate-400" />
                                                <span className="capitalize">{suggestion}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-8 items-start">
                        {/* Left Sidebar Nav (Filter) */}
                        <JobFilterSidebar jobs={jobs} filters={filters} setFilters={setFilters} />

                        {/* Right column: Tabs + Job List */}
                        <div className="flex-1 flex flex-col gap-0">

                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 dark:border-[#303340] mb-5">
                            <button
                                onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                                className={`pb-3 text-[14px] px-1 mr-8 bg-transparent border-none font-extrabold transition-all relative ${
                                    activeTab === 'all' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                All Jobs <span className="text-[11px] font-black text-slate-400">({filteredJobs.filter(j => !appliedJobIds.includes(Number(j.ID))).length})</span>
                                {activeTab === 'all' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-slate-900 dark:bg-white rounded-t-sm"></div>}
                            </button>
                            <button
                                onClick={() => { setActiveTab('applied'); setCurrentPage(1); }}
                                className={`pb-3 text-[14px] px-1 mr-8 bg-transparent border-none font-extrabold transition-all relative ${
                                    activeTab === 'applied' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                Applied Jobs <span className="text-[11px] font-black text-slate-400">({appliedJobIds.length})</span>
                                {activeTab === 'applied' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-slate-900 dark:bg-white rounded-t-sm"></div>}
                            </button>
                            <button
                                onClick={() => { setActiveTab('saved'); setCurrentPage(1); }}
                                className={`pb-3 text-[14px] px-1 bg-transparent border-none font-extrabold transition-all relative ${
                                    activeTab === 'saved' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                Saved Jobs <span className="text-[11px] font-black text-slate-400">({savedJobIds.length})</span>
                                {activeTab === 'saved' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-slate-900 dark:bg-white rounded-t-sm"></div>}
                            </button>
                        </div>

                        {/* Job List */}
                        <div className="flex flex-col gap-5">
                            {loading ? (
                                <div className="text-center py-20 text-slate-500 font-bold dark:text-slate-400 bg-white/50 dark:bg-[#16181d]/50 rounded-2xl border border-slate-200 dark:border-[#303340] border-dashed">
                                    <div className="animate-pulse flex flex-col items-center">
                                        <div className="w-12 h-12 bg-slate-200 dark:bg-[#303340] rounded-full mb-4"></div>
                                        <div>Loading jobs...</div>
                                    </div>
                                </div>
                            ) : displayedJobs.length === 0 ? (
                                <div className="text-center py-20 text-slate-500 font-medium dark:text-slate-400 bg-white/50 dark:bg-[#16181d]/50 rounded-2xl border border-slate-200 dark:border-[#303340] border-dashed">
                                    {activeTab === 'saved' ? 'You have no saved jobs yet.' : 'No available jobs matching your criteria were found.'}
                                </div>
                            ) : (
                                paginatedJobs.map((job) => (
                                    <div key={job.ID} className="relative bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-md p-4 premium-shadow hover:shadow-xl hover:-translate-y-0.5 transition-all group">
                                        {/* Bookmark button — top-right corner */}
                                        {user?.role === 'seeker' && (
                                            <button
                                                onClick={(e) => handleSaveToggle(e, job.ID)}
                                                className={`absolute top-3 right-3 p-1.5 bg-transparent border-none transition-colors z-10 ${
                                                    savedJobIds.includes(Number(job.ID))
                                                    ? 'text-blue-600'
                                                    : 'text-slate-300 dark:text-slate-600 hover:text-blue-500'
                                                }`}
                                                title={savedJobIds.includes(Number(job.ID)) ? "Unsave Job" : "Save Job"}
                                            >
                                                {isSavingJobId === job.ID ? (
                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <Bookmark size={17} fill={savedJobIds.includes(Number(job.ID)) ? "currentColor" : "none"} strokeWidth={2} />
                                                )}
                                            </button>
                                        )}

                                        <div className="flex flex-col md:flex-row justify-between gap-4">

                                            {/* Job Info */}
                                            <div className="flex-1 flex gap-4 cursor-pointer" onClick={() => navigate(`/jobs/${job.ID}`)}>
                                                <div className="w-12 h-12 shrink-0 bg-slate-50 dark:bg-[#1a1d24] border border-slate-100 dark:border-[#303340] rounded-sm flex items-center justify-center p-0 overflow-hidden shadow-sm">
                                                    {(job.Business?.ProfilePicture || job.Business?.Hirer?.ProfilePicture || job.Hirer?.ProfilePicture || job.ProfilePicture) ? (
                                                        <img
                                                            src={job.Business?.ProfilePicture || job.Business?.Hirer?.ProfilePicture || job.Hirer?.ProfilePicture || job.ProfilePicture}
                                                            alt={job.Business?.BusinessName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-2xl font-extrabold text-slate-400/50 dark:text-[#303340] group-hover:text-[#009966] transition-colors">
                                                            {job.Business?.BusinessName?.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <h3 className="text-[17px] font-bold text-slate-900 dark:text-white capitalize group-hover:text-[#008855] dark:group-hover:text-[#009966] transition-colors leading-tight">{job.Description?.Title}</h3>
                                                    <p className="text-[13px] font-semibold text-[#009966] mb-1.5">{job.Business?.BusinessName}</p>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                        <span className="flex items-center gap-1"><MapPin size={12} />{job.Business?.Locality || job.Business?.City || 'Local'}</span>
                                                        <span className="flex items-center gap-1 capitalize"><Navigation size={12} />{job.Description?.JobType?.replace('_', ' ')}</span>
                                                        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-[#262933] px-1.5 py-0.5 rounded-sm border border-slate-200 dark:border-[#303340]"><IndianRupee size={12} className="text-[#009966]" />{job.Description?.SalaryMin}-{job.Description?.SalaryMax}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex md:flex-col items-center justify-end gap-1.5 shrink-0">
                                                <button
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        if (appliedJobIds.includes(Number(job.ID))) {
                                                            navigate('/applications');
                                                        } else {
                                                            handleApplyClick(job.ID); 
                                                        }
                                                    }}
                                                    className={`px-5 py-2 text-white text-sm font-bold rounded-md transition-all shadow-sm w-full md:w-auto text-center border-none ${appliedJobIds.includes(Number(job.ID)) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#009966] hover:bg-[#008855] hover:shadow-[#009966]/20'}`}
                                                >
                                                    {appliedJobIds.includes(Number(job.ID)) ? 'View Application' : 'Apply Now'}
                                                </button>
                                            </div>

                                        </div>

                                        {/* Description Snippet */}
                                        <div className="mt-4 border-t border-slate-100 dark:border-[#262933] pt-3">
                                            <p className="text-[13px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                                                {job.Description?.Description}
                                            </p>

                                            {/* Requirements / Tags */}
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {job.Category && (
                                                    <span className="text-[11px] font-bold px-2 py-1 bg-slate-100 dark:bg-[#262933] text-slate-600 dark:text-slate-300 rounded-md uppercase tracking-wider">
                                                        {job.Category.DisplayName}
                                                    </span>
                                                )}
                                                {job.Description?.Shift && (
                                                    <span className="text-[11px] font-bold px-2 py-1 bg-slate-100 dark:bg-[#262933] text-slate-700 dark:text-slate-300 rounded-md uppercase tracking-wider">
                                                        {job.Description.Shift} shift
                                                    </span>
                                                )}
                                                {job.Description?.ExperienceRequired && (
                                                    <span className="text-[11px] font-bold px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-md uppercase tracking-wider">
                                                        Experience Required
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

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
                        </div> {/* end right column */}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default JobListings;
