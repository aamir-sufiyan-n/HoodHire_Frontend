import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Building2, MapPin, Globe, Users, Star, ArrowLeft, Briefcase, Mail, 
    Calendar, Clock, CheckCircle2, MoreVertical, Flag, Share2, 
    MessageCircle, ShieldCheck, Heart, Bookmark, User, Phone
} from 'lucide-react';
import { jobsAPI } from '../api/jobs';
import { seekerAPI } from '../api/seeker';
import { toast } from 'react-hot-toast';
import Footer from './Footer';
import GlobalNavbar from './GlobalNavbar';
import BusinessReviewForm from './reviews/BusinessReviewForm';
import TicketModal from './support/TicketModal';

const CompanyDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [companyInfo, setCompanyInfo] = useState(null);
    const [companyJobs, setCompanyJobs] = useState([]);
    const [similarCompanies, setSimilarCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
    const [hasBond, setHasBond] = useState(false);
    
    // Review State
    const [reviews, setReviews] = useState([]);
    const [myReview, setMyReview] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [isReviewLoading, setIsReviewLoading] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);

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

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            setLoading(true);
            try {
                const [bizRes, jobsRes, allBizRes] = await Promise.all([
                    jobsAPI.getBusinessById(id).catch(() => null),
                    jobsAPI.getAllJobs().catch(() => ({ jobs: [] })),
                    jobsAPI.getAllBusinesses().catch(() => ({ businesses: [] })) // Assuming this endpoint exists, else abstract filter via backend
                ]);

                let currentBiz = null;
                if (bizRes?.business) {
                    currentBiz = bizRes.business;
                    setCompanyInfo(currentBiz);
                } else {
                    setCompanyInfo(null);
                }

                const allJobs = jobsRes?.jobs || [];
                const jobsForThisCompany = allJobs.filter(job => job.Business?.ID === parseInt(id) || job.BusinessID === parseInt(id));
                setCompanyJobs(jobsForThisCompany);

                // Initialize follower count
                if (currentBiz) {
                    setFollowerCount(currentBiz.FollowerCount || 0);
                }

                // Check if currently following
                if (user?.role === 'seeker') {
                    try {
                        const statusRes = await seekerAPI.checkFollowStatus(id);
                        setIsFollowing(!!statusRes.is_following);
                    } catch (err) {
                        console.error("Failed to fetch follow status", err);
                        setIsFollowing(false);
                    }

                    try {
                        const favRes = await seekerAPI.getFavoriteBusinesses();
                        const favList = favRes?.saved || [];
                        const found = favList.some(item => Number(item.BusinessID) === Number(id));
                        setIsFavorited(found);
                    } catch (err) {
                        console.error("Failed to fetch favorite status", err);
                        setIsFavorited(false);
                    }

                    try {
                        const bondRes = await seekerAPI.getBonds();
                        const bonds = bondRes?.bonds || [];
                        const foundBond = bonds.some(b => Number(b.BusinessID) === Number(id));
                        setHasBond(foundBond);
                    } catch (err) {
                        console.error("Failed to fetch bonds", err);
                    }
                }

                // Similar companies logic
                const allOrgs = allBizRes?.businesses || [];
                if (currentBiz && currentBiz.Niche && allOrgs.length > 0) {
                    // Filter matching niche, exclude current business
                    const similar = allOrgs.filter(b => b.Niche === currentBiz.Niche && b.ID !== currentBiz.ID);
                    setSimilarCompanies(similar.slice(0, 3)); // Show top 3
                } else {
                    setSimilarCompanies([]);
                }

                // Fetch Reviews
                const [reviewsRes, myReviewRes] = await Promise.all([
                    seekerAPI.getBusinessReviews(id).catch(() => ({ reviews: [] })),
                    user?.role === 'seeker' ? seekerAPI.getMyBusinessReview(id).catch(() => null) : Promise.resolve(null)
                ]);
                setReviews(reviewsRes.reviews || []);
                setMyReview(myReviewRes?.review || null);

            } catch (error) {
                console.error("Failed to fetch company details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyDetails();
    }, [id, user?.role]);

    const handleFollowToggle = async (bizId, currentFollowState) => {
        if (!user) {
            toast.error("Please login to follow businesses");
            navigate('/login');
            return;
        }

        if (user.role !== 'seeker') {
            toast.error("Only seekers can follow businesses");
            return;
        }

        setIsActionLoading(true);
        try {
            if (currentFollowState) {
                // Currently following -> Unfollow
                await seekerAPI.unfollowBusiness(bizId);
                if (parseInt(bizId) === parseInt(id)) {
                    setIsFollowing(false);
                    setFollowerCount(prev => Math.max(0, prev - 1));
                }
                toast.success("Unfollowed successfully");
            } else {
                // Not following -> Follow
                await seekerAPI.followBusiness(bizId);
                if (parseInt(bizId) === parseInt(id)) {
                    setIsFollowing(true);
                    setFollowerCount(prev => prev + 1);
                }
                toast.success("Following business!");
            }
        } catch (error) {
            console.error("Follow/Unfollow failed:", error);
            toast.error(error.message || "Action failed");
            
            // Re-sync state on failure to be sure
            try {
                const statusRes = await seekerAPI.checkFollowStatus(id);
                setIsFollowing(!!statusRes.is_following);
            } catch (e) {
                // ignore re-sync error
            }
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleFavoriteToggle = async () => {
        if (!user) {
            toast.error("Please login to favorite businesses");
            navigate('/login');
            return;
        }

        if (user.role !== 'seeker') {
            toast.error("Only seekers can favorite businesses");
            return;
        }

        setIsFavoriteLoading(true);
        try {
            if (isFavorited) {
                await seekerAPI.unfavoriteBusiness(id);
                setIsFavorited(false);
                toast.success("Removed from favorites");
            } else {
                await seekerAPI.favoriteBusiness(id);
                setIsFavorited(true);
                toast.success("Added to favorites!");
            }
        } catch (error) {
            console.error("Favorite toggle failed:", error);
            toast.error(error.message || "Action failed");
        } finally {
            setIsFavoriteLoading(false);
        }
    };

    const handleReviewSubmit = async (reviewData) => {
        setIsReviewLoading(true);
        try {
            let res;
            if (myReview) {
                res = await seekerAPI.updateBusinessReview(id, reviewData);
                toast.success("Review updated!");
            } else {
                res = await seekerAPI.createBusinessReview(id, reviewData);
                toast.success("Review posted!");
            }
            
            // Refresh data
            const [reviewsRes, bizRes] = await Promise.all([
                seekerAPI.getBusinessReviews(id),
                jobsAPI.getBusinessById(id)
            ]);
            
            setReviews(reviewsRes.reviews || []);
            setCompanyInfo(bizRes.business);
            setMyReview(res.review || null);
            setShowReviewForm(false);
        } catch (error) {
            toast.error(error.message || "Failed to submit review");
        } finally {
            setIsReviewLoading(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!window.confirm("Are you sure you want to delete your review?")) return;
        
        setIsReviewLoading(true);
        try {
            await seekerAPI.deleteBusinessReview(id);
            toast.success("Review deleted");
            
            // Refresh data
            const [reviewsRes, bizRes] = await Promise.all([
                seekerAPI.getBusinessReviews(id),
                jobsAPI.getBusinessById(id)
            ]);
            
            setReviews(reviewsRes.reviews || []);
            setCompanyInfo(bizRes.business);
            setMyReview(null);
        } catch (error) {
            toast.error(error.message || "Failed to delete review");
        } finally {
            setIsReviewLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0f1115] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#009966] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Loading company profile...</p>
            </div>
        );
    }

    if (!companyInfo) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-white dark:bg-[#262933] shadow-sm rounded-md flex items-center justify-center mx-auto mb-6 text-slate-400">
                    <Building2 size={40} />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Company Not Found</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
                    We couldn't find a company with this ID, or they currently have no active profile.
                </p>
                <button onClick={() => navigate('/companies')} className="px-6 py-3 bg-[#009966] hover:bg-[#008855] text-white font-bold rounded-md shadow-md transition-all border-none">
                    Back to Directory
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f1115] text-slate-900 dark:text-[#f8fafc] font-sans flex flex-col selection:bg-[#009966]/30 transition-colors duration-300">

            {/* Global Navbar */}
            <GlobalNavbar />

            <main className="flex-1 mt-16 w-full pt-6 pb-16 z-10">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 text-[13px] font-bold text-slate-500 hover:text-[#009966] dark:text-slate-400 transition-colors bg-transparent border-none p-0 group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>

                    {/* Company Profile Header */}
                    <div className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md p-8 shadow-sm mb-6 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-visible">
                        
                        {/* Top-Right Action Buttons */}
                        <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
                            <button 
                                className="p-2 text-slate-400 hover:text-[#009966] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-full transition-all border-none bg-transparent"
                                title="Share Company"
                                onClick={() => {}}
                            >
                                <Share2 size={18} />
                            </button>
                            <button 
                                onClick={() => setShowActionsMenu(!showActionsMenu)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#262933] rounded-full transition-all border-none bg-transparent"
                                title="More Actions"
                            >
                                <MoreVertical size={20} />
                            </button>

                            {showActionsMenu && (
                                <div className="absolute right-0 top-0 z-50">
                                    <div 
                                        className="fixed inset-0" 
                                        onClick={() => setShowActionsMenu(false)}
                                    ></div>
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-1">
                                            <button
                                                onClick={() => {
                                                    handleFavoriteToggle();
                                                    setShowActionsMenu(false);
                                                }}
                                                disabled={isFavoriteLoading}
                                                className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] font-bold rounded-md transition-colors border-none bg-transparent ${
                                                    isFavorited
                                                    ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10'
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#262933]'
                                                }`}
                                            >
                                                {isFavoriteLoading ? (
                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <Star size={16} fill={isFavorited ? 'currentColor' : 'none'} />
                                                )}
                                                {isFavorited ? 'Unfavorite' : 'Favorite'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowReportModal(true);
                                                    setShowActionsMenu(false);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors border-none bg-transparent"
                                            >
                                                <Flag size={16} />
                                                Report Business
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Left Column: Profile Picture */}
                        <div className="flex flex-col items-center gap-4 shrink-0">
                            <div className="w-[100px] h-[100px] md:w-[130px] md:h-[130px] shrink-0 bg-white dark:bg-[#16181d] rounded-md border border-slate-100 dark:border-[#303340] flex items-center justify-center p-0 overflow-hidden shadow-sm">
                                {companyInfo.ProfilePicture || companyInfo.LogoUrl ? (
                                    <img src={companyInfo.ProfilePicture || companyInfo.LogoUrl} alt={companyInfo.BusinessName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-5xl font-extrabold text-[#009966] uppercase">
                                        {companyInfo.BusinessName?.charAt(0) || 'C'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Name, Metadata & Action Buttons */}
                        <div className="flex-1 text-center md:text-left pt-2">
                            <div className="flex flex-col mb-4">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3">
                                        {companyInfo.BusinessName}
                                        {companyInfo.AverageRating > 0 && (
                                            <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/20 text-orange-500 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-900/30">
                                                <Star size={14} fill="currentColor" />
                                                <span className="text-sm font-bold">{companyInfo.AverageRating?.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-[15px] font-bold text-slate-600 dark:text-slate-400">
                                        <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 uppercase tracking-widest text-[11px]">
                                            {followerCount} Followers
                                        </span>
                                        {companyInfo.Niche && (
                                            <span className="flex items-center gap-1.5">
                                                <Star size={16} className="text-slate-400" /> {companyInfo.Niche}
                                            </span>
                                        )}
                                        {companyInfo.Locality || companyInfo.City ? (
                                            <span className="flex items-center gap-1.5">
                                                <MapPin size={16} className="text-slate-400" /> {companyInfo.Locality || companyInfo.City}
                                            </span>
                                        ) : null}
                                    </div>
                                    
                                    {/* Action Buttons Horizontal Section */}
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
                                        {user?.role === 'seeker' && (
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => handleFollowToggle(id, isFollowing)}
                                                    disabled={isActionLoading}
                                                    className={`px-8 py-2.5 text-[14px] font-bold rounded-md transition-all flex items-center gap-2 border-none shadow-sm h-fit ${
                                                        isFollowing 
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30' 
                                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    }`}
                                                >
                                                    {isActionLoading ? (
                                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        isFollowing ? 'Following' : 'Follow'
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        if (hasBond) {
                                                            navigate('/messages', { state: { userId: companyInfo?.OwnerID } });
                                                        } else {
                                                            toast.error("You can only message the business after an application has been accepted.");
                                                        }
                                                    }}
                                                    className={`flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-[#1f2229] border border-[#009966]/30 hover:border-[#009966] text-[#009966] font-bold rounded-md transition-all shadow-sm group ${!hasBond && 'opacity-50 cursor-not-allowed grayscale'}`}
                                                >
                                                    <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                                                    Message
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Level Tabs */}
                    <div className="flex gap-8 mb-6 border-b border-slate-200 dark:border-[#303340]">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`pb-3 text-[14px] bg-transparent border-none font-extrabold transition-all relative ${activeTab === 'overview' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            Overview
                            {activeTab === 'overview' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-slate-900 dark:bg-white rounded-t-sm"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('jobs')}
                            className={`pb-3 text-[14px] bg-transparent border-none font-extrabold transition-all relative flex items-center gap-1 ${activeTab === 'jobs' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            Jobs <span className="text-[11px] font-black text-slate-400">({companyJobs.length})</span>
                            {activeTab === 'jobs' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-slate-900 dark:bg-white rounded-t-sm"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`pb-3 text-[14px] bg-transparent border-none font-extrabold transition-all relative flex items-center gap-1 ${activeTab === 'reviews' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            Reviews <span className="text-[11px] font-black text-slate-400">({companyInfo.ReviewCount || 0})</span>
                            {activeTab === 'reviews' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-slate-900 dark:bg-white rounded-t-sm"></div>}
                        </button>
                    </div>

                    {/* Content Section layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* LEFT COLUMN: Main Content */}
                        <div className="lg:col-span-2 space-y-6">

                            {activeTab === 'overview' && (
                                <>
                                    {/* About Section */}
                                    <div className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md p-6 shadow-sm">
                                        <h3 className="text-[16px] font-extrabold text-slate-900 dark:text-white mb-4">
                                            About {companyInfo.BusinessName}
                                        </h3>
                                        <div className="text-slate-600 dark:text-slate-300 text-[14px] font-medium leading-relaxed whitespace-pre-line">
                                            {companyInfo.Description || companyInfo.Bio || "An expanding enterprise looking for talented individuals to join their growing team and make an impact in the neighborhood."}
                                        </div>
                                    </div>

                                    {/* More Information */}
                                    <div className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md p-6 shadow-sm">
                                        <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-[#262933]">
                                            Contact Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                                            <div className="flex gap-3">
                                                <User size={16} className="text-slate-400 mt-0.5" />
                                                <div>
                                                    <span className="block text-[12px] font-medium text-slate-500 mb-0.5">Owner / Contact Person</span>
                                                    <span className="block text-[14px] font-bold text-slate-800 dark:text-slate-100">{companyInfo.Hirer?.FullName || companyInfo.OwnerName || 'Not Appointed'}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <Globe size={16} className="text-slate-400 mt-0.5" />
                                                <div>
                                                    <span className="block text-[12px] font-medium text-slate-500 mb-0.5">Website</span>
                                                    {companyInfo.WebsiteStr || companyInfo.Website ? (
                                                        <a href={companyInfo.WebsiteStr || companyInfo.Website} target="_blank" rel="noopener noreferrer" className="block text-[14px] font-bold text-blue-600 hover:underline line-clamp-1">
                                                            {companyInfo.WebsiteStr || companyInfo.Website}
                                                        </a>
                                                    ) : (
                                                        <span className="block text-[14px] font-bold text-slate-800 dark:text-slate-100">Not Available</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <Mail size={16} className="text-slate-400 mt-0.5" />
                                                <div>
                                                    <span className="block text-[12px] font-medium text-slate-500 mb-0.5">Email Address</span>
                                                    <span className="block text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate pr-2" title={companyInfo.BusinessEmail || companyInfo.Email || 'Not Given'}>{companyInfo.BusinessEmail || companyInfo.Email || 'Not Given'}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <Phone size={16} className="text-slate-400 mt-0.5" />
                                                <div>
                                                    <span className="block text-[12px] font-medium text-slate-500 mb-0.5">Phone Number</span>
                                                    <span className="block text-[14px] font-bold text-slate-800 dark:text-slate-100">{companyInfo.BusinessPhone || companyInfo.PhoneNumber || companyInfo.Phone || 'Not Given'}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 md:col-span-2">
                                                <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                                <div>
                                                    <span className="block text-[12px] font-medium text-slate-500 mb-0.5">Corporate Address</span>
                                                    <span className="block text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-snug">{companyInfo.Address || `${companyInfo.Locality || ''} ${companyInfo.City || ''}` || 'Not Available'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Similar Companies Widget (Moved here) */}
                                    <div className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md shadow-sm">
                                        <div className="p-4 border-b border-slate-100 dark:border-[#262933]">
                                            <h4 className="text-[14px] font-extrabold text-slate-900 dark:text-white">Companies Similar to {companyInfo.BusinessName}</h4>
                                        </div>
                                        <div className="p-2">
                                            {similarCompanies.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {similarCompanies.map(company => (
                                                        <div
                                                            key={company.ID}
                                                            onClick={() => {
                                                                navigate(`/companies/${company.ID}`);
                                                                window.scrollTo(0, 0);
                                                            }}
                                                            className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-[#262933] rounded-md cursor-pointer transition-colors border-b border-slate-50 dark:border-[#303340]/50 last:border-0 group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#303340] rounded flex items-center justify-center shrink-0 overflow-hidden p-0 shadow-sm">
                                                                    {(company.ProfilePicture || company.LogoUrl) ? (
                                                                        <img src={company.ProfilePicture || company.LogoUrl} alt={company.BusinessName} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="text-[15px] font-extrabold text-[#009966] uppercase">{company.BusinessName?.charAt(0) || 'C'}</span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <h5 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 line-clamp-1 pr-2">{company.BusinessName}</h5>
                                                                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5">
                                                                        {company.Industry || 'Private'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded flex items-center gap-1 transition-colors shrink-0 border-none shadow-sm">
                                                                + Follow
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-6 text-center">
                                                    <Building2 size={24} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                                    <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">No similar companies found</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'jobs' && (
                                <div className="space-y-4">
                                    {companyJobs.length === 0 ? (
                                        <div className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md p-12 text-center shadow-sm">
                                            <h3 className="text-[16px] font-bold text-slate-600 dark:text-slate-400">No active positions open right now</h3>
                                        </div>
                                    ) : (
                                        companyJobs.map(job => (
                                            <div
                                                key={job.ID}
                                                onClick={() => navigate(`/jobs/${job.ID}`)}
                                                className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md p-5 shadow-sm hover:border-[#009966] transition-all cursor-pointer group flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                                            >
                                                <div className="flex-1">
                                                    <h3 className="text-[16px] font-extrabold text-blue-600 group-hover:underline mb-2">
                                                        {job.Description?.Title || 'Untitled Role'}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-slate-500">
                                                        <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                                                            <Briefcase size={12} /> {job.Description?.JobType?.replace('_', ' ') || 'Full Time'}
                                                        </span>
                                                        <span>&bull;</span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin size={12} /> {job.Business?.Locality || job.Business?.City || 'Local'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-left md:text-right">
                                                    <span className="text-[13px] font-extrabold text-[#009966] bg-[#f0faf5] dark:bg-[#009966]/10 px-2.5 py-1 rounded">
                                                        ₹{job.Description?.SalaryMin} - ₹{job.Description?.SalaryMax}
                                                    </span>
                                                </div>
                                                {/* <ChevronRight size={16} className="text-slate-400 hidden md:block group-hover:text-[#009966] transition-colors" /> */}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                             {activeTab === 'reviews' && (
                                <div className="space-y-6">
                                    {/* Review Action Card (For active seeker) */}
                                    {user?.role === 'seeker' && !showReviewForm && (
                                        <div className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                                            <div>
                                                <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white mb-1">
                                                    {myReview ? 'Your Review' : 'Work here before?'}
                                                </h3>
                                                <p className="text-[13px] text-slate-500 font-medium">
                                                    {myReview ? 'You have already shared your feedback.' : 'Share your experience to help our community.'}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                {myReview ? (
                                                    <>
                                                        <button 
                                                            onClick={() => setShowReviewForm(true)}
                                                            className="px-4 py-2 bg-slate-50 dark:bg-[#262933] border border-slate-200 dark:border-[#303340] rounded-md text-[13px] font-bold text-slate-700 dark:text-white hover:bg-slate-100 transition-colors"
                                                        >
                                                            Edit Review
                                                        </button>
                                                        <button 
                                                            onClick={handleDeleteReview}
                                                            className="px-4 py-2 text-[13px] font-bold text-red-500 hover:text-red-600 transition-colors bg-transparent border-none"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button 
                                                        onClick={() => setShowReviewForm(true)}
                                                        className="px-6 py-2 bg-[#009966] hover:bg-[#008855] text-white rounded-md text-[13px] font-bold shadow-md shadow-[#009966]/20 transition-all border-none"
                                                    >
                                                        Write a Review
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Review Form Component */}
                                    {showReviewForm && (
                                        <BusinessReviewForm 
                                            initialRating={myReview?.Rating || 0}
                                            initialMessage={myReview?.Message || ''}
                                            onSubmit={handleReviewSubmit}
                                            onCancel={() => setShowReviewForm(false)}
                                            isLoading={isReviewLoading}
                                            businessName={companyInfo.BusinessName}
                                        />
                                    )}

                                    {/* Summary & List */}
                                    <div className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-slate-100 dark:border-[#262933] flex items-center justify-between">
                                            <h3 className="text-[16px] font-extrabold text-slate-900 dark:text-white">
                                                Community Feedback
                                            </h3>
                                            {companyInfo.ReviewCount > 0 && (
                                                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                                                    <Star size={18} className="text-orange-500 fill-orange-500" />
                                                    <span className="text-lg">{companyInfo.AverageRating?.toFixed(1)}</span>
                                                    <span className="text-[12px] text-slate-400">/ 5.0</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="divide-y divide-slate-50 dark:divide-[#262933]">
                                            {reviews.length === 0 ? (
                                                <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                                                    <Star size={32} className="mx-auto mb-3 opacity-20" />
                                                    <p className="font-bold">No reviews yet</p>
                                                    <p className="text-[13px] mt-1">Be the first to share your thoughts about this business.</p>
                                                </div>
                                            ) : (
                                                reviews.map(review => (
                                                    <div key={review.ID} className="p-6">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                                    <User size={20} />
                                                                </div>
                                                                <div>
                                                                    <div className="text-[14px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                                                        Community Member
                                                                        {myReview?.ID === review.ID && (
                                                                            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-[11px] text-slate-400 font-medium tracking-tight">
                                                                        {new Date(review.CreatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-0.5">
                                                                {[1, 2, 3, 4, 5].map(s => (
                                                                    <Star 
                                                                        key={s} 
                                                                        size={12} 
                                                                        className={s <= review.Rating ? 'text-orange-500 fill-orange-500' : 'text-slate-200 dark:text-slate-700'} 
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-[14px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed pl-13">
                                                            {review.Message || <span className="italic opacity-50">No message provided.</span>}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* RIGHT COLUMN: Sidebar elements */}
                        <div className="space-y-6">

                            {/* Company Stats Snapshot */}
                            <div className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md shadow-sm">
                                <div className="p-4 border-b border-slate-100 dark:border-[#262933]">
                                    <h4 className="text-[14px] font-extrabold text-slate-900 dark:text-white">Organization Details</h4>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="font-medium text-slate-500">Industry</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{companyInfo.Industry || 'Private'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="font-medium text-slate-500">Niche</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{companyInfo.Niche || 'Not Specified'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="font-medium text-slate-500">Headquarters</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{companyInfo.City || 'Not Specified'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="font-medium text-slate-500">Company Size</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{companyInfo.EmployeeCount || '1-10'} Employees</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="font-medium text-slate-500">Founded</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{companyInfo.EstablishedYear || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px] pt-2 border-t border-slate-50 dark:border-[#262933]">
                                        <span className="font-medium text-slate-500 font-bold">Followers</span>
                                        <span className="font-bold text-[#009966]">{followerCount} community members</span>
                                    </div>
                                </div>
                            </div>

                            {/* Job Openings Widget (If not on Jobs tab) */}
                            {activeTab !== 'jobs' && companyJobs.length > 0 && (
                                <div className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md shadow-sm">
                                    <div className="p-4 border-b border-slate-100 dark:border-[#262933]">
                                        <h4 className="text-[14px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                            <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/40 rounded flex items-center justify-center">
                                                <Briefcase size={12} className="text-blue-600" />
                                            </div>
                                            {companyJobs.length} Job Opening{companyJobs.length === 1 ? '' : 's'}
                                        </h4>
                                    </div>
                                    <div className="p-2">
                                        {companyJobs.slice(0, 3).map(job => (
                                            <div
                                                key={job.ID}
                                                onClick={() => { setActiveTab('jobs'); window.scrollTo(0, 400); }}
                                                className="p-3 hover:bg-slate-50 dark:hover:bg-[#262933] rounded-md cursor-pointer transition-colors border-b border-slate-50 dark:border-[#303340]/50 last:border-0"
                                            >
                                                <h5 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-1 group-hover:text-blue-600">{job.Description?.Title}</h5>
                                                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                                    <span className="flex items-center gap-1"><MapPin size={10} />{job.Business?.Locality || 'Local'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-3 border-t border-slate-100 dark:border-[#262933] text-center">
                                        <button
                                            onClick={() => setActiveTab('jobs')}
                                            className="text-[13px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-transparent"
                                        >
                                            View all openings
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            </main>
            <Footer />

            {/* Ticket Modal for Reporting */}
            <TicketModal 
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                businessId={id}
                businessName={companyInfo.BusinessName}
                initialType="report"
            />
        </div>
    );
};

export default CompanyDetailsPage;
