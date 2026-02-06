'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  
  // Hide footer on login, register, and rt-chat pages
  if (pathname === '/login' || pathname === '/register' || pathname?.startsWith('/rt-chat')) {
    return null
  }
  
  return <Footer />
}


