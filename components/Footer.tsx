import Link from "next/link";
import Image from "next/image";
import { Home as HomeIcon } from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaXTwitter,
} from "react-icons/fa6";

const footerSections = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      // Add this only after creating /careers.
      // { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Buy Home", href: "/buy" },
      { label: "Sell Property", href: "/sell" },
      { label: "Builders", href: "/builders" },
      // Add this only after creating a real designers page.
      // { label: "Designers", href: "/designers" },
    ],
  },
  {
    title: "Locations",
    links: [
      { label: "Chennai", href: "/buy?city=Chennai" },
      { label: "OMR", href: "/buy?location=OMR" },
      { label: "ECR", href: "/buy?location=ECR" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "Featured", href: "/buy?featured=true" },
      { label: "New Listings", href: "/buy?sort=newest" },
      { label: "Popular", href: "/buy?sort=popular" },
    ],
  },
];

const socialLinks = [
  {
    label: "Facebook",
    href: process.env.NEXT_PUBLIC_FACEBOOK_URL,
    icon: FaFacebook,
  },
  {
    label: "Instagram",
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    icon: FaInstagram,
  },
  {
    label: "X",
    href: process.env.NEXT_PUBLIC_X_URL,
    icon: FaXTwitter,
  },
  {
    label: "LinkedIn",
    href: process.env.NEXT_PUBLIC_LINKEDIN_URL,
    icon: FaLinkedin,
  },
].filter(
    (
        item
    ): item is typeof item & {
      href: string;
    } => Boolean(item.href)
);

export default function Footer() {
  return (
      <footer className="border-t border-gray-100 bg-white pb-10 pt-20">
        <div className="container-wide px-6">
          <div className="mb-16 flex flex-col items-start justify-between gap-12 lg:flex-row">
            <div className="max-w-xs">
              <Link
                  href="/"
                  aria-label="PropYours home"
                  className="mb-6 flex items-center gap-2"
              >
              <span className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
                <HomeIcon size={18} strokeWidth={2.5} />
              </span>

                <span className="text-xl font-bold tracking-tight text-primary-dark">
                PROPYOURS
              </span>
              </Link>

              <p className="text-sm text-gray-500">
                Premium real estate and property services across Tamil Nadu.
              </p>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-8 md:grid-cols-4">
              {footerSections.map((section) => (
                  <nav key={section.title} aria-label={section.title}>
                    <h2 className="mb-4 text-sm font-bold text-gray-900">
                      {section.title}
                    </h2>

                    <ul className="space-y-2 text-sm text-gray-500">
                      {section.links.map((link) => (
                          <li key={link.href}>
                            <Link
                                href={link.href}
                                className="transition-colors hover:text-primary"
                            >
                              {link.label}
                            </Link>
                          </li>
                      ))}
                    </ul>
                  </nav>
              ))}
            </div>

            {socialLinks.length > 0 && (
                <div>
                  <h2 className="mb-4 text-sm font-bold text-gray-900">
                    Connect
                  </h2>

                  <div className="flex items-center gap-4">
                    {socialLinks.map(({ label, href, icon: Icon }) => (
                        <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Visit PropYours on ${label}`}
                            className="text-gray-400 transition-colors hover:text-primary"
                        >
                          <Icon size={20} aria-hidden="true" />
                        </a>
                    ))}
                  </div>
                </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 text-xs text-gray-400 md:flex-row">
            <p>
              © {new Date().getFullYear()} PropYours Real Estate Solutions India
              All rights reserved.
            </p>

            <div className="flex items-center gap-6 font-medium">
              <Link href="/privacy" className="hover:text-gray-600">
                Privacy Policy
              </Link>

              <Link href="/terms" className="hover:text-gray-600">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
  );
}