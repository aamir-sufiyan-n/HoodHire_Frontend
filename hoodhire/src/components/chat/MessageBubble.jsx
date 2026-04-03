import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message, isMe, currentUser }) => {

    const senderId = message.sender_id ?? message.SenderID
    const content = message.content ?? message.Content
    const created_at = message.created_at ?? message.CreatedAt
    const is_read = message.is_read ?? message.IsRead;
    const type = message.type ?? message.Type ?? 'text';

    const renderContent = () => {
        if (type === 'image') {
            return (
                <img 
                    src={content} 
                    alt='image' 
                    className='max-w-[200px] max-h-[200px] rounded-lg cursor-pointer object-cover hover:opacity-90 transition-opacity'
                    onClick={() => window.open(content, '_blank')}
                />
            );
        }
        if (type === 'pdf') {
            return (
                <a 
                    href={content} 
                    target='_blank' 
                    rel='noreferrer'
                    className='flex items-center gap-2 text-sm font-bold underline'
                >
                    📄 View PDF
                </a>
            );
        }
        return <p className='leading-relaxed break-words font-medium text-left'>{content}</p>;
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        // replace space with T for ISO compatibility
        const normalized = timeStr.replace(' ', 'T');
        const date = new Date(normalized);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full mb-2`}>
            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] group`}>
                <div
                    className={`relative px-4 py-2.5 rounded-2xl text-sm transition-all shadow-sm ${isMe
                        ? 'bg-[#009966] text-white rounded-tr-none'
                        : 'bg-white dark:bg-[#1a1d24] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#262933] rounded-tl-none'
                        }`}
                >
                    {renderContent()}
                    <div className={`flex items-center gap-1 mt-1 justify-end opacity-70 group-hover:opacity-100 transition-opacity`}>
                        <span className="text-[10px] font-bold">
                            {formatTime(created_at)}
                        </span>
                        {isMe && (
                            is_read ? (
                                <CheckCheck size={12} className="text-emerald-300" />
                            ) : (
                                <Check size={12} className="text-emerald-600" />
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
