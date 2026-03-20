'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Search, Store, LayoutDashboard, ShoppingCart } from 'lucide-react';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import UserDropdown from '@/components/UserDropdown';
import { verifySession } from '@/lib/auth';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Check auth state
    useEffect(() => {
        const checkSession = async () => {
            try {
                const result = await verifySession();
                if (result.isAuthenticated && result.user) {
                    setUser(result.user);
                } else {
                    setUser(null);
                }
            } catch (e) {
                console.error('Session check failed', e);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, [pathname]);

    const isActive = (path: string) => {
        if (path === '/dashboard') return pathname === '/dashboard';
        return pathname?.startsWith(path);
    };

    const navLinkClass = (path: string) =>
        `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(path)
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-700 hover:bg-gray-50'
        }`;

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <Logo priority />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-1">
                        <Link href="/dashboard" className={navLinkClass('/dashboard')}>
                            <LayoutDashboard className="w-4 h-4 mr-1.5" />
                            Dashboard
                        </Link>
                        <Link href="/affiliates" className={navLinkClass('/affiliates')}>
                            <Store className="w-4 h-4 mr-1.5" />
                            Store
                        </Link>
                        {/* Role-Based Dashboards */}
                        {user?.role === 'provider' && (
                            <Link 
                                href="/dashboard/provider" 
                                className="hidden md:flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md border border-purple-200 transition-colors"
                            >
                                <LayoutDashboard className="w-4 h-4 mr-1.5" />
                                Provider Dashboard
                            </Link>
                        )}

                        {user?.role === 'admin' && (
                            <Link 
                                href="/admin" 
                                className="hidden md:flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition-colors"
                            >
                                <LayoutDashboard className="w-4 h-4 mr-1.5" />
                                Admin Panel
                            </Link>
                        )}

                        {/* Right side icons */}
                        <div className="flex items-center space-x-3">
                        <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Open search">
                            <Search className="w-5 h-5 text-gray-600" />
                        </button>

                        {user && (
                            <Link href="/cart" className="p-2 rounded-full hover:bg-gray-100 relative" aria-label="Shopping cart">
                                <ShoppingCart className="w-5 h-5 text-gray-600" />
                            </Link>
                        )}

                        <NotificationsDropdown />

                        {loading ? (
                            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                        ) : user ? (
                            <div className="hidden md:block">
                                <UserDropdown user={user} />
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center space-x-2">
                                <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                                    Sign In
                                </Link>
                                <Link href="/auth/register" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md">
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle mobile menu"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                    </nav>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                            Dashboard
                        </Link>
                        <Link href="/affiliates" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                            Partner Store
                        </Link>

                        {user && (
                            <div className="border-t border-gray-100 mt-2 pt-2">
                                <Link href="/cart" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                                    Cart
                                </Link>
                                <Link href="/settings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                                    Settings
                                </Link>
                            </div>
                        )}

                        {!user && (
                            <div className="border-t border-gray-100 mt-2 pt-2">
                                <Link href="/auth/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                                    Sign In
                                </Link>
                                <Link href="/auth/register" className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50" onClick={() => setMobileMenuOpen(false)}>
                                    Sign Up
                                </Link>
                            </div>
                        )}
                        {user && (
                            <div className="border-t border-gray-100 mt-2 pt-2 px-3">
                                <UserDropdown user={user} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
