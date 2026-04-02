"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import {
    ShieldCheck,
    Zap,
    Globe,
    Award,
    Users,
    Heart,
    Handshake,
    Scale,
    Gem,
    CheckCircle2,
    ArrowRight,
    Quote,
    FileText,
    ExternalLink
} from "lucide-react";

export default function AboutPage() {
    const { language, t } = useLanguage();

    return (
        <div className="pt-24 min-h-screen bg-white">
            {/* --- Cinematic Page Header --- */}
            <section className="relative h-[60vh] flex items-center overflow-hidden bg-zinc-950">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
                        alt="Corporate Heritage"
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
                            <span className={`text-primary font-black uppercase tracking-[0.4em] text-xs ${language === "ta" ? "font-tamil" : ""}`}>{t("about.heritage")}</span>
                        </div>
                        <h1 className={`font-black text-white leading-[0.9] mb-8 uppercase ${language === "ta" ? "font-tamil text-5xl lg:text-7xl tracking-normal" : "text-6xl lg:text-8xl tracking-tighter"}`}>
                            {t("about.title1")} <br />
                            <span className="text-zinc-500 text-6xl lg:text-7xl">{t("about.title2")}</span>
                        </h1>
                        <p className={`text-xl text-zinc-400 max-w-2xl leading-relaxed ${language === "ta" ? "font-tamil" : ""}`}>
                            {t("about.desc")}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* --- The Story Section (Asymmetrical & Bespoke) --- */}
            <section className="py-40 px-6 max-w-7xl mx-auto overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center"
                >
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <span className={`text-primary font-black uppercase tracking-[0.3em] text-sm block ${language === "ta" ? "font-tamil" : ""}`}>{t("about.storyTitle")}</span>
                            <h2 className={`text-5xl lg:text-7xl font-black text-zinc-900 tracking-tighter leading-tight ${language === "ta" ? "font-tamil" : ""}`}>
                                {t("about.storyH1")} <br />
                                <span className="text-zinc-400">{t("about.storyH2")}</span>
                            </h2>
                        </div>

                        <div className="relative p-10 bg-zinc-50 rounded-[3rem] border border-zinc-100">
                            <Quote className="absolute -top-6 -left-6 text-primary/20 w-24 h-24 -z-10" />
                            <p className={`text-2xl text-zinc-800 font-bold leading-relaxed mb-6 italic ${language === "ta" ? "font-tamil" : ""}`}>
                                "{t("about.mission")}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-black text-xs">PY</div>
                                <div>
                                    <p className={`font-black text-zinc-900 uppercase tracking-widest text-xs ${language === "ta" ? "font-tamil" : ""}`}>{t("about.vision")}</p>
                                    <p className={`text-zinc-500 text-[10px] font-bold uppercase tracking-wider ${language === "ta" ? "font-tamil" : ""}`}>{t("about.oneStop")}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                    <ShieldCheck size={20} />
                                </div>
                                <p className={`text-zinc-600 text-sm leading-relaxed ${language === "ta" ? "font-tamil" : ""}`}>{language === "ta" ? "20 ஆண்டுகால நிபுணத்துவம் பெற்ற சட்ட வல்லுநர்களின் சரிபார்ப்பு." : "Verification by legal pros with 20 years of expertise."}</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                    <Zap size={20} />
                                </div>
                                <p className={`text-zinc-600 text-sm leading-relaxed ${language === "ta" ? "font-tamil" : ""}`}>{language === "ta" ? "ஆரம்ப கட்டம் முதல் இறுதி பதிவு வரை தடையற்ற செயல்முறை." : "Seamless process from initial site visit to final registration."}</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl">
                            <Image
                                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
                                fill
                                className="object-cover"
                                alt="Architecture"
                            />
                            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
                        </div>
                        {/* Floating Badge */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="absolute -bottom-10 -left-10 bg-zinc-900 text-white p-12 rounded-[3rem] shadow-2xl z-20 border border-white/10"
                        >
                            <h4 className="text-5xl font-black text-primary mb-2">20</h4>
                            <p className={`text-xs font-black uppercase tracking-[0.2em] leading-tight opacity-70 ${language === "ta" ? "font-tamil" : ""}`}>{t("about.years")} <br />{t("about.mastery")}</p>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* --- RERA Compliance Section --- */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-zinc-900 rounded-[4rem] p-12 lg:p-20 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-primary border border-white/10">
                                    <ShieldCheck size={32} />
                                </div>
                                <div>
                                    <span className={`text-primary font-black uppercase tracking-[0.3em] text-[10px] block mb-1 ${language === "ta" ? "font-tamil" : ""}`}>{t("about.reraTitle")}</span>
                                    <h2 className={`text-4xl font-black text-white tracking-tight ${language === "ta" ? "font-tamil" : ""}`}>{t("about.compliance")}</h2>
                                </div>
                            </div>

                            <h3 className={`text-2xl font-black text-white/90 mb-6 flex items-center gap-3 ${language === "ta" ? "font-tamil" : ""}`}>
                                {t("about.reraRegistered")}
                                <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/30">TN/Agent/0227/2024</span>
                            </h3>

                            <p className={`text-white/60 text-lg leading-relaxed mb-8 italic ${language === "ta" ? "font-tamil" : ""}`}>
                                "{t("about.reraDesc")}"
                            </p>

                            <div className={`flex items-center gap-2 text-zinc-500 text-sm font-bold uppercase tracking-widest ${language === "ta" ? "font-tamil" : ""}`}>
                                <span className="w-8 h-[1px] bg-zinc-700"></span>
                                {t("about.source")}: rera.tn.gov.in
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-[3rem] p-10 border border-white/10 backdrop-blur-xl">
                            <FileText className="text-primary mb-6" size={40} />
                            <h4 className={`text-white font-bold text-xl mb-4 ${language === "ta" ? "font-tamil" : ""}`}>{t("about.advocacy")}</h4>
                            <p className={`text-white/40 text-sm leading-relaxed mb-8 ${language === "ta" ? "font-tamil" : ""}`}>
                                {language === "ta" ? "சொத்து பரிவர்த்தனைகளைக் கண்காணிக்கவும், சர்ச்சைகளைத் தீர்க்கவும் நாங்கள் RERA வழிகாட்டுதல்களைப் பின்பற்றுகிறோம்." : "We strictly adhere to RERA guidelines to monitor real estate transactions and adjudicate disputes, ensuring total protection for our clients."}
                            </p>
                            <a href="https://tnrera.gov.in/" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-primary font-black text-xs tracking-widest uppercase group/link ${language === "ta" ? "font-tamil" : ""}`}>
                                {t("about.verify")} <ExternalLink size={14} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                            </a>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* --- Mission & Values --- */}
            <section className="bg-zinc-900 py-40">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-24"
                    >
                        <span className={`text-primary font-black uppercase tracking-[0.3em] text-sm block mb-6 ${language === "ta" ? "font-tamil" : ""}`}>{t("about.commitment")}</span>
                        <h2 className={`text-5xl lg:text-7xl font-black text-white tracking-tighter mb-8 ${language === "ta" ? "font-tamil" : ""}`}>{t("about.ethics")}</h2>
                        <p className={`text-white/40 text-xl leading-relaxed font-medium ${language === "ta" ? "font-tamil" : ""}`}>
                            {t("about.transparency")}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                        {[
                            { title: language === "ta" ? "சட்ட துல்லியம்" : "Legal Accuracy", desc: language === "ta" ? "ஒவ்வொரு ஆவணத்தின் நிபுணர் ஆய்வு." : "Expert scrutiny of every document." },
                            { title: language === "ta" ? "தடையற்ற ஒப்பந்தம்" : "Seamless Deal", desc: language === "ta" ? "முழுமையான சொத்து மேலாண்மை." : "Start to finish property management." },
                            { title: language === "ta" ? "கமிஷன் இல்லை" : "Zero Brokerage", desc: language === "ta" ? "மறைமுகக் கட்டணங்கள் இல்லாத சேவை." : "Honest services without hidden costs." },
                            { title: language === "ta" ? "உங்கள் தேவைக்கேற்ப" : "Tailored Needs", desc: language === "ta" ? "உங்கள் இலக்குகளுக்காகத் தேர்ந்தெடுக்கப்பட்ட சொத்துக்கள்." : "Properties handpicked for your goals." }
                        ].map((item, idx) => (
                            <div key={idx} className="group p-12 bg-white/5 rounded-[3rem] border border-white/10 hover:bg-white/10 transition-all hover:scale-[1.02]">
                                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                                    <CheckCircle2 size={24} />
                                </div>
                                <h4 className={`text-white font-black text-xl mb-4 leading-tight ${language === "ta" ? "font-tamil" : ""}`}>{item.title}</h4>
                                <p className={`text-white/40 text-sm leading-relaxed ${language === "ta" ? "font-tamil" : ""}`}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Channel Partners --- */}
            <section className="py-40 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center bg-zinc-50 rounded-[5rem] p-12 lg:p-24 border border-zinc-100 shadow-sm relative overflow-hidden"
                    >
                        <div className="space-y-10 relative z-10">
                            <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-primary">
                                <Handshake size={36} />
                            </div>
                            <div>
                                <span className={`text-primary font-black uppercase tracking-[0.3em] text-sm block mb-4 ${language === "ta" ? "font-tamil" : ""}`}>{t("about.partnerTitle")}</span>
                                <h3 className={`text-5xl font-black text-zinc-900 tracking-tighter leading-tight ${language === "ta" ? "font-tamil" : ""}`}>{t("about.channelPartner")}</h3>
                            </div>
                            <p className={`text-xl text-zinc-600 leading-relaxed font-medium ${language === "ta" ? "font-tamil" : ""}`}>
                                {t("about.partnerDesc")}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { label: t("about.stat1"), desc: language === "ta" ? "வாங்குபவர்களின் தொகுப்பிற்கான அணுகல்." : "Access to verified buyer pools." },
                                    { label: t("about.stat2"), desc: language === "ta" ? "மூலோபாய டிஜிட்டல் நிலைப்படுத்தல்." : "Strategic digital positioning." },
                                    { label: t("about.stat3"), desc: language === "ta" ? "சந்தை அடிப்படையிலான தரவு பகுப்பாய்வு." : "Market-driven data analytics." },
                                    { label: t("about.stat4"), desc: language === "ta" ? "துரிதப்படுத்தப்பட்ட திட்ட காலக்கெடு." : "Accelerated project timelines." }
                                ].map((stat, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-[2rem] border border-zinc-200/50 shadow-sm">
                                        <h5 className={`text-primary font-black text-[10px] tracking-widest mb-1 ${language === "ta" ? "font-tamil" : ""}`}>{stat.label}</h5>
                                        <p className={`text-zinc-800 font-bold text-sm leading-tight ${language === "ta" ? "font-tamil" : ""}`}>{stat.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <button className="bg-primary text-white p-7 rounded-full font-black text-sm tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-4">
                                <span className={language === "ta" ? "font-tamil" : ""}>{t("about.partnerCta")}</span> <ArrowRight size={20} />
                            </button>
                        </div>

                        <div className="relative h-[600px] w-full rounded-[4rem] overflow-hidden shadow-2xl bg-white p-8">
                            <Image
                                src="/partners.webp"
                                fill
                                className="object-contain"
                                alt="Channel Partners"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}