'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Lock, Eye, EyeOff, ArrowRight, Mail, Loader2 } from 'lucide-react'

function LoginForm() {
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams?.get('registered') === 'true'
  const passwordReset = searchParams?.get('password_reset') === 'true'

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin()
  }

  const handleLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          rememberMe: formData.rememberMe,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setIsLoading(false)
        return
      }

      router.push('/account/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Visual Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-900 via-gray-900 to-black">
        {/* Animated Background Particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-purple-900/40 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top Section */}
          <div className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-bold text-white">
              RoyalT <span className="text-primary-400">Customz</span>
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all inline-flex items-center gap-2 text-sm"
            >
              Back to website
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Center Content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-5xl font-bold mb-4">Welcome Back</h2>
              <p className="text-xl text-gray-300">Sign in to continue your journey</p>
            </div>
          </div>

          {/* Bottom Tagline */}
          <div className="text-center">
            <p className="text-white text-lg font-medium">Creating Custom Excellence</p>
            <div className="flex justify-center gap-2 mt-4">
              <div className="w-8 h-1 bg-white rounded-full" />
              <div className="w-1 h-1 bg-white/50 rounded-full" />
              <div className="w-1 h-1 bg-white/50 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-gray-900 p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white inline-block">
              RoyalT <span className="text-primary-500">Customz</span>
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Sign in</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up
            </Link>
          </p>

          {/* Success Message */}
          {registered && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
              Account created successfully! Please sign in.
            </div>
          )}

          {/* Password Reset Success Message */}
          {passwordReset && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
              Password reset successfully! Please sign in with your new password.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username/Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter your username or email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-bulls-50 dark:bg-bulls-900/20 border border-bulls-200 dark:border-bulls-800 rounded-lg text-bulls-700 dark:text-bulls-400 text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">Or sign in with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.96-3.24-1.44-1.56-.65-2.53-1.01-2.53-1.97s.84-1.32 1.8-1.9c.72-.46 1.45-.94 2.32-1.5.5-.33.96-.68 1.4-1.03.88-.7 1.52-1.26 1.52-2.12 0-.84-.64-1.4-1.36-1.9-.72-.5-1.68-.96-2.64-1.36-.96-.4-1.88-.72-2.64-1.08-.76-.36-1.32-.8-1.68-1.32-.36-.52-.52-1.12-.52-1.8 0-1.04.36-1.96 1.08-2.76.72-.8 1.68-1.2 2.88-1.2.64 0 1.24.12 1.8.36.56.24 1.08.56 1.56.96.48.4.88.88 1.2 1.44.32.56.48 1.16.48 1.8 0 .64-.16 1.24-.48 1.8-.32.56-.72 1.04-1.2 1.44-.48.4-1 .72-1.56.96-.56.24-1.16.36-1.8.36-.96 0-1.68-.32-2.16-.96-.48-.64-.72-1.52-.72-2.64 0-1.12.24-2.08.72-2.88.48-.8 1.12-1.44 1.92-1.92.8-.48 1.68-.72 2.64-.72.64 0 1.24.12 1.8.36.56.24 1.08.56 1.56.96.48.4.88.88 1.2 1.44.32.56.48 1.16.48 1.8 0 .64-.16 1.24-.48 1.8-.32.56-.72 1.04-1.2 1.44-.48.4-1 .72-1.56.96-.56.24-1.16.36-1.8.36-.96 0-1.68-.32-2.16-.96-.48-.64-.72-1.52-.72-2.64 0-1.12.24-2.08.72-2.88.48-.8 1.12-1.44 1.92-1.92.8-.48 1.68-.72 2.64-.72z" />
                </svg>
                Apple
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
