'use client';

import Link from 'next/link';
import { Users, Search, BookOpen, Award } from 'lucide-react';

export default function MentorshipPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mentorship Program
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with experienced makers, learn new skills, and accelerate your projects through personalized guidance.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Link href="/mentorship/find-mentor">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Find a Mentor</h2>
              <p className="text-gray-600 mb-6">
                Browse our community of experts in robotics, IoT, 3D printing, and more. Request guidance for your specific project needs.
              </p>
              <span className="text-blue-600 font-semibold flex items-center">
                Browse Mentors &rarr;
              </span>
            </div>
          </Link>

          <Link href="/mentorship/requests">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">My Mentorships</h2>
              <p className="text-gray-600 mb-6">
                Track your active mentorship requests, schedule sessions, and manage your learning journey.
              </p>
              <span className="text-green-600 font-semibold flex items-center">
                View Dashboard &rarr;
              </span>
            </div>
          </Link>
        </div>

        {/* Become a Mentor Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold mb-4">Become a Mentor</h2>
                <p className="text-blue-100 text-lg mb-8">
                  Share your expertise and help the next generation of makers. Earn community recognition and badges.
                </p>
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Apply to Mentor
                </button>
              </div>
              <div className="hidden md:block">
                <Award className="w-32 h-32 text-white/20" />
              </div>
            </div>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">50+</div>
            <div className="text-gray-600">Expert Mentors</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">200+</div>
            <div className="text-gray-600">Active Mentorships</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">100%</div>
            <div className="text-gray-600">Community Driven</div>
          </div>
        </div>
      </div>
    </div>
  );
}
