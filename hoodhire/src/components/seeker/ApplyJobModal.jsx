import React, { useState, useEffect, useRef } from 'react';
import { X, Send, FileText, Upload, Trash2, Paperclip, Loader2, CheckCircle2 } from 'lucide-react';
import { jobsAPI } from '../../api/jobs';
import { seekerAPI } from '../../api/seeker';
import toast from 'react-hot-toast';

const ApplyJobModal = ({ isOpen, onClose, jobId, jobTitle, isResumeRequired, onSuccess, businessName, isPro }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileResume, setProfileResume] = useState('');
    const [selectedResume, setSelectedResume] = useState(null); // null, 'profile', or File object
    const [resumeBase64, setResumeBase64] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchSeekerResume();
        } else {
            // Reset state on close
            setMessage('');
            setSelectedResume(null);
            setResumeBase64('');
        }
    }, [isOpen]);

    const fetchSeekerResume = async () => {
        setProfileLoading(true);
        try {
            const res = await seekerAPI.getSeekerProfile();
            const p = res?.profile || res?.seeker || res;
            if (p?.ResumeUrl) {
                const transformed = p.ResumeUrl.replace('/image/upload/', '/raw/upload/');
                setProfileResume(transformed);
                setSelectedResume('profile');
            }
        } catch (err) {
            console.error("Failed to fetch profile for resume:", err);
        } finally {
            setProfileLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error("Please upload a PDF file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should be less than 5MB.");
            return;
        }

        setSelectedResume(file);
        
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            setResumeBase64(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isResumeRequired && !selectedResume) {
            toast.error('A resume is required for this position.');
            return;
        }

        setLoading(true);

        try {
            const applyData = { message };
            
            if (selectedResume === 'profile') {
                applyData.resume = profileResume;
            } else if (selectedResume instanceof File) {
                applyData.resume = resumeBase64;
            } else {
                applyData.resume = "";
            }

            await jobsAPI.applyToJob(jobId, applyData);
            toast.success('Successfully applied for the job!');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1a1d24] w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 dark:border-[#303340] flex flex-col overflow-hidden">

                <div className="px-6 py-5 border-b border-slate-100 dark:border-[#262933] flex justify-between items-start shrink-0 bg-slate-50/50 dark:bg-[#16181d]/50">
                    <div>
                        <h2 className="text-[18px] font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">Apply for Position</h2>
                        <div className="flex items-center gap-2">
                            <p className="text-[13px] font-bold text-[#009966]">{jobTitle}</p>
                            <span className="text-slate-300">•</span>
                            <p className="text-[12px] font-bold text-slate-500 flex items-center gap-1">
                                {businessName}
                                {isPro && <CheckCircle2 size={12} className="text-[#0095F6] fill-[#0095F6]/10" />}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-white dark:bg-[#262933] hover:bg-slate-100 dark:hover:bg-[#303340] border border-slate-200 dark:border-[#303340] rounded-md transition-colors mt-0.5">
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="p-6 bg-white dark:bg-[#1a1d24] max-h-[70vh] overflow-y-auto">
                    <form id="applyForm" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Resume Section */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="block text-[13px] font-extrabold text-slate-800 dark:text-slate-200">
                                    Attach Resume {isResumeRequired && <span className="text-red-500">*</span>}
                                </label>
                                {!isResumeRequired && <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-[#262933] px-2 py-0.5 rounded">Optional</span>}
                            </div>

                            {profileLoading ? (
                                <div className="flex items-center justify-center py-4 bg-slate-50 dark:bg-[#0f1115] rounded-md border border-slate-100 dark:border-[#262933]">
                                    <Loader2 size={20} className="text-[#009966] animate-spin" />
                                </div>
                            ) : selectedResume ? (
                                <div className="relative group">
                                    <div className="flex items-center justify-between bg-emerald-50/50 dark:bg-[#009966]/5 border border-[#009966]/30 p-4 rounded-md">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#009966] text-white rounded flex items-center justify-center">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate" title={selectedResume === 'profile' ? (profileResume.split('/').pop().split('?')[0] || 'Profile Resume.pdf') : selectedResume.name}>
                                                    {selectedResume === 'profile' ? (profileResume.split('/').pop().split('?')[0] || 'Profile Resume.pdf') : selectedResume.name}
                                                </p>
                                                <p className="text-[11px] text-[#009966] font-bold flex items-center gap-1">
                                                    <CheckCircle2 size={10} /> {selectedResume === 'profile' ? 'Using saved profile resume' : 'File attached'}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setSelectedResume(null)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    <label className="flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-slate-200 dark:border-[#303340] rounded-md bg-slate-50/50 dark:bg-[#12141a]/30 transition-all hover:bg-slate-50 dark:hover:bg-[#12141a]/50 cursor-pointer">
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept=".pdf" 
                                            onChange={handleFileChange}
                                            ref={fileInputRef}
                                        />
                                        <div className="w-10 h-10 bg-white dark:bg-[#1a1d24] rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-2 shadow-sm">
                                            <Upload size={18} />
                                        </div>
                                        <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Upload PDF Resume</p>
                                        <p className="text-[10px] text-slate-400 mt-1">Maximum size 5MB</p>
                                    </label>
                                    
                                    {profileResume && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedResume('profile')}
                                            className="flex items-center justify-center gap-2 py-3 border border-[#009966]/30 text-[#009966] bg-[#009966]/5 hover:bg-[#009966]/10 rounded-md text-[13px] font-bold transition-all"
                                        >
                                            <Paperclip size={16} /> Use Resume from Profile
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Message Section */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-[13px] font-extrabold text-slate-800 dark:text-slate-200">
                                    Cover Message
                                </label>
                                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-[#262933] px-2 py-0.5 rounded">Optional</span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                                Highlight your most relevant experience for this specific role.
                            </p>
                            <textarea
                                name="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows="4"
                                className="w-full bg-slate-50 dark:bg-[#0f1115] text-[14px] text-slate-900 dark:text-white px-4 py-3 rounded-md border border-slate-200 dark:border-[#303340] focus:ring-2 focus:ring-[#009966]/20 focus:border-[#009966] outline-none transition-all resize-none shadow-inner"
                                placeholder="Tell the hirer why you're a good fit..."
                                maxLength="500"
                            />
                            <div className="text-right mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                {message.length} / 500 characters
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-[#262933] bg-slate-50 dark:bg-[#16181d] shrink-0 flex justify-end gap-3 items-center">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-[13px] font-extrabold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button type="submit" form="applyForm" disabled={loading} className="px-6 py-2.5 bg-[#009966] hover:bg-[#008855] text-white text-[13px] font-extrabold rounded-md transition-all shadow-md shadow-[#009966]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px] gap-2">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} strokeWidth={2.5} />}
                        {loading ? 'Submitting...' : 'Send Application'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ApplyJobModal;
