import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { User, MapPin, Mail, Phone, Calendar, Briefcase, GraduationCap, ArrowLeft, Loader2, Award, Clock, CheckCircle2, XCircle, MessageSquare, MoreVertical, Flag, MessageCircle, FileText } from 'lucide-react';
import { hirerAPI } from '../../api/hirer';
import { jobsAPI } from '../../api/jobs';
import toast from 'react-hot-toast';
import TicketModal from '../support/TicketModal';

import EducationView from '../profile/EducationView';
import CategoriesView from '../profile/CategoriesView';
import ExperienceView from '../profile/ExperienceView';
import WorkPreferencesForm from '../profile/WorkPreferencesForm';
import GlobalNavbar from '../GlobalNavbar';

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

const DisplayProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [profile, setProfile] = useState(null);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Fetch the seeker profile specifically tailored for Hirers
                const res = await hirerAPI.getSeekerProfile(id);

                if (res?.seeker) {
                    setProfile(res.seeker);
                    setApplication(res.application || null);
                } else if (res?.profile) {
                    setProfile(res.profile);
                    setApplication(res.application || null);
                } else {
                    setProfile(res);
                }
            } catch (error) {
                console.error("Failed to fetch applicant profile:", error);
                toast.error("Failed to load applicant details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProfile();
        }
    }, [id]);

    // Extract applicationStatus from the router state passed by ApplicationsView
    const [applicationStatus, setApplicationStatus] = useState(location.state?.applicationStatus || 'pending');

    useEffect(() => {
        if (application?.Status && applicationStatus === 'pending') {
            setApplicationStatus(application.Status);
        }
    }, [application]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] flex flex-col items-center justify-center">
                <Loader2 size={48} className="text-[#009966] animate-spin mb-4" />
                <p className="text-slate-500 font-medium dark:text-slate-400">Loading applicant profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] flex flex-col items-center justify-center p-4 text-center">
                <User size={64} className="text-slate-300 dark:text-[#303340] mb-6" />
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Profile Not Found</h1>
                <p className="text-slate-500 font-medium mb-8">This applicant's profile could not be loaded.</p>
                <button onClick={() => navigate(-1)} className="px-6 py-3 bg-[#009966] text-white font-bold rounded-md hover:bg-[#008855] transition">
                    Go Back
                </button>
            </div>
        );
    }

    const { Seeker, User: UserData, WorkExperiences, Education } = profile;

    // Use Seeker specifically if it exists, otherwise fallback to top level fields
    const fullName = profile?.FullName || Seeker?.FullName || Seeker?.DisplayName || profile?.DisplayName || 'Applicant';
    const email = UserData?.Email || profile?.User?.Email || profile?.Email || Seeker?.Email || 'Email not provided';
    const age = profile?.Age || Seeker?.Age;
    const gender = profile?.Gender || Seeker?.Gender;
    const phone = profile?.PhoneNumber || profile?.Phone || Seeker?.Phone || Seeker?.PhoneNumber;

    // Adapt payload for sub components
    const formData = {
        full_name: fullName,
        age: age,
        gender: gender,
        phone_number: phone,
        current_status: profile?.CurrentStatus || 'Professional Seeker',
        about: profile?.Bio || Seeker?.Bio || profile?.About || 'No bio provided.',
        current_address: profile?.CurrentAddress || '',
        locality: profile?.Locality || '',
        field_of_study: Education?.FieldOfStudy || profile?.Education?.FieldOfStudy || '',
        course_name: Education?.CourseName || profile?.Education?.CourseName || '',
        institute_name: Education?.InstituteName || profile?.Education?.InstituteName || '',
        start_year: Education?.StartYear || profile?.Education?.StartYear || '',
        graduation_year: Education?.GraduationYear || profile?.Education?.GraduationYear || '',
        is_ongoing: Education?.IsOngoing || profile?.Education?.IsOngoing || false,
        interested_categories: (profile?.JobInterests || profile?.job_interests) ? (profile?.JobInterests || profile?.job_interests).map(ji => ji.Category?.Name || ji.category?.name).filter(Boolean) : (profile?.InterestedCategories || []),
        profile_picture_url: profile?.ProfilePicture || profile?.profile_picture || profile?.ProfilePictureUrl || profile?.profile_picture_url || Seeker?.ProfilePicture || Seeker?.profile_picture || Seeker?.ProfilePictureUrl || Seeker?.profile_picture_url || '',
        resume_url: (application?.ResumeUrl || application?.Resume || Seeker?.ResumeUrl || profile?.ResumeUrl || '').replace('/image/upload/', '/raw/upload/')
    };

    const experiences = (WorkExperiences || profile?.WorkExperiences || []).map(ex => ({
        company_name: ex.CompanyName || '',
        position: ex.Position || '',
        duration: ex.Duration || '',
        is_current_job: ex.IsCurrentJob || false,
        description: ex.Description || ''
    }));

    const rawPreference = profile?.WorkPreference || {};
    const workPreference = {
        monday: !!(rawPreference.monday || rawPreference.Monday),
        tuesday: !!(rawPreference.tuesday || rawPreference.Tuesday),
        wednesday: !!(rawPreference.wednesday || rawPreference.Wednesday),
        thursday: !!(rawPreference.thursday || rawPreference.Thursday),
        friday: !!(rawPreference.friday || rawPreference.Friday),
        saturday: !!(rawPreference.saturday || rawPreference.Saturday),
        sunday: !!(rawPreference.sunday || rawPreference.Sunday),
        preferred_shift: rawPreference.preferred_shift || rawPreference.PreferredShift || 'flexible',
        part_time: !!(rawPreference.part_time || rawPreference.PartTime),
        full_time: !!(rawPreference.full_time || rawPreference.FullTime),
        immediate: !!(rawPreference.immediate || rawPreference.Immediate)
    };

    // We ALWAYS mask if the application is not explicitly accepted.
    const shouldMaskContactInfo = applicationStatus !== 'accepted';

    // To mock or handle the accept/reject directly from this view:
    const handleUpdateStatus = async (status) => {
        // Technically we need the Application ID, but `id` here is Seeker ID. 
        // We'll rely on the backend merging it or assume the ApplicationID was passed in state if possible.
        const appId = location.state?.applicationId || application?.ID;
        if (!appId) {
            toast.error("Contact backend to link JobApplications by seeker ID directly.");
            return;
        }

        try {
            await jobsAPI.updateApplicationStatus(appId, { status });
            toast.success(`Application marked as ${status}`);
            setApplicationStatus(status);
        } catch (error) {
            console.error(error);
            toast.error(`Failed to update application to ${status}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-[#f8fafc] font-sans overflow-hidden flex flex-col relative selection:bg-[#009966]/30 transition-colors duration-300 pb-16">

            {/* Ambient Base */}
            <div className="absolute top-0 left-0 w-full h-[60vh] overflow-hidden -z-10 pointer-events-none fade-in">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#008855]/10 dark:bg-[#008855]/5 blur-[120px]"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 dark:bg-blue-600/5 blur-[120px]"></div>
            </div>

            <GlobalNavbar />

            <main className="max-w-[1200px] mx-auto pt-28 px-4 sm:px-6 relative z-10 w-full mb-16">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex flex-row items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#009966] dark:text-slate-400 dark:hover:text-[#009966] transition-colors w-fit"
                >
                    <ArrowLeft size={16} /> Back to Applications
                </button>

                {/* Main Profile Header matching Seeker ProfilePage */}
                <div className="w-full bg-white dark:bg-[#16181d] rounded-sm premium-shadow border border-slate-200 dark:border-[#262933] p-6 lg:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-visible mb-8">
                    
                    {/* More Actions Menu (Top Right) */}
                    <div className="absolute top-4 right-4 z-20">
                        <button 
                            onClick={() => setShowActionsMenu(!showActionsMenu)}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#262933] border-none bg-transparent transition-all"
                            title="More Actions"
                        >
                            <MoreVertical size={20} />
                        </button>

                        {showActionsMenu && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setShowActionsMenu(false)}
                                ></div>
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-1">
                                        <button
                                            onClick={() => {
                                                setShowReportModal(true);
                                                setShowActionsMenu(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors border-none bg-transparent"
                                        >
                                            <Flag size={16} />
                                            Report Seeker
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Left Header Compartment - Exact Match of ProfileHeaderView */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1 min-w-[50%] border-b md:border-b-0 md:border-r border-slate-100 dark:border-[#262933] pb-6 md:pb-0 md:pr-8">
                        <div className="w-32 h-32 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-[#303340] shadow-sm relative group bg-slate-50 dark:bg-[#1a1d24] flex items-center justify-center">
                            {formData.profile_picture_url ? (
                                <img src={formData.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={54} className="text-[#009966]" />
                            )}
                        </div>

                        <div className="flex flex-col items-center sm:items-start w-full">
                            <div className="flex items-center justify-between w-full mb-1">
                                <h1 className="text-2xl font-normal text-slate-800 dark:text-slate-100 capitalize tracking-tight font-sans">{fullName}</h1>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5 font-medium">
                                {formData.current_status}
                            </p>
                            <p className="text-[13px] text-[#009966] transition-colors flex items-center gap-1 mb-6 font-medium">
                                <Briefcase size={14} className="shrink-0" /> {experiences.length > 0 ? experiences[0].company_name : 'Seeking Opportunities'}
                            </p>

                            <div className="flex gap-3 w-full justify-center sm:justify-start flex-wrap">
                                {applicationStatus === 'pending' ? (
                                    <>
                                        <button
                                            onClick={() => handleUpdateStatus('accepted')}
                                            className="flex-1 sm:flex-none py-2.5 px-6 bg-[#009966] hover:bg-[#008855] text-white font-bold rounded-sm shadow-sm transition-colors text-sm flex justify-center items-center gap-2"
                                        >
                                            <CheckCircle2 size={16} /> Accept Applicant
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus('rejected')}
                                            className="flex-1 sm:flex-none py-2.5 px-6 bg-transparent border border-rose-400 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 font-bold rounded-sm shadow-sm transition-colors text-sm flex justify-center items-center gap-2"
                                        >
                                            <XCircle size={16} /> Reject
                                        </button>
                                    </>
                                ) : (
                                    <span className={`px-4 py-2 text-sm font-bold rounded-md uppercase tracking-wider ${applicationStatus === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : applicationStatus === 'rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                                        'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                                        }`}>
                                        Application {applicationStatus}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Header Compartment */}
                    <div className="flex flex-col justify-start w-full md:w-auto flex-1 h-full pl-0 md:pl-4">
                        <div className="grid grid-cols-[160px_1fr] gap-y-3 gap-x-4 w-full mb-6 relative">
                            {shouldMaskContactInfo && (
                                <div className="absolute inset-x-0 bottom-0 h-16 backdrop-blur-md bg-white/40 dark:bg-[#16181d]/60 z-10 flex items-center px-4 rounded-md border border-amber-200 dark:border-amber-900/40 border-dashed">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-2 shrink-0"></div>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Contact locked until application is accepted.</span>
                                </div>
                            )}

                            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Availability:</span>
                            <span className="text-[13px] text-slate-600 dark:text-slate-400 pb-1 border-b border-transparent hover:border-slate-300 inline-flex items-center gap-2">
                                {workPreference?.full_time ? 'Full-time' : (workPreference?.part_time ? 'Part-time' : 'Not specified')}
                                {workPreference?.immediate ? (
                                    <span className="px-2 py-0.5 rounded-full bg-[#009966] text-white text-[10px] uppercase font-bold tracking-wider leading-none">Available</span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider leading-none">Not Available</span>
                                )}
                            </span>

                            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Age / Gender:</span>
                            <span className="text-[13px] text-slate-600 dark:text-slate-400 pb-1 border-b border-transparent hover:border-slate-300 bg-transparent py-0 h-auto">
                                {age ? `${age}` : 'N/A'} • {gender || 'N/A'}
                            </span>

                            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Location:</span>
                            <span className="text-[13px] text-slate-600 dark:text-slate-400 pb-1 border-b border-transparent hover:border-slate-300">
                                {formData.locality ? `${formData.locality}, IN` : 'Not Set'}
                            </span>

                            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Phone number:</span>
                            <span className="text-[13px] text-slate-600 dark:text-slate-400 pb-1 border-b border-transparent hover:border-slate-300 filter transition-all">
                                {phone || 'N/A'}
                            </span>
                        </div>

                        <div className="flex items-center gap-5 mt-auto text-[#009966]">
                            <a href={!shouldMaskContactInfo ? `mailto:${email}` : '#'} className="hover:text-[#009966] transition-colors p-1" title="Email"><Mail size={18} /></a>
                            <a href={!shouldMaskContactInfo ? `tel:${phone}` : '#'} className="hover:text-[#009966] transition-colors p-1" title="Phone"><Phone size={18} /></a>
                            <div 
                                onClick={() => {
                                    const appStatus = location.state?.applicationStatus;
                                    if (appStatus && appStatus !== 'accepted') {
                                        toast.error("You can only message candidates after accepting their application.");
                                        return;
                                    }
                                    navigate('/messages', { state: { userId: profile?.UserID || Seeker?.UserID || id } });
                                }}
                                className={`transition-colors cursor-pointer p-1 ${location.state?.applicationStatus && location.state?.applicationStatus !== 'accepted' ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'hover:text-[#009966]'}`} 
                                title="Message"
                            >
                                <MessageCircle size={18} />
                            </div>
                            <div className="hover:text-[#009966] transition-colors cursor-pointer p-1" title="Address"><MapPin size={18} /></div>
                        </div>
                    </div>
                </div>

                {/* Application Message Injection */}
                {location.state?.applicationMessage && (
                    <div className="bg-white/90 dark:bg-[#16181d]/90 border-l-4 border-[#009966] rounded-r-sm p-6 mb-8 premium-shadow relative group">
                        <MessageSquare className="absolute top-6 right-6 text-slate-100 dark:text-[#262933] opacity-40 group-hover:text-[#ffffff] dark:group-hover:text-[#303340] transition-colors" size={48} />
                        <h3 className="text-sm font-bold text-[#009966] dark:text-[#3b9f87] uppercase tracking-wider mb-2 flex items-center gap-2 relative z-10"><MessageSquare size={16} /> Application Note</h3>
                        <p className="text-slate-700 dark:text-slate-300 italic font-medium relative z-10 leading-relaxed max-w-2xl">
                            "{location.state.applicationMessage}"
                        </p>
                        {location.state?.applicationResume && (
                            <div className="mt-4 flex items-center gap-3 relative z-10">
                                {(() => {
                                    const transformed = location.state.applicationResume.replace('/image/upload/', '/raw/upload/');
                                    const fileName = transformed.split('/').pop().split('?')[0] || "View Submitted Resume";
                                    return (
                                        <a 
                                            href={transformed} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-[#009966] hover:bg-[#008855] text-white text-[13px] font-bold rounded shadow-sm transition-all"
                                            title={fileName}
                                        >
                                             {fileName}
                                        </a>
                                    );
                                })()}
                                <p className="text-[11px] text-slate-500 font-medium">This resume was attached specifically for this job.</p>
                            </div>
                        )}
                        {!location.state?.applicationResume && application?.ResumeUrl && (
                            <div className="mt-4 flex items-center gap-3 relative z-10">
                                {(() => {
                                    const transformed = application.ResumeUrl.replace('/image/upload/', '/raw/upload/');
                                    const fileName = transformed.split('/').pop().split('?')[0] || "View Submitted Resume";
                                    return (
                                        <a 
                                            href={transformed} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-[#009966] hover:bg-[#008855] text-white text-[13px] font-bold rounded shadow-sm transition-all"
                                            title={fileName}
                                        >
                                             {fileName}
                                        </a>
                                    );
                                })()}
                                <p className="text-[11px] text-slate-500 font-medium">This resume was attached specifically for this job.</p>
                            </div>
                        )}
                    </div>
                )}


                {/* EXACT Replicated 3-Column Lower Layout from Seeker Profile */}
                <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-6 items-start mt-2">

                    {/* Left Column: Education */}
                    <div className="w-full">
                        <EducationView formData={formData} />
                    </div>

                    {/* Center Column: Combined Block (About, Categories, Experience) */}
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

                        {/* RESUME SECTION */}
                        {formData.resume_url && (
                             <div className="py-5 border-b border-slate-200/50 dark:border-[#262933]/50">
                                <h3 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                                    Profile Resume
                                </h3>
                                <a 
                                    href={formData.resume_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded text-slate-700 dark:text-slate-300 hover:text-[#009966] dark:hover:text-[#009966] transition-all group overflow-hidden"
                                    title={formData.resume_url.split('/').pop().split('?')[0] || "Download Seeker's Profile Resume"}
                                >
                                    <FileText size={18} className="text-slate-400 group-hover:text-[#009966] shrink-0" />
                                    <span className="text-[13px] font-bold truncate">{formData.resume_url.split('/').pop().split('?')[0] || "Download Seeker's Profile Resume"}</span>
                                </a>
                            </div>
                        )}

                        {/* CATEGORIES SECTION */}
                        <div className="py-5 border-b border-slate-200/50 dark:border-[#262933]/50">
                            <CategoriesView formData={formData} availableCategories={availableCategories} />
                        </div>

                        {/* EXPERIENCE SECTION */}
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
                            hasExistingPreference={false} // Never show edit button for employers viewing records
                            isEditingPreference={false}   // Form is locked to reading state
                            setIsEditingPreference={() => { }}
                            handlePreferenceSubmit={() => { }}
                            isSubmittingPreference={false}
                            toggleWorkDay={() => { }}
                            setWorkPreference={() => { }}
                            isViewMode={true}
                        />
                    </div>

                </div>
            </main>

            <TicketModal 
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                role="hirer"
                seekerId={id}
                seekerName={fullName}
                initialType="report"
            />
        </div>
    );
};

export default DisplayProfile;
