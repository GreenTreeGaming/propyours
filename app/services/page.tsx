"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import {
    Building2,
    ShieldCheck,
    Users,
    TrendingUp,
    Search,
    FileText,
    Key,
    Globe,
    ArrowRight,
    CheckCircle2,
    Briefcase,
    Home,
    Scale,
    Gem,
    Handshake
} from "lucide-react";

export default function ServicesPage() {
    const { language, t } = useLanguage();

    const services = [
        {
            category: t("nav.services"),
            tagline: language === "ta" ? "நம்பிக்கையுடன் வாங்கவும், விற்கவும், முதலீடு செய்யவும்" : "Buy, Sell, Invest with Confidence",
            description: language === "ta" ? "PROPYOURS™ இல், 20 ஆண்டுகால சட்ட நிபுணத்துவத்தின் மூலம் சொத்து பரிவர்த்தனைகளை எளிமையாகவும் பாதுகாப்பாகவும் ஆக்குகிறோம்." : "At PROPYOURS™, we make property transactions simple and secure through 20 years of legal expertise.",
            image: "https://images.unsplash.com/photo-1600585154340-be6199f7e009?auto=format&fit=crop&q=80&w=1200",
            items: [
                {
                    title: language === "ta" ? "சொத்து வாங்குதல்" : "Buying Property",
                    desc: language === "ta" ? "உங்கள் முதல் வீடு அல்லது முதலீட்டுச் சொத்தைக் கண்டறிய தனிப்பயனாக்கப்பட்ட உதவி." : "Personalized assistance to find your first home, commercial space, or investment property.",
                    icon: <Home size={24} />
                },
                {
                    title: language === "ta" ? "சொத்து விற்பனை" : "Selling Property",
                    desc: language === "ta" ? "நிபுணத்துவ ஆலோசனையின் மூலம் உங்கள் சொத்தின் மதிப்பினை அதிகரிக்கவும்." : "Maximize value through expert advice to ensure a quick and favorable sale.",
                    icon: <TrendingUp size={24} />
                },
                {
                    title: language === "ta" ? "சந்தை பகுப்பாய்வு" : "Market Analysis",
                    desc: language === "ta" ? "இடங்கள் மற்றும் விலை போக்குகள் குறித்த ஆழமான ஆராய்ச்சி." : "In-depth research on locations, price trends, and growth potential.",
                    icon: <Search size={24} />
                },
                {
                    title: language === "ta" ? "முதலீடு" : "Investing",
                    desc: language === "ta" ? "குடியிருப்பு மற்றும் வணிகத் துறைகளில் லாபகரமான வாய்ப்புகளைக் கண்டறிதல்." : "Identify lucrative opportunities in residential or commercial sectors.",
                    icon: <Briefcase size={24} />
                }
            ]
        },
        {
            category: language === "ta" ? "சட்ட சேவைகள்" : "Legal Services",
            tagline: language === "ta" ? "உங்கள் சொத்து பரிவர்த்தனைகளைப் பாதுகாக்கவும்" : "Secure Your Property Transactions",
            description: language === "ta" ? "சட்ட இணக்கம் எங்கள் டிஎன்ஏவில் உள்ளது. ஒவ்வொரு பரிவர்த்தனையும் துல்லியமாக பதிவு செய்யப்படுவதை நாங்கள் உறுதி செய்கிறோம்." : "Legal compliance is in our DNA. We ensure every transaction is documented and registered with total precision.",
            image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200",
            items: [
                {
                    title: language === "ta" ? "தலைப்பு சரிபார்ப்பு" : "Title Verification",
                    desc: language === "ta" ? "சட்ட ரீதியான பாதுகாப்பை உறுதி செய்ய உரிமையைச் சரிபார்த்தல்." : "Crucial verification of title and ownership to confirm legal soundness.",
                    icon: <ShieldCheck size={24} />
                },
                {
                    title: language === "ta" ? "ஆவண செயலாக்கம்" : "Document Processing",
                    desc: language === "ta" ? "விற்பனை ஒப்பந்தங்கள் முதல் அனைத்து சட்ட ஆவணங்களையும் கையாளுதல்." : "Hassle-free handling of all legal paperwork and sale agreements.",
                    icon: <FileText size={24} />
                },
                {
                    title: language === "ta" ? "சொத்து பதிவு" : "Property Registration",
                    desc: language === "ta" ? "அரசு அதிகாரிகளிடம் அதிகாரப்பூர்வ பதிவு செயல்முறைக்கான வழிகாட்டுதல்." : "End-to-end guidance through the official registration process.",
                    icon: <Scale size={24} />
                },
                {
                    title: language === "ta" ? "நிபுணர் வழிகாட்டுதல்" : "Expert Guidance",
                    desc: language === "ta" ? "மண்டல மற்றும் நில பயன்பாட்டு விதிமுறைகள் குறித்த சட்ட கருத்துக்கள்." : "Insightful legal opinions on zoning laws and land-use regulations.",
                    icon: <Users size={24} />
                }
            ]
        }
    ];

    return (
        <div className="pt-24 min-h-screen bg-white">
            {/* --- Hero Section --- */}
            <section className="relative h-[60vh] flex items-center overflow-hidden bg-zinc-950">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000"
                        alt="Global Services"
                        fill
                        className="object-cover opacity-30 grayscale"
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
                            <span className={`text-primary font-black uppercase tracking-[0.4em] text-xs ${language === "ta" ? "font-tamil" : ""}`}>{t("services.heritage")}</span>
                        </div>
                        <h1 className={`font-black text-white leading-[0.9] mb-8 uppercase ${language === "ta" ? "font-tamil text-5xl lg:text-7xl tracking-normal" : "text-6xl lg:text-8xl tracking-tighter"}`}>
                            {t("services.title1")} <br />
                            <span className="text-zinc-500 text-6xl lg:text-7xl">{t("services.title2")}</span>
                        </h1>
                        <p className={`text-xl text-zinc-400 max-w-2xl leading-relaxed ${language === "ta" ? "font-tamil" : ""}`}>
                            {t("services.desc")}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* --- Services Loop --- */}
            {services.map((section, sidx) => (
                <section key={sidx} className={`py-40 px-6 ${sidx % 2 === 1 ? "bg-zinc-900" : "bg-white"} overflow-hidden`}>
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-7xl mx-auto"
                    >
                        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-24 items-center ${sidx % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                            <div className={sidx % 2 === 1 ? "lg:order-2" : ""}>
                                <span className={`text-primary font-black uppercase tracking-[0.3em] text-sm mb-6 block ${language === "ta" ? "font-tamil" : ""}`}>{section.category}</span>
                                <h2 className={`text-5xl lg:text-7xl font-black tracking-tighter leading-tight mb-8 ${sidx % 2 === 1 ? "text-white" : "text-zinc-900"} ${language === "ta" ? "font-tamil text-4xl lg:text-6xl" : ""}`}>
                                    {section.tagline}
                                </h2>
                                <p className={`text-xl leading-relaxed mb-12 ${sidx % 2 === 1 ? "text-white/60" : "text-zinc-600"} ${language === "ta" ? "font-tamil" : ""}`}>
                                    {section.description}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {section.items.map((item, iidx) => (
                                        <div key={iidx} className="group flex gap-5">
                                            <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${sidx % 2 === 1 ? "bg-white/10 text-primary" : "bg-primary/10 text-primary"}`}>
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h4 className={`font-black text-lg mb-2 ${sidx % 2 === 1 ? "text-white" : "text-zinc-900"} ${language === "ta" ? "font-tamil" : ""}`}>{item.title}</h4>
                                                <p className={`text-sm leading-relaxed ${sidx % 2 === 1 ? "text-white/40" : "text-zinc-500"} ${language === "ta" ? "font-tamil" : ""}`}>{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={`relative ${sidx % 2 === 1 ? "lg:order-1" : ""}`}>
                                <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl">
                                    <Image
                                        src={section.image}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        alt={section.category}
                                    />
                                    <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>
            ))}

            {/* --- NRI Services --- */}
            <section className="py-40 px-6 bg-primary relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <Globe size={600} className="absolute -right-20 -bottom-20 text-white" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="max-w-4xl mx-auto text-center relative z-10 text-white"
                >
                    <div className="w-24 h-24 bg-white/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 backdrop-blur-xl">
                        <Globe size={48} />
                    </div>
                    <span className={`font-black uppercase tracking-[0.4em] text-xs mb-6 block ${language === "ta" ? "font-tamil" : ""}`}>{t("services.nriTitle")}</span>
                    <h2 className={`text-5xl lg:text-7xl font-black tracking-tighter mb-12 ${language === "ta" ? "font-tamil" : ""}`}>{t("services.nriH1")}</h2>
                    <p className={`text-xl lg:text-2xl leading-relaxed font-medium mb-16 text-white/80 ${language === "ta" ? "font-tamil" : ""}`}>
                        {t("services.nriDesc")}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: language === "ta" ? "வாங்குதல்" : "Acquisition", icon: <Building2 /> },
                            { title: language === "ta" ? "மேலாண்மை" : "Management", icon: <Users /> },
                            { title: language === "ta" ? "விற்பனை" : "Sale", icon: <TrendingUp /> }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/10">
                                <div className="mb-4 flex justify-center">{item.icon}</div>
                                <h4 className={`font-black text-sm uppercase tracking-widest ${language === "ta" ? "font-tamil" : ""}`}>{item.title}</h4>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* --- CTA Section --- */}
            <section className="py-40 relative px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className={`text-6xl lg:text-8xl font-black text-zinc-900 tracking-tighter mb-12 ${language === "ta" ? "font-tamil text-5xl lg:text-7xl" : ""}`}>
                        {t("services.ctaH1")} <br />
                        <span className="text-primary text-gradient">{t("services.ctaH2")}</span>
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button className="bg-zinc-900 text-white px-12 py-6 rounded-full font-black tracking-widest text-sm hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-3">
                            <span className={language === "ta" ? "font-tamil" : ""}>{t("services.consult")}</span> <ArrowRight size={20} />
                        </button>
                        <button className="bg-white text-zinc-900 border-2 border-zinc-900 px-12 py-6 rounded-full font-black tracking-widest text-sm hover:bg-zinc-900 hover:text-white transition-all">
                            <span className={language === "ta" ? "font-tamil" : ""}>{t("services.listings")}</span>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
