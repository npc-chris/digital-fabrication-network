'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Browse components marketplace',
        'View service providers',
        'Access community board',
        'Basic search functionality',
        'Up to 5 saved items',
      ],
      cta: 'Get Started',
      featured: false,
    },
    {
      name: 'Professional',
      price: '$29',
      period: 'per month',
      description: 'For active makers and designers',
      features: [
        'All Free features',
        'Post unlimited components',
        'Offer services',
        'Advanced search & filters',
        'Unlimited saved items',
        'Priority support',
        'Analytics dashboard',
      ],
      cta: 'Start Free Trial',
      featured: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For organizations and teams',
      features: [
        'All Professional features',
        'Team collaboration tools',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantees',
        'Custom training',
      ],
      cta: 'Contact Sales',
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                DFN
              </Link>
              <span className="ml-2 text-sm text-gray-600 hidden sm:block">
                Digital Fabrication Network
              </span>
            </div>
            <nav className="flex space-x-4">
              <Link
                href="/"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Home
              </Link>
              <Link
                href="/pricing"
                className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                About
              </Link>
              <Link
                href="/auth/login"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include access to our
            vibrant community of makers and innovators.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                plan.featured ? 'ring-2 ring-primary-600 transform scale-105' : ''
              }`}
            >
              {plan.featured && (
                <div className="bg-primary-600 text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-600 ml-2">/ {plan.period}</span>
                  )}
                </div>
                <button
                  className={`w-full py-3 px-6 rounded-md font-semibold ${
                    plan.featured
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be
                reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers for
                Enterprise plans.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial available?
              </h3>
              <p className="text-gray-600">
                Yes, we offer a 14-day free trial for the Professional plan. No credit
                card required.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            © 2024 Digital Fabrication Network. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
