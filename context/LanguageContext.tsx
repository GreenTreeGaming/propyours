"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ta";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState<Language>("en");

    useEffect(() => {
        const savedLang = localStorage.getItem("preferred-language") as Language;
        if (savedLang) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("preferred-language", lang);
    };

    // Translation helper
    const t = (key: string) => {
        const keys = key.split(".");
        let value: any = translations[language];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Return the key if not found
            }
        }
        return value;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};

const translations: any = {
    en: {
        nav: {
            home: "Home",
            services: "Services",
            about: "About",
            contact: "Contact",
            buying: "Buying",
            renting: "Renting",
            selling: "Selling",
            buy: "Buy",
            rent: "Rent",
            sell: "Sell",
            signIn: "Sign In",
            postProperty: "Post Property"
        },
        hero: {
            subtitle: "Premium Real Estate",
            title1: "LIVING",
            title2: "EXCELLENCE.",
            desc: "Experience the merger of legal precision and luxury living. Founded by legal experts with 20 years of heritage in real estate compliance.",
            cta: "DISCOVER"
        },
        about: {
            heritage: "Our Heritage",
            title1: "LEGAL",
            title2: "PRECISION.",
            desc: "Founded by legal professionals with 20 years of real estate expertise, we bridge the gap between complex legalities and your dream property.",
            storyTitle: "Real Estate Simplified",
            storyH1: "Built on",
            storyH2: "Foundation of Trust.",
            mission: "Our mission is to simplify the property buying and selling process while ensuring complete legal compliance.",
            vision: "The PROPYOURS Vision",
            oneStop: "A One-Stop Destination",
            years: "Years of",
            mastery: "Legal Mastery",
            reraTitle: "Authenticated Firm",
            compliance: "Compliance",
            reraRegistered: "PROPYOURS™ is RERA Registered",
            reraDesc: "The Real Estate (Regulation and Development) Act, 2016 aims to regulate and promote the real estate sector... The main aim of the Act is to protect buyers and help investment in Real Estate Sector.",
            source: "Source",
            advocacy: "RERA Advocacy",
            verify: "Verify Registration",
            commitment: "Our Commitment",
            ethics: "Guided by Ethics.",
            transparency: "Transparency isn't just a word for us—it's the core of every transaction we supervise.",
            partnerTitle: "Future of Growth",
            channelPartner: "Channel Partners",
            partnerDesc: "We invite developers and real estate professionals to partner with us and access an exclusive network of high-intent buyers.",
            stat1: "NETWORK",
            stat2: "MARKETING",
            stat3: "INSIGHTS",
            stat4: "SUCCESS",
            partnerCta: "PARTNER WITH US"
        },
        services: {
            heritage: "Our Expertise",
            title1: "COMPREHENSIVE",
            title2: "SOLUTIONS.",
            desc: "From legal compliance to property management, we provide a full spectrum of services tailored to your real estate aspirations.",
            nriTitle: "Specialized Global Care",
            nriH1: "NRI Services",
            nriDesc: "We understand the unique needs of Non-Resident Indians investing back home. From property acquisition to management and legalities, we ensure a smooth, transparent experience.",
            ctaH1: "READY TO",
            ctaH2: "START?",
            consult: "CONSULT US",
            listings: "VIEW LISTINGS"
        },
        home: {
            heritageTitle: "Our Foundation",
            heritageH1: "Real Estate",
            heritageH2: "Perfectly Simplified.",
            heritageDesc: "We provide more than just listings. We provide peace of mind through 20 years of legal expertise and a dedication to transparency.",
            stats1: "VERIFIED LISTINGS",
            stats2: "BROKERAGE FEES",
            stats3: "GLOBAL REACH",
            featuredTitle: "The Collection",
            featuredH1: "Featured Homes",
            featuredCta: "Discover All",
            solutionsTitle: "Expert Solutions",
            solutionsH1: "Beyond Brokerage.",
            solutionsDesc: "We provide a full-spectrum real estate experience powered by legal integrity.",
            solution1Title: "Legal Verification",
            solution1Desc: "Every project on our portal is legally vetted by experts.",
            solution2Title: "Registration",
            solution2Desc: "End-to-end support for property registrations & legal paperwork.",
            solution3Title: "Development",
            solution3Desc: "Partnerships with top tier developers for exclusive access.",
            solution4Title: "Zero Hassle",
            solution4Desc: "Direct owner contact. No broker calls. No hidden fees.",
            ctaBottomH1: "READY TO",
            ctaBottomH2: "MOVE IN?",
            ctaBottomBtn1: "BROWSE PROPERTIES",
            ctaBottomBtn2: "CONTACT EXPERTS"
        },
        contact: {
            heroTitle: "GET IN TOUCH",
            heroTitle2: "ALWAYS AVAILABLE.",
            heroDesc: "We're here to help you navigate your real estate journey with confidence.",
            visitTitle: "Better yet, see us in person!",
            visitDesc: "We love our clients, so feel free to visit during normal business hours.",
            whatsapp: "Message us on WhatsApp",
            address: "No: 9/1a, Sundaresan Street, Zamin Pallavaram, Chennai-600043, Tamil Nadu, India.",
            hoursTitle: "Business Hours",
            openToday: "Open today",
            findUs: "Find Us",
            email: "Email address",
            phone: "Phone number"
        }
    },
    ta: {
        nav: {
            home: "முகப்பு",
            services: "சேவைகள்",
            about: "எங்களைப் பற்றி",
            contact: "தொடர்பு",
            buying: "வாங்குதல்",
            renting: "வாடகை",
            selling: "விற்பனை",
            buy: "வாங்கு",
            rent: "வாடகை",
            sell: "விற்பனை",
            signIn: "உள்நுழைய",
            postProperty: "விளம்பரம் செய்யவும்"
        },
        hero: {
            subtitle: "பிரீமியம் ரியல் எஸ்டேட்",
            title1: "வாழ்க்கை",
            title2: "சிறப்பு.",
            desc: "சட்ட நுணுக்கம் மற்றும் சொகுசு வாழ்க்கையின் இணைப்பை அனுபவியுங்கள். ரியல் எஸ்டேட் இணக்கத்தில் 20 ஆண்டுகால பாரம்பரியம் கொண்ட சட்ட நிபுணர்களால் நிறுவப்பட்டது.",
            cta: "கண்டறியுங்கள்"
        },
        about: {
            heritage: "எங்கள் பாரம்பரியம்",
            title1: "சட்ட",
            title2: "துல்லியம்.",
            desc: "20 ஆண்டுகால ரியல் எஸ்டேட் நிபுணத்துவம் கொண்ட சட்ட நிபுணர்களால் நிறுவப்பட்டது, சிக்கலான சட்டங்களுக்கும் உங்கள் கனவு சொத்துக்கும் இடையிலான இடைவெளியை நாங்கள் குறைக்கிறோம்.",
            storyTitle: "ரியல் எஸ்டேட் எளிமைப்படுத்தப்பட்டது",
            storyH1: "நம்பிக்கையின்",
            storyH2: "அடிப்படையில் கட்டப்பட்டது.",
            mission: "எங்கள் நோக்கம் சொத்து வாங்கும் மற்றும் விற்கும் செயல்முறையை எளிதாக்குவதாகும் அதே வேளையில் முழுமையான சட்ட இணக்கத்தை உறுதி செய்வதாகும்.",
            vision: "PROPYOURS பார்வை",
            oneStop: "அனைத்து தேவைகளுக்கும் ஒரே இடம்",
            years: "ஆண்டுகள்",
            mastery: "சட்ட மேலாண்மை",
            reraTitle: "அங்கீகரிக்கப்பட்ட நிறுவனம்",
            compliance: "இணக்கம்",
            reraRegistered: "PROPYOURS™ RERA பதிவு செய்யப்பட்டது",
            reraDesc: "ரியல் எஸ்டேட் (ஒழுங்குமுறை மற்றும் மேம்பாடு) சட்டம், 2016... இந்த சட்டத்தின் முக்கிய நோக்கம் வாங்குபவர்களைப் பாதுகாப்பது மற்றும் ரியல் எஸ்டேட் துறையில் முதலீடு செய்ய உதவுவதாகும்.",
            source: "ஆதாரம்",
            advocacy: "RERA வாதம்",
            verify: "பதிவைச் சரிபார்க்கவும்",
            commitment: "எங்கள் அர்ப்பணிப்பு",
            ethics: "அறநெறிகளால் வழிநடத்தப்படுகிறது.",
            transparency: "வெளிப்படைத்தன்மை என்பது வெறும் வார்த்தையல்ல - நாங்கள் மேற்பார்வையிடும் ஒவ்வொரு பரிவர்த்தனையின் மையமாகும்.",
            partnerTitle: "வளர்ச்சியின் எதிர்காலம்",
            channelPartner: "சேனல் பார்ட்னர்கள்",
            partnerDesc: "எங்களுடன் இணைந்து பணியாற்றவும், எங்களின் பிரத்யேக வாங்குபவர்களின் நெட்வொர்க்கைப் பெறவும் டெவலப்பர்கள் மற்றும் நிபுணர்களை அழைக்கிறோம்.",
            stat1: "நெட்வொர்க்",
            stat2: "மார்க்கெட்டிங்",
            stat3: "நுண்ணறிவு",
            stat4: "வெற்றி",
            partnerCta: "எங்களுடன் இணையுங்கள்"
        },
        services: {
            heritage: "எங்கள் நிபுணத்துவம்",
            title1: "முழுமையான",
            title2: "தீர்வுகள்.",
            desc: "சட்ட இணக்கம் முதல் சொத்து மேலாண்மை வரை, உங்கள் ரியல் எஸ்டேட் தேவைகளுக்கு ஏற்ப முழுமையான சேவைகளை நாங்கள் வழங்குகிறோம்.",
            nriTitle: "சிறப்பு உலகளாவிய பராமரிப்பு",
            nriH1: "NRI சேவைகள்",
            nriDesc: "வெளிநாடுகளில் வசிக்கும் இந்தியர்களின் தேவைகளை நாங்கள் புரிந்துகொள்கிறோம். சொத்து வாங்குவது முதல் சட்ட ஆவணங்கள் வரை அனைத்தையும் நாங்கள் பார்த்துக்கொள்கிறோம்.",
            ctaH1: "தொடங்க",
            ctaH2: "தயாரா?",
            consult: "ஆலோசனை பெறவும்",
            listings: "சொத்துகளைப் பார்க்கவும்"
        },
        home: {
            heritageTitle: "எங்கள் அடிப்படை",
            heritageH1: "ரியல் எஸ்டேட்",
            heritageH2: "முழுமையாக எளிமைப்படுத்தப்பட்டது.",
            heritageDesc: "நாங்கள் வெறும் பட்டியல்களை மட்டும் வழங்குவதில்லை. 20 ஆண்டுகால சட்ட நிபுணத்துவம் மற்றும் வெளிப்படைத்தன்மை மூலம் நாங்கள் உங்களுக்கு மன அமைதியை வழங்குகிறோம்.",
            stats1: "சரிபார்க்கப்பட்ட சொத்துக்கள்",
            stats2: "தரகு கட்டணம்",
            stats3: "உலகளாவிய அணுகல்",
            featuredTitle: "தொகுப்பு",
            featuredH1: "சிறப்பு வீடுகள்",
            featuredCta: "அனைத்தையும் கண்டறியுங்கள்",
            solutionsTitle: "நிபுணர் தீர்வுகள்",
            solutionsH1: "தரகர்களுக்கு அப்பால்.",
            solutionsDesc: "சட்டப்பூர்வ ஒருமைப்பாட்டின் மூலம் முழுமையான ரியல் எஸ்டேட் அனுபவத்தை நாங்கள் வழங்குகிறோம்.",
            solution1Title: "சட்ட சரிபார்ப்பு",
            solution1Desc: "எங்கள் போர்ட்டலில் உள்ள ஒவ்வொரு திட்டமும் நிபுணர்களால் சரிபார்க்கப்படுகிறது.",
            solution2Title: "பதிவு",
            solution2Desc: "சொத்து பதிவு மற்றும் சட்ட ஆவணங்களுக்கு முழுமையான ஆதரவு.",
            solution3Title: "மேம்பாடு",
            solution3Desc: "முன்னணி டெவலப்பர்களுடன் பிரத்யேக அணுகலுக்கான கூட்டாண்மை.",
            solution4Title: "சிரமம் இல்லை",
            solution4Desc: "நேரடி உரிமையாளர் தொடர்பு. தரகர் அழைப்புகள் இல்லை. மறைமுக கட்டணம் இல்லை.",
            ctaBottomH1: "குடியேற",
            ctaBottomH2: "தயாரா?",
            ctaBottomBtn1: "சொத்துக்களைத் தேடுங்கள்",
            ctaBottomBtn2: "நிபுணர்களைத் தொடர்பு கொள்ளுங்கள்"
        },
        contact: {
            heroTitle: "தொடர்பு கொள்ள",
            heroTitle2: "எங்களை அணுக",
            heroDesc: "நாங்கள் உங்களுக்கு உதவ எப்போதும் இங்கே இருக்கிறோம்.",
            visitTitle: "நேரில் சந்திக்கலாம்!",
            visitDesc: "எங்கள் வாடிக்கையாளர்களை நாங்கள் விரும்புகிறோம், எனவே வேலை நேரங்களில் எங்களை தாராளமாக சந்திக்கலாம்.",
            whatsapp: "வாட்ஸ்அப்பில் செய்தி அனுப்புங்கள்",
            address: "எண்: 9/1a, சுந்தரேசன் தெரு, ஜமின் பல்லாவரம், சென்னை-600043, தமிழ்நாடு, இந்தியா.",
            hoursTitle: "வேலை நேரம்",
            openToday: "இன்று திறந்திருக்கும்",
            findUs: "எங்களை கண்டறிய",
            email: "மின்னஞ்சல்",
            phone: "தொலைபேசி"
        }
    }
};
