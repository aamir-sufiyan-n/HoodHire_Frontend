import React from 'react';
import { Briefcase } from 'lucide-react';

const ExperienceView = ({ experiences }) => {
    return (
        <div className="flex flex-col h-full">
            <h3 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                Professional Experience
            </h3>

            {experiences.length === 0 ? (
                <div className="bg-slate-50/80 dark:bg-[#1a1d24]/80 p-6 rounded-xl border border-dashed border-slate-200 dark:border-[#303340] text-center max-w-sm">
                    <p className="text-sm text-slate-500 dark:text-[#94a3b8] font-semibold">No professional experience added yet.</p>
                </div>
            ) : (
                <div className="space-y-6 py-2 ml-2 max-h-[32rem] overflow-y-auto pr-4 custom-scrollbar">
                    {experiences.map((exp, index) => (
                        <div key={index} className="relative group border-b border-slate-100 dark:border-[#262933] pb-4 last:border-0 last:pb-0">

                            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4 mb-0.5">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-[13px]">{exp.position}</h4>
                                <span className="text-[12px] font-medium text-slate-400 dark:text-slate-500">
                                    {exp.duration} {exp.is_current_job ? '(Current)' : ''}
                                </span>
                            </div>
                            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                                {exp.company_name}
                            </p>
                            {exp.description && (
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-2 leading-relaxed pl-3 border-l-2 border-slate-100 dark:border-[#262933]">{exp.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExperienceView;
