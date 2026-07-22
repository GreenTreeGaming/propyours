"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  Eye,
  PhoneCall,
  Scale,
  Home,
  Landmark,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Trees,
} from "lucide-react";
import {
  TAMIL_NADU_CITIES,
  TAMIL_NADU_LOCATIONS,
} from "@/lib/locations";
import PriceNegotiabilityBadge from "@/components/PriceNegotiabilityBadge";

interface Property {
  _id: string;
  propertyType: string;
  address: string;
  city: string;
  locality?: string;
  price: number;
  bedrooms: number;
  images?: string[];
  promotedUntil?: string;
  negotiable?: boolean;
  planSnapshot?: {
    homepageFeatured?: boolean;
    badgeLevel?: "premium" | "verified" | string;
    rankingLevel?: "priority" | "top" | string;
  };
}

type SearchMode = "Buy" | "Rent" | "Commercial";

type PropertySearchParams = {
  city?: string;
  location?: string;
  type?: string;
  maxPrice?: string;
  minPrice?: string;
  bhk?: string;
  purpose?: string;
  sort?: string;
  filter?: string;
};

const PROPERTY_TYPES = [
  "All Property Types",
  "Apartment",
  "Independent House",
  "Independent Floor",
  "Villa",
  "Duplex",
  "Penthouse",
  "Plot",
  "Agricultural Land",
  "Farm House",
];

const BUDGETS = [
  { label: "Any Budget", value: "" },
  { label: "Under ₹25 Lakh", value: "2500000" },
  { label: "Under ₹50 Lakh", value: "5000000" },
  { label: "Under ₹1 Crore", value: "10000000" },
  { label: "Under ₹2 Crore", value: "20000000" },
  { label: "Under ₹5 Crore", value: "50000000" },
];

const POPULAR_SEARCHES: Array<{
  label: string;
  params: PropertySearchParams;
}> = [
  {
    label: "Apartments in Chennai",
    params: {
      city: "Chennai",
      type: "Apartment",
    },
  },
  {
    label: "Plots in Coimbatore",
    params: {
      city: "Coimbatore",
      type: "Plot",
    },
  },
  {
    label: "Villas under ₹1 Cr",
    params: {
      type: "Villa",
      maxPrice: "10000000",
    },
  },
  {
    label: "Agricultural land",
    params: {
      type: "Agricultural Land",
    },
  },
];

function formatPrice(price: number): string {
  if (price >= 10_000_000) {
    return `₹${(price / 10_000_000).toFixed(price % 10_000_000 === 0 ? 0 : 2)} Cr`;
  }

  if (price >= 100_000) {
    return `₹${(price / 100_000).toFixed(price % 100_000 === 0 ? 0 : 1)} L`;
  }

  return `₹${price.toLocaleString("en-IN")}`;
}

function getPropertyBadge(property: Property): string | null {
  if (
      property.promotedUntil &&
      new Date(property.promotedUntil).getTime() > Date.now()
  ) {
    return "Featured";
  }

  if (property.planSnapshot?.badgeLevel === "premium") {
    return "Premium";
  }

  if (property.planSnapshot?.badgeLevel === "verified") {
    return "Verified";
  }

  if (property.planSnapshot?.homepageFeatured) {
    return "Featured";
  }

  return null;
}

type BubbyDemoMessage = {
  id: string;
  sender: "user" | "bubby";
  text: string;
};

const BUBBY_DEMO_MESSAGES: BubbyDemoMessage[] = [
  {
    id: "initial-search",
    sender: "user",
    text: "Can you find me any 3 bedroom 2 bath houses?",
  },
  {
    id: "initial-response",
    sender: "bubby",
    text: "I found 6 matching houses across Trichy, Tirunelveli and Madurai. Would you like to narrow them down by budget?",
  },
  {
    id: "budget-follow-up",
    sender: "user",
    text: "Any under ₹60 lakh?",
  },
  {
    id: "budget-response",
    sender: "bubby",
    text: "Yes — I found 3 matching houses under ₹60 lakh. Here are the best options.",
  },
];

const BUBBY_DEMO_PROPERTIES = [
  {
    id: "demo-property-1",
    title: "Independent House",
    location: "Maharaja Nagar, Tirunelveli",
    price: "₹50 Lakh",
    details: "3 bedrooms · 2 bathrooms",
    image:
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "demo-property-2",
    title: "Independent House",
    location: "Thillai Nagar, Trichy",
    price: "₹56 Lakh",
    details: "3 bedrooms · 2 bathrooms",
    image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "demo-property-3",
    title: "Independent House",
    location: "KK Nagar, Madurai",
    price: "₹59 Lakh",
    details: "3 bedrooms · 2 bathrooms",
    image:
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=600",
  },
];

export default function HomePage() {
  const router = useRouter();

  const [mode, setMode] = useState<SearchMode>("Buy");
  const [city, setCity] = useState("Chennai");
  const [locality, setLocality] = useState("");
  const [propertyType, setPropertyType] = useState("All Property Types");
  const [maxPrice, setMaxPrice] = useState("");
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const [demoMessages, setDemoMessages] = useState<BubbyDemoMessage[]>([]);
  const [demoMessageIndex, setDemoMessageIndex] = useState(0);
  const [demoTypedText, setDemoTypedText] = useState("");
  const [demoThinking, setDemoThinking] = useState(false);
  const [demoComplete, setDemoComplete] = useState(false);
  const [showDemoProperty, setShowDemoProperty] = useState(false);

  useEffect(() => {
    const currentMessage = BUBBY_DEMO_MESSAGES[demoMessageIndex];

    if (!currentMessage) {
      const propertyTimer = window.setTimeout(() => {
        setShowDemoProperty(true);
      }, 350);

      const restartTimer = window.setTimeout(() => {
        setDemoMessages([]);
        setDemoMessageIndex(0);
        setDemoTypedText("");
        setDemoThinking(false);
        setDemoComplete(false);
        setShowDemoProperty(false);
      }, 7000);

      return () => {
        window.clearTimeout(propertyTimer);
        window.clearTimeout(restartTimer);
      };
    }

    const isBubbyMessage = currentMessage.sender === "bubby";

    if (
        isBubbyMessage &&
        demoTypedText.length === 0 &&
        !demoThinking &&
        !demoComplete
    ) {
      const thinkingTimer = window.setTimeout(() => {
        setDemoThinking(true);
      }, 300);

      return () => window.clearTimeout(thinkingTimer);
    }

    if (isBubbyMessage && demoThinking) {
      const thinkingTimer = window.setTimeout(() => {
        setDemoThinking(false);
        setDemoComplete(true);
      }, 1100);

      return () => window.clearTimeout(thinkingTimer);
    }

    if (!isBubbyMessage && !demoComplete) {
      const startingTimer = window.setTimeout(() => {
        setDemoComplete(true);
      }, demoMessageIndex === 0 ? 700 : 900);

      return () => window.clearTimeout(startingTimer);
    }

    if (demoTypedText.length < currentMessage.text.length) {
      const typingSpeed =
          currentMessage.sender === "user"
              ? 36
              : 22;

      const typingTimer = window.setTimeout(() => {
        setDemoTypedText(
            currentMessage.text.slice(0, demoTypedText.length + 1),
        );
      }, typingSpeed);

      return () => window.clearTimeout(typingTimer);
    }

    const nextMessageTimer = window.setTimeout(() => {
      setDemoMessages((previousMessages) => [
        ...previousMessages,
        currentMessage,
      ]);

      setDemoTypedText("");
      setDemoComplete(false);
      setDemoThinking(false);
      setDemoMessageIndex((previousIndex) => previousIndex + 1);
    }, currentMessage.sender === "bubby" ? 1300 : 650);

    return () => window.clearTimeout(nextMessageTimer);
  }, [
    demoMessageIndex,
    demoTypedText,
    demoThinking,
    demoComplete,
  ]);

  const localities = useMemo(
      () =>
          TAMIL_NADU_LOCATIONS[
              city as keyof typeof TAMIL_NADU_LOCATIONS
              ] ?? [],
      [city],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeaturedProperties() {
      try {
        const response = await fetch("/api/property/homepage-featured", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
              `Featured properties request failed with ${response.status}`,
          );
        }

        const payload: unknown = await response.json();

        if (!Array.isArray(payload)) {
          throw new Error("Featured properties response was invalid.");
        }

        setFeaturedProperties(payload as Property[]);
      } catch (error) {
        if (
            error instanceof DOMException &&
            error.name === "AbortError"
        ) {
          return;
        }

        console.error("Unable to load featured properties:", error);
        setFeaturedProperties([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadFeaturedProperties();

    return () => controller.abort();
  }, []);

  function navigateToResults(params: PropertySearchParams) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === "string" && value.length > 0) {
        searchParams.set(key, value);
      }
    });

    const query = searchParams.toString();
    router.push(query ? `/buy?${query}` : "/buy");
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    navigateToResults({
      city,
      location: locality,
      type:
          propertyType === "All Property Types"
              ? ""
              : propertyType,
      maxPrice,
      purpose:
          mode === "Buy"
              ? "sale"
              : mode === "Rent"
                  ? "rent"
                  : "commercial",
    });
  }

  function searchByCategory(type: string) {
    if (type === "Commercial") {
      navigateToResults({ purpose: "commercial", city });
      return;
    }

    navigateToResults({ type, city });
  }

  const curatedProperties = useMemo(
      () => curateHomepageProperties(featuredProperties, 5),
      [featuredProperties],
  );

  const spotlightProperty = curatedProperties[0];
  const supportingProperties = curatedProperties.slice(1, 5);

  function getHomepagePriority(property: Property): number {
    let score = 0;

    if (property.planSnapshot?.homepageFeatured) {
      score += 50;
    }

    if (
        property.promotedUntil &&
        new Date(property.promotedUntil).getTime() > Date.now()
    ) {
      score += 40;
    }

    if (property.planSnapshot?.badgeLevel === "premium") {
      score += 30;
    } else if (property.planSnapshot?.badgeLevel === "verified") {
      score += 20;
    }

    if (property.planSnapshot?.rankingLevel === "priority") {
      score += 15;
    } else if (property.planSnapshot?.rankingLevel === "top") {
      score += 10;
    }

    if (property.images?.[0]) {
      score += 5;
    }

    return score;
  }

  function curateHomepageProperties(
      properties: Property[],
      limit = 5,
  ): Property[] {
    const sortedProperties = [...properties].sort(
        (first, second) =>
            getHomepagePriority(second) - getHomepagePriority(first),
    );

    const selected: Property[] = [];
    const selectedIds = new Set<string>();
    const selectedTypes = new Set<string>();

    // Prefer variety across property types.
    for (const property of sortedProperties) {
      if (selected.length >= limit) {
        break;
      }

      if (selectedTypes.has(property.propertyType)) {
        continue;
      }

      selected.push(property);
      selectedIds.add(property._id);
      selectedTypes.add(property.propertyType);
    }

    // Fill any remaining slots with the next highest-priority properties.
    for (const property of sortedProperties) {
      if (selected.length >= limit) {
        break;
      }

      if (selectedIds.has(property._id)) {
        continue;
      }

      selected.push(property);
      selectedIds.add(property._id);
    }

    return selected;
  }

  return (
      <main className="min-h-screen bg-white pt-[72px] text-slate-950">
        <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#f5faf9_0%,#ffffff_78%)]">
          {/* Background decoration */}
          <div
              className="pointer-events-none absolute -right-48 -top-64 h-[620px] w-[620px] rounded-full bg-teal-100/60 blur-3xl"
              aria-hidden="true"
          />
          <div
              className="pointer-events-none absolute -left-64 top-48 h-[520px] w-[520px] rounded-full bg-amber-50 blur-3xl"
              aria-hidden="true"
          />

          <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.86fr)] lg:gap-16">
              {/* Hero copy */}
              <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl"
              >

                <h1 className="mt-6 font-heading text-4xl font-black leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[3.8rem]">
                  Find your next property,
                  <span className="block text-primary">
        with confidence.
      </span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                  Browse verified listings across apartments, villas, plots, commercial spaces and more—or simply tell Bubby what you're looking for and let AI do the searching for you.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                      type="button"
                      onClick={() =>
                          window.dispatchEvent(new CustomEvent("open-bubby-chat"))
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-dark"
                  >
                    <Bot size={18} aria-hidden="true" />
                    Ask Bubby
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>

                  <Link
                      href="/buy"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-black text-slate-700 shadow-sm transition hover:border-primary hover:text-primary"
                  >
                    Browse properties
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                  {[
                    "Search naturally",
                    "Refine with follow-ups",
                    "Discover matching listings",
                  ].map((item) => (
                      <div
                          key={item}
                          className="flex items-center gap-2 text-sm font-semibold text-slate-600"
                      >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={13} aria-hidden="true" />
          </span>

                        {item}
                      </div>
                  ))}
                </div>
              </motion.div>

              {/* Bubby preview */}
              {/* Animated Bubby preview */}
              <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 }}
                  className="mx-auto w-full max-w-[570px] lg:mx-0 lg:justify-self-end"
              >
                <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.15)]">
                  {/* Decorative glow */}
                  <div
                      className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-100/80 blur-3xl"
                      aria-hidden="true"
                  />

                  {/* Header */}
                  <div className="relative flex items-center justify-between border-b border-slate-100 bg-white/90 px-5 py-4 backdrop-blur sm:px-6">
                    <div className="flex items-center gap-3">
        <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
          <Bot size={22} aria-hidden="true" />

          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white bg-emerald-500" />
        </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-slate-950">
                            Bubby AI
                          </p>

                          <Sparkles
                              size={14}
                              className="text-primary"
                              aria-hidden="true"
                          />
                        </div>

                        <p className="mt-0.5 text-xs font-semibold text-emerald-600">
                          Online · Ready to search
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Conversation area */}
                  <div className="relative h-[430px] bg-[linear-gradient(180deg,#f8fafc_0%,#f0fdfa_100%)]">
                    <div
                        className="pointer-events-none absolute left-1/2 top-10 h-48 w-48 -translate-x-1/2 rounded-full bg-white/70 blur-3xl"
                        aria-hidden="true"
                    />

                    <div className="relative flex h-full flex-col">
                      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
                        <div className="space-y-4 pb-6">
                          {/* Finished messages */}
                          {demoMessages.map((message) => (
                              <motion.div
                                  key={message.id}
                                  initial={{
                                    opacity: 0,
                                    y: 10,
                                    scale: 0.98,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                  }}
                                  transition={{
                                    duration: 0.3,
                                  }}
                                  className={
                                    message.sender === "user"
                                        ? "flex justify-end"
                                        : "flex items-end gap-2.5"
                                  }
                              >
                                {message.sender === "bubby" && (
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                    <Bot size={15} aria-hidden="true" />
                  </span>
                                )}

                                <div
                                    className={
                                      message.sender === "user"
                                          ? "max-w-[85%] rounded-2xl rounded-br-md bg-slate-950 px-4 py-3 text-sm leading-6 text-white shadow-sm"
                                          : "max-w-[84%] rounded-2xl rounded-bl-md border border-teal-100 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm"
                                    }
                                >
                                  {message.text}
                                </div>
                              </motion.div>
                          ))}

                          {/* Currently typing user message */}
                          {BUBBY_DEMO_MESSAGES[demoMessageIndex]?.sender ===
                              "user" &&
                              demoTypedText.length > 0 && (
                                  <div className="flex justify-end">
                                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-slate-950 px-4 py-3 text-sm leading-6 text-white shadow-sm">
                                      {demoTypedText}

                                      <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-white align-middle" />
                                    </div>
                                  </div>
                              )}

                          {/* Bubby thinking */}
                          {BUBBY_DEMO_MESSAGES[demoMessageIndex]?.sender ===
                              "bubby" &&
                              demoThinking && (
                                  <motion.div
                                      initial={{
                                        opacity: 0,
                                        y: 8,
                                      }}
                                      animate={{
                                        opacity: 1,
                                        y: 0,
                                      }}
                                      className="flex items-end gap-2.5"
                                  >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                    <Bot size={15} aria-hidden="true" />
                  </span>

                                    <div className="rounded-2xl rounded-bl-md border border-teal-100 bg-white px-4 py-3.5 shadow-sm">
                                      <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                                      </div>
                                    </div>

                                    <span className="mb-2 text-[10px] font-semibold text-slate-400">
                    Searching listings
                  </span>
                                  </motion.div>
                              )}

                          {/* Currently typing Bubby response */}
                          {BUBBY_DEMO_MESSAGES[demoMessageIndex]?.sender ===
                              "bubby" &&
                              !demoThinking &&
                              demoTypedText.length > 0 && (
                                  <div className="flex items-end gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                    <Bot size={15} aria-hidden="true" />
                  </span>

                                    <div className="max-w-[84%] rounded-2xl rounded-bl-md border border-teal-100 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
                                      {demoTypedText}

                                      <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-primary align-middle" />
                                    </div>
                                  </div>
                              )}

                          {/* Matching properties */}
                          {showDemoProperty && (
                              <motion.div
                                  initial={{ opacity: 0, y: 16 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="ml-10 space-y-3"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                                    3 matching properties
                                  </p>

                                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-700">
        Under ₹60 lakh
      </span>
                                </div>

                                {BUBBY_DEMO_PROPERTIES.map((property, index) => (
                                    <motion.button
                                        key={property.id}
                                        type="button"
                                        initial={{
                                          opacity: 0,
                                          y: 14,
                                          scale: 0.98,
                                        }}
                                        animate={{
                                          opacity: 1,
                                          y: 0,
                                          scale: 1,
                                        }}
                                        transition={{
                                          delay: index * 0.12,
                                          duration: 0.35,
                                        }}
                                        onClick={() =>
                                            window.dispatchEvent(
                                                new CustomEvent("open-bubby-chat"),
                                            )
                                        }
                                        className="group block w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                                    >
                                      <div className="flex items-center gap-3 p-3">
                                        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                                          <Image
                                              src={property.image}
                                              alt={property.title}
                                              fill
                                              sizes="96px"
                                              className="object-cover transition duration-300 group-hover:scale-105"
                                          />

                                          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[8px] font-black uppercase tracking-wide text-primary shadow-sm backdrop-blur">
              Match
            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                              <p className="truncate text-sm font-black text-slate-950">
                                                {property.title}
                                              </p>

                                              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                                                <MapPin
                                                    size={12}
                                                    className="shrink-0 text-primary"
                                                    aria-hidden="true"
                                                />

                                                <span className="truncate">
                    {property.location}
                  </span>
                                              </p>
                                            </div>

                                            <ArrowRight
                                                size={16}
                                                className="mt-0.5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
                                                aria-hidden="true"
                                            />
                                          </div>

                                          <div className="mt-3 flex items-end justify-between gap-3">
                                            <div>
                                              <p className="text-base font-black text-primary">
                                                {property.price}
                                              </p>

                                              <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                                                {property.details}
                                              </p>
                                            </div>

                                            <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-wide text-emerald-700 sm:inline-flex">
                Under budget
              </span>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.button>
                                ))}

                                <button
                                    type="button"
                                    onClick={() =>
                                        window.dispatchEvent(
                                            new CustomEvent("open-bubby-chat"),
                                        )
                                    }
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-teal-50 px-4 py-3 text-xs font-black text-primary transition hover:border-primary/40 hover:bg-teal-100"
                                >
                                  View all matching properties
                                  <ArrowRight size={14} aria-hidden="true" />
                                </button>
                              </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Progress line */}
                      <div className="px-5 pb-3 sm:px-6">
                        <div className="h-1 overflow-hidden rounded-full bg-slate-200">
                          <motion.div
                              className="h-full rounded-full bg-primary"
                              animate={{
                                width: `${
                                    Math.min(
                                        ((demoMessageIndex +
                                                (showDemoProperty ? 1 : 0)) /
                                            (BUBBY_DEMO_MESSAGES.length + 1)) *
                                        100,
                                        100,
                                    )
                                }%`,
                              }}
                              transition={{
                                duration: 0.4,
                              }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fake input */}
                  <div className="relative border-t border-slate-100 bg-white p-4 sm:p-5">
                    <button
                        type="button"
                        onClick={() =>
                            window.dispatchEvent(
                                new CustomEvent("open-bubby-chat"),
                            )
                        }
                        className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition hover:border-primary hover:bg-white hover:ring-4 hover:ring-primary/10"
                    >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
          <Sparkles size={15} aria-hidden="true" />
        </span>

                      <span className="flex-1 text-sm text-slate-400">
          Ask Bubby about location, budget or property type...
        </span>

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition group-hover:translate-x-0.5">
          <ArrowRight size={17} aria-hidden="true" />
        </span>
                    </button>

                    <div className="mt-3 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      <span>Natural language</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>Follow-up searches</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>Smart matching</span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-center text-xs font-semibold text-slate-500">
                  Example conversation showing how Bubby can refine a property search.
                </p>
              </motion.div>
            </div>

            {/* Full-width search panel */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
                className="relative z-20 mt-10"
            >
              <form
                  onSubmit={handleSearch}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_22px_65px_rgba(15,23,42,0.12)]"
              >
                {/* Search modes */}
                <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="inline-flex w-fit rounded-xl bg-slate-100 p-1">
                    {(["Buy", "Rent", "Commercial"] as SearchMode[]).map(
                        (item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setMode(item)}
                                className={`rounded-lg px-5 py-2.5 text-sm font-bold transition ${
                                    mode === item
                                        ? "bg-white text-primary shadow-sm"
                                        : "text-slate-500 hover:text-slate-900"
                                }`}
                            >
                              {item}
                            </button>
                        ),
                    )}
                  </div>

                  <p className="text-sm text-slate-500">
                    Search properties available for{" "}
                    <span className="font-bold text-slate-800">
              {mode.toLowerCase()}
            </span>
                  </p>
                </div>

                {/* Filters */}
                <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-12 lg:items-end">
                  {/* City */}
                  <label className="min-w-0 lg:col-span-2">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              City
            </span>

                    <span className="relative block">
              <MapPin
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                  aria-hidden="true"
              />

              <select
                  value={city}
                  onChange={(event) => {
                    setCity(event.target.value);
                    setLocality("");
                  }}
                  className="h-14 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-9 text-sm font-bold text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  aria-label="Select city"
              >
                {TAMIL_NADU_CITIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                ))}
              </select>

              <ChevronRight
                  size={15}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                  aria-hidden="true"
              />
            </span>
                  </label>

                  {/* Locality */}
                  <label className="min-w-0 lg:col-span-3">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Locality
            </span>

                    <span className="relative block">
              <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                  aria-hidden="true"
              />

              <input
                  value={locality}
                  onChange={(event) => setLocality(event.target.value)}
                  list="homepage-localities"
                  placeholder={`Search in ${city}`}
                  className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  aria-label="Search locality"
              />

              <datalist id="homepage-localities">
                {localities.map((item) => (
                    <option key={item} value={item} />
                ))}
              </datalist>
            </span>
                  </label>

                  {/* Property type */}
                  <label className="min-w-0 lg:col-span-3">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Property type
            </span>

                    <span className="relative block">
              <Building2
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                  aria-hidden="true"
              />

              <select
                  value={propertyType}
                  onChange={(event) =>
                      setPropertyType(event.target.value)
                  }
                  className="h-14 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-9 text-sm font-bold text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  aria-label="Select property type"
              >
                {PROPERTY_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item === "All Property Types"
                          ? "Any property"
                          : item}
                    </option>
                ))}
              </select>

              <ChevronRight
                  size={15}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                  aria-hidden="true"
              />
            </span>
                  </label>

                  {/* Budget */}
                  <label className="min-w-0 lg:col-span-2">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Max budget
            </span>

                    <span className="relative block">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-black text-primary">
                ₹
              </span>

              <select
                  value={maxPrice}
                  onChange={(event) =>
                      setMaxPrice(event.target.value)
                  }
                  className="h-14 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm font-bold text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  aria-label="Select maximum budget"
              >
                {BUDGETS.map((item) => (
                    <option key={item.label} value={item.value}>
                      {item.value
                          ? item.label
                              .replace("Under ", "Up to ")
                              .replace("Lakh", "L")
                              .replace("Crore", "Cr")
                          : "Any budget"}
                    </option>
                ))}
              </select>

              <ChevronRight
                  size={15}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                  aria-hidden="true"
              />
            </span>
                  </label>

                  {/* Search */}
                  <button
                      type="submit"
                      className="flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 sm:col-span-2 lg:col-span-2"
                  >
                    <Search size={18} aria-hidden="true" />
                    Search
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>
                </div>
              </form>

              {/* Popular searches */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Popular
        </span>

                {POPULAR_SEARCHES.map((item) => (
                    <button
                        key={item.label}
                        type="button"
                        onClick={() => navigateToResults(item.params)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-primary hover:text-primary"
                    >
                      {item.label}
                    </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative z-20 mx-auto -mt-8 max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-4">
            <div className="mb-3 flex flex-col gap-2 px-2 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                  Quick actions
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  Choose what you would like to do next.
                </p>
              </div>

              <span className="hidden text-xs font-semibold text-slate-400 sm:block">
        Simple tools for every property journey
      </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
              {/* Buy */}
              <Link
                  href="/buy"
                  className="group relative overflow-hidden rounded-2xl bg-slate-950 p-6 text-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.28)] lg:col-span-4"
              >
                <div
                    className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-teal-400/20 blur-3xl"
                    aria-hidden="true"
                />

                <div className="relative flex h-full min-h-[170px] flex-col justify-between">
                  <div className="flex items-start justify-between gap-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-teal-300 ring-1 ring-white/10">
              <Home size={22} aria-hidden="true" />
            </span>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-primary">
              Most popular
            </span>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-black tracking-tight">
                      Buy a property
                    </h3>

                    <p className="mt-2 max-w-xs text-sm leading-6 text-slate-300">
                      Explore apartments, houses, plots, land and commercial
                      properties for sale.
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-teal-300">
              Browse properties
              <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
              />
            </span>
                  </div>
                </div>
              </Link>

              {/* Sell */}
              <Link
                  href="/sell"
                  className="group relative overflow-hidden rounded-2xl border border-teal-100 bg-[linear-gradient(135deg,#ecfdf9_0%,#ffffff_72%)] p-6 transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl lg:col-span-4"
              >
                <div className="flex h-full min-h-[170px] flex-col justify-between">
                  <div className="flex items-start justify-between gap-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
              <Store size={22} aria-hidden="true" />
            </span>

                    <span className="rounded-full border border-teal-100 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-primary">
              List online
            </span>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-black tracking-tight text-slate-950">
                      Sell your property
                    </h3>

                    <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">
                      Create a clear listing and connect with serious buyers across
                      Tamil Nadu.
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
              Start listing
              <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
              />
            </span>
                  </div>
                </div>
              </Link>

              {/* Builders */}
              <Link
                  href="/builders"
                  className="group flex min-h-[170px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:bg-teal-50/40 hover:shadow-xl lg:col-span-2"
              >
                <div className="flex items-start justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-primary transition group-hover:bg-primary group-hover:text-white">
            <Building2 size={20} aria-hidden="true" />
          </span>

                  <ArrowRight
                      size={17}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary"
                      aria-hidden="true"
                  />
                </div>

                <div className="mt-8">
                  <h3 className="font-black text-slate-950">
                    Trusted builders
                  </h3>

                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    Discover builders and their latest projects.
                  </p>

                  <span className="mt-4 block text-xs font-black uppercase tracking-wider text-primary">
            Explore projects
          </span>
                </div>
              </Link>

              {/* Compare */}
              <Link
                  href="/compare"
                  className="group flex min-h-[170px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:bg-teal-50/40 hover:shadow-xl lg:col-span-2"
              >
                <div className="flex items-start justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-primary transition group-hover:bg-primary group-hover:text-white">
            <Landmark size={20} aria-hidden="true" />
          </span>

                  <ArrowRight
                      size={17}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary"
                      aria-hidden="true"
                  />
                </div>

                <div className="mt-8">
                  <h3 className="font-black text-slate-950">
                    Compare options
                  </h3>

                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    Review properties side by side before deciding.
                  </p>

                  <span className="mt-4 block text-xs font-black uppercase tracking-wider text-primary">
            Start comparing
          </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="relative bg-white">
          <div className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
            {/* Header */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-primary">
  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-50">
    <BadgeCheck size={15} aria-hidden="true" />
  </span>

                  Featured property picks
                </div>

                <h2 className="mt-4 max-w-2xl font-heading text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
                  Properties worth seeing before you continue.
                </h2>

                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Explore selected apartments, houses, plots, land and commercial
                  properties from across Tamil Nadu.
                </p>
              </div>

              <Link
                  href="/buy"
                  className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-primary shadow-sm transition hover:border-primary hover:bg-teal-50"
              >
                View all properties
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-12">
              {loading ? (
                  <div className="grid gap-5 lg:grid-cols-12">
                    <div className="min-h-[560px] animate-pulse rounded-[2rem] bg-slate-200 lg:col-span-7" />

                    <div className="grid grid-flow-col auto-cols-[82%] gap-4 overflow-hidden sm:auto-cols-[48%] lg:col-span-5 lg:grid-flow-row lg:grid-cols-2 lg:grid-rows-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                          <div
                              key={index}
                              className="min-h-[270px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                          />
                      ))}
                    </div>
                  </div>
              ) : spotlightProperty ? (
                  <div className="grid gap-5 lg:grid-cols-12">
                    {/* Featured property */}
                    <Link
                        href={`/property/${spotlightProperty._id}`}
                        className="group relative min-h-[500px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-[0_35px_90px_rgba(0,0,0,0.35)] sm:min-h-[560px] lg:col-span-7"
                    >
                      <Image
                          src={
                              spotlightProperty.images?.[0] ??
                              "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=85&w=1400"
                          }
                          alt={spotlightProperty.address}
                          fill
                          sizes="(max-width: 1024px) 100vw, 58vw"
                          className="object-cover transition duration-700 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/5" />

                      {/* Main-card badges */}
                      <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-3 p-5 sm:p-6">
                        <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/90 px-3 py-2 text-xs font-black text-slate-900 shadow-lg backdrop-blur">
                  <ShieldCheck
                      size={14}
                      className="text-emerald-600"
                      aria-hidden="true"
                  />
                  Spotlight
                </span>

                          <span className="rounded-full border border-white/20 bg-slate-950/45 px-3 py-2 text-xs font-bold text-white backdrop-blur">
                  {spotlightProperty.propertyType}
                </span>
                        </div>

                        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition group-hover:bg-primary">
                <ArrowRight size={19} aria-hidden="true" />
              </span>
                      </div>

                      {/* Main-card details */}
                      <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                          <MapPin size={16} aria-hidden="true" />

                          <span>
                  {spotlightProperty.locality
                      ? `${spotlightProperty.locality}, ${spotlightProperty.city}`
                      : spotlightProperty.city}
                </span>
                        </div>

                        <h3 className="mt-3 max-w-xl text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                          {spotlightProperty.address}
                        </h3>

                        <div className="mt-6 flex flex-col gap-5 border-t border-white/15 pt-5 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <p className="text-3xl font-black">
                              {formatPrice(spotlightProperty.price)}
                            </p>

                            <PriceNegotiabilityBadge
                                negotiable={spotlightProperty.negotiable}
                                className="mt-2"
                            />

                            <p className="mt-2 text-sm text-slate-300">
                              {spotlightProperty.bedrooms === 0
                                  ? spotlightProperty.propertyType
                                  : `${spotlightProperty.bedrooms} BHK ${spotlightProperty.propertyType}`}
                            </p>
                          </div>

                          <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition group-hover:bg-teal-300">
                  View property
                  <ArrowRight size={17} aria-hidden="true" />
                </span>
                        </div>
                      </div>
                    </Link>

                    {/* Four supporting properties */}
                    <div className="min-w-0 lg:col-span-5">
                      <div className="grid snap-x snap-mandatory grid-flow-col auto-cols-[84%] gap-4 overflow-x-auto pb-3 sm:auto-cols-[48%] lg:h-full lg:grid-flow-row lg:grid-cols-2 lg:grid-rows-2 lg:overflow-visible lg:pb-0">
                        {supportingProperties.map((property, index) => {
                          const badge = getPropertyBadge(property);

                          return (
                              <Link
                                  key={property._id}
                                  href={`/property/${property._id}`}
                                  className="group flex min-h-[280px] snap-start flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.11)]"
                              >
                                <div className="relative h-36 shrink-0 overflow-hidden bg-slate-800 sm:h-40 lg:h-[46%]">
                                  <Image
                                      src={
                                          property.images?.[0] ??
                                          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800"
                                      }
                                      alt={property.address}
                                      fill
                                      sizes="(max-width: 640px) 84vw, (max-width: 1024px) 48vw, 20vw"
                                      className="object-cover transition duration-500 group-hover:scale-105"
                                  />

                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />

                                  <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-slate-950/55 text-xs font-black text-white backdrop-blur">
                        {String(index + 2).padStart(2, "0")}
                      </span>

                                  {badge ? (
                                      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wide text-primary shadow backdrop-blur">
                          {badge}
                        </span>
                                  ) : null}

                                  <span className="absolute bottom-3 left-3 max-w-[calc(100%-24px)] truncate rounded-full border border-white/15 bg-slate-950/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white backdrop-blur">
                        {property.propertyType}
                      </span>
                                </div>

                                <div className="flex min-h-0 flex-1 flex-col p-4">
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                    <MapPin
                                        size={13}
                                        className="shrink-0"
                                        aria-hidden="true"
                                    />

                                    <span className="truncate">
                          {property.locality
                              ? `${property.locality}, ${property.city}`
                              : property.city}
                        </span>
                                  </div>

                                  <h3 className="mt-3 line-clamp-2 text-sm font-black leading-5 text-slate-950 transition group-hover:text-primary sm:text-base">
                                    {property.address}
                                  </h3>

                                  <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                                    <div className="min-w-0">
                                      <p className="text-lg font-black text-slate-950">
                                        {formatPrice(property.price)}
                                      </p>

                                      <PriceNegotiabilityBadge
                                          negotiable={property.negotiable}
                                          className="mt-1.5"
                                      />

                                      <p className="mt-1 truncate text-xs text-slate-500">
                                        {property.bedrooms === 0
                                            ? property.propertyType
                                            : `${property.bedrooms} BHK ${property.propertyType}`}
                                      </p>
                                    </div>

                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-primary transition group-hover:bg-primary group-hover:text-white">
                          <ArrowRight size={16} aria-hidden="true" />
                        </span>
                                  </div>
                                </div>
                              </Link>
                          );
                        })}

                        {/* Fill empty space if the API returns fewer than five */}
                        {supportingProperties.length < 4 ? (
                            <Link
                                href="/buy"
                                className="group flex min-h-[280px] snap-start flex-col justify-between rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-primary hover:bg-teal-50"
                            >
  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
    <Building2 size={21} aria-hidden="true" />
  </span>

                              <div className="mt-10">
                                <h3 className="font-black text-slate-950">
                                  Explore more properties
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                  Browse every available listing across Tamil Nadu.
                                </p>

                                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
      Browse all
      <ArrowRight
          size={16}
          className="transition group-hover:translate-x-1"
          aria-hidden="true"
      />
    </span>
                              </div>
                            </Link>
                        ) : null}
                      </div>

                      <p className="mt-3 text-center text-xs font-semibold text-slate-500 lg:hidden">
                        Swipe to explore more properties
                      </p>
                    </div>
                  </div>
              ) : (
                  <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                    <Building2
                        size={36}
                        className="mx-auto text-primary"
                        aria-hidden="true"
                    />

                    <h3 className="mt-5 text-xl font-black text-slate-950">
                      Featured properties will appear here
                    </h3>

                    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                      Browse current listings or publish a property to make it available
                      to buyers.
                    </p>

                    <div className="mt-7 flex flex-wrap justify-center gap-3">
                      <Link
                          href="/buy"
                          className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-white"
                      >
                        Browse properties
                      </Link>

                      <Link
                          href="/post-property"
                          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary"
                      >
                        List a property
                      </Link>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-white">
          <div
              className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-teal-50 blur-3xl"
              aria-hidden="true"
          />

          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
            {/* Section heading */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">
                  Browse your way
                </p>

                <h2 className="mt-3 max-w-3xl font-heading text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
                  Start with the property type that fits your plan.
                </h2>

                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Whether you are looking for a place to live, land to build on,
                  or space for your business, begin with a category and refine
                  the details later.
                </p>
              </div>

              <Link
                  href="/buy"
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-primary shadow-sm transition hover:border-primary hover:bg-teal-50"
              >
                Browse all properties
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>

            {/* Bento grid */}
            <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:grid-rows-2">
              {/* Apartments — primary category */}
              <button
                  type="button"
                  onClick={() => searchByCategory("Apartment")}
                  className="group relative min-h-[420px] overflow-hidden rounded-[2rem] text-left shadow-[0_24px_65px_rgba(15,23,42,0.14)] lg:col-span-5 lg:row-span-2"
              >
                <Image
                    src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=86&w=1100"
                    alt="Modern apartment interior"
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-transparent" />

                <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white backdrop-blur">
                  <Building2 size={23} aria-hidden="true" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-8">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
            Popular choice
          </span>

                  <h3 className="mt-4 text-3xl font-black tracking-tight">
                    Apartments
                  </h3>

                  <p className="mt-3 max-w-sm text-sm leading-6 text-slate-200">
                    Explore flats, studios, gated communities and newly launched
                    projects across Tamil Nadu.
                  </p>

                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-primary">
            Explore apartments
            <ArrowRight
                size={17}
                className="transition group-hover:translate-x-1"
                aria-hidden="true"
            />
          </span>
                </div>
              </button>

              {/* Independent homes */}
              <button
                  type="button"
                  onClick={() => searchByCategory("Independent House")}
                  className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#f0fdfa_0%,#ffffff_68%)] p-7 text-left transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl lg:col-span-4"
              >
                <div className="flex items-start justify-between gap-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <Home size={23} aria-hidden="true" />
          </span>

                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition group-hover:border-primary group-hover:text-primary">
            <ArrowRight
                size={18}
                className="transition group-hover:translate-x-0.5"
                aria-hidden="true"
            />
          </span>
                </div>

                <h3 className="mt-8 text-2xl font-black tracking-tight text-slate-950">
                  Independent homes
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
                  Houses, villas, duplexes and independent floors for families
                  who want more space and privacy.
                </p>

                <div className="mt-7 flex flex-wrap gap-2">
                  {["Villas", "Duplexes", "Independent floors"].map((item) => (
                      <span
                          key={item}
                          className="rounded-full border border-teal-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                      >
              {item}
            </span>
                  ))}
                </div>
              </button>

              {/* Plots and land */}
              <button
                  type="button"
                  onClick={() => searchByCategory("Plot")}
                  className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#fffbeb_0%,#ffffff_70%)] p-7 text-left transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl lg:col-span-3"
              >
                <div className="flex items-start justify-between gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Trees size={23} aria-hidden="true" />
          </span>

                  <ArrowRight
                      size={18}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-amber-600"
                      aria-hidden="true"
                  />
                </div>

                <h3 className="mt-8 text-2xl font-black tracking-tight text-slate-950">
                  Plots & land
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Residential plots, agricultural land and farm land for your
                  next investment or build.
                </p>

                <span className="mt-7 inline-flex rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">
          Build or invest
        </span>
              </button>

              {/* Commercial */}
              <button
                  type="button"
                  onClick={() => searchByCategory("Commercial")}
                  className="group relative overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-left text-white transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.25)] lg:col-span-7"
              >
                <div
                    className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-teal-500/20 blur-3xl"
                    aria-hidden="true"
                />

                <div className="relative flex h-full flex-col justify-between gap-8 sm:flex-row sm:items-end">
                  <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-teal-300">
              <Store size={23} aria-hidden="true" />
            </span>

                    <h3 className="mt-6 text-2xl font-black tracking-tight">
                      Commercial property
                    </h3>

                    <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">
                      Find shops, offices, showrooms and business spaces in
                      locations that support your next move.
                    </p>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition group-hover:bg-teal-300">
            Explore commercial
            <ArrowRight size={17} aria-hidden="true" />
          </span>
                </div>
              </button>
            </div>

            {/* Guidance strip */}
            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
          <Search size={19} aria-hidden="true" />
        </span>

                <div>
                  <p className="font-black text-slate-900">
                    Not sure which category to choose?
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Start with a city or locality and view every available
                    property type in that area.
                  </p>
                </div>
              </div>

              <Link
                  href="/buy"
                  className="inline-flex shrink-0 items-center gap-2 text-sm font-black text-primary hover:text-primary-dark"
              >
                Search by location
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7faf9_100%)]">
          <div
              className="pointer-events-none absolute -left-52 top-20 h-[480px] w-[480px] rounded-full bg-teal-100/55 blur-3xl"
              aria-hidden="true"
          />

          <div
              className="pointer-events-none absolute -right-48 bottom-0 h-[440px] w-[440px] rounded-full bg-sky-100/45 blur-3xl"
              aria-hidden="true"
          />

          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
            {/* Section heading */}
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">
                A clearer property journey
              </p>

              <h2 className="mt-4 font-heading text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-5xl">
                Move from searching to deciding
                <span className="block text-primary">
          with fewer unanswered questions.
        </span>
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Propyours helps you discover suitable properties, review the
                important details and decide what deserves a closer look.
              </p>
            </div>

            {/* Main experience card */}
            <div className="mt-12 overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.11)]">
              <div className="grid lg:grid-cols-12">
                {/* Guided journey */}
                <div className="relative overflow-hidden bg-slate-950 p-6 text-white sm:p-9 lg:col-span-7 lg:p-12">
                  <div
                      className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl"
                      aria-hidden="true"
                  />

                  <div className="relative">
                    <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-300">
                <Eye size={21} aria-hidden="true" />
              </span>

                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-300">
                          Designed for clarity
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          A simple path from discovery to enquiry
                        </p>
                      </div>
                    </div>

                    <h3 className="mt-8 max-w-xl text-3xl font-black leading-tight tracking-[-0.025em] sm:text-4xl">
                      Understand your options before making the first call.
                    </h3>

                    <div className="relative mt-10 space-y-4">
                      {/* Connecting line */}
                      <div
                          className="pointer-events-none absolute bottom-11 left-11 top-11 hidden w-px bg-gradient-to-b from-teal-400/80 via-teal-400/45 to-teal-400/15 sm:block"
                          aria-hidden="true"
                      />

                      {[
                        {
                          number: "01",
                          title: "Discover",
                          description:
                              "Search by city, locality, property type and budget.",
                          icon: Search,
                          href: "/buy",
                          action: "Start searching",
                        },
                        {
                          number: "02",
                          title: "Compare",
                          description:
                              "Review suitable options side by side before shortlisting.",
                          icon: Scale,
                          href: "/compare",
                          action: "Compare options",
                        },
                        {
                          number: "03",
                          title: "Connect",
                          description:
                              "Open the full listing and enquire only when it feels relevant.",
                          icon: PhoneCall,
                          href: "/buy",
                          action: "Explore listings",
                        },
                      ].map((step) => {
                        const Icon = step.icon;

                        return (
                            <Link
                                key={step.number}
                                href={step.href}
                                className="group relative flex gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4 transition hover:border-teal-300/30 hover:bg-white/[0.09] sm:items-center sm:p-5"
                            >
                    <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-teal-300/20 bg-slate-950 text-teal-300 shadow-lg ring-4 ring-slate-950">
                      <Icon size={21} aria-hidden="true" />
                    </span>

                              <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-300">
                          Step {step.number}
                        </span>

                        <span className="text-lg font-black text-white">
  {step.title}
</span>
                      </span>

                      <span className="mt-1.5 block text-sm leading-6 text-slate-400">
                        {step.description}
                      </span>
                    </span>

                              <span className="hidden shrink-0 items-center gap-2 text-xs font-black text-teal-300 sm:flex">
                      {step.action}
                                <ArrowRight
                                    size={15}
                                    className="transition group-hover:translate-x-1"
                                    aria-hidden="true"
                                />
                    </span>
                            </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Information preview */}
                <div className="relative bg-[linear-gradient(145deg,#f0fdfa_0%,#ffffff_62%)] p-6 sm:p-9 lg:col-span-5 lg:p-12">
                  <div className="flex items-center justify-between gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
              <BadgeCheck size={23} aria-hidden="true" />
            </span>

                    <span className="rounded-full border border-teal-100 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-primary shadow-sm">
              Before you enquire
            </span>
                  </div>

                  <h3 className="mt-8 text-2xl font-black tracking-tight text-slate-950">
                    See the information that helps you shortlist.
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Property pages are structured to make the important facts easier
                    to find without burying them beneath unnecessary jargon.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {[
                      {
                        title: "Price and budget",
                        description: "Understand the asking price early.",
                        icon: CheckCircle2,
                      },
                      {
                        title: "Location",
                        description: "See the city and locality clearly.",
                        icon: MapPin,
                      },
                      {
                        title: "Property type",
                        description: "Know exactly what is being listed.",
                        icon: Building2,
                      },
                      {
                        title: "Listing labels",
                        description: "Recognise featured or verified listings.",
                        icon: BadgeCheck,
                      },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                          <div
                              key={item.title}
                              className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm"
                          >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-primary">
                    <Icon size={17} aria-hidden="true" />
                  </span>

                            <h4 className="mt-4 text-sm font-black text-slate-900">
                              {item.title}
                            </h4>

                            <p className="mt-1.5 text-xs leading-5 text-slate-500">
                              {item.description}
                            </p>
                          </div>
                      );
                    })}
                  </div>

                  <Link
                      href="/buy"
                      className="mt-8 inline-flex items-center gap-2 text-sm font-black text-primary transition hover:text-primary-dark"
                  >
                    Explore property listings
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* Owner CTA */}
              <div className="border-t border-slate-200 bg-white p-4 sm:p-6">
                <div className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(120deg,#0f766e_0%,#0d9488_56%,#115e59_100%)] px-6 py-7 text-white sm:px-8 sm:py-8">
                  <div
                      className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border-[35px] border-white/5"
                      aria-hidden="true"
                  />

                  <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex max-w-2xl items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/15">
                <Store size={22} aria-hidden="true" />
              </span>

                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-teal-100">
                          For property owners
                        </p>

                        <h3 className="mt-2 text-2xl font-black tracking-tight">
                          Have a property to sell or rent?
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-teal-50/80">
                          Create a clear listing and make it easier for serious
                          property seekers to understand what you are offering.
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                      <Link
                          href="/pricing"
                          className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
                      >
                        View listing plans
                      </Link>

                      <Link
                          href="/post-property"
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-slate-950 shadow-lg transition hover:bg-teal-50"
                      >
                        List your property
                        <ArrowRight size={17} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Small reassurance row */}
            <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs font-semibold text-slate-500">
              {[
                "Search at your own pace",
                "Compare before enquiring",
                "Clear property categories",
              ].map((item) => (
                  <span key={item} className="flex items-center gap-2">
          <CheckCircle2
              size={15}
              className="text-primary"
              aria-hidden="true"
          />
                    {item}
        </span>
              ))}
            </div>
          </div>
        </section>
      </main>
  );
}