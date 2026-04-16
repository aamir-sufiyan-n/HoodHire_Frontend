import React, { useState, useEffect } from 'react';
import { 
  TicketCheck, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Loader2,
  Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../../api/admin/admin';

const ManageTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [replies, setReplies] = useState({});

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset page on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await adminAPI.getTickets({
                status: filterStatus,
                type: filterType,
                search: debouncedSearch,
                page: currentPage,
                limit: 10
            });
            setTickets(data || []);
            setTotalPages(data?.total_pages || 1);
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
            toast.error(err.message || 'Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [filterType, filterStatus, debouncedSearch, currentPage]);

    const handleAction = async (ticketID, actionFunc, label) => {
        const reply = replies[ticketID] || '';
        try {
            await actionFunc(ticketID, reply);
            toast.success(`Ticket ${label} successfully`);
            setReplies(prev => {
                const next = { ...prev };
                delete next[ticketID];
                return next;
            });
            fetchTickets(); // Refresh list to reflect changes
        } catch (err) {
            toast.error(err.message || `Failed to ${label} ticket`);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50';
            case 'resolved': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50';
            case 'reviewed': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50';
            case 'dismissed': return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50';
            default: return 'text-slate-500 bg-slate-50 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TicketCheck className="text-emerald-500" /> Support Tickets
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage user issues and inquiries.</p>
                </div>

                <div className="relative group max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search tickets by subject or user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2a2d35] rounded-md text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Responsive Filter Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-[#1a1d24] p-4 rounded-lg border border-slate-200 dark:border-[#2a2d35] shadow-sm">
                <div className="flex items-center gap-2 pr-2 border-r border-slate-200 dark:border-[#2a2d35]">
                    <Filter size={16} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Filters</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Status</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                        className="bg-slate-50 dark:bg-[#16181d] border border-slate-200 dark:border-[#2a2d35] rounded-md px-3 py-1.5 text-sm outline-none focus:border-emerald-500/50 transition-all text-slate-700 dark:text-slate-300 font-medium"
                    >
                        <option value="all">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="resolved">Resolved</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="dismissed">Dismissed</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Type</span>
                    <select
                        value={filterType}
                        onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                        className="bg-slate-50 dark:bg-[#16181d] border border-slate-200 dark:border-[#2a2d35] rounded-md px-3 py-1.5 text-sm outline-none focus:border-emerald-500/50 transition-all text-slate-700 dark:text-slate-300 font-medium"
                    >
                        <option value="all">All Types</option>
                        <option value="complaint">Complaint</option>
                        <option value="report">Report</option>
                    </select>
                </div>
            </div>

            {/* List Area */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#1a1d24] rounded-lg border border-slate-200 dark:border-[#2a2d35] shadow-sm">
                        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                        <p className="text-slate-500 font-bold animate-pulse">Fetching tickets...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#1a1d24] rounded-lg border border-slate-200 dark:border-[#2a2d35] text-center shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-[#16181d] rounded-md flex items-center justify-center mb-4">
                            <TicketCheck size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No tickets found</h3>
                        <p className="text-slate-500 max-w-[250px] mx-auto mt-1">Adjust your filters or search terms to find what you're looking for.</p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <div key={ticket.ID} className="bg-white dark:bg-[#1a1d24] p-6 rounded-lg border border-slate-200 dark:border-[#2a2d35] shadow-sm transition-all hover:shadow-md hover:border-emerald-500/20 group relative overflow-hidden">
                            {/* Accent highlight */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/0 group-hover:bg-emerald-500/100 transition-all" />

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-md border ${getStatusColor(ticket.Status)}`}>
                                        <AlertCircle size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors tracking-tight">
                                            {ticket.Subject}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-bold flex items-center gap-2 mt-0.5">
                                            <span className="text-slate-700 dark:text-slate-300">{ticket.UserEmail}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                            <span>{new Date(ticket.CreatedAt).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getStatusColor(ticket.Status)}`}>
                                        {ticket.Status}
                                    </span>
                                    <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-[#2a2d35] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#3a3d45]">
                                        {ticket.Type}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#16181d] p-4 rounded-md mb-6 shadow-inner border border-slate-100 dark:border-white/5 leading-relaxed">
                                {ticket.Description}
                            </p>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2">
                                    {ticket.BusinessName ? (
                                        <div className="flex items-center gap-2 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-md border border-emerald-100 dark:border-emerald-800/30 uppercase tracking-wider shadow-sm">
                                            <Building2 size={13} />
                                            {ticket.BusinessName}
                                        </div>
                                    ) : (
                                        <div className="text-[11px] font-bold text-slate-400 italic">General Complaint</div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {ticket.Status === 'open' && (
                                        <div className="flex flex-col gap-4 w-full">
                                            <textarea
                                                value={replies[ticket.ID] || ''}
                                                onChange={(e) => setReplies(prev => ({ ...prev, [ticket.ID]: e.target.value }))}
                                                placeholder="Write a reply or internal note before taking action..."
                                                className="w-full min-h-[80px] p-4 text-sm bg-slate-50 dark:bg-[#16181d] border border-slate-200 dark:border-[#2a2d35] rounded-md outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all text-slate-700 dark:text-slate-300 placeholder:text-slate-400 resize-none"
                                            />
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleAction(ticket.ID, adminAPI.resolveTicket, 'resolved')}
                                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-widest rounded-md transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 transform active:scale-95"
                                                >
                                                    <CheckCircle size={14} /> Resolve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(ticket.ID, adminAPI.reviewTicket, 'reviewed')}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-widest rounded-md transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 transform active:scale-95"
                                                >
                                                    <Clock size={14} /> Review
                                                </button>
                                                <button
                                                    onClick={() => handleAction(ticket.ID, adminAPI.dismissTicket, 'dismissed')}
                                                    className="px-4 py-2 bg-white dark:bg-[#202329] border border-slate-200 dark:border-[#3a3d45] text-slate-500 hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-900/50 text-[11px] font-black uppercase tracking-widest rounded-md transition-all flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-900/10 shadow-sm"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {ticket.Status !== 'open' && (
                                        <div className="text-xs font-bold text-slate-400 dark:text-slate-600 px-3 py-1.5 rounded-md bg-slate-50 dark:bg-[#16181d] border border-slate-100 dark:border-[#2a2d35]">
                                            Processed by Admin
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Simple Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 bg-white dark:bg-[#1a1d24] p-4 rounded-lg border border-slate-200 dark:border-[#2a2d35] shadow-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Page <span className="text-slate-900 dark:text-white">{currentPage}</span> of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="p-2 bg-slate-50 dark:bg-[#16181d] text-slate-500 hover:text-emerald-600 rounded-md disabled:opacity-50 border border-slate-200 dark:border-[#2a2d35] transition-colors"
                        >
                            &larr; Previous
                        </button>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="p-2 bg-slate-50 dark:bg-[#16181d] text-slate-500 hover:text-emerald-600 rounded-md disabled:opacity-50 border border-slate-200 dark:border-[#2a2d35] transition-colors"
                        >
                            Next &rarr;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTickets;
