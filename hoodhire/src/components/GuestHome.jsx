import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, User, Star, ArrowRight, ShieldCheck, Clock, Zap, CheckCircle, Briefcase, Building2, Sparkles } from 'lucide-react';
import Footer from './Footer';

const GuestHome = () => {
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [authView, setAuthView] = useState(null); // null, 'login', 'signup'
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const [isScrolled, setIsScrolled] = useState(false);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80; // Navbar height
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 750) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setAuthView(null), 300); // Reset after slide animation
    };

    const navigateToAuth = (path) => {
        closeDrawer();
        navigate(path);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-[#f8fafc] font-sans overflow-x-hidden flex flex-col relative selection:bg-[#009966]/30 transition-colors duration-300 isolate">

            {/* Top green background behind hero and navbar */}
            <div className="absolute top-0 left-0 right-0 h-[750px] lg:h-[800px] bg-[#0a0f14] dark:bg-[#0a0f14] -z-10 overflow-hidden transition-colors duration-300">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-500/20 dark:bg-emerald-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-emerald-400/20 dark:bg-emerald-900/20 blur-[100px] rounded-full"></div>
            </div>

            {/* Body ambient background */}
            <div className="fixed inset-0 -z-20 bg-slate-50 dark:bg-[#0f1115] pointer-events-none"></div>

            {/* Navbar */}
            <header className={`fixed top-0 flex justify-between left-0 right-0 h-20 z-40 px-4 lg:px-8 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-lg border-b border-slate-200 dark:border-white/10 shadow-sm' : 'bg-transparent backdrop-blur-[2px]'}`}>
                <div className="flex justify-between items-center gap-8 w-full max-w-7xl mx-auto h-full">
                    {/* Logo */}
                    <div className="text-2xl font-extrabold tracking-tight cursor-pointer shrink-0 group flex items-center" onClick={() => navigate('/')}>
                        <span className={isScrolled ? "text-emerald-600 dark:text-emerald-500" : "text-emerald-50"}>Hood</span>
                        <span className={isScrolled ? "text-slate-900 dark:text-white" : "text-white/90"}>Hire</span>
                    </div>

                    {/* Full Search Bar in Navbar */}
                    {/* Navigation Links in Navbar */}
                    <div className="hidden lg:flex flex-1 max-w-2xl mx-auto items-center justify-center gap-8 py-1.5">
                        <button 
                            onClick={() => scrollToSection('how-it-works')} 
                            className={`text-sm font-bold transition-all hover:scale-105 active:scale-95 ${isScrolled ? 'text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-500' : 'text-white/80 hover:text-white'}`}
                        >
                            How it Works
                        </button>
                        <button 
                            onClick={() => scrollToSection('why-us')} 
                            className={`text-sm font-bold transition-all hover:scale-105 active:scale-95 ${isScrolled ? 'text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-500' : 'text-white/80 hover:text-white'}`}
                        >
                            Why Us
                        </button>
                        <button 
                            onClick={() => scrollToSection('jobs-here')} 
                            className={`text-sm font-bold transition-all hover:scale-105 active:scale-95 ${isScrolled ? 'text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-500' : 'text-white/80 hover:text-white'}`}
                        >
                            Find Jobs
                        </button>
                        <button 
                            onClick={() => navigate('/')} 
                            className={`text-sm font-bold transition-all hover:scale-105 active:scale-95 ${isScrolled ? 'text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-500' : 'text-white/80 hover:text-white'}`}
                        >
                            Companies
                        </button>
                    </div>

                    <div className="flex-1 lg:hidden"></div>

                    {/* Right side actions */}
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-2.5 rounded-full transition-colors border ${isScrolled ? 'hover:bg-emerald-100/50 dark:hover:bg-white/10 border-transparent dark:hover:border-white/20' : 'hover:bg-white/10 dark:hover:bg-[#262933] border-transparent dark:hover:border-[#303340]'}`}
                        aria-label="Toggle Theme"
                    >
                        {!isDarkMode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-[18px] w-[18px] ${isScrolled ? 'text-slate-600' : 'text-white'}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-[18px] w-[18px] ${isScrolled ? 'text-white/90' : 'text-slate-400'}`} viewBox="0 0 20 20" fill="currentColor">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={() => { setIsDrawerOpen(true); setAuthView(null); }}
                        className={`flex items-center gap-2.5 pl-4 pr-1.5 py-1.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md group border ${isScrolled ? 'bg-white hover:bg-slate-50 dark:bg-white/10 dark:hover:bg-white/20 dark:backdrop-blur-md border-slate-200 dark:border-white/20' : 'bg-white/10 hover:bg-white/20 backdrop-blur-md dark:bg-[#1a1d24] dark:hover:bg-[#262933] border-white/20 dark:border-[#303340]'}`}
                    >
                        <p className={`text-sm font-bold transition-colors ${isScrolled ? 'text-slate-900 dark:text-white' : 'text-white'}`}>Sign In</p>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden backdrop-blur-sm ${isScrolled ? 'bg-emerald-600 dark:bg-white/20' : 'bg-white/20 dark:bg-slate-800'}`}>
                            <User size={16} className={isScrolled ? 'text-white dark:text-white' : 'text-white dark:text-slate-400'} />
                        </div>
                    </button>
                </div>
            </header>

            <main className="flex-1 w-full pt-20 transition-colors relative isolate">

                {/* HERO SECTION */}
                <section className="relative px-4 lg:px-8 pt-16 pb-24 md:pt-24 md:pb-32 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Left Typography */}
                    <div className="flex-1 text-center lg:text-left z-10 animate-fade-in pl-4 lg:pl-0">
                        {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-white/10 dark:bg-white/5 text-white font-bold text-xs sm:text-sm mb-8 border border-white/20 shadow-sm backdrop-blur-sm">
                            <Star size={16} className="fill-[#009966] text-[#009966]" /> Connect Your Community
                        </div> */}

                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                            Smart way to <br className="hidden lg:block" />
                            <span className="text-emerald-500">manage talent.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed opacity-90">
                            Planning today lays the foundation for a secure and successful tomorrow. Connect with professionals or hire reliable talent right in your neighborhood.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <button
                                onClick={() => { setIsDrawerOpen(true); setAuthView('signup'); }}
                                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 px-8 rounded-sm text-lg transition-all transform hover:-translate-y-1 hover:shadow-xl shadow-lg flex items-center justify-center gap-2"
                            >
                                Get Started <ArrowRight size={20} />
                            </button>
                            <button
                                onClick={() => { setIsDrawerOpen(true); setAuthView('signup'); }}
                                className="w-full sm:w-auto bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white font-extrabold py-4 px-8 rounded-sm text-lg transition-all transform hover:-translate-y-1 hover:shadow-lg shadow-sm flex items-center justify-center gap-2 group"
                            >
                                Post a Job <Building2 size={20} className="text-white/70 group-hover:text-white transition-colors" />
                            </button>
                        </div>
                    </div>

                    {/* Right Hero Image Slider */}
                    <div className="flex-1 w-full relative h-[450px] lg:h-[600px] hidden md:flex gap-4 overflow-hidden  z-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        {/* Decorative background glow */}
                        <div className="absolute inset-0 bg-[#009966]/5 rounded-sm blur-2xl transform rotate-3"></div>

                        {/* Gradient Masks for smooth top/bottom fading */}
                        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#1d3124]/50 dark:from-[#0a0f14]/50 to-transparent z-20 pointer-events-none"></div>
                        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#1d3124] dark:from-[#0a0f14] to-transparent z-20 pointer-events-none"></div>

                        {/* Column 1 - Scrolling UP */}
                        <div className="flex-1 h-full overflow-hidden relative rounded-sm">
                            <div className="flex flex-col gap-4 animate-scroll-up w-full absolute top-0">
                                {/* Duplicate the array to make the infinite scroll seamless */}
                                {[
                                    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80", // Cafe
                                    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=400&q=80", // Office
                                    "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=400&q=80", // Culinary 
                                    // Duplicated
                                    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80",
                                    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=400&q=80",
                                    "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=400&q=80",
                                ].map((src, i) => (
                                    <div key={i} className="w-full h-48 lg:h-64 rounded-sm overflow-hidden shadow-md flex-shrink-0">
                                        <img src={src} alt="Job Field" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Column 2 - Scrolling DOWN */}
                        <div className="flex-1 h-full overflow-hidden relative rounded-sm mt-8">
                            <div className="flex flex-col gap-4 animate-scroll-down w-full absolute top-0">
                                {/* Duplicate the array to make the infinite scroll seamless */}
                                {[
                                    "https://images.pexels.com/photos/16563661/pexels-photo-16563661.jpeg", // Library
                                    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=400&q=80", // Painting/Creative
                                    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80", // Retail/Sales
                                    // Duplicated
                                    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80",
                                    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=400&q=80",
                                    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80",
                                ].map((src, i) => (
                                    <div key={i} className="w-full h-48 lg:h-64 rounded-sm overflow-hidden shadow-md flex-shrink-0">
                                        <img src={src} alt="Job Field" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Floating Badge overlaying the slider */}
                        {/* <div className="absolute bottom-6 left-[10%] right-[10%] z-30 bg-white dark:bg-[#16181d] opacity-95 rounded-sm p-4 border border-slate-100 dark:border-[#303340] shadow-2xl flex items-center flex-wrap sm:flex-nowrap justify-center gap-4 hover:scale-105 transition-transform duration-300 cursor-pointer">
                            <div className="flex -space-x-3">
                                <img src="https://i.pravatar.cc/150?img=1" alt="Avatar" className="w-10 h-10 rounded-sm border-2 border-white object-cover" />
                                <img src="https://i.pravatar.cc/150?img=2" alt="Avatar" className="w-10 h-10 rounded-sm border-2 border-white object-cover" />
                                <img src="https://i.pravatar.cc/150?img=3" alt="Avatar" className="w-10 h-10 rounded-sm border-2 border-white object-cover" />
                                <img src="https://i.pravatar.cc/150?img=4" alt="Avatar" className="w-10 h-10 rounded-sm border-2 border-white object-cover" />
                            </div>
                            <div className="text-left leading-tight sm:pl-2">
                                <span className="font-extrabold text-sm text-slate-900 dark:text-white block">10M+</span>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">People are joined</span>
                            </div>
                        </div> */}
                    </div>
                </section>



                {/* HOW IT WORKS */}
                <section id="how-it-works" className="py-16 bg-[#EBF5F4] dark:bg-[#1a1d24]">
                    <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">How HoodHire Works.</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed">Discover a simple way to take the next step in your career. From finding the right job to connecting with employers, everything happens in just a few easy steps.</p>
                    </div>

                    <div className="max-w-6xl mx-auto px-4 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
                        {/* Left Image Collage */}
                        <div className="flex-1 relative w-full aspect-square md:aspect-video lg:aspect-square">
                            <div className="absolute inset-0 md:inset-4 lg:inset-8 bg-slate-200 rounded-sm overflow-hidden shadow-lg border-4 border-white">
                                <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80" alt="Working" className="w-full h-full object-cover" />
                            </div>

                            {/* Overlay Card 1 */}
                            <div className="absolute -left-4 md:-left-12 lg:-left-2 top-12 bg-white p-4 rounded-sm shadow-xl flex items-center gap-4 border border-slate-100 hover:-translate-y-1 transition-transform">
                                <div className="w-10 h-10 rounded-sm bg-blue-100 flex items-center justify-center text-blue-500"><Briefcase size={18} /></div>
                                <div>
                                    <div className="font-extrabold text-xl text-slate-900 leading-none">1,234</div>
                                    <div className="text-xs text-slate-500 font-medium mt-1">Posted Jobs</div>
                                </div>
                                <div className="h-1 w-8 bg-slate-100 rounded-sm overflow-hidden ml-2"><div className="h-full bg-red-400 w-[60%]"></div></div>
                            </div>

                            {/* Overlay Card 2 */}
                            <div className="absolute -right-4 md:-right-12 lg:-right-2 bottom-12 bg-white p-4 rounded-sm shadow-xl flex items-center gap-4 border border-slate-100 hover:-translate-y-1 transition-transform">
                                <div className="w-10 h-10 rounded-sm bg-[#009966]/20 flex items-center justify-center text-[#009966]"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></svg></div>
                                <div>
                                    <div className="font-extrabold text-xl text-slate-900 leading-none">4,567</div>
                                    <div className="text-xs text-slate-500 font-medium mt-1">Interviews</div>
                                </div>
                                <div className="h-1 w-8 bg-slate-100 rounded-sm overflow-hidden ml-2"><div className="h-full bg-[#009966] w-[80%]"></div></div>
                            </div>
                        </div>

                        {/* Right Steps */}
                        <div className="flex-1 flex flex-col gap-10 lg:pl-16">
                            {/* Step 1 */}
                            <div className="flex gap-6 relative group">
                                <div className="absolute left-7 top-16 bottom-[-40px] w-px border-l-2 border-dashed border-[#009966]/30 z-0 hidden sm:block"></div>
                                <div className="relative z-10 w-14 h-14 shrink-0 bg-white border-2 border-[#009966] rounded-sm flex items-center justify-center font-extrabold text-2xl text-[#009966] shadow-md transform group-hover:scale-110 transition-transform">01</div>
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight mt-1">Search and Apply</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Browse thousands of job opportunities that match your skills and interests securely through our portal.</p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-6 relative group">
                                <div className="absolute left-7 top-16 bottom-[-40px] w-px border-l-2 border-dashed border-[#009966]/30 z-0 hidden sm:block"></div>
                                <div className="relative z-10 w-14 h-14 shrink-0 bg-[#009966]/10 border-2 border-[#009966] rounded-sm flex items-center justify-center font-extrabold text-2xl text-[#009966] shadow-md transform group-hover:scale-110 transition-transform">02</div>
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight mt-1">Connect and Communicate</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Chat directly with locals and employers through HoodHire's built-in messaging to finalize the details.</p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-6 group">
                                <div className="relative z-10 w-14 h-14 shrink-0 bg-white border-2 border-[#009966] rounded-sm flex items-center justify-center font-extrabold text-2xl text-[#009966] shadow-md transform group-hover:scale-110 transition-transform">03</div>
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight mt-1">Find Part-Time Gigs</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Secure reliable weekend work or flexible part-time gigs that fit perfectly into your local lifestyle.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES GRID */}


                {/* BOTTOM CTA - SPLIT SECTION */}
                <section id="jobs-here" className="pt-10 px-4 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="flex-1 w-full relative">
                        <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#009966]/20 dark:bg-[#009966]/10 rounded-sm blur-[40px] z-0"></div>
                        <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-sm blur-[40px] z-0"></div>
                        <div className="relative rounded-sm overflow-hidden shadow-2xl aspect-[4/3] group z-10 ring-1 ring-slate-200/50 dark:ring-white/10">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                            <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="Local team working together" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                    </div>
                    <div className="flex-1 text-center lg:text-left z-10">
                        <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
                            A Great Career Begins With A <span className="text-[#009966] dark:text-[#009966]">Trusted Local Business</span>
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                            Discover reliable neighborhood businesses actively looking for team members. We verify every company to ensure you find safe, sustainable, and rewarding opportunities just around the corner.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <button
                                onClick={() => navigate('/jobs')}
                                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                Search Jobs
                            </button>
                            <button
                                onClick={() => navigate('/companies')}
                                className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-[#1a1d24] text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-[#303340] hover:border-emerald-500 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold rounded-sm transition-all shadow-sm hover:shadow-md"
                            >
                                Learn More
                            </button>
                        </div>
                    </div>
                </section>

                {/* BOTTOM CTA - STATS */}
                <section id="why-us" className="py-16 max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Why choose HoodHire?</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium text-lg">We've built the easiest way to manage local employment, whether you're hiring for your shop or looking for weekend work.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Feature 1 */}
                        <div className="bg-white dark:bg-[#1a1d24] border border-slate-100 dark:border-[#262933] rounded-sm p-8 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 shadow-sm">
                            <div className="w-10 h-10 rounded-sm bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-100 dark:border-slate-700">
                                <Briefcase size={20} className="text-slate-600 dark:text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Build Profile</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-sm">Create a verified local profile and stand out.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white dark:bg-[#1a1d24] border border-slate-100 dark:border-[#262933] rounded-sm p-8 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 shadow-sm">
                            <div className="w-10 h-10 rounded-sm bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-100 dark:border-slate-700">
                                <Zap size={20} className="text-slate-600 dark:text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Get hired faster</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-sm">Matches connect you with nearby gigs quickly.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white dark:bg-[#1a1d24] border border-slate-100 dark:border-[#262933] rounded-sm p-8 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 shadow-sm">
                            <div className="w-10 h-10 rounded-sm bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-100 dark:border-slate-700">
                                <Clock size={20} className="text-slate-600 dark:text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Flexible Times</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-sm">Choose exactly when & where you want to work.</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white dark:bg-[#1a1d24] border border-slate-100 dark:border-[#262933] rounded-sm p-8 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 shadow-sm">
                            <div className="w-10 h-10 rounded-sm bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-100 dark:border-slate-700">
                                <ShieldCheck size={20} className="text-slate-600 dark:text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 tracking-tight">No Experience</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-sm">Find entry-level neighborhood opportunities.</p>
                        </div>
                    </div>
                </section>


                {/* BOTTOM CTA - BANNER */}
                <section className="  mb-8 px-4 max-w-6xl mx-auto mt-8">
                    <div className="bg-[#0f172a] dark:bg-black rounded-sm md:rounded-sm p-8 md:p-14 relative overflow-hidden shadow-2xl border border-slate-800 flex flex-col md:flex-row items-center">
                        {/* Background Image/Overlay */}
                        <div className="absolute inset-0 z-0 opacity-40">
                            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="Team" className="w-full h-full object-cover blur-[2px]" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-0"></div>

                        <div className="relative z-10 md:w-2/3 text-center md:text-left">
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                                Build A Stronger Future <br className="hidden md:block" />
                                <span className="text-white">In Your Community</span>
                            </h2>
                            <p className="text-slate-300 max-w-xl mx-auto md:mx-0 font-medium text-base mb-8 leading-relaxed">
                                Avoid long commutes and stressful environments. Discover careers that fit your lifestyle, right in your neighborhood.
                            </p>

                            <button
                                onClick={() => { setIsDrawerOpen(true); setAuthView('signup'); }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-8 rounded-sm text-sm transition-all shadow-xl hover:shadow-emerald-600/20 transform hover:-translate-y-1 inline-block"
                            >
                                Join Us Now
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />

            {/* Drawer Overlay */}
            {
                isDrawerOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm z-50 animate-fade-in transition-opacity"
                        onClick={closeDrawer}
                    ></div>
                )
            }

            {/* Right Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white dark:bg-[#0f1115] border-l border-white/20 dark:border-[#262933] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-[#262933] flex justify-between items-center bg-white/50 dark:bg-[#16181d]/50 backdrop-blur-md transition-colors">
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#f8fafc] tracking-tight">
                        {authView === 'signup' ? 'Create Account' :
                            authView === 'login' ? 'Welcome Back' : 'Account Overview'}
                    </h2>
                    <button
                        onClick={closeDrawer}
                        className="p-2.5 bg-slate-50 dark:bg-[#1a1d24] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-sm transition-all border border-slate-200 dark:border-[#303340] hover:shadow-md"
                    >
                        <User size={18} className="hidden" />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className={`flex-1 overflow-y-auto flex flex-col relative ${!authView ? '' : 'p-6 md:p-8 gap-6'}`}>

                    {!authView && (
                        <div className="animate-fade-in flex flex-col h-full bg-slate-50/50 dark:bg-transparent">
                            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 bg-gradient-to-br from-[#009966]/10 to-white dark:from-[#16181d] dark:to-[#0f1115] border-b border-slate-200 dark:border-[#262933] group transition-colors">

                                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-[#f8fafc] mb-3 tracking-tight">New to HoodHire?</h3>
                                <p className="text-slate-500 dark:text-[#94a3b8] mb-8 text-center max-w-[280px] font-medium leading-relaxed">Join today to find verified local work or hire talent in minutes.</p>
                                <button
                                    onClick={() => setAuthView('signup')}
                                    className="w-full py-4 bg-[#009966] hover:bg-[#009966] text-white font-extrabold rounded-sm shadow-lg shadow-[#009966]/20 transition-all transform hover:-translate-y-1 text-lg"
                                >
                                    Sign Up Free
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 bg-white dark:bg-[#0f1115] group transition-colors">

                                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-[#f8fafc] mb-3 tracking-tight">Already a member?</h3>
                                <p className="text-slate-500 dark:text-[#94a3b8] mb-8 text-center max-w-[280px] font-medium leading-relaxed">Welcome back! Log in to access your dashboard and messages.</p>
                                <button
                                    onClick={() => navigateToAuth('/login')}
                                    className="w-full py-4 bg-white dark:bg-[#16181d] border-2 border-slate-200 dark:border-[#303340] hover:border-[#009966] dark:hover:border-[#009966] hover:text-[#009966] dark:hover:text-[#009966] text-slate-800 dark:text-white font-bold rounded-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-1 text-lg"
                                >
                                    Log In
                                </button>
                            </div>
                        </div>
                    )}

                    {authView === 'signup' && (
                        <div className="animate-fade-in flex flex-col gap-6">

                            <div className="bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#303340] rounded-sm p-6 relative overflow-hidden group hover:border-[#009966] dark:hover:border-[#009966]/50 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer" onClick={() => navigateToAuth('/signin/seeker')}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#009966]/5 dark:bg-[#009966]/5 rounded-sm blur-[40px] group-hover:bg-[#009966]/10 transition-colors"></div>
                                <div className="relative z-10 flex items-start gap-4">
                                    <div className="w-12 h-12 shrink-0 rounded-sm bg-[#009966]/10 dark:bg-[#009966]/10 flex items-center justify-center border border-[#009966]/20 dark:border-[#009966]/20 group-hover:scale-110 transition-transform">
                                        <Briefcase size={22} className="text-[#009966]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-[#f8fafc] mb-1">Looking for a job</h3>
                                        <p className="text-sm text-slate-500 dark:text-[#94a3b8] font-medium mb-4 leading-relaxed">Discover part-time work near you and apply with a single click.</p>
                                        <span className="text-sm font-bold text-[#009966] dark:text-[#009966] group-hover:underline flex items-center gap-1">Create Seeker Account <ArrowRight size={14} /></span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative flex items-center justify-center my-2">
                                <div className="absolute w-full h-px bg-slate-200 dark:bg-[#303340]"></div>
                                <span className="relative z-10 bg-white dark:bg-[#0f1115] px-4 text-[10px] font-black text-slate-400 dark:text-[#475569] uppercase tracking-widest">OR CHOOSE</span>
                            </div>

                            <div className="bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#303340] rounded-sm p-6 relative overflow-hidden group hover:border-blue-400 dark:hover:border-blue-500/50 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer" onClick={() => navigateToAuth('/signin/hirer')}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 dark:bg-blue-500/5 rounded-sm blur-[40px] group-hover:bg-blue-400/10 transition-colors"></div>
                                <div className="relative z-10 flex items-start gap-4">
                                    <div className="w-12 h-12 shrink-0 rounded-sm bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 group-hover:scale-110 transition-transform">
                                        <Building2 size={22} className="text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-[#f8fafc] mb-1">Looking to hire</h3>
                                        <p className="text-sm text-slate-500 dark:text-[#94a3b8] font-medium mb-4 leading-relaxed">Post jobs and find verified local talent for your business.</p>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-500 group-hover:underline flex items-center gap-1">Create Employer Account <ArrowRight size={14} /></span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setAuthView(null)}
                                className="mt-8 text-sm font-bold text-slate-500 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-white transition-colors self-center flex items-center gap-2 border border-slate-200 dark:border-[#303340] py-2 px-4 rounded-sm bg-slate-50 dark:bg-[#1a1d24]"
                            >
                                ← Back to options
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default GuestHome;
