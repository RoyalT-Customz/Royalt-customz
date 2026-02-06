'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Calendar, MessageSquare, Star, ArrowRight } from 'lucide-react'
import { getUserDisplayName, getUserDisplayEmail } from '@/lib/user-display'

export default function OverviewPage() {
  const [user, setUser] = useState<any>(null)

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
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Account Overview</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Username</label>
                <p className="text-white font-semibold">{user?.username || 'N/A'}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Display Name</label>
                <p className="text-white font-semibold">{getUserDisplayName(user) || 'N/A'}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Email</label>
                <p className="text-white font-semibold">{getUserDisplayEmail(user) || 'Hidden'}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Member Since</label>
                <p className="text-white font-semibold">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <Link
              href="/account/settings"
              className="mt-6 inline-flex items-center gap-2 text-primary-500 hover:text-primary-400 font-medium"
            >
              Edit Profile
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/account/orders"
                className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg hover:bg-gray-800 transition-all"
              >
                <Package className="w-5 h-5 text-primary-500" />
                <span className="text-white font-medium">View Orders</span>
              </Link>
              <Link
                href="/account/appointments"
                className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg hover:bg-gray-800 transition-all"
              >
                <Calendar className="w-5 h-5 text-primary-500" />
                <span className="text-white font-medium">Manage Appointments</span>
              </Link>
              <Link
                href="/account/tickets"
                className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg hover:bg-gray-800 transition-all"
              >
                <MessageSquare className="w-5 h-5 text-primary-500" />
                <span className="text-white font-medium">Support Tickets</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


