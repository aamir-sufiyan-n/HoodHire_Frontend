import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, MapPin, Briefcase, ExternalLink, Users, Star, ArrowRight, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { jobsAPI } from '../api/jobs';
import { seekerAPI } from '../api/seeker';
import Footer from './Footer';
import GlobalNavbar from './GlobalNavbar';

const CompaniesDirectory = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [activeLocation, setActiveLocation] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'favorites'
    const [favoritedBusinessIds, setFavoritedBusinessIds] = useState([]);
    const [isFavoritingId, setIsFavoritingId] = useState(null);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const companiesPerPage = 6;

    const isDarkMode = document.documentElement.classList.contains('dark');

    const handleSuggestionClick = (suggestionText) => {
        setSearchTerm(suggestionText);
        setShowSuggestions(false);
        // Do not auto-submit here per user request "replace the search text with the recomendation" 
    };

    const handleSearchSubmit = () => {
        setActiveSearch(searchTerm);
        setActiveLocation(searchLocation);
        setCurrentPage(1); // Reset page on new search
        setShowSuggestions(false);
    };

    useEffect(() => {
        const fetchCompanies = async () => {
            setLoading(true);
            try {
                const [bizRes, jobsRes] = await Promise.all([
                    jobsAPI.getAllBusinesses().catch(() => ({ businesses: [] })),
                    jobsAPI.getAllJobs().catch(() => ({ jobs: [] }))
                ]);

                const allBusinesses = bizRes.businesses || [];
                const allJobs = jobsRes.jobs || [];

                // Map jobs by BusinessID for quick lookup
                const jobsByBusiness = allJobs.reduce((acc, job) => {
                    const bizId = job.BusinessID || job.Business?.ID;
                    if (bizId) {
                        if (!acc[bizId]) acc[bizId] = [];
                        acc[bizId].push(job);
                    }
                    return acc;
                }, {});

                // Enhance business objects with open jobs
                const enhancedBusinesses = allBusinesses.map(biz => ({
                    ...biz,
                    openJobs: jobsByBusiness[biz.ID] || []
                }));

                // Sort by number of open jobs (optional)
                enhancedBusinesses.sort((a, b) => b.openJobs.length - a.openJobs.length);

                setCompanies(enhancedBusinesses);
            } catch (error) {
                console.error("Failed to fetch jobs for companies directory:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();

        // Also load favorited businesses if seeker
        if (user?.role === 'seeker') {
            seekerAPI.getFavoriteBusinesses()
                .then(res => {
                    const items = res?.saved || [];
                    setFavoritedBusinessIds(items.map(f => Number(f.BusinessID)));
                })
                .catch(() => {});
        }
    }, []);

    const searchSuggestions = companies
        .map(c => c.BusinessName)
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index)
        .filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 5);

    const filteredCompanies = companies.filter(company => {
        let match = true;

        if (activeSearch) {
            const term = activeSearch.toLowerCase();
            const matchesName = company.BusinessName?.toLowerCase().includes(term) || company.Industry?.toLowerCase().includes(term);
            const matchesDesc = company.Description?.toLowerCase().includes(term);
            if (!matchesName && !matchesDesc) match = false;
        }

        if (activeLocation) {
            const loc = activeLocation.toLowerCase();
            const matchesLoc = company.City?.toLowerCase().includes(loc) || company.Locality?.toLowerCase().includes(loc);
            if (!matchesLoc) match = false;
        }

        return match;
    });

    const handleFavoriteToggle = async (e, businessId) => {
        e.stopPropagation();
        if (!user) { return; }
        const isFav = favoritedBusinessIds.includes(Number(businessId));
        setIsFavoritingId(businessId);
        try {
            if (isFav) {
                await seekerAPI.unfavoriteBusiness(businessId);
                setFavoritedBusinessIds(prev => prev.filter(id => id !== Number(businessId)));
            } else {
                await seekerAPI.favoriteBusiness(businessId);
                setFavoritedBusinessIds(prev => [...prev, Number(businessId)]);
            }
        } catch (_) {}
        finally { setIsFavoritingId(null); }
    };

    const displayedCompanies = activeTab === 'favorites'
        ? filteredCompanies.filter(c => favoritedBusinessIds.includes(Number(c.ID)))
        : filteredCompanies;

    // Pagination calculations
    const totalPages = Math.ceil(displayedCompanies.length / companiesPerPage);
    const paginatedCompanies = displayedCompanies.slice(
        (currentPage - 1) * companiesPerPage,
        currentPage * companiesPerPage
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-[#f8fafc] font-sans overflow-hidden flex flex-col relative selection:bg-orange-500/30 transition-colors duration-300">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-400/10 dark:bg-[#009966]/5 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
                <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/10 dark:bg-blue-600/5 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
            </div>

            {/* Global Navbar */}
            <GlobalNavbar />

            <main className="flex-1 mt-20 w-full pt-10 pb-16 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">

                    {/* Header Section */}
                    <div className="text-center mb-12 relative">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                            Discover Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-[#009966]">Companies</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg mb-8 leading-relaxed">
                            Explore hundreds of businesses actively hiring in your neighborhood. Find a workplace culture that empowers your career growth.
                        </p>

                        {/* Relocated Search Bar */}
                        <div className="flex-1 w-full max-w-2xl mx-auto bg-white dark:bg-[#16181d] rounded-full border border-gray-200 dark:border-[#262933] p-1.5 flex items-center gap-2 transition-all hover:border-[#009966]/40 focus-within:border-[#009966]/60 premium-shadow relative z-50">
                            <div className="flex-[1.5] flex items-center px-4">
                                <Search className="h-4 w-4 text-[#009966] mr-2 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search companies, industry..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowSuggestions(e.target.value.length > 0);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearchSubmit();
                                            e.target.blur();
                                        }
                                    }}
                                    onFocus={() => {
                                        if (searchTerm.length > 0) setShowSuggestions(true);
                                    }}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    className="w-full bg-transparent border-none outline-none text-slate-700 dark:text-[#f8fafc] placeholder:text-slate-400 text-sm py-2"
                                />
                            </div>

                            <div className="w-px h-8 bg-slate-200 dark:bg-[#262933]"></div>

                            <div className="flex-1 flex items-center px-3">
                                <MapPin className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder="City or location"
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearchSubmit();
                                            e.target.blur();
                                        }
                                    }}
                                    className="w-full bg-transparent border-none outline-none text-slate-700 dark:text-[#f8fafc] placeholder:text-slate-400 text-sm py-2"
                                />
                            </div>

                            <button
                                onClick={handleSearchSubmit}
                                className="px-6 py-2.5 bg-[#009966] hover:bg-[#008855] text-white font-bold rounded-full transition-all text-sm flex-shrink-0 shadow-md shadow-[#009966]/20 hover:shadow-lg hover:shadow-[#009966]/40 transform hover:-translate-y-0.5 border-none"
                            >
                                Search
                            </button>

                            {/* Search Autosuggestions Dropdown */}
                            {showSuggestions && searchSuggestions.length > 0 && (
                                <div className="absolute top-full mt-2 w-full left-0 bg-white dark:bg-[#16181d] border border-slate-100 dark:border-[#262933] rounded-xl premium-shadow overflow-hidden z-50">
                                    {searchSuggestions.map((suggestion, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-[#1f2229] cursor-pointer flex items-center gap-3 transition-colors text-sm text-slate-700 dark:text-slate-300"
                                        >
                                            <Search size={14} className="text-slate-400" />
                                            <span className="capitalize">{suggestion}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-[#303340] mb-8">
                        <button
                            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                            className={`pb-3 text-[14px] px-1 mr-8 bg-transparent border-none font-extrabold transition-all relative ${
                                activeTab === 'all' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            All Companies <span className="text-[11px] font-black text-slate-400">({filteredCompanies.length})</span>
                            {activeTab === 'all' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-slate-900 dark:bg-white rounded-t-sm"></div>}
                        </button>
                        {user?.role === 'seeker' && (
                            <button
                                onClick={() => { setActiveTab('favorites'); setCurrentPage(1); }}
                                className={`pb-3 text-[14px] px-1 bg-transparent border-none font-extrabold transition-all relative ${
                                    activeTab === 'favorites' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                Favorites <span className="text-[11px] font-black text-slate-400">({favoritedBusinessIds.length})</span>
                                {activeTab === 'favorites' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-slate-900 dark:bg-white rounded-t-sm"></div>}
                            </button>
                        )}
                    </div>

                    {/* Content Section */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Loading companies...</p>
                        </div>
                    ) : (
                        <>
                            {displayedCompanies.length === 0 ? (
                                <div className="bg-white/50 dark:bg-[#16181d]/50 border border-slate-200 dark:border-[#262933] rounded-md p-16 text-center premium-shadow max-w-2xl mx-auto">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-[#262933] rounded-md flex items-center justify-center mx-auto mb-6 text-slate-400">
                                        <Building2 size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No companies found</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-6">We couldn't find any businesses matching your search criteria.</p>
                                    <button onClick={() => setSearchTerm('')} className="text-[#009966] font-bold hover:underline">Clear search filters</button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {paginatedCompanies.map(company => (
                                            <div
                                                key={company.ID}
                                                onClick={() => navigate(`/companies/${company.ID}`)}
                                                className="bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-md p-6 premium-shadow hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
                                            >
                                                <div className="flex items-start gap-4 mb-5 relative">
                                                    <div className={`w-16 h-16 bg-slate-50 dark:bg-[#1a1d24] rounded-md flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0 ${(company.Hirer?.IsPRO || company.IsPRO) ? 'border-2 border-[#0095F6]' : 'border border-slate-100 dark:border-[#303340]'}`}>
                                                        {(company.ProfilePicture || company.LogoUrl) ? (
                                                            <img src={company.ProfilePicture || company.LogoUrl} alt={company.BusinessName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-2xl font-extrabold text-slate-300 dark:text-slate-600 uppercase">
                                                                {company.BusinessName?.charAt(0) || 'B'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Roles + Followers inline next to logo */}
                                                    <div className="flex flex-col gap-1.5 pt-0.5">
                                                        <div className="bg-[#009966]/10 text-[#009966] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-[#009966]/20 w-fit">
                                                            <Briefcase size={12} />
                                                            {company.openJobs.length} {company.openJobs.length === 1 ? 'Role' : 'Roles'}
                                                        </div>
                                                        <div className="flex flex-col gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                            <div className="flex items-center gap-1">
                                                                <Users size={11} className="text-slate-400" />
                                                                {company.FollowerCount || 0} Followers
                                                            </div>
                                                            {company.AverageRating > 0 && (
                                                                <div className="flex items-center gap-1 text-orange-500">
                                                                    <Star size={10} fill="currentColor" />
                                                                    {company.AverageRating?.toFixed(1)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Star (favorite) — absolute top-right */}
                                                    {user?.role === 'seeker' && (
                                                        <button
                                                            onClick={(e) => handleFavoriteToggle(e, company.ID)}
                                                            className={`absolute top-0 right-0 p-1 bg-transparent border-none transition-colors ${
                                                                favoritedBusinessIds.includes(Number(company.ID))
                                                                ? 'text-orange-500'
                                                                : 'text-slate-300 dark:text-slate-600 hover:text-orange-400'
                                                            }`}
                                                            title={favoritedBusinessIds.includes(Number(company.ID)) ? "Unfavorite" : "Favorite"}
                                                        >
                                                            {isFavoritingId === company.ID ? (
                                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <Star size={17} fill={favoritedBusinessIds.includes(Number(company.ID)) ? "currentColor" : "none"} strokeWidth={2} />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1 group-hover:text-[#009966] transition-colors line-clamp-1 flex items-center gap-1.5">
                                                        {company.BusinessName}
                                                        {(company.Hirer?.IsPRO || company.IsPRO) && (
                                                            <CheckCircle2 size={16} className="text-[#0095F6] fill-[#0095F6]/10 shrink-0" title="Verified Business" />
                                                        )}
                                                    </h3>
                                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
                                                        <MapPin size={14} /> {company.Locality || company.City || 'Multiple Locations'}
                                                    </p>

                                                    <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-6 leading-relaxed">
                                                        {company.Bio || "An expanding enterprise looking for talented individuals to join their growing team and make an impact."}
                                                    </div>
                                                </div>

                                                <div className="pt-5 border-t border-slate-100 dark:border-[#262933] flex items-center justify-between text-sm font-bold mt-auto">
                                                    <span className="text-slate-500 group-hover:text-[#009966] transition-colors flex items-center gap-1.5">
                                                        View Profile
                                                    </span>
                                                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-[#1a1d24] flex items-center justify-center group-hover:bg-[#009966]/10 group-hover:translate-x-1 transition-all">
                                                        <ArrowRight size={16} className="text-slate-400 group-hover:text-[#009966]" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between mt-4 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] premium-shadow rounded-md p-3">
                                            <span className="text-sm font-medium text-slate-500 ml-2">
                                                Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of {totalPages}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className="p-2 rounded-sm border border-slate-200 dark:border-[#303340] text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#262933] transition-colors"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                    className="p-2 rounded-sm border border-slate-200 dark:border-[#303340] text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#262933] transition-colors"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CompaniesDirectory;
