'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Save,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'
import { getUserDisplayName, getUserDisplayEmail } from '@/lib/user-display'

interface User {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  phone?: string
  avatar_url?: string
  bio?: string
  role: string
  is_active: number
  is_verified: number
  last_login?: string
  created_at: string
  updated_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<{
    username: string
    email: string
    first_name: string
    last_name: string
    phone: string
    role: string
    is_active: boolean
    is_verified: boolean
  }>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'user',
    is_active: true,
    is_verified: false,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        setError('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Error loading users')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        username: user.username,
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        role: user.role,
        is_active: user.is_active === 1,
        is_verified: user.is_verified === 1,
      })
    } else {
      setEditingUser(null)
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'user',
        is_active: true,
        is_verified: false,
      })
    }
    setShowModal(true)
    setError('')
    setSuccess('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'user',
      is_active: true,
      is_verified: false,
    })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    if (!editingUser) {
      setError('Cannot create users from this page. Users must register through the registration page.')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          first_name: formData.first_name.trim() || null,
          last_name: formData.last_name.trim() || null,
          phone: formData.phone.trim() || null,
          role: formData.role,
          is_active: formData.is_active ? 1 : 0,
          is_verified: formData.is_verified ? 1 : 0,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update user')
        return
      }

      setSuccess('User updated successfully!')
      setTimeout(() => {
        handleCloseModal()
        fetchUsers()
      }, 1500)
    } catch (error) {
      console.error('Error updating user:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone and will delete all associated data.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to delete user')
        return
      }

      setSuccess('User deleted successfully!')
      setTimeout(() => {
        fetchUsers()
        setSuccess('')
      }, 1500)
    } catch (error) {
      console.error('Error deleting user:', error)
      setError('An error occurred. Please try again.')
    }
  }

  const handleToggleStatus = async (user: User, field: 'is_active' | 'is_verified') => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...user,
          [field]: user[field] === 1 ? 0 : 1,
        }),
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.is_active === 1) ||
      (filterStatus === 'inactive' && user.is_active === 0) ||
      (filterStatus === 'verified' && user.is_verified === 1) ||
      (filterStatus === 'unverified' && user.is_verified === 0)
    return matchesSearch && matchesRole && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <React.Fragment>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Header */}
        <section className="mb-8 lg:mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                User <span className="text-primary-500">Management</span>
              </h1>
              <p className="text-gray-400 text-base lg:text-lg">Manage users, roles, and permissions</p>
            </div>
            <div className="text-right p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50">
              <p className="text-gray-400 text-sm mb-1 font-medium">Total Users</p>
              <p className="text-3xl lg:text-4xl font-bold text-primary-500">{users.length}</p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-400 flex items-center gap-3 backdrop-blur-sm">
              <AlertCircle size={20} className="flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError('')} className="hover:text-red-300 transition-colors">
                <X size={18} />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-800/50 rounded-xl text-green-400 flex items-center gap-3 backdrop-blur-sm">
              <CheckCircle size={20} className="flex-shrink-0" />
              <span className="flex-1">{success}</span>
              <button onClick={() => setSuccess('')} className="hover:text-green-300 transition-colors">
                <X size={18} />
              </button>
            </div>
          )}
        </section>

        {/* Filters */}
        <section className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users by name, username, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full sm:w-48 pl-12 pr-4 py-3.5 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-48 pl-12 pr-4 py-3.5 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </section>

        {/* Users Table */}
        {filteredUsers.length > 0 ? (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/70 border-b border-gray-700/70 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {filteredUsers.map((user) => {
                    const userAvatar =
                      user.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName(user))}&background=DC2626&color=fff&bold=true`
                    const displayName = getUserDisplayName(user)
                    const displayEmail = getUserDisplayEmail(user)

                    return (
                      <tr key={user.id} className="hover:bg-gray-800/40 transition-all duration-200 border-b border-gray-700/20">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700">
                              <Image
                                src={userAvatar}
                                alt={user.username}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-white font-medium">{displayName}</p>
                              <p className="text-gray-400 text-sm">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Mail size={14} />
                            <span>{displayEmail || 'Hidden'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.role === 'admin' ? (
                            <div className="relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-bulls-600/40 via-bulls-500/50 to-bulls-600/40 border border-bulls-500/60 rounded-lg shadow-md shadow-bulls-500/30">
                              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-bulls-500 rounded-full opacity-80"></div>
                              <Shield size={14} className="text-white relative z-10" strokeWidth={2.5} />
                              <span className="text-white font-bold text-xs tracking-wide">Admin</span>
                              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-bulls-500 rounded-full opacity-80"></div>
                            </div>
                          ) : (
                            <span className="px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg text-xs font-semibold">
                              User
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2.5">
                            <button
                              onClick={() => handleToggleStatus(user, 'is_active')}
                              className={`flex items-center gap-2 text-xs font-medium transition-all px-2 py-1 rounded-md ${
                                user.is_active === 1
                                  ? 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
                                  : 'text-gray-500 hover:text-gray-400 hover:bg-gray-700/50'
                              }`}
                            >
                              {user.is_active === 1 ? (
                                <UserCheck size={16} className="text-green-400" />
                              ) : (
                                <UserX size={16} className="text-gray-500" />
                              )}
                              <span>{user.is_active === 1 ? 'Active' : 'Inactive'}</span>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user, 'is_verified')}
                              className={`flex items-center gap-2 text-xs font-medium transition-all px-2 py-1 rounded-md ${
                                user.is_verified === 1
                                  ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
                                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                              }`}
                            >
                              {user.is_verified === 1 ? (
                                <CheckCircle size={16} className="text-blue-400" />
                              ) : (
                                <XCircle size={16} className="text-gray-400" />
                              )}
                              <span>{user.is_verified === 1 ? 'Verified' : 'Unverified'}</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Calendar size={14} />
                            <span>{new Date(user.created_at).toLocaleDateString()}</span>
                          </div>
                          {user.last_login && (
                            <div className="text-xs text-gray-500 mt-1">
                              Last login: {new Date(user.last_login).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenModal(user)}
                              className="p-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all border border-blue-600/30 hover:border-blue-600/50"
                              title="Edit User"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2.5 bg-bulls-600/20 hover:bg-bulls-600/30 text-bulls-400 rounded-lg transition-all border border-bulls-600/30 hover:border-bulls-600/50"
                              title="Delete User"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-900/50 rounded-xl border border-gray-700/50">
            <UserX className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-2">No users found</p>
            <p className="text-gray-500">
              {searchQuery || filterRole !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'No users have registered yet'}
            </p>
          </div>
        )}

        {/* Results Count */}
        {filteredUsers.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Showing <span className="text-primary-500 font-semibold">{filteredUsers.length}</span>{' '}
              {filteredUsers.length === 1 ? 'user' : 'users'}
            </p>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showModal && editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-950 border-b border-gray-700/50 px-6 py-5 flex items-center justify-between backdrop-blur-sm z-10">
              <h2 className="text-2xl font-bold text-white">Edit User</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[calc(95vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 text-primary-600 border-gray-700 rounded focus:ring-primary-500 bg-gray-800"
                    />
                    <span className="text-gray-300">User is active</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_verified}
                      onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                      className="w-5 h-5 text-primary-600 border-gray-700 rounded focus:ring-primary-500 bg-gray-800"
                    />
                    <span className="text-gray-300">User is verified</span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-6 border-t border-gray-700/50 sticky bottom-0 bg-gradient-to-r from-gray-900 to-gray-950 -mx-6 sm:-mx-8 px-6 sm:px-8 py-4 -mb-6 sm:-mb-8">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-gray-800/80 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 size={20} className="animate-spin" />}
                  <Save size={20} />
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </React.Fragment>
  )
}


