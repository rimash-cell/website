import React, { useState, useEffect } from 'react';

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const links = [
        { href: '/#key-projects', label: 'Work' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: "Connect" }
    ];

    return (
        <div className="md:hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative z-[250] w-10 h-10 flex flex-col justify-center items-end gap-[6px] group"
                aria-label="Toggle menu"
            >
                {/* Custom Hamburger Lines to match elegant design */}
                <span className={`w-8 h-[1px] bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[7px] bg-black' : ''}`} />
                <span className={`w-6 h-[1px] bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                <span className={`w-8 h-[1px] bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[7px] bg-black' : ''}`} />
            </button>

            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-[#f7f5f2] z-[200] transition-all duration-[600ms] ease-[0.16,1,0.3,1] ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                    }`}
            >
                <nav className="h-full flex flex-col justify-center items-center gap-12 p-8">
                    {links.map((link, i) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className={`text-[32px] font-light uppercase tracking-[0.15em] text-black hover:opacity-50 transition-all duration-500 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                }`}
                            style={{
                                transitionDelay: isOpen ? `${100 + (i * 100)}ms` : '0ms',
                                fontFamily: '"Hanken Grotesk", sans-serif'
                            }}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>
            </div>
        </div>
    );
}
