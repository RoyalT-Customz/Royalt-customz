/**
 * Utility functions for displaying user information with privacy settings
 */

export interface UserPrivacy {
  hide_email?: number | boolean
  hide_phone?: number | boolean
  hide_full_name?: number | boolean
  privacy_level?: string
}

export interface UserInfo {
  username: string
  email?: string
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  phone?: string | null
  hide_email?: number | boolean
  hide_phone?: number | boolean
  hide_full_name?: number | boolean
  privacy_level?: string
}

/**
 * Get display name for a user respecting privacy settings
 * Priority: username > first_name + last_name > full_name
 * If hide_full_name is true, only show username
 */
export function getUserDisplayName(user: UserInfo | null | undefined): string {
  if (!user) return 'Unknown User'
  
  const hideFullName = user.hide_full_name === 1 || user.hide_full_name === true
  
  if (hideFullName) {
    return user.username
  }
  
  // Show full name if available, otherwise username
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  }
  
  if (user.full_name) {
    return user.full_name
  }
  
  return user.username
}

/**
 * Get display email for a user respecting privacy settings
 * Returns email if not hidden, otherwise returns masked email or empty string
 */
export function getUserDisplayEmail(user: UserInfo | null | undefined): string {
  if (!user || !user.email) return ''
  
  const hideEmail = user.hide_email === 1 || user.hide_email === true
  
  if (hideEmail) {
    // Mask email: show first letter and domain
    const [localPart, domain] = user.email.split('@')
    if (localPart && domain) {
      return `${localPart[0]}***@${domain}`
    }
    return '***@***'
  }
  
  return user.email
}

/**
 * Get display phone for a user respecting privacy settings
 */
export function getUserDisplayPhone(user: UserInfo | null | undefined): string {
  if (!user || !user.phone) return ''
  
  const hidePhone = user.hide_phone === 1 || user.hide_phone === true
  
  if (hidePhone) {
    // Mask phone: show last 4 digits
    if (user.phone.length > 4) {
      return `***-***-${user.phone.slice(-4)}`
    }
    return '***-***-****'
  }
  
  return user.phone
}

/**
 * Check if user has any privacy restrictions
 */
export function hasPrivacyRestrictions(user: UserInfo | null | undefined): boolean {
  if (!user) return false
  
  return (
    (user.hide_email === 1 || user.hide_email === true) ||
    (user.hide_phone === 1 || user.hide_phone === true) ||
    (user.hide_full_name === 1 || user.hide_full_name === true)
  )
}

