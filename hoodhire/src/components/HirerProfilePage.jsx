import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Save, MapPin, Briefcase, Phone, Mail, CheckCircle2, Building2, Globe, Users, Calendar, Sparkles, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { hirerAPI } from '../api/hirer';
import Footer from './Footer';
import GlobalNavbar from './GlobalNavbar';
import ProfilePictureModal from './profile/ProfilePictureModal';
import { chatAPI } from '../api/chat';

const HirerProfilePage = () => {
    const navigate = useNavigate();

    // In a real app, this would use context or a store
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasExistingProfile, setHasExistingProfile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPicModalOpen, setIsPicModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        business_name: '',
        niche: '',
        business_phone: '',
        business_email: '',
        address: '',
        locality: '',
        city: '',
        employee_count: '1-10', // Default based on enum
        established_year: '',
        website: '',
        bio: '',
        ProfilePicture: ''
    });

    const [formErrors, setFormErrors] = useState({});

    const fetchProfile = async () => {
        if (user?.role === 'hirer') {
            try {
                const response = await hirerAPI.getHirerProfile();
                if (response?.profile) {
                    const p = response.profile;
                    const b = p.Business || p.business || {};
                    setFormData({
                        full_name: p.full_name || p.FullName || '',
                        phone_number: p.phone_number || p.PhoneNumber || '',
                        business_name: b.business_name || b.BusinessName || '',
                        niche: b.niche || b.Niche || '',
                        business_phone: b.business_phone || b.BusinessPhone || '',
                        business_email: b.business_email || b.BusinessEmail || '',
                        address: b.address || b.Address || '',
                        locality: b.locality || b.Locality || '',
                        city: b.city || b.City || '',
                        employee_count: b.employee_count || b.EmployeeCount || '1-10',
                        established_year: b.established_year || b.EstablishedYear || '',
                        website: b.website || b.Website || '',
                        bio: b.bio || b.Bio || '',
                        ProfilePicture: b.ProfilePicture || b.profile_picture || b.ProfilePictureUrl || b.profile_picture_url || p.ProfilePicture || p.profile_picture || ''
                    });
                    setHasExistingProfile(true);
                    if (b.business_name || b.BusinessName) {
                        setIsEditing(false);
                    } else {
                        setIsEditing(true);
                    }
                }
            } catch (err) {
                console.log("No profile setup yet.");
                setIsEditing(true);
            } finally {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    };

    // Fetch existing profile on mount
    useEffect(() => {
        fetchProfile();
    }, [user?.role]);

    const handleLogout = () => {
        chatAPI.disconnectWebSocket();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        toast.success("Logged out successfully");
        navigate('/');
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when typing
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Personal
        if (!formData.full_name || formData.full_name.length < 2) newErrors.full_name = "Full name is required (min 2 chars)";
        if (!formData.phone_number || formData.phone_number.length !== 10 || isNaN(formData.phone_number)) {
            newErrors.phone_number = "Valid 10-digit phone number is required";
        }

        // Business string constraints
        if (!formData.business_name || formData.business_name.length < 2) newErrors.business_name = "Business name is required (min 2 chars)";
        if (!formData.niche || formData.niche.length < 2) newErrors.niche = "Niche/Industry is required";
        if (!formData.business_phone || formData.business_phone.length !== 10 || isNaN(formData.business_phone)) {
            newErrors.business_phone = "Valid 10-digit business phone is required";
        }

        // Let HTML handle email validation optionally, but check presence if it was required. DTO says omit empty, so skipping strict req if empty

        if (!formData.address || formData.address.length < 5) newErrors.address = "Address is required (min 5 chars)";
        if (!formData.locality || formData.locality.length < 2) newErrors.locality = "Locality is required";
        if (!formData.city || formData.city.length < 2) newErrors.city = "City is required";

        // Year
        if (formData.established_year && (isNaN(formData.established_year) || Number(formData.established_year) < 1900)) {
            newErrors.established_year = "Valid established year (>= 1900) required";
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fill in all required fields correctly.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                established_year: formData.established_year ? Number(formData.established_year) : 0,
            };

            if (user?.role === 'hirer') {
                if (hasExistingProfile) {
                    await hirerAPI.updateHirerProfile(payload);
                    toast.success("Business profile updated successfully!");
                } else {
                    await hirerAPI.setupHirerProfile(payload);
                    toast.success("Business profile setup completely!");
                    setHasExistingProfile(true);
                }
                setIsEditing(false); // Switch to Read-only mode
            } else {
                toast.error("Invalid role for this profile page.");
            }
        } catch (err) {
            toast.error(err.message || 'Failed to update business profile.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f1115] p-6 text-slate-800 dark:text-slate-200">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">You are not logged in</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-[#009966] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#008855] transition transform hover:-translate-y-0.5 premium-glow shadow-md"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0f1115] p-6 text-slate-800 dark:text-slate-200">
                <Building2 size={40} className="animate-bounce text-[#009966] mb-4" />
                <p className="text-lg font-semibold animate-pulse text-slate-600 dark:text-slate-400">Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-[#f8fafc] font-sans pb-12 relative overflow-hidden transition-colors duration-300">
            <GlobalNavbar />
            {/* Extended Ambient Backgrounds */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 dark:bg-blue-600/5 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-[#009966]/10 dark:bg-[#009966]/5 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
            </div>


            {/* Premium Gradient Banner */}
            <div className="h-72 w-full bg-[#009966]/5 dark:bg-[#009966]/5 relative top-0 left-0 z-0 overflow-hidden border-b border-slate-200 dark:border-[#262933]">

                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.02]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-[#0f1115] to-transparent"></div>
            </div>

            <main className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10 pt-4 pb-16">

                <div className="flex flex-col lg:flex-row gap-8 items-start mt-[-100px]">

                    {/* Left Column (1/3) - Details Block */}
                    <div className="w-full lg:w-[340px] flex flex-col gap-6 lg:sticky lg:top-28 h-fit shrink-0">

                        {/* Block 1: User Profile Header */}
                        <div className="bg-white/80 dark:bg-[#16181d]/80 backdrop-blur-md rounded-md premium-shadow border border-slate-200/50 dark:border-[#262933]/50 p-6 sm:p-8 flex flex-col items-center text-center group transition-all duration-300">
                            {/* Avatar Ring */}
                            <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center mb-6">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#3b9f87] to-[#009966] rounded-full opacity-20 blur-md group-hover:opacity-30 transition-opacity"></div>
                                <div className="w-[85%] h-[85%] bg-white dark:bg-[#1a1d24] rounded-full flex items-center justify-center overflow-hidden border-4 border-slate-50 dark:border-[#16181d] z-10 relative shadow-sm group-hover:scale-105 transition-transform duration-300">
                                    <div className="w-full h-full bg-white dark:bg-[#007744]/30 flex items-center justify-center text-[#009966] dark:text-[#009966] relative">
                                        {formData.ProfilePicture ? (
                                            <img src={formData.ProfilePicture} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 size={46} strokeWidth={1.5} />
                                        )}

                                        {/* Upload Overlay */}
                                        <div
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            onClick={() => setIsPicModalOpen(true)}
                                        >
                                            <Camera size={24} className="text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white capitalize mb-1 tracking-tight">{formData.business_name || user?.username || 'Employer Name'}</h1>
                            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium mb-5">
                                <Mail size={14} /> <span className="truncate">{user?.email}</span>
                            </div>

                            <div className="w-full flex justify-center pb-5 mb-5 border-b border-slate-200/60 dark:border-[#303340]/60">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#3b9f87]/20 to-[#ffffff] dark:from-[#007744]/40 dark:to-[#009966]/20 text-[#007744] dark:text-[#3b9f87] font-bold text-xs rounded-md uppercase tracking-wider border border-[#3b9f87]/40/50 dark:border-[#009966]/30">
                                    <Sparkles size={12} className="text-[#009966]" /> {user?.role} Profile
                                </span>
                            </div>

                            <div className="w-full flex flex-col gap-4 text-sm bg-slate-50/50 dark:bg-[#1a1d24]/50 p-4 rounded-md border border-slate-100 dark:border-[#262933]">
                                <div className="flex items-center gap-3 text-slate-700 dark:text-[#cbd5e1] group/item">
                                    <div className="w-8 h-8 rounded-md bg-white dark:bg-[#262933] flex items-center justify-center border border-slate-200 dark:border-[#303340] group-hover/item:border-[#009966] dark:group-hover/item:border-[#009966]/50 transition-colors shrink-0 shadow-sm">
                                        <MapPin size={16} className="text-slate-400 group-hover/item:text-[#009966] transition-colors" />
                                    </div>
                                    <span className="truncate flex-1 text-left font-medium">{formData.city ? `${formData.city}, INDIA` : 'City not set'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-700 dark:text-[#cbd5e1] group/item">
                                    <div className="w-8 h-8 rounded-md bg-white dark:bg-[#262933] flex items-center justify-center border border-slate-200 dark:border-[#303340] group-hover/item:border-[#009966] dark:group-hover/item:border-[#009966]/50 transition-colors shrink-0 shadow-sm">
                                        <Phone size={16} className="text-slate-400 group-hover/item:text-[#009966] transition-colors" />
                                    </div>
                                    <span className="truncate flex-1 text-left font-medium">{formData.phone_number || 'Add Phone Number'}</span>
                                    {formData.phone_number && <CheckCircle2 size={16} className="text-[#009966] shrink-0" />}
                                </div>
                                <div className="flex items-center gap-3 text-slate-700 dark:text-[#cbd5e1] group/item">
                                    <div className="w-8 h-8 rounded-md bg-white dark:bg-[#262933] flex items-center justify-center border border-slate-200 dark:border-[#303340] group-hover/item:border-[#009966] dark:group-hover/item:border-[#009966]/50 transition-colors shrink-0 shadow-sm">
                                        <Briefcase size={16} className="text-slate-400 group-hover/item:text-[#009966] transition-colors" />
                                    </div>
                                    <span className="truncate flex-1 text-left capitalize font-medium">{formData.full_name || 'Add Contact Name'}</span>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <div className="w-full mt-6">
                                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-md border border-slate-200 dark:border-[#303340] text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-[#262933] hover:text-slate-900 dark:hover:text-white transition-all bg-white dark:bg-[#1a1d24] shadow-sm hover:shadow-md">
                                    <LogOut size={18} /> Log Out
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (2/3) */}
                    <div className="w-full lg:flex-1 flex flex-col gap-6 pt-4 lg:pt-0">

                        {/* Block 3: The Form */}
                        {isEditing ? (
                            <form onSubmit={handleProfileSubmit} className="bg-white/90 dark:bg-[#16181d]/90 backdrop-blur-md rounded-md premium-shadow border border-slate-200/50 dark:border-[#262933]/50 p-6 sm:p-10 animate-fade-in relative z-10">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-slate-200/60 dark:border-[#303340]/60 gap-4">
                                    <div>
                                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                                            <Settings size={24} className="text-[#009966]" />
                                            Business Profile Setup
                                        </h2>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Provide comprehensive details about your organization</p>
                                    </div>
                                    {hasExistingProfile && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="text-sm font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors bg-slate-100 hover:bg-slate-200 dark:bg-[#262933] dark:hover:bg-[#303340] px-5 py-2 rounded-md border border-slate-200 dark:border-[#303340] shadow-sm transform hover:-translate-y-0.5"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-10">
                                    {/* Section: Personal Info */}
                                    <div className="bg-slate-50/50 dark:bg-[#1a1d24]/50 rounded-md p-6 border border-slate-100 dark:border-[#262933]">
                                        <h3 className="text-sm font-extrabold text-[#009966] dark:text-[#009966] mb-5 uppercase tracking-wider flex items-center gap-2">
                                            <User size={16} /> Contact Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-[#cbd5e1]">Contact Person Name *</label>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        name="full_name"
                                                        value={formData.full_name}
                                                        onChange={handleInputChange}
                                                        className={`w-full bg-white dark:bg-[#16181d] border ${formErrors.full_name ? 'border-red-400' : 'border-slate-200 dark:border-[#303340]'} rounded-md px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-[#009966]/20 focus:border-[#009966] transition-all outline-none group-hover:border-slate-300 dark:group-hover:border-slate-600 shadow-sm`}
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                                {formErrors.full_name && <p className="text-xs font-medium text-red-500 mt-1.5">{formErrors.full_name}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-[#cbd5e1]">Mobile Number *</label>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        name="phone_number"
                                                        value={formData.phone_number}
                                                        onChange={handleInputChange}
                                                        className={`w-full bg-white dark:bg-[#16181d] border ${formErrors.phone_number ? 'border-red-400' : 'border-slate-200 dark:border-[#303340]'} rounded-md px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-[#009966]/20 focus:border-[#009966] transition-all outline-none group-hover:border-slate-300 dark:group-hover:border-slate-600 shadow-sm`}
                                                        placeholder="10-digit number"
                                                    />
                                                </div>
                                                {formErrors.phone_number && <p className="text-xs font-medium text-red-500 mt-1.5">{formErrors.phone_number}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Business Info */}
                                    <div className="bg-slate-50/50 dark:bg-[#1a1d24]/50 rounded-md p-6 border border-slate-100 dark:border-[#262933]">
                                        <h3 className="text-sm font-extrabold text-[#009966] dark:text-[#009966] mb-5 uppercase tracking-wider flex items-center gap-2">
                                            <Building2 size={16} /> Organization Details
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-[#cbd5e1]">Organization Name *</label>
                                                <input
                                                    type="text"
                                                    name="business_name"
                                                    value={formData.business_name}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white dark:bg-[#16181d] border ${formErrors.business_name ? 'border-red-400' : 'border-slate-200 dark:border-[#303340]'} rounded-md px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-[#009966]/20 focus:border-[#009966] transition-all outline-none hover:border-slate-300 dark:hover:border-slate-600 shadow-sm`}
                                                    placeholder="ACME Corporation Ltd."
                                                />
                                                {formErrors.business_name && <p className="text-xs font-medium text-red-500 mt-1.5">{formErrors.business_name}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-[#cbd5e1]">Industry / Niche *</label>
                                                <input
                                                    type="text"
                                                    name="niche"
                                                    value={formData.niche}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white dark:bg-[#16181d] border ${formErrors.niche ? 'border-red-400' : 'border-slate-200 dark:border-[#303340]'} rounded-md px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-[#009966]/20 focus:border-[#009966] transition-all outline-none hover:border-slate-300 dark:hover:border-slate-600 shadow-sm`}
                                                    placeholder="e.g. Retail, IT, Logistics"
                                                />
                                                {formErrors.niche && <p className="text-xs font-medium text-red-500 mt-1.5">{formErrors.niche}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-[#cbd5e1]">Company Size *</label>
                                                <div className="relative">
                                                    <select
                                                        name="employee_count"
                                                        value={formData.employee_count}
                                                        onChange={handleInputChange}
                                                        className={`w-full bg-white dark:bg-[#16181d] border ${formErrors.employee_count ? 'border-red-400' : 'border-slate-200 dark:border-[#303340]'} rounded-md px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-[#009966]/20 focus:border-[#009966] transition-all outline-none appearance-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 shadow-sm`}
                                                    >
                                                        <option value="1-10">1-10 employees (Startup)</option>
                                                        <option value="11-50">11-50 employees (Small)</option>
                                                        <option value="51-200">51-200 employees (Medium)</option>
                                                        <option value="200+">200+ employees (Enterprise)</option>
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-[#cbd5e1]">Business Phone *</label>
                                                <input
                                                    type="text"
                                                    name="business_phone"
                                                    value={formData.business_phone}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white dark:bg-[#16181d] border ${formErrors.business_phone ? 'border-red-400' : 'border-slate-200 dark:border-[#303340]'} rounded-md px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-[#009966]/20 focus:border-[#009966] transition-all outline-none hover:border-slate-300 dark:hover:border-slate-600 shadow-sm`}
                                                    placeholder="Office Contact Number"
                                                />
                                                {formErrors.business_phone && <p className="text-xs font-medium text-red-500 mt-1.5">{formErrors.business_phone}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-[#cbd5e1]">Support / Business Email</label>
                                                <input
                                                    type="email"
                                                    name="business_email"
                                                    value={formData.business_email}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#303340] rounded-md px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-[#009966]/20 focus:border-[#009966] transition-all outline-none hover:border-slate-300 dark:hover:border-slate-600 shadow-sm`}
                                                    placeholder="contact@business.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                            <div className="space-y-2 md:col-span-3">
                                                <label className="text-sm font-bold text-slate-700 dark:text-[#cbd5e1]">Registered Address *</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white dark:bg-[#16181d] border ${formErrors.address ? 'border-red-400' : 'border-slate-200 dark:border-[#303340]'} rounded-md px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-[#009966]/20 focus:border-[#009966] transition-all outline-none hover:border-slate-300 dark:hover:border-slate-600 shadow-sm`}
                                                    placeholder="Complete street address"
                                                />
                                                {formErrors.address && <p className="text-xs font-medium text-red-500 mt-1.5">{formErrors.address}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-[#cbd5e1]">Locality / Area *</label>
                                                <input
                                                    type="text"
                                                    name="locality"
                                                    value={formData.locality}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white dark:bg-[#16181d] border ${formErrors.locality ? 'border-red-400' : 'border-slate-200 dark:border-[#303340]'} rounded-md px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-[#009966]/20 focus:border-[#009966] transition-all outline-none hover:border-slate-300 dark:hover:border-slate-600 shadow-sm`}
                                                    placeholder="e.g. Andheri East"
                                                />
                                                {formErrors.locality && <p className="text-xs font-medium text-red-500 mt-1.5">{formErrors.locality}</p>}
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-[#cbd5e1]">City *</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white dark:bg-[#16181d] border ${formErrors.city ? 'border-red-400' : 'border-slate-200 dark:border-[#303340]'} rounded-md px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-[#009966]/20 focus:border-[#009966] transition-all outline-none hover:border-slate-300 dark:hover:border-slate-600 shadow-sm`}
                                                    placeholder="e.g. Mumbai"
                                                />
                                                {formErrors.city && <p className="text-xs font-medium text-red-500 mt-1.5">{formErrors.city}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-[#cbd5e1]">Established Year</label>
                                                <input
                                                    type="number"
                                                    name="established_year"
                                                    value={formData.established_year}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white dark:bg-[#16181d] border ${formErrors.established_year ? 'border-red-400' : 'border-slate-200 dark:border-[#303340]'} rounded-md px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-[#009966]/20 focus:border-[#009966] transition-all outline-none hover:border-slate-300 dark:hover:border-slate-600 shadow-sm`}
                                                    placeholder="YYYY"
                                                />
                                                {formErrors.established_year && <p className="text-xs font-medium text-red-500 mt-1.5">{formErrors.established_year}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-[#cbd5e1]">Company Website</label>
                                                <input
                                                    type="text"
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleInputChange}
                                                    className={`w-full bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#303340] rounded-md px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-[#009966]/20 focus:border-[#009966] transition-all outline-none hover:border-slate-300 dark:hover:border-slate-600 shadow-sm`}
                                                    placeholder="https://yourcompany.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-[#cbd5e1]">Company Overview / About</label>
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                rows={5}
                                                className="w-full bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#303340] rounded-md px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-[#009966]/20 focus:border-[#009966] transition-all outline-none resize-none hover:border-slate-300 dark:hover:border-slate-600 shadow-sm"
                                                placeholder="Describe your company's mission, values, and work culture to attract top talent..."
                                            />
                                        </div>
                                    </div>

                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-[#303340] flex justify-end gap-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto bg-[#009966] hover:bg-[#008855] text-white font-extrabold py-3.5 px-8 rounded-md transition-all shadow-md shadow-[#009966]/20 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-0.5 focus:ring-4 focus:ring-[#009966]/30 outline-none"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Saving Profile...
                                            </>
                                        ) : (
                                            <><Save size={20} /> Save Changes</>
                                        )}
                                    </button>
                                </div>
                            </form>

                        ) : (

                            /* Read-Only View */
                            <div className="bg-white/90 dark:bg-[#16181d]/90 backdrop-blur-xl rounded-md premium-shadow border border-white/50 dark:border-[#262933]/50 p-6 sm:p-10 animate-fade-in relative overflow-hidden group">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="absolute top-6 right-6 p-3 bg-white dark:bg-[#1a1d24] text-slate-500 hover:text-[#009966] dark:text-slate-400 rounded-md transition-all border border-slate-200 dark:border-[#303340] shadow-sm hover:shadow-md hover:border-[#009966] dark:hover:border-[#009966]/50 z-20 group"
                                    title="Edit Profile"
                                >
                                    <Settings size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                </button>

                                <div className="mb-10 relative z-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#009966]/10 dark:bg-[#007744]/20 text-[#009966] dark:text-[#3b9f87] text-xs font-bold rounded-md mb-4 border border-[#3b9f87]/20 dark:border-[#008855]/30">
                                        <Building2 size={12} /> Primary Organization Details
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">{formData.business_name || 'Business Name'}</h2>
                                    <div className="bg-slate-50/50 dark:bg-[#1a1d24]/50 p-5 rounded-md border border-slate-100 dark:border-[#262933]">
                                        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
                                            {formData.bio || 'Provides context about your organization, culture, and mission to prospective candidates. A complete bio improves engagement.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                                    <div className="flex flex-col gap-2 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/10 dark:to-indigo-900/10 p-5 rounded-md border border-blue-100/50 dark:border-blue-800/30 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-md flex items-center justify-center text-blue-600 dark:text-blue-400 mb-1">
                                            <Globe size={16} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Website</span>
                                        {formData.website ? (
                                            <a href={formData.website} target="_blank" rel="noopener noreferrer" className="font-extrabold text-blue-700 dark:text-blue-400 hover:underline truncate text-sm">
                                                {formData.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        ) : (
                                            <span className="font-bold text-slate-900 dark:text-[#f8fafc] text-sm">-</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2 bg-slate-50 dark:bg-[#1a1d24] p-5 rounded-md border border-slate-100 dark:border-[#262933] shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-8 h-8 bg-slate-200 dark:bg-[#303340] rounded-md flex items-center justify-center text-slate-600 dark:text-slate-300 mb-1">
                                            <Users size={16} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Team Size</span>
                                        <span className="font-bold text-slate-900 dark:text-[#f8fafc] text-sm">{formData.employee_count}</span>
                                    </div>
                                    <div className="flex flex-col gap-2 bg-slate-50 dark:bg-[#1a1d24] p-5 rounded-md border border-slate-100 dark:border-[#262933] shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-8 h-8 bg-slate-200 dark:bg-[#303340] rounded-md flex items-center justify-center text-slate-600 dark:text-slate-300 mb-1">
                                            <Briefcase size={16} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Industry</span>
                                        <span className="font-bold text-slate-900 dark:text-[#f8fafc] text-sm truncate">{formData.niche || '-'}</span>
                                    </div>
                                    <div className="flex flex-col gap-2 bg-slate-50 dark:bg-[#1a1d24] p-5 rounded-md border border-slate-100 dark:border-[#262933] shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-8 h-8 bg-slate-200 dark:bg-[#303340] rounded-md flex items-center justify-center text-slate-600 dark:text-slate-300 mb-1">
                                            <Calendar size={16} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Founded</span>
                                        <span className="font-bold text-slate-900 dark:text-[#f8fafc] text-sm">{formData.established_year || '-'}</span>
                                    </div>
                                </div>

                                {/* Contact Card */}
                                <div className="mt-8 bg-white/50 dark:bg-[#16181d]/50 p-6 rounded-md border border-slate-200/80 dark:border-[#303340]/80 relative z-10 shadow-sm">
                                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                                        <span className="w-2 h-6 bg-[#009966] rounded-full inline-block"></span> Office & Contact Info
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                        <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#1a1d24] p-4 rounded-md border border-transparent hover:border-slate-200 dark:hover:border-[#303340] transition-colors">
                                            <div className="w-10 h-10 rounded-md bg-slate-200/50 dark:bg-[#262933] flex items-center justify-center shrink-0">
                                                <Phone size={18} className="text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-0.5">Contact Number</p>
                                                <p className="font-bold text-sm text-slate-900 dark:text-white">{formData.business_phone || 'Not available'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#1a1d24] p-4 rounded-md border border-transparent hover:border-slate-200 dark:hover:border-[#303340] transition-colors">
                                            <div className="w-10 h-10 rounded-md bg-slate-200/50 dark:bg-[#262933] flex items-center justify-center shrink-0">
                                                <Mail size={18} className="text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-0.5">Business Email</p>
                                                <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[200px]">{formData.business_email || 'Not available'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#1a1d24] p-4 rounded-md md:col-span-2 border border-transparent hover:border-slate-200 dark:hover:border-[#303340] transition-colors">
                                            <div className="w-10 h-10 rounded-md bg-slate-200/50 dark:bg-[#262933] flex items-center justify-center shrink-0 mt-1">
                                                <MapPin size={18} className="text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">Registered Address</p>
                                                <p className="font-bold text-sm text-slate-900 dark:text-white leading-relaxed max-w-2xl">{formData.address ? `${formData.address}, ${formData.locality}, ${formData.city}` : 'Address details are incomplete.'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />

            <ProfilePictureModal
                isOpen={isPicModalOpen}
                onClose={() => setIsPicModalOpen(false)}
                onUploadSuccess={fetchProfile}
                role="hirer"
                currentImage={formData.ProfilePicture}
            />
        </div>
    );
};

export default HirerProfilePage;
