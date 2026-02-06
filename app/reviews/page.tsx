'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Star,
  ThumbsUp,
  MessageCircle,
  Filter,
  ArrowRight,
  CheckCircle,
  Quote,
  TrendingUp,
  Award,
} from 'lucide-react'

interface Review {
  id: string
  author: string
  rating: number
  comment: string
  date: string
  service: string
  helpful: number
  verified?: boolean
}

export default function ReviewsPage() {
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest')
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set())

  useEffect(() => {
    setMounted(true)
  }, [])

  const reviews: Review[] = [
    {
      id: '1',
      author: 'John D.',
      rating: 5,
      comment:
        'Amazing work! The MLO customization exceeded my expectations. Professional service and quick turnaround. The team was responsive and delivered exactly what I envisioned.',
      date: '2024-01-15',
      service: 'MLO',
      helpful: 24,
      verified: true,
    },
    {
      id: '2',
      author: 'Sarah M.',
      rating: 5,
      comment:
        'Best custom chain design I have ever seen. RoyalT really knows what they are doing. Highly recommend! The quality is outstanding and the attention to detail is impressive.',
      date: '2024-01-12',
      service: 'Chain',
      helpful: 18,
      verified: true,
    },
    {
      id: '3',
      author: 'Mike T.',
      rating: 5,
      comment:
        'The 1-on-1 class was incredibly helpful. Learned so much about shell customization. Worth every penny! The instructor was patient and knowledgeable.',
      date: '2024-01-10',
      service: 'Shell',
      helpful: 32,
      verified: true,
    },
    {
      id: '4',
      author: 'Emma L.',
      rating: 4,
      comment:
        'Great tattoo design service. The consultation was thorough and the final design was perfect. Very happy with the results and would use again.',
      date: '2024-01-08',
      service: 'Tattoo',
      helpful: 15,
      verified: true,
    },
    {
      id: '5',
      author: 'David K.',
      rating: 5,
      comment:
        'Outstanding face customization work. The attention to detail is incredible. Will definitely order again! The team went above and beyond.',
      date: '2024-01-05',
      service: 'Face',
      helpful: 28,
      verified: true,
    },
    {
      id: '6',
      author: 'Lisa R.',
      rating: 5,
      comment:
        'Excellent service from start to finish. The custom package was exactly what I needed. Professional, timely, and high quality work.',
      date: '2024-01-03',
      service: 'Other',
      helpful: 12,
      verified: true,
    },
    {
      id: '7',
      author: 'Tom W.',
      rating: 5,
      comment:
        'Fast delivery and amazing quality. The MLO design was perfect and exceeded all my expectations. Great communication throughout the process.',
      date: '2023-12-28',
      service: 'MLO',
      helpful: 20,
      verified: true,
    },
    {
      id: '8',
      author: 'Jessica P.',
      rating: 5,
      comment:
        'Incredible work on my chain collection. The designs are unique and the quality is top-notch. Highly recommend RoyalT Customz to anyone!',
      date: '2023-12-25',
      service: 'Chain',
      helpful: 16,
      verified: true,
    },
  ]

  const [newReview, setNewReview] = useState({
    author: '',
    rating: 5,
    comment: '',
    service: '',
  })

  const services = ['all', 'MLO', 'Shell', 'Chain', 'Tattoo', 'Face', 'Other']

  const filteredReviews = reviews
    .filter((review) => (filter === 'all' ? true : review.service === filter))
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime()
      return b.rating - a.rating
    })

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100,
  }))

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for your review! It will be posted after moderation.')
    setNewReview({ author: '', rating: 5, comment: '', service: '' })
  }

  const handleHelpful = (reviewId: string) => {
    setHelpfulClicked((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId)
      } else {
        newSet.add(reviewId)
      }
      return newSet
    })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_70%)]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div
              className={`inline-block mb-6 transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.2s' }}
            >
              <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
                Reviews
              </span>
            </div>
            <h1
              className={`text-6xl md:text-8xl font-bold mb-6 leading-tight transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.4s' }}
            >
              WHAT <span className="text-primary-500">CLIENTS SAY</span>
            </h1>
            <p
              className={`text-xl md:text-2xl text-gray-300 leading-relaxed transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.6s' }}
            >
              See what our satisfied clients have to say about working with RoyalT Customz. Real
              reviews from real customers.
            </p>
          </div>
        </div>
      </section>

      {/* Rating Summary Section */}
      <section className="py-16 bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Overall Rating */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="text-6xl md:text-7xl font-bold text-white">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex flex-col">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= Math.round(averageRating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">Excellent Rating</span>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
              {ratingDistribution.map((dist) => (
                <div key={dist.rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm text-gray-400 w-8">{dist.rating}★</span>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 transition-all duration-500"
                        style={{ width: `${dist.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-400 w-12 text-right">{dist.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Sort */}
      <section className="py-8 bg-black border-b border-gray-800 sticky top-20 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 font-medium">Filter:</span>
              <div className="flex flex-wrap gap-2">
                {services.map((service) => (
                  <button
                    key={service}
                    onClick={() => setFilter(service)}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all
                      ${
                        filter === service
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-700'
                      }
                    `}
                  >
                    {service === 'all' ? 'All' : service}
                  </button>
                ))}
              </div>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-20">
              <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400 mb-4">No reviews found</p>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="group relative p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-primary-500/50 transition-all hover:shadow-2xl hover:shadow-primary-500/10"
                >
                  <div className="absolute top-6 left-6 opacity-10">
                    <Quote className="w-16 h-16 text-primary-500" />
                  </div>
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-600/20 to-primary-700/20 rounded-full flex items-center justify-center">
                            <span className="text-primary-500 font-bold text-lg">
                              {review.author.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white">{review.author}</h3>
                              {review.verified && (
                                <CheckCircle className="w-4 h-4 text-primary-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-400">{review.service}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-300 leading-relaxed mb-6">{review.comment}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-700/50">
                      <button
                        onClick={() => handleHelpful(review.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          helpfulClicked.has(review.id)
                            ? 'bg-primary-600/20 text-primary-400 border border-primary-500/50'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700'
                        }`}
                      >
                        <ThumbsUp
                          size={16}
                          className={helpfulClicked.has(review.id) ? 'fill-current' : ''}
                        />
                        <span className="text-sm font-medium">
                          Helpful ({review.helpful + (helpfulClicked.has(review.id) ? 1 : 0)})
                        </span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700 transition-all">
                        <MessageCircle size={16} />
                        <span className="text-sm font-medium">Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results Count */}
          <div className="mt-12 text-center">
            <p className="text-gray-400">
              Showing <span className="text-primary-500 font-semibold">{filteredReviews.length}</span>{' '}
              {filteredReviews.length === 1 ? 'review' : 'reviews'}
              {filter !== 'all' && (
                <>
                  {' '}for <span className="text-primary-500 font-semibold">{filter}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Write Review Section */}
      <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.1),transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-block mb-4">
                <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
                  Share Your Experience
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                WRITE A <span className="text-primary-500">REVIEW</span>
              </h2>
              <p className="text-xl text-gray-400">
                Help others by sharing your experience with RoyalT Customz
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Your Name</label>
                  <input
                    type="text"
                    required
                    value={newReview.author}
                    onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Service Type</label>
                  <select
                    required
                    value={newReview.service}
                    onChange={(e) => setNewReview({ ...newReview, service: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select service...</option>
                    {services
                      .filter((s) => s !== 'all')
                      .map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating })}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          rating <= newReview.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600 hover:text-yellow-400/50'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">Your Review</label>
                <textarea
                  required
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Share your experience with RoyalT Customz..."
                />
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-lg transition-all shadow-lg shadow-primary-600/30"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.15),transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
              Ready to Experience It?
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            READY TO JOIN OUR <span className="text-primary-500">HAPPY CLIENTS?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            See why so many clients trust RoyalT Customz. Start your project today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/service"
              className="group px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg transition-all inline-flex items-center justify-center gap-2 shadow-2xl shadow-primary-600/30 hover:scale-105"
            >
              Book Appointment
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/marketplace"
              className="px-10 py-5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-lg transition-all inline-flex items-center justify-center gap-2 border-2 border-gray-700 hover:border-gray-600 hover:scale-105"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
