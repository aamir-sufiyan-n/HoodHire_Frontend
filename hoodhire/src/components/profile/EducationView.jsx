import React from 'react';
import { Building2, Calendar } from 'lucide-react';

const EducationView = ({ formData }) => {
    return (
        <div className="bg-white/95 dark:bg-[#16181d]/95 backdrop-blur-xl rounded-sm premium-shadow border border-slate-200/50 dark:border-[#262933]/50 p-6 flex flex-col h-full">
            <h3 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                Educational Background
            </h3>

            <div className="flex flex-col">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-[13px] mb-1">
                    {formData.institute_name || 'No Institute Added'}
                </h4>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-2">
                    {formData.course_name ? `${formData.course_name} in ${formData.field_of_study}` : 'No Course Info'}
                </p>

                <div className="text-[12px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5 mt-1 border-t border-slate-100 dark:border-[#262933] pt-3">
                    <Calendar size={12} className="text-slate-400" />
                    {formData.start_year || '-'} to {formData.is_ongoing ? 'Present' : (formData.graduation_year || '-')}
                </div>
            </div>
        </div>
    );
};

export default EducationView;
