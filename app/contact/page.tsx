"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  MessageCircle,
  ArrowRight,
  ExternalLink
} from "lucide-react";

export default function ContactPage() {
  const { language, t } = useLanguage();

  return (
    <div className="pt-24 min-h-screen bg-white">
      {/* --- Cinematic Page Header --- */}
      <section className="relative h-[60vh] flex items-center overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=1200"
            alt="Contact Us"
            fill
            className="object-cover opacity-40 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/20 z-10" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-[1px] bg-primary"></span>
              <span className={`text-primary font-black uppercase tracking-[0.4em] text-xs ${language === "ta" ? "font-tamil" : ""}`}>{t("nav.contact")}</span>
            </div>
            <h1 className={`font-black text-white leading-[0.9] mb-8 uppercase ${language === "ta" ? "font-tamil text-5xl lg:text-7xl tracking-normal" : "text-6xl lg:text-8xl tracking-tighter"}`}>
              {t("contact.heroTitle")} <br />
              <span className="text-zinc-500 text-6xl lg:text-7xl">{t("contact.heroTitle2")}</span>
            </h1>
            <p className={`text-xl text-zinc-400 max-w-2xl leading-relaxed ${language === "ta" ? "font-tamil" : ""}`}>
              {t("contact.heroDesc")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- Contact Grid --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-start">

          {/* Information Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-16"
          >
            {/* Visit Section */}
            <div className="space-y-6">
              <h2 className={`text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight ${language === "ta" ? "font-tamil" : ""}`}>
                {t("contact.visitTitle")}
              </h2>
              <p className={`text-lg text-zinc-600 leading-relaxed ${language === "ta" ? "font-tamil" : ""}`}>
                {t("contact.visitDesc")}
              </p>

              <a
                href="https://wa.me/917845508558"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 bg-[#25D366] text-white px-8 py-5 rounded-full font-black shadow-xl shadow-[#25D366]/20 hover:scale-105 transition-all group"
              >
                <MessageCircle size={24} />
                <span className={language === "ta" ? "font-tamil" : ""}>{t("contact.whatsapp")}</span>
              </a>
            </div>

            {/* Direct Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className={`text-zinc-400 font-black uppercase tracking-widest text-[10px] mb-1 ${language === "ta" ? "font-tamil" : ""}`}>{t("contact.email")}</h4>
                  <a href="mailto:reach@propyours.com" className="text-zinc-900 font-bold hover:text-primary transition-colors">reach@propyours.com</a>
                </div>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className={`text-zinc-400 font-black uppercase tracking-widest text-[10px] mb-1 ${language === "ta" ? "font-tamil" : ""}`}>{t("contact.phone")}</h4>
                  <a href="tel:+917845508558" className="text-zinc-900 font-bold hover:text-primary transition-colors">+91-7845508558</a>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="p-10 bg-zinc-50 rounded-[3rem] border border-zinc-100 flex items-start gap-6">
              <div className="w-14 h-14 bg-zinc-900 rounded-3xl shrink-0 flex items-center justify-center text-primary shadow-2xl">
                <MapPin size={28} />
              </div>
              <div>
                <h4 className={`text-zinc-400 font-black uppercase tracking-widest text-[10px] mb-2 ${language === "ta" ? "font-tamil" : ""}`}>{t("contact.findUs")}</h4>
                <p className={`text-zinc-900 font-bold text-lg leading-relaxed ${language === "ta" ? "font-tamil" : ""}`}>
                  {t("contact.address")}
                </p>
                <a
                  href="https://maps.google.com/?q=Sundaresan+Street+Zamin+Pallavaram+Chennai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-4 inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest group ${language === "ta" ? "font-tamil" : ""}`}
                >
                  GET DIRECTIONS <ExternalLink size={14} className="group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Column (Hours & Visual) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="bg-zinc-900 rounded-[4rem] p-12 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />

              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary border border-white/10">
                    <Clock size={24} />
                  </div>
                  <h3 className={`text-2xl font-black ${language === "ta" ? "font-tamil" : ""}`}>{t("contact.hoursTitle")}</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                      <span className={`font-bold ${language === "ta" ? "font-tamil" : ""}`}>{t("contact.openToday")}</span>
                    </div>
                    <span className="text-zinc-400 font-medium tracking-widest">09:30 AM — 08:00 PM</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                      <div key={day} className="flex justify-between py-3 px-6 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-xs font-black uppercase tracking-widest opacity-40">{day.slice(0, 3)}</span>
                        <span className="text-[10px] font-bold">9:30 - 8:00</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-3 px-6 bg-zinc-800 rounded-2xl border border-white/5 italic">
                      <span className="text-xs font-black uppercase tracking-widest opacity-20">Sunday</span>
                      <span className="text-[10px] font-bold opacity-30">CLOSED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative aspect-[16/9] rounded-[4rem] overflow-hidden shadow-2xl grayscale group">
              <Image
                src="https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=1200"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-1000"
                alt="Modern Office"
              />
              <div className="absolute inset-0 bg-primary/20 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>

        </div>
      </section>

      {/* --- Minimal Footer Callout --- */}
      <section className="py-24 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className={`text-zinc-400 text-sm font-bold uppercase tracking-widest mb-4 ${language === "ta" ? "font-tamil" : ""}`}>PROPYOURS™</p>
          <p className={`text-zinc-900 font-black text-xs tracking-[0.3em] ${language === "ta" ? "font-tamil" : ""}`}>EST. 2026 • CHENNAI • INDIA</p>
        </div>
      </section>
    </div>
  );
}
