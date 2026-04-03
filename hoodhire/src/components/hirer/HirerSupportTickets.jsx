import React, { useState, useEffect } from 'react';
import { 
    MessageSquare, 
    AlertTriangle, 
    Trash2, 
    Clock, 
    CheckCircle2, 
    HelpCircle,
    User,
    Building2,
    Calendar,
    ChevronRight,
    Plus,
    ChevronLeft
} from 'lucide-react';
import { hirerAPI } from '../../api/hirer';
import toast from 'react-hot-toast';
import TicketModal from '../support/TicketModal';

const HirerSupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const res = await hirerAPI.getMyTickets();
            setTickets(res.tickets || []);
        } catch (error) {
            console.error("Failed to fetch tickets:", error);
            toast.error("Failed to load your tickets");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleDelete = async (ticketID) => {
        if (!window.confirm("Are you sure you want to delete this ticket?")) return;

        try {
            await hirerAPI.deleteTicket(ticketID);
            toast.success("Ticket deleted");
            const updatedTickets = tickets.filter(t => t.ID !== ticketID);
            setTickets(updatedTickets);

            const newTotalPages = Math.ceil(updatedTickets.length / itemsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
        } catch (error) {
            toast.error("Failed to delete ticket");
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved':
                return <CheckCircle2 className="text-emerald-500" size={16} />;
            case 'reviewed':
                return <MessageSquare className="text-blue-500" size={16} />;
            case 'dismissed':
                return <Trash2 className="text-rose-500" size={16} />;
            case 'pending':
            case 'open':
                return <Clock className="text-amber-500" size={16} />;
            default:
                return <HelpCircle className="text-slate-400" size={16} />;
        }
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved':
                return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400';
            case 'reviewed':
                return 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400';
            case 'dismissed':
                return 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400';
            case 'pending':
            case 'open':
                return 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400';
            default:
                return 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400';
        }
    };

    // Pagination
    const totalPages = Math.ceil(tickets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTickets = tickets.slice(startIndex, startIndex + itemsPerPage);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <MessageSquare size={48} className="text-slate-200 dark:text-[#303340] mb-4" />
                <div className="h-4 w-32 bg-slate-100 dark:bg-[#303340] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-[18px] font-extrabold text-slate-900 dark:text-white">Support & Complaints</h2>
                    <p className="text-[13px] text-slate-500 font-medium">Manage your support requests and seeker reports</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#009966] hover:bg-[#008855] text-white text-[13px] font-bold rounded-md transition-all shadow-md shadow-[#009966]/20 border-none"
                >
                    <Plus size={16} /> New Ticket
                </button>
            </div>

            {tickets.length === 0 ? (
                <div className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-xl p-12 text-center shadow-sm">
                    <MessageSquare size={48} className="mx-auto text-slate-200 dark:text-[#303340] mb-4" />
                    <h3 className="text-[16px] font-extrabold text-slate-800 dark:text-slate-200 mb-2">No tickets found</h3>
                    <p className="text-[13px] text-slate-500 font-medium mb-6">You haven't filed any complaints or reports yet.</p>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2 bg-[#009966]/10 dark:bg-[#009966]/20 text-[#009966] text-[13px] font-bold rounded-md hover:bg-[#009966]/20 transition-colors border-none"
                    >
                        File a Complaint
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {paginatedTickets.map(ticket => (
                            <div key={ticket.ID} className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-[#3b404d] transition-all group">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ticket.Type === 'report' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500' : 'bg-blue-50 dark:bg-blue-500/10'}`}>
                                                {ticket.Type === 'report' 
                                                    ? <AlertTriangle size={16} className="text-orange-500" /> 
                                                    : <MessageSquare size={16} className="text-blue-500" />}
                                            </div>
                                            <div>
                                                <h4 className="text-[15px] font-extrabold text-slate-900 dark:text-white group-hover:text-[#009966] transition-colors leading-tight">
                                                    {ticket.Subject}
                                                </h4>
                                                <div className="flex items-center gap-4 mt-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                    <span className="flex items-center gap-1">{ticket.Type}</span>
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(ticket.CreatedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                                            {ticket.Description}
                                        </p>

                                        {ticket.Reply && (
                                            <div className="mt-4 p-4 bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-xl relative overflow-hidden text-left">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/30" />
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full">Admin Response</span>
                                                </div>
                                                <p className="text-[13px] text-slate-700 dark:text-slate-200 font-semibold italic leading-relaxed">
                                                    "{ticket.Reply}"
                                                </p>
                                            </div>
                                        )}

                                        {/* Show reported seeker */}
                                        {ticket.ReportedSeeker && (
                                            <div className="flex items-center gap-2 pt-2 text-[12px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-slate-100 dark:border-white/5">
                                                <User size={13} className="text-orange-400" />
                                                <span>Reported Seeker: <span className="text-slate-900 dark:text-slate-200">{ticket.ReportedSeeker.FullName || ticket.ReportedSeeker.DisplayName || `#${ticket.ReportedSeekerID}`}</span></span>
                                            </div>
                                        )}

                                        {/* Show reported business */}
                                        {ticket.ReportedBusiness && (
                                            <div className="flex items-center gap-2 pt-2 text-[12px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-slate-100 dark:border-white/5">
                                                <Building2 size={13} className="text-slate-400" />
                                                <span>Reported Business: <span className="text-slate-900 dark:text-slate-200">{ticket.ReportedBusiness.BusinessName}</span></span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex md:flex-col items-center justify-between md:justify-start gap-4 shrink-0">
                                        <div className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 ${getStatusStyle(ticket.Status)}`}>
                                            {getStatusIcon(ticket.Status)}
                                            {ticket.Status || 'Pending'}
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleDelete(ticket.ID)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all border-none bg-transparent"
                                                title="Delete Ticket"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <ChevronRight size={18} className="text-slate-300 hidden md:block" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-2 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-md p-3 shadow-sm">
                            <span className="text-sm font-medium text-slate-500 ml-2">
                                Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-sm border border-slate-200 dark:border-[#303340] text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#262933] transition-colors bg-transparent"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-sm border border-slate-200 dark:border-[#303340] text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#262933] transition-colors bg-transparent"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <TicketModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchTickets}
                role="hirer"
            />
        </div>
    );
};

export default HirerSupportTickets;
