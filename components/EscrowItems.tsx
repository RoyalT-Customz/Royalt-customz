'use client'

import Image from 'next/image'
import { ExternalLink, Store, Package } from 'lucide-react'

interface EscrowItem {
  id: string
  name: string
  description: string
  price: number
  tebexUrl: string
  image?: string
}

export default function EscrowItems() {
  const escrowItems: EscrowItem[] = [
    {
      id: '1',
      name: 'Premium Custom Package',
      description: 'Complete custom package with escrow protection',
      price: 299.99,
      tebexUrl: 'https://yourstore.tebex.io/package/premium',
      image: '/images/marketplace/premium.jpg',
    },
    {
      id: '2',
      name: 'Deluxe Custom Bundle',
      description: 'All-inclusive custom bundle deal',
      price: 449.99,
      tebexUrl: 'https://yourstore.tebex.io/package/deluxe',
      image: '/images/marketplace/deluxe.jpg',
    },
    {
      id: '3',
      name: 'Ultimate Custom Collection',
      description: 'The complete collection with lifetime support',
      price: 599.99,
      tebexUrl: 'https://yourstore.tebex.io/package/ultimate',
      image: '/images/marketplace/ultimate.jpg',
    },
    {
      id: '4',
      name: 'Starter Custom Pack',
      description: 'Perfect for beginners',
      price: 149.99,
      tebexUrl: 'https://yourstore.tebex.io/package/starter',
      image: '/images/marketplace/starter.jpg',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Store className="w-8 h-8 text-primary-400" />
            <h2 className="text-2xl font-bold text-white">Escrow Items</h2>
          </div>
          <p className="text-gray-400">
            Browse our escrow-protected items available on Tebex. All purchases are secured
            through our official Tebex store.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {escrowItems.map((item) => (
            <div
              key={item.id}
              className="bg-gray-700/30 rounded-lg border border-gray-600 p-6 hover:border-primary-500/50 transition-all flex flex-col"
            >
              <div className="relative w-full h-48 bg-gray-800/50 rounded-lg mb-4 overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-500" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{item.name}</h3>
              <p className="text-gray-400 text-sm mb-4 flex-grow">{item.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-primary-400">
                  ${item.price.toFixed(2)}
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/50">
                  Escrow Protected
                </span>
              </div>
              <a
                href={item.tebexUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <span>View on Tebex</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-primary-600/10 rounded-lg p-6 border border-primary-500/30">
          <div className="flex items-start gap-4">
            <div className="bg-primary-600/20 rounded-full p-3">
              <Store className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">About Escrow Protection</h3>
              <p className="text-gray-300 text-sm">
                All escrow items are sold through our official Tebex store, which provides secure
                payment processing and buyer protection. Your purchase is protected until you
                receive and confirm your order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

