import React from 'react';
import { Calendar, Clock, Briefcase } from 'lucide-react';

const WorkPreferencesView = ({ workPreference, daysOfWeek, timeSlots }) => {
    return (
        <div className="bg-slate-100 dark:bg-[#111318] backdrop-blur-xl rounded-sm premium-shadow border-none dark:border-[#262933]/50 p-6 flex flex-col h-full">
            <h3 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                Availability Settings
            </h3>

            <div className="space-y-6 flex-1">
                <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Calendar size={14} /> Available Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map(({ key, label }) => {
                            const isAvailable = workPreference[key];
                            return (
                                <span
                                    key={key}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full text-xs font-semibold shadow-sm transition-all ${isAvailable ? 'bg-[#009966] text-white shadow-[#009966]/20' : 'bg-white dark:bg-[#1a1d24] text-slate-400 dark:text-slate-500 border border-transparent opacity-80 hover:opacity-100'}`}
                                >
                                    {label}
                                </span>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Clock size={14} /> Time Slot
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map(slot => (
                            <div
                                key={slot}
                                className={`py-2 px-3 rounded-md text-center text-sm font-medium capitalize transition-colors ${workPreference.preferred_shift === slot ? 'bg-white text-[#009966] border border-[#009966] dark:bg-[#009966]/10 dark:text-[#009966] dark:border-[#009966] shadow-sm' : 'bg-white dark:bg-[#1a1d24] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border border-transparent shadow-sm'}`}
                            >
                                {slot}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Briefcase size={14} /> Job Type
                    </label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className={`py-2 px-3 rounded-md text-center text-sm font-medium transition-colors ${workPreference.part_time ? 'bg-white text-[#009966] border border-[#009966] dark:bg-[#009966]/10 dark:text-[#009966] dark:border-[#009966] shadow-sm' : 'bg-white dark:bg-[#1a1d24] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border border-transparent shadow-sm'}`}>
                            Part-time
                        </div>
                        <div className={`py-2 px-3 rounded-md text-center text-sm font-medium transition-colors ${workPreference.full_time ? 'bg-white text-[#009966] border border-[#009966] dark:bg-[#009966]/10 dark:text-[#009966] dark:border-[#009966] shadow-sm' : 'bg-white dark:bg-[#1a1d24] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border border-transparent shadow-sm'}`}>
                            Full-time
                        </div>
                    </div>
                    {workPreference.immediate && (
                        <div className="mt-4 px-4 py-3 bg-[#f0faf5] dark:bg-[#009966]/10 border border-[#bdf0d9] dark:border-[#009966]/30 rounded-md flex items-center justify-between">
                            <span className="text-sm font-semibold text-[#007744] dark:text-[#009966]">Ready to start immediately</span>
                            <div className="w-2 h-2 rounded-full bg-[#009966] animate-pulse"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkPreferencesView;
