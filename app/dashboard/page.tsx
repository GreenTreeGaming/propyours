"use client";

import Image from "next/image";
import Link from "next/link";
import {
    FormEvent,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    AlertTriangle,
    ArrowRight,
    BadgeCheck,
    BarChart3,
    Building2,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Edit3,
    Eye,
    FileText,
    Heart,
    Home,
    KeyRound,
    LayoutDashboard,
    Loader2,
    LockKeyhole,
    LogOut,
    Mail,
    MapPin,
    Phone,
    PhoneCall,
    Plus,
    RefreshCw,
    Save,
    Settings,
    ShieldCheck,
    Sparkles,
    Trash2,
    UserRound,
    X,
    type LucideIcon,
} from "lucide-react";

import {
    PLAN_CATALOG,
    type PlanDefinition,
    type PlanStatus,
    type PlanTier,
} from "@/lib/plan-catalog";
import {
    clearStoredUser,
    getStoredUser,
} from "@/lib/browser-user";

type DashboardTab = "overview" | "profile" | "plan" | "security";
type ToastState = { type: "success" | "error"; message: string };

interface DashboardUser {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    bio?: string;
    company?: string;
    address?: string;
    city?: string;
    createdAt?: string;
    plan?: {
        audience?: "owner" | "builder";
        tier?: PlanTier;
        status?: PlanStatus;
        startedAt?: string;
        expiresAt?: string;
        boostsRemaining?: number;
        boostsResetAt?: string;
    };
}

interface DashboardProperty {
    _id: string;
    address: string;
    locality?: string;
    city: string;
    propertyType: string;
    price: number;
    images?: string[];
    purpose?: string;
    status?: "active" | "sold" | "inactive";
    listingExpiresAt?: string;
    analytics?: {
        views?: number;
        phoneClicks?: number;
        favoritesCount?: number;
    };
}

interface PlanSummary {
    tier: PlanTier;
    status?: PlanStatus;
    boostsRemaining: number;
    boostsPerMonth: number;
    boostsResetAt: string | null;
}

interface ProfileForm {
    name: string;
    email: string;
    bio: string;
    company: string;
    address: string;
    city: string;
}

const NAV_ITEMS: Array<{
    id: DashboardTab;
    label: string;
    description: string;
    icon: LucideIcon;
}> = [
    {
        id: "overview",
        label: "Overview",
        description: "Activity and next steps",
        icon: LayoutDashboard,
    },
    {
        id: "profile",
        label: "Profile",
        description: "Personal and business details",
        icon: UserRound,
    },
    {
        id: "plan",
        label: "Plan & usage",
        description: "Limits and visibility",
        icon: Sparkles,
    },
    {
        id: "security",
        label: "Security",
        description: "Password and account controls",
        icon: ShieldCheck,
    },
];

const FALLBACK_IMAGE = "/house1.jpeg";

function isPlanTier(value: unknown): value is PlanTier {
    return (
        typeof value === "string" &&
        Object.prototype.hasOwnProperty.call(PLAN_CATALOG, value)
    );
}

function userId(user: DashboardUser): string {
    return user._id || user.id || "";
}

function formatCompact(value: number): string {
    return new Intl.NumberFormat("en-IN", {
        notation: value >= 1_000 ? "compact" : "standard",
        maximumFractionDigits: 1,
    }).format(value);
}

function formatPrice(value: number): string {
    if (value >= 10_000_000) {
        const amount = value / 10_000_000;
        return `₹${amount.toFixed(Number.isInteger(amount) ? 0 : 2)} Cr`;
    }

    if (value >= 100_000) {
        const amount = value / 100_000;
        return `₹${amount.toFixed(Number.isInteger(amount) ? 0 : 1)} L`;
    }

    return `₹${value.toLocaleString("en-IN")}`;
}

function formatPlanPrice(plan: PlanDefinition): string {
    if (plan.presentation.priceInPaise === 0) return "Free";

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(plan.presentation.priceInPaise / 100);
}

function billingLabel(plan: PlanDefinition): string {
    if (plan.presentation.priceInPaise === 0) return "No recurring charge";
    return plan.audience === "owner" ? "per month" : "per year";
}

function formatDate(value?: string | null, fallback = "Not available"): string {
    if (!value) return fallback;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

function daysUntil(value?: string | null): number | null {
    if (!value) return null;

    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) return null;

    return Math.ceil((timestamp - Date.now()) / 86_400_000);
}

function statusLabel(status?: PlanStatus): string {
    if (status === "active") return "Active";
    if (status === "expired") return "Expired";
    if (status === "cancelled") return "Cancelled";
    return "Free plan";
}

function statusClass(status?: PlanStatus): string {
    if (status === "active") return "bg-emerald-100 text-emerald-700";
    if (status === "expired") return "bg-amber-100 text-amber-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-600";
}

function listingStatus(property: DashboardProperty) {
    const remaining = daysUntil(property.listingExpiresAt);

    if (remaining !== null && remaining < 0) {
        return { label: "Expired", className: "bg-amber-100 text-amber-700" };
    }

    if (property.status === "sold") {
        return { label: "Sold", className: "bg-blue-100 text-blue-700" };
    }

    if (property.status === "inactive") {
        return { label: "Inactive", className: "bg-slate-100 text-slate-600" };
    }

    return { label: "Active", className: "bg-emerald-100 text-emerald-700" };
}

function getCurrentPlan(
    user: DashboardUser,
    summary: PlanSummary | null,
): PlanDefinition {
    const tier = summary?.tier ?? user.plan?.tier;
    return isPlanTier(tier) ? PLAN_CATALOG[tier] : PLAN_CATALOG.silver;
}

function profileCompletion(user: DashboardUser) {
    const fields = [
        user.name,
        user.email,
        user.phone,
        user.city,
        user.company,
        user.bio,
    ];

    const complete = fields.filter(
        (value) => typeof value === "string" && value.trim().length > 0,
    ).length;

    return {
        complete,
        total: fields.length,
        percentage: Math.round((complete / fields.length) * 100),
    };
}

function Avatar({
                    user,
                    small = false,
                }: {
    user: DashboardUser;
    small?: boolean;
}) {
    const initials = user.name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

    return (
        <div
            className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-teal-700 to-slate-950 text-white shadow-xl ${
                small
                    ? "h-11 w-11 rounded-xl text-sm"
                    : "h-20 w-20 rounded-[1.5rem] text-2xl"
            }`}
            aria-hidden="true"
        >
            <div className="absolute -right-4 -top-5 h-16 w-16 rounded-full border-[12px] border-white/5" />
            <span className="relative font-black tracking-[-0.05em]">
        {initials || "PY"}
      </span>
        </div>
    );
}

function ProgressBar({
                         value,
                         max,
                         dark = false,
                     }: {
    value: number;
    max: number;
    dark?: boolean;
}) {
    const percent = Math.min(100, Math.max(0, (value / Math.max(max, 1)) * 100));

    return (
        <div className={`h-2 overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-slate-100"}`}>
            <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${percent}%` }}
            />
        </div>
    );
}

function MetricCard({
                        label,
                        value,
                        description,
                        icon: Icon,
                        dark = false,
                    }: {
    label: string;
    value: string;
    description: string;
    icon: LucideIcon;
    dark?: boolean;
}) {
    return (
        <article
            className={`relative overflow-hidden rounded-[1.5rem] border p-5 shadow-sm ${
                dark
                    ? "border-slate-900 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-950"
            }`}
        >
            {dark ? (
                <div
                    className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-teal-500/20 blur-3xl"
                    aria-hidden="true"
                />
            ) : null}

            <div className="relative flex items-start justify-between">
        <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                dark
                    ? "bg-white/10 text-teal-300 ring-1 ring-white/10"
                    : "bg-teal-50 text-primary"
            }`}
        >
          <Icon size={20} aria-hidden="true" />
        </span>
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
          Live
        </span>
            </div>

            <p className="relative mt-6 text-3xl font-black tracking-tight">{value}</p>
            <p className="relative mt-1 text-sm font-black">{label}</p>
            <p className={`relative mt-2 text-xs leading-5 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                {description}
            </p>
        </article>
    );
}

function PropertyRow({
                         property,
                     }: {
    property: DashboardProperty;
}) {
    const state = listingStatus(property);
    const remaining = daysUntil(
        property.listingExpiresAt,
    );

    return (
        <Link
            href={`/property/${property._id}`}
            className="group grid overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:border-teal-200 hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)] sm:grid-cols-[150px_minmax(0,1fr)_auto]"
        >
            <div className="relative min-h-48 overflow-hidden bg-slate-100 sm:min-h-[138px]">
                <Image
                    src={
                        property.images?.[0] ||
                        FALLBACK_IMAGE
                    }
                    alt={property.address}
                    fill
                    sizes="(max-width: 640px) 100vw, 150px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />

                <span
                    className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${state.className}`}
                >
          {state.label}
        </span>
            </div>

            <div className="min-w-0 p-4 sm:py-5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <MapPin
                        size={14}
                        className="shrink-0"
                        aria-hidden="true"
                    />

                    <span className="truncate">
            {property.locality
                ? `${property.locality}, ${property.city}`
                : property.city}
          </span>
                </div>

                <h3 className="mt-2 line-clamp-1 text-base font-black text-slate-950 transition group-hover:text-primary">
                    {property.address}
                </h3>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                    {property.propertyType}
                    {property.purpose
                        ? ` · ${property.purpose}`
                        : ""}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="text-base font-black text-slate-950">
            {formatPrice(property.price)}
          </span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Eye size={14} aria-hidden="true" />
                        {formatCompact(
                            property.analytics?.views ?? 0,
                        )}{" "}
                        views
          </span>

                    {remaining !== null ? (
                        <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                                remaining <= 7
                                    ? "text-amber-700"
                                    : "text-slate-500"
                            }`}
                        >
              <Clock3
                  size={14}
                  aria-hidden="true"
              />

                            {remaining < 0
                                ? "Expired"
                                : `${remaining} days left`}
            </span>
                    ) : null}
                </div>
            </div>

            <div className="hidden items-center border-l border-slate-100 px-5 sm:flex">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-primary transition group-hover:bg-primary group-hover:text-white">
          <ArrowRight
              size={17}
              aria-hidden="true"
          />
        </span>
            </div>
        </Link>
    );
}

function LoadingScreen() {
    return (
        <main className="min-h-screen bg-[#f5f7f6] pb-20 pt-24">
            <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                <div className="h-44 animate-pulse rounded-[2rem] bg-slate-200" />
                <div className="mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <div className="h-[620px] animate-pulse rounded-[2rem] bg-white" />
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-48 animate-pulse rounded-[1.5rem] bg-white" />
                            ))}
                        </div>
                        <div className="h-[520px] animate-pulse rounded-[2rem] bg-white" />
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
    const [user, setUser] = useState<DashboardUser | null>(null);
    const [properties, setProperties] = useState<DashboardProperty[]>([]);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [planSummary, setPlanSummary] = useState<PlanSummary | null>(null);

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [loadWarning, setLoadWarning] = useState("");

    const [profile, setProfile] = useState<ProfileForm>({
        name: "",
        email: "",
        bio: "",
        company: "",
        address: "",
        city: "",
    });
    const [savingProfile, setSavingProfile] = useState(false);

    const [passwordOpen, setPasswordOpen] = useState(false);
    const [passwords, setPasswords] = useState({
        current: "",
        next: "",
        confirm: "",
    });
    const [passwordError, setPasswordError] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteText, setDeleteText] = useState("");
    const [deletePassword, setDeletePassword] =
        useState("");
    const [deleting, setDeleting] = useState(false);

    const [toast, setToast] = useState<ToastState | null>(null);

    const notify = useCallback((type: ToastState["type"], message: string) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ type, message });
        toastTimer.current = setTimeout(() => setToast(null), 4000);
    }, []);

    useEffect(
        () => () => {
            if (toastTimer.current) clearTimeout(toastTimer.current);
        },
        [],
    );

    const setProfileFromUser = useCallback((nextUser: DashboardUser) => {
        setProfile({
            name: nextUser.name || "",
            email: nextUser.email || "",
            bio: nextUser.bio || "",
            company: nextUser.company || "",
            address: nextUser.address || "",
            city: nextUser.city || "",
        });
    }, []);

    const loadDashboard = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true);
            setLoadError("");
            setLoadWarning("");

            const stored = getStoredUser();
            const storedId = stored?._id || stored?.id;

            if (!storedId) {
                router.replace("/login?redirect=/dashboard");
                return;
            }

            try {
                const profileResponse = await fetch(`/api/user/${storedId}`, {
                    credentials: "include",
                    cache: "no-store",
                    signal,
                });

                if (profileResponse.status === 401 || profileResponse.status === 403) {
                    clearStoredUser();
                    router.replace("/login?redirect=/dashboard");
                    return;
                }

                const profilePayload: unknown = await profileResponse.json();

                if (!profileResponse.ok) {
                    const message =
                        typeof profilePayload === "object" &&
                        profilePayload !== null &&
                        "error" in profilePayload &&
                        typeof profilePayload.error === "string"
                            ? profilePayload.error
                            : "Unable to load your account.";

                    throw new Error(message);
                }

                const freshUser = profilePayload as DashboardUser;
                const freshId = userId(freshUser);

                setUser(freshUser);
                setProfileFromUser(freshUser);
                localStorage.setItem("user", JSON.stringify(freshUser));

                const results = await Promise.allSettled([
                    fetch(`/api/property/user/${freshId}`, {
                        credentials: "include",
                        cache: "no-store",
                        signal,
                    }),
                    fetch(`/api/user/${freshId}/favorites`, {
                        credentials: "include",
                        cache: "no-store",
                        signal,
                    }),
                    fetch("/api/account/plan", {
                        credentials: "include",
                        cache: "no-store",
                        signal,
                    }),
                ]);

                const failures: string[] = [];

                if (results[0].status === "fulfilled") {
                    const payload: unknown = await results[0].value.json();
                    if (results[0].value.ok && Array.isArray(payload)) {
                        setProperties(payload as DashboardProperty[]);
                    } else {
                        setProperties([]);
                        failures.push("listings");
                    }
                } else {
                    setProperties([]);
                    failures.push("listings");
                }

                if (results[1].status === "fulfilled") {
                    const payload: unknown = await results[1].value.json();
                    if (results[1].value.ok && Array.isArray(payload)) {
                        setFavoriteCount(payload.length);
                    } else {
                        setFavoriteCount(0);
                        failures.push("saved properties");
                    }
                } else {
                    setFavoriteCount(0);
                    failures.push("saved properties");
                }

                if (results[2].status === "fulfilled") {
                    const payload: unknown = await results[2].value.json();

                    if (
                        results[2].value.ok &&
                        typeof payload === "object" &&
                        payload !== null &&
                        "tier" in payload &&
                        isPlanTier(payload.tier)
                    ) {
                        setPlanSummary(payload as PlanSummary);
                    } else {
                        setPlanSummary(null);
                        failures.push("plan usage");
                    }
                } else {
                    setPlanSummary(null);
                    failures.push("plan usage");
                }

                if (failures.length > 0) {
                    setLoadWarning(
                        `Some dashboard data could not be loaded: ${failures.join(", ")}.`,
                    );
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") return;

                console.error("Unable to load dashboard:", error);
                setLoadError(
                    error instanceof Error ? error.message : "Unable to load your dashboard.",
                );
            } finally {
                if (!signal?.aborted) setLoading(false);
            }
        },
        [router, setProfileFromUser],
    );

    useEffect(() => {
        const controller = new AbortController();
        void loadDashboard(controller.signal);
        return () => controller.abort();
    }, [loadDashboard]);

    useEffect(() => {
        if (!passwordOpen && !deleteOpen) return;

        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previous;
        };
    }, [deleteOpen, passwordOpen]);

    const currentPlan = useMemo(
        () => (user ? getCurrentPlan(user, planSummary) : PLAN_CATALOG.silver),
        [planSummary, user],
    );

    const completeness = useMemo(
        () => (user ? profileCompletion(user) : { complete: 0, total: 6, percentage: 0 }),
        [user],
    );

    const metrics = useMemo(() => {
        const active = properties.filter((property) => {
            const remaining = daysUntil(property.listingExpiresAt);
            return (
                property.status !== "sold" &&
                property.status !== "inactive" &&
                (remaining === null || remaining >= 0)
            );
        });

        return {
            active: active.length,
            total: properties.length,
            views: properties.reduce(
                (sum, property) => sum + (property.analytics?.views ?? 0),
                0,
            ),
            calls: properties.reduce(
                (sum, property) => sum + (property.analytics?.phoneClicks ?? 0),
                0,
            ),
            savesReceived: properties.reduce(
                (sum, property) => sum + (property.analytics?.favoritesCount ?? 0),
                0,
            ),
        };
    }, [properties]);

    const expiring = useMemo(
        () =>
            properties.filter((property) => {
                const remaining = daysUntil(property.listingExpiresAt);
                return remaining !== null && remaining >= 0 && remaining <= 7;
            }),
        [properties],
    );

    async function saveProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!user) return;

        const name = profile.name.trim();

        if (!name) {
            notify("error", "Name is required.");
            return;
        }

        setSavingProfile(true);

        try {
            const response = await fetch(`/api/user/${userId(user)}`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    bio: profile.bio.trim(),
                    company: profile.company.trim(),
                    address: profile.address.trim(),
                    city: profile.city.trim(),
                }),
            });

            const payload: unknown = await response.json();

            if (!response.ok) {
                const message =
                    typeof payload === "object" &&
                    payload !== null &&
                    "error" in payload &&
                    typeof payload.error === "string"
                        ? payload.error
                        : "Unable to update your profile.";

                throw new Error(message);
            }

            if (
                typeof payload !== "object" ||
                payload === null ||
                !("user" in payload) ||
                typeof payload.user !== "object" ||
                payload.user === null
            ) {
                throw new Error(
                    "The server returned an invalid profile response.",
                );
            }

            const updated =
                payload.user as DashboardUser;

            setUser(updated);
            setProfileFromUser(updated);
            localStorage.setItem(
                "user",
                JSON.stringify(updated),
            );
            notify("success", "Profile updated successfully.");
        } catch (error) {
            notify(
                "error",
                error instanceof Error ? error.message : "Unable to update your profile.",
            );
        } finally {
            setSavingProfile(false);
        }
    }

    async function changePassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!user) return;

        setPasswordError("");

        if (passwords.next.length < 12) {
            setPasswordError(
                "The new password must be at least 12 characters.",
            );
            return;
        }

        if (passwords.next !== passwords.confirm) {
            setPasswordError("The new passwords do not match.");
            return;
        }

        setSavingPassword(true);

        try {
            const response = await fetch(`/api/user/${userId(user)}`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    oldPassword: passwords.current,
                    newPassword: passwords.next,
                }),
            });

            const payload: unknown = await response.json();

            if (!response.ok) {
                const message =
                    typeof payload === "object" &&
                    payload !== null &&
                    "error" in payload &&
                    typeof payload.error === "string"
                        ? payload.error
                        : "Unable to update your password.";

                throw new Error(message);
            }

            setPasswords({ current: "", next: "", confirm: "" });
            setPasswordOpen(false);
            notify("success", "Password updated successfully.");
        } catch (error) {
            setPasswordError(
                error instanceof Error ? error.message : "Unable to update your password.",
            );
        } finally {
            setSavingPassword(false);
        }
    }

    async function deleteAccount(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (
            !user ||
            deleteText !== "DELETE" ||
            deletePassword.length === 0
        ) {
            return;
        }

        setDeleting(true);

        try {
            const response = await fetch(
                `/api/user/${userId(user)}`,
                {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        currentPassword: deletePassword,
                    }),
                },
            );

            const payload: unknown = await response.json();

            if (!response.ok) {
                const message =
                    typeof payload === "object" &&
                    payload !== null &&
                    "error" in payload &&
                    typeof payload.error === "string"
                        ? payload.error
                        : "Unable to delete your account.";

                throw new Error(message);
            }

            clearStoredUser();
            router.replace("/");
            router.refresh();

            setDeleteText("");
            setDeletePassword("");
        } catch (error) {
            setDeleteOpen(false);
            notify(
                "error",
                error instanceof Error ? error.message : "Unable to delete your account.",
            );
        } finally {
            setDeleting(false);
        }
    }

    async function logout() {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            if (!response.ok) throw new Error("Logout failed.");

            clearStoredUser();
            router.replace("/");
            router.refresh();
        } catch (error) {
            notify("error", error instanceof Error ? error.message : "Unable to sign out.");
        }
    }

    if (loading && !user) return <LoadingScreen />;

    if (loadError || !user) {
        return (
            <main className="min-h-screen bg-[#f5f7f6] pb-20 pt-28">
                <div className="mx-auto max-w-3xl px-5 sm:px-6">
                    <div className="rounded-[2rem] border border-red-100 bg-white p-8 text-center shadow-sm sm:p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertTriangle size={25} aria-hidden="true" />
            </span>
                        <h1 className="mt-6 text-2xl font-black text-slate-950">
                            Your dashboard could not be loaded
                        </h1>
                        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                            {loadError || "The account session is unavailable."}
                        </p>
                        <div className="mt-7 flex flex-wrap justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => void loadDashboard()}
                                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white"
                            >
                                <RefreshCw size={16} aria-hidden="true" />
                                Try again
                            </button>
                            <Link
                                href="/login"
                                className="inline-flex h-12 items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700"
                            >
                                Go to login
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    const planStatus = planSummary?.status ?? user.plan?.status ?? "free";
    const planCapacity = currentPlan.entitlements.activeProperties;
    const usagePercent = Math.min(
        100,
        Math.round((metrics.active / Math.max(planCapacity, 1)) * 100),
    );
    const audienceQuery =
        currentPlan.audience === "builder" ? "?audience=builder" : "";

    return (
        <main className="min-h-screen bg-[#f5f7f6] pb-20 pt-20 font-body text-slate-950">
            <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.15),_transparent_34%),linear-gradient(180deg,#f8fbfa_0%,#ffffff_100%)]">
                <div className="mx-auto max-w-7xl px-5 pb-12 pt-12 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <Avatar user={user} />

                            <div>
                                <h1 className="mt-4 font-heading text-3xl font-black tracking-[-0.035em] sm:text-4xl">
                                    Welcome back, {user.name.split(" ")[0]}.
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                                    Manage your profile, properties, saved listings, plan usage,
                                    and account security from one place.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/manage-properties"
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-primary hover:text-primary"
                            >
                                <Building2 size={17} aria-hidden="true" />
                                Manage listings
                            </Link>
                            <Link
                                href="/post-property"
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-dark"
                            >
                                <Plus size={17} aria-hidden="true" />
                                Post property
                            </Link>
                        </div>
                    </div>

                    <div className="-mx-5 mt-8 overflow-x-auto px-5 pb-1 lg:hidden">
                        <div className="flex min-w-max gap-2">
                            {NAV_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const active = activeTab === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActiveTab(item.id)}
                                        className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-black transition ${
                                            active
                                                ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                                                : "border-slate-200 bg-white text-slate-600"
                                        }`}
                                    >
                                        <Icon size={16} aria-hidden="true" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8 lg:py-12">
                <aside className="hidden lg:block">
                    <div className="sticky top-28 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-5">
                            <div className="flex items-center gap-3">
                                <Avatar user={user} small />
                                <div className="min-w-0">
                                    <p className="truncate font-black">{user.name}</p>
                                    <p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-600">
                  {user.role || "User"}
                </span>
                                <span className="rounded-full bg-teal-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-primary">
                  {currentPlan.presentation.displayName}
                </span>
                            </div>
                        </div>

                        <nav aria-label="Dashboard sections" className="space-y-1 p-3">
                            {NAV_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const active = activeTab === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActiveTab(item.id)}
                                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                                            active
                                                ? "bg-slate-950 text-white shadow-lg"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                                        }`}
                                    >
                    <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            active
                                ? "bg-white/10 text-teal-300"
                                : "bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-primary"
                        }`}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </span>
                                        <span className="min-w-0 flex-1">
                      <span className="block text-sm font-black">{item.label}</span>
                      <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                        {item.description}
                      </span>
                    </span>
                                        <ChevronRight
                                            size={15}
                                            className={active ? "text-teal-300" : "text-slate-300"}
                                            aria-hidden="true"
                                        />
                                    </button>
                                );
                            })}

                            <div className="my-3 h-px bg-slate-100" />

                            <Link
                                href="/favorites"
                                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-black text-slate-600 transition hover:bg-teal-50 hover:text-primary"
                            >
                                <Heart size={18} aria-hidden="true" />
                                Saved properties
                                <span className="ml-auto rounded-full bg-slate-100 px-2 py-1 text-[10px]">
                  {favoriteCount}
                </span>
                            </Link>

                            <Link
                                href={`/pricing${audienceQuery}`}
                                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-black text-slate-600 transition hover:bg-teal-50 hover:text-primary"
                            >
                                <Sparkles size={18} aria-hidden="true" />
                                Compare plans
                            </Link>

                            <button
                                type="button"
                                onClick={() => void logout()}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-black text-red-600 transition hover:bg-red-50"
                            >
                                <LogOut size={18} aria-hidden="true" />
                                Sign out
                            </button>
                        </nav>
                    </div>
                </aside>

                <section className="min-w-0">
                    {loadWarning ? (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                            <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                            <p className="text-sm leading-6">{loadWarning}</p>
                        </div>
                    ) : null}

                    <AnimatePresence mode="wait">
                        {activeTab === "overview" ? (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -14 }}
                                className="space-y-6"
                            >
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    <MetricCard
                                        label="Active listings"
                                        value={String(metrics.active)}
                                        description={`${metrics.total} total properties in your account.`}
                                        icon={Building2}
                                        dark
                                    />
                                    <MetricCard
                                        label="Listing views"
                                        value={formatCompact(metrics.views)}
                                        description="Combined views across your listings."
                                        icon={Eye}
                                    />
                                    <MetricCard
                                        label="Contact actions"
                                        value={formatCompact(metrics.calls)}
                                        description="Phone interactions from listing pages."
                                        icon={PhoneCall}
                                    />
                                    <MetricCard
                                        label="Saved properties"
                                        value={formatCompact(favoriteCount)}
                                        description={`${formatCompact(
                                            metrics.savesReceived,
                                        )} saves received on your listings.`}
                                        icon={Heart}
                                    />
                                </div>

                                {expiring.length > 0 ? (
                                    <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
                        <Clock3 size={19} aria-hidden="true" />
                      </span>
                                            <div>
                                                <p className="font-black text-amber-950">
                                                    {expiring.length} {expiring.length === 1 ? "listing expires" : "listings expire"} within seven days
                                                </p>
                                                <p className="mt-1 text-sm text-amber-800">
                                                    Review the status before it leaves discovery.
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href="/manage-properties"
                                            className="inline-flex shrink-0 items-center gap-2 text-sm font-black text-amber-900"
                                        >
                                            Review listings
                                            <ArrowRight size={16} aria-hidden="true" />
                                        </Link>
                                    </div>
                                ) : null}

                                <div className="grid items-start gap-6 xl:grid-cols-12">
                                    <div className="h-fit rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-8">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                                    Recent properties
                                                </p>
                                                <h2 className="mt-2 text-2xl font-black tracking-tight">
                                                    Your latest listings
                                                </h2>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Review the public property page or open management tools.
                                                </p>
                                            </div>
                                            <Link
                                                href="/manage-properties"
                                                className="inline-flex w-fit items-center gap-2 text-sm font-black text-primary"
                                            >
                                                Manage all
                                                <ArrowRight size={16} aria-hidden="true" />
                                            </Link>
                                        </div>

                                        {properties.length > 0 ? (
                                            <div className="mt-6 space-y-3">
                                                {properties.slice(0, 3).map((property) => (
                                                    <PropertyRow
                                                        key={property._id}
                                                        property={property}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                          <Home size={22} aria-hidden="true" />
                        </span>
                                                <h3 className="mt-5 font-black">No properties listed yet</h3>
                                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                                    Create your first property listing and it will appear here with its status and engagement.
                                                </p>
                                                <Link
                                                    href="/post-property"
                                                    className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white"
                                                >
                                                    Post a property
                                                    <ArrowRight size={16} aria-hidden="true" />
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6 xl:col-span-4">
                                        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
                                            <div
                                                className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-500/20 blur-3xl"
                                                aria-hidden="true"
                                            />
                                            <div className="relative">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-teal-300">
                                                            Current plan
                                                        </p>
                                                        <h2 className="mt-2 text-2xl font-black">
                                                            {currentPlan.presentation.displayName}
                                                        </h2>
                                                    </div>
                                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-teal-300 ring-1 ring-white/10">
                            <Sparkles size={20} aria-hidden="true" />
                          </span>
                                                </div>

                                                <div className="mt-7 flex items-end justify-between gap-4">
                                                    <div>
                                                        <p className="text-3xl font-black">{formatPlanPrice(currentPlan)}</p>
                                                        <p className="mt-1 text-xs text-slate-400">{billingLabel(currentPlan)}</p>
                                                    </div>
                                                    <span
                                                        className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${statusClass(
                                                            planStatus,
                                                        )}`}
                                                    >
                            {statusLabel(planStatus)}
                          </span>
                                                </div>

                                                <div className="mt-7 border-t border-white/10 pt-5">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="font-bold text-slate-400">Active listing usage</span>
                                                        <span className="font-black">
                              {metrics.active} / {planCapacity}
                            </span>
                                                    </div>
                                                    <div className="mt-3">
                                                        <ProgressBar value={metrics.active} max={planCapacity} dark />
                                                    </div>
                                                    <p className="mt-3 text-xs leading-5 text-slate-400">
                                                        {usagePercent >= 100
                                                            ? "Your active-property allowance is currently full."
                                                            : `${100 - usagePercent}% of the active-property allowance remains.`}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab("plan")}
                                                    className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-black text-slate-950 transition hover:bg-teal-200"
                                                >
                                                    View plan & usage
                                                    <ArrowRight size={16} aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                                Quick actions
                                            </p>
                                            <div className="mt-4 space-y-2">
                                                {[
                                                    {
                                                        label: "Post a property",
                                                        description: "Create a new listing",
                                                        icon: Plus,
                                                        href: "/post-property",
                                                    },
                                                    {
                                                        label: "Manage listings",
                                                        description: "Edit, promote or analyse",
                                                        icon: Edit3,
                                                        href: "/manage-properties",
                                                    },
                                                    {
                                                        label: "Saved properties",
                                                        description: `${favoriteCount} saved for later`,
                                                        icon: Heart,
                                                        href: "/favorites",
                                                    },
                                                ].map((action) => {
                                                    const Icon = action.icon;

                                                    return (
                                                        <Link
                                                            key={action.label}
                                                            href={action.href}
                                                            className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-teal-200 hover:bg-teal-50"
                                                        >
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                                <Icon size={18} aria-hidden="true" />
                              </span>
                                                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-black">{action.label}</span>
                                <span className="mt-0.5 block text-xs text-slate-500">
                                  {action.description}
                                </span>
                              </span>
                                                            <ChevronRight
                                                                size={16}
                                                                className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary"
                                                                aria-hidden="true"
                                                            />
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                                Profile readiness
                                            </p>
                                            <h2 className="mt-2 text-2xl font-black tracking-tight">
                                                Build a credible account
                                            </h2>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Complete the details that support your public profile.
                                            </p>
                                        </div>
                                        <div className="min-w-52">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-slate-500">Completion</span>
                                                <span className="font-black text-primary">{completeness.percentage}%</span>
                                            </div>
                                            <div className="mt-3">
                                                <ProgressBar value={completeness.complete} max={completeness.total} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                        {[
                                            {
                                                label: "Profile details",
                                                complete: completeness.percentage >= 80,
                                                action: () => setActiveTab("profile"),
                                                actionLabel: "Edit profile",
                                            },
                                            {
                                                label: "Verified phone",
                                                complete: Boolean(user.phone),
                                                href: "/contact",
                                                actionLabel: "Get help",
                                            },
                                            {
                                                label: "First property",
                                                complete: properties.length > 0,
                                                href: "/post-property",
                                                actionLabel: "Post now",
                                            },
                                            {
                                                label: "Plan capacity",
                                                complete: metrics.active <= planCapacity,
                                                action: () => setActiveTab("plan"),
                                                actionLabel: "View usage",
                                            },
                                        ].map((item) => {
                                            const inner = (
                                                <>
                          <span
                              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                                  item.complete
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-slate-100 text-slate-400"
                              }`}
                          >
                            {item.complete ? (
                                <Check size={16} aria-hidden="true" />
                            ) : (
                                <ChevronRight size={16} aria-hidden="true" />
                            )}
                          </span>
                                                    <span className="mt-4 block text-sm font-black">{item.label}</span>
                                                    <span className="mt-2 block text-xs font-bold text-primary">
                            {item.complete ? "Complete" : item.actionLabel}
                          </span>
                                                </>
                                            );

                                            return item.href ? (
                                                <Link
                                                    key={item.label}
                                                    href={item.href}
                                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-teal-200 hover:bg-teal-50/50"
                                                >
                                                    {inner}
                                                </Link>
                                            ) : (
                                                <button
                                                    key={item.label}
                                                    type="button"
                                                    onClick={item.action}
                                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-teal-200 hover:bg-teal-50/50"
                                                >
                                                    {inner}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        ) : null}

                        {activeTab === "profile" ? (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -14 }}
                                className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
                            >
                                <div className="border-b border-slate-200 p-6 sm:p-8">
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                                Public identity
                                            </p>
                                            <h2 className="mt-2 text-3xl font-black tracking-tight">
                                                Profile information
                                            </h2>
                                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                                Keep the account accurate. Phone numbers remain read-only
                                                because changes require OTP verification.
                                            </p>
                                        </div>
                                        <div className="min-w-48 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-black text-slate-600">Complete</span>
                                                <span className="font-black text-primary">{completeness.percentage}%</span>
                                            </div>
                                            <div className="mt-3">
                                                <ProgressBar value={completeness.complete} max={completeness.total} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={saveProfile} className="p-6 sm:p-8">
                                    <div className="grid gap-6 xl:grid-cols-2">
                                        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 sm:p-6">
                                            <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                          <UserRound size={20} aria-hidden="true" />
                        </span>
                                                <div>
                                                    <h3 className="font-black">Personal details</h3>
                                                    <p className="mt-0.5 text-xs text-slate-500">Name, email and phone.</p>
                                                </div>
                                            </div>

                                            <div className="mt-6 space-y-5">
                                                <FieldLabel label="Full name" icon={UserRound}>
                                                    <input
                                                        required
                                                        value={profile.name}
                                                        onChange={(event) =>
                                                            setProfile((current) => ({
                                                                ...current,
                                                                name: event.target.value,
                                                            }))
                                                        }
                                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-bold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                    />
                                                </FieldLabel>

                                                <div>
                                                    <FieldLabel label="Email address" icon={Mail}>
                                                        <input
                                                            disabled
                                                            type="email"
                                                            value={profile.email}
                                                            className="h-12 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 pl-11 pr-4 text-sm font-bold text-slate-500"
                                                        />
                                                    </FieldLabel>

                                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                                        Email changes require your current password and should be
                                                        completed from the Security section.
                                                    </p>
                                                </div>

                                                <FieldLabel label="Verified phone" icon={Phone}>
                                                    <input
                                                        disabled
                                                        value={user.phone || "No verified phone number"}
                                                        className="h-12 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 pl-11 pr-4 text-sm font-bold text-slate-500"
                                                    />
                                                </FieldLabel>

                                                <Link href="/contact" className="inline-flex text-xs font-black text-primary">
                                                    Get help changing your phone number
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 sm:p-6">
                                            <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                          <Building2 size={20} aria-hidden="true" />
                        </span>
                                                <div>
                                                    <h3 className="font-black">Professional details</h3>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        Account type, company and location.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-6 space-y-5">
                                                <div>
                          <span className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-slate-500">
                            Account type
                          </span>
                                                    <div className="flex h-12 items-center justify-between rounded-xl border border-slate-200 bg-slate-100 px-4">
                            <span className="text-sm font-black text-slate-700">
                              {user.role || "User"}
                            </span>
                                                        <LockKeyhole size={16} className="text-slate-400" aria-hidden="true" />
                                                    </div>
                                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                                        Roles are controlled by the platform and cannot be
                                                        self-upgraded from the dashboard.
                                                    </p>
                                                </div>

                                                <SimpleField label="Company or agency">
                                                    <input
                                                        value={profile.company}
                                                        onChange={(event) =>
                                                            setProfile((current) => ({
                                                                ...current,
                                                                company: event.target.value,
                                                            }))
                                                        }
                                                        placeholder="Optional"
                                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                    />
                                                </SimpleField>

                                                <FieldLabel label="City" icon={MapPin}>
                                                    <input
                                                        value={profile.city}
                                                        onChange={(event) =>
                                                            setProfile((current) => ({
                                                                ...current,
                                                                city: event.target.value,
                                                            }))
                                                        }
                                                        placeholder="City you operate in"
                                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-bold outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                    />
                                                </FieldLabel>

                                                <SimpleField label="Address">
                                                    <input
                                                        value={profile.address}
                                                        onChange={(event) =>
                                                            setProfile((current) => ({
                                                                ...current,
                                                                address: event.target.value,
                                                            }))
                                                        }
                                                        placeholder="Optional operating address"
                                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                    />
                                                </SimpleField>
                                            </div>
                                        </div>
                                    </div>

                                    <label className="mt-6 block rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 sm:p-6">
                    <span className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                        <FileText size={20} aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block font-black">About you</span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          Add useful context for your public profile.
                        </span>
                      </span>
                    </span>

                                        <textarea
                                            rows={5}
                                            maxLength={600}
                                            value={profile.bio}
                                            onChange={(event) =>
                                                setProfile((current) => ({
                                                    ...current,
                                                    bio: event.target.value,
                                                }))
                                            }
                                            placeholder="Share your property experience, business focus or what you are looking for."
                                            className="mt-5 w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                        <span className="mt-2 block text-right text-xs font-semibold text-slate-400">
                      {profile.bio.length}/600
                    </span>
                                    </label>

                                    <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs text-slate-500">
                                            Account type, email, and phone number are intentionally
                                            excluded from ordinary profile updates.
                                        </p>
                                        <button
                                            type="submit"
                                            disabled={savingProfile}
                                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark disabled:opacity-60"
                                        >
                                            {savingProfile ? (
                                                <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                                            ) : (
                                                <Save size={17} aria-hidden="true" />
                                            )}
                                            Save profile
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : null}

                        {activeTab === "plan" ? (
                            <motion.div
                                key="plan"
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -14 }}
                                className="space-y-6"
                            >
                                <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_32px_90px_rgba(15,23,42,0.24)] sm:p-8">
                                    <div
                                        className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl"
                                        aria-hidden="true"
                                    />
                                    <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                                        <div>
                                            <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-teal-300">
                          Current plan
                        </span>
                                                <span
                                                    className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${statusClass(
                                                        planStatus,
                                                    )}`}
                                                >
                          {statusLabel(planStatus)}
                        </span>
                                            </div>
                                            <h2 className="mt-5 text-4xl font-black tracking-[-0.04em]">
                                                {currentPlan.presentation.displayName}
                                            </h2>
                                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                                                {currentPlan.presentation.description}
                                            </p>
                                            <div className="mt-7 flex items-end gap-2">
                                                <p className="text-3xl font-black">{formatPlanPrice(currentPlan)}</p>
                                                <p className="pb-1 text-sm font-bold text-slate-400">
                                                    {billingLabel(currentPlan)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                                            <Link
                                                href={`/pricing${audienceQuery}`}
                                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-teal-200"
                                            >
                                                Compare plans
                                                <ArrowRight size={16} aria-hidden="true" />
                                            </Link>
                                            <Link
                                                href="/manage-properties"
                                                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-black text-white transition hover:bg-white/10"
                                            >
                                                Manage listings
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-6 xl:grid-cols-12">
                                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-7">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                                    Current usage
                                                </p>
                                                <h3 className="mt-2 text-2xl font-black tracking-tight">Plan capacity</h3>
                                            </div>
                                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-primary">
                        <BarChart3 size={20} aria-hidden="true" />
                      </span>
                                        </div>

                                        <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                            <div className="flex items-end justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-black">Active properties</p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Listings currently using plan capacity.
                                                    </p>
                                                </div>
                                                <p className="text-2xl font-black">
                                                    {metrics.active}
                                                    <span className="text-base text-slate-400">/{planCapacity}</span>
                                                </p>
                                            </div>
                                            <div className="mt-5">
                                                <ProgressBar value={metrics.active} max={planCapacity} />
                                            </div>
                                        </div>

                                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                            {[
                                                {
                                                    label: "Listing duration",
                                                    value: `${currentPlan.entitlements.listingDays} days`,
                                                    icon: Clock3,
                                                },
                                                {
                                                    label: "Image limit",
                                                    value: `${currentPlan.entitlements.maxImages} per listing`,
                                                    icon: Eye,
                                                },
                                                {
                                                    label: "Video links",
                                                    value: String(currentPlan.entitlements.maxVideoLinks),
                                                    icon: FileText,
                                                },
                                                {
                                                    label: "Analytics",
                                                    value:
                                                        currentPlan.entitlements.analyticsLevel === "none"
                                                            ? "Not included"
                                                            : currentPlan.entitlements.analyticsLevel,
                                                    icon: BarChart3,
                                                },
                                            ].map((item) => {
                                                const Icon = item.icon;

                                                return (
                                                    <div
                                                        key={item.label}
                                                        className="rounded-2xl border border-slate-200 bg-white p-4"
                                                    >
                                                        <Icon size={17} className="text-primary" aria-hidden="true" />
                                                        <p className="mt-4 text-sm font-black">{item.value}</p>
                                                        <p className="mt-1 text-xs text-slate-500">{item.label}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-6 xl:col-span-5">
                                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                                            <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-primary">
                          <BadgeCheck size={20} aria-hidden="true" />
                        </span>
                                                <div>
                                                    <h3 className="font-black">Plan status</h3>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        Account and expiry information.
                                                    </p>
                                                </div>
                                            </div>

                                            <dl className="mt-6 space-y-4">
                                                <PlanDetail label="Status" value={statusLabel(planStatus)} />
                                                <PlanDetail
                                                    label="Started"
                                                    value={formatDate(user.plan?.startedAt, "Not recorded")}
                                                />
                                                <PlanDetail
                                                    label="Expires"
                                                    value={formatDate(
                                                        user.plan?.expiresAt,
                                                        currentPlan.presentation.priceInPaise === 0
                                                            ? "No paid expiry"
                                                            : "Not recorded",
                                                    )}
                                                    last
                                                />
                                            </dl>
                                        </div>

                                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                                            <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-primary">
                          <Sparkles size={20} aria-hidden="true" />
                        </span>
                                                <div>
                                                    <h3 className="font-black">Promotion boosts</h3>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        Plan-aware promotion allowance.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex items-end justify-between gap-4">
                                                <div>
                                                    <p className="text-3xl font-black">
                                                        {planSummary?.boostsRemaining ??
                                                            user.plan?.boostsRemaining ??
                                                            0}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        boosts remaining
                                                    </p>
                                                </div>
                                                <p className="text-xs font-black text-primary">
                                                    {planSummary?.boostsPerMonth ??
                                                        currentPlan.entitlements.promoteBoostsPerMonth}{" "}
                                                    / month
                                                </p>
                                            </div>

                                            {planSummary?.boostsResetAt ? (
                                                <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                                                    Next reset:{" "}
                                                    <span className="font-black text-slate-700">
                            {formatDate(planSummary.boostsResetAt)}
                          </span>
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : null}

                        {activeTab === "security" ? (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -14 }}
                                className="space-y-6"
                            >
                                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-primary">
                        <KeyRound size={22} aria-hidden="true" />
                      </span>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                                    Password
                                                </p>
                                                <h2 className="mt-2 text-2xl font-black tracking-tight">
                                                    Update your password
                                                </h2>
                                                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                                    The current password is required before a new one can be saved.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPasswordError("");
                                                setPasswords({ current: "", next: "", confirm: "" });
                                                setPasswordOpen(true);
                                            }}
                                            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-primary"
                                        >
                                            <LockKeyhole size={17} aria-hidden="true" />
                                            Change password
                                        </button>
                                    </div>
                                </div>

                                <div className="grid gap-6 xl:grid-cols-2">
                                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                                        <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <Settings size={22} aria-hidden="true" />
                      </span>
                                            <div>
                                                <h2 className="text-xl font-black">Current session</h2>
                                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                                    Sign out of this browser when using a shared device.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => void logout()}
                                            className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary"
                                        >
                                            <LogOut size={17} aria-hidden="true" />
                                            Sign out
                                        </button>
                                    </div>

                                    <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 sm:p-8">
                                        <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
                        <Trash2 size={22} aria-hidden="true" />
                      </span>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-600">
                                                    Danger zone
                                                </p>
                                                <h2 className="mt-2 text-xl font-black text-red-950">
                                                    Delete your account
                                                </h2>
                                                <p className="mt-2 text-sm leading-6 text-red-800">
                                                    This permanently removes the account and associated properties.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDeleteText("");
                                                setDeletePassword("");
                                                setDeleteOpen(true);
                                            }}
                                            className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-black text-white shadow-lg shadow-red-600/15 transition hover:bg-red-700"
                                        >
                                            <Trash2 size={17} aria-hidden="true" />
                                            Delete account
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </section>
            </div>

            <AnimatePresence>
                {toast ? (
                    <motion.div
                        initial={{ opacity: 0, y: 18, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 18, scale: 0.96 }}
                        role="status"
                        aria-live="polite"
                        className={`fixed bottom-6 right-5 z-[1300] flex max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl sm:right-6 ${
                            toast.type === "success"
                                ? "border-emerald-200 text-emerald-800"
                                : "border-red-200 text-red-700"
                        }`}
                    >
            <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    toast.type === "success" ? "bg-emerald-100" : "bg-red-100"
                }`}
            >
              {toast.type === "success" ? (
                  <CheckCircle2 size={18} aria-hidden="true" />
              ) : (
                  <AlertTriangle size={18} aria-hidden="true" />
              )}
            </span>
                        <p className="pt-1 text-sm font-bold leading-6">{toast.message}</p>
                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            className="ml-auto p-1 opacity-60 hover:opacity-100"
                            aria-label="Dismiss message"
                        >
                            <X size={16} aria-hidden="true" />
                        </button>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <PasswordModal
                open={passwordOpen}
                saving={savingPassword}
                error={passwordError}
                values={passwords}
                onChange={setPasswords}
                onClose={() => setPasswordOpen(false)}
                onSubmit={changePassword}
            />

            <DeleteModal
                open={deleteOpen}
                saving={deleting}
                value={deleteText}
                password={deletePassword}
                onChange={setDeleteText}
                onPasswordChange={setDeletePassword}
                onClose={() => {
                    setDeleteOpen(false);
                    setDeleteText("");
                    setDeletePassword("");
                }}
                onSubmit={deleteAccount}
            />
        </main>
    );
}

function FieldLabel({
                        label,
                        icon: Icon,
                        children,
                    }: {
    label: string;
    icon: LucideIcon;
    children: ReactNode;
}) {
    return (
        <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-slate-500">
        {label}
      </span>
            <span className="relative block">
        <Icon
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
        />
                {children}
      </span>
        </label>
    );
}

function SimpleField({
                         label,
                         children,
                     }: {
    label: string;
    children: ReactNode;
}) {
    return (
        <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-slate-500">
        {label}
      </span>
            {children}
        </label>
    );
}

function PlanDetail({
                        label,
                        value,
                        last = false,
                    }: {
    label: string;
    value: string;
    last?: boolean;
}) {
    return (
        <div
            className={`flex items-center justify-between gap-4 ${
                last ? "" : "border-b border-slate-100 pb-4"
            }`}
        >
            <dt className="text-sm text-slate-500">{label}</dt>
            <dd className="text-right text-sm font-black">{value}</dd>
        </div>
    );
}

function PasswordModal({
                           open,
                           saving,
                           error,
                           values,
                           onChange,
                           onClose,
                           onSubmit,
                       }: {
    open: boolean;
    saving: boolean;
    error: string;
    values: { current: string; next: string; confirm: string };
    onChange: Dispatch<
        SetStateAction<{ current: string; next: string; confirm: string }>
    >;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
    return (
        <AnimatePresence>
            {open ? (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center p-5">
                    <motion.button
                        type="button"
                        aria-label="Close password dialog"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !saving && onClose()}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="password-dialog-title"
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.96 }}
                        className="relative z-10 w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8"
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                            aria-label="Close"
                        >
                            <X size={17} aria-hidden="true" />
                        </button>

                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-primary">
              <LockKeyhole size={22} aria-hidden="true" />
            </span>
                        <h2
                            id="password-dialog-title"
                            className="mt-6 text-2xl font-black tracking-tight"
                        >
                            Change password
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Enter the current password and choose a new password with at least
                            12 characters.
                        </p>

                        <form onSubmit={onSubmit} className="mt-7 space-y-4">
                            <PasswordField
                                label="Current password"
                                autoComplete="current-password"
                                value={values.current}
                                onChange={(value) =>
                                    onChange((current) => ({ ...current, current: value }))
                                }
                            />
                            <PasswordField
                                label="New password"
                                autoComplete="new-password"
                                value={values.next}
                                onChange={(value) =>
                                    onChange((current) => ({ ...current, next: value }))
                                }
                            />
                            <PasswordField
                                label="Confirm new password"
                                autoComplete="new-password"
                                value={values.confirm}
                                onChange={(value) =>
                                    onChange((current) => ({ ...current, confirm: value }))
                                }
                            />

                            {error ? (
                                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-700">
                                    {error}
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/20 disabled:opacity-60"
                            >
                                {saving ? (
                                    <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                                ) : (
                                    <KeyRound size={17} aria-hidden="true" />
                                )}
                                Update password
                            </button>
                        </form>
                    </motion.div>
                </div>
            ) : null}
        </AnimatePresence>
    );
}

function PasswordField({
                           label,
                           value,
                           autoComplete,
                           onChange,
                       }: {
    label: string;
    value: string;
    autoComplete: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-slate-500">
        {label}
      </span>
            <input
                required
                type="password"
                minLength={
                    label === "Current password"
                        ? undefined
                        : 12
                }
                autoComplete={autoComplete}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            />
        </label>
    );
}

function DeleteModal({
                         open,
                         saving,
                         value,
                         password,
                         onChange,
                         onPasswordChange,
                         onClose,
                         onSubmit,
                     }: {
    open: boolean;
    saving: boolean;
    value: string;
    password: string;
    onChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
    return (
        <AnimatePresence>
            {open ? (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center p-5">
                    <motion.button
                        type="button"
                        aria-label="Close delete-account dialog"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !saving && onClose()}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-dialog-title"
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.96 }}
                        className="relative z-10 w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8"
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                            aria-label="Close"
                        >
                            <X size={17} aria-hidden="true" />
                        </button>

                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle size={22} aria-hidden="true" />
            </span>
                        <h2
                            id="delete-dialog-title"
                            className="mt-6 text-2xl font-black tracking-tight"
                        >
                            Delete account permanently?
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            This removes the account and all associated properties. The
                            action cannot be undone.
                        </p>

                        <form onSubmit={onSubmit} className="mt-7">
                            <label className="block">
        <span className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-red-600">
            Type DELETE to confirm
        </span>

                                <input
                                    required
                                    value={value}
                                    onChange={(event) =>
                                        onChange(event.target.value)
                                    }
                                    placeholder="DELETE"
                                    className="h-12 w-full rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-black text-red-950 outline-none placeholder:text-red-300 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
                                />
                            </label>

                            {/* Put the password field here */}
                            <div className="mt-4">
                                <label
                                    htmlFor="delete-password"
                                    className="text-sm font-black text-slate-900"
                                >
                                    Current password
                                </label>

                                <input
                                    id="delete-password"
                                    type="password"
                                    value={password}
                                    onChange={(event) =>
                                        onPasswordChange(
                                            event.target.value,
                                        )
                                    }
                                    autoComplete="current-password"
                                    required
                                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-primary"
                                    placeholder="Enter your current password"
                                />
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={saving}
                                    className="h-12 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        value !== "DELETE" ||
                                        password.length === 0 ||
                                        saving
                                    }
                                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {saving ? (
                                        <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                                    ) : (
                                        <Trash2 size={17} aria-hidden="true" />
                                    )}
                                    Delete
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            ) : null}
        </AnimatePresence>
    );
}
