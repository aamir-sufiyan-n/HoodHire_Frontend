import React from 'react';

const CategoriesView = ({ formData, availableCategories }) => {
    return (
        <div className="flex flex-col h-full">
            <h3 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                Interested Fields
            </h3>
            {formData.interested_categories && formData.interested_categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {formData.interested_categories.map((catKey, index) => {
                        const catObj = availableCategories.find(c => c.name === catKey);
                        return (
                            <span
                                key={index}
                                className="px-3 py-1.5 rounded-full text-[12px] font-bold bg-white dark:bg-[#1a1d24] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#303340] shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                            >
                                {catObj ? catObj.displayName : catKey}
                            </span>
                        );
                    })}
                </div>
            ) : (
                <p className="text-sm text-slate-500 dark:text-[#94a3b8] font-medium">No interested categories selected.</p>
            )}
        </div>
    );
};

export default CategoriesView;
