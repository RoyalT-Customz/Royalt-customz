'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Award,
  Users,
  Clock,
  Heart,
  Sparkles,
  Shield,
  Zap,
  Target,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  Calendar,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'

export default function About() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const values = [
    {
      icon: Award,
      title: 'Quality First',
      description: 'We never compromise on quality. Every project is completed to the highest standards with meticulous attention to detail.',
      color: 'from-primary-500 to-primary-600',
    },
    {
      icon: Clock,
      title: 'Timely Delivery',
      description: 'We respect your time and always deliver projects on schedule without compromising on quality or attention to detail.',
      color: 'from-primary-400 to-primary-500',
    },
    {
      icon: Users,
      title: 'Customer Focus',
      description: 'Your satisfaction is our priority. We work closely with you every step of the way to ensure your vision becomes reality.',
      color: 'from-primary-600 to-primary-700',
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'We love what we do, and it shows in every project we complete. Our passion drives us to exceed expectations.',
      color: 'from-primary-500 to-primary-600',
    },
  ]

  const whyChooseUs = [
    'Years of experience in custom services and design',
    'Flexible pricing that fits your budget',
    'Fast turnaround times without compromising quality',
    'Dedicated customer support throughout your project',
    'Portfolio of successful projects and satisfied clients',
    'Continuous innovation and staying ahead of trends',
  ]

  const stats = [
    { value: '500+', label: 'Projects Completed', icon: CheckCircle },
    { value: '300+', label: 'Happy Clients', icon: Users },
    { value: '5+', label: 'Years Experience', icon: Calendar },
    { value: '98%', label: 'Success Rate', icon: TrendingUp },
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
                About Us
              </span>
            </div>
            <h1
              className={`text-6xl md:text-8xl font-bold mb-6 leading-tight transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.4s' }}
            >
              ABOUT <span className="text-primary-500">ROYALT CUSTOMZ</span>
            </h1>
            <p
              className={`text-xl md:text-2xl text-gray-300 leading-relaxed transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.6s' }}
            >
              Your dream is our vision. We're dedicated to providing the highest quality custom
              services and products with passion, precision, and professionalism.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-primary-500/50 transition-all"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600/20 rounded-xl mb-4">
                    <Icon className="w-7 h-7 text-primary-500" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
                  Our Story
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                OUR <span className="text-primary-500">JOURNEY</span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                RoyalT Customz is an innovative custom services studio that has been serving clients
                with excellence for years. With our extensive experience, we have had the privilege
                to work with various clients and deliver outstanding results that exceed expectations.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                Our mission statement from the very beginning has always been and will always be to
                provide the highest quality content, flexible pricing, timely delivery and courteous
                customer service. Our clients keep coming back to us for multiple projects because
                they know when they are working with RoyalT Customz, they are in reliable good hands.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                Every project sits at the forefront of our minds until it's completed to the highest
                capacity. Through dedication, innovation, and a commitment to excellence, we've built
                a reputation that speaks for itself.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary-600/30">
                    <Award className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Excellence</h3>
                  <p className="text-gray-400">Since Day One</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
                Values
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              OUR <span className="text-primary-500">VALUES</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div
                  key={index}
                  className="group relative p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-primary-500/50 transition-all hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-colors" />
                  <div className="relative z-10">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-primary-500 transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 p-12 flex flex-col justify-center space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white">Why Choose Us?</h3>
                </div>
                <div className="space-y-4">
                  {whyChooseUs.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-primary-500" />
                      </div>
                      <span className="text-gray-300 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-6 -left-6 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl" />
            </div>
            <div className="space-y-6">
              <div className="inline-block">
                <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
                  Why Us
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                WHY CHOOSE <span className="text-primary-500">ROYALT CUSTOMZ?</span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                We stand out from the competition through our unwavering commitment to excellence,
                innovative solutions, and personalized service that puts your needs first.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                Our team combines years of experience with cutting-edge techniques to deliver results
                that not only meet but exceed your expectations. We understand that every project is
                unique, and we tailor our approach to ensure your specific vision comes to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/portfolio"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all"
                >
                  View Our Work
                  <ArrowRight size={20} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all border border-gray-700"
                >
                  <Mail size={20} />
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-32 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(220,38,38,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
                Mission & Vision
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              OUR <span className="text-primary-500">MISSION</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-primary-500/50 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">Our Mission</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                To provide the highest quality custom services and products with flexible pricing,
                timely delivery, and exceptional customer service. We strive to exceed expectations
                and build lasting relationships with every client.
              </p>
            </div>

            <div className="p-10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-primary-500/50 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">Our Vision</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                To be the leading custom services studio recognized for innovation, quality, and
                customer satisfaction. We envision a future where every client's dream becomes reality
                through our expertise and dedication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.15),transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
              Get Started
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            READY TO WORK <span className="text-primary-500">WITH US?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Let's bring your vision to life. Contact us today to discuss your project and see how we
            can help you achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="group px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 hover:scale-105"
            >
              Contact Us
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/service"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-600 hover:scale-105"
            >
              <Calendar size={20} />
              Book Appointment
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
