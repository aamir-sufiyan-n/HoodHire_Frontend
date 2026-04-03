import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { User, MapPin, Mail, Phone, Calendar, Briefcase, GraduationCap, ArrowLeft, Loader2, Award, Clock } from 'lucide-react';
import { seekerAPI } from '../../api/seeker';
import toast from 'react-hot-toast';

const SeekerProfileView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Get user from local storage instead of context
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

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
                // Determine if we are fetching by ID or something else. Our route says /profile/seeker/:id
                const res = await seekerAPI.getSeekerById(id);
                // The API payload structure determines where the data resides
                if (res?.seeker) {
                    setProfile(res.seeker);
                } else if (res?.profile) {
                    setProfile(res.profile);
                } else {
                    setProfile(res);
                }
            } catch (error) {
                console.error("Failed to fetch seeker profile:", error);
                toast.error("Failed to load profile details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProfile();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] flex flex-col items-center justify-center">
                <Loader2 size={48} className="text-[#8DA9C4] animate-spin mb-4" />
                <p className="text-slate-500 font-medium dark:text-slate-400">Loading candidate profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] flex flex-col items-center justify-center p-4 text-center">
                <User size={64} className="text-slate-300 dark:text-[#303340] mb-6" />
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Profile Not Found</h1>
                <p className="text-slate-500 font-medium mb-8">This candidate's profile could not be loaded or doesn't exist.</p>
                <button onClick={() => navigate(-1)} className="px-6 py-3 bg-[#13315C] text-white font-bold rounded-xl hover:bg-[#0B2545] transition">
                    Go Back
                </button>
            </div>
        );
    }

    const { Seeker, User: UserData, WorkExperiences, Education } = profile;

    // Based on whether the backend flattens or nests, we pull from specific variables
    const fullName = profile?.FullName || Seeker?.FullName || Seeker?.DisplayName || profile?.DisplayName || 'Candidate';
    const email = UserData?.Email || profile?.User?.Email || 'Email not provided';
    const bio = profile?.Bio || Seeker?.Bio || 'No bio provided.';
    const age = profile?.Age || Seeker?.Age;
    const gender = profile?.Gender || Seeker?.Gender;
    const phone = profile?.PhoneNumber || profile?.Phone || Seeker?.Phone;
    const experiences = WorkExperiences || profile?.WorkExperiences || [];

    // Education sometimes comes back as a single object from this endpoint
    const rawEducation = Education || profile?.Education;
    const educationArr = Array.isArray(rawEducation) ? rawEducation : (rawEducation ? [rawEducation] : []);

    // Authorization checks for contact info
    const applicationStatus = location.state?.applicationStatus || null;
    const isOwner = user?.role === 'seeker' && user?.id === Seeker?.UserID;
    // We mask contact info IF viewer is a Hirer AND the application is strictly not "accepted", 
    // AND they are not the profile owner.
    const shouldMaskContactInfo = user?.role === 'hirer' && applicationStatus !== 'accepted' && !isOwner;


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-[#f8fafc] font-sans overflow-hidden flex flex-col relative selection:bg-[#8DA9C4]/30 transition-colors duration-300 pb-16">

            {/* Ambient Base */}
            <div className="absolute top-0 left-0 w-full h-[60vh] overflow-hidden -z-10 pointer-events-none fade-in">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#13315C]/10 dark:bg-[#13315C]/5 blur-[120px]"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#134074]/10 dark:bg-[#134074]/5 blur-[120px]"></div>
            </div>

            {/* Navbar */}
            <header className="fixed top-0 flex justify-between left-0 right-0 h-20 glass-panel border-b border-gray-200/50 dark:border-[#262933]/50 z-40 px-4 lg:px-8 backdrop-blur-md bg-white/70 dark:bg-[#0f1115]/70">
                <div className="flex justify-between items-center gap-8 w-full max-w-7xl mx-auto h-full">
                    <div className="text-2xl font-extrabold tracking-tight cursor-pointer shrink-0" onClick={() => {
                        const userStr = localStorage.getItem('user');
                        const user = userStr ? JSON.parse(userStr) : null;
                        if (user?.role === 'seeker') navigate('/seeker');
                        else if (user?.role === 'hirer') navigate('/hirer');
                        else navigate('/');
                    }}>
                        <span className="text-[#8DA9C4]">Hood</span>Hire
                    </div>
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#262933] transition-colors ml-auto"
                        aria-label="Toggle Theme"
                    >
                        {!isDarkMode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#8DA9C4]" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        )}
                    </button>
                </div>
            </header>

            <main className="flex-1 mt-20 w-full pt-8 z-10 max-w-4xl mx-auto px-4 sm:px-6 w-full">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex flex-row items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#13315C] dark:text-slate-400 dark:hover:text-[#8DA9C4] transition-colors w-fit"
                >
                    <ArrowLeft size={16} /> Back 
                </button>

                <div className="bg-white/90 dark:bg-[#16181d]/90 backdrop-blur-xl border border-white/50 dark:border-[#262933]/50 rounded-md p-8 md:p-10 premium-shadow relative overflow-hidden group">
                    {/* Header Details */}
                    <div className="flex flex-col md:flex-row gap-8 items-start mb-10 pb-8 border-b border-slate-100 dark:border-[#262933]">
                        <div className="relative w-28 h-28 shrink-0 mx-auto md:mx-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#8DA9C4] to-[#13315C] rounded-full opacity-20 blur-md group-hover:opacity-30 transition-opacity"></div>
                            <div className="w-full h-full bg-white dark:bg-[#1a1d24] rounded-full flex items-center justify-center overflow-hidden border-4 border-slate-50 dark:border-[#16181d] shadow-sm relative z-10">
                                {(profile?.ProfilePicture || Seeker?.ProfilePicture || profile?.profile_picture) ? (
                                    <img 
                                        src={profile.ProfilePicture || Seeker.ProfilePicture || profile.profile_picture} 
                                        alt={fullName} 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#F5F5F5] dark:bg-[#8DA9C4]/10 text-[#8DA9C4] dark:text-[#8DA9C4]">
                                        <User size={48} strokeWidth={1.5} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white capitalize tracking-tight mb-2">
                                {fullName}
                            </h1>
                            <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-4 capitalize">
                                {gender && age ? `${gender}, ${age} years old` : (gender || age || 'Details not provided')}
                            </p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                                {shouldMaskContactInfo ? (
                                    <div className="flex items-center gap-2 bg-[#EEF4ED] dark:bg-[#8DA9C4]/10 border border-[#8DA9C4]/40 dark:border-[#0B2545]/40 px-4 py-2 rounded-lg text-[#134074] dark:text-[#8DA9C4]">
                                        <div className="w-2 h-2 rounded-full bg-[#8DA9C4] animate-pulse"></div>
                                        <span className="font-bold tracking-tight">Contact information locked until you accept their application.</span>
                                    </div>
                                ) : (
                                    <>
                                        {email && <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#262933] px-3 py-1.5 rounded-lg select-all"><Mail size={16} className="text-slate-400" />{email}</span>}
                                        {phone && <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#262933] px-3 py-1.5 rounded-lg select-all"><Phone size={16} className="text-slate-400" />{phone}</span>}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* About */}
                    <div className="mb-10">
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <User size={20} className="text-[#8DA9C4]" /> About
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {bio}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Experience */}
                        <div>
                            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <Briefcase size={20} className="text-[#8DA9C4]" /> Experience
                            </h3>
                            {experiences.length === 0 ? (
                                <p className="text-sm italic text-slate-500 dark:text-slate-400 p-4 bg-slate-50 dark:bg-[#1a1d24] rounded-xl border border-slate-100 dark:border-[#262933]">No work experience listed.</p>
                            ) : (
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-[#303340]">
                                    {experiences.map((exp, index) => (
                                        <div key={index} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white dark:border-[#16181d] bg-[#8DA9C4] dark:bg-[#8DA9C4] absolute left-0 md:left-1/2 -translate-x-[50%] z-10"></div>
                                            <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2rem)] pl-2 md:pl-0 md:odd:pr-2 bg-slate-50 dark:bg-[#1a1d24] p-4 rounded-xl border border-slate-100 dark:border-[#262933] ml-auto md:ml-0 md:odd:text-right">
                                                <h4 className="font-bold text-slate-900 dark:text-white text-base">{exp.Position || exp.JobTitle}</h4>
                                                <p className="text-sm font-semibold text-[#13315C] dark:text-[#8DA9C4] mb-2">{exp.CompanyName}</p>
                                                <div className="flex items-center md:items-start md:odd:justify-end gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                                                    <Clock size={12} />
                                                    {exp.Duration ? (
                                                        <span className="capitalize">{exp.Duration}</span>
                                                    ) : (
                                                        <span>
                                                            {exp.StartDate ? new Date(exp.StartDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A'} -
                                                            {exp.IsCurrentRole || exp.IsCurrentJob ? ' Present' : exp.EndDate ? ` ${new Date(exp.EndDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}` : ' N/A'}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium line-clamp-3">
                                                    {exp.Description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Education */}
                        <div>
                            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <GraduationCap size={20} className="text-[#8DA9C4]" /> Education
                            </h3>
                            {educationArr.length === 0 ? (
                                <p className="text-sm italic text-slate-500 dark:text-slate-400 p-4 bg-slate-50 dark:bg-[#1a1d24] rounded-xl border border-slate-100 dark:border-[#262933]">No education history listed.</p>
                            ) : (
                                <div className="space-y-4">
                                    {educationArr.map((edu, index) => (
                                        <div key={index} className="bg-slate-50 dark:bg-[#1a1d24] p-4 rounded-xl border border-slate-100 dark:border-[#262933] flex gap-4 items-start">
                                            <div className="w-10 h-10 rounded-full bg-[#F5F5F5] dark:bg-[#8DA9C4]/10 flex items-center justify-center shrink-0">
                                                <Award size={20} className="text-[#13315C] dark:text-[#8DA9C4]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{edu.CourseName || edu.Degree || edu.FieldOfStudy}</h4>
                                                <p className="text-sm font-semibold text-[#13315C] dark:text-[#8DA9C4] mb-1">{edu.InstituteName || edu.Institution}</p>
                                                <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                    <Calendar size={12} />
                                                    <span>
                                                        {edu.StartYear || (edu.StartDate ? new Date(edu.StartDate).getFullYear() : 'N/A')} -
                                                        {edu.IsOngoing || edu.IsScanning ? ' Present' : (edu.GraduationYear || (edu.EndDate ? new Date(edu.EndDate).getFullYear() : ' N/A'))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default SeekerProfileView;
