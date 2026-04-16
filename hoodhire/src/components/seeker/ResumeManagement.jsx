import React, { useState, useRef } from 'react';
import { FileText, Upload, Trash2, Eye, Download, Loader2, Plus, Paperclip } from 'lucide-react';
import { seekerAPI } from '../../api/seeker';
import toast from 'react-hot-toast';

const ResumeManagement = ({ resumeUrl, onRefresh }) => {
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const fileInputRef = useRef(null);
    
    // Ensure PDF resumes use raw/upload instead of image/upload for correct Cloudinary behavior
    const transformedResumeUrl = resumeUrl ? resumeUrl.replace('/image/upload/', '/raw/upload/') : '';

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (file.type !== 'application/pdf') {
            toast.error("Please upload a PDF file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should be less than 5MB.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            await seekerAPI.uploadResume(formData);
            toast.success("Resume uploaded successfully!");
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to upload resume.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to remove your resume?")) return;

        setDeleting(true);
        try {
            await seekerAPI.deleteResume();
            toast.success("Resume removed successfully.");
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to delete resume.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="w-full bg-white/95 dark:bg-[#16181d]/95 backdrop-blur-xl rounded-sm premium-shadow border border-slate-200/50 dark:border-[#262933]/50 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} className="text-[#009966]" /> Resume / CV
                </h3>
                {resumeUrl && (
                    <button 
                        onClick={handleDelete}
                        disabled={deleting}
                        className="text-slate-400 hover:text-red-500 transition-colors bg-transparent border-none p-1 disabled:opacity-50"
                        title="Delete Resume"
                    >
                        {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                )}
            </div>

            {resumeUrl ? (
                <div className="flex items-center justify-between bg-slate-50 dark:bg-[#1a1d24] border border-slate-100 dark:border-[#262933] p-4 rounded-md">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded flex items-center justify-center text-[#009966] shrink-0">
                            <FileText size={20} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate" title={transformedResumeUrl.split('/').pop().split('?')[0] || "Your Resume.pdf"}>
                                {transformedResumeUrl.split('/').pop().split('?')[0] || "Your Resume.pdf"}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-500 font-medium">Ready for job applications</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="p-2 text-slate-500 hover:text-[#009966] bg-white dark:bg-[#262933] border border-slate-200 dark:border-[#303340] rounded transition-all hover:shadow-sm cursor-pointer">
                            <input 
                                type="file" 
                                className="hidden" 
                                accept=".pdf" 
                                onChange={handleUpload}
                                disabled={uploading}
                            />
                            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        </label>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-slate-200 dark:border-[#303340] rounded-md bg-slate-50/50 dark:bg-[#12141a]/30 transition-all hover:bg-slate-50 dark:hover:bg-[#12141a]/50">
                    <div className="w-12 h-12 bg-white dark:bg-[#1a1d24] rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-3 shadow-sm">
                        <Paperclip size={24} />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">No resume uploaded</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-500 mb-4 text-center">Upload your CV to apply for jobs that require it</p>
                    
                    <label className="px-6 py-2 bg-[#009966] hover:bg-[#008855] text-white text-[12px] font-bold rounded shadow-sm transition-all cursor-pointer flex items-center gap-2">
                        <input 
                            type="file" 
                            className="hidden" 
                            accept=".pdf" 
                            onChange={handleUpload}
                            disabled={uploading}
                            ref={fileInputRef}
                        />
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        {uploading ? 'Uploading...' : 'Upload PDF'}
                    </label>
                </div>
            )}
        </div>
    );
};

export default ResumeManagement;
