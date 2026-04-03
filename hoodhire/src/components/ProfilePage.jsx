import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Save, MapPin, Briefcase, Calendar, Phone, Mail, CheckCircle2, Plus, Edit3, Clock, Trash2, X, Building2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { seekerAPI } from '../api/seeker';
import { chatAPI } from '../api/chat';
import Footer from './Footer';
import GlobalNavbar from './GlobalNavbar';

// Extracted Components
import BasicInfoForm from './profile/BasicInfoForm';
import EducationForm from './profile/EducationForm';
import CategoriesForm from './profile/CategoriesForm';
import ExperienceForm from './profile/ExperienceForm';
import WorkPreferencesForm from './profile/WorkPreferencesForm';

import ProfileHeaderView from './profile/ProfileHeaderView';
import WorkPreferencesView from './profile/WorkPreferencesView';
import EducationView from './profile/EducationView';
import CategoriesView from './profile/CategoriesView';
import ExperienceView from './profile/ExperienceView';
import SupportTickets from './seeker/SupportTickets';
import SavedJobs from './seeker/SavedJobs';
import FavoriteBusinesses from './seeker/FavoriteBusinesses';

const ProfilePage = () => {
    const navigate = useNavigate();

    // In a real app, this would use context or a store, but here we read directly from local storage for MVP
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const [isEditing, setIsEditing] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeProfileTab, setActiveProfileTab] = useState('profile'); // 'profile' or 'support'

    // Work Preference States
    const daysOfWeek = [
        { key: 'sunday', label: 'Sun' },
        { key: 'monday', label: 'Mon' },
        { key: 'tuesday', label: 'Tue' },
        { key: 'wednesday', label: 'Wed' },
        { key: 'thursday', label: 'Thu' },
        { key: 'friday', label: 'Fri' },
        { key: 'saturday', label: 'Sat' },
    ];
    const timeSlots = ['morning', 'afternoon', 'evening', 'night', 'flexible'];

    const [workPreference, setWorkPreference] = useState({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
        preferred_shift: 'morning',
        part_time: false,
        full_time: true,
        immediate: false
    });

    // Work Preference Identity & Edit Toggle
    const [hasExistingPreference, setHasExistingPreference] = useState(false);
    const [isEditingPreference, setIsEditingPreference] = useState(false);
    const [isSubmittingPreference, setIsSubmittingPreference] = useState(false);

    // Experience States
    const [experiences, setExperiences] = useState([]);
    const [isAddingExperience, setIsAddingExperience] = useState(false);
    const [newExperience, setNewExperience] = useState({
        company_name: '',
        position: '',
        duration: '',
        is_current_job: false,
        description: ''
    });

    // Profile Identity State
    const [hasExistingProfile, setHasExistingProfile] = useState(false);

    const toggleWorkDay = (dayKey) => {
        setWorkPreference(prev => ({
            ...prev,
            [dayKey]: !prev[dayKey]
        }));
    };

    const handlePreferenceSubmit = async () => {
        setIsSubmittingPreference(true);
        try {
            await seekerAPI.updateWorkPreference(workPreference);
            toast.success("Work preferences saved successfully!");
            setHasExistingPreference(true);
            setIsEditingPreference(false);
        } catch (err) {
            toast.error(err.message || 'Failed to save work preferences.');
        } finally {
            setIsSubmittingPreference(false);
        }
    };

    const availableCategories = [
        { name: "retail_sales", displayName: "Retail and Sales" },
        { name: "food_beverage", displayName: "Food and Beverage" },
        { name: "personal_services", displayName: "Personal Services" },
        { name: "education_tutoring", displayName: "Education and Tutoring" },
        { name: "creative_digital", displayName: "Creative and Digital Work" },
        { name: "home_based", displayName: "Home Based Works" },
        { name: "logistics_delivery", displayName: "Logistics and Delivery" },
        { name: "repair_maintenance", displayName: "Repair and Maintenance" },
        { name: "health_wellness", displayName: "Health and Wellness" },
        { name: "events_entertainment", displayName: "Events and Entertainment" }
    ];

    const toggleCategory = (catName) => {
        setFormData(prev => {
            const current = prev.interested_categories || [];
            if (current.includes(catName)) {
                return { ...prev, interested_categories: current.filter(c => c !== catName) };
            } else {
                if (current.length >= 5) {
                    toast.error("You can select up to 5 categories max.");
                    return prev;
                }
                return { ...prev, interested_categories: [...current, catName] };
            }
        });
        if (formErrors.interested_categories) {
            setFormErrors(prev => ({ ...prev, interested_categories: '' }));
        }
    };

    const [formData, setFormData] = useState({
        full_name: '',
        age: '',
        gender: '',
        phone_number: '',
        current_status: '',
        bio: '',
        current_address: '',
        locality: '',
        field_of_study: '',
        course_name: '',
        institute_name: '',
        start_year: '',
        graduation_year: '',
        is_ongoing: false,
        about: '',
        interested_categories: [],
        profile_picture_url: '',
        ProfilePicture: ''
    });
    const [formErrors, setFormErrors] = useState({});

    const fetchProfile = async () => {
        if (user?.role === 'seeker') {
            try {
                const response = await seekerAPI.getSeekerProfile();

                const p = response?.profile || response?.seeker || response;
                if (p && Object.keys(p).length > 0 && p.ID) {
                    setFormData({
                        full_name: p.FullName || p.full_name || '',
                        age: p.Age || '',
                        gender: p.Gender || '',
                        phone_number: p.PhoneNumber || '',
                        current_status: p.CurrentStatus || p.current_status || '',
                        bio: p.Bio || p.bio || '',
                        about: p.Bio || p.bio || p.About || p.about || '',
                        current_address: p.CurrentAddress || p.current_address || '',
                        locality: p.Locality || p.locality || '',
                        profile_picture_url: p.ProfilePicture || p.profile_picture || p.ProfilePictureUrl || p.profile_picture_url || '',
                        ProfilePicture: p.ProfilePicture || p.profile_picture || '',
                        field_of_study: p.Education?.FieldOfStudy || '',
                        course_name: p.Education?.CourseName || '',
                        institute_name: p.Education?.InstituteName || '',
                        start_year: p.Education?.StartYear || '',
                        graduation_year: p.Education?.GraduationYear || '',
                        is_ongoing: p.Education?.IsOngoing || false,
                        interested_categories: (p.JobInterests || p.job_interests) ? (p.JobInterests || p.job_interests).map(ji => {
                            const cat = ji.Category || ji.category;
                            return cat ? (cat.Name || cat.name) : null;
                        }).filter(Boolean) : (p.InterestedCategories || p.interested_categories || [])
                    });
                    if (p.WorkExperiences) {
                        setExperiences(p.WorkExperiences.map(ex => ({
                            id: ex.ID || ex.id,
                            company_name: ex.CompanyName || ex.company_name || '',
                            position: ex.Position || '',
                            duration: ex.Duration || '',
                            is_current_job: ex.IsCurrentJob || false,
                            description: ex.Description || ''
                        })));
                    }
                    setHasExistingProfile(true);
                    if (p.IsCompleted) {
                        setIsEditing(false);
                    }
                } else {
                    console.log("Response did not contain a valid profile payload.");
                    setHasExistingProfile(false);
                }

                // Fetch Work Preferences
                try {
                    const prefResponse = await seekerAPI.getWorkPreference();
                    console.log("Fetched Work Preferences:", prefResponse);
                    const prefData = prefResponse?.preference || prefResponse?.data || prefResponse; // Handle nested variations
                    if (prefData && Object.keys(prefData).length > 0) {
                        setWorkPreference({
                            monday: !!(prefData.monday || prefData.Monday),
                            tuesday: !!(prefData.tuesday || prefData.Tuesday),
                            wednesday: !!(prefData.wednesday || prefData.Wednesday),
                            thursday: !!(prefData.thursday || prefData.Thursday),
                            friday: !!(prefData.friday || prefData.Friday),
                            saturday: !!(prefData.saturday || prefData.Saturday),
                            sunday: !!(prefData.sunday || prefData.Sunday),
                            preferred_shift: prefData.preferred_shift || prefData.PreferredShift || 'morning',
                            part_time: !!(prefData.part_time || prefData.PartTime),
                            full_time: !!(prefData.full_time || prefData.FullTime),
                            immediate: !!(prefData.immediate || prefData.Immediate)
                        });
                        setHasExistingPreference(true);
                    }
                } catch (err) {
                    console.log("No existing work preferences found.", err);
                    setHasExistingPreference(false);
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user?.role]);

    const handleAddExperience = async () => {
        if (!newExperience.company_name || !newExperience.position || !newExperience.duration) {
            toast.error("Please fill in Company, Position, and Duration.");
            return;
        }
        try {
            const res = await seekerAPI.addWorkExperience(newExperience);
            const expWithId = {
                id: res?.ID || res?.id || res?.experience?.ID || Date.now(),
                ...newExperience
            };
            setExperiences([...experiences, expWithId]);
            setNewExperience({
                company_name: '', position: '', duration: '', is_current_job: false, description: ''
            });
            setIsAddingExperience(false);
            toast.success("Experience added successfully");
        } catch (err) {
            toast.error(err.message || 'Failed to add experience.');
        }
    };

    const removeExperience = async (index, expId) => {
        if (!expId) {
            setExperiences(experiences.filter((_, i) => i !== index));
            return;
        }
        try {
            await seekerAPI.deleteWorkExperience(expId);
            setExperiences(experiences.filter((_, i) => i !== index));
            toast.success("Experience deleted successfully");
        } catch (err) {
            toast.error(err.message || 'Failed to delete experience.');
        }
    };

    const handleLogout = () => {
        chatAPI.disconnectWebSocket();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        toast.success("Successfully logged out!");
        navigate('/');
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // clear error when user types
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = [
            'full_name', 'age', 'gender', 'phone_number', 'current_status',
            'current_address', 'locality', 'field_of_study', 'course_name',
            'institute_name', 'start_year'
        ];

        requiredFields.forEach(field => {
            if (!formData[field] || String(formData[field]).trim() === '') {
                newErrors[field] = 'Required';
            }
        });

        if (formData.age && isNaN(Number(formData.age))) newErrors.age = 'Must be a number';
        if (formData.start_year && isNaN(Number(formData.start_year))) newErrors.start_year = 'Invalid year';

        if (!formData.is_ongoing && formData.graduation_year) {
            if (isNaN(Number(formData.graduation_year))) {
                newErrors.graduation_year = 'Invalid year';
            }
        }

        const categories = formData.interested_categories || [];
        if (categories.length < 1) {
            newErrors.interested_categories = 'Please select at least 1 category.';
        } else if (categories.length > 5) {
            newErrors.interested_categories = 'You can select up to 5 categories max.';
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fill in all required fields correctly.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Map selected category names to their respective integer IDs based on availableCategories index (1-based from backend example)
            const getCategoryId = (catName) => {
                const index = availableCategories.findIndex(c => c.name === catName);
                return index !== -1 ? index + 1 : 0; // Assuming backend IDs match index + 1 exactly for the 10 categories
            };

            const categoryIds = (formData.interested_categories || [])
                .map(getCategoryId)
                .filter(id => id > 0);

            const payload = {
                ...formData,
                age: Number(formData.age),
                gender: formData.gender, // Ensuring Gender maps
                bio: formData.about || '', // Backend expects 'bio'
                about: formData.about || '', // Fallback for 'about'
                start_year: Number(formData.start_year),
                graduation_year: formData.graduation_year ? Number(formData.graduation_year) : 0,
                work_experiences: experiences,
                category_ids: categoryIds
            };

            if (user?.role === 'seeker') {
                let response;
                if (hasExistingProfile) {
                    response = await seekerAPI.updateSeekerProfile(payload);
                    toast.success("Profile updated successfully!");
                } else {
                    response = await seekerAPI.setupSeekerProfile(payload);
                    toast.success("Profile setup successfully completed!");
                    setHasExistingProfile(true); // Now we have one
                }

                if (response?.profile?.IsCompleted) {
                    setIsEditing(false); // Switch to Read-only mode
                } else {
                    setIsEditing(false); // Fallback assumption
                }
            } else {
                toast.error("Hirer profile setup is not yet implemented.");
            }
        } catch (err) {
            toast.error(err.message || 'Failed to setup profile.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f1115] p-6 text-slate-800 dark:text-slate-200">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">You are not logged in</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-orange-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-700 transition"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-[#f8fafc] font-sans pb-12 relative overflow-hidden">
            <GlobalNavbar />

            {/* Premium Gradient Banner */}
            {/* <div className="h-48 w-full bg-[linear-gradient(to_right,rgba(0,153,102,0.1),rgba(0,136,85,0.1),rgba(0,119,68,0.1))] dark:bg-[linear-gradient(to_right,rgba(0,153,102,0.05),rgba(0,136,85,0.05),rgba(0,119,68,0.05))] relative top-0 left-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-white/30 dark:bg-[#0f1115]/80 backdrop-blur-3xl"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.02]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-[#0f1115] to-transparent"></div>
            </div> */}

            <main className="max-w-[1200px] mx-auto pt-20 px-4 sm:px-6 relative z-10 pb-16">

                {/* Return to Dashboard Button - Minimal Style */}
                <div className="w-full relative z-20 mt-6 mb-4">
                    <button
                        onClick={() => navigate('/seeker')}
                        className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} className="text-slate-500 dark:text-slate-400" /> Back to dashboard
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Left Column (1/3) */}
                    {/* The specific layout is now applied to the main content container instead of splitting here */}

                    {/* Right Column (2/3) */}
                    <div className="w-full relative z-20 mt-0 gap-6 flex flex-col">
                        {user?.role !== 'seeker' ? (
                            <div className="bg-white/90 dark:bg-[#16181d]/90 backdrop-blur-md rounded-xl premium-shadow border border-white/50 dark:border-[#262933]/50 p-8 text-center">
                                <h2 className="text-xl font-bold mb-4">Complete Your Setup</h2>
                                <p className="text-slate-600 dark:text-[#94a3b8] mb-6 text-sm leading-relaxed max-w-md mx-auto">
                                    Setup your hirer profile to start posting jobs and viewing available local talent in your neighborhood.
                                </p>
                                <button className="bg-gradient-to-r from-[#009966] to-[#008855] hover:from-[#008855] hover:to-[#007744] text-white font-extrabold py-3 px-8 rounded-md flex items-center justify-center gap-2 transition-all shadow-md mx-auto premium-glow transform hover:-translate-y-1 hover:shadow-[#009966]/30">
                                    <Settings size={18} /> Setup Hirer Profile
                                </button>
                            </div>
                        ) : !hasExistingProfile && !isEditing ? (
                            // Empty State / Setup Prompt
                            <div className="bg-white/90 dark:bg-[#16181d]/90 backdrop-blur-md rounded-xl premium-shadow border border-white/50 dark:border-[#262933]/50 p-8 text-center max-w-2xl mx-auto w-full mt-4 flex flex-col items-center justify-center min-h-[300px]">
                                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">Welcome to your Profile!</h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">You haven't set up your Seeker profile yet. Add your details to start applying for local jobs.</p>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-[#009966] hover:bg-[#008855] text-white px-8 py-3 rounded-md font-bold transition-all shadow-md flex items-center gap-2"
                                >
                                    <Settings size={18} /> Setup Profile Now
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="mt-4 text-sm font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    I'll do this later
                                </button>
                            </div>
                        ) : isEditing ? (
                            // Form Mode
                            <form onSubmit={handleProfileSubmit} className="bg-white/90 dark:bg-[#16181d]/90 backdrop-blur-xl rounded-xl premium-shadow border border-white/50 dark:border-[#262933]/50 p-4 sm:p-5 space-y-4 animate-fade-in relative z-20">

                                <div className="flex flex-col mb-2">
                                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                        {hasExistingProfile ? 'Edit Profile' : 'Setup Profile'}
                                    </h2>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Keep your details up to date to stand out.</p>
                                </div>

                                {/* Squeezed Row: Basic Info and Education side-by-side */}
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                                    <BasicInfoForm
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                        formErrors={formErrors}
                                    />

                                    <EducationForm
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                        formErrors={formErrors}
                                    />

                                </div>

                                <CategoriesForm
                                    availableCategories={availableCategories}
                                    formData={formData}
                                    toggleCategory={toggleCategory}
                                    formErrors={formErrors}
                                />

                                <ExperienceForm
                                    experiences={experiences}
                                    isAddingExperience={isAddingExperience}
                                    setIsAddingExperience={setIsAddingExperience}
                                    newExperience={newExperience}
                                    setNewExperience={setNewExperience}
                                    handleAddExperience={handleAddExperience}
                                    removeExperience={removeExperience}
                                />

                                {/* Full-width Bottom Save Button */}
                                <div className="pt-4 border-t border-slate-200 dark:border-[#262933]">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[#009966] hover:bg-[#008855] text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold py-3 px-6 rounded-md flex items-center justify-center gap-2 transition-all shadow-sm"
                                    >
                                        <Save size={18} /> {isSubmitting ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>

                            </form>
                        ) : (
                            // Custom Required Read-Only Display Mode
                            <div className="animate-fade-in relative z-20 flex flex-col gap-4">

                                <ProfileHeaderView
                                    formData={formData}
                                    user={user}
                                    setIsEditing={setIsEditing}
                                    handleLogout={handleLogout}
                                    workPreference={workPreference}
                                    hasExistingProfile={hasExistingProfile}
                                    onRefresh={fetchProfile}
                                />



                                {/* Navigation Tabs */}
                                <div className="w-full flex border-b border-slate-200 dark:border-[#303340] mb-6 px-2 mt-4">
                                    <button
                                        onClick={() => setActiveProfileTab('profile')}
                                        className={`pb-3 text-[14px] px-4 bg-transparent border-none font-extrabold transition-all relative ${activeProfileTab === 'profile' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        Profile Overview
                                        {activeProfileTab === 'profile' && <div className="absolute bottom-[-1.5px] left-0 w-full h-[2.5px] bg-[#009966] rounded-t-sm"></div>}
                                    </button>
                                    <button
                                        onClick={() => setActiveProfileTab('support')}
                                        className={`pb-3 text-[14px] px-4 bg-transparent border-none font-extrabold transition-all relative ${activeProfileTab === 'support' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        Support & Tickets
                                        {activeProfileTab === 'support' && <div className="absolute bottom-[-1.5px] left-0 w-full h-[2.5px] bg-[#009966] rounded-t-sm"></div>}
                                    </button>
                                    <button
                                        onClick={() => setActiveProfileTab('saved_jobs')}
                                        className={`pb-3 text-[14px] px-4 bg-transparent border-none font-extrabold transition-all relative ${activeProfileTab === 'saved_jobs' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        Saved Jobs
                                        {activeProfileTab === 'saved_jobs' && <div className="absolute bottom-[-1.5px] left-0 w-full h-[2.5px] bg-[#009966] rounded-t-sm"></div>}
                                    </button>
                                    <button
                                        onClick={() => setActiveProfileTab('favorites')}
                                        className={`pb-3 text-[14px] px-4 bg-transparent border-none font-extrabold transition-all relative ${activeProfileTab === 'favorites' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        Favorite Companies
                                        {activeProfileTab === 'favorites' && <div className="absolute bottom-[-1.5px] left-0 w-full h-[2.5px] bg-[#009966] rounded-t-sm"></div>}
                                    </button>
                                </div>

                                {activeProfileTab === 'profile' ? (
                                    /* 3-Column Lower Layout */
                                    <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-6 items-start mt-2">
                                        {/* Left Column: Education (Websites counterpart) */}
                                        <div className="w-full">
                                            <EducationView formData={formData} />
                                        </div>

                                        {/* Center Column: Combined Block (About, Skills, Experience) */}
                                        <div className="w-full bg-white/95 dark:bg-[#16181d]/95 backdrop-blur-xl rounded-sm premium-shadow border border-slate-200/50 dark:border-[#262933]/50 p-4 sm:p-5 flex flex-col">

                                            {/* ABOUT SECTION */}
                                            <div className="pb-5 border-b border-slate-200/50 dark:border-[#262933]/50">
                                                <h3 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                                                    About
                                                </h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed min-h-[80px]">
                                                    {formData.about ? (
                                                        formData.about.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br /></React.Fragment>)
                                                    ) : (
                                                        'No additional information provided.'
                                                    )}
                                                </p>
                                            </div>

                                            <div className="py-5 border-b border-slate-200/50 dark:border-[#262933]/50">
                                                <CategoriesView formData={formData} availableCategories={availableCategories} />
                                            </div>

                                            <div className="pt-5">
                                                <ExperienceView experiences={experiences} />
                                            </div>

                                        </div>

                                        {/* Right Column: Work Preferences */}
                                        <div className="w-full">
                                            <WorkPreferencesForm
                                                workPreference={workPreference}
                                                timeSlots={timeSlots}
                                                daysOfWeek={daysOfWeek}
                                                hasExistingPreference={hasExistingPreference}
                                                isEditingPreference={isEditingPreference}
                                                setIsEditingPreference={setIsEditingPreference}
                                                handlePreferenceSubmit={handlePreferenceSubmit}
                                                isSubmittingPreference={isSubmittingPreference}
                                                toggleWorkDay={toggleWorkDay}
                                                setWorkPreference={setWorkPreference}
                                            />
                                        </div>
                                    </div>
                                ) : activeProfileTab === 'support' ? (
                                    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <SupportTickets />
                                    </div>
                                ) : activeProfileTab === 'saved_jobs' ? (
                                    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <SavedJobs />
                                    </div>
                                ) : (
                                    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <FavoriteBusinesses />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProfilePage;
