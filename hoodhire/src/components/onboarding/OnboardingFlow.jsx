import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
    User, 
    BookOpen, 
    Target, 
    Briefcase, 
    Clock, 
    Camera, 
    CheckCircle2, 
    ArrowRight, 
    ArrowLeft, 
    Sparkles,
    Save
} from 'lucide-react';

import { seekerAPI } from '../../api/seeker';

import BasicInfoForm from '../profile/BasicInfoForm';
import EducationForm from '../profile/EducationForm';
import CategoriesForm from '../profile/CategoriesForm';
import ExperienceForm from '../profile/ExperienceForm';
import WorkPreferencesForm from '../profile/WorkPreferencesForm';
import ProfilePictureStep from './ProfilePictureStep';

const OnboardingFlow = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (user.role !== 'seeker') {
            navigate('/');
        }
    }, [user, navigate]);

    // Initial Form State
    const [formData, setFormData] = useState({
        full_name: user?.username || '',
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
        interested_categories: [],
        profile_picture_url: '',
        ProfilePicture: null
    });

    const [experiences, setExperiences] = useState([]);
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

    const [formErrors, setFormErrors] = useState({});

    // Necessary for forms
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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

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
    };

    const steps = [
        { id: 1, title: 'Personal', icon: <User size={20} />, description: 'Basic details' },
        { id: 2, title: 'Education', icon: <BookOpen size={20} />, description: 'Academic background' },
        { id: 3, title: 'Interests', icon: <Target size={20} />, description: 'Job categories' },
        { id: 4, title: 'Experience', icon: <Briefcase size={20} />, description: 'Past work' },
        { id: 5, title: 'Schedule', icon: <Clock size={20} />, description: 'Work preferences' },
        { id: 6, title: 'Photo', icon: <Camera size={20} />, description: 'Profile picture' },
        { id: 7, title: 'Finish', icon: <CheckCircle2 size={20} />, description: 'Finalize profile' }
    ];

    const validateStep = () => {
        const errors = {};
        if (currentStep === 1) {
            if (!formData.full_name) errors.full_name = 'Required';
            if (!formData.age) errors.age = 'Required';
            if (!formData.gender) errors.gender = 'Required';
            if (!formData.phone_number) errors.phone_number = 'Required';
            if (!formData.current_status) errors.current_status = 'Required';
            if (!formData.locality) errors.locality = 'Required';
            if (!formData.current_address) errors.current_address = 'Required';
        } else if (currentStep === 2) {
            if (!formData.field_of_study) errors.field_of_study = 'Required';
            if (!formData.course_name) errors.course_name = 'Required';
            if (!formData.institute_name) errors.institute_name = 'Required';
            if (!formData.start_year) errors.start_year = 'Required';
        } else if (currentStep === 3) {
            if (formData.interested_categories.length === 0) {
                toast.error("Please select at least one category");
                return false;
            }
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const nextStep = () => {
        if (validateStep()) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            toast.error("Please fill in all required fields.");
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            // 1. Setup Base Profile (Basic Info, Education, Interests)
            const getCategoryId = (catName) => {
                const index = availableCategories.findIndex(c => c.name === catName);
                return index !== -1 ? index + 1 : 0;
            };

            const categoryIds = formData.interested_categories.map(getCategoryId).filter(id => id > 0);

            const payload = {
                ...formData,
                age: Number(formData.age),
                start_year: Number(formData.start_year),
                graduation_year: formData.graduation_year ? Number(formData.graduation_year) : 0,
                category_ids: categoryIds,
                bio: formData.bio || '',
                about: formData.about || ''
            };

            await seekerAPI.setupSeekerProfile(payload);

            // 2. Add Work Experiences sequentially
            if (experiences.length > 0) {
                for (const exp of experiences) {
                    await seekerAPI.addWorkExperience({
                        company_name: exp.company_name,
                        position: exp.position,
                        duration: exp.duration,
                        is_current_job: exp.is_current_job,
                        description: exp.description
                    });
                }
            }

            // 3. Setup Work Preferences
            await seekerAPI.updateWorkPreference(workPreference);

            // 4. Upload Profile Picture if exists
            if (formData.ProfilePicture instanceof File) {
                const picData = new FormData();
                picData.append('image', formData.ProfilePicture);
                await seekerAPI.uploadProfilePicture(picData);
            }

            toast.success("Welcome aboard! Your profile is ready.");
            navigate('/seeker');
        } catch (err) {
            toast.error(err.message || "Failed to finalize profile. Please try again.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Sub-component state for Step 4
    const [isAddingInWizard, setIsAddingInWizard] = useState(false);
    const [tempExp, setTempExp] = useState({
        company_name: '', position: '', duration: '', is_current_job: false, description: ''
    });

    const addExpToWizard = () => {
        if (!tempExp.company_name || !tempExp.position || !tempExp.duration) {
            toast.error("Please fill in Company, Position, and Duration.");
            return;
        }
        setExperiences([...experiences, { ...tempExp, id: Date.now() }]);
        setTempExp({ company_name: '', position: '', duration: '', is_current_job: false, description: '' });
        setIsAddingInWizard(false);
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <BasicInfoForm formData={formData} handleInputChange={handleInputChange} formErrors={formErrors} />;
            case 2:
                return <EducationForm formData={formData} handleInputChange={handleInputChange} formErrors={formErrors} />;
            case 3:
                return <CategoriesForm availableCategories={availableCategories} formData={formData} toggleCategory={toggleCategory} formErrors={formErrors} />;
            case 4:
                return (
                    <div className="space-y-6">
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20 mb-6 font-medium text-emerald-800 dark:text-emerald-300 text-sm">
                            Show off your professional journey! You can skip this if you're a fresher.
                        </div>
                        <ExperienceForm 
                            experiences={experiences} 
                            isAddingExperience={isAddingInWizard}
                            setIsAddingExperience={setIsAddingInWizard} 
                            newExperience={tempExp} 
                            setNewExperience={setTempExp} 
                            handleAddExperience={addExpToWizard}
                            removeExperience={(idx) => setExperiences(experiences.filter((_, i) => i !== idx))}
                        />
                    </div>
                );
            case 5:
                return (
                    <WorkPreferencesForm 
                        workPreference={workPreference}
                        timeSlots={['morning', 'afternoon', 'evening', 'night', 'flexible']}
                        daysOfWeek={[
                            { key: 'sunday', label: 'Sun' },
                            { key: 'monday', label: 'Mon' },
                            { key: 'tuesday', label: 'Tue' },
                            { key: 'wednesday', label: 'Wed' },
                            { key: 'thursday', label: 'Thu' },
                            { key: 'friday', label: 'Fri' },
                            { key: 'saturday', label: 'Sat' },
                        ]}
                        hasExistingPreference={false}
                        isEditingPreference={true}
                        setIsEditingPreference={() => {}}
                        handlePreferenceSubmit={() => {}} // Handled in final submit
                        isSubmittingPreference={false}
                        toggleWorkDay={(day) => setWorkPreference(prev => ({ ...prev, [day]: !prev[day] }))}
                        setWorkPreference={setWorkPreference}
                    />
                );
            case 6:
                return <ProfilePictureStep formData={formData} setFormData={setFormData} />;
            case 7:
                return (
                    <div className="text-center py-12 animate-fade-in">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles size={40} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">You're all set!</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-8">
                            Review your information and click finish to complete your profile and start applying for local jobs nearby.
                        </p>
                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left bg-slate-50 dark:bg-[#1a1d24] p-6 rounded-2xl border border-slate-200 dark:border-[#303340]">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Name</div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{formData.full_name}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Role</div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">Seeker</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{formData.current_status}</div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] flex flex-col items-center justify-center font-sans py-12 px-4 selection:bg-emerald-500/30">
            {/* Ambient Background Lights */}
            <div className="fixed top-0 left-0 -z-10 w-[600px] h-[600px] bg-emerald-100/40 dark:bg-emerald-900/10 blur-[120px] rounded-full opacity-60"></div>
            <div className="fixed bottom-0 right-0 -z-10 w-[500px] h-[500px] bg-emerald-400/10 dark:bg-emerald-800/5 blur-[100px] rounded-full opacity-40"></div>

            <div className="w-full max-w-4xl relative z-10">
                {/* Header */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="text-3xl font-black tracking-tight mb-4">
                        <span className="text-emerald-600 dark:text-emerald-500">Hood</span><span className="text-slate-900 dark:text-white">Hire</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Complete your profile</h1>
                    <p className="text-slate-500 dark:text-slate-400">Step {currentStep} of {steps.length} • {steps[currentStep-1].title}</p>
                </div>

                {/* Progress Steps for Desktop */}
                <div className="hidden lg:flex justify-between items-center mb-12 px-4 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-[#303340] -z-10 -translate-y-1/2"></div>
                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                currentStep === step.id 
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-110' 
                                : currentStep > step.id
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 text-emerald-600'
                                : 'bg-white dark:bg-[#1a1d24] border-slate-200 dark:border-[#303340] text-slate-400'
                            }`}>
                                {currentStep > step.id ? <CheckCircle2 size={20} /> : step.icon}
                            </div>
                            <div className="flex flex-col items-center">
                                <span className={`text-xs font-bold uppercase tracking-wider ${currentStep === step.id ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {step.title}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Simple Progress */}
                <div className="lg:hidden w-full bg-slate-200 dark:bg-[#303340] h-1.5 rounded-full mb-8 overflow-hidden">
                    <div 
                        className="h-full bg-emerald-600 transition-all duration-500 ease-out"
                        style={{ width: `${(currentStep / steps.length) * 100}%` }}
                    ></div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white/95 dark:bg-[#16181d]/95 backdrop-blur-xl rounded-3xl premium-shadow border border-slate-200/50 dark:border-[#262933]/50 p-6 sm:p-10 min-h-[500px] flex flex-col justify-between overflow-visible relative isolate">
                    
                    <div className="animate-fade-in-up">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {steps[currentStep-1].icon}
                                {steps[currentStep-1].title} Details
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{steps[currentStep-1].description}</p>
                        </div>

                        {renderStepContent()}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between gap-4 mt-12 pt-8 border-t border-slate-200/80 dark:border-[#303340]">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 1 || isSubmitting}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                                currentStep === 1 
                                ? 'opacity-0 pointer-events-none' 
                                : 'bg-slate-100 dark:bg-[#1a1d24] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                        >
                            <ArrowLeft size={18} /> Back
                        </button>

                        <div className="flex items-center gap-4">
                            {(currentStep === 4 || currentStep === 6) && (
                                <button
                                    onClick={nextStep}
                                    disabled={isSubmitting}
                                    className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors px-4"
                                >
                                    Skip for now
                                </button>
                            )}

                            {currentStep < steps.length ? (
                                <button
                                    onClick={nextStep}
                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                >
                                    Continue <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleFinalSubmit}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-12 py-3 rounded-xl font-black text-sm transition-all shadow-xl shadow-emerald-500/30 premium-glow"
                                >
                                    {isSubmitting ? (
                                        <>Finishing Up...</>
                                    ) : (
                                        <>Finish and Start Working <Save size={18} /></>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs text-slate-400 font-medium">
                    Your progress is saved automatically. You can always edit your profile later.
                </p>
            </div>
        </div>
    );
};

export default OnboardingFlow;
