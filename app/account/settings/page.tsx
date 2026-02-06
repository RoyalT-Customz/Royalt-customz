'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Save,
  Key,
  Shield,
  Eye,
  EyeOff,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  Lock,
  Settings as SettingsIcon,
} from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'privacy'>('profile')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    avatar_url: '',
  })
  const [privacySettings, setPrivacySettings] = useState({
    hide_email: false,
    hide_phone: false,
    hide_full_name: false,
    privacy_level: 'public',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/account/profile')
      if (response.ok) {
        const data = await response.json()
        const userData = data.user
        setUser(userData)
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          avatar_url: userData.avatar_url || '',
        })
        setPrivacySettings({
          hide_email: userData.hide_email === 1,
          hide_phone: userData.hide_phone === 1,
          hide_full_name: userData.hide_full_name === 1,
          privacy_level: userData.privacy_level || 'public',
        })
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setError('Failed to load user data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('File must be an image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setUploadingAvatar(true)
    setError('')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/account/upload-avatar', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to upload avatar')
        return
      }

      setFormData((prev) => ({ ...prev, avatar_url: data.avatar_url }))
      setSuccess('Avatar uploaded successfully!')
      setTimeout(() => setSuccess(''), 3000)
      
      // Refresh user data
      await fetchUser()
      
      // Trigger a custom event to refresh avatars in other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { avatar_url: data.avatar_url } }))
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setError('An error occurred while uploading avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const fullName = formData.first_name && formData.last_name
        ? `${formData.first_name} ${formData.last_name}`.trim()
        : null

      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          full_name: fullName,
          phone: formData.phone,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update profile')
        return
      }

      setSuccess('Profile updated successfully!')
      
      // Refresh user data
      await fetchUser()
      
      // Trigger avatar update event if avatar was changed
      if (formData.avatar_url && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { avatar_url: formData.avatar_url } }))
      }
      
      setTimeout(() => {
        setSuccess('')
      }, 2000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrivacyUpdate = async () => {
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hide_email: privacySettings.hide_email,
          hide_phone: privacySettings.hide_phone,
          hide_full_name: privacySettings.hide_full_name,
          privacy_level: privacySettings.privacy_level,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update privacy settings')
        return
      }

      setSuccess('Privacy settings updated successfully!')
      setTimeout(() => {
        setSuccess('')
        fetchUser()
      }, 2000)
    } catch (error) {
      console.error('Error updating privacy:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match')
      setIsSubmitting(false)
      return
    }

    if (passwordData.new_password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to change password')
        return
      }

      setSuccess('Password changed successfully!')
      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        })
        setSuccess('')
      }, 2000)
    } catch (error) {
      console.error('Error changing password:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Account Settings</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'profile'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User size={18} className="inline mr-2" />
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'security'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield size={18} className="inline mr-2" />
            Security
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'privacy'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Eye size={18} className="inline mr-2" />
            Privacy
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-bulls-900/20 border border-bulls-800 rounded-lg text-bulls-400 flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-800 rounded-lg text-green-400 flex items-center gap-2">
            <CheckCircle size={20} />
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <User className="w-6 h-6 text-primary-500" />
              Profile Information
            </h2>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Avatar Upload */}
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Profile Picture</label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {formData.avatar_url ? (
                      <img
                        src={formData.avatar_url}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                        <User size={40} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {uploadingAvatar ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Upload Image
                        </>
                      )}
                    </button>
                    <p className="mt-2 text-xs text-gray-500">Max 5MB. JPG, PNG, or GIF</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    disabled
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                <Save size={18} />
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary-500" />
              Security
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all inline-flex items-center gap-2"
                >
                  <Key size={18} />
                  Change Password
                </button>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Forgot Password</h3>
                <p className="text-gray-400 mb-4 text-sm">
                  If you forgot your password, you can request a reset link sent to your email address.
                </p>
                <Link
                  href="/forgot-password"
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all inline-flex items-center gap-2"
                >
                  <Lock size={18} />
                  Reset Password via Email
                </Link>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <p className="text-gray-400 text-sm">2FA is coming soon. Stay tuned for updates!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Eye className="w-6 h-6 text-primary-500" />
              Privacy Settings
            </h2>
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.hide_email}
                    onChange={(e) =>
                      setPrivacySettings({ ...privacySettings, hide_email: e.target.checked })
                    }
                    className="w-5 h-5 text-primary-600 bg-gray-800 border-gray-700 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-white font-medium">Hide Email Address</span>
                    <p className="text-gray-400 text-sm">Your email will not be visible to other users</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.hide_phone}
                    onChange={(e) =>
                      setPrivacySettings({ ...privacySettings, hide_phone: e.target.checked })
                    }
                    className="w-5 h-5 text-primary-600 bg-gray-800 border-gray-700 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-white font-medium">Hide Phone Number</span>
                    <p className="text-gray-400 text-sm">Your phone number will not be visible to other users</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.hide_full_name}
                    onChange={(e) =>
                      setPrivacySettings({ ...privacySettings, hide_full_name: e.target.checked })
                    }
                    className="w-5 h-5 text-primary-600 bg-gray-800 border-gray-700 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-white font-medium">Hide Full Name</span>
                    <p className="text-gray-400 text-sm">Only your username will be displayed across the website</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">Privacy Level</label>
                <select
                  value={privacySettings.privacy_level}
                  onChange={(e) =>
                    setPrivacySettings({ ...privacySettings, privacy_level: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="public">Public - All information visible</option>
                  <option value="friends">Friends - Visible to friends only</option>
                  <option value="private">Private - Hidden from everyone</option>
                </select>
              </div>

              <button
                onClick={handlePrivacyUpdate}
                disabled={isSubmitting}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                <Save size={18} />
                Save Privacy Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Change Password</h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
                  setError('')
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, current_password: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, new_password: e.target.value })
                  }
                  required
                  minLength={8}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirm_password: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {error && (
                <div className="p-3 bg-bulls-900/20 border border-bulls-800 rounded-lg text-bulls-400 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg text-green-400 text-sm">
                  {success}
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
                    setError('')
                  }}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
