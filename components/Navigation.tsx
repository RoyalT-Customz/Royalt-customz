'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, User, LogOut, Shield, Settings } from 'lucide-react'
import { getUserDisplayName, getUserDisplayEmail } from '@/lib/user-display'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen && !(event.target as Element).closest('.user-menu-container')) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      // User not logged in
      setUser(null)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/service', label: 'Service' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/blog', label: 'Blog' },
    { href: '/rt-chat', label: 'RT Chat' },
    { href: '/contact', label: 'Contact Us' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  // Check if logo exists, fallback to text
  const logoPath = '/images/logo/logo.png'

  return (
    <nav className="bg-black/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <Image
                src={logoPath}
                alt="RoyalT Customz Logo"
                fill
                className="object-contain"
                onError={(e) => {
                  // Hide image if it doesn't exist, show text fallback
                  e.currentTarget.style.display = 'none'
                }}
                style={{ display: 'none' }}
              />
            </div>
            <span className="text-2xl font-bold text-white">
              RoyalT <span className="text-primary-500">Customz</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-4 py-2 text-sm font-medium transition-colors rounded-lg
                  ${
                    isActive(item.href)
                      ? 'text-primary-500 bg-primary-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <div className="relative ml-4 user-menu-container">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`
                    px-3 py-2 text-sm font-medium transition-all rounded-lg inline-flex items-center gap-3
                    ${
                      isActive('/account')
                        ? 'text-white bg-primary-500/20 border border-primary-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50 border border-transparent'
                    }
                    border backdrop-blur-sm
                  `}
                >
                  <div className="relative">
                    {user.avatar_url ? (
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-primary-500/50 shadow-lg shadow-primary-500/30">
                        {user.avatar_url.startsWith('data:') ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <Image
                            src={user.avatar_url}
                            alt={user.username}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30">
                        <User size={18} className="text-white" />
                      </div>
                    )}
                    {user.role === 'admin' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-bulls-500 rounded-full border-2 border-black flex items-center justify-center">
                        <Shield size={10} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-white">{getUserDisplayName(user)}</span>
                    {user.role === 'admin' && (
                      <div className="relative inline-flex items-center gap-1.5 px-2 py-0.5 bg-gradient-to-r from-bulls-600/40 via-bulls-500/50 to-bulls-600/40 border border-bulls-500/60 rounded-md shadow-md shadow-bulls-500/30">
                        <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-bulls-500 rounded-full opacity-80"></div>
                        <Shield size={12} className="text-white relative z-10" strokeWidth={2.5} />
                        <span className="text-white font-bold text-[10px] tracking-wide">Admin</span>
                        <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-bulls-500 rounded-full opacity-80"></div>
                      </div>
                    )}
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl z-[9999] overflow-hidden">
                    <div className="p-3 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {user.avatar_url ? (
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary-500/50">
                              {user.avatar_url.startsWith('data:') ? (
                                <img
                                  src={user.avatar_url}
                                  alt={user.username}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              ) : (
                                <Image
                                  src={user.avatar_url}
                                  alt={user.username}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              )}
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                              <User size={20} className="text-white" />
                            </div>
                          )}
                          {user.role === 'admin' && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-bulls-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                              <Shield size={10} className="text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{getUserDisplayName(user)}</p>
                          <p className="text-gray-400 text-xs truncate">{getUserDisplayEmail(user)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/account/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-all group"
                      >
                        <div className="w-8 h-8 bg-gray-700/50 group-hover:bg-primary-500/20 rounded-lg flex items-center justify-center transition-colors">
                          <User size={16} className="text-gray-400 group-hover:text-primary-400" />
                        </div>
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/account/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-all group"
                      >
                        <div className="w-8 h-8 bg-gray-700/50 group-hover:bg-primary-500/20 rounded-lg flex items-center justify-center transition-colors">
                          <Settings size={16} className="text-gray-400 group-hover:text-primary-400" />
                        </div>
                        <span>Settings</span>
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-bulls-500/10 hover:text-bulls-400 rounded-lg transition-all group border-t border-gray-700/50 mt-2 pt-2"
                        >
                          <div className="w-8 h-8 bg-bulls-500/20 group-hover:bg-bulls-500/30 rounded-lg flex items-center justify-center transition-colors">
                            <Shield size={16} className="text-bulls-400" strokeWidth={2.5} />
                          </div>
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-bulls-500/10 hover:text-bulls-400 rounded-lg transition-all group border-t border-gray-700/50 mt-2 pt-2"
                      >
                        <div className="w-8 h-8 bg-gray-700/50 group-hover:bg-bulls-500/20 rounded-lg flex items-center justify-center transition-colors">
                          <LogOut size={16} className="text-gray-400 group-hover:text-bulls-400" />
                        </div>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={`
                  ml-4 px-4 py-2 text-sm font-medium transition-colors rounded-lg inline-flex items-center gap-2
                  ${
                    isActive('/login')
                      ? 'text-primary-500 bg-primary-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }
                `}
              >
                <User size={18} />
                Account
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block px-4 py-2 text-sm font-medium transition-colors rounded-lg
                  ${
                    isActive(item.href)
                      ? 'text-primary-500 bg-primary-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <div className="px-4 py-3 bg-gray-800/50 rounded-lg mb-2 border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30">
                        <User size={20} className="text-white" />
                      </div>
                      {user.role === 'admin' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-bulls-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                          <Shield size={10} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{getUserDisplayName(user)}</p>
                      <p className="text-gray-400 text-xs truncate">{getUserDisplayEmail(user)}</p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/account/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg transition-all"
                >
                  <User size={18} />
                  Dashboard
                </Link>
                <Link
                  href="/account/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg transition-all"
                >
                  <Settings size={18} />
                  Settings
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-bulls-400 hover:bg-bulls-500/10 rounded-lg transition-all border-t border-gray-700/50 mt-2 pt-2"
                  >
                    <Shield size={18} strokeWidth={2.5} />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-bulls-500/10 hover:text-bulls-400 rounded-lg transition-all border-t border-gray-700/50 mt-2 pt-2 w-full text-left"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block px-4 py-2 text-sm font-medium transition-colors rounded-lg inline-flex items-center gap-2
                  ${
                    isActive('/login')
                      ? 'text-primary-500 bg-primary-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }
                `}
              >
                <User size={18} />
                Account
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

