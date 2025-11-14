'use client';

import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/landing" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">DFN</h1>
              <span className="ml-2 text-sm text-gray-600 hidden sm:block">Digital Fabrication Network</span>
            </Link>
            <div className="flex space-x-4">
              <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                Sign In
              </Link>
              <Link href="/auth/register" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md">
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that works best for you. All plans include access to our full marketplace.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mb-6">Perfect for individuals getting started</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Browse components & services</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Post community requests</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Direct messaging</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Basic profile</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Up to 5 orders/month</span>
                </li>
              </ul>
              <Link href="/auth/register" className="block w-full py-3 px-4 text-center bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200">
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-primary-600 text-white rounded-lg shadow-xl p-8 transform scale-105 relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-3 py-1 text-sm font-semibold rounded-bl-lg rounded-tr-lg">
                Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-primary-100">/month</span>
              </div>
              <p className="text-primary-100 mb-6">For professionals and small teams</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-white mr-2 flex-shrink-0 mt-0.5" />
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-white mr-2 flex-shrink-0 mt-0.5" />
                  <span>Unlimited orders</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-white mr-2 flex-shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-white mr-2 flex-shrink-0 mt-0.5" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-white mr-2 flex-shrink-0 mt-0.5" />
                  <span>Quote management tools</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-white mr-2 flex-shrink-0 mt-0.5" />
                  <span>Portfolio showcase</span>
                </li>
              </ul>
              <Link href="/auth/register" className="flex items-center justify-center w-full py-3 px-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <p className="text-gray-600 mb-6">For large organizations and platforms</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>API access</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>SLA guarantee</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Training & onboarding</span>
                </li>
              </ul>
              <a href="mailto:sales@dfn.com" className="block w-full py-3 px-4 text-center bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Transaction Fees */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Transaction Fees</h2>
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">For Buyers</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span>Component Orders</span>
                    <span className="font-semibold">No fees</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Service Bookings</span>
                    <span className="font-semibold">No fees</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Payment Processing</span>
                    <span className="font-semibold">2.9% + $0.30</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">For Sellers & Providers</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span>Component Sales</span>
                    <span className="font-semibold">5% per transaction</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Service Bookings</span>
                    <span className="font-semibold">7% per booking</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Payment Processing</span>
                    <span className="font-semibold">Included</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, debit cards, and support local payment methods including Paystack, Interswitch, and Kora.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Is there a free trial for Pro plan?</h3>
              <p className="text-gray-600">Yes! New users get a 14-day free trial of the Pro plan with full access to all features.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">What happens to my data if I cancel?</h3>
              <p className="text-gray-600">Your data remains accessible for 30 days after cancellation. You can export all your data at any time from your account settings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">&copy; 2024 Digital Fabrication Network. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
