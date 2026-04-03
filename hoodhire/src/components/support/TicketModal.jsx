import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, MessageSquare, Send, Building2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { seekerAPI } from '../../api/seeker';
import { hirerAPI } from '../../api/hirer';
import { jobsAPI } from '../../api/jobs';

const TicketModal = ({ 
    isOpen, 
    onClose, 
    // Seeker-specific: report a business
    businessId = null, 
    businessName = '',
    // Hirer-specific: report a seeker
    seekerId = null,
    seekerName = '',
    // Shared
    role = 'seeker',    // 'seeker' | 'hirer'
    initialType = 'complaint',
    onSuccess 
}) => {
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        type: initialType
    });
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusinessId, setSelectedBusinessId] = useState(businessId || '');
    const [selectedSeekerId, setSelectedSeekerId] = useState(seekerId || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingBusinesses, setIsFetchingBusinesses] = useState(false);

    // For seekers: fetch businesses when reporting without a preset target
    useEffect(() => {
        if (isOpen && role === 'seeker' && formData.type === 'report' && !businessId) {
            const fetchBusinesses = async () => {
                setIsFetchingBusinesses(true);
                try {
                    const res = await jobsAPI.getAllBusinesses();
                    setBusinesses(res.businesses || []);
                } catch (error) {
                    console.error("Failed to fetch businesses:", error);
                } finally {
                    setIsFetchingBusinesses(false);
                }
            };
            fetchBusinesses();
        }
    }, [isOpen, formData.type, businessId, role]);

    // Reset target on type change
    useEffect(() => {
        if (formData.type === 'complaint') {
            setSelectedBusinessId(businessId || '');
            setSelectedSeekerId(seekerId || '');
        }
    }, [formData.type, businessId, seekerId]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate target for report type
        if (formData.type === 'report') {
            if (role === 'seeker' && !selectedBusinessId) {
                toast.error("Please select a business to report");
                return;
            }
            if (role === 'hirer' && !selectedSeekerId) {
                toast.error("Please enter the Seeker ID to report");
                return;
            }
        }

        if (formData.subject.length < 5) {
            toast.error("Subject must be at least 5 characters long");
            return;
        }
        if (formData.description.length < 10) {
            toast.error("Description must be at least 10 characters long");
            return;
        }

        setIsLoading(true);
        try {
            let ticketData = { ...formData };

            if (role === 'seeker') {
                if (selectedBusinessId) {
                    ticketData.reported_business_id = Number(selectedBusinessId);
                }
                await seekerAPI.createTicket(ticketData);
            } else {
                // hirer
                if (formData.type === 'report' && selectedSeekerId) {
                    ticketData.reported_seeker_id = Number(selectedSeekerId);
                }
                await hirerAPI.createTicket(ticketData);
            }

            toast.success(formData.type === 'report' ? "Report filed successfully" : "Complaint submitted successfully");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to submit ticket:", error);
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const isHirer = role === 'hirer';
    const reportLabel = isHirer ? 'Report a Seeker' : 'Report a Business';
    const reportIcon = isHirer ? <User size={20} className="text-orange-500" /> : <AlertTriangle size={20} className="text-red-500" />;
    const modalTitle = formData.type === 'report'
        ? (isHirer 
            ? (seekerName ? `Report ${seekerName}` : 'Report a Seeker')
            : (businessName ? `Report ${businessName}` : 'Report a Business'))
        : 'File a Complaint';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1a1d24] w-full max-w-md rounded-xl shadow-2xl border border-slate-200 dark:border-[#303340] overflow-hidden transform animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-[#262933] flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                        {formData.type === 'report' ? reportIcon : (
                            <MessageSquare className="text-blue-500" size={20} />
                        )}
                        <h2 className="text-[16px] font-extrabold text-slate-900 dark:text-white">
                            {modalTitle}
                        </h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-[#303340] rounded-full transition-colors text-slate-400 border-none bg-transparent"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    {/* Locked target display for seeker reporting a specific business */}
                    {role === 'seeker' && businessId && (
                        <div className="p-3 bg-slate-50 dark:bg-[#111318] border border-slate-200 dark:border-[#303340] rounded-lg border-l-4 border-l-red-500">
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Target Business</label>
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold">
                                <Building2 size={16} className="text-red-500" />
                                {businessName}
                            </div>
                        </div>
                    )}

                    {/* Locked target display for hirer reporting a specific seeker */}
                    {role === 'hirer' && seekerId && (
                        <div className="p-3 bg-slate-50 dark:bg-[#111318] border border-slate-200 dark:border-[#303340] rounded-lg border-l-4 border-l-orange-500">
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Reported Seeker</label>
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold">
                                <User size={16} className="text-orange-500" />
                                {seekerName || `Seeker #${seekerId}`}
                            </div>
                        </div>
                    )}

                    {/* Ticket Type Toggle (only shown when not pre-targeting someone) */}
                    {!(role === 'seeker' ? businessId : seekerId) && (
                        <div>
                            <label className="block text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Ticket Type</label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-[#111318] rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'complaint'})}
                                    className={`py-2 text-[13px] font-bold rounded-md transition-all border-none ${formData.type === 'complaint' ? 'bg-white dark:bg-[#262933] text-blue-600 dark:text-blue-400 shadow-sm' : 'bg-transparent text-slate-500'}`}
                                >
                                    Complaint
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'report'})}
                                    className={`py-2 text-[13px] font-bold rounded-md transition-all border-none ${formData.type === 'report' ? 'bg-white dark:bg-[#262933] text-red-600 dark:text-red-400 shadow-sm' : 'bg-transparent text-slate-500'}`}
                                >
                                    {reportLabel}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Seeker: dropdown to choose business when no preset */}
                    {role === 'seeker' && formData.type === 'report' && !businessId && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <label className="block text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Building2 size={13} /> Select Business
                            </label>
                            <select
                                required
                                value={selectedBusinessId}
                                onChange={(e) => setSelectedBusinessId(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111318] border border-slate-200 dark:border-[#303340] rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#009966]/20 focus:border-[#009966] outline-none transition-all"
                                disabled={isFetchingBusinesses}
                            >
                                <option value="">Choose a business...</option>
                                {businesses.map(biz => (
                                    <option key={biz.ID} value={biz.ID}>{biz.BusinessName}</option>
                                ))}
                            </select>
                            {isFetchingBusinesses && (
                                <p className="text-[11px] text-blue-500 mt-1 font-medium italic">Loading businesses...</p>
                            )}
                        </div>
                    )}

                    {/* Hirer: text input for seeker ID when no preset */}
                    {role === 'hirer' && formData.type === 'report' && !seekerId && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <label className="block text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <User size={13} /> Seeker ID to Report
                            </label>
                            <input
                                type="number"
                                required
                                placeholder="Enter the seeker's ID number"
                                value={selectedSeekerId}
                                onChange={(e) => setSelectedSeekerId(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111318] border border-slate-200 dark:border-[#303340] rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#009966]/20 focus:border-[#009966] outline-none transition-all"
                            />
                            <p className="text-[11px] text-slate-400 mt-1 font-medium">You can find the seeker ID on their applicant profile page.</p>
                        </div>
                    )}

                    {/* Subject */}
                    <div>
                        <label className="block text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                        <input
                            type="text"
                            required
                            placeholder="Brief summary of the issue"
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111318] border border-slate-200 dark:border-[#303340] rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#009966]/20 focus:border-[#009966] outline-none transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Detailed Description</label>
                        <textarea
                            required
                            rows={4}
                            placeholder="Please provide as much detail as possible..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111318] border border-slate-200 dark:border-[#303340] rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#009966]/20 focus:border-[#009966] outline-none transition-all resize-none"
                        ></textarea>
                        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed font-medium">
                            Our support team will review your {formData.type} and get back to you within 24-48 hours.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 text-[14px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#262933] rounded-lg transition-colors border-none bg-transparent"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[14px] font-bold text-white rounded-lg transition-all shadow-md border-none ${formData.type === 'report' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Submit {formData.type === 'report' ? 'Report' : 'Ticket'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TicketModal;
