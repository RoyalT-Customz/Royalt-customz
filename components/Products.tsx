'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, DollarSign, Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
}

export default function Products() {
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Custom MLO Design',
      description: 'Professional MLO customization service',
      price: 150.00,
      category: 'MLO',
      image: '/images/services/mlo.jpg',
    },
    {
      id: '2',
      name: 'Premium Shell Package',
      description: 'High-quality shell customization',
      price: 200.00,
      category: 'Shell',
      image: '/images/services/shell.jpg',
    },
    {
      id: '3',
      name: 'Custom Chain Design',
      description: 'Unique chain customization',
      price: 175.00,
      category: 'Chain',
      image: '/images/services/chain.jpg',
    },
    {
      id: '4',
      name: 'Tattoo Design Service',
      description: 'Professional tattoo design consultation',
      price: 125.00,
      category: 'Tattoo',
      image: '/images/services/tattoo.jpg',
    },
    {
      id: '5',
      name: 'Face Customization',
      description: 'Advanced face customization service',
      price: 180.00,
      category: 'Face',
      image: '/images/services/face.jpg',
    },
  ])

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [cart, setCart] = useState<Product[]>([])

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))]

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory)

  const handleAddToCart = (product: Product) => {
    setCart((prev) => [...prev, product])
    alert(`${product.name} added to cart!`)
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Non-Escrow Products</h2>
            <p className="text-gray-400">Browse and purchase our custom products</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gray-700/50 rounded-lg px-4 py-2 border border-gray-600">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary-400" />
                <span className="text-white font-medium">{cart.length} items</span>
              </div>
            </div>
            {cart.length > 0 && (
              <div className="bg-primary-600/20 rounded-lg px-4 py-2 border border-primary-500/50">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary-400" />
                  <span className="text-white font-bold">${total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }
              `}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-gray-700/30 rounded-lg border border-gray-600 p-6 hover:border-primary-500/50 transition-all"
            >
              <div className="relative w-full h-48 bg-gray-800/50 rounded-lg mb-4 overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
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
              <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary-400">
                  ${product.price.toFixed(2)}
                </span>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Section */}
        {cart.length > 0 && (
          <div className="mt-8 bg-primary-600/10 rounded-lg p-6 border border-primary-500/30">
            <h3 className="text-xl font-semibold text-white mb-4">Checkout</h3>
            <div className="space-y-2 mb-4">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-gray-300"
                >
                  <span>{item.name}</span>
                  <span className="font-medium">${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <span className="text-xl font-bold text-white">Total</span>
              <span className="text-2xl font-bold text-primary-400">
                ${total.toFixed(2)}
              </span>
            </div>
            <button className="w-full mt-4 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-semibold">
              Proceed to Payment
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

