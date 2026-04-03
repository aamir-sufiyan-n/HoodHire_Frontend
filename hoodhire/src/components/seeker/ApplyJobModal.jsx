import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { jobsAPI } from '../../api/jobs';
import toast from 'react-hot-toast';

const ApplyJobModal = ({ isOpen, onClose, jobId, jobTitle, onSuccess }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await jobsAPI.applyToJob(jobId, { message });
            toast.success('Successfully applied for the job!');
            if (onSuccess) onSuccess();
            setMessage('');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1a1d24] w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 dark:border-[#303340] flex flex-col overflow-hidden">

                <div className="px-6 py-5 border-b border-slate-100 dark:border-[#262933] flex justify-between items-start shrink-0 bg-slate-50/50 dark:bg-[#16181d]/50">
                    <div>
                        <h2 className="text-[18px] font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">Apply for Position</h2>
                        <p className="text-[13px] font-bold text-[#009966]">{jobTitle}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-white dark:bg-[#262933] hover:bg-slate-100 dark:hover:bg-[#303340] border border-slate-200 dark:border-[#303340] rounded-md transition-colors mt-0.5">
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="p-6 bg-white dark:bg-[#1a1d24]">
                    <form id="applyForm" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-[13px] font-extrabold text-slate-800 dark:text-slate-200">
                                    Why are you a good fit?
                                </label>
                                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-[#262933] px-2 py-0.5 rounded">Optional</span>
                            </div>
                            <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                                Stand out from other applicants by writing a brief, personalized message highlighting your most relevant experience.
                            </p>
                            <textarea
                                name="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows="5"
                                className="w-full bg-slate-50 dark:bg-[#0f1115] text-[14px] text-slate-900 dark:text-white px-4 py-3 rounded-md border border-slate-200 dark:border-[#303340] focus:ring-2 focus:ring-[#009966]/20 focus:border-[#009966] outline-none transition-all resize-none shadow-inner"
                                placeholder="I have 2 years of experience in..."
                                maxLength="500"
                            />
                            <div className="text-right mt-2 text-[11px] font-bold text-slate-400">
                                {message.length} / 500
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-[#262933] bg-slate-50 dark:bg-[#16181d] shrink-0 flex justify-end gap-3 items-center">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-[13px] font-extrabold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button type="submit" form="applyForm" disabled={loading} className="px-6 py-2.5 bg-[#009966] hover:bg-[#008855] text-white text-[13px] font-extrabold rounded-md transition-all shadow-md shadow-[#009966]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px] gap-2">
                        {loading ? <span className="animate-spin text-lg leading-none">⟳</span> : <Send size={15} strokeWidth={2.5} />}
                        {loading ? 'Submitting...' : 'Send Application'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ApplyJobModal;
