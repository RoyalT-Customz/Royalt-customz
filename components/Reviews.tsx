'use client'

import { Star, ThumbsUp, MessageCircle } from 'lucide-react'
import { useState } from 'react'

interface Review {
  id: string
  author: string
  rating: number
  comment: string
  date: string
  service: string
  helpful: number
}

export default function Reviews() {
  const [reviews] = useState<Review[]>([
    {
      id: '1',
      author: 'John D.',
      rating: 5,
      comment:
        'Amazing work! The MLO customization exceeded my expectations. Professional service and quick turnaround.',
      date: '2024-01-10',
      service: 'MLO',
      helpful: 12,
    },
    {
      id: '2',
      author: 'Sarah M.',
      rating: 5,
      comment:
        'Best custom chain design I\'ve ever seen. RoyalT really knows what they\'re doing. Highly recommend!',
      date: '2024-01-08',
      service: 'Chain',
      helpful: 8,
    },
    {
      id: '3',
      author: 'Mike T.',
      rating: 5,
      comment:
        'The 1-on-1 class was incredibly helpful. Learned so much about shell customization. Worth every penny!',
      date: '2024-01-05',
      service: 'Shell',
      helpful: 15,
    },
    {
      id: '4',
      author: 'Emma L.',
      rating: 4,
      comment:
        'Great tattoo design service. The consultation was thorough and the final design was perfect.',
      date: '2024-01-03',
      service: 'Tattoo',
      helpful: 6,
    },
    {
      id: '5',
      author: 'David K.',
      rating: 5,
      comment:
        'Outstanding face customization work. The attention to detail is incredible. Will definitely order again!',
      date: '2023-12-28',
      service: 'Face',
      helpful: 10,
    },
  ])

  const [newReview, setNewReview] = useState({
    author: '',
    rating: 5,
    comment: '',
    service: '',
  })

  const [filter, setFilter] = useState<string>('all')

  const services = ['all', 'MLO', 'Shell', 'Chain', 'Tattoo', 'Face', 'Other']

  const filteredReviews =
    filter === 'all'
      ? reviews
      : reviews.filter((review) => review.service === filter)

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would submit to a backend
    alert('Thank you for your review! It will be posted after moderation.')
    setNewReview({ author: '', rating: 5, comment: '', service: '' })
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Customer Reviews</h2>
          <p className="text-gray-400">See what our customers are saying</p>
        </div>

        {/* Rating Summary */}
        <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-4xl font-bold text-white">{averageRating.toFixed(1)}</span>
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
              </div>
              <p className="text-gray-400 text-sm">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right">
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.filter((r) => r.rating === rating).length
                  const percentage = (count / reviews.length) * 100
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 w-8">{rating}★</span>
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-8">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {services.map((service) => (
            <button
              key={service}
              onClick={() => setFilter(service)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  filter === service
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }
              `}
            >
              {service.charAt(0).toUpperCase() + service.slice(1)}
            </button>
          ))}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-700/30 rounded-lg p-6 border border-gray-600"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{review.author}</h3>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-sm text-gray-400">{review.service}</span>
                  </div>
                  <div className="flex items-center gap-1">
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
                </div>
                <span className="text-sm text-gray-400">{review.date}</span>
              </div>
              <p className="text-gray-300 mb-4">{review.comment}</p>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpful})
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Form */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Write a Review</h3>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Your Name</label>
              <input
                type="text"
                required
                value={newReview.author}
                onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Service Type</label>
              <select
                required
                value={newReview.service}
                onChange={(e) => setNewReview({ ...newReview, service: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            <label className="block text-gray-300 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      rating <= newReview.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-600 hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Your Review</label>
            <textarea
              required
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Share your experience..."
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-semibold"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  )
}

