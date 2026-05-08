import Link from 'next/link';
import Logo from '@/components/Logo';
import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <Logo className="mb-2" />
                        <p className="text-sm text-gray-600">
                            Connecting the digital fabrication ecosystem to accelerate hardware innovation across Africa.
                        </p>
                    </div>
                    <div>
                        <h5 className="font-semibold mb-4">Explore</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/" className="hover:text-primary-600">Home</Link></li>
                            <li><Link href="/manifesto" className="hover:text-primary-600">Manifesto</Link></li>
                            <li><Link href="/stakeholders" className="hover:text-primary-600">Stakeholders</Link></li>
                            <li><Link href="/blog" className="hover:text-primary-600">Blog</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-semibold mb-4">Services</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/prototyping" className="hover:text-primary-600">Prototyping</Link></li>
                            <li><Link href="/pricing" className="hover:text-primary-600">Pricing</Link></li>
                            <li><Link href="/auth/register" className="hover:text-primary-600">Join Network</Link></li>
                            <li><Link href="/admin" className="hover:text-primary-600">Admin</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-semibold mb-4">Community</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/blog" className="hover:text-primary-600">Blog</Link></li>
                            <li><Link href="/research" className="hover:text-primary-600">Research</Link></li>
                            <li><Link href="/stakeholders" className="hover:text-primary-600">Ecosystem</Link></li>
                            <li><Link href="/pricing" className="hover:text-primary-600">Pricing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-semibold mb-4">Account</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/onboarding" className="hover:text-primary-600">Onboarding</Link></li>
                            <li><Link href="/admin" className="hover:text-primary-600">Admin</Link></li>
                            <li><Link href="/auth/login" className="hover:text-primary-600">Sign In</Link></li>
                            <li><Link href="/auth/register" className="hover:text-primary-600">Create Account</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
                    © {new Date().getFullYear()} Digital Fabrication Network. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
