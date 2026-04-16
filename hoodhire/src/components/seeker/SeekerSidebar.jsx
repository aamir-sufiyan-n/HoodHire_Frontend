import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Home, Compass, Building2, Briefcase, MessageSquare, Users } from 'lucide-react';
import { seekerAPI } from '../../api/seeker';

const SeekerSidebar = ({ profileData, user, currentRoute }) => {
    const navigate = useNavigate();
    const [followingCount, setFollowingCount] = React.useState(0);
    const [unreadCount, setUnreadCount] = React.useState(0);

    React.useEffect(() => {
        // const fetchFollowingInfo = async () => {
        //     if (user?.role === 'seeker') {
        //         try {
        //             const res = await seekerAPI.getFollowedBusinesses();
        //             const list = Array.isArray(res) ? res : (res.businesses || []);
        //             setFollowingCount(list.length || 0);
        //         } catch (err) {
        //             console.log("Failed to fetch following data", err);
        //         }
        //     }
        // };
        // fetchFollowingInfo();

        // Fetch initial unread count
        const fetchUnread = async () => {
            try {
                const { chatAPI } = await import('../../api/chat');
                const res = await chatAPI.getUnreadCount().catch(() => ({ unread_count: 0 }));
                setUnreadCount(res.unread_count || 0);
            } catch (err) {
                console.error("Failed to fetch unread count", err);
            }
        };
        fetchUnread();

        // Subscribe to updates
        let unsubscribe;
        const setupSub = async () => {
            const { chatAPI } = await import('../../api/chat');
            unsubscribe = chatAPI.subscribe((msg) => {
                if (msg.type === 'TOTAL_UNREAD_UPDATE') {
                    setUnreadCount(msg.count || 0);
                }
            });
        };
        setupSub();

        return () => unsubscribe && unsubscribe();
    }, [user?.role]);

    // Helper for active route styling
    const getNavStyle = (route) => {
        if (currentRoute === route) {
            return "flex items-center gap-4 p-3.5 mb-1 rounded-xl font-bold transition-colors w-full text-left bg-[#f0faf5]/80 dark:bg-[#009966]/10 text-[#008855] dark:text-[#009966]";
        }
        return "flex items-center gap-4 p-3.5 mb-1 hover:bg-slate-50 dark:hover:bg-[#1f2229] rounded-xl text-slate-700 dark:text-slate-300 font-medium transition-colors w-full text-left group";
    };

    const getIconStyle = (route) => {
        if (currentRoute === route) {
            return "text-[#009966]";
        }
        return "text-slate-400 group-hover:text-blue-500 transition-colors";
    };

    return (
        <div className="flex flex-col lg:sticky lg:top-28 bg-white/80 dark:bg-[#16181d]/80 backdrop-blur-md border border-slate-200/60 dark:border-[#262933]/60 rounded-sm premium-shadow overflow-hidden group transition-all duration-300 hover:border-[#bdf0d9]/50 dark:hover:border-emerald-900/30">
            {/* Profile Summary section */}
            <div>
                {/* Card Banner */}
                <div className="h-24 bg-gradient-to-r from-[#009966] via-[#009966] to-[#008855] dark:from-[#008855]/50 dark:via-[#009966]/40 dark:to-[#007744]/50 relative"></div>

                <div className="px-6 pb-6 relative flex flex-col items-center text-center mt-[-40px]">
                    <div className="relative w-24 h-24 mb-4">
                        <div className="w-24 h-24 bg-white dark:bg-[#16181d] rounded-full flex items-center justify-center overflow-hidden border-4 border-white dark:border-[#16181d] shadow-md group-hover:scale-105 transition-transform duration-300">
                            <div className="w-full h-full bg-[#f0faf5] dark:bg-[#009966]/10 flex items-center justify-center">
                                {(profileData?.ProfilePicture || profileData?.profile_picture || profileData?.profile_picture_url || profileData?.ProfilePictureUrl) ? (
                                    <img src={profileData.ProfilePicture || profileData.profile_picture || profileData.profile_picture_url || profileData.ProfilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={36} className="text-[#009966]" />
                                )}
                            </div>
                        </div>
                    </div>

                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-0.5 capitalize tracking-tight">
                        {profileData ? profileData.FullName : (user?.username || 'Seeker')}
                    </h2>
                    <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-2">
                        {profileData?.Email || user?.email || 'No email provided'}
                    </p>
                    {profileData?.Address && (
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-center gap-1">
                            <MapPin size={12} /> {profileData.Address}
                        </p>
                    )}
                    <p className="text-sm font-normal text-slate-600 dark:text-slate-300 mb-5 line-clamp-3 leading-relaxed px-2">
                        {profileData?.IsCompleted ? <span>{profileData?.Bio || profileData?.bio || 'No bio provided.'}</span> : 'Ready for your next opportunity? Set up your profile now.'}
                    </p>
                    <button
                        onClick={() => navigate('/profile/seeker')}
                        className="w-full bg-[#008855] hover:bg-[#007744] text-white font-bold py-3 rounded-xl text-sm transition-all transform hover:-translate-y-0.5 shadow-md shadow-[#008855]/20 border-none"
                    >
                        {profileData?.IsCompleted ? 'Update Profile' : 'Setup your profile'}
                    </button>
                </div>
            </div>

            <div className="h-px w-full bg-slate-200/60 dark:bg-[#262933]/60"></div>

            {/* Navigation Menu */}
            <div className="p-3">
                <button onClick={() => navigate('/seeker')} className={getNavStyle('home')}>
                    <Home size={20} className={getIconStyle('home')} /> My Home
                </button>
                <button onClick={() => navigate('/jobs')} className={getNavStyle('jobs')}>
                    <Compass size={20} className={getIconStyle('jobs')} /> Discover Jobs
                </button>
                <button onClick={() => navigate('/companies')} className={getNavStyle('companies')}>
                    <Building2 size={20} className={getIconStyle('companies')} /> Companies
                    <span className="ml-auto text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                         {followingCount} following
                    </span>
                </button>
                <button onClick={() => navigate('/applications')} className={getNavStyle('applications')}>
                    <Briefcase size={20} className={getIconStyle('applications')} /> My Applications
                </button>
                <button onClick={() => navigate('/messages')} className={getNavStyle('messages')}>
                    <div className="flex items-center gap-4 flex-1">
                        <MessageSquare size={20} className={getIconStyle('messages')} /> Messages
                    </div>
                    {unreadCount > 0 && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full shrink-0">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default SeekerSidebar;
