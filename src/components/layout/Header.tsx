"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

const navLinks = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream border-b border-stone-light/30">
      <Container>
        <nav className="flex items-center justify-between h-20">
          {/* Logo / Site Name */}
          <Link
            href="/"
            className="font-serif text-2xl tracking-tight text-charcoal hover:text-accent transition-colors"
          >
            Studio
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-sans tracking-widest uppercase text-charcoal-light hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <span
              className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${
                mobileMenuOpen ? "rotate-45 translate-y-[4px]" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${
                mobileMenuOpen ? "-rotate-45 -translate-y-[4px]" : ""
              }`}
            />
          </button>
        </nav>
      </Container>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-cream ${
          mobileMenuOpen ? "max-h-64 border-t border-stone-light/30" : "max-h-0"
        }`}
      >
        <Container>
          <ul className="flex flex-col py-6 gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-sans tracking-widest uppercase text-charcoal-light hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </header>
  );
}
