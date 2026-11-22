'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, MessageSquare, Send, ShieldCheck, AlertCircle } from 'lucide-react';
import { Review } from '@stoncrops/types';

export function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [botTrap, setBotTrap] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch {
      // Ignore network errors on initial render
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Bot trap check
    if (botTrap) {
      return;
    }

    if (!name.trim() || !comment.trim()) {
      setSubmitError('Please provide your name and review feedback.');
      return;
    }

    if (comment.trim().length < 10) {
      setSubmitError('Review comment must be at least 10 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
          orderNumber: orderNumber.trim() || undefined,
          website_url: botTrap,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSubmitSuccess(true);
      setName('');
      setTitle('');
      setComment('');
      setOrderNumber('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <section id="reviews" className="py-16 md:py-24 bg-cream-100/60 border-t border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-cream-300 pb-8 gap-6">
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-[0.25em] text-burgundy-700 block mb-1">
              COMMUNITY FEEDBACK
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-obsidian-950">
              Customer Reviews
            </h2>
            <p className="text-xs text-obsidian-600 mt-1">
              Verified reviews from customers who purchased the STONCROPS Embroidered Edition.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-3xl font-black text-obsidian-950">{averageRating}</span>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
              </div>
              <span className="text-[11px] text-obsidian-500 tracking-wider uppercase font-semibold">
                {reviews.length} Verified {reviews.length === 1 ? 'Review' : 'Reviews'}
              </span>
            </div>

            <button
              onClick={() => {
                setFormOpen(!formOpen);
                setSubmitSuccess(false);
              }}
              className="px-5 py-3 bg-obsidian-950 text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-burgundy-800 transition-colors shrink-0"
            >
              {formOpen ? 'Cancel' : 'Write a Review'}
            </button>
          </div>
        </div>

        {/* Review Submission Form Modal / Drawer */}
        {formOpen && (
          <div className="mt-8 bg-white border border-cream-300 p-6 sm:p-8 rounded-none shadow-sm max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-cream-200">
              <h3 className="text-lg font-bold text-obsidian-950 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-burgundy-700" />
                Submit Your Review
              </h3>
              <span className="text-[11px] text-obsidian-500 font-medium">
                Reviews are moderated prior to publication
              </span>
            </div>

            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-950">Thank you for your feedback!</h4>
                <p className="text-xs text-emerald-800">
                  Your review has been submitted and will appear on this page once verified by our team.
                </p>
                <button
                  onClick={() => {
                    setFormOpen(false);
                    setSubmitSuccess(false);
                  }}
                  className="mt-4 px-4 py-2 bg-emerald-800 text-white text-xs uppercase font-bold tracking-wider"
                >
                  Close Form
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                {submitError && (
                  <div className="bg-red-50 border border-red-200 p-3 text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Honeypot field for bot trapping */}
                <input
                  type="text"
                  name="website_url"
                  value={botTrap}
                  onChange={(e) => setBotTrap(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Rating selection */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-obsidian-800 mb-1">
                    Rating (1 to 5 Stars) *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`p-2 border rounded transition-all ${
                          rating >= star
                            ? 'border-amber-400 bg-amber-50 text-amber-500'
                            : 'border-cream-300 text-cream-400'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-obsidian-800 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aryan Sharma"
                      className="w-full p-2.5 border border-cream-300 focus:outline-none focus:ring-1 focus:ring-obsidian-950 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-obsidian-800 mb-1">
                      Order ID (Optional for Verified Badge)
                    </label>
                    <input
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="e.g. SC-1002"
                      className="w-full p-2.5 border border-cream-300 focus:outline-none focus:ring-1 focus:ring-obsidian-950 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-obsidian-800 mb-1">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Incredible Loopnet weight and embroidery precision"
                    className="w-full p-2.5 border border-cream-300 focus:outline-none focus:ring-1 focus:ring-obsidian-950 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-obsidian-800 mb-1">
                    Your Detailed Review *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe the fit, fabric feel, embroidery details, and overall wearing experience..."
                    className="w-full p-2.5 border border-cream-300 focus:outline-none focus:ring-1 focus:ring-obsidian-950 text-xs leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="px-4 py-2 border border-cream-300 text-obsidian-700 hover:bg-cream-100 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-obsidian-950 text-white hover:bg-burgundy-800 text-xs uppercase tracking-wider font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Reviews List */}
        <div className="mt-12">
          {loading ? (
            <div className="py-12 text-center text-xs text-obsidian-500 animate-pulse">
              Loading authentic verified reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white border border-cream-300 p-8 text-center max-w-lg mx-auto space-y-3">
              <ShieldCheck className="w-8 h-8 text-burgundy-700 mx-auto" />
              <h3 className="text-base font-bold text-obsidian-950">
                Be the First to Review the Embroidered Edition
              </h3>
              <p className="text-xs text-obsidian-600 leading-relaxed">
                We maintain an authentic review policy without fabricated feedback or fake social proof. Have you received your garment? Share your candid thoughts with the community.
              </p>
              <button
                onClick={() => setFormOpen(true)}
                className="mt-2 inline-block px-5 py-2.5 bg-obsidian-950 text-white text-xs uppercase tracking-wider font-bold hover:bg-burgundy-800 transition-colors"
              >
                Submit the First Review
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-cream-300 p-6 rounded-none shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                      {rev.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>

                    {rev.title && (
                      <h4 className="text-sm font-bold text-obsidian-950 pt-1">
                        {rev.title}
                      </h4>
                    )}

                    <p className="text-xs text-obsidian-700 leading-relaxed font-normal">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>

                  <div className="border-t border-cream-200 pt-3 mt-4 flex items-center justify-between text-[11px] text-obsidian-500">
                    <span className="font-semibold text-obsidian-900">{rev.customerName}</span>
                    <span>
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
