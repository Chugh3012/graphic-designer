import Link from "next/link";
import { Container } from "@/components/ui/Container";

const quickLinks = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://dribbble.com", label: "Dribbble" },
  { href: "https://behance.net", label: "Behance" },
  { href: "https://linkedin.com", label: "LinkedIn" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-cream-dark pt-20 pb-10">
      <Container>
        {/* Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 pb-16 border-b border-stone/20">
          {/* Brand / Tagline */}
          <div>
            <Link
              href="/"
              className="font-serif text-2xl tracking-tight text-cream hover:text-accent transition-colors"
            >
              Studio
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-stone-light font-sans max-w-xs">
              Crafting thoughtful brand identities and visual experiences that
              resonate. Based in the creative intersection of strategy and design.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase text-stone mb-6">
              Navigation
            </h4>
            <ul className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-sans text-stone-light hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase text-stone mb-6">
              Connect
            </h4>
            <ul className="flex flex-col gap-3">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-sans text-stone-light hover:text-accent transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-sans text-stone">
            &copy; {currentYear} Studio. All rights reserved.
          </p>
          <p className="text-xs font-sans text-stone">
            Designed with intention.
          </p>
        </div>
      </Container>
    </footer>
  );
}
