'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mail, Twitter, Instagram, Youtube } from 'lucide-react'

export default function Footer() {

  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              RoyalT <span className="text-primary-500">Customz</span>
            </h3>
            <p className="text-gray-400 text-sm">
              Professional custom services and premium products. Your dream is our vision.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/portfolio" className="text-gray-400 hover:text-primary-500 text-sm">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/service" className="text-gray-400 hover:text-primary-500 text-sm">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-gray-400 hover:text-primary-500 text-sm">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-gray-400 hover:text-primary-500 text-sm">
                  Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-primary-500 text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-primary-500 text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-primary-500 text-sm">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>Copyright 2024 RoyalT Customz. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

