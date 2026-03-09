import React from 'react';

export default function Logo({ size = 48 }) {
    const id = `g-logo-${size}`;
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke={`url(#${id})`} strokeWidth="2.5" />
            <circle cx="12" cy="24" r="4" fill="#818cf8" />
            <circle cx="24" cy="24" r="5" fill="#a78bfa" />
            <circle cx="36" cy="24" r="4" fill="#c084fc" />
            <line x1="16" y1="24" x2="19" y2="24" stroke="#6366f1" strokeWidth="2" />
            <line x1="29" y1="24" x2="32" y2="24" stroke="#8b5cf6" strokeWidth="2" />
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="48" y2="48">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#c084fc" />
                </linearGradient>
            </defs>
        </svg>
    );
}
