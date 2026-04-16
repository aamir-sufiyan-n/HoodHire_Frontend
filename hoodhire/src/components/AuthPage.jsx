import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI } from '../api/auth';
import { chatAPI } from '../api/chat';
import { Mail, Lock, User, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

const AuthPage = ({ defaultView = 'login', role = null }) => {
    const navigate = useNavigate();
    const [view, setView] = useState(defaultView); // 'login', 'signup', 'otp'

    // Sync view if prop changes
    useEffect(() => {
        setView(defaultView);
    }, [defaultView]);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        otp: '',
        verificationToken: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errorMsg) setErrorMsg(''); // clear error on new input
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = await authAPI.login({
                email: formData.email,
                password: formData.password
            });

            // Store the token and user data on successful login
            if (data['access-token']) {
                localStorage.setItem('accessToken', data['access-token']);
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Connect Chat WebSocket
            if (data['access-token']) {
                chatAPI.connectWebSocket(data['access-token']);
            }

            toast.success('Successfully logged in!');
            const permsData = await authAPI.getMyPermissions();
            console.log(permsData);
            const permissions = permsData.permissions || {};
            const hasAdminAccess = Object.values(permissions).some(val => val === true);
            console.log('hasAdminAccess:', hasAdminAccess);

            if (hasAdminAccess) {
                navigate('/admin/dashboard');
            } else {
                const userRole = (data.user?.role || data.user?.Role)?.toLowerCase();
                navigate(userRole === 'hirer' ? '/hirer' : '/seeker');
            }
        } catch (err) {
            const msg = err.message || 'Failed to log in. Please check your credentials.';
            setErrorMsg(msg);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!formData.username || !formData.email || !formData.password) {
            toast.error('Please fill in all fields.');
            setIsSubmitting(false);
            return;
        }

        try {
            const data = await authAPI.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: role || 'seeker' // Default to seeker if none provided
            });

            // Save the verificationToken from the response to verify later
            if (data.verificationToken) {
                setFormData(prev => ({ ...prev, verificationToken: data.verificationToken }));
            }

            toast.success('Verification code sent to your email!');
            setView('otp');
        } catch (err) {
            const msg = err.message || 'Registration failed. Please try again.';
            setErrorMsg(msg);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (formData.otp.length < 4) {
            toast.error('Please enter a valid OTP.');
            setIsSubmitting(false);
            return;
        }

        try {
            const data = await authAPI.verifyOTP({
                role: role || 'seeker',
                token: formData.verificationToken,
                Otp: formData.otp
            });

            // Store the access token and user info
            if (data['access-token']) {
                localStorage.setItem('accessToken', data['access-token']);
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Connect Chat WebSocket
            if (data['access-token']) {
                chatAPI.connectWebSocket(data['access-token']);
            }

            toast.success('Account created and verified! Redirecting...');
            if (data.user && ((data.user.role || data.user.Role)?.toLowerCase() === 'admin')) {
                navigate('/admin/dashboard');
            } else if (role === 'seeker') {
                navigate('/onboarding');
            } else if (role === 'hirer') {
                navigate('/onboarding/hirer');
            } else {
                const userRole = (data.user?.role || data.user?.Role || role)?.toLowerCase();
                navigate(userRole === 'hirer' ? '/hirer' : '/seeker');
            }
        } catch (err) {
            toast.error(err.message || 'Failed to verify OTP. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        setIsSubmitting(true);
        try {
            await authAPI.resendOTP({ email: formData.email, role: role || 'seeker' });
            toast.success('A new Verification Code has been sent to your email.');
        } catch (err) {
            toast.error(err.message || 'Failed to resend OTP.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen w-screen bg-slate-50 dark:bg-[#0f1115] p-0 text-slate-900 dark:text-[#f8fafc] font-sans selection:bg-emerald-500/30 overflow-hidden transition-colors duration-300 relative isolate">

            {/* The Main Layout Container */}
            <div className="flex flex-col lg:flex-row-reverse w-full max-w-[1600px] mx-auto h-full relative isolate">

                {/* Ambient Lights for the Form Side (left) */}
                <div className="absolute top-0 left-0 -z-10 w-[600px] h-[600px] bg-emerald-100/40 dark:bg-emerald-900/10 blur-[100px] rounded-full opacity-60 transform -translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

                {/* Right side (visually) - Dark Emerald Hero Card with Padding */}
                <div className="hidden lg:flex flex-1 p-4 lg:p-6 lg:pl-0 h-full">
                    <div className="relative w-full h-full overflow-hidden group bg-[#1d3124] dark:bg-[#0a0f14] rounded-xl shadow-2xl flex flex-col justify-between">
                        {/* Background Details */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen transform translate-x-1/3 -translate-y-1/4 opacity-40 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-400/5 rounded-full blur-[80px] mix-blend-screen transform -translate-x-1/4 translate-y-1/4 opacity-30 pointer-events-none"></div>

                        <div className="relative z-20 flex flex-col justify-between p-12 xl:p-16 h-full w-full max-w-[600px] mx-auto xl:mx-0">
                            <div className="text-3xl font-bold tracking-tight cursor-pointer drop-shadow-md flex items-center" onClick={() => navigate('/')}>
                                <span className="text-emerald-500">Hood</span><span className="text-white">Hire</span>
                            </div>

                            <div className="mb-12">
                                <h1 className="text-4xl xl:text-5xl font-bold leading-[1.15] mb-6 tracking-tight text-white drop-shadow-sm">
                                    Empowering <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-100">Local</span> Businesses.
                                </h1>
                                <p className="text-base xl:text-lg leading-relaxed text-emerald-50/80 mb-8 max-w-[90%] font-medium">
                                    Connecting top-tier part-time talent with the best opportunities right in your neighborhood. Fast, verified, and community-driven.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left side (visually) - Forms */}
                <div className="flex-1 flex items-center justify-center bg-transparent p-4 sm:p-8 xl:p-12 transition-colors relative z-20 h-full overflow-y-auto">

                    {/* Decorative floating elements for the left side */}
                    <div className="absolute top-1/4 left-10 w-24 h-24 bg-white/60 dark:bg-white/5 rounded-3xl rotate-12 backdrop-blur-xl border border-white/80 dark:border-white/10 animate-pulse hidden lg:block shadow-xl" style={{ animationDuration: '4s' }}></div>
                    <div className="absolute bottom-1/3 right-10 w-16 h-16 bg-emerald-400/40 dark:bg-emerald-400/10 rounded-full backdrop-blur-3xl border border-white/60 dark:border-white/10 animate-bounce hidden lg:block shadow-lg" style={{ animationDuration: '6s' }}></div>

                    {/* Main Form Wrapper - Clean transparent layout */}
                    <div className="w-full max-w-[440px] px-4 sm:px-8 py-10 transition-all duration-300 relative z-10">

                        {/* Subtle inner highlight */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-200/50 dark:via-white/5 to-transparent"></div>

                        {/* Mobile Logo (hidden on desktop) */}
                        <div className="lg:hidden text-3xl font-extrabold text-center mb-8">
                            <span className="text-emerald-600 dark:text-emerald-500">Hood</span>Hire
                        </div>

                        <div className="w-full">
                            {/* Login View */}
                            {view === 'login' && (
                                <div className="flex flex-col animate-fade-in ">
                                    <div className="mb-10 text-center sm:text-left">
                                        <h2 className="text-2xl font-bold mb-2 tracking-tight text-slate-900 dark:text-white transition-colors">Welcome back</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base transition-colors">Step into your dashboard seamlessly.</p>
                                    </div>

                                    {errorMsg && (
                                        <div className="mb-5 flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-md">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                            {errorMsg}
                                        </div>
                                    )}

                                    <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
                                        <div className="flex flex-col gap-2 group">
                                            <label htmlFor="email" className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">Email address</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                    <Mail size={16} />
                                                </div>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    placeholder="hello@example.com"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-3 rounded-md border border-slate-200 dark:border-[#303340] shadow-sm bg-white dark:bg-[#1a1d24] text-slate-900 dark:text-[#f8fafc] text-sm transition-all duration-200 outline-none placeholder:text-slate-400 dark:placeholder:text-[#475569] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 group mt-2">
                                            <label htmlFor="password" className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1 transition-colors">Password</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                    <Lock size={16} />
                                                </div>
                                                <input
                                                    type="password"
                                                    id="password"
                                                    name="password"
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-3 rounded-md border border-slate-200 dark:border-[#303340] shadow-sm bg-white dark:bg-[#1a1d24] text-slate-900 dark:text-[#f8fafc] text-sm transition-all duration-200 outline-none placeholder:text-slate-400 dark:placeholder:text-[#475569] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mt-2 mb-4">
                                            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium cursor-pointer group">
                                                <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 group-hover:border-emerald-500 flex items-center justify-center transition-colors">
                                                    <input type="checkbox" className="opacity-0 absolute w-4 h-4 cursor-pointer" />
                                                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                                </div>
                                                <span>Remember me</span>
                                            </label>
                                            <a href="#" className="text-sm font-semibold text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">Forgot password?</a>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed text-white border-none py-3 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 shadow-sm flex items-center justify-center gap-2 focus:ring-2 focus:ring-emerald-500/30 outline-none"
                                        >
                                            {isSubmitting ? (
                                                <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Logging in...</>
                                            ) : (
                                                <>Sign In <ArrowRight size={16} /></>
                                            )}
                                        </button>
                                    </form>

                                    <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-200/60 dark:border-[#262933]/60 pt-8">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
                                            Don't have an account?
                                        </p>
                                        <button
                                            type="button"
                                            className="bg-transparent border-none text-slate-900 dark:text-white font-semibold text-sm cursor-pointer p-0 transition-colors hover:text-emerald-600 dark:hover:text-emerald-500"
                                            onClick={() => navigate('/signin/seeker')}
                                        >
                                            Create one now
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Signup View */}
                            {view === 'signup' && (
                                <div className="flex flex-col animate-fade-in p-1 sm:p-2">
                                    <div className="mb-6 text-center sm:text-left">
                                        <h2 className="text-2xl font-bold mb-1 tracking-tight text-slate-900 dark:text-white transition-colors">Join HoodHire</h2>
                                        {role === 'hirer' ? (
                                            <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Create an Employer account to post jobs.</p>
                                        ) : (
                                            <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Create a Seeker account to discover opportunities.</p>
                                        )}
                                    </div>

                                    {errorMsg && (
                                        <div className="mb-4 flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-md">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                            {errorMsg}
                                        </div>
                                    )}

                                    <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-1.5 group">
                                            <label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Username</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                    <User size={16} />
                                                </div>
                                                <input
                                                    type="text"
                                                    id="username"
                                                    name="username"
                                                    placeholder="johndoe"
                                                    value={formData.username}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-slate-200 dark:border-[#303340] shadow-sm bg-white dark:bg-[#1a1d24] text-slate-900 dark:text-[#f8fafc] text-sm transition-all duration-200 outline-none placeholder:text-slate-400 dark:placeholder:text-[#475569] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 group">
                                            <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Email address</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                    <Mail size={16} />
                                                </div>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    placeholder="hello@example.com"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-slate-200 dark:border-[#303340] shadow-sm bg-white dark:bg-[#1a1d24] text-slate-900 dark:text-[#f8fafc] text-sm transition-all duration-200 outline-none placeholder:text-slate-400 dark:placeholder:text-[#475569] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 group">
                                            <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Password</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                    <Lock size={16} />
                                                </div>
                                                <input
                                                    type="password"
                                                    id="password"
                                                    name="password"
                                                    placeholder="Create a strong password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-slate-200 dark:border-[#303340] shadow-sm bg-white dark:bg-[#1a1d24] text-slate-900 dark:text-[#f8fafc] text-sm transition-all duration-200 outline-none placeholder:text-slate-400 dark:placeholder:text-[#475569] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed text-white border-none py-3 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 shadow-sm flex items-center justify-center gap-2 focus:ring-2 focus:ring-emerald-500/30 outline-none"
                                        >
                                            {isSubmitting ? 'Creating account...' : 'Create account'}
                                        </button>
                                    </form>

                                    <div className="mt-4 flex items-center justify-center gap-2 border-t border-slate-200/60 dark:border-[#262933]/60 pt-4">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
                                            Already have an account?
                                        </p>
                                        <button
                                            type="button"
                                            className="bg-transparent border-none text-slate-900 dark:text-white font-semibold text-sm cursor-pointer p-0 transition-colors hover:text-emerald-600 dark:hover:text-emerald-500"
                                            onClick={() => navigate('/login')}
                                        >
                                            Sign in
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* OTP View */}
                            {view === 'otp' && (
                                <div className="flex flex-col animate-fade-in p-2 sm:p-4 text-center">
                                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <ShieldCheck size={32} className="text-emerald-500 dark:text-emerald-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-3 tracking-tight text-slate-900 dark:text-white transition-colors">Check your email</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 transition-colors max-w-xs mx-auto">We've sent a secure 6-digit code to <br /><strong className="text-slate-900 dark:text-white transition-colors mt-1 inline-block">{formData.email || 'your email'}</strong></p>

                                    <form onSubmit={handleOtpSubmit} className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="text"
                                                id="otp"
                                                name="otp"
                                                placeholder="000000"
                                                value={formData.otp}
                                                onChange={handleInputChange}
                                                className="px-5 py-4 rounded-md border border-slate-200 dark:border-[#303340] bg-white dark:bg-[#1a1d24] text-slate-900 dark:text-[#f8fafc] text-2xl tracking-[0.4em] font-bold text-center transition-all duration-300 outline-none placeholder:text-slate-300 dark:placeholder:text-[#333b4d] placeholder:tracking-normal hover:border-slate-300 dark:hover:border-slate-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#1c212b] focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                                                required
                                                maxLength={6}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed text-white border-none py-3 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 shadow-sm flex items-center justify-center gap-2 focus:ring-2 focus:ring-emerald-500/30 outline-none"
                                        >
                                            {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
                                        </button>
                                    </form>

                                    <div className="mt-8 flex items-center justify-center gap-2">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
                                            Didn't receive the code?
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            className="bg-transparent border-none text-slate-900 dark:text-white font-semibold text-sm cursor-pointer p-0 transition-colors hover:text-emerald-600 dark:hover:text-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isSubmitting}
                                        >
                                            Resend now
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
