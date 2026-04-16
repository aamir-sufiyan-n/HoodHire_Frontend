import React, { useState, useEffect, useRef } from 'react';
import { 
    ArrowLeft, 
    MoreVertical, 
    Send, 
    Loader2, 
    User, 
    Smile, 
    Paperclip, 
    ImageIcon,
    Phone,
    Video,
    Info,
    CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../../api/chat';
import MessageBubble from './MessageBubble';
import toast from 'react-hot-toast';

const ChatWindow = ({ conversation, currentUser, onBack }) => {
    const navigate = useNavigate();
    const userId = conversation?.user_id;
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // File input refs
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initial load and subscription
    useEffect(() => {
        if (!userId) return;
        
        // Reset pagination when switching users
        setPage(1);
        setHasMore(true);
        setIsLoadingMore(false);
        
        fetchMessages(1);

        const unsubscribe = chatAPI.subscribe((msg) => {
            // Only add message if it belongs to this conversation
            if (msg.sender_id === Number(userId) || msg.receiver_id === Number(userId)) {
                setMessages(prev => {
                    // Check if message already exists (to avoid duplicates from local add + WS echo)
                    if (prev.some(m => 
                        m.id === msg.id || 
                        (m.content === msg.content && 
                         m.sender_id === msg.sender_id && 
                         Math.abs(new Date(m.created_at) - new Date(msg.created_at)) < 2000)
                    )) return prev;
                    return [...prev, msg];
                });
                
                // If it's an incoming message, mark as read
                if (msg.sender_id === Number(userId)) {
                    chatAPI.markAsRead(userId)
                        .then(() => chatAPI.notifyRead(userId))
                        .catch(console.error);
                }
            }
        });

        return () => unsubscribe();
    }, [userId]);

    // Track active chat for notification suppression
    useEffect(() => {
        if (userId) {
            chatAPI.setActiveChat(userId);
            return () => chatAPI.setActiveChat(null);
        }
    }, [userId]);

    const fetchMessages = async (pageNum = 1) => {
        if (pageNum === 1) setIsLoading(true);
        try {
            const res = await chatAPI.getConversation(userId, pageNum, 20);
            const fetched = res.messages || [];
            if (pageNum === 1) {
                setMessages(fetched);
                // Mark as read immediately when opening
                chatAPI.markAsRead(userId)
                    .then(() => chatAPI.notifyRead(userId))
                    .catch(console.error);
            } else {
                setMessages(prev => [...fetched, ...prev]); // Prepend older messages
            }
            if (fetched.length < 20) setHasMore(false); // No more pages
        } catch (err) {
            console.error("Failed to fetch messages:", err);
            toast.error(pageNum === 1 ? "Failed to load message history" : "Failed to load more messages");
        } finally {
            if (pageNum === 1) setIsLoading(false);
        }
    };

    const loadMore = async () => {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
        const nextPage = page + 1;
        await fetchMessages(nextPage);
        setPage(nextPage);
        setIsLoadingMore(false);
    };

    const scrollToBottom = (behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
    };

    const uploadFile = async (file) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('accessToken');
        
        try {
            const res = await fetch('http://localhost:8081/messages/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            return await res.json(); // returns { url, type }
        } catch (err) {
            console.error("Upload failed", err);
            toast.error("File upload failed");
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = async (e, forcedType = null) => {
        const file = e.target.files[0];
        if (!file || !userId) return;

        const result = await uploadFile(file);
        if (result && result.url) {
            // Send URL via WebSocket with the returned type
            const metaType = forcedType || result.type || 'image';
            chatAPI.sendMessage(userId, result.url, metaType);
        }
        // Reset input so the same file can be selected again
        e.target.value = '';
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        const content = inputValue.trim();
        if (!content || !userId) return;

        const success = chatAPI.sendMessage(userId, content);
        if (!success) {
            toast.error("Failed to send message. Are you connected?");
            return;
        }
        setInputValue('');
        // don't add to state here — WebSocket echo will add it
    };

    if (isLoading && userId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-[#16181d]">
                <Loader2 className="text-emerald-500 animate-spin mb-4" size={32} />
                <p className="text-slate-500 font-medium">Loading conversation...</p>
            </div>
        );
    }

    const otherUser = messages.find(m => m.sender_id === userId)?.sender || 
                       messages.find(m => m.receiver_id === userId)?.receiver || 
                       null;

    // Use conversation name as primary if it's high quality (not generic)
    // or if otherUser doesn't provide a better one.
    const messageParterName = otherUser?.FullName || otherUser?.full_name || otherUser?.BusinessName || otherUser?.Username;
    const displayUsername = messageParterName || conversation?.username || 'Chat Partner';
    const displayPicture = otherUser?.ProfilePicture || conversation?.profile_picture;
    const isPro = otherUser?.IsPRO || conversation?.is_pro || conversation?.IsPRO;

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#16181d] relative">
            {/* Chat Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-[#262933] shrink-0 bg-white/80 dark:bg-[#16181d]/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onBack}
                        className="p-1 md:hidden hover:bg-slate-100 dark:hover:bg-[#1f2229] rounded-full transition-colors text-slate-500 border-none bg-transparent"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => {
                            if (conversation?.role === 'hirer' || conversation?.business_id) {
                                // For seekers clicking on a business
                                navigate(`/companies/${conversation.business_id || userId}`);
                            } else {
                                // For hirers clicking on a seeker
                                navigate(`/hirer/seeker/${userId}`, { state: { applicationStatus: 'accepted' } });
                            }
                        }}
                    >
                        <div className={`w-10 h-10 rounded-full bg-slate-100 dark:bg-[#262933] overflow-hidden flex items-center justify-center group-hover:border-emerald-500 transition-colors ${isPro ? 'border-2 border-[#0095F6]' : 'border border-slate-200 dark:border-[#303340]'}`}>
                            {displayPicture ? (
                                <img src={displayPicture} alt={displayUsername} className="w-full h-full object-cover" />
                            ) : (
                                <User className="text-slate-400 group-hover:text-emerald-500 transition-colors" size={20} />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-emerald-500 transition-colors">
                                {displayUsername}
                                {isPro && (
                                    <CheckCircle2 size={12} className="text-[#0095F6] fill-[#0095F6]/10 shrink-0 ml-1" />
                                )}
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-500">Online</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-[#009966] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-full transition-all border-none bg-transparent"><Phone size={18} /></button>
                    <button className="p-2 text-slate-400 hover:text-[#009966] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-full transition-all border-none bg-transparent"><Video size={18} /></button>
                    <button className="p-2 text-slate-400 hover:text-[#009966] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-full transition-all border-none bg-transparent"><Info size={18} /></button>
                    <div className="w-px h-6 bg-slate-200 dark:bg-[#262933] mx-1"></div>
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#1f2229] border-none bg-transparent"><MoreVertical size={18} /></button>
                </div>
            </div>

            {/* Message Area */}
            <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-4 custom-scrollbar bg-slate-50/30 dark:bg-[#0f1115]/30"
            >
                <div ref={messagesEndRef} />
                
                {messages.length > 0 ? (
                    <>
                        {[...messages].reverse().map((msg, index) => {
                            const currentUserId = Number(currentUser?.id);
                            return (
                                <MessageBubble 
                                    key={msg.id || index}
                                    message={msg}
                                    isMe={Number(msg.sender_id) === currentUserId}
                                    currentUser={currentUser}
                                />
                            );
                        })}
                        {hasMore && (
                            <button 
                                onClick={loadMore}
                                disabled={isLoadingMore}
                                className='text-sm font-bold text-[#009966] hover:text-[#007744] mx-auto block py-4 transition-colors border-none bg-transparent disabled:opacity-50'
                            >
                                {isLoadingMore ? 'Loading older messages...' : 'Load older messages'}
                            </button>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full opacity-60">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                            <Smile size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Say Hello!</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[240px]">
                            Start a direct conversation with this user by typing a message below.
                        </p>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-[#16181d] border-t border-slate-200 dark:border-[#262933] pb-6 sm:pb-4 transition-colors">
                <form 
                    onSubmit={handleSendMessage}
                    className="flex items-end gap-2 bg-slate-50 dark:bg-[#1f2229] border border-slate-200 dark:border-[#303340] rounded-2xl p-2 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500/50 transition-all"
                >
                    <div className="flex items-center gap-1 pb-1">
                        <input type='file' accept='.pdf' ref={fileInputRef} onChange={(e) => handleFileSelect(e, 'pdf')} className='hidden' />
                        <input type='file' accept='image/*' ref={imageInputRef} onChange={(e) => handleFileSelect(e, 'image')} className='hidden' />
                        
                        <button 
                            type="button" 
                            disabled={isUploading}
                            onClick={() => fileInputRef.current.click()}
                            className="p-2 text-slate-400 hover:text-[#009966] transition-colors border-none bg-transparent disabled:opacity-50"
                        >
                            <Paperclip size={20} />
                        </button>
                        <button 
                            type="button" 
                            disabled={isUploading}
                            onClick={() => imageInputRef.current.click()}
                            className="p-2 text-slate-400 hover:text-[#009966] transition-colors border-none bg-transparent disabled:opacity-50"
                        >
                            <ImageIcon size={20} />
                        </button>
                    </div>
                    
                    {isUploading && (
                        <div className="flex-1 flex items-center justify-center p-3">
                            <Loader2 className="animate-spin text-emerald-500 mr-2" size={16} />
                            <span className="text-xs font-bold text-slate-500">Uploading...</span>
                        </div>
                    )}
                    
                    {!isUploading && (
                        <textarea 
                            rows="1"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            className="flex-1 bg-transparent border-none text-sm p-3 min-h-[44px] max-h-32 resize-none outline-none dark:text-white font-medium"
                        />
                    )}

                    <div className="flex items-center gap-1 pb-1">
                        <button type="button" className="p-2 text-slate-400 hover:text-emerald-500 transition-colors border-none bg-transparent"><Smile size={20} /></button>
                        <button 
                            type="submit"
                            disabled={!inputValue.trim() || isUploading}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#009966] hover:bg-[#008855] text-white disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 border-none"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
