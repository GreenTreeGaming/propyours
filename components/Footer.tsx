"use client"

import { useLanguage } from "@/context/LanguageContext";
import { Home as HomeIcon, ArrowRight } from "lucide-react";

export default function Footer() {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-white pt-24 pb-12 border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => window.location.href = "/"}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <HomeIcon size={18} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black tracking-tight text-primary">PROPYOURS</span>
          </div>
          <p className={`text-zinc-500 max-w-xs leading-relaxed ${language === "ta" ? "font-tamil" : ""}`}>
            {language === "ta" ? "வெளிப்படைத்தன்மை மற்றும் பிரீமியம் அனுபவங்களுக்காகக் கட்டப்பட்ட இந்தியாவின் மிகவும் நம்பகமான ரியல் எஸ்டேட் தளம்." : "India's most trusted real estate platform built for transparency and premium experiences."}
          </p>
        </div>
        <div>
          <h5 className={`font-black mb-6 uppercase tracking-widest text-xs text-zinc-400 ${language === "ta" ? "font-tamil" : ""}`}>
            {language === "ta" ? "விரைவு இணைப்புகள்" : "Quick Links"}
          </h5>
          <ul className="flex flex-col gap-4 text-zinc-600 font-medium">
            <li><a href="/" className={`hover:text-primary ${language === "ta" ? "font-tamil" : ""}`}>{t("nav.home")}</a></li>
            <li><a href="#" className={`hover:text-primary ${language === "ta" ? "font-tamil" : ""}`}>{t("nav.buying")}</a></li>
            <li><a href="#" className={`hover:text-primary ${language === "ta" ? "font-tamil" : ""}`}>{t("nav.renting")}</a></li>
            <li><a href="#" className={`hover:text-primary ${language === "ta" ? "font-tamil" : ""}`}>{t("nav.selling")}</a></li>
            <li><a href="/services" className={`hover:text-primary ${language === "ta" ? "font-tamil" : ""}`}>{t("nav.services")}</a></li>
            <li><a href="/about" className={`hover:text-primary ${language === "ta" ? "font-tamil" : ""}`}>{t("nav.about")}</a></li>
            <li><a href="/contact" className={`hover:text-primary ${language === "ta" ? "font-tamil" : ""}`}>{t("nav.contact")}</a></li>
          </ul>
        </div>
        <div>
          <h5 className={`font-black mb-6 uppercase tracking-widest text-xs text-zinc-400 ${language === "ta" ? "font-tamil" : ""}`}>
            {t("nav.services")}
          </h5>
          <ul className="flex flex-col gap-4 text-zinc-600 font-medium">
            <li><a href="#" className={`hover:text-primary ${language === "ta" ? "font-tamil" : ""}`}>{language === "ta" ? "வீட்டுக் கடன்" : "Home Loans"}</a></li>
            <li><a href="#" className={`hover:text-primary ${language === "ta" ? "font-tamil" : ""}`}>{language === "ta" ? "சட்ட சேவைகள்" : "Property Legal"}</a></li>
            <li><a href="#" className={`hover:text-primary ${language === "ta" ? "font-tamil" : ""}`}>{language === "ta" ? "உட்புற வடிவமைப்பு" : "Interior Design"}</a></li>
            <li><a href="#" className={`hover:text-primary ${language === "ta" ? "font-tamil" : ""}`}>{language === "ta" ? "இடமாற்ற சேவைகள்" : "Moving Services"}</a></li>
          </ul>
        </div>
        <div>
          <h5 className={`font-black mb-6 uppercase tracking-widest text-xs text-zinc-400 ${language === "ta" ? "font-tamil" : ""}`}>
            {language === "ta" ? "செய்தி மடல்" : "Newsletter"}
          </h5>
          <p className={`text-zinc-500 mb-6 text-sm ${language === "ta" ? "font-tamil" : ""}`}>
            {language === "ta" ? "புதிய சொத்துக்கள் மற்றும் சந்தை நுண்ணறிவுகளைப் பற்றி தெரிந்து கொள்ளுங்கள்." : "Stay updated with fresh properties and market insights."}
          </p>
          <div className="flex gap-2">
            <input className={`bg-zinc-100 rounded-full px-5 py-3 text-sm focus:outline-none flex-1 font-sans ${language === "ta" ? "font-tamil" : ""}`} placeholder={language === "ta" ? "மின்னஞ்சல் முகவரி" : "Email address"} />
            <button className="bg-primary text-white p-3 rounded-full hover:scale-105 transition-transform">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className={`text-zinc-400 text-sm ${language === "ta" ? "font-tamil" : ""}`}>© 2026 Propyours Real Estate Solutions. {language === "ta" ? "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை." : "All rights reserved."}</p>
        <div className="flex items-center gap-8 text-sm font-bold text-zinc-400">
          <a href="#" className={language === "ta" ? "font-tamil" : ""}>{language === "ta" ? "தனியுரிமை கொள்கை" : "Privacy Policy"}</a>
          <a href="#" className={language === "ta" ? "font-tamil" : ""}>{language === "ta" ? "சேவை விதிமுறைகள்" : "Terms of Service"}</a>
        </div>
      </div>
    </footer>
  );
}
