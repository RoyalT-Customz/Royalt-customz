'use client'

import { useEffect, useState } from 'react'
import { Package, Search, Filter } from 'lucide-react'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/account/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">My Orders</h1>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2">
              <Filter size={18} />
              Filter
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Loading orders...</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
              <p className="text-gray-400">Your orders will appear here once you make a purchase.</p>
            </div>
          ) : (
            orders.map((order) => (
            <div
              key={order.id}
              className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-primary-500/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{order.product || `Order #${order.id}`}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Order #{order.id}</span>
                      <span>•</span>
                      <span>{order.date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-400 mb-2">${order.total}</div>
                  <span className="px-3 py-1 bg-primary-600/20 text-primary-400 rounded-full text-xs font-medium">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

