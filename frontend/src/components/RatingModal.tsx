'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    mechanicName: string;
    workshopName?: string;
    onSubmit: (rating: number, comment: string) => Promise<void>;
}

export default function RatingModal({
    isOpen,
    onClose,
    mechanicName,
    workshopName,
    onSubmit
}: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(rating, comment);
            // Reset form
            setRating(0);
            setComment('');
            onClose();
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Failed to submit rating. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Rate Your Experience</h2>
                        <p className="text-blue-100 text-sm mt-1">
                            {workshopName || mechanicName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Star Rating */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                            How would you rate the service?
                        </label>
                        <div className="flex items-center justify-center gap-2 py-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-all duration-200 hover:scale-110 active:scale-95"
                                >
                                    <Star
                                        className={`w-10 h-10 transition-colors ${star <= (hoverRating || rating)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-slate-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="text-center">
                            <span className="text-sm font-medium text-slate-600">
                                {rating === 0 && 'Select a rating'}
                                {rating === 1 && '⭐ Poor'}
                                {rating === 2 && '⭐⭐ Fair'}
                                {rating === 3 && '⭐⭐⭐ Good'}
                                {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                                {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                            </span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="mb-6">
                        <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-2">
                            Share your experience (optional)
                        </label>
                        <textarea
                            id="comment"
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about your experience with this mechanic..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || rating === 0}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : 'Submit Rating'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
