'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { Lock, Mail, ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react'

function ForgotPasswordContent() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    if (!email) {
      setError('Please enter your email address')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Always show success even if user doesn't exist (security best practice)
      setSuccess(true)
    } catch (error) {
      console.error('Error requesting password reset:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back to Login Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Login</span>
        </Link>

        {/* Card */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600/20 rounded-full mb-4">
              <Lock className="w-8 h-8 text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
            <p className="text-gray-400">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <div className="space-y-6">
              <div className="p-6 bg-green-900/20 border border-green-800/50 rounded-lg text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Check Your Email</h3>
                <p className="text-gray-400 text-sm mb-2">
                  If an account exists with <strong className="text-white">{email}</strong>, you'll receive a password reset link shortly.
                </p>
                <p className="text-gray-500 text-xs">
                  Don't see it? Check your spam folder.
                </p>
              </div>

              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
              >
                Send Another Link
              </button>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded-lg flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                  <button
                    onClick={() => setError('')}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              )}

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-gray-300 mb-2 font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Enter your email address"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      <Mail size={20} />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
            >
              Remember your password? Sign in
            </Link>
            <div className="text-gray-500 text-xs">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary-400 hover:text-primary-300">
                Sign up
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help?{' '}
            <Link href="/contact" className="text-primary-400 hover:text-primary-300">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  )
}
