'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Mail,
  MessageSquare,
  Send,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Calendar,
} from 'lucide-react'

export default function Contact() {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      alert('Thank you for your message! We will get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setSubmitted(false)
    }, 500)
  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      content: 'contact@royaltcustomz.com',
      link: 'mailto:contact@royaltcustomz.com',
      color: 'from-primary-500 to-primary-600',
    },
    {
      icon: MessageSquare,
      title: 'Support Tickets',
      content: 'Get help through our ticket system',
      link: '/service',
      color: 'from-primary-400 to-primary-500',
    },
    {
      icon: Calendar,
      title: 'Book Appointment',
      content: 'Schedule a 1-on-1 consultation',
      link: '/service',
      color: 'from-primary-600 to-primary-700',
    },
  ]

  const businessHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
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
                Contact
              </span>
            </div>
            <h1
              className={`text-6xl md:text-8xl font-bold mb-6 leading-tight transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.4s' }}
            >
              <span className="text-white">CONTACT</span>{' '}
              <span className="text-primary-500">US</span>
            </h1>
            <p
              className={`text-xl md:text-2xl text-gray-300 leading-relaxed transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.6s' }}
            >
              Have a question or want to start a project? Get in touch with us! We are here to help
              bring your vision to life.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <Link
                  key={index}
                  href={method.link}
                  className="group p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-primary-500/50 transition-all hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1"
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary-500 transition-colors text-white">
                    {method.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">{method.content}</p>
                  <div className="mt-4 flex items-center gap-2 text-primary-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Learn More</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <div className="inline-block mb-6">
                  <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
                    Get in Touch
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  LET'S <span className="text-primary-500">CONNECT</span>
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed mb-8">
                  We are here to help! Reach out to us through any of the following methods. Our
                  team is ready to assist you with your project.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
                  <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email Us</h3>
                    <a
                      href="mailto:contact@royaltcustomz.com"
                      className="text-primary-500 hover:text-primary-400 transition-colors"
                    >
                      contact@royaltcustomz.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
                  <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Support Tickets</h3>
                    <p className="text-gray-400 text-sm mb-2">
                      Use our ticket system for technical support and inquiries.
                    </p>
                    <Link
                      href="/service"
                      className="text-primary-500 hover:text-primary-400 text-sm font-medium inline-flex items-center gap-1"
                    >
                      Open a ticket
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
                  <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-4">Business Hours</h3>
                    <div className="space-y-2">
                      {businessHours.map((schedule, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-400">{schedule.day}</span>
                          <span className="text-gray-300 font-medium">{schedule.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 p-8 md:p-12">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                  SEND US A <span className="text-primary-500">MESSAGE</span>
                </h2>
                <p className="text-gray-400">
                  Fill out the form below and we will get back to you as soon as possible.
                </p>
              </div>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-400">We will get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="What is this about?"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Message</label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder="Tell us about your project or question..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-lg transition-all shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2"
                  >
                    <Send size={22} />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.15),transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
              Quick Actions
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            READY TO GET <span className="text-primary-500">STARTED?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Choose the best way to reach us or start your project today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/service"
              className="group px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg transition-all inline-flex items-center justify-center gap-2 shadow-2xl shadow-primary-600/30 hover:scale-105"
            >
              <Calendar size={22} />
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
