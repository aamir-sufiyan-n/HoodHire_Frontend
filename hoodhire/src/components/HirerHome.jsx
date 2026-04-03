import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    PlusCircle, User, Briefcase, Users, UserCheck,
    Home, ChevronRight, BarChart3, Building2, Sparkles, MoveRight, Clock,
    CheckCircle, XCircle, MessageSquare, HelpCircle
} from 'lucide-react';
import { hirerAPI } from '../api/hirer';
import { jobsAPI } from '../api/jobs';
import { chatAPI } from '../api/chat';
import Footer from './Footer';
import ManageJobsView from './hirer/ManageJobsView';
import PostJobModal from './hirer/PostJobModal';
import ApplicationsView from './hirer/ApplicationsView';
import HirerSupportTickets from './hirer/HirerSupportTickets';
import HirerChatView from './chat/HirerChatView';
import StaffView from './hirer/StaffView';

const HirerHome = () => {
    const navigate = useNavigate();

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const [profileData, setProfileData] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isNavbarPostModalOpen, setIsNavbarPostModalOpen] = useState(false);

    // Dashboard Data State
    const [dashboardJobs, setDashboardJobs] = useState([]);
    const [totalApplicants, setTotalApplicants] = useState(0);
    const [totalStaff, setTotalStaff] = useState(0);
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

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
        const fetchUserData = async () => {
            if (user?.role === 'hirer') {
                try {
                    const res = await hirerAPI.getHirerProfile();
                    if (res?.profile) {
                        setProfileData(res.profile);
                    }
                } catch (err) {
                    console.log("No profile setup yet or failed to fetch.");
                }
            }
        };

        const fetchDashboardStats = async () => {
            if (user?.role !== 'hirer') return;
            setIsDashboardLoading(true);
            try {
                // Fetch basic jobs and categories
                const [res, catRes] = await Promise.all([
                    jobsAPI.getMyJobs(),
                    jobsAPI.getCategories().catch(() => ({ categories: [] }))
                ]);
                const myJobs = res?.jobs || [];
                const categoriesMap = {};
                if (catRes && catRes.categories) {
                    catRes.categories.forEach(c => categoriesMap[c.ID] = c);
                }

                // Map categories to jobs
                myJobs.forEach(job => {
                    if (job.CategoryID && categoriesMap[job.CategoryID]) {
                        job.Category = categoriesMap[job.CategoryID];
                    }
                });

                // Fetch applicants for each job to get totals
                let totalApps = 0;
                const jobsWithApps = await Promise.all(myJobs.map(async (job) => {
                    try {
                        const appsRes = await jobsAPI.getApplicationsForJob(job.ID);
                        const apps = appsRes?.applications || [];
                        totalApps += apps.length;
                        return { ...job, applications: apps };
                    } catch (err) {
                        return { ...job, applications: [] };
                    }
                }));

                // Sort by newest first
                jobsWithApps.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));

                setDashboardJobs(jobsWithApps);
                setTotalApplicants(totalApps);

                // Fetch staff count
                const staffRes = await hirerAPI.getStaff().catch(() => ({ staff: [] }));
                setTotalStaff(staffRes?.staff?.length || 0);
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            } finally {
                setIsDashboardLoading(false);
            }
        };

        fetchUserData();
        fetchDashboardStats();

        // Subscribe to unread count updates
        const fetchInitialUnread = async () => {
            try {
                const res = await chatAPI.getUnreadCount().catch(() => ({ unread_count: 0 }));
                setUnreadMessagesCount(res.unread_count || 0);
            } catch (err) {
                console.error("Failed to fetch initial unread count:", err);
            }
        };
        fetchInitialUnread();

        const unsubscribe = chatAPI.subscribe((msg) => {
            if (msg.type === 'TOTAL_UNREAD_UPDATE') {
                setUnreadMessagesCount(msg.count || 0);
            }
        });

        return () => unsubscribe();
    }, [user?.role]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-[#f8fafc] font-sans overflow-hidden flex flex-col relative selection:bg-orange-500/30 transition-colors duration-300">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#009966]/10 dark:bg-[#009966]/5 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/10 dark:bg-blue-600/5 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
            </div>

            {/* Navbar */}
            <header className="fixed top-0 flex justify-between left-0 right-0 h-20 glass-panel border-b border-gray-200/50 dark:border-[#262933]/50 z-40 px-4 lg:px-8 transition-colors duration-300">
                <div className="flex justify-between items-center gap-8 w-full max-w-7xl mx-auto h-full">
                    {/* Logo */}
                    <div className="text-2xl font-extrabold tracking-tight cursor-pointer shrink-0" onClick={() => navigate('/hirer')}>
                        <span className="text-[#009966] dark:text-[#009966]">Hood</span>Hire
                    </div>

                    <div className="flex-1 hidden md:flex"></div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-4 lg:gap-6 shrink-0">
                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#262933] transition-colors relative ${activeTab === 'messages' ? 'bg-[#009966]/10' : ''}`}
                            aria-label="Messages"
                        >
                            <MessageSquare className={`h-5 w-5 ${activeTab === 'messages' ? 'text-[#009966]' : 'text-slate-400 hover:text-[#009966]'} transition-colors`} />
                        </button>

                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#262933] transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {!isDarkMode ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#009966]" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            )}
                        </button>

                        <button
                            onClick={() => navigate('/profile/hirer')}
                            className="flex items-center gap-3 bg-white/80 dark:bg-[#1a1d24]/80 backdrop-blur-md hover:bg-white dark:hover:bg-[#262933] border border-slate-200 dark:border-[#303340] pl-4 pr-1.5 py-1.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md group"
                        >
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#009966] transition-colors">{user?.username || 'Profile'}</p>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#009966] to-[#009966] flex items-center justify-center overflow-hidden shadow-inner relative">
                                {(profileData?.Business?.ProfilePicture || profileData?.ProfilePicture || profileData?.profile_picture) ? (
                                    <img src={profileData?.Business?.ProfilePicture || profileData.ProfilePicture || profileData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 size={16} className="text-white" />
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Dashboard Layout */}
            <main className="flex-1 mt-20 w-full pt-8 pb-16 z-10 transition-colors">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">

                    {/* Left Sidebar */}
                    <div className="flex flex-col lg:sticky lg:top-28 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-md premium-shadow overflow-hidden transition-all duration-300">
                        {/* Profile Section */}
                        <div className="p-6 pb-4 flex flex-col items-center text-center">
                            <div className="relative w-24 h-24 mb-4 group">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#3b9f87] to-[#009966] rounded-full opacity-20 blur-md group-hover:opacity-30 transition-opacity"></div>
                                <div className="absolute inset-0 flex items-center justify-center relative z-10">
                                    <div className="w-full h-full bg-white dark:bg-[#1a1d24] rounded-full flex items-center justify-center overflow-hidden border-4 border-slate-50 dark:border-[#16181d] shadow-sm transform group-hover:scale-105 transition-transform duration-300">
                                        <div className="w-full h-full flex items-center justify-center bg-white dark:bg-[#007744]/30 text-[#009966] dark:text-[#009966]">
                                            {(profileData?.Business?.ProfilePicture || profileData?.ProfilePicture || profileData?.profile_picture) ? (
                                                <img src={profileData?.Business?.ProfilePicture || profileData.ProfilePicture || profileData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 size={36} strokeWidth={1.5} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-0.5 capitalize tracking-tight">
                                {profileData?.Business?.BusinessName || profileData?.Business?.business_name || (user?.username || 'Employer')}
                            </h2>
                            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-2">
                                {user?.email || 'No email provided'}
                            </p>
                            <p className="text-xs font-bold text-[#009966] dark:text-[#3b9f87] uppercase tracking-wider mb-3 bg-white dark:bg-[#007744]/20 shadow-sm border border-[#3b9f87]/20 dark:border-[#008855]/30 px-3 py-1 rounded-full">
                                {profileData?.Business?.Niche || profileData?.Business?.niche || 'Industry not set'}
                            </p>
                            <p className="text-sm font-normal text-slate-600 dark:text-slate-300 leading-relaxed mb-6 line-clamp-3 px-2">
                                {profileData?.Business?.Bio || profileData?.Business?.bio || 'Setting up your business profile helps local candidates understand your mission better.'}
                            </p>
                            {!(profileData?.Business?.BusinessName || profileData?.Business?.business_name) && (
                                <button
                                    onClick={() => navigate('/profile/hirer')}
                                    className="w-full bg-[#009966] hover:bg-[#008855] text-white font-bold py-3 rounded-md text-sm transition-colors border-none"
                                >
                                    Complete Profile
                                </button>
                            )}
                        </div>

                        <div className="h-px w-full bg-slate-200/60 dark:bg-[#303340]/60"></div>

                        {/* Navigation Links */}
                        <div className="p-3 flex flex-col gap-1">
                            <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-4 py-3 font-bold rounded-md transition-colors w-full text-left ${activeTab === 'dashboard' ? 'bg-[#009966]/10 text-[#009966] dark:text-[#009966]' : 'hover:bg-slate-50 dark:hover:bg-[#1f2229] text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-transparent'}`}>
                                <Home size={18} className={activeTab === 'dashboard' ? "text-[#009966]" : "text-slate-400"} /> Dashboard
                            </button>
                            <button onClick={() => setActiveTab('jobs')} className={`flex items-center gap-3 px-4 py-3 font-bold rounded-md transition-colors w-full text-left ${activeTab === 'jobs' ? 'bg-[#009966]/10 text-[#009966] dark:text-[#009966]' : 'hover:bg-slate-50 dark:hover:bg-[#1f2229] text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-transparent'}`}>
                                <Briefcase size={18} className={activeTab === 'jobs' ? "text-[#009966]" : "text-slate-400"} /> Manage Jobs
                            </button>
                            <button onClick={() => setActiveTab('applications')} className={`flex items-center justify-between px-4 py-3 rounded-md font-bold transition-colors w-full text-left group ${activeTab === 'applications' ? 'bg-[#009966]/10 text-[#009966] dark:text-[#009966]' : 'hover:bg-slate-50 dark:hover:bg-[#1f2229] text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-transparent'}`}>
                                <div className="flex items-center gap-3"><Users size={18} className={activeTab === 'applications' ? "text-[#009966]" : "text-slate-400 group-hover:text-[#009966] transition-colors"} /> Applications</div>
                            </button>
                            <button onClick={() => setActiveTab('support')} className={`flex items-center gap-3 px-4 py-3 font-bold rounded-md transition-colors w-full text-left ${activeTab === 'support' ? 'bg-[#009966]/10 text-[#009966] dark:text-[#009966]' : 'hover:bg-slate-50 dark:hover:bg-[#1f2229] text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-transparent'}`}>
                                <HelpCircle size={18} className={activeTab === 'support' ? "text-[#009966]" : "text-slate-400"} /> Support & Tickets
                            </button>
                            <button onClick={() => setActiveTab('staffs')} className={`flex items-center gap-3 px-4 py-3 font-bold rounded-md transition-colors w-full text-left ${activeTab === 'staffs' ? 'bg-[#009966]/10 text-[#009966] dark:text-[#009966]' : 'hover:bg-slate-50 dark:hover:bg-[#1f2229] text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-transparent'}`}>
                                <UserCheck size={18} className={activeTab === 'staffs' ? "text-[#009966]" : "text-slate-400"} /> Staffs
                            </button>
                            <button onClick={() => setActiveTab('messages')} className={`flex items-center justify-between px-4 py-3 font-bold rounded-md transition-colors w-full text-left border border-transparent group ${activeTab === 'messages' ? 'bg-[#009966]/10 text-[#009966] dark:text-[#009966]' : 'hover:bg-slate-50 dark:hover:bg-[#1f2229] text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}>
                                <div className="flex items-center gap-3">
                                    <MessageSquare size={18} className={activeTab === 'messages' ? "text-[#009966]" : "text-slate-400 group-hover:text-[#009966] transition-colors"} /> Messages
                                </div>
                                {unreadMessagesCount > 0 && (
                                    <span className="bg-emerald-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full shrink-0">
                                        {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Center Column Content */}
                    {activeTab === 'dashboard' ? (
                        <div className="flex flex-col gap-8">
                            {/* Welcome Header */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Overview</h1>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Here's what's happening with your local postings.</p>
                                </div>
                            </div>

                            {/* Quick Stats Grid Upgrade */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-md p-6 premium-shadow flex flex-col justify-between group hover:-translate-y-1 hover:border-[#009966]/40 transition-all relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Briefcase size={80} className="text-[#009966]" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 rounded-md bg-[#009966]/10 flex items-center justify-center text-[#009966] mb-4">
                                            <Briefcase size={20} />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Active Jobs</h4>
                                        <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                            {isDashboardLoading ? '...' : dashboardJobs.filter(j => j.Status === 'open').length}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-md p-6 premium-shadow flex flex-col justify-between group hover:-translate-y-1 hover:border-blue-400/40 transition-all relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-2 -translate-y-2">
                                        <Users size={80} className="text-blue-500" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 rounded-md bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                                            <Users size={20} />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">Total Applicants</h4>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                {isDashboardLoading ? '...' : totalApplicants}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div onClick={() => setActiveTab('staffs')} className="bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-md p-6 premium-shadow flex flex-col justify-between group hover:-translate-y-1 hover:border-[#009966]/40 transition-all relative overflow-hidden cursor-pointer">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <UserCheck size={80} className="text-[#009966]" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 rounded-md bg-[#009966]/10 flex items-center justify-center text-[#009966] mb-4">
                                            <UserCheck size={20} />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Total Staffs</h4>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                {isDashboardLoading ? '...' : totalStaff}
                                            </span>
                                            <span className="text-sm font-bold text-[#009966]">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Job Posts Enhanved Empty State or Active Feed */}
                            {dashboardJobs.length === 0 ? (
                                <div className="bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-md p-8 sm:p-14 premium-shadow text-center flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#009966]/5 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-700"></div>

                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="relative mb-6">
                                            <div className="w-20 h-20 bg-white dark:bg-[#007744]/20 rounded-xl border border-[#3b9f87]/20 dark:border-[#008855]/30 flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                                                <Briefcase size={32} className="text-[#009966]" />
                                            </div>
                                            {/* Decorative floating badges */}
                                            <div className="absolute -top-2 -right-4 w-8 h-8 bg-[#009966] rounded-md rotate-12 flex items-center justify-center shadow-md animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '3s' }}>
                                                <Sparkles size={14} className="text-white" />
                                            </div>
                                            <div className="absolute -bottom-2 -left-4 w-8 h-8 bg-blue-500 rounded-md -rotate-12 flex items-center justify-center shadow-md animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>
                                                <User size={14} className="text-white" />
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">Discover your next great hire</h3>
                                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto text-[15px] leading-relaxed font-medium">
                                            Reach thousands of fresh local talents in your neighborhood by creating your first part-time job listing on HoodHire. Fast, verified, to the point.
                                        </p>
                                        <button onClick={() => setActiveTab('jobs')} className="bg-[#009966] hover:bg-[#008855] text-white font-extrabold py-4 px-10 rounded-md transition-colors flex items-center gap-2 group/btn relative overflow-hidden border-none shadow-sm">
                                            <span className="relative z-10 flex items-center gap-2">
                                                <PlusCircle size={20} className="group-hover/btn:rotate-90 transition-transform duration-300" />
                                                Post a Job Now
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-md premium-shadow overflow-hidden">
                                    <div className="border-b border-slate-200 dark:border-[#262933] px-6 py-5 flex items-center justify-between">
                                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Recent Postings Performance</h3>
                                        <button onClick={() => setActiveTab('jobs')} className="text-sm font-bold text-[#009966] hover:text-[#008855] flex items-center gap-1">
                                            View all <ChevronRight size={16} />
                                        </button>
                                    </div>

                                    <div className="divide-y divide-slate-100 dark:divide-[#262933]">
                                        {dashboardJobs.slice(0, 5).map(job => (
                                            <div key={job.ID} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-[#12141a]/50 transition-colors">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#009966] transition-colors line-clamp-1">
                                                            {job.Description?.Title || 'Untitled Role'}
                                                        </h4>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${job.Status === 'open' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' :
                                                            'bg-slate-100 text-slate-600 dark:bg-[#262933] dark:text-slate-400 border-slate-200 dark:border-[#303340]'
                                                            }`}>
                                                            {job.Status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                        <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(job.CreatedAt).toLocaleDateString()}</span>
                                                        <span className="flex items-center gap-1.5"><Users size={12} /> {job.applications?.length || 0} applications</span>
                                                    </div>
                                                </div>

                                                <button onClick={() => navigate(`/hirer/jobs/${job.ID}`)} className="shrink-0 w-full md:w-auto px-4 py-2 border border-slate-200 dark:border-[#303340] hover:bg-slate-50 dark:hover:bg-[#262933] text-slate-700 dark:text-slate-300 text-sm font-bold rounded-md transition-colors shadow-sm bg-white dark:bg-[#1a1d24]">
                                                    Manage
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'jobs' ? (
                        <ManageJobsView />
                    ) : activeTab === 'applications' ? (
                        <ApplicationsView />
                    ) : activeTab === 'support' ? (
                        <HirerSupportTickets />
                    ) : activeTab === 'messages' ? (
                        <HirerChatView currentUser={user} />
                    ) : activeTab === 'staffs' ? (
                        <StaffView />
                    ) : (
                        <HirerSupportTickets />
                    )}

                </div>
            </main >

            <Footer />

            <PostJobModal
                isOpen={isNavbarPostModalOpen}
                onClose={() => setIsNavbarPostModalOpen(false)}
                onJobPosted={() => {
                    setActiveTab('jobs');
                    // ManageJobsView will re-render and re-fetch jobs when mounted
                }}
            />
        </div >
    );
};

export default HirerHome;
