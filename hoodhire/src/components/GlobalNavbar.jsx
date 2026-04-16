import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Building2, Briefcase, MessageSquare, User, ArrowLeft, Sparkles } from 'lucide-react';
import { seekerAPI } from '../api/seeker';
import { hirerAPI } from '../api/hirer';
import { chatAPI } from '../api/chat';

const GlobalNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const [profilePic, setProfilePic] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSubLoading, setIsSubLoading] = useState(false);

    useEffect(() => {
        const fetchProfilePic = async () => {
            if (!user) return;
            try {
                let res;
                if (user.role === 'seeker') {
                    res = await seekerAPI.getSeekerProfile();
                    setProfilePic(res.Seeker?.ProfilePicture || res.profile?.ProfilePicture || res.ProfilePicture);
                } else if (user.role === 'hirer') {
                    res = await hirerAPI.getHirerProfile();
                    // Business is now the owner of ProfilePicture according to new model
                    const hirerData = res.Hirer || res.profile || res;
                    const businessData = hirerData.Business || hirerData.business || {};
                    setProfilePic(businessData.ProfilePicture || businessData.profile_picture || hirerData.ProfilePicture || hirerData.profile_picture);
                }
            } catch (err) {
                console.error("Failed to fetch profile pic in navbar:", err);
            }
        };
        fetchProfilePic();

        const fetchSubscriptionStatus = async () => {
            if (user?.role !== 'hirer') return;
            setIsSubLoading(true);
            try {
                const res = await hirerAPI.getSubscriptionStatus();
                setIsSubscribed(res.subscribed && res.status === 'active');
            } catch (err) {
                console.error("Failed to fetch subscription status in navbar:", err);
            } finally {
                setIsSubLoading(false);
            }
        };
        fetchSubscriptionStatus();
    }, [user?.role]);

    useEffect(() => {
        if (!user?.id) return;

        // Fetch initial unread count
        const fetchInitialUnread = async () => {
            try {
                const res = await chatAPI.getUnreadCount();
                setUnreadCount(res.unread_count || 0);
            } catch (err) {
                console.error("Failed to fetch initial unread count:", err);
            }
        };
        fetchInitialUnread();

        // Subscribe to chat updates to refresh unread count
        const unsubscribe = chatAPI.subscribe((msg) => {
            if (msg.type === 'TOTAL_UNREAD_UPDATE') {
                setUnreadCount(msg.count);
            } else if (msg.type === 'MESSAGE_READ') {
                // If a message was marked as read elsewhere, we might want to refetch
                // or wait for a TOTAL_UNREAD_UPDATE broadcast if ChatPage is open.
                // For safety, let's refetch if we're not on the chat page.
                if (!location.pathname.startsWith('/messages')) {
                    fetchInitialUnread();
                }
            } else if (msg.sender_id && msg.receiver_id && !msg.type) {
                // New message received
                const isIncoming = Number(msg.receiver_id) === Number(user.id);
                const activeChatId = chatAPI.getActiveChat();
                const isFromCurrentlyOpenChat = Number(msg.sender_id) === Number(activeChatId);

                // If it's an incoming message and NOT from the currently active chat
                // AND we are not on the chat page (because ChatPage handles its own broadcasts)
                if (isIncoming && !isFromCurrentlyOpenChat && !location.pathname.startsWith('/messages')) {
                    setUnreadCount(prev => prev + 1);
                }
            }
        });

        return () => unsubscribe();
    }, [user?.id, location.pathname]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const getNavStyle = (path) => {
        // Exact match for root landing page, or role-specific home paths
        const isHome = path === '/';
        const currentPath = location.pathname;
        const isActive = isHome 
            ? (currentPath === '/' || currentPath === '/seeker' || currentPath === '/hirer')
            : currentPath.startsWith(path);

        if (isActive) {
            return "text-sm font-bold text-[#009966] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[#009966] after:rounded-full";
        }
        return "text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#009966] dark:hover:text-[#009966] transition-colors";
    };

    if (user?.role === 'hirer') {
        return (
            <header className="fixed top-0 left-0 right-0 h-16 glass-panel border-b border-gray-200/50 dark:border-[#262933]/50 z-50 px-4 lg:px-8 transition-colors duration-300 backdrop-blur-md bg-white/70 dark:bg-[#0f1115]/70">
                <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/hirer')}
                        className="flex items-center gap-2 text-sm font-bold text-[#009966] hover:text-[#007744] transition-all hover:-translate-x-1 bg-transparent border-none p-0"
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} /> Back to Dashboard
                    </button>

                    {!isSubLoading && !isSubscribed && (
                        <button
                            onClick={() => navigate('/hirer/subscriptions')}
                            className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 font-extrabold px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-95 border-none"
                        >
                            <Sparkles size={14} className="animate-pulse" />
                            Go Pro
                        </button>
                    )}
                </div>
            </header>
        );
    }

    return (
        <header className="fixed top-0 flex justify-between left-0 right-0 h-16 glass-panel border-b border-gray-200/50 dark:border-[#262933]/50 z-50 px-4 lg:px-8 transition-colors duration-300 backdrop-blur-md bg-white/70 dark:bg-[#0f1115]/70">
            <div className="flex justify-between items-center gap-8 w-full max-w-[1200px] mx-auto h-full">

                {/* Logo */}
                <div className="text-[20px] font-extrabold tracking-tight cursor-pointer shrink-0" onClick={() => navigate(user?.role === 'hirer' ? '/hirer' : user?.role === 'seeker' ? '/seeker' : '/')}>
                    <span className="text-[#009966]">Hood</span>Hire
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
                    <button onClick={() => navigate(user?.role === 'hirer' ? '/hirer' : user?.role === 'seeker' ? '/seeker' : '/')} className={`bg-transparent border-none p-0 ${getNavStyle('/')}`}>
                        Home
                    </button>
                    <button onClick={() => navigate('/jobs')} className={`bg-transparent border-none p-0 ${getNavStyle('/jobs')}`}>
                        Jobs
                    </button>
                    <button onClick={() => navigate('/companies')} className={`bg-transparent border-none p-0 ${getNavStyle('/companies')}`}>
                        Companies
                    </button>

                    {user?.role === 'seeker' && (
                        <button onClick={() => navigate('/applications')} className={`bg-transparent border-none p-0 ${getNavStyle('/applications')}`}>
                            Applications
                        </button>
                    )}

                    <button onClick={() => navigate('/messages')} className={`bg-transparent border-none p-0 relative ${getNavStyle('/messages')}`}>
                        Messages 
                        {unreadCount > 0 && (
                            <span className="absolute -top-1.5 -right-2.5 bg-orange-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white dark:border-[#0f1115]">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-4 shrink-0">
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#262933] transition-colors border-none bg-transparent"
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

                    {/* Profile Link */}
                    <button
                        onClick={() => navigate(user?.role === 'hirer' ? '/profile/hirer' : '/profile/seeker')}
                        className="flex items-center gap-3 bg-white/80 dark:bg-[#1a1d24]/80 backdrop-blur-md hover:bg-white dark:hover:bg-[#262933] border border-slate-200 dark:border-[#303340] pl-4 pr-1.5 py-1.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md group"
                    >
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#009966] transition-colors">{user?.username || 'Profile'}</p>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#009966] to-[#007744] flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                            {profilePic ? (
                                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={16} className="text-white" />
                            )}
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default GlobalNavbar;
