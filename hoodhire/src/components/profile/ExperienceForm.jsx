import React from 'react';
import { Briefcase, Trash2, Plus, X } from 'lucide-react';

const ExperienceForm = ({
    experiences,
    isAddingExperience,
    setIsAddingExperience,
    newExperience,
    setNewExperience,
    handleAddExperience,
    removeExperience
}) => {
    return (
        <div className="bg-slate-50/60 dark:bg-[#1a1d24]/60 p-5 sm:p-6 rounded-xl border border-slate-200/60 dark:border-[#262933] group hover:border-[#bdf0d9] dark:hover:border-emerald-900/40 transition-colors">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-200/80 dark:border-[#303340]">
                <div className="w-12 h-12 rounded-xl bg-[#f0faf5] dark:bg-[#009966]/10 flex items-center justify-center border border-[#dff5ea] dark:border-[#009966]/20 group-hover:scale-110 transition-transform">
                    <Briefcase size={22} className="text-[#009966]" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Professional Experience</h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Where you've worked previously</p>
                </div>
            </div>

            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {experiences.length === 0 && !isAddingExperience && (
                    <div className="text-center p-8 border border-dashed border-slate-300 dark:border-[#3a3d4a] rounded-xl bg-white/50 dark:bg-[#16181d]/50 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#262933] flex items-center justify-center mb-3">
                            <Briefcase size={20} className="text-slate-400" />
                        </div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-1">No experience added yet</h4>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm">Highlighting your past work helps local businesses understand your skills better.</p>
                    </div>
                )}
                {experiences.map((exp, index) => (
                    <div key={index} className="flex items-start justify-between p-5 border border-slate-200 dark:border-[#303340] rounded-xl bg-white dark:bg-[#16181d] shadow-sm">
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white text-base">{exp.position} at {exp.company_name}</h4>
                            <p className="text-xs font-semibold text-[#008855] dark:text-[#009966] mt-1 uppercase tracking-wider">{exp.duration} {exp.is_current_job ? '(Current)' : ''}</p>
                            {exp.description && <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-2">{exp.description}</p>}
                        </div>
                        <button type="button" onClick={() => removeExperience(index, exp.id)} className="text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-[#1a1d24] p-2 rounded-md transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/50">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {!isAddingExperience ? (
                <div className="flex items-center justify-center py-2">
                    <button type="button" onClick={() => setIsAddingExperience(true)} className="flex items-center gap-2 text-[#008855] hover:text-[#007744] dark:text-[#009966] dark:hover:text-[#009966] font-semibold px-6 py-2.5 rounded-md transition-all border border-[#bdf0d9] dark:border-emerald-900/30 bg-[#f0faf5] dark:bg-[#009966]/10 hover:bg-[#dff5ea] dark:hover:bg-[#009966]/20 shadow-sm cursor-pointer w-full sm:w-auto justify-center">
                        <Plus size={18} /> Add New Experience
                    </button>
                </div>
            ) : (
                <div className="p-6 md:p-8 border border-[#bdf0d9] dark:border-emerald-900/50 rounded-xl bg-[#f0faf5]/40 dark:bg-emerald-900/10 space-y-6 animate-fade-in shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white text-lg">New Experience</h4>
                        <button type="button" onClick={() => setIsAddingExperience(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-[#1a1d24] p-2 rounded-full border border-slate-200 dark:border-[#303340] shadow-sm transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Company Name *</label>
                            <input type="text" value={newExperience.company_name} onChange={e => setNewExperience({ ...newExperience, company_name: e.target.value })} className="px-4 py-2.5 rounded-md border border-slate-200 dark:border-[#303340] bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all shadow-sm" placeholder="Where did you work?" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Position *</label>
                            <input type="text" value={newExperience.position} onChange={e => setNewExperience({ ...newExperience, position: e.target.value })} className="px-4 py-2.5 rounded-md border border-slate-200 dark:border-[#303340] bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all shadow-sm" placeholder="Your job title" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between uppercase tracking-widest">
                                <span>Duration *</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase text-slate-400">Current Job</span>
                                    <input
                                        type="checkbox"
                                        checked={newExperience.is_current_job}
                                        onChange={() => setNewExperience({ ...newExperience, is_current_job: !newExperience.is_current_job })}
                                        className="w-3.5 h-3.5 border-slate-300 rounded text-[#009966] focus:ring-[#009966]"
                                    />
                                </div>
                            </label>
                            <input type="text" value={newExperience.duration} onChange={e => setNewExperience({ ...newExperience, duration: e.target.value })} className="px-4 py-2.5 rounded-md border border-slate-200 dark:border-[#303340] bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all shadow-sm" placeholder="e.g. Jan 2023 - Present" />
                        </div>
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Description (optional)</label>
                            <textarea value={newExperience.description} onChange={e => setNewExperience({ ...newExperience, description: e.target.value })} rows={2} className="px-4 py-2.5 rounded-md border border-slate-200 dark:border-[#303340] bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all resize-none shadow-sm" placeholder="What did you do there?"></textarea>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="button" onClick={handleAddExperience} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold py-2.5 px-6 rounded-md transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto">
                            Save Experience
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExperienceForm;
