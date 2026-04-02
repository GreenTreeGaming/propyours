"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home as HomeIcon, Menu, X, Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled
          ? "bg-white/80 backdrop-blur-lg py-3 border-zinc-200 shadow-sm"
          : "bg-black/40 backdrop-blur-md py-4 border-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 group cursor-pointer flex-shrink-0" onClick={() => window.location.href = "/"}>
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <HomeIcon size={20} strokeWidth={2.5} />
            </div>
            <span className={`text-xl lg:text-2xl font-bold tracking-tight ${scrolled ? 'text-primary' : 'text-white transition-colors duration-500'}`}>
              PROPYOURS
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-[13px] xl:text-[15px] font-medium">
            {[
              { name: t("nav.home"), href: "/" },
              { name: t("nav.buying"), href: "#" },
              { name: t("nav.renting"), href: "#" },
              { name: t("nav.selling"), href: "#" },
              { name: t("nav.services"), href: "/services" },
              { name: t("nav.about"), href: "/about" },
              { name: t("nav.contact"), href: "/contact" }
            ].map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`transition-colors hover:underline decoration-primary/30 underline-offset-8 ${scrolled ? 'text-zinc-600' : 'text-white/90 transition-all duration-500'} hover:text-primary ${language === "ta" ? "font-tamil text-[14px]" : ""}`}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-6">
            {/* Language Toggle */}
            <div className={`flex items-center gap-2 p-1 rounded-full border transition-all duration-300 backdrop-blur-md ${scrolled ? 'bg-zinc-100 border-zinc-200' : 'bg-white/5 border-white/10'}`}>
              <button
                onClick={() => setLanguage("en")}
                className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full text-[10px] font-black transition-all ${language === 'en' ? 'bg-primary text-white shadow-md shadow-primary/20' : scrolled ? 'text-zinc-400 hover:text-zinc-900' : 'text-white/40 hover:text-white'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("ta")}
                className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full text-[10px] font-black font-tamil transition-all ${language === 'ta' ? 'bg-primary text-white shadow-md shadow-primary/20' : scrolled ? 'text-zinc-400 hover:text-zinc-900' : 'text-white/40 hover:text-white'}`}
              >
                தமிழ்
              </button>
            </div>
            <button className="px-6 py-2.5 bg-primary text-white text-[15px] font-bold rounded-full shadow-lg shadow-primary/20 hover:scale-[1.03] transition-all flex items-center gap-2 active:scale-95">
              <Plus size={18} />
              {t("nav.postProperty")}
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">FREE</span>
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled ? 'hover:bg-zinc-100 text-zinc-900' : 'hover:bg-white/10 text-white'}`}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* --- Mobile Menu --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 lg:hidden"
          >
            <div className="flex flex-col gap-6 text-xl font-bold">
              {[
                { name: "Home", href: "/" },
                { name: "Services", href: "/services" },
                { name: "About", href: "/about" },
                { name: "Buying", href: "#" },
                { name: "Renting", href: "#" },
                { name: "Selling", href: "#" },
              ].map((link) => (
                <a key={link.name} href={link.href} className="text-zinc-800 hover:text-primary transition-all">
                  {link.name}
                </a>
              ))}
              <button className="w-full py-4 bg-primary text-white rounded-2xl flex items-center justify-center gap-2">
                <Plus size={20} />
                Post Property
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
