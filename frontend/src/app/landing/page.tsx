'use client';

import Link from 'next/link';
import { Package, Wrench, Users, ArrowRight, CheckCircle, Zap, Shield, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold">DFN</h1>
              <span className="ml-3 text-sm hidden sm:block">Digital Fabrication Network</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/login" className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded-md">
                Sign In
              </Link>
              <Link href="/auth/register" className="px-4 py-2 text-sm font-medium bg-white text-primary-600 hover:bg-gray-100 rounded-md">
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-6">
              Connect. Fabricate. Innovate.
            </h2>
            <p className="text-xl mb-8 text-primary-100 max-w-3xl mx-auto">
              The Digital Fabrication Network connects workshops, fabrication plants, component sellers, and product designers to accelerate hardware innovation.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/auth/register" className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 flex items-center">
                Start Building
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/about" className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">A complete platform for hardware development</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Components Marketplace */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Components Marketplace</h3>
              <p className="text-gray-600 mb-4">
                Browse and purchase components, raw materials, and custom parts from verified sellers worldwide.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Technical specifications & datasheets</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Real-time availability tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Secure payment & order management</span>
                </li>
              </ul>
            </div>

            {/* Fabrication Services */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Fabrication Services</h3>
              <p className="text-gray-600 mb-4">
                Book 3D printing, CNC machining, PCB assembly, and more from trusted service providers.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Request quotes & compare pricing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Calendar-based booking system</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Equipment specs & lead times</span>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Innovation Community</h3>
              <p className="text-gray-600 mb-4">
                Collaborate on projects, post challenges, and connect with makers and engineers.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Post fabrication requests</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Real-time messaging & notifications</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Build your portfolio</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose DFN Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose DFN?</h2>
            <p className="text-xl text-gray-600">Built for makers, by makers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast & Efficient</h3>
              <p className="text-gray-600">
                Streamline your hardware development process with instant quotes, real-time availability, and quick booking.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted & Secure</h3>
              <p className="text-gray-600">
                All sellers and service providers are verified. Secure payments and order tracking built-in.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Network</h3>
              <p className="text-gray-600">
                Connect with workshops, fabrication plants, and makers from around the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of makers, engineers, and fabrication professionals accelerating hardware innovation.
          </p>
          <Link href="/auth/register" className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100">
            Create Your Free Account
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">DFN</h3>
              <p className="text-sm">
                Digital Fabrication Network - Connecting the hardware innovation ecosystem.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Digital Fabrication Network. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
