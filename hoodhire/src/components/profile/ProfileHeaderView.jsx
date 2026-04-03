import React, { useState } from 'react';
import { User, Briefcase, Mail, Phone, MapPin, LogOut, Settings, Camera } from 'lucide-react';
import ProfilePictureModal from './ProfilePictureModal';

const ProfileHeaderView = ({ formData, user, setIsEditing, handleLogout, workPreference, hasExistingProfile, onRefresh }) => {
    const [isPicModalOpen, setIsPicModalOpen] = useState(false);

    // Construct picture URL or use placeholder
    const profilePic = formData.ProfilePicture || formData.profile_picture || formData.profile_picture_url || formData.ProfilePictureUrl;

    return (
        <div className="w-full bg-white dark:bg-[#16181d] rounded-sm premium-shadow border border-slate-200 dark:border-[#262933] p-6 lg:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
            {/* Left Header Compartment */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1 min-w-[50%] border-b md:border-b-0 md:border-r border-slate-100 dark:border-[#262933] pb-6 md:pb-0 md:pr-8">
                <div className="w-32 h-32 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-[#303340] shadow-sm relative group bg-slate-50 dark:bg-[#1a1d24] flex items-center justify-center">
                    {profilePic ? (
                        <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User size={54} className="text-slate-300 dark:text-slate-600" />
                    )}

                    {/* Upload Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setIsPicModalOpen(true)}>
                        <Camera size={24} className="text-white" />
                    </div>
                </div>

                <div className="flex flex-col items-center sm:items-start w-full">
                    <div className="flex items-center justify-between w-full mb-1">
                        <h1 className="text-2xl font-normal text-slate-800 dark:text-slate-100 capitalize tracking-tight font-sans">{formData.full_name || user?.username || 'Your Name'}</h1>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5 font-medium">
                        {formData.current_status || 'Professional Seeker'}
                    </p>
                    <p className="text-[13px] text-blue-500 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1 mb-6 font-medium">
                        <Briefcase size={14} className="shrink-0" /> {formData.institute_name || 'Seeking Opportunities'}
                    </p>

                    <div className="flex flex-wrap gap-4 w-full justify-center sm:justify-start">
                        <button onClick={() => setIsEditing(true)} className="flex-1 sm:flex-none sm:w-[140px] py-2.5 bg-[#009966] hover:bg-[#008855] text-white font-bold rounded-sm shadow-sm transition-colors text-sm flex justify-center items-center gap-2">
                            <Settings size={16} /> {hasExistingProfile ? 'Edit Profile' : 'Setup Profile'}
                        </button>
                        <button onClick={handleLogout} className="flex-1 sm:flex-none sm:w-[140px] py-2.5 bg-transparent border border-blue-400 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 font-bold rounded-sm shadow-sm transition-colors text-sm flex justify-center items-center gap-2">
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Header Compartment */}
            <div className="flex flex-col justify-start w-full md:w-auto flex-1 h-full pl-0 md:pl-4">
                <div className="grid grid-cols-[160px_1fr] gap-y-3 gap-x-4 w-full mb-6">
                    <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Availability:</span>
                    <span className="text-[13px] text-slate-600 dark:text-slate-400 pb-1 border-b border-transparent hover:border-slate-300 inline-flex items-center gap-2">
                        {workPreference?.full_time ? 'Full-time' : (workPreference?.part_time ? 'Part-time' : 'Not specified')}
                        {workPreference?.immediate ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#009966] text-white text-[10px] uppercase font-bold tracking-wider leading-none">Available</span>
                        ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider leading-none">Not Available</span>
                        )}
                    </span>

                    <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Age / Gender:</span>
                    <span className="text-[13px] text-slate-600 dark:text-slate-400 pb-1 border-b border-transparent hover:border-slate-300 bg-transparent py-0 h-auto">
                        {formData.age ? `${formData.age}` : 'N/A'} • {formData.gender || 'N/A'}
                    </span>

                    <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Location:</span>
                    <span className="text-[13px] text-slate-600 dark:text-slate-400 pb-1 border-b border-transparent hover:border-slate-300">
                        {formData.locality ? `${formData.locality}, IN` : 'Not Set'}
                    </span>

                    <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Phone number:</span>
                    <span className="text-[13px] text-slate-600 dark:text-slate-400 pb-1 border-b border-transparent hover:border-slate-300">
                        {formData.phone_number || 'N/A'}
                    </span>
                </div>

                <div className="flex items-center gap-5 mt-auto text-blue-400">
                    {/* Simulated Social Icons mapping to contact methods */}
                    <a href={`mailto:${user?.email}`} className="hover:text-blue-600 transition-colors p-1" title="Email"><Mail size={18} /></a>
                    <a href={`tel:${formData.phone_number}`} className="hover:text-blue-600 transition-colors p-1" title="Phone"><Phone size={18} /></a>
                    <div className="hover:text-blue-600 transition-colors cursor-pointer p-1" title="Address"><MapPin size={18} /></div>
                </div>
            </div>
            <ProfilePictureModal
                isOpen={isPicModalOpen}
                onClose={() => setIsPicModalOpen(false)}
                onUploadSuccess={onRefresh}
                role="seeker"
                currentImage={profilePic}
            />
        </div>
    );
};

export default ProfileHeaderView;
