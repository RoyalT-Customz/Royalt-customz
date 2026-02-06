'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Calendar, Shield, AlertCircle, CheckCircle } from 'lucide-react'

export default function TermsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_70%)]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div
            className={`text-center transition-all duration-1000 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600/20 rounded-2xl mb-6">
              <FileText className="w-8 h-8 text-primary-500" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              Terms & <span className="text-primary-500">Conditions</span>
            </h1>
            <p className="text-xl text-gray-400 mb-6">
              Please read these terms carefully before using our services
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert prose-lg max-w-none">
            {/* Introduction */}
            <div className="mb-12 p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary-500" />
                1. Introduction
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Welcome to RoyalT Customz ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your access to and use of our website, services, and products. By accessing or using our services, you agree to be bound by these Terms.
              </p>
              <p className="text-gray-300 leading-relaxed">
                If you do not agree to these Terms, please do not use our services. We reserve the right to modify these Terms at any time, and such modifications will be effective immediately upon posting.
              </p>
            </div>

            {/* Services */}
            <div className="mb-12 p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-primary-500" />
                2. Services Description
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                RoyalT Customz provides custom design and modification services including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>MLO (Model, Loadout, Outfit) customization</li>
                <li>Shell design and modification</li>
                <li>Chain and jewelry customization</li>
                <li>Tattoo design services</li>
                <li>Face customization services</li>
                <li>Other custom design services as specified</li>
                <li>1-on-1 appointment-based classes and tutorials</li>
                <li>Digital products and marketplace items</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                All services are provided subject to availability and our acceptance of your order or appointment request.
              </p>
            </div>

            {/* User Accounts */}
            <div className="mb-12 p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-4">3. User Accounts</h2>
              <div className="space-y-4 text-gray-300">
                <p className="leading-relaxed">
                  <strong className="text-white">3.1 Account Creation:</strong> To access certain features, you must create an account. You agree to provide accurate, current, and complete information during registration.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-white">3.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-white">3.3 Account Termination:</strong> We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason we deem necessary.
                </p>
              </div>
            </div>

            {/* Payments and Pricing */}
            <div className="mb-12 p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-4">4. Payments and Pricing</h2>
              <div className="space-y-4 text-gray-300">
                <p className="leading-relaxed">
                  <strong className="text-white">4.1 Pricing:</strong> All prices are displayed in USD unless otherwise stated. We reserve the right to change prices at any time, but changes will not affect orders already placed.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-white">4.2 Payment Methods:</strong> We accept various payment methods as displayed during checkout. All payments must be made in full before services are rendered.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-white">4.3 Escrow Items:</strong> Certain items may be sold through our Tebex store with escrow protection. Please refer to the specific product listing for details.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-white">4.4 Appointment Payments:</strong> Payment for appointments and classes must be completed at the time of booking. Appointments are non-transferable without prior approval.
                </p>
              </div>
            </div>

            {/* Refund Policy */}
            <div className="mb-12 p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-4">5. Refund Policy</h2>
              <div className="space-y-4 text-gray-300">
                <p className="leading-relaxed">
                  <strong className="text-white">5.1 Custom Services:</strong> Due to the custom nature of our services, refunds are generally not available once work has begun. However, we will work with you to resolve any issues or concerns.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-white">5.2 Digital Products:</strong> Digital products are non-refundable unless there is a technical issue preventing access or use.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-white">5.3 Appointments:</strong> Appointment cancellations made at least 48 hours in advance may be eligible for rescheduling. No-shows are not eligible for refunds.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-white">5.4 Disputes:</strong> If you have concerns about a service or product, please contact us within 7 days of delivery to discuss resolution options.
                </p>
              </div>
            </div>

            {/* Intellectual Property */}
            <div className="mb-12 p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-4">6. Intellectual Property</h2>
              <div className="space-y-4 text-gray-300">
                <p className="leading-relaxed">
                  <strong className="text-white">6.1 Our Content:</strong> All content on this website, including designs, logos, text, graphics, and software, is the property of RoyalT Customz and is protected by copyright and trademark laws.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-white">6.2 Custom Work:</strong> Upon full payment, you receive a license to use the custom work created for you. We retain the right to use completed work in our portfolio and for promotional purposes unless otherwise agreed in writing.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-white">6.3 User Content:</strong> By submitting content to us, you grant us a license to use, modify, and display such content as necessary to provide our services.
                </p>
              </div>
            </div>

            {/* User Conduct */}
            <div className="mb-12 p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-primary-500" />
                7. User Conduct
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Use our services for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any viruses, malware, or harmful code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt our services</li>
                <li>Use automated systems to access our services without permission</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </div>

            {/* Limitation of Liability */}
            <div className="mb-12 p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-4">8. Limitation of Liability</h2>
              <div className="space-y-4 text-gray-300">
                <p className="leading-relaxed">
                  <strong className="text-white">8.1 Service Availability:</strong> We strive to provide reliable services but do not guarantee uninterrupted or error-free operation. We are not liable for any downtime or service interruptions.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-white">8.2 Limitation:</strong> To the maximum extent permitted by law, our total liability for any claims arising from our services shall not exceed the amount you paid for the specific service in question.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-white">8.3 Indirect Damages:</strong> We are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
                </p>
              </div>
            </div>

            {/* Privacy */}
            <div className="mb-12 p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-4">9. Privacy</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Your use of our services is also governed by our Privacy Policy. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
              </p>
              <Link
                href="/privacy"
                className="text-primary-500 hover:text-primary-400 font-medium inline-flex items-center gap-2"
              >
                View Privacy Policy
                <span>→</span>
              </Link>
            </div>

            {/* Modifications */}
            <div className="mb-12 p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-4">10. Modifications to Terms</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We reserve the right to modify these Terms at any time. Material changes will be notified through our website or via email. Your continued use of our services after such modifications constitutes acceptance of the updated Terms.
              </p>
              <p className="text-gray-300 leading-relaxed">
                It is your responsibility to review these Terms periodically for any changes.
              </p>
            </div>

            {/* Governing Law */}
            <div className="mb-12 p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-4">11. Governing Law</h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which RoyalT Customz operates, without regard to its conflict of law provisions.
              </p>
            </div>

            {/* Contact */}
            <div className="mb-12 p-8 bg-gradient-to-br from-primary-600/20 to-primary-700/20 rounded-2xl border border-primary-500/50">
              <h2 className="text-3xl font-bold text-white mb-4">12. Contact Information</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="space-y-2 text-gray-300">
                <p>
                  <strong className="text-white">Email:</strong>{' '}
                  <a href="mailto:contact@royaltcustomz.com" className="text-primary-400 hover:text-primary-300">
                    contact@royaltcustomz.com
                  </a>
                </p>
                <p>
                  <strong className="text-white">Support:</strong>{' '}
                  <Link href="/contact" className="text-primary-400 hover:text-primary-300">
                    Contact Us Page
                  </Link>
                </p>
                <p>
                  <strong className="text-white">Tickets:</strong>{' '}
                  <Link href="/service" className="text-primary-400 hover:text-primary-300">
                    Open a Support Ticket
                  </Link>
                </p>
              </div>
            </div>

            {/* Acceptance */}
            <div className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 text-center">
              <p className="text-gray-300 leading-relaxed mb-6">
                By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all"
                >
                  Create Account
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


