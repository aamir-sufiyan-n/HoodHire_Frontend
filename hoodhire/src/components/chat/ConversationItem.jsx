    import React from 'react';
    import { User, Clock, CheckCircle2 } from 'lucide-react';

    const ConversationItem = ({ conversation, isSelected, onClick, isCollapsed }) => {
        const userId = conversation.user_id || conversation.UserID;
        const username = conversation.username || conversation.Username;
        const profilePicture = conversation.profile_picture || conversation.ProfilePicture;
        const lastMessage = conversation.last_message || conversation.LastMessage;
        const lastMessageTime = conversation.last_message_time || conversation.LastMessageTime;
        const unreadCount = conversation.unread_count ?? conversation.UnreadCount ?? 0;
        const isOnline = conversation.is_online || conversation.IsOnline;
        const isPro = conversation.is_pro || conversation.IsPRO || conversation.PartyA?.IsPRO || conversation.PartyB?.IsPRO;

        const formatTime = (timeStr) => {
            if (!timeStr) return '';
            const date = new Date(timeStr);
            const now = new Date();
            
            // If today, show time
            if (date.toDateString() === now.toDateString()) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            
            // If this week, show day
            const diff = now.getTime() - date.getTime();
            if (diff < 7 * 24 * 60 * 60 * 1000) {
                return date.toLocaleDateString([], { weekday: 'short' });
            }
            
            // Otherwise show date
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        };

        return (
            <button 
                onClick={onClick}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 p-4'} transition-all border-l-4 ${
                    isSelected 
                    ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-500' 
                    : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-[#1f2229]'
                }`}
            >
                <div className="relative shrink-0">
                    <div className={`${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'} rounded-full overflow-hidden bg-slate-100 dark:bg-[#262933] flex items-center justify-center transition-all ${isPro ? 'border-2 border-[#0095F6]' : 'border border-slate-200 dark:border-[#303340]'}`}>
                        {profilePicture ? (
                            <img src={profilePicture} alt={username} className="w-full h-full object-cover" />
                        ) : (
                            <User className="text-slate-400" size={isCollapsed ? 20 : 24} />
                        )}
                    </div>
                    {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#16181d]"></div>
                    )}
                    {isCollapsed && unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full border border-white dark:border-[#16181d]">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                    )}
                </div>

                {!isCollapsed && (
                    <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-start mb-0.5">
                            <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                {username || 'Anonymous User'}
                                {isPro && (
                                    <CheckCircle2 size={12} className="text-[#0095F6] fill-[#0095F6]/10 shrink-0 ml-1" />
                                )}
                            </h3>
                            <span className="text-[10px] font-medium text-slate-400 shrink-0 whitespace-nowrap ml-2">
                                {formatTime(lastMessageTime)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <p className={`text-xs truncate ${unreadCount > 0 ? 'font-bold text-slate-900 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400 font-medium'}`}>
                                {lastMessage || 'No messages yet'}
                            </p>
                            {unreadCount > 0 && (
                                <span className="bg-emerald-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full shrink-0">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </button>
        );
    };

    export default ConversationItem;
