import React from 'react';
import { User, Building2, MapPin, Globe, Calendar, Phone, Mail, Users } from 'lucide-react';

export const HirerPersonalForm = ({ formData, handleInputChange, formErrors }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contact Person Name <span className="text-red-500">*</span></label>
            <input 
                type="text" 
                name="full_name" 
                value={formData.full_name} 
                onChange={handleInputChange} 
                className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#134074]/30 focus:border-[#134074] transition-all shadow-sm ${formErrors?.full_name ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} 
                placeholder="Manager/Owner Name"
            />
            {formErrors?.full_name && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.full_name}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Personal Phone Number <span className="text-red-500">*</span></label>
            <input 
                type="tel" 
                name="phone_number" 
                value={formData.phone_number} 
                onChange={handleInputChange} 
                className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#134074]/30 focus:border-[#134074] transition-all shadow-sm ${formErrors?.phone_number ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} 
                placeholder="10-digit number"
            />
            {formErrors?.phone_number && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.phone_number}</span>}
        </div>
    </div>
);

export const BusinessCoreForm = ({ formData, handleInputChange, formErrors }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Business/Organization Name <span className="text-red-500">*</span></label>
            <input 
                type="text" 
                name="business_name" 
                value={formData.business_name} 
                onChange={handleInputChange} 
                className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#134074]/30 focus:border-[#134074] transition-all shadow-sm ${formErrors?.business_name ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} 
                placeholder="e.g. Acme Corp"
            />
            {formErrors?.business_name && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.business_name}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Industry / Niche <span className="text-red-500">*</span></label>
            <input 
                type="text" 
                name="niche" 
                value={formData.niche} 
                onChange={handleInputChange} 
                className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#134074]/30 focus:border-[#134074] transition-all shadow-sm ${formErrors?.niche ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} 
                placeholder="e.g. Retail, Tech, Food"
            />
            {formErrors?.niche && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.niche}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Company Size (Employees) <span className="text-red-500">*</span></label>
            <select 
                name="employee_count" 
                value={formData.employee_count} 
                onChange={handleInputChange} 
                className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#134074]/30 focus:border-[#134074] transition-all shadow-sm ${formErrors?.employee_count ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`}
            >
                <option value="1-10">1-10 employees (Startup)</option>
                <option value="11-50">11-50 employees (Small)</option>
                <option value="51-200">51-200 employees (Medium)</option>
                <option value="200+">200+ employees (Enterprise)</option>
            </select>
            {formErrors?.employee_count && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.employee_count}</span>}
        </div>
    </div>
);

export const BusinessContactForm = ({ formData, handleInputChange, formErrors }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Business Phone <span className="text-red-500">*</span></label>
            <input 
                type="tel" 
                name="business_phone" 
                value={formData.business_phone} 
                onChange={handleInputChange} 
                className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#134074]/30 focus:border-[#134074] transition-all shadow-sm ${formErrors?.business_phone ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} 
                placeholder="Office Phone"
            />
            {formErrors?.business_phone && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.business_phone}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Business Email</label>
            <input 
                type="email" 
                name="business_email" 
                value={formData.business_email} 
                onChange={handleInputChange} 
                className="px-4 py-2.5 rounded-md border border-slate-200 dark:border-[#303340] bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#134074]/30 focus:border-[#134074] transition-all shadow-sm" 
                placeholder="company@email.com"
            />
        </div>
        <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Registered Address <span className="text-red-500">*</span></label>
            <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleInputChange} 
                className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#134074]/30 focus:border-[#134074] transition-all shadow-sm ${formErrors?.address ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} 
                placeholder="Street address, building, etc."
            />
            {formErrors?.address && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.address}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Locality / Area <span className="text-red-500">*</span></label>
            <input 
                type="text" 
                name="locality" 
                value={formData.locality} 
                onChange={handleInputChange} 
                className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#134074]/30 focus:border-[#134074] transition-all shadow-sm ${formErrors?.locality ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} 
                placeholder="Neighborhood/Area"
            />
            {formErrors?.locality && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.locality}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">City <span className="text-red-500">*</span></label>
            <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleInputChange} 
                className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#134074]/30 focus:border-[#134074] transition-all shadow-sm ${formErrors?.city ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} 
                placeholder="Mumbai/Bangalore/etc."
            />
            {formErrors?.city && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.city}</span>}
        </div>
    </div>
);

export const BusinessDetailsForm = ({ formData, handleInputChange, formErrors }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Established Year</label>
            <input 
                type="number" 
                name="established_year" 
                value={formData.established_year} 
                onChange={handleInputChange} 
                className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#134074]/30 focus:border-[#134074] transition-all shadow-sm ${formErrors?.established_year ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} 
                placeholder="YYYY"
            />
            {formErrors?.established_year && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.established_year}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Website</label>
            <input 
                type="text" 
                name="website" 
                value={formData.website} 
                onChange={handleInputChange} 
                className="px-4 py-2.5 rounded-md border border-slate-200 dark:border-[#303340] bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#134074]/30 focus:border-[#134074] transition-all shadow-sm" 
                placeholder="https://yourcompany.com"
            />
        </div>
        <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bio / About Business</label>
            <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleInputChange} 
                rows={4} 
                className="px-4 py-2.5 rounded-md border border-slate-200 dark:border-[#303340] bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#134074]/30 focus:border-[#134074] transition-all resize-none shadow-sm" 
                placeholder="Tell users what your business does..."
            />
        </div>
    </div>
);
