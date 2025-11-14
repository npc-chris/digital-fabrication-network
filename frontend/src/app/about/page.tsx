'use client';

import Link from 'next/link';
import { Users, Target, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
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
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">About Digital Fabrication Network</h2>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            We&apos;re on a mission to democratize hardware innovation by connecting makers, workshops, and fabrication professionals worldwide.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To accelerate hardware innovation by creating a seamless platform that connects component suppliers, fabrication services, and product designers in one ecosystem.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Our Community</h3>
              <p className="text-gray-600">
                A diverse network of makers, engineers, workshops, research centers, and fabrication plants working together to bring ideas to life.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Our Impact</h3>
              <p className="text-gray-600">
                Reducing development time, lowering costs, and enabling innovation by providing instant access to components, services, and expertise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Our Story</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Digital Fabrication Network was born out of frustration. Our founders, experienced hardware engineers and product designers, repeatedly faced the same challenges: sourcing reliable components, finding quality fabrication services, and connecting with the right expertise at the right time.
            </p>
            <p className="text-gray-600 mb-6">
              Traditional methods meant endless emails, phone calls, and searching through scattered directories. Projects were delayed, costs escalated, and valuable time was wasted on logistics rather than innovation.
            </p>
            <p className="text-gray-600 mb-6">
              We knew there had to be a better way. That&apos;s why we built DFN—a unified platform where hardware innovators can find everything they need in one place, from the smallest resistor to the most advanced fabrication services.
            </p>
            <p className="text-gray-600">
              Today, DFN serves thousands of users worldwide, enabling faster prototyping, efficient production, and seamless collaboration in the hardware innovation ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Transparency</h3>
              <p className="text-gray-600">
                Clear pricing, honest reviews, and open communication. We believe trust is built on transparency.
              </p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Quality</h3>
              <p className="text-gray-600">
                We vet all sellers and service providers to ensure you get reliable, high-quality products and services.
              </p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-gray-600">
                Constantly improving our platform with new features and capabilities to serve the evolving needs of hardware innovators.
              </p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Community</h3>
              <p className="text-gray-600">
                Fostering collaboration and knowledge-sharing to elevate the entire hardware innovation ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Join Us in Building the Future</h2>
          <p className="text-xl mb-8 text-primary-100">
            Be part of a global community accelerating hardware innovation.
          </p>
          <Link href="/auth/register" className="inline-block px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100">
            Get Started Today
          </Link>
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
