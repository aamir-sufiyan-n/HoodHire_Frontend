import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const CategoriesForm = ({ availableCategories, formData, toggleCategory, formErrors }) => {
    return (
        <div className="bg-slate-50/60 dark:bg-[#1a1d24]/60 p-5 sm:p-6 rounded-xl border border-slate-200/60 dark:border-[#262933] group hover:border-[#bdf0d9] dark:hover:border-emerald-900/40 transition-colors">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-200/80 dark:border-[#303340]">
                <div className="w-12 h-12 rounded-xl bg-[#f0faf5] dark:bg-[#009966]/10 flex items-center justify-center border border-[#dff5ea] dark:border-[#009966]/20 group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={22} className="text-[#009966]" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Interested Categories <span className="text-red-500">*</span></h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Select 1 to 5 categories you are interested in working</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                {availableCategories.map(cat => {
                    const isSelected = (formData.interested_categories || []).includes(cat.name);
                    return (
                        <button
                            key={cat.name}
                            type="button"
                            onClick={() => toggleCategory(cat.name)}
                            className={`py-2 px-4 rounded-md text-sm font-medium transition-all border ${isSelected ? 'bg-[#f0faf5] text-[#007744] border-2 border-[#008855] dark:bg-[#009966]/20 dark:text-[#009966] dark:border-[#009966] shadow-sm' : 'bg-white dark:bg-[#1a1d24] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#262933] hover:bg-slate-50 dark:hover:bg-[#262933]'}`}
                        >
                            {cat.displayName}
                        </button>
                    );
                })}
            </div>
            {formErrors?.interested_categories && <p className="text-red-500 text-xs mt-3 font-semibold">{formErrors.interested_categories}</p>}
        </div>
    );
};

export default CategoriesForm;
