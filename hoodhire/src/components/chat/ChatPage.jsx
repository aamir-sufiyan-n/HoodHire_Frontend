import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Search, 
    MoreVertical, 
    Send, 
    User, 
    ArrowLeft, 
    Clock, 
    Check, 
    CheckCheck,
    Phone,
    Video,
    Info,
    Image as ImageIcon,
    Paperclip,
    Smile,
    MessageSquare
} from 'lucide-react';
import { chatAPI } from '../../api/chat';
import { seekerAPI } from '../../api/seeker';
import { hirerAPI } from '../../api/hirer';
import GlobalNavbar from '../GlobalNavbar';
import ConversationItem from './ConversationItem';
import ChatWindow from './ChatWindow';
import toast from 'react-hot-toast';

const ChatPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(location.state?.userId || null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    const selectedUserIdRef = useRef(selectedUserId);
    useEffect(() => {
        selectedUserIdRef.current = selectedUserId;
    }, [selectedUserId]);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                // Fetch unread breakdown and connections
                const [bondsData, unreadRes, metadataRes] = await Promise.all([
                    chatAPI.getConversations(),
                    chatAPI.getUnreadBreakdown().catch(() => ({ unread: {} })),
                    chatAPI.getChatMetadata().catch(() => ({ conversations: [] }))
                ]);

                const bonds = bondsData.bonds || [];
                const unreadMap = unreadRes.unread || {};
                const chatConvs = metadataRes.conversations || [];
                
                // Create maps for last message data from metadata
                const lastMsgMap = {};
                const lastTimeMap = {};
                
                chatConvs.forEach(c => {
                    const otherId = c.other_user_id || c.OtherUserID;
                    lastMsgMap[otherId] = c.last_message || c.LastMessage;
                    lastTimeMap[otherId] = c.last_message_time || c.LastMessageTime;
                });

                // Broadcast total from breakdown
                const total = Object.values(unreadMap).reduce((sum, c) => sum + (Number(c) || 0), 0);
                chatAPI.broadcastTotalUnread(total);

                const role = currentUser?.role;

                // Map Bonds to Conversation format
                const bondConversations = bonds.map(bond => {
                    const otherUserID = role === 'seeker' ? bond.Hirer?.UserID : bond.Seeker?.UserID;
                    const otherName = role === 'seeker' ? bond.Hirer?.FullName : bond.Seeker?.FullName;
                    const avatar = role === 'seeker' ? bond.Hirer?.Business?.ProfilePicture : bond.Seeker?.ProfilePicture;
                    const jobTitle = bond.Job?.Description?.Title;
                    const businessName = role === 'seeker' ? bond.Hirer?.Business?.BusinessName : null;
                    const businessId = role === 'seeker' ? bond.Hirer?.Business?.ID : null;

                    return {
                        user_id: otherUserID,
                        username: (role === 'seeker' && businessName) ? businessName : (otherName || 'Anonymous User'),
                        profile_picture: avatar,
                        job_title: jobTitle,
                        business_name: businessName,
                        business_id: businessId,
                        role: role === 'seeker' ? 'hirer' : 'seeker',
                        last_message: lastMsgMap[otherUserID] || "", 
                        last_message_time: lastTimeMap[otherUserID] || bond.CreatedAt,
                        unread_count: unreadMap[otherUserID] || 0,
                        is_online: false,
                        is_bond: true
                    };
                });

                // Sort by last message if possible, or bond creation time
                bondConversations.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));

                setConversations(bondConversations);
            } catch (err) {
                console.error("Failed to fetch bond-based conversations:", err);
                toast.error("Failed to load connections");
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();

        // Subscribe to new messages and read events
        const unsubscribe = chatAPI.subscribe((msg) => {
            if (msg.type === 'MESSAGE_READ') {
                setConversations(prev => prev.map(c => 
                    (c.user_id === msg.userID || c.UserID === msg.userID) ? { ...c, unread_count: 0, UnreadCount: 0 } : c
                ));
                return;
            }

            setConversations(prev => {
                const sId = msg.sender_id ?? msg.SenderID;
                const rId = msg.receiver_id ?? msg.ReceiverID;
                const content = msg.content ?? msg.Content;
                const createdAt = msg.created_at ?? msg.CreatedAt;

                const index = prev.findIndex(c => 
                    (sId && Number(c.user_id) === Number(sId)) || 
                    (rId && Number(c.user_id) === Number(rId))
                );

                if (index !== -1) {
                    const updated = [...prev];
                    const conv = updated[index];
                    
                    const isCurrentlyOpen = Number(conv.user_id) === Number(selectedUserIdRef.current);
                    const isIncoming = sId && Number(sId) === Number(conv.user_id);
                    const shouldIncrement = isIncoming && !isCurrentlyOpen;

                    const currentUnread = conv.unread_count !== undefined ? conv.unread_count : (conv.UnreadCount || 0);

                    updated[index] = {
                        ...conv,
                        last_message: content || conv.last_message,
                        last_message_time: createdAt || conv.last_message_time,
                        unread_count: shouldIncrement ? (currentUnread + 1) : currentUnread,
                        UnreadCount: shouldIncrement ? (currentUnread + 1) : currentUnread
                    };
                    
                    // Move the updated conversation to the top
                    const item = updated.splice(index, 1)[0];
                    return [item, ...updated];
                }
                return prev;
            });
        });

        return () => unsubscribe();
    }, []); // Empty dependency array

    // Recalculate total unread and sync navbar whenever conversations change
    useEffect(() => {
        const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
        chatAPI.broadcastTotalUnread(totalUnread);
    }, [conversations]);

    const filteredConversations = conversations.filter(c => 
        (c.username || c.Username || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectConversation = (userId) => {
        setSelectedUserId(userId);
        // immediately clear unread count for this conversation
        setConversations(prev => prev.map(c => 
            (c.user_id === userId || c.UserID === userId) ? { ...c, unread_count: 0, UnreadCount: 0 } : c
        ));
        // mark as read on backend
        chatAPI.markAsRead(userId).catch(console.error);
    };

    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-[#0f1115] overflow-hidden">
            <GlobalNavbar />
            
            <div className={`flex-1 flex flex-col w-full max-w-[1400px] mx-auto overflow-hidden ${currentUser?.role === 'hirer' ? 'py-4 md:py-8 px-4 md:px-8' : ''}`}>


                <main className={`${currentUser?.role !== 'hirer' ? 'mt-16' : ''} flex-1 flex overflow-hidden w-full ${currentUser?.role === 'hirer' ? 'rounded-2xl border border-slate-200 dark:border-[#262933]' : 'border-x border-slate-200 dark:border-[#262933]'} bg-white dark:bg-[#16181d] shadow-2xl transition-colors duration-300`}>
                    
                    {/* Column 1: Conversations Sidebar */}
                    <div className={`w-full md:w-[350px] lg:w-[400px] flex flex-col border-r border-slate-200 dark:border-[#262933] ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-slate-200 dark:border-[#262933]">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Messages</h1>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search messages or people"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-[#1f2229] border-none rounded-full text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="flex flex-col gap-4 p-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex gap-3 animate-pulse">
                                            <div className="w-12 h-12 bg-slate-200 dark:bg-[#262933] rounded-full"></div>
                                            <div className="flex-1 flex flex-col gap-2 py-1">
                                                <div className="h-4 bg-slate-200 dark:bg-[#262933] rounded w-1/3"></div>
                                                <div className="h-3 bg-slate-100 dark:bg-[#1f2229] rounded w-2/3"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredConversations.length > 0 ? (
                                filteredConversations.map((conv, idx) => (
                                    <ConversationItem 
                                        key={(conv.user_id || conv.UserID) || `conv-${idx}`}
                                        conversation={conv}
                                        isSelected={selectedUserId === (conv.user_id || conv.UserID)}
                                        onClick={() => handleSelectConversation(conv.user_id || conv.UserID)}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 text-center h-full opacity-50">
                                    <MessageSquare size={48} className="text-slate-300 mb-4" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">No messages found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column 2: Chat Window */}
                    <div className={`flex-1 flex flex-col bg-white dark:bg-[#16181d] ${!selectedUserId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                        {selectedUserId ? (
                            <ChatWindow 
                                conversation={conversations.find(c => c.user_id === selectedUserId)} 
                                currentUser={currentUser}
                                onBack={() => setSelectedUserId(null)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center text-emerald-500 mb-6">
                                    <Send size={40} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your Messages</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm">
                                    Select a conversation from the list or start a new one to connect with seekers and businesses.
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <style aria-hidden="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #262933;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default ChatPage;
