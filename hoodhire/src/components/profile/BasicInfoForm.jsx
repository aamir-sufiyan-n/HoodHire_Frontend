import React from 'react';
import { User } from 'lucide-react';

const BasicInfoForm = ({ formData, handleInputChange, formErrors }) => {
    return (
        <div className="bg-slate-50/60 dark:bg-[#1a1d24]/60 p-5 sm:p-6 rounded-xl border border-slate-200/60 dark:border-[#262933] group hover:border-[#bdf0d9] dark:hover:border-emerald-900/40 transition-colors">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-200/80 dark:border-[#303340]">
                <div className="w-12 h-12 rounded-xl bg-[#f0faf5] dark:bg-[#009966]/10 flex items-center justify-center border border-[#dff5ea] dark:border-[#009966]/20 group-hover:scale-110 transition-transform">
                    <User size={22} className="text-[#009966]" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Basic Information</h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Personal details and contact info</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all shadow-sm ${formErrors.full_name ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} />
                    {formErrors?.full_name && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.full_name}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Age <span className="text-red-500">*</span></label>
                    <input type="number" name="age" value={formData.age} onChange={handleInputChange} className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all shadow-sm ${formErrors?.age ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} min="16" max="100" />
                    {formErrors?.age && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.age}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gender <span className="text-red-500">*</span></label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all shadow-sm ${formErrors?.gender ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    {formErrors?.gender && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.gender}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number <span className="text-red-500">*</span></label>
                    <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange} className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all shadow-sm ${formErrors?.phone_number ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} />
                    {formErrors?.phone_number && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.phone_number}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Status <span className="text-red-500">*</span></label>
                    <select name="current_status" value={formData.current_status} onChange={handleInputChange} className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all shadow-sm ${formErrors?.current_status ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`}>
                        <option value="">Select Status</option>
                        <option value="student">Student</option>
                        <option value="employed">Employed</option>
                        <option value="unemployed">Unemployed</option>
                        <option value="freelancer">Freelancer</option>
                    </select>
                    {formErrors?.current_status && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.current_status}</span>}
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bio <span className="text-slate-400 font-normal text-xs ml-1">(Optional)</span></label>
                    <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={3} className="px-4 py-2.5 rounded-md border border-slate-200 dark:border-[#303340] bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all resize-none shadow-sm" placeholder="Tell businesses a little about yourself..."></textarea>
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">About Me <span className="text-slate-400 font-normal text-xs ml-1">(Optional)</span></label>
                    <textarea name="about" value={formData.about || ''} onChange={handleInputChange} rows={6} className="px-4 py-2.5 rounded-md border border-slate-200 dark:border-[#303340] bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all resize-none shadow-sm" placeholder="Write a comprehensive description about your background, goals, and who you are..."></textarea>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Locality / City <span className="text-red-500">*</span></label>
                    <input type="text" name="locality" value={formData.locality} onChange={handleInputChange} className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all shadow-sm ${formErrors?.locality ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} />
                    {formErrors?.locality && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.locality}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Address <span className="text-red-500">*</span></label>
                    <input type="text" name="current_address" value={formData.current_address} onChange={handleInputChange} className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all shadow-sm ${formErrors?.current_address ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} />
                    {formErrors?.current_address && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.current_address}</span>}
                </div>
            </div>
        </div>
    );
};

export default BasicInfoForm;
