import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Briefcase, Calendar, DollarSign, User, Plus } from 'lucide-react';
import { jobsAPI } from '../../api/jobs';
import toast from 'react-hot-toast';

const PostJobModal = ({ isOpen, onClose, onJobPosted, editingJob = null }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        category_id: '',
        title: '',
        description: '',
        job_type: 'part_time',
        shift: 'flexible',
        duration: '',
        salary_min: '',
        salary_max: '',
        salary_type: 'hourly',
        min_age: 18,
        max_age: 60,
        gender_pref: 'any',
        experience_required: false,
        friday: false, saturday: false, sunday: false,
        deadline: '',
        key_responsibilities: [],
        skills: []
    });

    const [newResponsibility, setNewResponsibility] = useState('');
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await jobsAPI.getCategories();
                if (res?.categories) {
                    setCategories(res.categories);
                }
            } catch (err) {
                console.error("Failed to fetch categories:", err);
                toast.error("Failed to load job categories");
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (editingJob && isOpen) {
            setFormData({
                category_id: editingJob.CategoryID || '',
                title: editingJob.Description?.Title || '',
                description: editingJob.Description?.Description || '',
                job_type: editingJob.Description?.JobType || 'part_time',
                shift: editingJob.Description?.Shift || 'flexible',
                duration: editingJob.Description?.Duration || '',
                salary_min: editingJob.Description?.SalaryMin || '',
                salary_max: editingJob.Description?.SalaryMax || '',
                salary_type: editingJob.Description?.SalaryType || 'hourly',
                min_age: editingJob.Description?.MinAge || 18,
                max_age: editingJob.Description?.MaxAge || 60,
                gender_pref: editingJob.Description?.GenderPref || 'any',
                experience_required: editingJob.Description?.ExperienceRequired || false,
                monday: editingJob.Description?.Monday || false,
                tuesday: editingJob.Description?.Tuesday || false,
                wednesday: editingJob.Description?.Wednesday || false,
                thursday: editingJob.Description?.Thursday || false,
                friday: editingJob.Description?.Friday || false,
                saturday: editingJob.Description?.Saturday || false,
                sunday: editingJob.Description?.Sunday || false,
                deadline: editingJob.Deadline ? new Date(editingJob.Deadline).toISOString().split('T')[0] : '',
                key_responsibilities: editingJob.Description?.KeyResponsibilities ? [...editingJob.Description.KeyResponsibilities] : [],
                skills: editingJob.Description?.Skills ? [...editingJob.Description.Skills] : []
            });
        } else if (!editingJob && isOpen) {
            // Reset for new creation
            setFormData({
                category_id: categories.length > 0 ? categories[0].ID : '',
                title: '', description: '', job_type: 'part_time', shift: 'flexible', duration: '',
                salary_min: '', salary_max: '', salary_type: 'hourly', min_age: 18, max_age: 60,
                gender_pref: 'any', experience_required: false,
                monday: false, tuesday: false, wednesday: false, thursday: false,
                friday: false, saturday: false, sunday: false, deadline: '',
                key_responsibilities: [], skills: []
            });
            setNewResponsibility('');
            setNewSkill('');
        }
    }, [editingJob, isOpen, categories]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let parsedValue = type === 'checkbox' ? checked : value;

        if (['category_id', 'salary_min', 'salary_max', 'min_age', 'max_age'].includes(name)) {
            parsedValue = value ? Number(value) : '';
        }

        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = { ...formData };
            if (payload.deadline) {
                payload.deadline = new Date(payload.deadline).toISOString();
            } else {
                delete payload.deadline;
            }

            // Clean up any empty items just in case
            payload.key_responsibilities = payload.key_responsibilities.filter(r => r.trim() !== '');
            payload.skills = payload.skills.filter(s => s.trim() !== '');

            if (editingJob) {
                await jobsAPI.updateJob(editingJob.ID, payload);
                toast.success('Job updated successfully!');
            } else {
                await jobsAPI.createJob(payload);
                toast.success('Job posted successfully!');
            }
            onJobPosted();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to save job');
        } finally {
            setLoading(false);
        }
    };

    const addArrayItem = (field, value, setter) => {
        if (!value.trim()) return;
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], value.trim()]
        }));
        setter('');
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleArrayInputKeyDown = (e, field, value, setter) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addArrayItem(field, value, setter);
        }
    };

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-[#16181d] w-full max-w-4xl rounded-lg shadow-xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-3 border-b border-slate-200 dark:border-[#262933] flex justify-between items-center bg-slate-50 dark:bg-[#1a1d24] rounded-t-lg shrink-0">
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        {editingJob ? 'Edit Job Posting' : 'Create New Job Listing'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-200/50 dark:bg-[#262933] hover:bg-slate-200 dark:hover:bg-[#303340] rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto w-full">
                    <form id="jobForm" onSubmit={handleSubmit} className="space-y-5">

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-[#262933] pb-2">
                                <Briefcase size={18} className="text-[#009966]" /> Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title *</label>
                                    <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#1a1d24] text-slate-900 dark:text-white px-4 py-2 rounded-md border border-slate-200 dark:border-[#303340] focus:ring-2 focus:ring-[#009966]/50 focus:border-[#009966] outline-none transition-all" placeholder="e.g. Senior Barista" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                                    <select required name="category_id" value={formData.category_id} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#1a1d24] text-slate-900 dark:text-white px-4 py-2 rounded-md border border-slate-200 dark:border-[#303340] focus:ring-2 focus:ring-[#009966]/50 focus:border-[#009966] outline-none transition-all appearance-none">
                                        <option value="" disabled>Select a category</option>
                                        {categories.map(c => <option key={c.ID} value={c.ID}>{c.DisplayName}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Description *</label>
                                    <textarea required name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-slate-50 dark:bg-[#1a1d24] text-slate-900 dark:text-white px-4 py-2 rounded-md border border-slate-200 dark:border-[#303340] focus:ring-2 focus:ring-[#009966]/50 focus:border-[#009966] outline-none transition-all resize-none" placeholder="Describe the responsibilities and expectations..." />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Key Responsibilities</label>

                                    {formData.key_responsibilities.length > 0 && (
                                        <div className="flex flex-col gap-2 mb-3">
                                            {formData.key_responsibilities.map((resp, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#303340] px-4 py-2 rounded-md">
                                                    <span className="text-sm text-slate-700 dark:text-slate-300">{resp}</span>
                                                    <button type="button" onClick={() => removeArrayItem('key_responsibilities', idx)} className="text-slate-400 hover:text-red-500 transition-colors shrink-0 ml-3">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newResponsibility}
                                            onChange={(e) => setNewResponsibility(e.target.value)}
                                            onKeyDown={(e) => handleArrayInputKeyDown(e, 'key_responsibilities', newResponsibility, setNewResponsibility)}
                                            className="flex-1 bg-slate-50 dark:bg-[#1a1d24] text-slate-900 dark:text-white px-4 py-2 rounded-md border border-slate-200 dark:border-[#303340] focus:ring-2 focus:ring-[#009966]/50 focus:border-[#009966] outline-none transition-all"
                                            placeholder="e.g. Prepare and serve coffee..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addArrayItem('key_responsibilities', newResponsibility, setNewResponsibility)}
                                            className="px-4 py-2 bg-slate-100 dark:bg-[#262933] hover:bg-white dark:hover:bg-[#009966]/10 text-slate-700 hover:text-[#008855] dark:text-slate-300 dark:hover:text-[#3b9f87] font-bold rounded-md border border-slate-200 dark:border-[#303340] transition-colors flex items-center gap-2"
                                        >
                                            <Plus size={18} /> Add
                                        </button>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-3">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Skills & Qualifications</label>

                                    {formData.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {formData.skills.map((skill, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-[#009966]/5 dark:bg-[#009966]/10 text-[#008855] dark:text-[#00cf8a] border border-[#009966]/20 px-3 py-1.5 rounded-lg">
                                                    <span className="text-xs font-bold">{skill}</span>
                                                    <button type="button" onClick={() => removeArrayItem('skills', idx)} className="text-[#008855]/60 hover:text-red-500 dark:text-[#00cf8a]/60 dark:hover:text-red-400 transition-colors">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyDown={(e) => handleArrayInputKeyDown(e, 'skills', newSkill, setNewSkill)}
                                            className="flex-1 bg-slate-50 dark:bg-[#1a1d24] text-slate-900 dark:text-white px-4 py-2 rounded-md border border-slate-200 dark:border-[#303340] focus:ring-2 focus:ring-[#009966]/50 focus:border-[#009966] outline-none transition-all"
                                            placeholder="e.g. Customer service, Basic barista skills..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addArrayItem('skills', newSkill, setNewSkill)}
                                            className="px-4 py-2 bg-slate-100 dark:bg-[#262933] hover:bg-white dark:hover:bg-[#009966]/10 text-slate-700 hover:text-[#008855] dark:text-slate-300 dark:hover:text-[#3b9f87] font-bold rounded-md border border-slate-200 dark:border-[#303340] transition-colors flex items-center gap-2"
                                        >
                                            <Plus size={18} /> Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timing & Type */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-[#262933] pb-2">
                                <Clock size={18} className="text-[#009966]" /> Timing & Type
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Type *</label>
                                    <select required name="job_type" value={formData.job_type} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#1a1d24] text-slate-900 dark:text-white px-4 py-2 rounded-md border border-slate-200 dark:border-[#303340] focus:ring-2 focus:ring-[#009966]/50 focus:border-[#009966] outline-none">
                                        <option value="part_time">Part Time</option>
                                        <option value="full_time">Full Time</option>
                                        <option value="one_time">One-Time Gig</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Shift *</label>
                                    <select required name="shift" value={formData.shift} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#1a1d24] text-slate-900 dark:text-white px-4 py-2 rounded-md border border-slate-200 dark:border-[#303340] focus:ring-2 focus:ring-[#009966]/50 focus:border-[#009966] outline-none">
                                        <option value="flexible">Flexible</option>
                                        <option value="morning">Morning</option>
                                        <option value="afternoon">Afternoon</option>
                                        <option value="evening">Evening</option>
                                        <option value="night">Night</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration *</label>
                                    <input required type="text" name="duration" value={formData.duration} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#1a1d24] text-slate-900 dark:text-white px-4 py-2 rounded-md border border-slate-200 dark:border-[#303340] focus:ring-2 focus:ring-[#009966]/50 focus:border-[#009966] outline-none" placeholder="e.g. 3 months, Ongoing" />
                                </div>
                            </div>
                        </div>

                        {/* Compensation */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-[#262933] pb-2">
                                <DollarSign size={18} className="text-[#009966]" /> Compensation
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Min Salary *</label>
                                    <input required type="number" min="0" name="salary_min" value={formData.salary_min} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#1a1d24] text-slate-900 dark:text-white px-4 py-2 rounded-md border border-slate-200 dark:border-[#303340] focus:ring-2 focus:ring-[#009966]/50 focus:border-[#009966] outline-none" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Salary *</label>
                                    <input required type="number" min={formData.salary_min || 0} name="salary_max" value={formData.salary_max} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#1a1d24] text-slate-900 dark:text-white px-4 py-2 rounded-md border border-slate-200 dark:border-[#303340] focus:ring-2 focus:ring-[#009966]/50 focus:border-[#009966] outline-none" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Pay Period *</label>
                                    <select required name="salary_type" value={formData.salary_type} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#1a1d24] text-slate-900 dark:text-white px-4 py-2 rounded-md border border-slate-200 dark:border-[#303340] focus:ring-2 focus:ring-[#009966]/50 focus:border-[#009966] outline-none">
                                        <option value="hourly">Hourly</option>
                                        <option value="daily">Daily</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Requirements */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-[#262933] pb-2">
                                <User size={18} className="text-[#009966]" /> Candidate Requirements
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Min Age *</label>
                                    <input required type="number" min="16" name="min_age" value={formData.min_age} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#1a1d24] text-slate-900 dark:text-white px-4 py-2 rounded-md border border-slate-200 dark:border-[#303340] focus:ring-2 focus:ring-[#009966]/50 focus:border-[#009966] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Age *</label>
                                    <input required type="number" min={formData.min_age || 18} name="max_age" value={formData.max_age} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#1a1d24] text-slate-900 dark:text-white px-4 py-2 rounded-md border border-slate-200 dark:border-[#303340] focus:ring-2 focus:ring-[#009966]/50 focus:border-[#009966] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                                    <select name="gender_pref" value={formData.gender_pref} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#1a1d24] text-slate-900 dark:text-white px-4 py-2 rounded-md border border-slate-200 dark:border-[#303340] focus:ring-2 focus:ring-[#009966]/50 focus:border-[#009966] outline-none">
                                        <option value="any">Any</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div className="flex items-center mt-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" name="experience_required" checked={formData.experience_required} onChange={handleChange} className="w-5 h-5 text-[#008855] rounded bg-slate-100 border-slate-300 focus:ring-[#009966] dark:bg-[#1a1d24] dark:border-[#303340] accent-[#009966]" />
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Exp. Required</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Schedule & Deadline */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-[#262933] pb-2">
                                <Calendar size={18} className="text-[#009966]" /> Schedule & Deadline
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Expected Working Days</label>
                                    <div className="flex flex-wrap gap-3">
                                        {days.map(day => (
                                            <label key={day} className={`flex items-center justify-center min-w-[3.5rem] px-3 py-1.5 rounded-lg border cursor-pointer select-none transition-all ${formData[day] ? 'bg-white border-[#009966] text-[#009966] shadow-sm font-extrabold dark:bg-[#009966]/20 dark:border-[#3b9f87] dark:text-[#3b9f87]' : 'bg-slate-50 border-transparent text-slate-500 font-semibold hover:bg-slate-100 dark:bg-[#1a1d24] dark:border-[#303340] dark:text-slate-400 dark:hover:bg-[#262933]'}`}>
                                                <input type="checkbox" name={day} checked={formData[day]} onChange={handleChange} className="hidden" />
                                                <span className="text-sm font-bold capitalize">{day.substring(0, 3)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Application Deadline (Optional)</label>
                                    <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#1a1d24] text-slate-900 dark:text-white px-4 py-2 rounded-md border border-slate-200 dark:border-[#303340] focus:ring-2 focus:ring-[#009966]/50 focus:border-[#009966] outline-none" min={new Date().toISOString().split('T')[0]} />
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-200 dark:border-[#262933] bg-slate-50 dark:bg-[#1a1d24] rounded-b-2xl shrink-0 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button type="submit" form="jobForm" disabled={loading} className="px-8 py-2 bg-[#008855] hover:bg-[#007744] text-white text-sm font-extrabold rounded-md transition-all shadow-md shadow-[#008855]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {loading ? <span className="animate-spin text-xl leading-none">⟳</span> : <Save size={18} />}
                        {editingJob ? 'Save Changes' : 'Post Job'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PostJobModal;

