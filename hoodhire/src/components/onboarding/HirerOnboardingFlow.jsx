import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
    User, 
    Building2, 
    MapPin, 
    Globe, 
    Camera, 
    CheckCircle2, 
    ArrowRight, 
    ArrowLeft, 
    Sparkles,
    Save,
    Info
} from 'lucide-react';

import { hirerAPI } from '../../api/hirer';

import { 
    HirerPersonalForm, 
    BusinessCoreForm, 
    BusinessContactForm, 
    BusinessDetailsForm 
} from './HirerInfoForms';
import ProfilePictureStep from './ProfilePictureStep';

const HirerOnboardingFlow = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (user.role !== 'hirer') {
            navigate('/');
        }
    }, [user, navigate]);

    // Initial Form State
    const [formData, setFormData] = useState({
        full_name: user?.username || '',
        phone_number: '',
        business_name: '',
        niche: '',
        employee_count: '1-10',
        business_phone: '',
        business_email: '',
        address: '',
        locality: '',
        city: '',
        established_year: '',
        website: '',
        bio: '',
        profilePictureFile: null
    });

    const [formErrors, setFormErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const steps = [
        { id: 1, title: 'Personal', icon: <User size={20} />, description: 'Representative details' },
        { id: 2, title: 'Business', icon: <Building2 size={20} />, description: 'Core business info' },
        { id: 3, title: 'Contact', icon: <MapPin size={20} />, description: 'Address & contact' },
        { id: 4, title: 'Details', icon: <Info size={20} />, description: 'Bio & website' },
        { id: 5, title: 'Logo', icon: <Camera size={20} />, description: 'Business logo' },
        { id: 6, title: 'Finish', icon: <CheckCircle2 size={20} />, description: 'Finalize profile' }
    ];

    const validateStep = () => {
        const errors = {};
        if (currentStep === 1) {
            if (!formData.full_name) errors.full_name = 'Required';
            if (!formData.phone_number || formData.phone_number.length !== 10) errors.phone_number = 'Valid 10-digit number required';
        } else if (currentStep === 2) {
            if (!formData.business_name) errors.business_name = 'Required';
            if (!formData.niche) errors.niche = 'Required';
        } else if (currentStep === 3) {
            if (!formData.business_phone || formData.business_phone.length !== 10) errors.business_phone = 'Valid 10-digit number required';
            if (!formData.address) errors.address = 'Required';
            if (!formData.locality) errors.locality = 'Required';
            if (!formData.city) errors.city = 'Required';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const nextStep = () => {
        if (validateStep()) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            toast.error("Please fill in all required fields correctly.");
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            // 1. Setup Hirer Profile
            const { profilePictureFile, ...cleanFormData } = formData;
            const payload = {
                ...cleanFormData,
                established_year: formData.established_year ? Number(formData.established_year) : 0
            };

            await hirerAPI.setupHirerProfile(payload);

            // 2. Upload Profile Picture / Logo if exists
            if (formData.profilePictureFile instanceof File) {
                const picData = new FormData();
                picData.append('image', formData.profilePictureFile);
                await hirerAPI.uploadProfilePicture(picData);
            }

            toast.success("Welcome! Your business profile is ready.");
            navigate('/hirer');
        } catch (err) {
            toast.error(err.message || "Failed to finalize profile. Please try again.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <HirerPersonalForm formData={formData} handleInputChange={handleInputChange} formErrors={formErrors} />;
            case 2:
                return <BusinessCoreForm formData={formData} handleInputChange={handleInputChange} formErrors={formErrors} />;
            case 3:
                return <BusinessContactForm formData={formData} handleInputChange={handleInputChange} formErrors={formErrors} />;
            case 4:
                return <BusinessDetailsForm formData={formData} handleInputChange={handleInputChange} formErrors={formErrors} />;
            case 5:
                return (
                    <ProfilePictureStep 
                        formData={{ ...formData, ProfilePicture: formData.profilePictureFile }} 
                        setFormData={(updateFn) => {
                            const newVal = typeof updateFn === 'function' ? updateFn(formData) : updateFn;
                            setFormData(prev => ({
                                ...prev,
                                profilePictureFile: newVal.ProfilePicture
                            }));
                        }} 
                        label="Upload Business Logo" 
                    />
                );
            case 6:
                return (
                    <div className="text-center py-12 animate-fade-in">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles size={40} className="text-[#134074] dark:text-blue-400 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Ready to post jobs?</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-8">
                            Review your information and click finish to start connecting with local talent nearby.
                        </p>
                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left bg-slate-50 dark:bg-[#1a1d24] p-6 rounded-2xl border border-slate-200 dark:border-[#303340]">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Business</div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{formData.business_name}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Industry</div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">{formData.niche}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">City</div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{formData.city}</div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] flex flex-col items-center justify-center font-sans py-12 px-4 selection:bg-blue-500/30">
            {/* Ambient Background Lights */}
            <div className="fixed top-0 left-0 -z-10 w-[600px] h-[600px] bg-blue-100/40 dark:bg-blue-900/10 blur-[120px] rounded-full opacity-60"></div>
            <div className="fixed bottom-0 right-0 -z-10 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-800/5 blur-[100px] rounded-full opacity-40"></div>

            <div className="w-full max-w-4xl relative z-10">
                {/* Header */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="text-3xl font-black tracking-tight mb-4">
                        <span className="text-[#134074] dark:text-blue-500">Hood</span><span className="text-slate-900 dark:text-white">Hire</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Setup your business profile</h1>
                    <p className="text-slate-500 dark:text-slate-400">Step {currentStep} of {steps.length} • {steps[currentStep-1].title}</p>
                </div>

                {/* Progress Steps for Desktop */}
                <div className="hidden lg:flex justify-between items-center mb-12 px-4 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-[#303340] -z-10 -translate-y-1/2"></div>
                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                currentStep === step.id 
                                ? 'bg-[#134074] border-[#134074] text-white shadow-lg shadow-[#134074]/30 scale-110' 
                                : currentStep > step.id
                                ? 'bg-blue-100 dark:bg-blue-900/30 border-[#134074] text-[#134074]'
                                : 'bg-white dark:bg-[#1a1d24] border-slate-200 dark:border-[#303340] text-slate-400'
                            }`}>
                                {currentStep > step.id ? <CheckCircle2 size={20} /> : step.icon}
                            </div>
                            <div className="flex flex-col items-center">
                                <span className={`text-xs font-bold uppercase tracking-wider ${currentStep === step.id ? 'text-[#134074]' : 'text-slate-400'}`}>
                                    {step.title}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Simple Progress */}
                <div className="lg:hidden w-full bg-slate-200 dark:bg-[#303340] h-1.5 rounded-full mb-8 overflow-hidden">
                    <div 
                        className="h-full bg-[#134074] transition-all duration-500 ease-out"
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
                            {(currentStep === 4 || currentStep === 5) && (
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
                                    className="flex items-center gap-2 bg-[#134074] hover:bg-[#0B2545] text-white px-10 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#134074]/20 active:scale-95"
                                >
                                    Continue <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleFinalSubmit}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 bg-gradient-to-r from-[#134074] to-[#0B2545] hover:from-[#0B2545] hover:to-[#091E3A] text-white px-12 py-3 rounded-xl font-black text-sm transition-all shadow-xl shadow-[#134074]/30 premium-glow"
                                >
                                    {isSubmitting ? (
                                        <>Finishing Up...</>
                                    ) : (
                                        <>Finish and Start Hiring <Save size={18} /></>
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

export default HirerOnboardingFlow;
