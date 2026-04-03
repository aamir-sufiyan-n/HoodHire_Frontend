import React from 'react';
import { Building2 } from 'lucide-react';

const EducationForm = ({ formData, handleInputChange, formErrors }) => {
    return (
        <div className="bg-slate-50/60 dark:bg-[#1a1d24]/60 p-5 sm:p-6 rounded-xl border border-slate-200/60 dark:border-[#262933] group hover:border-[#bdf0d9] dark:hover:border-emerald-900/40 transition-colors flex flex-col h-full">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-200/80 dark:border-[#303340]">
                <div className="w-12 h-12 rounded-xl bg-[#f0faf5] dark:bg-[#009966]/10 flex items-center justify-center border border-[#dff5ea] dark:border-[#009966]/20 group-hover:scale-110 transition-transform">
                    <Building2 size={22} className="text-[#009966]" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Educational Background</h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Where you studied</p>
                </div>
            </div>

            <div className="flex flex-col gap-y-5 flex-1">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Institute Name <span className="text-red-500">*</span></label>
                    <input type="text" name="institute_name" value={formData.institute_name} onChange={handleInputChange} className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all shadow-sm ${formErrors?.institute_name ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} />
                    {formErrors?.institute_name && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.institute_name}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Course Name <span className="text-red-500">*</span></label>
                    <input type="text" name="course_name" value={formData.course_name} onChange={handleInputChange} className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all shadow-sm ${formErrors?.course_name ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} />
                    {formErrors?.course_name && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.course_name}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Field of Study <span className="text-red-500">*</span></label>
                    <input type="text" name="field_of_study" value={formData.field_of_study} onChange={handleInputChange} className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all shadow-sm ${formErrors?.field_of_study ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} />
                    {formErrors?.field_of_study && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.field_of_study}</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-auto">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Start Year <span className="text-red-500">*</span></label>
                        <input type="number" name="start_year" value={formData.start_year} onChange={handleInputChange} className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all shadow-sm ${formErrors?.start_year ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} />
                        {formErrors?.start_year && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.start_year}</span>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                            <span>Graduation</span>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] uppercase text-slate-400">Ongoing</span>
                                <input
                                    type="checkbox"
                                    name="is_ongoing"
                                    checked={formData.is_ongoing}
                                    onChange={(e) => handleInputChange({ target: { name: 'is_ongoing', type: 'checkbox', checked: e.target.checked } })}
                                    className="w-4 h-4 rounded text-[#009966] focus:ring-[#009966] border-slate-300"
                                />
                            </div>
                        </label>
                        <input type="number" name="graduation_year" disabled={formData.is_ongoing} value={formData.is_ongoing ? '' : formData.graduation_year} onChange={handleInputChange} className={`px-4 py-2.5 rounded-md border bg-white dark:bg-[#16181d] text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${formErrors?.graduation_year ? 'border-red-500' : 'border-slate-200 dark:border-[#303340]'}`} />
                        {formErrors?.graduation_year && <span className="text-red-500 text-xs mt-1 font-semibold">{formErrors.graduation_year}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EducationForm;
