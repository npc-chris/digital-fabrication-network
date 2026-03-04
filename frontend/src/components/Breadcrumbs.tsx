'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const Breadcrumbs = () => {
    const pathname = usePathname();

    if (!pathname || pathname === '/') return null;

    const pathSegments = pathname.split('/').filter((segment) => segment !== '');

    const breadcrumbs = pathSegments.map((segment, index) => {
        const href = '/' + pathSegments.slice(0, index + 1).join('/');

        // Format label: dash to space, capitalize first letter
        let label = segment
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .replace(/^\w/, (c) => c.toUpperCase());

        // Special cases
        if (label.toLowerCase() === 'id') label = 'Details';

        // Check if it's likely a hash or ID
        const isId = !isNaN(Number(segment)) || (segment.length > 15 && /[0-9]/.test(segment));
        const displayLabel = isId ? 'Item Review' : label;

        return {
            href,
            label: displayLabel,
            isLast: index === pathSegments.length - 1,
        };
    });

    return (
        <nav className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500 py-4 mb-4 border-b border-zinc-200/50 dark:border-zinc-800/50 overflow-x-auto whitespace-nowrap no-scrollbar">
            <Link
                href="/"
                className="flex items-center hover:text-primary-500 transition-colors shrink-0"
            >
                <Home className="w-3 h-3 mr-1.5" />
                Network_Root
            </Link>

            {breadcrumbs.map((crumb) => (
                <React.Fragment key={crumb.href}>
                    <ChevronRight className="w-3 h-3 opacity-30 shrink-0" />
                    {crumb.isLast ? (
                        <span className="text-zinc-800 dark:text-zinc-100 font-bold px-1">{crumb.label}</span>
                    ) : (
                        <Link
                            href={crumb.href}
                            className="hover:text-primary-500 transition-colors px-1"
                        >
                            {crumb.label}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
