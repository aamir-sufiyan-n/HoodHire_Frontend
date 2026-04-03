import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  ChevronLeft,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Globe,
  Users,
  Info,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../../api/admin';

const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await adminAPI.getBusinessByID(id);
        setBusiness(data?.business || data);
      } catch (err) {
        console.error('Failed to fetch business details:', err);
        toast.error('Failed to load business details');
        navigate('/admin/businesses');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  const handleApprove = async () => {
    try {
      const targetId = business.HirerID || business.ID;
      await adminAPI.approveBusiness(targetId);
      toast.success('Business approved successfully');
      setBusiness(prev => ({ ...prev, Status: 'accepted', IsVerified: true }));
    } catch (err) {
      toast.error(err.message || 'Failed to approve business');
    }
  };

  const handleReject = async () => {
    try {
      const targetId = business.HirerID || business.ID;
      await adminAPI.rejectBusiness(targetId);
      toast.success('Business rejected');
      setBusiness(prev => ({ ...prev, Status: 'rejected', IsVerified: false }));
    } catch (err) {
      toast.error(err.message || 'Failed to reject business');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/businesses')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Businesses</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Info Card */}
        <div className="flex-1 space-y-6">
          <div className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
            <div className="px-8 pb-8">
              <div className="relative -mt-12 mb-6 flex items-end justify-between">
                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-[#1a1d24] p-1 shadow-lg shadow-emerald-500/10">
                  <div className="w-full h-full rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-emerald-600 dark:text-emerald-500" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    business.IsVerified || ['accepted', 'approved'].includes(business.Status?.toLowerCase()) ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 
                    business.Status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'
                  }`}>
                    {(business.IsVerified || ['accepted', 'approved'].includes(business.Status?.toLowerCase())) ? 'Approved' : (business.Status || 'Pending')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    business.IsVerified ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-slate-50 text-slate-500 dark:bg-slate-800'
                  }`}>
                    {business.IsVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{business.BusinessName}</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed whitespace-pre-wrap">
                  {business.Bio || 'No biography provided for this business.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-slate-400 mt-0.5 shrink-0" />
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        <p className="font-medium">{business.Address || 'No address'}</p>
                        <p className="text-slate-400 text-xs">{business.Locality}, {business.City}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Phone size={18} className="text-slate-400 shrink-0" />
                      <span>{business.BusinessPhone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Mail size={18} className="text-slate-400 shrink-0" />
                      <span>{business.BusinessEmail || 'No email'}</span>
                    </div>
                    {business.Website && (
                      <div className="flex items-center gap-3 text-sm">
                        <Globe size={18} className="text-slate-400 shrink-0" />
                        <a href={business.Website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-medium">
                          {business.Website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hirer Details</h3>
                  <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1a1d24] flex items-center justify-center shadow-sm">
                        <User size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{business.Hirer?.FullName || 'N/A'}</p>
                        <p className="text-xs text-slate-500">Business Owner</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                       <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Phone size={14} />
                          <span>{business.Hirer?.PhoneNumber || business.BusinessPhone}</span>
                       </div>
                       <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Clock size={14} />
                          <span>Joined {new Date(business.Hirer?.CreatedAt || business.CreatedAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Section inside the card */}
              {business.IsVerified || business.Status === 'accepted' || business.Status === 'approved' ? (
                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center animate-in zoom-in duration-500">
                   <div className="flex items-center gap-3 px-8 py-4 rounded-2xl border-2 bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                        <CheckCircle size={24} />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-sm font-bold uppercase tracking-wider">Business Verified</span>
                         <span className="text-xs opacity-70">This business is approved for platform activity.</span>
                      </div>
                   </div>
                </div>
              ) : business.Status === 'pending' ? (
                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button 
                    onClick={handleReject}
                    className="w-full sm:flex-1 px-6 py-3 border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group"
                  >
                    <XCircle size={20} className="group-hover:scale-110 transition-transform" />
                    Reject Verification
                  </button>
                  <button 
                    onClick={handleApprove}
                    className="w-full sm:flex-[1.5] px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
                    Approve Verification
                  </button>
                </div>
              ) : (
                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center animate-in zoom-in duration-500">
                   <div className="flex items-center gap-3 px-8 py-4 rounded-2xl border-2 bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <XCircle size={24} />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-sm font-bold uppercase tracking-wider">Verification Rejected</span>
                         <span className="text-xs opacity-70">This business failed the verification process.</span>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats & Meta Sidebar */}
        <div className="lg:w-80 space-y-6">
          <div className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Employee Count</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{business.EmployeeCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                  <Calendar size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Established</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{business.EstablishedYear}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                  <Info size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Niche</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{business.Niche}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Engagement</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                 <p className="text-2xl font-bold text-emerald-600">{business.FollowerCount}</p>
                 <p className="text-[10px] text-slate-500 uppercase font-bold">Followers</p>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                 <p className="text-2xl font-bold text-blue-600">{business.ReviewCount}</p>
                 <p className="text-[10px] text-slate-500 uppercase font-bold">Reviews</p>
              </div>
              <div className="col-span-2 text-center p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                 <p className="text-2xl font-bold text-orange-600">{business.AverageRating}</p>
                 <p className="text-[10px] text-slate-500 uppercase font-bold">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;
