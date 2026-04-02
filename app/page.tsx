"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import {
  Search,
  MapPin,
  Building2,
  Clock,
  Star,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Shield,
  Building,
  Zap,
  Globe,
  Plus,
  Scale,
  Award,
  ChevronRight,
  Maximize2,
  BedDouble,
  Bath
} from "lucide-react";

export default function Home() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("Buy");

  const tabs = ["Buy", "Rent", "Sell", "Commercial", "PG"];

  return (
    <main className="flex-1 bg-white">
      {/* --- Cinematic Hero Section --- */}
      <section className="relative h-[100vh] flex items-center overflow-hidden bg-zinc-950">
        {/* Immersive Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/herohouse.webp"
            alt="Luxury Estate"
            fill
            priority
            className="object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-8 h-8 overflow-hidden">
                <span className="w-12 h-[1px] bg-primary"></span>
                <div className="relative h-full flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={language}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.5, ease: "circOut" }}
                      className={`text-primary font-black uppercase tracking-[0.4em] text-xs whitespace-nowrap ${language === "ta" ? "font-tamil leading-none" : ""
                        }`}
                    >
                      {t("hero.subtitle")}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              <h1 className={`text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 ${language === "ta" ? "font-tamil" : ""}`}>
                {t("hero.title1")} <br />
                <span className="text-zinc-500">{t("hero.title2")}</span>
              </h1>

              <p className={`text-xl text-zinc-300 max-w-xl mb-12 leading-relaxed ${language === "ta" ? "font-tamil" : ""}`}>
                {t("hero.desc")}
              </p>

              {/* Ultra-Modern Search Container */}
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 pr-2 lg:flex items-center shadow-2xl relative group">
                {/* Search Bar - Tab Selection */}
                <div className="hidden lg:flex items-center gap-1 bg-white/10 rounded-full p-1 ml-2">
                  {tabs.slice(0, 3).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === tab
                        ? "bg-primary text-white"
                        : "text-white/60 hover:text-white"
                        } ${language === "ta" ? "font-tamil" : ""}`}
                    >
                      {t(`nav.${tab.toLowerCase()}`)}
                    </button>
                  ))}
                </div>

                <div className="flex-1 flex items-center px-6 gap-4 py-4 lg:py-0">
                  <Search className="text-primary" size={24} />
                  <input
                    type="text"
                    placeholder={language === "ta" ? "இடம் அல்லது திட்டத்தின் மூலம் தேடுங்கள்..." : "Search by locality or project..."}
                    className="bg-transparent border-none text-white focus:outline-none w-full text-lg placeholder:text-zinc-500 font-medium font-sans"
                  />
                </div>

                <button className="w-full lg:w-auto bg-primary text-white h-full px-10 py-5 rounded-[2rem] font-black text-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95">
                  <span className={language === "ta" ? "font-tamil" : ""}>{t("hero.cta")}</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Heritage Section --- */}
      <section className="py-32 px-6 max-w-7xl mx-auto overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center"
        >
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="relative h-64 rounded-3xl overflow-hidden shadow-2xl">
                  <Image src="/house2.webp" fill className="object-cover" alt="Modern House" />
                </div>
                <div className="bg-primary p-8 rounded-3xl text-white shadow-2xl shadow-primary/20">
                  <h4 className="text-4xl font-black mb-2">100%</h4>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-80 ${language === 'ta' ? 'font-tamil' : ''}`}>{t("home.stats1")}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-zinc-900 p-8 rounded-3xl text-white shadow-2xl">
                  <h4 className="text-4xl font-black mb-2 text-primary">0%</h4>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ${language === 'ta' ? 'font-tamil' : ''}`}>{t("home.stats2")}</p>
                </div>
                <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl">
                  <Image src="/house2.webp" fill className="object-cover" alt="Luxury Villa" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-6">
              <span className={`text-primary font-black uppercase tracking-[0.3em] text-sm block ${language === 'ta' ? 'font-tamil' : ''}`}>{t("home.heritageTitle")}</span>
            <h2 className={`font-black text-zinc-900 leading-tight ${language === 'ta' ? 'font-tamil text-4xl lg:text-6xl tracking-normal' : 'text-5xl lg:text-7xl tracking-tighter'}`}>
                {t("home.heritageH1")} <br />
                <span className="text-zinc-400">{t("home.heritageH2")}</span>
              </h2>
            </div>
            <p className={`text-xl text-zinc-600 leading-relaxed font-medium ${language === 'ta' ? 'font-tamil' : ''}`}>
              {t("home.heritageDesc")}
            </p>
            <div className="flex items-center gap-10 pt-4">
              <div>
                <p className="text-4xl font-black text-zinc-900">2M+</p>
                <p className={`text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1 ${language === 'ta' ? 'font-tamil' : ''}`}>{t("home.stats3")}</p>
              </div>
              <div className="w-[1px] h-12 bg-zinc-200"></div>
              <button className="flex items-center gap-3 text-zinc-900 font-black tracking-widest uppercase text-xs hover:gap-5 transition-all group">
                {t("about.heritage")} <ArrowRight size={16} className="text-primary" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- Featured Spotlight --- */}
      <section className="bg-zinc-50 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-between items-end mb-16"
          >
            <div>
              <span className={`text-primary font-black uppercase tracking-[0.3em] text-sm block mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>{t("home.featuredTitle")}</span>
              <h2 className={`text-5xl font-black tracking-tight text-zinc-900 ${language === 'ta' ? 'font-tamil' : ''}`}>{t("home.featuredH1")}</h2>
            </div>
            <button className={`hidden md:flex items-center gap-3 text-zinc-900 font-black tracking-widest uppercase text-xs pb-2 border-b-2 border-primary group hover:gap-6 transition-all ${language === 'ta' ? 'font-tamil' : ''}`}>
              {t("home.featuredCta")} <ArrowRight size={16} />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Featured Item 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
            >
              <div className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl mb-8">
                <Image src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200" fill className="object-cover group-hover:scale-110 transition-transform duration-1000" alt="Penthouse" />
                <div className="absolute top-8 left-8 bg-white px-6 py-3 rounded-2xl font-black text-sm text-black shadow-xl">
                  Rs. 4.2 Cr
                </div>
              </div>
              <div className="flex justify-between items-start px-4">
                <div>
                  <h3 className="text-3xl font-black text-zinc-900 mb-2">The Zen Garden Suites</h3>
                  <div className="flex items-center gap-2 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                    <MapPin size={14} className="text-primary" /> Indiranagar, Bengaluru
                  </div>
                </div>
                <div className="w-14 h-14 bg-zinc-900 rounded-full flex items-center justify-center text-white group-hover:bg-primary transition-colors">
                  <ArrowRight size={24} />
                </div>
              </div>
            </motion.div>

            {/* Featured Item 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
            >
              <div className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl mb-8">
                <Image src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200" fill className="object-cover group-hover:scale-110 transition-transform duration-1000" alt="Villa" />
                <div className="absolute top-8 left-8 bg-white px-6 py-3 rounded-2xl font-black text-sm text-black shadow-xl">
                  Rs. 6.8 Cr
                </div>
              </div>
              <div className="flex justify-between items-start px-4">
                <div>
                  <h3 className="text-3xl font-black text-zinc-900 mb-2">Emerald Estate Villa</h3>
                  <div className="flex items-center gap-2 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                    <MapPin size={14} className="text-primary" /> Sector 44, Bengaluru
                  </div>
                </div>
                <div className="w-14 h-14 bg-zinc-900 rounded-full flex items-center justify-center text-white group-hover:bg-primary transition-colors">
                  <ArrowRight size={24} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Expert Solutions --- */}
      <section className="bg-zinc-950 py-40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <span className={`text-primary font-black uppercase tracking-[0.3em] text-sm block mb-6 ${language === 'ta' ? 'font-tamil' : ''}`}>{t("home.solutionsTitle")}</span>
            <h2 className={`text-5xl lg:text-7xl font-black text-white tracking-tighter mb-8 ${language === 'ta' ? 'font-tamil' : ''}`}>{t("home.solutionsH1")}</h2>
            <p className={`text-white/50 text-xl leading-relaxed ${language === 'ta' ? 'font-tamil' : ''}`}>
              {t("home.solutionsDesc")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Shield size={24} />, title: t("home.solution1Title"), desc: t("home.solution1Desc") },
              { icon: <Scale size={24} />, title: t("home.solution2Title"), desc: t("home.solution2Desc") },
              { icon: <Building2 size={24} />, title: t("home.solution3Title"), desc: t("home.solution3Desc") },
              { icon: <Zap size={24} />, title: t("home.solution4Title"), desc: t("home.solution4Desc") }
            ].map((solution, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="p-10 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl group hover:border-primary/50 transition-all"
              >
                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                  {solution.icon}
                </div>
                <h4 className={`text-white font-black text-xl mb-4 leading-tight ${language === 'ta' ? 'font-tamil' : ''}`}>{solution.title}</h4>
                <p className={`text-white/30 text-sm leading-relaxed ${language === 'ta' ? 'font-tamil' : ''}`}>{solution.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Final Call to Action --- */}
      <section className="py-40 bg-white relative px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className={`text-7xl lg:text-9xl font-black text-zinc-900 tracking-tighter leading-[0.8] mb-12 ${language === 'ta' ? 'font-tamil text-5xl lg:text-7xl' : ''}`}>
              {t("home.ctaBottomH1")} <br />
              <span className="text-primary text-outline">{t("home.ctaBottomH2")}</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className={`bg-zinc-900 text-white px-12 py-6 rounded-full font-black tracking-widest text-sm hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
                {t("home.ctaBottomBtn1")} <ArrowRight size={20} />
              </button>
              <button className={`bg-white text-zinc-900 border-2 border-zinc-900 px-12 py-6 rounded-full font-black tracking-widest text-sm hover:bg-zinc-900 hover:text-white transition-all ${language === 'ta' ? 'font-tamil' : ''}`}>
                {t("home.ctaBottomBtn2")}
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
