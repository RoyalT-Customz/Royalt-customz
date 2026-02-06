'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'

export default function ConditionalNavigation() {
  const pathname = usePathname()
  
  // Hide navigation on login, register, admin, account, and rt-chat pages
  if (
    pathname === '/login' || 
    pathname === '/register' || 
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/account') ||
    pathname?.startsWith('/rt-chat')
  ) {
    return null
  }
  
  return <Navigation />
}


