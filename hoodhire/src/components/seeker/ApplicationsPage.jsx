import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import Footer from '../Footer';
import GlobalNavbar from '../GlobalNavbar';
import MyApplicationsView from './MyApplicationsView';

const ApplicationsPage = () => {
    const navigate = useNavigate();
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-[#f8fafc] font-sans overflow-hidden flex flex-col relative selection:bg-[#009966]/30 transition-colors duration-300">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#009966]/10 dark:bg-[#009966]/5 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/10 dark:bg-blue-600/5 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
            </div>

            {/* Global Navbar */}
            <GlobalNavbar />

            <main className="flex-1 mt-20 w-full pt-8 pb-16 z-10">
                <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
                    <button onClick={() => navigate('/seeker')} className="mb-6 text-sm font-bold text-slate-500 hover:text-[#009966] dark:text-slate-400 dark:hover:text-[#009966] transition-colors">
                        &larr; Back to Dashboard
                    </button>
                    <MyApplicationsView />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ApplicationsPage;
