'use client';

import Link from 'next/link';
import { Users, Target, Lightbulb, Globe } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Users,
      title: 'Community First',
      description:
        'We believe in the power of collaboration and building a supportive community of makers, innovators, and creators.',
    },
    {
      icon: Target,
      title: 'Innovation Focus',
      description:
        'We are committed to accelerating hardware development and enabling breakthrough innovations through our platform.',
    },
    {
      icon: Lightbulb,
      title: 'Open Access',
      description:
        'We strive to democratize access to fabrication resources and expertise, making innovation accessible to everyone.',
    },
    {
      icon: Globe,
      title: 'Global Network',
      description:
        'We connect workshops, suppliers, and designers worldwide to create a truly global digital fabrication ecosystem.',
    },
  ];

  const team = [
    {
      name: 'Team Member 1',
      role: 'Co-Founder & CEO',
      bio: 'Passionate about democratizing access to fabrication technology.',
    },
    {
      name: 'Team Member 2',
      role: 'Co-Founder & CTO',
      bio: 'Building the technical infrastructure for the future of manufacturing.',
    },
    {
      name: 'Team Member 3',
      role: 'Head of Community',
      bio: 'Connecting makers and fostering collaboration across the network.',
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
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md"
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
            About Digital Fabrication Network
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We are building the world&apos;s most comprehensive digital network connecting
            workshops, fabrication plants, research centers, component sellers, and
            product designers to accelerate innovation and bring ideas to life.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-12 mb-16 text-white">
          <h2 className="text-3xl font-bold mb-4 text-center">Our Mission</h2>
          <p className="text-lg text-center max-w-3xl mx-auto opacity-90">
            To democratize access to digital fabrication resources and expertise,
            enabling makers, entrepreneurs, and organizations of all sizes to turn their
            innovative ideas into reality through seamless collaboration and resource
            sharing.
          </p>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-lg p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Our Story
          </h2>
          <div className="prose max-w-3xl mx-auto">
            <p className="text-gray-700 mb-4">
              Digital Fabrication Network was founded with a simple yet ambitious vision:
              to break down the barriers that prevent great ideas from becoming reality.
              We saw talented designers and innovators struggling to find the right
              fabrication resources, and workshops sitting idle while makers searched
              desperately for manufacturing capacity.
            </p>
            <p className="text-gray-700 mb-4">
              We realized that what was missing wasn&apos;t just a marketplace, but a true
              network—a living ecosystem where knowledge, resources, and opportunities
              flow freely. Where a student with a revolutionary design can connect with
              an experienced fabricator, where research institutions can collaborate with
              industry, and where the next generation of hardware innovation can
              flourish.
            </p>
            <p className="text-gray-700">
              Today, we&apos;re proud to serve thousands of makers, designers, and
              organizations worldwide, facilitating connections that drive innovation and
              bring remarkable projects to life. But we&apos;re just getting started—our
              vision is to make digital fabrication accessible to everyone, everywhere.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join Our Community
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you&apos;re a maker, designer, workshop owner, or component supplier,
            there&apos;s a place for you in our network. Join us today and be part of the
            future of digital fabrication.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-semibold"
            >
              Get Started
            </Link>
            <Link
              href="/"
              className="px-8 py-3 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 font-semibold"
            >
              Explore Platform
            </Link>
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
