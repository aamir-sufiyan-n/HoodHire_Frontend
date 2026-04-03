import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

const BusinessReviewForm = ({ 
    initialRating = 0, 
    initialMessage = '', 
    onSubmit, 
    onCancel, 
    isLoading = false,
    businessName = 'this business'
}) => {
    const [rating, setRating] = useState(initialRating);
    const [message, setMessage] = useState(initialMessage);
    const [hover, setHover] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) return;
        onSubmit({ rating, message });
    };

    return (
        <div className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#303340] rounded-md p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {initialRating > 0 ? 'Update your review' : `Review ${businessName}`}
                </h3>
                {onCancel && (
                    <button 
                        onClick={onCancel}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-transparent border-none p-1"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating Selector */}
                <div className="flex flex-col items-center gap-3">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="bg-transparent border-none p-1 transition-transform hover:scale-110 active:scale-95"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <Star
                                    size={36}
                                    className={`${
                                        star <= (hover || rating)
                                            ? 'text-orange-500 fill-orange-500'
                                            : 'text-slate-300 dark:text-slate-600'
                                    } transition-colors duration-200`}
                                />
                            </button>
                        ))}
                    </div>
                    <span className="text-sm font-bold text-slate-500">
                        {rating > 0 ? `${rating} ${rating === 1 ? 'Star' : 'Stars'}` : 'Select your rating'}
                    </span>
                </div>

                {/* Message Input */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Share your experience (optional)
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="What did you like or dislike? How was the service?"
                        rows={4}
                        maxLength={500}
                        className="w-full bg-slate-50 dark:bg-[#16181d] border border-slate-200 dark:border-[#303340] rounded-md px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-[#009966] transition-all"
                    ></textarea>
                    <div className="flex justify-end mt-1">
                        <span className="text-[11px] text-slate-400 font-medium">
                            {message.length}/500 characters
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isLoading || rating === 0}
                        className={`flex-1 py-3 px-4 rounded-md font-bold text-sm transition-all border-none ${
                            rating > 0 
                            ? 'bg-[#009966] hover:bg-[#008855] text-white shadow-md shadow-[#009966]/20' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                        ) : (
                            initialRating > 0 ? 'Update Review' : 'Submit Review'
                        )}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 bg-slate-50 dark:bg-[#262933] border border-slate-200 dark:border-[#303340] text-slate-600 dark:text-slate-300 font-bold text-sm rounded-md hover:bg-slate-100 dark:hover:bg-[#303340] transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default BusinessReviewForm;
