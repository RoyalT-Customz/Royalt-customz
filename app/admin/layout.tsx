'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  Image,
  Settings,
  Users,
  Package,
  Calendar,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react'

export default function AdminLayout({
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
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        if (data.user?.role === 'admin') {
          setUser(data.user)
        } else {
          router.push('/account/dashboard')
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error checking admin access:', error)
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

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/admin/blogs', label: 'Blogs', icon: BookOpen },
    { href: '/admin/portfolio', label: 'Portfolio', icon: Image },
    { href: '/admin/services', label: 'Services', icon: Settings },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/orders', label: 'Orders', icon: Package },
    { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { href: '/admin/tickets', label: 'Tickets', icon: MessageSquare },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-black border-r border-gray-800/50 z-[110] transform transition-transform duration-300 ease-in-out shadow-2xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-transparent">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Admin <span className="text-primary-500">Panel</span>
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg shadow-primary-600/30">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{user?.username || 'Admin'}</p>
                <p className="text-gray-400 text-xs">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative
                    ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800/50 space-y-1.5 bg-gradient-to-t from-gray-900/50 to-transparent">
            <Link
              href="/account/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all group"
            >
              <LayoutDashboard size={20} className="text-gray-400 group-hover:text-white" />
              <span className="font-medium">User Dashboard</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-600/20 hover:text-red-400 transition-all group"
            >
              <LogOut size={20} className="text-gray-400 group-hover:text-red-400" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-[105] bg-gradient-to-r from-gray-900 to-black border-b border-gray-800/50 px-4 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-white">
              Admin <span className="text-primary-500">Panel</span>
            </h1>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg shadow-primary-600/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative">{children}</main>
      </div>
    </div>
  )
}


