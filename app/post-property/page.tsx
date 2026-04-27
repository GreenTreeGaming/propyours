"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home,
    Building2,
    Map,
    Image as ImageIcon,
    Plus,
    Check,
    ChevronRight,
    Info,
    LayoutGrid,
    MapPin,
    HelpCircle,
    Building,
    Warehouse,
    Key,
    Layers,
    Ship,
    Box,
    Sprout,
    Trees
} from "lucide-react";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";

const STEPS = [
    { id: 1, title: "Property Details", icon: Check },
    { id: 2, title: "Basic Info", icon: Info },
    { id: 3, title: "Pricing", icon: LayoutGrid },
    { id: 4, title: "Photos & Amenities", icon: ImageIcon },
    { id: 5, title: "Finish", icon: Check },
];

const LOCATION_DATA: Record<string, Record<string, string[]>> = {
    "Tamil Nadu": {
        "Chennai": [
            "Adyar", "Anna Nagar", "T. Nagar", "Velachery", "Besant Nagar",
            "Mylapore", "Porur", "Ambattur", "Guindy", "Nungambakkam",
            "Chromepet", "Tambaram", "Pallavaram", "Perambur", "Madipakkam"
        ]
    }
};

const AMENITY_CATEGORIES = [
    {
        name: "Security & Safety",
        amenities: [
            "24x7 Security", "CCTV Surveillance", "Intercom Facility",
            "Fire Alarm System", "Gated Community", "Security Cabin"
        ]
    },
    {
        name: "Infrastructure & Utility",
        amenities: [
            "Power Backup", "Lift", "Water Source (Borewell)", "Water Source (Corporation)",
            "Water Storage", "Rain Water Harvesting", "Sewage Treatment Plant", "Gas Pipeline"
        ]
    },
    {
        name: "Leisure & Lifestyle",
        amenities: [
            "Clubhouse", "Gymnasium", "Swimming Pool", "Kids Play Area",
            "Jogging Track", "Party Hall", "Library", "Indoor Games"
        ]
    },
    {
        name: "Comfort & Convenience",
        amenities: [
            "Covered Parking", "Visitor Parking", "Servant Room",
            "Vastu Compliant", "Internet/Wi-Fi", "Laundry Service"
        ]
    },
    {
        name: "Green & Eco",
        amenities: [
            "Park/Garden", "Waste Disposal", "Organic Waste Converter", "Compound Wall"
        ]
    }
];

export default function PostPropertyPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [form, setForm] = useState({
        purpose: "Sell",
        propertyType: "Independent House",
        description: "",
        address: "",
        locality: "",
        city: "",
        state: "",
        landmark: "",
        uds: "",
        size: "",
        sizeUnit: "sqft",
        dimensions: "",
        ownershipType: "Freehold",
        price: "",
        priceType: "Total",
        negotiable: true,
        bedrooms: "",
        bathrooms: "",
        floors: "",
        amenities: [] as string[],
        images: [] as string[],
    });

    const REQUIRED_FIELDS = [
        {
            key: "state",
            label: "State",
            step: 1,
            validate: (val: any) => !val ? "Required" : null
        },
        {
            key: "city",
            label: "City",
            step: 1,
            validate: (val: any) => !val ? "Required" : null
        },
        {
            key: "locality",
            label: "Locality",
            step: 1,
            validate: (val: any) => !val ? "Required" : null
        },
        {
            key: "address",
            label: "Street Address",
            step: 1,
            validate: (val: any) => !val ? "Required" : null
        },
        {
            key: "size",
            label: "Total Size",
            step: 1,
            validate: (val: any) => {
                if (!val) return "Required";
                if (isNaN(Number(val))) return "Must be a valid number";
                if (Number(val) <= 0) return "Must be greater than 0";
                return null;
            }
        },
        {
            key: "price",
            label: "Asking Price",
            step: 3,
            validate: (val: any) => {
                if (!val) return "Required";
                if (isNaN(Number(val))) return "Must be a valid number";
                if (Number(val) <= 0) return "Must be greater than 0";
                return null;
            }
        },
        {
            key: "bedrooms",
            label: "Bedrooms",
            step: 2,
            validate: (val: any) => val && (isNaN(Number(val)) || Number(val) < 0) ? "Must be a valid count" : null
        },
        {
            key: "bathrooms",
            label: "Bathrooms",
            step: 2,
            validate: (val: any) => val && (isNaN(Number(val)) || Number(val) < 0) ? "Must be a valid count" : null
        },
        {
            key: "floors",
            label: "Total Floors",
            step: 2,
            validate: (val: any) => val && (isNaN(Number(val)) || Number(val) < 0) ? "Must be a valid count" : null
        },
    ];

    const getValidationErrors = () => {
        return REQUIRED_FIELDS
            .map(field => ({
                ...field,
                error: field.validate(form[field.key as keyof typeof form])
            }))
            .filter(field => field.error !== null);
    };

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const savedForm = localStorage.getItem("post-property-form");
        const savedStep = localStorage.getItem("post-property-step");

        if (savedForm) {
            try {
                setForm(prev => ({ ...prev, ...JSON.parse(savedForm) }));
            } catch (e) {
                console.error("Failed to load saved form", e);
            }
        }

        if (savedStep) {
            setCurrentStep(parseInt(savedStep));
        }

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        if (user) {
            localStorage.setItem("post-property-form", JSON.stringify(form));
            localStorage.setItem("post-property-step", currentStep.toString());
        }
    }, [form, currentStep, user]);

    const handleNext = () => {
        if (currentStep < 5) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleStateChange = (state: string) => {
        setForm(prev => ({ ...prev, state, city: "", locality: "" }));
    };

    const handleCityChange = (city: string) => {
        setForm(prev => ({ ...prev, city, locality: "" }));
    };

    const handleLocalityChange = (locality: string) => {
        setForm(prev => ({ ...prev, locality }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const userId = user?.id || user?._id;
        if (!userId) {
            setMessage("Please login to post a property.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/property/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    purpose: form.purpose,
                    propertyType: form.propertyType,
                    description: form.description,
                    address: form.address,
                    locality: form.locality,
                    city: form.city,
                    state: form.state,
                    landmark: form.landmark,
                    uds: Number(form.uds) || undefined,
                    size: Number(form.size),
                    sizeUnit: form.sizeUnit,
                    dimensions: form.dimensions,
                    ownershipType: form.ownershipType,
                    price: Number(form.price),
                    priceType: form.priceType,
                    bedrooms: Number(form.bedrooms) || undefined,
                    bathrooms: Number(form.bathrooms) || undefined,
                    floors: Number(form.floors) || undefined,
                    amenities: form.amenities,
                    userId,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.error || "Something went wrong");
                setLoading(false);
            } else {
                localStorage.removeItem("post-property-form");
                localStorage.removeItem("post-property-step");

                setMessage("Property created successfully! Redirecting...");
                setTimeout(() => {
                    router.push(`/property/${data.property._id}`);
                }, 1500);
            }
        } catch (error) {
            setMessage("Failed to connect to server.");
            setLoading(false);
        }
    };

    const propertyTypes = [
        { name: "Sell", icon: Home, value: "Sell", category: "purpose" },
        { name: "Rent", icon: Key, value: "Rent", category: "purpose" },
        { name: "PG/CO-Living", icon: Building, value: "PG/CO-Living", category: "purpose" },
        { name: "Apartment", icon: Building2, value: "Apartment", category: "type" },
        { name: "Independent House", icon: Home, value: "Independent House", category: "type" },
        { name: "Independent Floor", icon: Layers, value: "Independent Floor", category: "type" },
        { name: "Duplex", icon: LayoutGrid, value: "Duplex", category: "type" },
        { name: "Villa", icon: Warehouse, value: "Villa", category: "type" },
        { name: "Penthouse", icon: Ship, value: "Penthouse", category: "type" },
        { name: "Studio", icon: Box, value: "Studio", category: "type" },
        { name: "Plot", icon: Map, value: "Plot", category: "type" },
        { name: "Farm House", icon: Sprout, value: "Farm House", category: "type" },
        { name: "Agricultural Land", icon: Trees, value: "Agricultural Land", category: "type" },
    ];

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[#F0F4F4] pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Post a Property</h1>
                        <p className="text-gray-500 font-medium">List your property for sale or lease</p>
                    </div>

                    <div className="bg-white rounded-t-3xl border-b border-gray-100 p-8 md:px-12">
                        <div className="relative w-full">
                            {/* Lines Container - dynamically positioned to exactly 10% inward to perfectly match the grid column centers (10%, 30%, 50%, 70%, 90%) */}
                            <div className="absolute top-4 left-[10%] right-[10%] h-0.5 -translate-y-1/2 z-0">
                                <div className="absolute inset-0 bg-gray-200 w-full h-full" />
                                <motion.div
                                    className="absolute top-0 left-0 h-full bg-primary"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                />
                            </div>

                            <div className="grid grid-cols-5 relative z-10 w-full">
                                {STEPS.map((step) => (
                                    <div
                                        key={step.id}
                                        onClick={() => setCurrentStep(step.id)}
                                        className="flex flex-col items-center cursor-pointer group"
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${currentStep >= step.id ? "bg-primary text-white" : "bg-gray-200 text-gray-400 group-hover:bg-gray-300"}`}>
                                            {currentStep > step.id ? <Check size={14} /> : step.id}
                                        </div>
                                        <span className={`mt-2 text-xs font-bold hidden md:block text-center transition-colors ${currentStep >= step.id ? "text-gray-800" : "text-gray-400 group-hover:text-gray-600"}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-b-3xl shadow-xl shadow-gray-200/50 p-6 md:p-10">
                        <form onSubmit={handleSubmit}>
                            <AnimatePresence mode="wait">
                                {currentStep === 1 && (
                                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold text-gray-900">Property Details</h2>
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 rounded-full border border-green-100">
                                                <Check size={12} className="text-green-600" />
                                                <span className="text-xs font-bold text-green-700">Step 1 of 5</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-sm font-bold text-gray-500">What are you looking to do?</label>
                                            <div className="flex gap-4">
                                                {propertyTypes.filter(i => i.category === 'purpose').map((item) => (
                                                    <button key={item.name} type="button" onClick={() => setForm({ ...form, purpose: item.value })} className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all duration-300 ${form.purpose === item.value ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105" : "bg-white text-gray-500 border-gray-100 hover:border-primary/20"}`}>
                                                        <item.icon size={22} />
                                                        <span className="text-base font-bold">{item.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-sm font-bold text-gray-500">Choose Property Type</label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                                {propertyTypes.filter(i => i.category === 'type').map((item) => (
                                                    <button key={item.name} type="button" onClick={() => setForm({ ...form, propertyType: item.value })} className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${form.propertyType === item.value ? "bg-primary/5 text-primary border-primary shadow-sm" : "bg-white text-gray-500 border-gray-50 hover:bg-gray-50 hover:border-gray-200"}`}>
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${form.propertyType === item.value ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}`}>
                                                            <item.icon size={24} />
                                                        </div>
                                                        <span className="text-sm font-bold text-center leading-tight">{item.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm font-bold text-gray-500">Property Description</label>
                                                <span className="text-[10px] font-bold text-gray-400">{form.description.length}/2000</span>
                                            </div>
                                            <textarea rows={4} placeholder="Describe your property in detail to attract more buyers..." className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none resize-none" value={form.description} maxLength={2000} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-500">State <span className="text-red-500">*</span></label>
                                                <select className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer font-bold" value={form.state} onChange={(e) => handleStateChange(e.target.value)}>
                                                    <option value="">Select State</option>
                                                    {Object.keys(LOCATION_DATA).map(state => (<option key={state} value={state}>{state}</option>))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-500">City <span className="text-red-500">*</span></label>
                                                <select className={`w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer font-bold ${!form.state && "opacity-50 cursor-not-allowed"}`} value={form.city} disabled={!form.state} onChange={(e) => handleCityChange(e.target.value)}>
                                                    <option value="">Select City</option>
                                                    {form.state && Object.keys(LOCATION_DATA[form.state] || {}).map(city => (<option key={city} value={city}>{city}</option>))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-500">Locality / Area <span className="text-red-500">*</span></label>
                                                <select className={`w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer font-bold ${!form.city && "opacity-50 cursor-not-allowed"}`} value={form.locality} disabled={!form.city} onChange={(e) => handleLocalityChange(e.target.value)}>
                                                    <option value="">Select Locality</option>
                                                    {form.state && form.city && (LOCATION_DATA[form.state][form.city] || []).map(loc => (<option key={loc} value={loc}>{loc}</option>))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-500">Street Address / House No. <span className="text-red-500">*</span></label>
                                            <input type="text" placeholder="e.g. #123, 2nd Main Road" className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-600">Nearby Landmark <span className="text-gray-400 font-normal">(optional)</span></label>
                                                <input type="text" placeholder="Nearby Landmark" className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all outline-none" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="space-y-2 lg:col-span-2">
                                                <label className="text-sm font-semibold text-gray-600">Total Size <span className="text-red-500">*</span></label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        placeholder="Enter Size"
                                                        className="flex-[3] px-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                                        value={form.size}
                                                        onChange={(e) => setForm({ ...form, size: e.target.value })}
                                                    />
                                                    <select
                                                        className="flex-1 px-4 py-3.5 rounded-xl bg-white border border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-gray-700"
                                                        value={form.sizeUnit}
                                                        onChange={(e) => setForm({ ...form, sizeUnit: e.target.value })}
                                                    >
                                                        <option value="sqft">Sq Ft</option>
                                                        <option value="sqyd">Sq Yd</option>
                                                        <option value="sqm">Sq M</option>
                                                        <option value="acre">Acre</option>
                                                        <option value="kanal">Kanal</option>
                                                        <option value="marla">Marla</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <button type="button" onClick={handleNext} className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98] mt-4">
                                            Next: Basic Info
                                        </button>
                                    </motion.div>
                                )}
                                {currentStep > 1 && currentStep < 5 && (
                                    <motion.div key={`step${currentStep}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold text-gray-900">{STEPS[currentStep - 1].title}</h2>
                                            <div className="px-2 py-0.5 bg-primary/5 rounded-full border border-primary/10"><span className="text-xs font-bold text-primary">Step {currentStep} of 5</span></div>
                                        </div>
                                        {currentStep === 2 && (
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-gray-600">Bedrooms</label>
                                                    <input type="number" placeholder="e.g. 3" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all outline-none" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-gray-600">Bathrooms</label>
                                                    <input type="number" placeholder="e.g. 2" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all outline-none" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-gray-600">Total Floors</label>
                                                    <input type="number" placeholder="e.g. 2" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all outline-none" value={form.floors} onChange={(e) => setForm({ ...form, floors: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-gray-600">UDS <span className="text-gray-400 font-normal">(sq. ft.)</span></label>
                                                    <input type="number" placeholder="Enter UDS" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all outline-none" value={form.uds} onChange={(e) => setForm({ ...form, uds: e.target.value })} />
                                                </div>
                                                <div className="space-y-2 lg:col-span-2">
                                                    <label className="text-sm font-semibold text-gray-600">Dimensions <span className="text-gray-400 font-normal">(e.g. 40 x 60)</span></label>
                                                    <input type="text" placeholder="e.g. 40 x 60" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all outline-none" value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} />
                                                </div>
                                            </div>
                                        )}
                                        {currentStep === 3 && (
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-gray-600">Asking Price (₹) <span className="text-red-500">*</span></label>
                                                    <input type="number" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="e.g. 5000000" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                                                </div>
                                            </div>
                                        )}
                                        {currentStep === 4 && (
                                            <div className="space-y-10">
                                                {/* AMENITIES SECTION */}
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                                            <LayoutGrid size={20} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-black text-gray-900 tracking-tight">Select Amenities</h3>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Help buyers understand the value</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-8">
                                                        {AMENITY_CATEGORIES.map((category) => (
                                                            <div key={category.name} className="space-y-4">
                                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{category.name}</h4>
                                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                                    {category.amenities.map((amenity) => {
                                                                        const isSelected = form.amenities.includes(amenity);
                                                                        return (
                                                                            <button
                                                                                key={amenity}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const next = isSelected
                                                                                        ? form.amenities.filter(a => a !== amenity)
                                                                                        : [...form.amenities, amenity];
                                                                                    setForm({ ...form, amenities: next });
                                                                                }}
                                                                                className={`flex items-center gap-2 p-3 rounded-xl border text-[11px] font-bold text-left transition-all ${isSelected
                                                                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                                                                                    : "bg-white border-gray-100 text-gray-600 hover:border-primary/20 hover:bg-gray-50"
                                                                                    }`}
                                                                            >
                                                                                <div className={`w-4 h-4 rounded flex items-center justify-center ${isSelected ? "bg-white/20" : "bg-gray-100"}`}>
                                                                                    {isSelected && <Check size={10} />}
                                                                                </div>
                                                                                {amenity}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* PHOTOS PLACEHOLDER */}
                                                <div className="space-y-6 pt-6 border-t border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-black text-gray-900 tracking-tight">Property Photos</h3>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add up to 10 images</p>
                                                        </div>
                                                    </div>
                                                    <div className="border-2 border-dashed border-gray-100 rounded-[2.5rem] p-12 text-center bg-gray-50/30 hover:bg-white hover:border-primary/20 transition-all cursor-pointer group">
                                                        <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400 group-hover:text-primary transition-colors">
                                                            <Plus size={32} />
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-600 mb-1">Click to upload or drag and drop</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">JPG, PNG up to 5MB</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex gap-4 pt-4">
                                            <button type="button" onClick={handleBack} className="flex-1 bg-gray-50 border border-gray-200 text-gray-600 py-4 rounded-xl font-bold transition-all">Back</button>
                                            <button type="button" onClick={handleNext} className="flex-[2] bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/10 transition-all">Continue</button>
                                        </div>
                                    </motion.div>
                                )}
                                {currentStep === 5 && (
                                    <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-6">
                                        {getValidationErrors().length > 0 ? (
                                            <>
                                                <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4"><Info size={40} /></div>
                                                <h2 className="text-2xl font-bold text-gray-900">Wait! You're Not Ready</h2>
                                                <p className="text-gray-500 max-w-sm mx-auto">Please fix the following issues before publishing:</p>
                                                <div className="max-w-md mx-auto grid gap-3">
                                                    {getValidationErrors().map((field) => (
                                                        <button key={field.key} type="button" onClick={() => setCurrentStep(field.step)} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-primary/30 hover:bg-white transition-all group text-left">
                                                            <div><p className="font-bold text-gray-700">{field.label}</p><p className="text-xs font-bold text-red-500 mt-0.5 uppercase tracking-tighter">{field.error}</p></div>
                                                            <div className="flex items-center gap-2 text-primary font-bold text-xs whitespace-nowrap">Fix in Step {field.step}<ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /></div>
                                                        </button>
                                                    ))}
                                                </div>
                                                <button type="button" onClick={handleBack} className="w-full bg-gray-50 border border-gray-200 text-gray-600 py-4 rounded-xl font-bold">Back to Review</button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={40} /></div>
                                                <h2 className="text-2xl font-bold text-gray-900">Ready to Publish!</h2>
                                                {message && <p className="text-primary font-bold">{message}</p>}
                                                <div className="flex gap-4">
                                                    <button type="button" onClick={handleBack} className="flex-1 bg-gray-50 border border-gray-200 text-gray-600 py-4 rounded-xl font-bold">Review</button>
                                                    <button type="submit" disabled={loading} className="flex-[2] bg-primary text-white py-4 rounded-xl font-bold shadow-xl shadow-primary/20 disabled:bg-gray-400">{loading ? "Posting..." : "Confirm & Post"}</button>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                    <div className="mt-8 flex flex-col items-center gap-2">
                        <p className="text-xs text-center text-gray-400 font-bold">By posting, you agree to our <span className="text-primary underline cursor-pointer">Terms of Use</span> and <span className="text-primary underline cursor-pointer">Privacy Policy</span> <HelpCircle size={14} className="inline ml-1" /></p>
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}