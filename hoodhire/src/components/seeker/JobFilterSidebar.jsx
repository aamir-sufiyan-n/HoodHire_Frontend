import React, { useMemo, useState, useEffect } from 'react';
import { Search, MapPin, RotateCcw, Filter } from 'lucide-react';

const JobFilterSidebar = ({ jobs, filters, setFilters }) => {

    const [localFilters, setLocalFilters] = useState(filters);
    const [showAllCategories, setShowAllCategories] = useState(false);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    // Helper to handle array toggles (checkboxes)
    const toggleArrayFilter = (key, value) => {
        setLocalFilters(prev => {
            const currentArray = prev[key];
            if (currentArray.includes(value)) {
                return { ...prev, [key]: currentArray.filter(item => item !== value) };
            }
            return { ...prev, [key]: [...currentArray, value] };
        });
    };

    const handleApply = () => {
        setFilters(localFilters);
    };

    const handleReset = () => {
        const defaultFilters = {
            search: '',
            location: '',
            categories: [],
            jobTypes: [],
            experience: [],
            datePosted: 'All',
            salaryRange: [0, 1000000]
        };
        setLocalFilters(defaultFilters);
        setFilters(defaultFilters);
    };

    // Derived counts from jobs data
    const categoryCounts = useMemo(() => {
        const counts = {};
        jobs.forEach(job => {
            const cat = job.Category?.DisplayName || 'Other';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }, [jobs]);

    const jobTypeCounts = useMemo(() => {
        const counts = {};
        jobs.forEach(job => {
            const type = job.Description?.JobType || 'other';
            counts[type] = (counts[type] || 0) + 1;
        });
        return counts;
    }, [jobs]);

    const experienceCounts = useMemo(() => {
        const counts = { 'Experience Required': 0, 'No Experience': 0 };
        jobs.forEach(job => {
            if (job.Description?.ExperienceRequired) {
                counts['Experience Required']++;
            } else {
                counts['No Experience']++;
            }
        });
        return counts;
    }, [jobs]);



    return (
        <div className="flex flex-col sticky top-24 bg-[#f0faf5]/80 dark:bg-[#009966]/5 backdrop-blur-md rounded-xl p-5 w-64 shrink-0 shadow-sm border border-emerald-100/50 dark:border-emerald-900/20 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">



            {/* Location */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Location</h3>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <select
                        value={localFilters.location}
                        onChange={(e) => setLocalFilters(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#16181d] border border-transparent focus:border-[#009966]/30 focus:ring-2 focus:ring-[#009966]/20 rounded-lg text-sm transition-all outline-none appearance-none"
                    >
                        <option value="">Choose city</option>
                        {Array.from(new Set(jobs.map(j => j.Business?.City).filter(Boolean))).map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Category */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Category</h3>
                <div className="space-y-2 mb-3">
                    {Object.entries(categoryCounts)
                        .slice(0, showAllCategories ? undefined : 5)
                        .map(([cat, count]) => (
                            <label key={cat} className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={localFilters.categories.includes(cat)}
                                        onChange={() => toggleArrayFilter('categories', cat)}
                                        className="w-3.5 h-3.5 rounded-sm border-slate-300 text-[#009966] focus:ring-[#009966]"
                                    />
                                    <span className="text-[13px] text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors capitalize">{cat.toLowerCase()}</span>
                                </div>
                                <span className="text-[11px] bg-white dark:bg-[#1a1d24] px-2 py-0.5 rounded-full text-slate-400 font-medium">{count}</span>
                            </label>
                        ))}
                </div>
                {Object.keys(categoryCounts).length > 5 && (
                    <button
                        onClick={() => setShowAllCategories(!showAllCategories)}
                        className="w-full py-2 bg-[#409e8c] hover:bg-[#328575] text-white text-xs font-bold rounded-lg transition-colors"
                    >
                        {showAllCategories ? 'Show Less' : 'Show More'}
                    </button>
                )}
            </div>

            {/* Job Type */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Job Type</h3>
                <div className="space-y-2">
                    {Object.entries(jobTypeCounts).map(([type, count]) => (
                        <label key={type} className="flex items-center justify-between cursor-pointer group">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={localFilters.jobTypes.includes(type)}
                                    onChange={() => toggleArrayFilter('jobTypes', type)}
                                    className="w-3.5 h-3.5 rounded-sm border-slate-300 text-[#009966] focus:ring-[#009966]"
                                />
                                <span className="text-[13px] text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors capitalize">{type.replace('_', ' ')}</span>
                            </div>
                            <span className="text-[11px] bg-white dark:bg-[#1a1d24] px-2 py-0.5 rounded-full text-slate-400 font-medium">{count}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Experience Level */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Experience Level</h3>
                <div className="space-y-2">
                    {Object.entries(experienceCounts).map(([exp, count]) => (
                        <label key={exp} className="flex items-center justify-between cursor-pointer group">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={localFilters.experience.includes(exp)}
                                    onChange={() => toggleArrayFilter('experience', exp)}
                                    className="w-3.5 h-3.5 rounded-sm border-slate-300 text-[#009966] focus:ring-[#009966]"
                                />
                                <span className="text-[13px] text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{exp}</span>
                            </div>
                            <span className="text-[11px] bg-white dark:bg-[#1a1d24] px-2 py-0.5 rounded-full text-slate-400 font-medium">{count}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Date Posted (Mocked for UI matching) */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Date Posted</h3>
                <div className="space-y-2">
                    {['All', 'Last Hour', 'Last 24 Hours', 'Last 7 Days', 'Last 30 Days'].map((dateOption) => (
                        <label key={dateOption} className="flex items-center justify-between cursor-pointer group">
                            <div className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="datePosted"
                                    checked={localFilters.datePosted === dateOption}
                                    onChange={() => setLocalFilters(prev => ({ ...prev, datePosted: dateOption }))}
                                    className="w-3.5 h-3.5 border-slate-300 text-[#009966] focus:ring-[#009966]"
                                />
                                <span className="text-[13px] text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{dateOption}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Salary Slider */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Salary</h3>
                <div className="w-full relative h-1 bg-white dark:bg-slate-700 rounded-full mt-4 mb-2">
                    <div
                        className="absolute h-full bg-[#409e8c] rounded-full"
                        style={{ left: `${(localFilters.salaryRange[0] / 1000000) * 100}%`, right: `${100 - (localFilters.salaryRange[1] / 1000000) * 100}%` }}
                    ></div>
                    <input
                        type="range"
                        min="0"
                        max="1000000"
                        step="1000"
                        value={localFilters.salaryRange[0]}
                        onChange={(e) => {
                            const val = Math.min(Number(e.target.value), localFilters.salaryRange[1] - 1000);
                            setLocalFilters(prev => ({ ...prev, salaryRange: [val, prev.salaryRange[1]] }));
                        }}
                        className="absolute w-full -top-1.5 appearance-none bg-transparent outline-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-[#409e8c] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20"
                    />
                    <input
                        type="range"
                        min="0"
                        max="1000000"
                        step="1000"
                        value={localFilters.salaryRange[1]}
                        onChange={(e) => {
                            const val = Math.max(Number(e.target.value), localFilters.salaryRange[0] + 1000);
                            setLocalFilters(prev => ({ ...prev, salaryRange: [prev.salaryRange[0], val] }));
                        }}
                        className="absolute w-full -top-1.5 appearance-none bg-transparent outline-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-[#409e8c] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20"
                    />
                </div>
                <div className="flex items-center justify-between mt-3 px-1">
                    <span className="text-[12px] font-bold text-slate-800 dark:text-slate-300">
                        ₹{localFilters.salaryRange[0].toLocaleString()} - ₹{localFilters.salaryRange[1].toLocaleString()}
                    </span>
                </div>
            </div>



            {/* Action Buttons */}
            <div className="mt-8 pt-4 border-t border-emerald-100 dark:border-emerald-900/30 flex flex-col gap-3">
                <button
                    onClick={handleApply}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#409e8c] hover:bg-[#328575] text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                >
                    <Filter size={16} /> Apply Filters
                </button>
                <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-[#16181d] hover:bg-slate-50 dark:hover:bg-[#1f2229] border border-slate-200 dark:border-[#303340] text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg transition-colors"
                >
                    <RotateCcw size={16} /> Reset
                </button>
            </div>

        </div>
    );
};

export default JobFilterSidebar;
