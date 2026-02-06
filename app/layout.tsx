import type { Metadata } from 'next'
import './globals.css'
import ConditionalNavigation from '@/components/ConditionalNavigation'
import ConditionalFooter from '@/components/ConditionalFooter'

export const metadata: Metadata = {
  title: 'RoyalT Customz - Professional Custom Services & Products',
  description: 'Premium custom services including MLO, Shell, Chain, Tattoo, Face customization and more. Your dream is our vision.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white">
        <ConditionalNavigation />
        <main>{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  )
}
