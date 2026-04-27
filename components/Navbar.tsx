"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Home as HomeIcon,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { getStoredUser, type StoredUser } from "@/lib/browser-user";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [user, setUser] = useState<StoredUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const syncUser = () => {
      const token = localStorage.getItem("token");
      const storedUser = getStoredUser();

      if (token && storedUser) {
        setUser(storedUser);
      } else {
        setUser(null);
      }
    };

    syncUser();
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setProfileOpen(false);
    window.location.href = "/";
  };

  const navLinks = [
    { name: "Buy", href: "/buy" },
    { name: "Sell", href: "#" },
    { name: "Designers", href: "#" },
    { name: "Builders", href: "#" },
    { name: "Blog", href: "#" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm py-3"
          : "bg-white/50 backdrop-blur-sm py-5"
          }`}
      >
        <div className="container-wide px-6 flex items-center justify-between">

          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => (window.location.href = "/")}
          >
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
              <HomeIcon size={18} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary-dark">
              PROPYOURS
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {/* Actions */}
            <div className="flex items-center gap-4 ml-4">

              {/* Auth Section */}
              {!user ? (
                <a
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                >
                  Login
                </a>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <span className="text-sm font-medium">{user.name}</span>
                      <ChevronDown size={14} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-2"
                      >
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 text-sm hover:bg-gray-50"
                          onClick={() => setProfileOpen(false)}
                        >
                          Dashboard
                        </Link>

                        <Link
                          href="/manage-properties"
                          className="block px-4 py-2 text-sm hover:bg-gray-50"
                          onClick={() => setProfileOpen(false)}
                        >
                          Manage Properties
                        </Link>

                        <Link
                          href="/favorites"
                          className="block px-4 py-2 text-sm hover:bg-gray-50"
                          onClick={() => setProfileOpen(false)}
                        >
                          Favorited Properties
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-500"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* CTA */}
              <a
                href="/post-property"
                className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-md text-sm font-semibold transition-all inline-block"
              >
                List Your Property
              </a>
            </div>
          </div>


          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 lg:hidden"
          >
            <div className="flex flex-col gap-6">

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg font-bold text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {!user ? (
                <a
                  href="/login"
                  className="text-lg font-bold text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </a>
              ) : (
                <>
                  <a
                    href="/dashboard"
                    className="text-lg font-bold text-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </a>

                  <a
                    href="/manage-properties"
                    className="text-lg font-bold text-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Manage Properties
                  </a>

                  <a
                    href="/favorites"
                    className="text-lg font-bold text-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Favorited Properties
                  </a>

                  <button
                    onClick={handleLogout}
                    className="text-lg font-bold text-red-500 text-left"
                  >
                    Logout
                  </button>
                </>
              )}

              <a
                href="/post-property"
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-center block"
                onClick={() => setMobileMenuOpen(false)}
              >
                List Your Property
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
