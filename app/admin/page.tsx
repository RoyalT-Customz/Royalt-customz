'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  BookOpen,
  Image,
  Users,
  Package,
  Calendar,
  MessageSquare,
  TrendingUp,
  DollarSign,
  ArrowRight,
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalBlogs: 0,
    totalPortfolio: 0,
    activeAppointments: 0,
    openTickets: 0,
    revenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      // TODO: Create API endpoints for admin stats
      // For now, set to 0
      setStats({
        totalUsers: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalBlogs: 0,
        totalPortfolio: 0,
        activeAppointments: 0,
        openTickets: 0,
        revenue: 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      href: '/admin/users',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: Package,
      color: 'from-green-500 to-green-600',
      href: '/admin/orders',
    },
    {
      label: 'Products',
      value: stats.totalProducts,
      icon: ShoppingBag,
      color: 'from-purple-500 to-purple-600',
      href: '/admin/marketplace',
    },
    {
      label: 'Blog Posts',
      value: stats.totalBlogs,
      icon: BookOpen,
      color: 'from-bulls-500 to-bulls-600',
      href: '/admin/blogs',
    },
    {
      label: 'Portfolio Items',
      value: stats.totalPortfolio,
      icon: Image,
      color: 'from-bulls-500 to-bulls-600',
      href: '/admin/portfolio',
    },
    {
      label: 'Appointments',
      value: stats.activeAppointments,
      icon: Calendar,
      color: 'from-cyan-500 to-cyan-600',
      href: '/admin/appointments',
    },
    {
      label: 'Open Tickets',
      value: stats.openTickets,
      icon: MessageSquare,
      color: 'from-bulls-500 to-bulls-600',
      href: '/admin/tickets',
    },
    {
      label: 'Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      href: '/admin/orders',
    },
  ]

  const quickActions = [
    { label: 'Add Product', href: '/admin/marketplace', icon: ShoppingBag },
    { label: 'Create Blog Post', href: '/admin/blogs', icon: BookOpen },
    { label: 'Add Portfolio Item', href: '/admin/portfolio', icon: Image },
    { label: 'Manage Services', href: '/admin/services', icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <section className="border-b border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Admin <span className="text-primary-500">Dashboard</span>
            </h1>
            <p className="text-gray-400 text-base lg:text-lg">Manage your website content and users</p>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Link
                key={index}
                href={stat.href}
                className="group relative p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-primary-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/10 overflow-hidden"
              >
                {/* Background gradient effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-white">Quick Actions</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={index}
                href={action.href}
                className="group relative p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-primary-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary-600/20 rounded-xl flex items-center justify-center group-hover:bg-primary-600/30 transition-colors group-hover:scale-110 duration-300">
                    <Icon className="w-7 h-7 text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1 truncate">{action.label}</h3>
                    <div className="flex items-center gap-1 text-primary-500 text-sm font-medium">
                      <span>Go to</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 pb-12">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-white">Recent Orders</h2>
              <Link
                href="/admin/orders"
                className="text-primary-500 hover:text-primary-400 text-sm font-medium inline-flex items-center gap-1 transition-colors"
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800/50 rounded-full mb-4">
                <Package className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-gray-400">No recent orders</p>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-white">Recent Users</h2>
              <Link
                href="/admin/users"
                className="text-primary-500 hover:text-primary-400 text-sm font-medium inline-flex items-center gap-1 transition-colors"
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800/50 rounded-full mb-4">
                <Users className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-gray-400">No recent users</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

