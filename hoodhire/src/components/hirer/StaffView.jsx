import React, { useState, useEffect } from 'react';
import { Users, Trash2, MapPin, Briefcase, Mail, Phone, Calendar, Search, Loader2, User } from 'lucide-react';
import { hirerAPI } from '../../api/hirer';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const StaffView = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await hirerAPI.getStaff();
            // The JSON provided is { "staff": [ { "ID": 1, "Seeker": {...}, "Job": { "Description": { "Title": "sales staff" } }, ... } ] }
            setStaff(res?.staff || []);
        } catch (error) {
            console.error("Failed to fetch staff data:", error);
            toast.error("Failed to load staff list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRemoveStaff = async (id) => {
        if (!window.confirm("Are you sure you want to remove this staff member? This will end the professional connection.")) return;
        
        try {
            await hirerAPI.removeStaff(id);
            setStaff(prev => prev.filter(s => s.ID !== id));
            toast.success("Staff member removed successfully.");
        } catch (error) {
            console.error("Failed to remove staff:", error);
            toast.error("Failed to remove staff member.");
        }
    };

    const filteredStaff = staff.filter(member => {
        const name = member.Seeker?.FullName || '';
        const email = member.Seeker?.Email || member.Seeker?.email || '';
        const jobTitle = member.Job?.Description?.Title || member.Job?.Title || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-[#009966] animate-spin mb-4" />
                <p className="text-slate-500 font-medium tracking-tight">Loading your staff...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Staff Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and view all employees currently connected to your business.</p>
                </div>
                
                <div className="relative w-full md:w-80 group">
                    <div className="absolute inset-0 bg-emerald-500/5 rounded-lg blur-md opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#009966] transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name, email or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009966]/20 focus:border-[#009966] 
                        transition-all text-sm font-medium relative z-10 shadow-sm"
                    />
                </div>
            </div>

            {/* Content List */}
            {filteredStaff.length === 0 ? (
                <div className="bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-md p-12 sm:p-20 premium-shadow text-center flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#009966]/5 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-700"></div>
                    
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-[#1a1d24] rounded-2xl border border-slate-100 dark:border-[#262933] flex items-center justify-center mx-auto mb-6 shadow-sm transform group-hover:rotate-6 transition-transform">
                            <Users size={36} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                            {searchTerm ? "No matching staff" : "No staff connected yet"}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-[15px] leading-relaxed font-medium">
                            {searchTerm 
                                ? `We couldn't find any staff members matching "${searchTerm}". Try a different search term.` 
                                : "Your staff list will grow as you accept and onboard candidates from your job applications."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {/* Table Header for Desktop */}
                    <div className="hidden md:grid grid-cols-[1fr_1.5fr_1.5fr_1fr_auto] gap-4 px-6 py-3 bg-slate-100/50 dark:bg-[#1a1d24]/50 border border-slate-200 dark:border-[#262933] rounded-lg text-[11px] font-bold
                     text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        <div>Employee</div>
                        <div>Email Address</div>
                        <div>Role / Job</div>
                        <div>Joined</div>
                        <div className="w-10"></div>
                    </div>

                    {filteredStaff.map((member) => (
                        <div 
                            key={member.ID} 
                            onClick={() => navigate(`/hirer/seeker/${member.Seeker.UserID}`)}
                            className="bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-lg p-3 md:px-6 md:py-4 premium-shadow hover:shadow-lg hover:border-[#009966]/30 transition-all group 
                            cursor-pointer flex flex-col md:grid md:grid-cols-[1fr_1.5fr_1.5fr_1fr_auto] items-start md:items-center gap-4 relative overflow-hidden">
                            {/* Card Background Accent */}
                            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#009966]/5 to-transparent -z-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {/* Mobile/Tablet employee info */}
                            <div className="flex items-center gap-4 min-w-0 relative z-10">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-50 dark:bg-[#1a1d24] border border-slate-100 dark:border-[#262933] flex items-center justify-center overflow-hidden shrink-0
                                 group-hover:border-[#009966]/50 transition-colors">
                                    {member.Seeker?.ProfilePicture ? (
                                        <img src={member.Seeker.ProfilePicture} alt={member.Seeker.FullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="text-slate-300 dark:text-slate-600" size={20} />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px] group-hover:text-[#009966] transition-colors truncate">
                                        {member.Seeker?.FullName}
                                    </h4>
                                    <div className="md:hidden text-xs text-slate-500 font-medium truncate mt-0.5 uppercase tracking-wider">
                                        {member.Job?.Description?.Title || member.Job?.Title || 'Sales Staff'}
                                    </div>
                                </div>
                            </div>

                            {/* Email Address */}
                            <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium truncate relative z-10">
                                <Mail size={14} className="text-slate-400 shrink-0" />
                                <span className="truncate">{member.Seeker?.Email || member.Seeker?.email || 'N/A'}</span>
                            </div>

                            {/* Role / Job */}
                            <div className="hidden md:flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-bold truncate relative z-10">
                                <Briefcase size={14} className="text-[#009966] shrink-0" />
                                <span className="truncate">{member.Job?.Description?.Title || member.Job?.Title || 'Sales Staff'}</span>
                            </div>

                            {/* Joined Date */}
                            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest relative z-10">
                                <Calendar size={13} className="shrink-0" />
                                <span>{new Date(member.CreatedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                            </div>

                            {/* Action Area */}
                            <div className="flex items-center justify-between md:justify-end w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-none border-slate-100 dark:border-[#262933] relative z-20">
                                <div className="md:hidden flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        <Mail size={12} className="text-slate-400" /> {member.Seeker?.Email || member.Seeker?.email || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        <Phone size={12} className="text-slate-400" /> {member.Seeker?.PhoneNumber || member.Seeker?.phone || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        <Calendar size={12} className="text-slate-400" /> Joined {new Date(member.CreatedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveStaff(member.ID);
                                    }}
                                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all bg-transparent border-none"
                                    title="Remove Staff"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StaffView;
