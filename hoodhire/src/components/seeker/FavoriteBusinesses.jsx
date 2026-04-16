import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Building2, Trash2, ChevronRight, Users, Calendar, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { seekerAPI } from '../../api/seeker';
import { toast } from 'react-hot-toast';

const FavoriteBusinesses = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const fetchFavorites = async () => {
        try {
            const res = await seekerAPI.getFavoriteBusinesses();
            // API returns { saved: [{ ID, BusinessID, Business: {...} }] }
            const savedItems = res?.saved || [];
            const businesses = savedItems.map(item => ({ ...item.Business, _businessID: item.BusinessID }));
            setFavorites(businesses);
        } catch (error) {
            console.error("Failed to fetch favorite businesses:", error);
            toast.error("Failed to load favorites.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const handleUnfavorite = async (e, businessId) => {
        e.stopPropagation();
        try {
            await seekerAPI.unfavoriteBusiness(businessId);
            setFavorites(prev => prev.filter(bus => (bus._businessID || bus.ID) !== businessId));
            toast.success("Removed from favorites");

            // Adjust current page if last item on page was deleted
            const newTotalItems = favorites.length - 1;
            const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
        } catch (error) {
            console.error("Failed to unfavorite business:", error);
            toast.error("Failed to unfavorite business");
        }
    };

    // Pagination calculations
    const totalPages = Math.ceil(favorites.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedFavorites = favorites.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-40 bg-white dark:bg-[#16181d] rounded-xl border border-slate-100 dark:border-[#262933] animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div className="bg-white dark:bg-[#16181d] rounded-xl border border-slate-100 dark:border-[#262933] p-12 text-center">
                <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star size={32} className="text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Favorite Companies</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                    You haven't favorited any companies yet. Star the businesses you'd like to keep an eye on.
                </p>
                <button
                    onClick={() => navigate('/companies')}
                    className="bg-[#009966] text-white px-6 py-2.5 rounded-md font-bold hover:bg-[#008855] transition-all"
                >
                    Explore Companies
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedFavorites.map((business) => (
                    <div 
                        key={business.ID || business._businessID} 
                        onClick={() => navigate(`/companies/${business.ID || business._businessID}`)}
                        className="bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-md p-5 premium-shadow hover:shadow-xl hover:-translate-y-0.5 transition-all group cursor-pointer flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 shrink-0 bg-white dark:bg-[#1a1d24] rounded-md flex items-center justify-center p-0 overflow-hidden shadow-sm ${(business.Hirer?.IsPRO || business.IsPRO) ? 'border-2 border-[#0095F6]' : 'border border-slate-100 dark:border-[#303340]'}`}>
                                        {(business.ProfilePicture || business.LogoUrl) ? (
                                            <img
                                                src={business.ProfilePicture || business.LogoUrl}
                                                alt={business.BusinessName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl font-black text-[#009966]">{business.BusinessName?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-[17px] font-extrabold text-slate-900 dark:text-white group-hover:text-[#009966] transition-colors flex items-center gap-1.5">
                                            {business.BusinessName}
                                            {(business.Hirer?.IsPRO || business.IsPRO) && (
                                                <CheckCircle2 size={16} className="text-[#0095F6] fill-[#0095F6]/10 shrink-0" title="Verified Business" />
                                            )}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[12px] font-bold text-orange-500 mt-0.5">
                                            <Star size={12} fill="currentColor" />
                                            <span>{business.AverageRating?.toFixed(1) || '0.0'}</span>
                                            <span className="text-slate-400 font-medium">({business.ReviewCount || 0} reviews)</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => handleUnfavorite(e, business._businessID || business.ID)}
                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors bg-transparent border-none"
                                    title="Remove from Favorites"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-y-2 mt-4">
                                <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
                                    <MapPin size={14} className="text-slate-400" />
                                    <span className="truncate">{business.Locality || business.City || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
                                    <Building2 size={14} className="text-slate-400" />
                                    <span className="truncate">{business.Industry || 'Private'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 dark:border-[#262933] flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
                                <span className="flex items-center gap-1"><Users size={12} /> {business.EmployeeCount || '1-10'}</span>
                                <span className="flex items-center gap-1"><Calendar size={12} /> Est. {business.EstablishedYear || '2020'}</span>
                            </div>
                            <div className="flex items-center text-[13px] font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                                View Profile <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-2 bg-white dark:bg-[#16181d] border border-slate-200 dark:border-[#262933] rounded-md p-3 shadow-sm">
                    <span className="text-sm font-medium text-slate-500 ml-2">
                        Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-sm border border-slate-200 dark:border-[#303340] text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#262933] transition-colors bg-transparent"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-sm border border-slate-200 dark:border-[#303340] text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#262933] transition-colors bg-transparent"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FavoriteBusinesses;
