'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  Shield,
  Users,
  Sparkles,
  LogIn,
} from 'lucide-react'

export default function AppointmentPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    { icon: CheckCircle, text: 'Expert guidance from professionals' },
    { icon: CheckCircle, text: 'Flexible scheduling options' },
    { icon: CheckCircle, text: 'Personalized 1-on-1 attention' },
    { icon: CheckCircle, text: 'Learn at your own pace' },
  ]

  const serviceTypes = [
    { name: 'MLO', icon: Shield, description: 'Master Level Optimization' },
    { name: 'Shell', icon: Sparkles, description: 'Custom Shell Development' },
    { name: 'Chain', icon: Users, description: 'Chain Configuration' },
    { name: 'Tattoo', icon: Sparkles, description: 'Tattoo Design Services' },
    { name: 'Face', icon: Shield, description: 'Face Customization' },
    { name: 'Other', icon: CheckCircle, description: 'Other Services' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Book Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                Appointment
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Schedule a personalized 1-on-1 session with our experts. Choose from various services
              and find the perfect time that works for you.
            </p>
            {!isLoading && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link
                    href="/account/appointments"
                    className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 text-lg"
                  >
                    <Calendar size={24} />
                    Go to My Appointments
                    <ArrowRight size={20} />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 text-lg"
                    >
                      <LogIn size={24} />
                      Login to Book
                    </Link>
                    <Link
                      href="/register"
                      className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 text-lg border border-gray-700"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Available Services</h2>
            <p className="text-gray-400 text-lg">Choose the service that best fits your needs</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceTypes.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.name}
                  className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-primary-500/50 transition-all"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{service.name}</h3>
                  <p className="text-gray-400">{service.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Us?</h2>
            <p className="text-gray-400 text-lg">Experience the difference of personalized service</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div
                  key={index}
                  className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 text-center"
                >
                  <Icon className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                  <p className="text-white font-medium">{benefit.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-900/20 to-primary-800/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 text-lg mb-8">
            Login to your account to book your appointment today.
          </p>
          {!isLoading && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  href="/account/appointments"
                  className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 text-lg"
                >
                  <Calendar size={24} />
                  Book Appointment Now
                  <ArrowRight size={20} />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 text-lg"
                >
                  <LogIn size={24} />
                  Login to Continue
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}


