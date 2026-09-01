"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BadgeCheck,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Edit3,
  Eye,
  FileText,
  Gem,
  Home,
  ImageIcon,
  LayoutDashboard,
  MapPin,
  MessageSquareText,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Tag,
  Upload,
  UserRound,
} from "lucide-react";
import {
  PLAN_CATALOG,
  type PlanDefinition,
} from "@/lib/plan-catalog";

const OWNER_PLANS: PlanDefinition[] = [
  PLAN_CATALOG.silver,
  PLAN_CATALOG.gold,
  PLAN_CATALOG.platinum,
];

const LISTING_STEPS = [
  {
    number: "01",
    title: "Describe the property",
    description:
        "Add the property type, location, size, ownership and essential details.",
    icon: FileText,
  },
  {
    number: "02",
    title: "Present it clearly",
    description:
        "Upload photos, add amenities and include video links when your plan supports them.",
    icon: Camera,
  },
  {
    number: "03",
    title: "Choose visibility",
    description:
        "Start free or choose a paid owner plan for longer duration, stronger placement and insights.",
    icon: Sparkles,
  },
  {
    number: "04",
    title: "Manage the listing",
    description:
        "Review your property, update details and use the management dashboard after publishing.",
    icon: LayoutDashboard,
  },
];

const FAQS = [
  {
    question: "Can I list a property for free?",
    answer:
        "Yes. The Silver owner plan supports one active property for 30 days with up to five images. Paid plans provide longer listing duration and additional visibility features.",
  },
  {
    question: "Can I list a property for rent as well as sale?",
    answer:
        "Yes. The property form supports both selling and renting, along with several residential, land and commercial property types.",
  },
  {
    question: "Can I edit my property after publishing?",
    answer:
        "Yes. Published properties can be managed from the property-management area, where the existing product supports editing, reviewing and removing listings.",
  },
  {
    question: "What analytics are available?",
    answer:
        "Silver does not include analytics. Gold includes views, phone clicks and favorites tracking. Platinum adds daily performance and conversion-oriented insights.",
  },
];

function formatPlanPrice(plan: PlanDefinition): string {
  if (plan.presentation.priceInPaise === 0) {
    return "Free";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(plan.presentation.priceInPaise / 100);
}

function getPlanFeatures(plan: PlanDefinition): string[] {
  const {
    activeProperties,
    listingDays,
    maxImages,
    maxVideoLinks,
    verifiedLeadLimit,
    homepageFeatured,
    rankingLevel,
    analyticsLevel,
    leadNotifications,
  } = plan.entitlements;

  const features = [
    `${activeProperties} active ${
        activeProperties === 1 ? "property" : "properties"
    }`,
    `${listingDays}-day listing duration`,
    `Up to ${maxImages} property images`,
  ];

  if (maxVideoLinks > 0) {
    features.push(
        `${maxVideoLinks} video ${
            maxVideoLinks === 1 ? "link" : "links"
        }`,
    );
  }

  if (verifiedLeadLimit === null) {
    features.push("Unlimited verified leads");
  } else {
    features.push(
        `${verifiedLeadLimit} verified ${
            verifiedLeadLimit === 1 ? "lead" : "leads"
        }`,
    );
  }

  if (homepageFeatured) {
    features.push("Homepage-featured eligibility");
  } else if (rankingLevel !== "standard") {
    features.push("Improved listing placement");
  }

  if (analyticsLevel !== "none") {
    features.push(plan.presentation.analyticsHighlight);
  }

  if (leadNotifications) {
    features.push("Lead notifications");
  }

  return features;
}

function getPlanTheme(plan: PlanDefinition) {
  switch (plan.tier) {
    case "platinum":
      return {
        icon: Gem,
        card:
            "border-white/10 bg-slate-950 text-white shadow-[0_35px_100px_rgba(15,23,42,0.35)] ring-1 ring-white/5",
        iconBox:
            "bg-white/10 text-teal-300 ring-1 ring-white/10 shadow-xl",
        badge:
            "bg-teal-300 text-slate-950 shadow-lg shadow-teal-400/20",
        eyebrow: "text-teal-300",
        muted: "text-slate-400",
        feature: "text-slate-300",
        check:
            "bg-teal-300/15 text-teal-300 ring-1 ring-teal-300/20",
        divider: "bg-white/10",
        priceBox:
            "border-white/10 bg-white/[0.055]",
        cta:
            "bg-white text-slate-950 shadow-lg hover:bg-teal-200",
      };

    case "gold":
      return {
        icon: Sparkles,
        card:
            "border-2 border-primary/70 bg-white text-slate-950 shadow-[0_35px_90px_rgba(13,148,136,0.2)] ring-4 ring-primary/5 lg:-translate-y-4",
        iconBox:
            "bg-primary text-white shadow-xl shadow-primary/25",
        badge:
            "bg-primary text-white shadow-lg shadow-primary/20",
        eyebrow: "text-primary",
        muted: "text-slate-500",
        feature: "text-slate-600",
        check:
            "bg-teal-100 text-primary ring-1 ring-teal-200",
        divider: "bg-teal-100",
        priceBox:
            "border-teal-200 bg-[linear-gradient(135deg,#ecfdf9_0%,#ffffff_100%)]",
        cta:
            "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-dark",
      };

    default:
      return {
        icon: UserRound,
        card:
            "border-slate-200 bg-white text-slate-950 shadow-sm",
        iconBox:
            "bg-slate-100 text-slate-700",
        badge:
            "bg-slate-100 text-slate-700",
        eyebrow: "text-slate-500",
        muted: "text-slate-500",
        feature: "text-slate-600",
        check:
            "bg-slate-100 text-slate-600",
        divider: "bg-slate-100",
        priceBox:
            "border-slate-200 bg-slate-50",
        cta:
            "bg-slate-950 text-white hover:bg-primary",
      };
  }
}

export default function SellPage() {
  return (
      <main className="min-h-screen bg-white pt-20 font-body text-slate-950">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.16),_transparent_35%),linear-gradient(180deg,#f7fbfa_0%,#ffffff_100%)]">
          <div
              className="pointer-events-none absolute -left-52 top-36 h-[460px] w-[460px] rounded-full bg-amber-50 blur-3xl"
              aria-hidden="true"
          />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-12 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(430px,0.95fr)] lg:px-8 lg:pb-20 lg:pt-16">
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
            >
             <h1 className="mt-6 max-w-3xl font-heading text-4xl font-black leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-[3.8rem]">
                Give your property
                <span className="block text-primary">
                a listing people can understand.
              </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Add the important details, upload useful photos and choose the
                visibility level that fits your property—whether you are selling
                or renting.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                    href="/post-property"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-dark"
                >
                  Start your listing
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>

                <Link
                    href="#owner-plans"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 text-sm font-black text-slate-700 shadow-sm transition hover:border-primary hover:text-primary"
                >
                  Compare owner plans
                  <ChevronRight size={17} aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  "Sell or rent",
                  "Residential, land and commercial",
                  "Free plan available",
                ].map((item) => (
                    <span
                        key={item}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-600"
                    >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check size={13} aria-hidden="true" />
                  </span>
                      {item}
                </span>
                ))}
              </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 }}
                className="relative mx-auto w-full max-w-[550px] lg:mx-0 lg:justify-self-end"
            >
              <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-white bg-slate-950 shadow-[0_32px_90px_rgba(15,23,42,0.22)]">
                <div className="relative h-[500px] sm:h-[560px]">
                  <Image
                      src="/sell-hero.png"
                      alt="Property prepared for an online listing"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 550px"
                      className="object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-slate-950/5" />

                  <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/90 px-3.5 py-2 text-xs font-black text-slate-950 shadow-lg backdrop-blur">
                    <BadgeCheck
                        size={15}
                        className="text-primary"
                        aria-hidden="true"
                    />
                    Structured listing details
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                    <p className="text-sm font-black text-teal-200">
                      Show what matters
                    </p>

                    <h2 className="mt-2 max-w-lg text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                      Location, property type, price, size, photos and amenities.
                    </h2>

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { label: "Location", icon: MapPin },
                        { label: "Photos", icon: ImageIcon },
                        { label: "Price", icon: Tag },
                        { label: "Details", icon: FileText },
                      ].map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.label}
                                className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur"
                            >
                              <Icon
                                  size={16}
                                  className="text-teal-200"
                                  aria-hidden="true"
                              />
                              <p className="mt-2 text-xs font-black">
                                {item.label}
                              </p>
                            </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Journey strip */}
        <section className="relative z-20 mx-auto -mt-7 max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {LISTING_STEPS.map((step) => {
                const Icon = step.icon;

                return (
                    <div
                        key={step.number}
                        className="group relative rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-teal-200 hover:bg-teal-50/50"
                    >
                      <div className="flex items-center justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm transition group-hover:bg-primary group-hover:text-white">
                      <Icon size={20} aria-hidden="true" />
                    </span>

                        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Step {step.number}
                    </span>
                      </div>

                      <h3 className="mt-5 font-black text-slate-950">
                        {step.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {step.description}
                      </p>
                    </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Listing value */}
        <section className="relative overflow-hidden bg-white">
          <div
              className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-teal-50 blur-3xl"
              aria-hidden="true"
          />

          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                  Build a useful listing
                </p>

                <h2 className="mt-3 max-w-3xl font-heading text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                  Present the property clearly before the first enquiry.
                </h2>

                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  The posting flow is designed around information buyers and
                  renters need to understand the property—not just a headline
                  and a phone number.
                </p>
              </div>

              <Link
                  href="/post-property"
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-primary shadow-sm transition hover:border-primary hover:bg-teal-50"
              >
                Open the listing form
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-12">
              <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_28px_80px_rgba(15,23,42,0.2)] sm:p-9 lg:col-span-7">
                <div
                    className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl"
                    aria-hidden="true"
                />

                <div className="relative">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-300">
                        Listing preview
                      </p>
                      <h3 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                        A professional structure for every property type.
                      </h3>
                    </div>

                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-teal-300 ring-1 ring-white/10">
                    <Eye size={22} aria-hidden="true" />
                  </span>
                  </div>

                  <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.06]">
                    <div className="grid sm:grid-cols-[220px_minmax(0,1fr)]">
                      <div className="relative min-h-56 overflow-hidden bg-slate-800">
                        <Image
                            src="/sell-hero.png"
                            alt="Example property listing"
                            fill
                            sizes="(max-width: 640px) 100vw, 220px"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                        <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-slate-950">
                        Property photo
                      </span>
                      </div>

                      <div className="p-5 sm:p-6">
                        <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-teal-200">
                          Property type
                        </span>
                          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-slate-300">
                          Sell or rent
                        </span>
                        </div>

                        <div className="mt-6 space-y-3">
                          <div className="h-5 w-4/5 rounded bg-white/20" />
                          <div className="h-3 w-3/5 rounded bg-white/10" />
                        </div>

                        <div className="mt-7 grid grid-cols-3 gap-2">
                          {["Location", "Size", "Price"].map((label) => (
                              <div
                                  key={label}
                                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-3"
                              >
                                <p className="text-[9px] font-black uppercase tracking-wide text-slate-500">
                                  {label}
                                </p>
                                <div className="mt-2 h-3 w-3/4 rounded bg-white/15" />
                              </div>
                          ))}
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                        <span className="text-xs font-bold text-slate-400">
                          Clear, scannable information
                        </span>
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
                          <ArrowRight size={16} aria-hidden="true" />
                        </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
                <div className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(145deg,#f0fdfa_0%,#ffffff_70%)] p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                  <Upload size={20} aria-hidden="true" />
                </span>

                  <h3 className="mt-6 text-xl font-black tracking-tight text-slate-950">
                    Add useful media
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Every owner plan includes property images. Gold and
                    Platinum also support video links, with higher photo limits.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {["Photos", "Amenities", "Video links", "Brochure field"].map(
                        (item) => (
                            <span
                                key={item}
                                className="rounded-full border border-teal-100 bg-white px-3 py-1.5 text-xs font-bold text-slate-600"
                            >
                        {item}
                      </span>
                        ),
                    )}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Edit3 size={20} aria-hidden="true" />
                </span>

                  <h3 className="mt-6 text-xl font-black tracking-tight text-slate-950">
                    Stay in control afterwards
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Use the property-management area to review your listings,
                    edit information, remove properties and open analytics when
                    your plan provides them.
                  </p>

                  <Link
                      href="/manage-properties"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-black text-primary hover:text-primary-dark"
                  >
                    Manage existing listings
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Management experience */}
        <section className="relative overflow-hidden bg-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="overflow-hidden rounded-[2.25rem] bg-slate-950 text-white shadow-[0_32px_90px_rgba(15,23,42,0.2)]">
              <div className="grid lg:grid-cols-12">
                <div className="relative overflow-hidden p-7 sm:p-10 lg:col-span-7 lg:p-12">
                  <div
                      className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl"
                      aria-hidden="true"
                  />

                  <div className="relative">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-300">
                      After publishing
                    </p>

                    <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                      Your listing should remain manageable—not disappear into
                      a black box.
                    </h2>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                      Propyours already includes a management area for owner
                      listings, with editing, removal and plan-aware analytics
                      controls.
                    </p>

                    <div className="mt-9 space-y-3">
                      {[
                        {
                          title: "Review your published properties",
                          description:
                              "See your listings together from the management page.",
                          icon: Building2,
                        },
                        {
                          title: "Edit or remove a listing",
                          description:
                              "Update incorrect information or remove a property when needed.",
                          icon: Edit3,
                        },
                        {
                          title: "Open plan-aware analytics",
                          description:
                              "Gold and Platinum plans include different levels of listing performance data.",
                          icon: BarChart3,
                        },
                      ].map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4"
                            >
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-teal-300">
                            <Icon size={20} aria-hidden="true" />
                          </span>

                              <div>
                                <h3 className="font-black text-white">
                                  {item.title}
                                </h3>
                                <p className="mt-1.5 text-sm leading-6 text-slate-400">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                        );
                      })}
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Link
                          href="/manage-properties"
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-teal-200"
                      >
                        Manage properties
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>

                      <Link
                          href="/post-property"
                          className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-black text-white transition hover:bg-white/10"
                      >
                        Create another listing
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-[linear-gradient(145deg,#0f766e_0%,#0d9488_58%,#115e59_100%)] p-7 sm:p-10 lg:col-span-5 lg:p-12">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-100">
                    Owner dashboard preview
                  </p>

                  <div className="mt-7 rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <p className="text-sm font-black">My properties</p>
                        <p className="mt-1 text-xs text-teal-50/70">
                          Listing management
                        </p>
                      </div>

                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary">
                      <LayoutDashboard size={18} aria-hidden="true" />
                    </span>
                    </div>

                    <div className="mt-4 rounded-2xl bg-white p-4 text-slate-950">
                      <div className="flex gap-3">
                        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                          <Image
                              src="/sell-hero.png"
                              alt=""
                              fill
                              sizes="96px"
                              className="object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="h-4 w-4/5 rounded bg-slate-200" />
                          <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
                          <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-700">
                          Active listing
                        </span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {[
                          { label: "Views", icon: Eye },
                          { label: "Calls", icon: PhoneCall },
                          { label: "Saves", icon: MessageSquareText },
                        ].map((item) => {
                          const Icon = item.icon;

                          return (
                              <div
                                  key={item.label}
                                  className="rounded-xl bg-slate-50 p-3 text-center"
                              >
                                <Icon
                                    size={15}
                                    className="mx-auto text-primary"
                                    aria-hidden="true"
                                />
                                <p className="mt-2 text-[9px] font-black uppercase tracking-wide text-slate-400">
                                  {item.label}
                                </p>
                              </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-black text-slate-700">
                          <Edit3 size={14} aria-hidden="true" />
                          Edit
                        </div>
                        <div className="flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 text-xs font-black text-white">
                          <BarChart3 size={14} aria-hidden="true" />
                          Analytics
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
                    <CheckCircle2
                        size={19}
                        className="mt-0.5 shrink-0 text-teal-100"
                        aria-hidden="true"
                    />
                    <p className="text-sm leading-6 text-teal-50/85">
                      Analytics availability depends on the selected owner plan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="border-t border-slate-200 bg-[#f7faf9]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8 lg:py-24">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                Before you begin
              </p>

              <h2 className="mt-3 font-heading text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                Common owner questions.
              </h2>

              <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
                Straight answers based on the current listing form, plan catalog
                and property-management workflow.
              </p>

              <Link
                  href="/post-property"
                  className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark"
              >
                Post for free
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, index) => (
                  <details
                      key={faq.question}
                      className="group rounded-2xl border border-slate-200 bg-white shadow-sm"
                      open={index === 0}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 font-black text-slate-950 sm:px-6">
                      {faq.question}
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-primary transition group-open:rotate-90">
                    <ChevronRight size={17} aria-hidden="true" />
                  </span>
                    </summary>

                    <p className="px-5 pb-5 pr-16 text-sm leading-7 text-slate-600 sm:px-6 sm:pb-6 sm:pr-20">
                      {faq.answer}
                    </p>
                  </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(120deg,#0f766e_0%,#0d9488_56%,#115e59_100%)] px-6 py-9 text-white shadow-[0_24px_70px_rgba(13,148,136,0.22)] sm:px-10 sm:py-10">
              <div
                  className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full border-[45px] border-white/5"
                  aria-hidden="true"
              />

              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex max-w-2xl items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/15">
                  <Home size={22} aria-hidden="true" />
                </span>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-100">
                      Ready when you are
                    </p>

                    <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                      Turn the property details into a clear public listing.
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-teal-50/85">
                      Begin with the free Silver plan or review the paid options
                      before opening the posting flow.
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  <Link
                      href="/pricing"
                      className="inline-flex h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-black text-white transition hover:bg-white/15"
                  >
                    Review plans
                  </Link>

                  <Link
                      href="/post-property"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-black text-slate-950 shadow-lg transition hover:bg-teal-50"
                  >
                    Post your property
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
  );
}
