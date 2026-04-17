// src/components/admin/AdminJobDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  ChevronLeft,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Briefcase,
  DollarSign,
  User,
  Info,
  Loader2,
  Users,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../../api/admin/admin';

const AdminJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await adminAPI.getJobByID(id);
        setJob(data?.job || data);
      } catch (err) {
        console.error('Failed to fetch job details:', err);
        toast.error('Failed to load job details');
        navigate('/admin/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-slate-500 font-medium">Synchronizing job details...</p>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const desc = job.Description || {};
  const biz = job.Business || {};

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800';
      case 'closed':
        return 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800';
      case 'filled':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800';
      default:
        return 'bg-slate-50 text-slate-500 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  const workingDays = [
    { name: 'Mon', active: desc.Monday },
    { name: 'Tue', active: desc.Tuesday },
    { name: 'Wed', active: desc.Wednesday },
    { name: 'Thu', active: desc.Thursday },
    { name: 'Fri', active: desc.Friday },
    { name: 'Sat', active: desc.Saturday },
    { name: 'Sun', active: desc.Sunday },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/jobs')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-[10px]">Back to Positions</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>
            
            <div className="px-8 pb-8">
              <div className="relative -mt-12 mb-6 flex items-end justify-between">
                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-[#1a1d24] p-1 shadow-xl border border-slate-100 dark:border-slate-800">
                  <div className="w-full h-full rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                    <Briefcase className="w-10 h-10 text-emerald-600 dark:text-emerald-500" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm ${getStatusStyles(job.Status)}`}>
                    {job.Status}
                  </span>
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm">
                    {desc.JobType?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">
                        {desc.Title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm">
                            <Building2 size={16} className="text-[#009966]" />
                            <span>{biz.BusinessName}</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm">
                            <MapPin size={16} className="text-[#009966]" />
                            <span>{biz.City}, INDIA</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm">
                            <Calendar size={16} className="text-[#009966]" />
                            <span>Posted {new Date(job.CreatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Position Overview</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                        {desc.Description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Key Responsibilities</h3>
                        <div className="space-y-3">
                            {desc.KeyResponsibilities?.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle size={12} className="text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {desc.Skills?.map((skill, idx) => (
                                <span key={idx} className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-96 space-y-6">
          {/* Compensation Block */}
          <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Financial Package</h3>
            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#1a1d24] shadow-sm border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center shrink-0">
                        <DollarSign className="text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                            ₹{desc.SalaryMin?.toLocaleString()} - {desc.SalaryMax?.toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.1em] mt-1">Per {desc.SalaryType}</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Schedule Block */}
          <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Schedule & Shift</h3>
            <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <Clock size={18} className="text-slate-400" />
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Shift</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{desc.Shift}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <Calendar size={18} className="text-slate-400" />
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Duration</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{desc.Duration}</p>
                    </div>
                </div>
                
                <div className="pt-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Working Days</p>
                    <div className="flex gap-1.5 flex-wrap">
                        {workingDays.map((day, idx) => (
                            <div key={idx} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${
                                day.active 
                                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600'
                            }`}>
                                {day.name[0]}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>

          {/* Requirements Block */}
          <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Candidate Metrics</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase">Age Range</span>
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{desc.MinAge} - {desc.MaxAge} Yrs</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase">Gender Pref</span>
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white capitalize">{desc.GenderPref}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-xs font-bold text-slate-500 uppercase">Experience Ref.</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${desc.ExperienceRequired ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-slate-50 text-slate-400'}`}>
                        {desc.ExperienceRequired ? 'Required' : 'Optional'}
                    </span>
                </div>
                <div className="flex justify-between items-center py-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Resume Req.</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${desc.ResumeRequired ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' : 'bg-slate-50 text-slate-400'}`}>
                        {desc.ResumeRequired ? 'Mandatory' : 'Optional'}
                    </span>
                </div>
            </div>
          </div>

          {/* Business Meta */}
          {job.Deadline && (
            <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800/50 p-6 flex items-start gap-4">
                <div className="p-3 bg-white dark:bg-[#1a1d24] rounded-lg shadow-sm shrink-0">
                    <AlertCircle size={20} className="text-orange-600" />
                </div>
                <div>
                    <h4 className="text-[10px] font-black text-orange-900 dark:text-orange-400 uppercase tracking-widest mb-1">Application Deadline</h4>
                    <p className="text-lg font-black text-orange-700 dark:text-orange-300 leading-none">
                        {new Date(job.Deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminJobDetails;
