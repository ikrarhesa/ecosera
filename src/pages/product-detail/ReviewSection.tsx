import React, { useState } from "react";
import { Star, ChevronDown, Info } from "lucide-react";
import { type ProductReview } from "../../services/products";

interface ReviewSectionProps {
  reviews: ProductReview[];
  reviewerName: string;
  setReviewerName: (v: string) => void;
  contactInfo: string;
  setContactInfo: (v: string) => void;
  reviewRating: number;
  setReviewRating: (v: number) => void;
  reviewComment: string;
  setReviewComment: (v: string) => void;
  submittingReview: boolean;
  onSubmitReview: (e: React.FormEvent) => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  reviews,
  reviewerName,
  setReviewerName,
  contactInfo,
  setContactInfo,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  submittingReview,
  onSubmitReview
}) => {
  const [showReviews, setShowReviews] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="mt-6 border-t pt-5">
      <button
        onClick={() => setShowReviews(!showReviews)}
        className="w-full flex items-center justify-between py-1 group"
      >
        <h2 className="text-sm font-semibold">Ulasan Pembeli ({reviews.length})</h2>
        <div className={`transition-transform duration-300 ease-in-out text-gray-400 group-hover:text-blue-500 ${showReviews ? 'rotate-180' : 'rotate-0'}`}>
          <ChevronDown size={20} />
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${showReviews ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
          }`}
      >
        <div className="overflow-hidden">
          {/* Review List */}
          <div className="space-y-4 mb-6">
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Belum ada ulasan untuk produk ini. Jadilah yang pertama!</p>
            ) : (
              reviews.map((rev, i) => (
                <div key={rev.id || i} className="border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{rev.reviewer_name}</span>
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} size={12} className={idx < rev.rating ? "fill-amber-400" : "fill-gray-200 text-gray-200"} />
                      ))}
                    </div>
                  </div>
                  {rev.comment && <p className="text-sm text-gray-600 mt-1">{rev.comment}</p>}
                </div>
              ))
            )}
          </div>

          {/* Write Review Form */}
          <div className="bg-gray-50 p-4 rounded-xl border">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-medium">Tulis Ulasan Baru</h3>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTooltip(!showTooltip)}
                  onBlur={() => setShowTooltip(false)}
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                  aria-label="Info Privasi"
                >
                  <Info size={16} />
                </button>
                {showTooltip && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-gray-800 text-white text-[11px] p-2 rounded shadow-lg z-10 text-center">
                    Email / Nomor HP tidak akan ditampilkan secara publik
                    <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800" />
                  </div>
                )}
              </div>
            </div>
            <form onSubmit={onSubmitReview} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Nama</label>
                <input required type="text" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="Nama Anda" className="w-full text-sm rounded-lg border p-2 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">No HP / Email</label>
                <input required type="text" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="emailkamu@ecosera.com" className="w-full text-sm rounded-lg border p-2 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Penilaian</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewRating(star)} className="p-1">
                      <Star size={24} className={star <= reviewRating ? "fill-amber-400 stroke-amber-400" : "stroke-gray-300"} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Komentar (Opsional)</label>
                <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Bagaimana produk ini?" rows={2} className="w-full text-sm rounded-lg border p-2 focus:ring-1 focus:ring-blue-500" />
              </div>
              <button disabled={submittingReview} type="submit" className="w-full py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {submittingReview ? "Mengirim..." : "Kirim Ulasan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
