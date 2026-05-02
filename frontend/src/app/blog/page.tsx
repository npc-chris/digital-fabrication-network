"use client";

import LandingNavbar from '@/components/LandingNavbar';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <LandingNavbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold text-slate-900">Blog Feature Retired</h1>
          <p className="text-xl text-slate-600">
            The blog feature has been retired as part of our platform evolution. We're focusing on core features to better serve the digital fabrication community.
          </p>
          <p className="text-slate-500">
            For updates and announcements, please check back to our main platform or subscribe to our newsletter.
          </p>
          <div className="pt-6">
            <Link href="/">
              <Button className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
