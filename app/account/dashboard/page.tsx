'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  Calendar,
  MessageSquare,
  Star,
  TrendingUp,
  Package,
  ArrowRight,
  Clock,
} from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalOrders: 0,
    appointments: 0,
    activeTickets: 0,
    reviews: 0,
  })

  useEffect(() => {
    fetchUser()
    fetchStats()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])

  const fetchStats = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/account/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats({
          totalOrders: statsData.totalOrders || 0,
          appointments: statsData.appointments || 0,
          activeTickets: statsData.activeTickets || 0,
          reviews: statsData.reviews || 0,
        })
      }

      // Fetch recent orders
      const ordersResponse = await fetch('/api/account/orders')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setRecentOrders(ordersData.orders?.slice(0, 2) || [])
      }

      // Fetch upcoming appointments
      const appointmentsResponse = await fetch('/api/account/appointments')
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        setUpcomingAppointments(appointmentsData.appointments?.slice(0, 2) || [])
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Welcome back, <span className="text-primary-500">{user?.username || 'User'}</span>!
            </h1>
            <p className="text-gray-400 text-lg">Here's what's happening with your account</p>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-primary-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.totalOrders}</div>
            <div className="text-gray-400 text-sm">Total Orders</div>
          </div>

          <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.appointments}</div>
            <div className="text-gray-400 text-sm">Appointments</div>
          </div>

          <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-700/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.activeTickets}</div>
            <div className="text-gray-400 text-sm">Active Tickets</div>
          </div>

          <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-primary-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.reviews}</div>
            <div className="text-gray-400 text-sm">Reviews Given</div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
              <Link
                href="/account/orders"
                className="text-primary-500 hover:text-primary-400 text-sm font-medium inline-flex items-center gap-1"
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
                <p className="text-gray-400">Your recent orders will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-primary-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{order.product || `Order #${order.id}`}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock size={14} />
                          <span>{order.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-400">${order.total}</div>
                      <span className="text-xs px-2 py-1 bg-primary-600/20 text-primary-400 rounded-full">
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Upcoming Appointments</h2>
              <Link
                href="/account/appointments"
                className="text-primary-500 hover:text-primary-400 text-sm font-medium inline-flex items-center gap-1"
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No appointments</h3>
                <p className="text-gray-400">Your upcoming appointments will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-primary-500/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white mb-1">{appointment.service}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar size={14} />
                        <span>{appointment.date}</span>
                        <span>•</span>
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-primary-600/20 text-primary-400 rounded-full">
                      {appointment.status}
                    </span>
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

