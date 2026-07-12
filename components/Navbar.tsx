"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  CircleUserRound,
  Gauge,
  Heart,
  Home as HomeIcon,
  LogIn,
  LogOut,
  Menu,
  Plus,
  Settings2,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  clearStoredUser,
  getStoredUser,
  type PlanStatus,
  type PlanTier,
  type StoredUser,
} from "@/lib/browser-user";

interface NavigationItem {
  label: string;
  href: string;
}

interface AccountItem {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
}

interface PlanMeta {
  label: string;
  statusLabel: string;
  badgeClassName: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "Buy", href: "/buy" },
  { label: "Sell", href: "/sell" },
  { label: "Builders", href: "/builders" },
  { label: "Pricing", href: "/pricing" },
];

const ACCOUNT_ITEMS: AccountItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    description: "Account overview and activity",
    icon: Gauge,
  },
  {
    label: "Manage properties",
    href: "/manage-properties",
    description: "Edit listings and view performance",
    icon: Building2,
  },
  {
    label: "Saved properties",
    href: "/favorites",
    description: "Return to your shortlist",
    icon: Heart,
  },
];

const PLAN_LABELS: Record<PlanTier, string> = {
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  "builder-starter": "Builder Starter",
  "builder-growth": "Builder Growth",
  "builder-elite": "Builder Elite",
};

const STATUS_LABELS: Record<PlanStatus, string> = {
  free: "Free plan",
  active: "Active",
  expired: "Expired",
  cancelled: "Cancelled",
};

function getUserId(user: StoredUser | null): string | null {
  return user?.id ?? user?._id ?? null;
}

function getInitials(user: StoredUser): string {
  const source =
      user.name?.trim() ||
      user.company?.trim() ||
      "User";

  return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
}

function getPlanMeta(user: StoredUser): PlanMeta {
  const tier = user.plan?.tier ?? "silver";
  const status = user.plan?.status ?? "free";

  let badgeClassName =
      "border-slate-200 bg-slate-100 text-slate-700";

  if (status === "expired" || status === "cancelled") {
    badgeClassName =
        "border-red-100 bg-red-50 text-red-700";
  } else if (tier === "platinum" || tier === "builder-elite") {
    badgeClassName =
        "border-slate-800 bg-slate-950 text-white";
  } else if (tier === "gold" || tier === "builder-growth") {
    badgeClassName =
        "border-amber-200 bg-amber-100 text-amber-800";
  } else if (tier === "builder-starter") {
    badgeClassName =
        "border-teal-100 bg-teal-50 text-primary";
  }

  return {
    label: PLAN_LABELS[tier] ?? "Silver",
    statusLabel: STATUS_LABELS[status],
    badgeClassName,
  };
}

function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const planMeta = useMemo(
      () => (user ? getPlanMeta(user) : null),
      [user],
  );

  const userId = getUserId(user);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 12);
    }

    function syncUser() {
      setUser(getStoredUser());
    }

    handleScroll();
    syncUser();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    window.addEventListener("storage", syncUser);
    window.addEventListener("focus", syncUser);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("focus", syncUser);
    };
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!profileOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
          accountMenuRef.current &&
          !accountMenuRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearStoredUser();
      setUser(null);
      setProfileOpen(false);
      setMobileMenuOpen(false);
      setLoggingOut(false);

      router.push("/");
      router.refresh();
    }
  }

  function closeMenus() {
    setProfileOpen(false);
    setMobileMenuOpen(false);
  }

  return (
      <>
        <header className="pointer-events-none fixed inset-x-0 top-0 z-[1000] px-3 pt-3 sm:px-4">
          <nav
              aria-label="Primary navigation"
              className={`pointer-events-auto mx-auto flex h-16 max-w-[1480px] items-center rounded-2xl border px-3 transition-all duration-300 sm:px-4 lg:px-5 ${
                  scrolled
                      ? "border-slate-200/90 bg-white/95 shadow-[0_14px_45px_rgba(15,23,42,0.11)] backdrop-blur-xl"
                      : "border-white/70 bg-white/88 shadow-[0_8px_30px_rgba(15,23,42,0.07)] backdrop-blur-xl"
              }`}
          >
            <div className="flex min-w-0 flex-1 items-center">
              <Link
                  href="/"
                  onClick={closeMenus}
                  className="group flex shrink-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
                  aria-label="PropYours home"
              >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:-rotate-3 group-hover:scale-[1.03]">
                <HomeIcon
                    size={20}
                    strokeWidth={2.4}
                    aria-hidden="true"
                />
              </span>

                <span className="hidden leading-none sm:block">
                <span className="block font-heading text-lg font-black tracking-[-0.03em] text-primary-dark sm:text-xl">
                  PROPYOURS
                </span>
                <span className="mt-1 hidden text-[7px] font-black uppercase tracking-[0.22em] text-slate-400 sm:block">
                  Property marketplace
                </span>
              </span>
              </Link>

              <div className="ml-auto hidden items-center lg:flex">
                <div className="flex items-center rounded-xl border border-slate-200/80 bg-slate-50/80 p-1">
                  {NAVIGATION_ITEMS.map((item) => {
                    const active = isRouteActive(pathname, item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={`relative rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                                active
                                    ? "bg-white text-primary shadow-sm ring-1 ring-slate-200/80"
                                    : "text-slate-600 hover:bg-white/70 hover:text-slate-950"
                            }`}
                        >
                          {item.label}

                          {active ? (
                              <motion.span
                                  layoutId="navbar-active-link"
                                  className="absolute inset-x-4 -bottom-[5px] h-0.5 rounded-full bg-primary"
                              />
                          ) : null}
                        </Link>
                    );
                  })}

                  <span
                      title="Designers directory is coming soon"
                      className="ml-0.5 inline-flex cursor-default items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-400"
                  >
                  Designers
                  <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wide text-slate-500">
                    Soon
                  </span>
                </span>
                </div>
              </div>
            </div>

            <div className="ml-3 hidden shrink-0 items-center gap-2 lg:flex">
              {!user ? (
                  <Link
                      href="/login"
                      className="inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-black text-slate-700 transition hover:bg-slate-100 hover:text-primary"
                  >
                    <LogIn size={16} aria-hidden="true" />
                    Sign in
                  </Link>
              ) : (
                  <div ref={accountMenuRef} className="relative">
                    <button
                        type="button"
                        onClick={() =>
                            setProfileOpen((current) => !current)
                        }
                        aria-haspopup="menu"
                        aria-expanded={profileOpen}
                        className={`flex h-11 max-w-[245px] items-center gap-2.5 rounded-xl border px-2.5 pr-3 text-left transition ${
                            profileOpen
                                ? "border-primary/30 bg-teal-50 ring-4 ring-primary/10"
                                : "border-slate-200 bg-white hover:border-teal-200 hover:bg-teal-50/50"
                        }`}
                    >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-black text-primary">
                    {getInitials(user)}
                  </span>

                      <span className="min-w-0">
                    <span className="block truncate text-xs font-black text-slate-950">
                      {user.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[8px] font-black uppercase tracking-[0.11em] text-primary">
                      {planMeta?.label}
                    </span>
                  </span>

                      <ChevronDown
                          size={14}
                          className={`ml-1 shrink-0 text-slate-400 transition-transform ${
                              profileOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                      />
                    </button>

                    <AnimatePresence>
                      {profileOpen ? (
                          <AccountMenu
                              user={user}
                              userId={userId}
                              planMeta={planMeta}
                              loggingOut={loggingOut}
                              onClose={() => setProfileOpen(false)}
                              onLogout={() => void handleLogout()}
                          />
                      ) : null}
                    </AnimatePresence>
                  </div>
              )}

              <Link
                  href="/post-property"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-xl"
              >
                <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
                List property
              </Link>
            </div>

            <div className="ml-auto flex items-center gap-2 lg:hidden">
              <Link
                  href="/post-property"
                  onClick={closeMenus}
                  className="hidden h-10 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-black text-white shadow-md shadow-primary/15 sm:inline-flex"
              >
                <Plus size={14} strokeWidth={2.5} aria-hidden="true" />
                List
              </Link>

              <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    setMobileMenuOpen((current) => !current);
                  }}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-navigation"
                  aria-label={
                    mobileMenuOpen
                        ? "Close navigation menu"
                        : "Open navigation menu"
                  }
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                      mobileMenuOpen
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-700"
                  }`}
              >
                {mobileMenuOpen ? (
                    <X size={19} aria-hidden="true" />
                ) : (
                    <Menu size={19} aria-hidden="true" />
                )}
              </button>
            </div>
          </nav>
        </header>

        <AnimatePresence>
          {mobileMenuOpen ? (
              <MobileNavigation
                  pathname={pathname}
                  user={user}
                  userId={userId}
                  planMeta={planMeta}
                  loggingOut={loggingOut}
                  onClose={() => setMobileMenuOpen(false)}
                  onLogout={() => void handleLogout()}
              />
          ) : null}
        </AnimatePresence>
      </>
  );
}

function AccountMenu({
                       user,
                       userId,
                       planMeta,
                       loggingOut,
                       onClose,
                       onLogout,
                     }: {
  user: StoredUser;
  userId: string | null;
  planMeta: PlanMeta | null;
  loggingOut: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
      <motion.div
          role="menu"
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.16 }}
          className="absolute right-0 top-[calc(100%+12px)] w-[340px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]"
      >
        <div className="relative overflow-hidden bg-slate-950 p-5 text-white">
          <div
              className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-teal-500/20 blur-3xl"
              aria-hidden="true"
          />

          <div className="relative flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sm font-black text-teal-300 ring-1 ring-white/10">
            {getInitials(user)}
          </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black">{user.name}</p>
              <p className="mt-1 truncate text-xs text-slate-400">
                {user.email}
              </p>

              {user.company ? (
                  <p className="mt-1 truncate text-[10px] font-bold text-slate-500">
                    {user.company}
                  </p>
              ) : null}
            </div>

            {userId ? (
                <Link
                    href={`/profile/${userId}`}
                    onClick={onClose}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-slate-300 transition hover:bg-white hover:text-slate-950"
                    aria-label="View profile"
                >
                  <CircleUserRound size={17} aria-hidden="true" />
                </Link>
            ) : null}
          </div>
        </div>

        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">
                Current plan
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                  className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${planMeta?.badgeClassName}`}
              >
                {planMeta?.label}
              </span>

                <span className="text-[10px] font-bold text-slate-500">
                {planMeta?.statusLabel}
              </span>
              </div>
            </div>

            <Link
                href="/pricing"
                onClick={onClose}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-[10px] font-black text-primary shadow-sm ring-1 ring-slate-200 transition hover:ring-primary/30"
            >
              <Sparkles size={13} aria-hidden="true" />
              Plans
            </Link>
          </div>
        </div>

        <div className="p-2">
          {ACCOUNT_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
                <Link
                    key={item.href}
                    role="menuitem"
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-teal-50"
                >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition group-hover:bg-white group-hover:text-primary group-hover:shadow-sm">
                <Icon size={17} aria-hidden="true" />
              </span>

                  <span>
                <span className="block text-xs font-black text-slate-900">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[10px] text-slate-500">
                  {item.description}
                </span>
              </span>
                </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3">
          {userId ? (
              <Link
                  href={`/profile/${userId}`}
                  onClick={onClose}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[10px] font-black text-slate-700 transition hover:border-primary hover:text-primary"
              >
                <Settings2 size={14} aria-hidden="true" />
                Profile
              </Link>
          ) : (
              <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[10px] font-black text-slate-700"
              >
                <Gauge size={14} aria-hidden="true" />
                Dashboard
              </Link>
          )}

          <button
              type="button"
              role="menuitem"
              onClick={onLogout}
              disabled={loggingOut}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-50 text-[10px] font-black text-red-600 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
          >
            <LogOut size={14} aria-hidden="true" />
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </motion.div>
  );
}

function MobileNavigation({
                            pathname,
                            user,
                            userId,
                            planMeta,
                            loggingOut,
                            onClose,
                            onLogout,
                          }: {
  pathname: string;
  user: StoredUser | null;
  userId: string | null;
  planMeta: PlanMeta | null;
  loggingOut: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
      <div className="fixed inset-0 z-[999] lg:hidden">
        <motion.button
            type="button"
            aria-label="Close navigation menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        />

        <motion.aside
            id="mobile-navigation"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 330,
              damping: 34,
            }}
            className="absolute bottom-0 right-0 top-0 flex w-[min(91vw,420px)] flex-col bg-[#f7f9f8] shadow-[-25px_0_80px_rgba(15,23,42,0.25)]"
        >
          <div className="flex h-[82px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 pt-3">
            <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <HomeIcon size={19} aria-hidden="true" />
            </span>

              <span>
              <span className="block font-heading text-lg font-black tracking-[-0.03em] text-primary-dark">
                PROPYOURS
              </span>
              <span className="mt-0.5 block text-[7px] font-black uppercase tracking-[0.2em] text-slate-400">
                Property marketplace
              </span>
            </span>
            </Link>

            <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
                aria-label="Close navigation"
            >
              <X size={19} aria-hidden="true" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
            {user ? (
                <div className="relative overflow-hidden rounded-[1.5rem] bg-slate-950 p-5 text-white">
                  <div
                      className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-teal-500/20 blur-3xl"
                      aria-hidden="true"
                  />

                  <div className="relative flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sm font-black text-teal-300 ring-1 ring-white/10">
                  {getInitials(user)}
                </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">{user.name}</p>
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {user.email}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                        className={`rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-wide ${planMeta?.badgeClassName}`}
                    >
                      {planMeta?.label}
                    </span>
                        <span className="text-[9px] font-bold text-slate-500">
                      {planMeta?.statusLabel}
                    </span>
                      </div>
                    </div>
                  </div>
                </div>
            ) : (
                <div className="rounded-[1.5rem] border border-teal-100 bg-teal-50 p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                <CircleUserRound size={20} aria-hidden="true" />
              </span>

                  <h2 className="mt-4 text-lg font-black text-slate-950">
                    Welcome to PropYours
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    Sign in to save properties, contact owners and manage listings.
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                        href="/login"
                        onClick={onClose}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-primary text-xs font-black text-white"
                    >
                      Sign in
                    </Link>
                    <Link
                        href="/signup"
                        onClick={onClose}
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-teal-200 bg-white text-xs font-black text-primary"
                    >
                      Create account
                    </Link>
                  </div>
                </div>
            )}

            <div className="mt-6">
              <p className="px-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                Explore
              </p>

              <div className="mt-2 space-y-1">
                {NAVIGATION_ITEMS.map((item) => {
                  const active = isRouteActive(pathname, item.href);

                  return (
                      <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-h-14 items-center justify-between rounded-xl px-4 text-sm font-black transition ${
                              active
                                  ? "bg-primary text-white shadow-lg shadow-primary/15"
                                  : "text-slate-700 hover:bg-white"
                          }`}
                      >
                        {item.label}
                        <ArrowRight
                            size={15}
                            className={active ? "text-white" : "text-slate-300"}
                            aria-hidden="true"
                        />
                      </Link>
                  );
                })}

                <div className="flex min-h-14 items-center justify-between rounded-xl px-4 text-sm font-black text-slate-400">
                  <span>Designers</span>
                  <span className="rounded-full bg-slate-200 px-2 py-1 text-[8px] font-black uppercase tracking-wide text-slate-500">
                  Coming soon
                </span>
                </div>
              </div>
            </div>

            {user ? (
                <div className="mt-6">
                  <p className="px-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Your account
                  </p>

                  <div className="mt-2 grid gap-2">
                    {ACCOUNT_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const active = isRouteActive(pathname, item.href);

                      return (
                          <Link
                              key={item.href}
                              href={item.href}
                              onClick={onClose}
                              className={`flex items-center gap-3 rounded-xl border p-3.5 ${
                                  active
                                      ? "border-teal-200 bg-teal-50"
                                      : "border-slate-200 bg-white"
                              }`}
                          >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-primary">
                        <Icon size={17} aria-hidden="true" />
                      </span>

                            <span>
                        <span className="block text-xs font-black text-slate-950">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-[9px] text-slate-500">
                          {item.description}
                        </span>
                      </span>
                          </Link>
                      );
                    })}

                    {userId ? (
                        <Link
                            href={`/profile/${userId}`}
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5"
                        >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-primary">
                      <CircleUserRound size={17} aria-hidden="true" />
                    </span>
                          <span>
                      <span className="block text-xs font-black text-slate-950">
                        Public profile
                      </span>
                      <span className="mt-0.5 block text-[9px] text-slate-500">
                        View your profile page
                      </span>
                    </span>
                        </Link>
                    ) : null}
                  </div>
                </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white p-4">
            <Link
                href="/post-property"
                onClick={onClose}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/20"
            >
              <Plus size={17} aria-hidden="true" />
              List your property
            </Link>

            {user ? (
                <button
                    type="button"
                    onClick={onLogout}
                    disabled={loggingOut}
                    className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-black text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                >
                  <LogOut size={15} aria-hidden="true" />
                  {loggingOut ? "Signing out…" : "Sign out"}
                </button>
            ) : null}
          </div>
        </motion.aside>
      </div>
  );
}
