import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Twitter, Briefcase } from 'lucide-react';

const Footer = () => {
    const navigate = useNavigate();
    return (
        <footer className="bg-white dark:bg-[#1a1d24] text-slate-900 dark:text-white pt-20 pb-8 border-t border-slate-200 dark:border-[#262933] transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
                    {/* Brand */}
                    <div className="md:col-span-5 lg:col-span-5">
                        <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => {
                            const userStr = localStorage.getItem('user');
                            const user = userStr ? JSON.parse(userStr) : null;
                            if (user?.role === 'seeker') navigate('/seeker');
                            else if (user?.role === 'hirer') navigate('/hirer');
                            else navigate('/');
                        }}>
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                <Briefcase size={22} className="text-orange-500" />
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight">HoodHire</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
                            HoodHire is the cornerstone of managing your career effectively, ensuring stability, and fostering growth from discovering jobs to getting hired.
                        </p>
                    </div>

                    {/* Help */}
                    <div className="md:col-span-2 lg:col-span-2">
                        <h4 className="text-slate-900 dark:text-white font-semibold mb-6">Help</h4>
                        <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                            <li><a href="#" className="hover:text-orange-400 transition-colors">Home</a></li>
                            <li><a href="#" className="hover:text-orange-400 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-orange-400 transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="md:col-span-2 lg:col-span-2">
                        <h4 className="text-slate-900 dark:text-white font-semibold mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                            <li><a href="#" className="hover:text-orange-400 transition-colors">Our Story</a></li>
                            <li><a href="#" className="hover:text-orange-400 transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-orange-400 transition-colors">Features</a></li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div className="md:col-span-3 lg:col-span-3">
                        <h4 className="text-slate-900 dark:text-white font-semibold mb-6">Social media</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1a1d24] hover:bg-orange-500 dark:hover:bg-orange-500 border border-slate-200 dark:border-[#262933] hover:border-orange-500 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm">
                                <Facebook size={16} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1a1d24] hover:bg-orange-500 dark:hover:bg-orange-500 border border-slate-200 dark:border-[#262933] hover:border-orange-500 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm">
                                <Instagram size={16} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1a1d24] hover:bg-orange-500 dark:hover:bg-orange-500 border border-slate-200 dark:border-[#262933] hover:border-orange-500 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm">
                                <Linkedin size={16} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1a1d24] hover:bg-orange-500 dark:hover:bg-orange-500 border border-slate-200 dark:border-[#262933] hover:border-orange-500 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm">
                                <Twitter size={16} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 dark:text-slate-400 pt-8 border-t border-slate-200 dark:border-[#262933]/50 gap-6">
                    <p>© HoodHire 2026</p>
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                        <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Legal Stamp</a>
                        <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Cookies Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
