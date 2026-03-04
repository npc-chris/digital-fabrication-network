import Link from 'next/link';
import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <h5 className="font-bold text-primary-600 text-lg mb-2">DFN</h5>
                        <p className="text-sm text-gray-600">
                            Connecting the digital fabrication ecosystem to accelerate hardware innovation across Africa.
                        </p>
                    </div>
                    <div>
                        <h5 className="font-semibold mb-4">Explore</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/dashboard" className="hover:text-primary-600">Dashboard</Link></li>
                            <li><Link href="/projects" className="hover:text-primary-600">Projects Hub</Link></li>
                            <li><Link href="/forum" className="hover:text-primary-600">Community Forum</Link></li>
                            <li><Link href="/about" className="hover:text-primary-600">About DFN</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-semibold mb-4">Services</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/dashboard?tab=components" className="hover:text-primary-600">Components & Parts</Link></li>
                            <li><Link href="/dashboard?tab=services" className="hover:text-primary-600">Fabrication Services</Link></li>
                            <li><Link href="/group-buying" className="hover:text-primary-600">Group Buying</Link></li>
                            <li><Link href="/affiliates" className="hover:text-primary-600">Partner Store</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-semibold mb-4">Community</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/mentorship" className="hover:text-primary-600">Mentorship</Link></li>
                            <li><Link href="/mentorship/find-mentor" className="hover:text-primary-600">Find a Mentor</Link></li>
                            <li><Link href="/dashboard/provider" className="hover:text-primary-600">Become a Provider</Link></li>
                            <li><Link href="/pricing" className="hover:text-primary-600">Pricing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-semibold mb-4">Account</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/settings" className="hover:text-primary-600">Settings</Link></li>
                            <li><Link href="/cart" className="hover:text-primary-600">My Cart</Link></li>
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
