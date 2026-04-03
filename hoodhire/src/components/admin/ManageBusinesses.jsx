import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  ShieldBan, 
  Unlock, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Eye,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { adminAPI } from '../../api/admin';

const ManageBusinesses = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [page, setPage] = useState(1);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const filters = {
        page,
        search: searchTerm,
      };

      if (statusFilter !== 'all') filters.status = statusFilter;
      if (verifiedFilter !== 'all') filters.verified = verifiedFilter;

      const data = await adminAPI.getBusinesses(filters);
      setBusinesses(data || []);
    } catch (err) {
      console.error('Failed to fetch businesses:', err);
      toast.error(err.message || 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBusinesses();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, verifiedFilter, page]);

  const handleBlock = async (id) => {
    const result = await Swal.fire({
      title: 'Block Business?',
      text: "This business and its listings will be hidden from the platform.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, block business',
      background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
    });

    if (result.isConfirmed) {
      try {
        await adminAPI.blockBusiness(id);
        Swal.fire({
          title: 'Blocked!',
          text: 'Business has been blocked.',
          icon: 'success',
          background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
        setBusinesses(businesses.map(b => b.ID === id ? { ...b, Status: 'blocked' } : b));
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: err.message || 'Failed to block business',
          icon: 'error',
          background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
      }
    }
  };

  const handleUnblock = async (id) => {
    const result = await Swal.fire({
      title: 'Unblock Business?',
      text: "This will restore the business listing visibility.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, unblock!',
      background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
    });

    if (result.isConfirmed) {
      try {
        await adminAPI.unblockBusiness(id);
        Swal.fire({
          title: 'Unblocked!',
          text: 'Business has been restored.',
          icon: 'success',
          background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
        setBusinesses(businesses.map(b => b.ID === id ? { ...b, Status: 'active' } : b));
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: err.message || 'Failed to unblock business',
          icon: 'error',
          background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Business?',
      text: "Proceed with caution! This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently!',
      background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
    });

    if (result.isConfirmed) {
      try {
        await adminAPI.deleteBusiness(id);
        Swal.fire({
          title: 'Deleted!',
          text: 'Business has been removed.',
          icon: 'success',
          background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
        setBusinesses(businesses.filter(b => b.ID !== id));
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: err.message || 'Failed to delete business',
          icon: 'error',
          background: document.documentElement.classList.contains('dark') ? '#1a1d24' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
      }
    }
  };


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Businesses</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Approve new businesses and manage existing ones.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-[#1a1d24] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={16} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Filter:</span>
        </div>
        
        <div className="relative group flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search businesses by name..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to page 1 on search
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none dark:text-slate-300"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors dark:text-slate-300 font-medium cursor-pointer flex-1 md:w-40"
          >
            <option value="all">Any Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="blocked">Blocked</option>
          </select>

          <select 
            value={verifiedFilter}
            onChange={(e) => {
              setVerifiedFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors dark:text-slate-300 font-medium cursor-pointer flex-1 md:w-40"
          >
            <option value="all">All Access</option>
            <option value="true">Verified</option>
            <option value="false">Not Verified</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading businesses...</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Business Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Verification</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {businesses.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                        No businesses found
                    </td>
                  </tr>
                ) : (
                  businesses.map((business) => (
                    <tr key={business.ID} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{business.BusinessName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            {(business.IsVerified || ['accepted', 'approved'].includes(business.Status?.toLowerCase())) ? (
                                <>
                                    <CheckCircle size={14} className="text-emerald-600" />
                                    <span className="text-xs font-medium text-emerald-600 capitalize">Approved</span>
                                </>
                            ) : business.Status === 'pending' ? (
                                <>
                                    <Clock size={14} className="text-amber-500" />
                                    <span className="text-xs font-medium text-amber-600 capitalize">Pending</span>
                                </>
                            ) : (
                                <>
                                    <XCircle size={14} className="text-red-500" />
                                    <span className="text-xs font-medium text-red-600 capitalize">{business.Status || 'Rejected'}</span>
                                </>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          business.IsVerified ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'
                        }`}>
                          {business.IsVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => navigate(`/admin/businesses/${business.ID}`)} title="View Details" className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors">
                            <Eye size={18} />
                          </button>
                          {business.Status !== 'blocked' ? (
                            <button onClick={() => handleBlock(business.ID)} title="Block" className="p-1 text-slate-400 hover:text-red-500 transition-colors"><ShieldBan size={18} /></button>
                          ) : (
                            <button onClick={() => handleUnblock(business.ID)} title="Unblock" className="p-1 text-slate-400 hover:text-emerald-500 transition-colors"><Unlock size={18} /></button>
                          )}
                          <button onClick={() => handleDelete(business.ID)} title="Delete" className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-slate-500">
                Page {page}
              </span>
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={businesses.length < 20 || loading}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700"
              >
                Next
              </button>
            </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageBusinesses;
