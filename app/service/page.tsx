'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Appointments from '@/components/Appointments'
import TicketSystem from '@/components/TicketSystem'
import {
  Calendar,
  MessageSquare,
  CheckCircle,
  Sparkles,
  Shield,
  Zap,
  Award,
  Users,
  Clock,
  ArrowRight,
  Star,
  Settings,
} from 'lucide-react'

interface Service {
  id: string
  name: string
  description?: string
  category: string
  icon?: string
  duration_minutes: number
  price?: number
}

export default function Service() {
  const [mounted, setMounted] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'appointments' | 'tickets'>('appointments')

  const fetchServices = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        // Transform database services to match Service interface
        const transformedServices: Service[] = (data.services || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          category: s.category,
          icon: s.icon,
          duration_minutes: s.duration_minutes,
          price: s.price,
        }))
        setServices(transformedServices)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    fetchServices()
  }, [fetchServices])

  // Icon mapping for lucide-react icons
  const iconMap: Record<string, any> = {
    Sparkles,
    Shield,
    Zap,
    Award,
    Users,
    Settings,
  }

  // Color mapping for service categories
  const colorMap: Record<string, string> = {
    MLO: 'from-primary-500 to-primary-600',
    Shell: 'from-primary-400 to-primary-500',
    Chain: 'from-primary-600 to-primary-700',
    Tattoo: 'from-primary-500 to-primary-600',
    Face: 'from-primary-400 to-primary-500',
    Other: 'from-primary-600 to-primary-700',
  }

  // Use only database services - no mock data
  const displayServices = services

  const benefits = [
    { icon: CheckCircle, text: 'Expert guidance from professionals' },
    { icon: CheckCircle, text: 'Flexible scheduling options' },
    { icon: CheckCircle, text: 'Personalized 1-on-1 attention' },
    { icon: CheckCircle, text: 'Learn at your own pace' },
  ]

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
                Services
              </span>
            </div>
            <h1
              className={`text-6xl md:text-8xl font-bold mb-6 leading-tight transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.4s' }}
            >
              OUR <span className="text-primary-500">SERVICES</span>
            </h1>
            <p
              className={`text-xl md:text-2xl text-gray-300 leading-relaxed transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.6s' }}
            >
              Book a 1-on-1 class or get support through our ticket system. We are here to help
              bring your vision to life.
            </p>
          </div>
        </div>
      </section>

      {/* Service Options Section */}
      <section className="py-20 bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              AVAILABLE <span className="text-primary-500">SERVICES</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose from our range of professional customization services
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
              <p className="text-xl text-gray-400">Loading services...</p>
            </div>
          ) : displayServices.length === 0 ? (
            <div className="text-center py-20">
              <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400 mb-4">No services available yet</p>
              <p className="text-gray-500">Services will appear here once they are added by the admin.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayServices.map((service, index) => {
                // Get icon component from iconMap or use default
                const IconName = service.icon || 'Sparkles'
                const Icon = iconMap[IconName] || Sparkles
                const color = colorMap[service.category] || 'from-primary-500 to-primary-600'
                return (
                  <div
                    key={service.id}
                    onClick={() => setActiveTab('appointments')}
                    className="group relative p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-primary-500/50 transition-all cursor-pointer hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-colors" />
                    <div className="relative z-10">
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-primary-500 transition-colors text-white">
                        {service.name}
                      </h3>
                      <p className="text-gray-400 leading-relaxed mb-4">
                        {service.description || 'Professional service with expert guidance'}
                      </p>
                      {service.price && (
                        <p className="text-primary-400 font-semibold mb-2">${service.price.toFixed(2)}</p>
                      )}
                      {service.duration_minutes && (
                        <p className="text-gray-500 text-sm mb-4">{service.duration_minutes} minutes</p>
                      )}
                      <div className="flex items-center gap-2 text-primary-500 font-medium text-sm">
                        <span>Book Now</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-6">
                <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
                  Benefits
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                WHY BOOK A <span className="text-primary-500">1-ON-1 CLASS?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Get personalized attention and expert guidance tailored to your specific needs and
                learning pace.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary-500" />
                      </div>
                      <p className="text-gray-300 text-lg leading-relaxed pt-2">{benefit.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 p-12 flex flex-col justify-center items-center space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/30">
                  <Star className="w-12 h-12 text-white fill-white" />
                </div>
                <h3 className="text-3xl font-bold text-white text-center">Premium Experience</h3>
                <p className="text-gray-400 text-center leading-relaxed">
                  Work directly with our experts in a focused, one-on-one environment designed for
                  maximum learning and results.
                </p>
              </div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
                Get Started
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              BOOK OR <span className="text-primary-500">GET SUPPORT</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose how you would like to proceed
            </p>
          </div>

          {/* Enhanced Tabs */}
          <div className="mb-12">
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`
                  group relative px-8 py-4 rounded-xl font-semibold transition-all duration-300
                  ${
                    activeTab === 'appointments'
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-105'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Calendar
                    size={24}
                    className={activeTab === 'appointments' ? 'text-white' : 'text-primary-500'}
                  />
                  <span>Book Appointment</span>
                </div>
                {activeTab === 'appointments' && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-primary-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`
                  group relative px-8 py-4 rounded-xl font-semibold transition-all duration-300
                  ${
                    activeTab === 'tickets'
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-105'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare
                    size={24}
                    className={activeTab === 'tickets' ? 'text-white' : 'text-primary-500'}
                  />
                  <span>Ticket System</span>
                </div>
                {activeTab === 'tickets' && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-primary-500 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/50 p-8 md:p-12">
            {activeTab === 'appointments' && <Appointments />}
            {activeTab === 'tickets' && <TicketSystem />}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
                FAQ
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              FREQUENTLY ASKED <span className="text-primary-500">QUESTIONS</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'How long does a 1-on-1 class last?',
                answer:
                  'Our 1-on-1 classes typically last 1-2 hours, depending on the service and your specific needs. We can adjust the duration to fit your schedule.',
              },
              {
                question: 'What should I prepare before the class?',
                answer:
                  'Just bring your ideas and any reference materials you have. We will provide all the necessary tools and guidance during the session.',
              },
              {
                question: 'Can I reschedule my appointment?',
                answer:
                  'Yes, you can reschedule your appointment up to 24 hours before the scheduled time. Contact us through the ticket system for assistance.',
              },
              {
                question: 'What payment methods do you accept?',
                answer:
                  'We accept various payment methods including credit cards, PayPal, and other secure payment options. Payment is processed securely during booking.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-primary-500/50 transition-all"
              >
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.15),transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
              Ready to Start
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            READY TO BOOK YOUR <span className="text-primary-500">APPOINTMENT?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Get started today and experience the difference of working with professionals who care
            about your success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setActiveTab('appointments')}
              className="group px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg transition-all inline-flex items-center justify-center gap-2 shadow-2xl shadow-primary-600/30 hover:scale-105"
            >
              Book Now
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              href="/contact"
              className="px-10 py-5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-lg transition-all inline-flex items-center justify-center gap-2 border-2 border-gray-700 hover:border-gray-600 hover:scale-105"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
