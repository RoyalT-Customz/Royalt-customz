'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  Eye,
  ShoppingBag,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Home,
  Package,
  CreditCard,
  Bell,
  ChevronRight,
  Star,
  HelpCircle,
} from 'lucide-react'
import { getUserDisplayName, getUserDisplayEmail } from '@/lib/user-display'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetchUser()
    
    // Listen for avatar updates
    const handleAvatarUpdate = () => {
      fetchUser()
    }
    
    window.addEventListener('avatar-updated', handleAvatarUpdate)
    
    return () => {
      window.removeEventListener('avatar-updated', handleAvatarUpdate)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const [stats, setStats] = useState({
    orders: 0,
    appointments: 0,
    tickets: 0,
  })

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const [ordersRes, appointmentsRes, ticketsRes] = await Promise.all([
        fetch('/api/account/orders'),
        fetch('/api/account/appointments'),
        fetch('/api/account/tickets'),
      ])

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setStats((prev) => ({ ...prev, orders: ordersData.orders?.length || 0 }))
      }
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json()
        setStats((prev) => ({ ...prev, appointments: appointmentsData.appointments?.length || 0 }))
      }
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json()
        setStats((prev) => ({ ...prev, tickets: ticketsData.tickets?.length || 0 }))
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const menuSections = [
    {
      title: 'Main',
      items: [
        { href: '/account/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { href: '/account/overview', label: 'Overview', icon: Eye, badge: null },
      ],
    },
    {
      title: 'Services',
      items: [
        { href: '/account/orders', label: 'Orders', icon: ShoppingBag, badge: stats.orders },
        { href: '/account/appointments', label: 'Appointments', icon: Calendar, badge: stats.appointments },
      ],
    },
    {
      title: 'Support',
      items: [
        { href: '/account/tickets', label: 'Tickets', icon: MessageSquare, badge: stats.tickets },
        { href: '/account/settings', label: 'Settings', icon: Settings, badge: null },
      ],
    },
  ]

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-black border-r border-gray-800/50 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-transparent">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="text-xl font-bold text-white hover:text-primary-400 transition-colors">
                RoyalT <span className="text-primary-500">Customz</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* User Profile Card */}
            <Link
              href="/account/overview"
              onClick={() => setSidebarOpen(false)}
              className="group flex items-center gap-4 p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-primary-500/50 transition-all hover:shadow-lg hover:shadow-primary-500/10"
            >
              <div className="relative w-14 h-14 flex-shrink-0">
                {user.avatar_url ? (
                  user.avatar_url.startsWith('data:') ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-full h-full rounded-full object-cover ring-2 ring-primary-500/50 group-hover:ring-primary-500 transition-all"
                    />
                  ) : (
                    <Image
                      src={user.avatar_url}
                      alt={user.username}
                      fill
                      className="rounded-full object-cover ring-2 ring-primary-500/50 group-hover:ring-primary-500 transition-all"
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center ring-2 ring-primary-500/50 group-hover:ring-primary-500 transition-all">
                    <User className="w-7 h-7 text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate group-hover:text-primary-400 transition-colors">
                  {getUserDisplayName(user)}
                </p>
                <p className="text-gray-400 text-sm truncate">{getUserDisplayEmail(user)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-primary-600/20 text-primary-400 text-xs rounded-full font-medium">
                    Member
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-primary-400 transition-colors flex-shrink-0" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
            {menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          group relative flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all
                          ${
                            isActive
                              ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/30'
                              : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`
                              flex items-center justify-center w-10 h-10 rounded-lg transition-all
                              ${
                                isActive
                                  ? 'bg-white/20'
                                  : 'bg-gray-800/50 group-hover:bg-gray-700/50'
                              }
                            `}
                          >
                            <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                          </div>
                          <span className="font-medium flex-1 truncate">{item.label}</span>
                        </div>
                        {item.badge !== null && item.badge > 0 && (
                          <span
                            className={`
                              px-2 py-0.5 text-xs font-semibold rounded-full min-w-[24px] text-center
                              ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-primary-600/20 text-primary-400'
                              }
                            `}
                          >
                            {item.badge}
                          </span>
                        )}
                        {!isActive && (
                          <ChevronRight className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800/50 space-y-2 bg-gradient-to-t from-gray-900/50 to-transparent">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-800/50 group-hover:bg-gray-700/50 flex items-center justify-center transition-all">
                <Home size={18} />
              </div>
              <span className="font-medium">Back to Website</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-bulls-400 hover:bg-bulls-900/20 hover:text-bulls-300 transition-all group border border-bulls-900/30 hover:border-bulls-800/50"
            >
              <div className="w-10 h-10 rounded-lg bg-bulls-900/20 group-hover:bg-bulls-900/30 flex items-center justify-center transition-all">
                <LogOut size={18} />
              </div>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-gradient-to-r from-gray-900 to-gray-900/95 backdrop-blur-sm border-b border-gray-800/50 px-4 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
            >
              <Menu size={24} />
            </button>
            <Link href="/" className="text-lg font-bold text-white hover:text-primary-400 transition-colors">
              RoyalT <span className="text-primary-500">Customz</span>
            </Link>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center ring-2 ring-primary-500/30">
              {user.avatar_url ? (
                user.avatar_url.startsWith('data:') ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Image
                    src={user.avatar_url}
                    alt={user.username}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                )
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}

