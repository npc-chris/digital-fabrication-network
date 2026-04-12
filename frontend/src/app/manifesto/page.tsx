'use client';

import Link from 'next/link';
import { Users, Target, Zap, ShieldCheck, Award, Globe, Cpu } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
      </div>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">About Digital Fabrication Network</h2>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            We&apos;re on a mission to democratize hardware innovation by connecting makers, workshops, and fabrication professionals across Africa.
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
              Today, DFN serves a growing community across Africa, enabling faster prototyping, efficient production, and seamless collaboration in the hardware innovation ecosystem.
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
                We vet all providers and service providers to ensure you get reliable, high-quality products and services.
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

      {/* Explore the Platform */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">Explore the Platform</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            DFN brings together everything you need for hardware innovation. Here&apos;s what you can do:
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <Link href="/dashboard" className="bg-white rounded-xl p-8 border border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all group">
              <Cpu className="w-10 h-10 text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold mb-2">Components & Services</h3>
              <p className="text-gray-600 text-sm">Browse, compare, and order fabrication components, parts, and professional services.</p>
            </Link>
            <Link href="/projects" className="bg-white rounded-xl p-8 border border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all group">
              <Award className="w-10 h-10 text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold mb-2">Open Hardware Hub</h3>
              <p className="text-gray-600 text-sm">Discover open-source hardware projects, share your own builds, and collaborate with other makers.</p>
            </Link>
            <Link href="/mentorship" className="bg-white rounded-xl p-8 border border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all group">
              <Users className="w-10 h-10 text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold mb-2">Mentorship Network</h3>
              <p className="text-gray-600 text-sm">Connect with verified fabrication experts for guidance on specific hardware challenges.</p>
            </Link>
            <Link href="/group-buying" className="bg-white rounded-xl p-8 border border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all group">
              <Globe className="w-10 h-10 text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold mb-2">Group Buying</h3>
              <p className="text-gray-600 text-sm">Pool orders with other makers to unlock bulk pricing on premium components and materials.</p>
            </Link>
            <Link href="/forum" className="bg-white rounded-xl p-8 border border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all group">
              <ShieldCheck className="w-10 h-10 text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold mb-2">Community Forum</h3>
              <p className="text-gray-600 text-sm">Ask questions, share knowledge, and collaborate in topic-based discussion channels.</p>
            </Link>
            <Link href="/affiliates" className="bg-white rounded-xl p-8 border border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all group">
              <Target className="w-10 h-10 text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold mb-2">Partner Store</h3>
              <p className="text-gray-600 text-sm">Curated deals on tools, components, and materials from our verified manufacturing partners.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Join Us in Building the Future</h2>
          <p className="text-xl mb-8 text-primary-100">
            Be part of a growing community accelerating hardware innovation across Africa.
          </p>
          <Link href="/auth/register" className="inline-block px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100">
            Get Started Today
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
