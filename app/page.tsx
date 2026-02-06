'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Sparkles,
  Award,
  Users,
  Calendar,
  ShoppingBag,
  Star,
  CheckCircle,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  Play,
  Quote,
  Mail,
  Phone,
} from 'lucide-react'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const featuredPortfolio = [
    {
      id: 1,
      title: 'Custom MLO Design',
      client: 'Premium Client',
      category: 'MLO',
      image: '/images/portfolio/project-1.jpg',
    },
    {
      id: 2,
      title: 'Premium Shell Package',
      client: 'Elite Client',
      category: 'Shell',
      image: '/images/portfolio/project-2.jpg',
    },
    {
      id: 3,
      title: 'Custom Chain Collection',
      client: 'VIP Client',
      category: 'Chain',
      image: '/images/portfolio/project-3.jpg',
    },
  ]

  const testimonials = [
    {
      id: 1,
      author: 'John D.',
      rating: 5,
      comment:
        'Amazing work! The MLO customization exceeded my expectations. Professional service and quick turnaround.',
      service: 'MLO',
    },
    {
      id: 2,
      author: 'Sarah M.',
      rating: 5,
      comment:
        'Best custom chain design I\'ve ever seen. RoyalT really knows what they\'re doing. Highly recommend!',
      service: 'Chain',
    },
    {
      id: 3,
      author: 'Mike T.',
      rating: 5,
      comment:
        'The 1-on-1 class was incredibly helpful. Learned so much about shell customization. Worth every penny!',
      service: 'Shell',
    },
  ]

  const stats = [
    { label: 'Projects Completed', value: '500+', icon: CheckCircle, color: 'from-primary-500 to-primary-600' },
    { label: 'Happy Clients', value: '300+', icon: Users, color: 'from-primary-400 to-primary-500' },
    { label: 'Years Experience', value: '5+', icon: Award, color: 'from-primary-600 to-primary-700' },
    { label: 'Success Rate', value: '98%', icon: TrendingUp, color: 'from-primary-500 to-primary-600' },
  ]

  const services = [
    { name: 'MLO', icon: Sparkles, description: 'Professional MLO customization with attention to detail' },
    { name: 'Shell', icon: Shield, description: 'High-quality shell designs and modifications' },
    { name: 'Chain', icon: Zap, description: 'Custom chain designs and collections' },
    { name: 'Tattoo', icon: Award, description: 'Professional tattoo design services' },
    { name: 'Face', icon: Users, description: 'Advanced face customization work' },
    { name: 'Other', icon: Sparkles, description: 'Custom solutions for unique needs' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section - Enhanced with Animations */}
      <section className="relative py-24 lg:py-32 overflow-hidden min-h-[90vh] flex items-center">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          {/* Fallback gradient - shows if image doesn't load */}
          <div className="absolute inset-0 hero-gradient" />
          {/* Background Image - on top of gradient */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/hero-bg.jpg')",
            }}
          />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-[1]">
          {/* Floating Orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float-reverse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/5 rounded-full blur-3xl animate-pulse-slow" />
          
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Radial Gradient Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.15),transparent_70%)]" />
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.8))]" />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary-500/30 rounded-full animate-float"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 12}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + i}s`,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-[2]">
          <div className="text-center">
            {/* Badge with animation */}
            <div
              className={`inline-block mb-6 transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.2s' }}
            >
              <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium backdrop-blur-sm">
                Professional Custom Services
              </span>
            </div>
            
            {/* Main Heading with animation */}
            <h1
              className={`text-6xl md:text-8xl font-bold mb-6 leading-tight transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.4s' }}
            >
              <span className="text-white inline-block">YOUR DREAM IS</span>
              <br />
              <span className="text-primary-500 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 inline-block">
                OUR VISION
              </span>
            </h1>
            
            {/* Description with animation */}
            <p
              className={`text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.6s' }}
            >
              Experience the highest quality customization with flexible pricing, timely delivery,
              and exceptional customer service. We bring your vision to life.
            </p>
            
            {/* Buttons with animation */}
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.8s' }}
            >
              <Link
                href="/portfolio"
                className="group px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:scale-105"
              >
                View Portfolio
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/service"
                className="px-8 py-4 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-600 backdrop-blur-sm hover:scale-105"
              >
                <Calendar size={20} />
                Book Appointment
              </Link>
            </div>

            {/* Trust Indicators with animation */}
            <div
              className={`flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400 transition-all duration-1000 ${
                mounted ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDelay: '1s' }}
            >
              <div className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                <Shield className="w-5 h-5 text-primary-500" />
                <span>Escrow Protected</span>
              </div>
              <div className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                <Zap className="w-5 h-5 text-primary-500" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                <Star className="w-5 h-5 text-primary-500 fill-primary-500" />
                <span>5.0 Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-[2]">
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary-500 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section - Redesigned */}
      <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(206,17,65,0.05),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="group text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-primary-500/50 transition-all hover:bg-gray-800/50"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* About Section - Redesigned */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
                  About Us
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                ABOUT <span className="text-primary-500">ROYALT CUSTOMZ</span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                RoyalT Customz is an innovative custom services studio with years of experience
                delivering exceptional results. Our mission has always been to provide the highest
                quality content, flexible pricing, timely delivery and courteous customer service.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                Our clients keep coming back because they know when they work with RoyalT Customz,
                they are in reliable good hands. Every project sits at the forefront of our minds
                until it's completed to the highest capacity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all"
                >
                  Learn More
                  <ArrowRight size={20} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all border border-gray-700"
                >
                  <Phone size={20} />
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Award, title: 'Highest Quality', desc: 'Premium quality work that exceeds expectations every time.' },
                { icon: Sparkles, title: 'Flexible Pricing', desc: 'Competitive pricing that fits your budget without compromise.' },
                { icon: Clock, title: 'Timely Delivery', desc: 'Fast turnaround times without compromising on quality.' },
                { icon: Users, title: 'Customer Service', desc: 'Dedicated support throughout your project from start to finish.' },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={index}
                    className="group p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700 hover:border-primary-500/50 transition-all hover:shadow-lg hover:shadow-primary-500/10"
                  >
                    <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-600/30 transition-colors">
                      <Icon className="w-6 h-6 text-primary-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Portfolio - Redesigned */}
      <section className="py-32 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16">
            <div className="mb-8 md:mb-0">
              <div className="inline-block mb-4">
                <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
                  Portfolio
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mb-4">
                FEATURED <span className="text-primary-500">WORK</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl">
                Explore our latest projects and see the quality we deliver
              </p>
            </div>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-primary-600/30"
            >
              View All
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredPortfolio.map((item, index) => (
              <Link
                key={item.id}
                href="/portfolio"
                className="group relative bg-gray-800/30 rounded-2xl border border-gray-700/50 hover:border-primary-500/50 transition-all overflow-hidden hover:shadow-2xl hover:shadow-primary-500/10"
              >
                <div className="aspect-video relative overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900">
                      <div className="text-7xl font-bold text-gray-600 group-hover:text-primary-500 transition-colors">
                        {index + 1}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-primary-600/90 backdrop-blur-sm border border-primary-500/50 rounded-full text-primary-100 text-xs font-semibold">
                    {item.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary-500 transition-colors text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">{item.client}</p>
                  <div className="flex items-center gap-2 text-primary-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View Project</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Redesigned */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
                Services
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              OUR <span className="text-primary-500">SERVICES</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From custom designs to 1-on-1 classes, we offer a wide range of services to bring
              your vision to life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <Link
                  key={service.name}
                  href="/service"
                  className="group relative p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-primary-500/50 transition-all hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-colors" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600/20 to-primary-700/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-600/30 transition-all">
                      <Icon className="w-8 h-8 text-primary-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary-500 transition-colors text-white">
                      {service.name}
                    </h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-2 text-primary-500 font-medium text-sm">
                      <span>Learn More</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Redesigned */}
      <section className="py-32 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(220,38,38,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
                Testimonials
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              WHAT <span className="text-primary-500">CLIENTS SAY</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Don't just take our word for it - see what our satisfied clients have to say.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="group relative p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-primary-500/50 transition-all hover:shadow-2xl hover:shadow-primary-500/10"
              >
                <div className="absolute top-6 left-6 opacity-10">
                  <Quote className="w-16 h-16 text-primary-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= testimonial.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed italic text-lg">
                    "{testimonial.comment}"
                  </p>
                  <div className="flex items-center gap-3 pt-6 border-t border-gray-700/50">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-600/20 to-primary-700/20 rounded-full flex items-center justify-center">
                      <span className="text-primary-500 font-bold text-lg">
                        {testimonial.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{testimonial.author}</p>
                      <p className="text-sm text-gray-400">{testimonial.service}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-primary-600/30"
            >
              Read All Reviews
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Process Section - Redesigned */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
                Process
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              HOW IT <span className="text-primary-500">WORKS</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Simple, straightforward process from start to finish
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {[
              { step: '1', title: 'Contact Us', desc: 'Reach out or book an appointment', icon: Phone },
              { step: '2', title: 'Discuss Project', desc: 'We understand your vision', icon: Users },
              { step: '3', title: 'We Create', desc: 'Professional work begins', icon: Sparkles },
              { step: '4', title: 'Deliver & Support', desc: 'Get your project & ongoing support', icon: CheckCircle },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="text-center relative">
                  {index < 3 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-1 bg-gradient-to-r from-primary-600 to-gray-700 z-0">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary-600 rounded-full border-4 border-black" />
                    </div>
                  )}
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 shadow-lg shadow-primary-600/30 group-hover:scale-110 transition-transform">
                      <Icon className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Newsletter Section - Redesigned */}
      <section className="py-32 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.15),transparent_70%)]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl border border-gray-700/50 p-8 md:p-12 backdrop-blur-sm shadow-2xl">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl mb-6 shadow-lg shadow-primary-600/30">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                Join us for high quality, affordable and{' '}
                <span className="text-primary-500">fun content!</span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Get access to exclusive offers by signing up for our email list
              </p>
            </div>

            {/* Email Form */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg transition-all"
                />
                <button className="px-10 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:scale-105 whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: CheckCircle, text: 'Exclusive discounts on build shop items' },
                { text: 'Notification of new content releases' },
                { text: 'Chances to win free custom builds' },
              ].map((benefit, index) => {
                const Icon = benefit.icon || CheckCircle
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-gray-900/50 rounded-xl border border-gray-700/50 hover:border-primary-500/50 transition-all"
                  >
                    <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary-500" />
                    </div>
                    <p className="text-gray-300 leading-relaxed pt-1.5">{benefit.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Redesigned */}
      <section className="py-32 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.15),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
              Get Started
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            READY TO GET <span className="text-primary-500">STARTED?</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Let's bring your vision to life. Contact us today or browse our marketplace for
            ready-made products.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/contact"
              className="group px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg transition-all inline-flex items-center justify-center gap-2 shadow-2xl shadow-primary-600/30 hover:scale-105"
            >
              Contact Us
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/marketplace"
              className="px-10 py-5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-lg transition-all inline-flex items-center justify-center gap-2 border-2 border-gray-700 hover:border-gray-600 hover:scale-105"
            >
              <ShoppingBag size={22} />
              Visit Marketplace
            </Link>
            <Link
              href="/service"
              className="px-10 py-5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-lg transition-all inline-flex items-center justify-center gap-2 border-2 border-gray-700 hover:border-gray-600 hover:scale-105"
            >
              <Calendar size={22} />
              Book Appointment
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
