import React from 'react';
import { Calendar, Save, Settings, Clock, Briefcase } from 'lucide-react';

const WorkPreferencesForm = ({
    workPreference,
    setWorkPreference,
    daysOfWeek,
    timeSlots,
    toggleWorkDay,
    hasExistingPreference,
    isEditingPreference,
    setIsEditingPreference,
    handlePreferenceSubmit,
    isSubmittingPreference,
    isViewMode = false
}) => {
    return (
        <div className="bg-[#F5F5F5] dark:bg-[#242832]/60 p-5 sm:p-6  flex flex-col h-full rounded-xl relative group">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200 dark:border-[#303340]">
                <div className="flex items-center gap-2">

                    <h2 className="text-md font-semibold text-slate-900 dark:text-white">Work-time preferences</h2>
                </div>
                {hasExistingPreference && (
                    <button
                        type="button"
                        onClick={() => {
                            if (isEditingPreference) handlePreferenceSubmit();
                            else setIsEditingPreference(true);
                        }}
                        disabled={isSubmittingPreference}
                    >
                        {isEditingPreference ? (
                            isSubmittingPreference ? <span className="border-1 rounded-full w-4 h-4"></span> : <><h2 className='bg-blue-500  rounded-md px-2 cursor-pointer hover:scale-105 transition-all ease-in font-bold text-white '>save </h2></>
                        ) : (
                            <><Settings size={20} className="text-blue-500 cursor-pointer hover:rotate-90 transition-transform duration-300" /> <span className=" text-md font-semibold"></span></>
                        )}
                    </button>
                )}
            </div>

            <div className="space-y-6 flex-1">
                <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Calendar size={14} /> Available Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map(({ key, label }) => {
                            const isAvailable = workPreference[key];
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    disabled={!isEditingPreference}
                                    onClick={() => toggleWorkDay(key)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full text-xs font-semibold shadow-sm transition-all ${isAvailable ? 'bg-[#134074] text-white shadow-[#134074]/30' : 'bg-white dark:bg-[#262933] text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-transparent'} ${isEditingPreference ? 'hover:scale-105 hover:shadow-md cursor-pointer' : 'opacity-85 cursor-default'}`}
                                >
                                    {label}
                                </button>
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
                            <button
                                key={slot}
                                type="button"
                                disabled={!isEditingPreference}
                                onClick={() => setWorkPreference({ ...workPreference, preferred_shift: slot })}
                                className={`py-2 px-3 rounded-md text-sm font-medium transition-all capitalize ${workPreference.preferred_shift === slot ? 'bg-white text-[#134074] border-2 border-[#134074] dark:bg-[#8DA9C4]/20 dark:text-[#8DA9C4] dark:border-[#8DA9C4]' : 'bg-white dark:bg-[#1a1d24] text-slate-500 dark:text-slate-400 shadow-sm border border-transparent dark:border-[#262933]'} ${isEditingPreference && workPreference.preferred_shift !== slot ? 'hover:bg-slate-50 cursor-pointer' : ''} ${!isEditingPreference && workPreference.preferred_shift !== slot ? 'opacity-70' : ''}`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Briefcase size={14} /> Job Type
                    </label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                            type="button"
                            disabled={!isEditingPreference}
                            onClick={() => setWorkPreference({ ...workPreference, part_time: !workPreference.part_time })}
                            className={`py-2 px-3 rounded-md text-sm font-medium transition-all capitalize ${workPreference.part_time ? 'bg-white text-[#134074] border-2 border-[#134074] dark:bg-[#8DA9C4]/20 dark:text-[#8DA9C4] dark:border-[#8DA9C4]' : 'bg-white dark:bg-[#1a1d24] text-slate-500 shadow-sm dark:text-slate-400 border border-transparent dark:border-[#262933]'} ${isEditingPreference && !workPreference.part_time ? 'hover:bg-slate-50 cursor-pointer' : ''} ${!isEditingPreference && !workPreference.part_time ? 'opacity-40' : ''}`}
                        >
                            Part-time
                        </button>
                        <button
                            type="button"
                            disabled={!isEditingPreference}
                            onClick={() => setWorkPreference({ ...workPreference, full_time: !workPreference.full_time })}
                            className={`py-2 px-3 rounded-md text-sm font-medium transition-all ${workPreference.full_time ? 'bg-white text-[#134074] border-2 border-[#134074] dark:bg-[#8DA9C4]/20 dark:text-[#8DA9C4] dark:border-[#8DA9C4]' : 'bg-white dark:bg-[#1a1d24] text-slate-500 shadow-sm dark:text-slate-400 border border-transparent dark:border-[#262933]'} ${isEditingPreference && !workPreference.full_time ? 'hover:bg-slate-50 cursor-pointer' : ''} ${!isEditingPreference && !workPreference.full_time ? 'opacity-40' : ''}`}
                        >
                            Full-time
                        </button>
                    </div>
                    {!isViewMode && (
                        <div className="border border-slate-200 dark:border-[#262933] rounded-md bg-white dark:bg-[#1a1d24] p-3 flex items-center justify-between shadow-sm">
                            <span className="text-sm font-medium text-slate-700 dark:text-[#e2e8f0]">Ready immediately</span>
                            <button
                                type="button"
                                disabled={!isEditingPreference}
                                onClick={() => setWorkPreference({ ...workPreference, immediate: !workPreference.immediate })}
                                className={`w-11 h-6 rounded-full transition-colors relative ${workPreference.immediate ? 'bg-[#008855]' : 'bg-slate-300 dark:bg-slate-600'} ${isEditingPreference ? 'cursor-pointer' : 'opacity-50'}`}
                            >
                                <span className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${workPreference.immediate ? 'left-[26px]' : 'left-1'}`}></span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {(!hasExistingPreference && !isViewMode) && (
                <div className="mt-4 flex justify-end">
                    <button
                        type="button"
                        onClick={handlePreferenceSubmit}
                        disabled={isSubmittingPreference}
                        className="bg-transparent hover:bg-[#EEF4ED] dark:hover:bg-[#134074]/10 text-[#134074] dark:text-[#8DA9C4] border border-[#134074]/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold py-2.5 px-6 rounded-md flex items-center justify-center gap-2 transition-all shadow-sm w-full sm:w-auto"
                    >
                        {isSubmittingPreference ? <span className="w-4 h-4 rounded-full border-2 border-[#134074]/30 border-t-[#134074] animate-spin"></span> : 'Save Preferences'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default WorkPreferencesForm;
