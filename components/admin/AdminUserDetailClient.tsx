"use client";

import {
    Activity,
    ArrowLeft,
    BadgeIndianRupee,
    Building2,
    CalendarDays,
    CheckCircle2,
    Eye,
    Heart,
    Mail,
    MapPin,
    MessageSquareText,
    Phone,
    RefreshCw,
    Rocket,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    UserRound,
} from "lucide-react";
import Link from "next/link";
import {
    type FormEvent,
    useEffect,
    useMemo,
    useState,
} from "react";
import DeleteUserAccount from
        "@/components/admin/DeleteUserAccount";

type Props = {
    userId: string;
    gateway: string;
};

type Plan = {
    audience?: "owner" | "builder";
    tier?: string;
    status?: "free" | "active" | "expired" | "cancelled";
    startedAt?: string;
    expiresAt?: string;
    source?: string;
    boostsRemaining?: number;
};

type PropertyItem = {
    _id: string;
    purpose?: string;
    propertyType?: string;
    address?: string;
    locality?: string;
    city?: string;
    state?: string;
    size?: number;
    sizeUnit?: string;
    price?: number;
    status: "active" | "sold" | "inactive";
    featured: boolean;
    images?: string[];
    promotedUntil?: string;
    analytics?: {
        views?: number;
        phoneClicks?: number;
        favoritesCount?: number;
    };
    createdAt: string;
};

type LeadItem = {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    message?: string;
    source?: string;
    status: "new" | "verified" | "invalid";
    delivered: boolean;
    createdAt: string;
};

type AuditItem = {
    _id: string;
    actorRole: string;
    action: string;
    createdAt: string;
    actorUserId?: {
        name?: string;
        email?: string;
    };
};

type UserDetail = {
    user: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
        role: string;
        bio?: string;
        company?: string;
        address?: string;
        city?: string;
        favoritesCount: number;
        plan?: Plan;
        createdAt: string;
        updatedAt: string;
    };
    properties: {
        items: PropertyItem[];
        total: number;
    };
    leads: {
        items: LeadItem[];
        total: number;
    };
    auditLogs: AuditItem[];
};

type Tab =
    | "overview"
    | "plan"
    | "properties"
    | "leads"
    | "security"
    | "audit";

function formatDate(value?: string): string {
    if (!value) {
        return "Not set";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function formatMoney(value?: number): string {
    if (typeof value !== "number") {
        return "Price not set";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}

function titleCase(value?: string): string {
    if (!value) {
        return "Not set";
    }

    return value
        .split("-")
        .map(
            (part) =>
                part.charAt(0).toUpperCase() + part.slice(1),
        )
        .join(" ");
}

function statusClass(status?: string): string {
    switch (status) {
        case "active":
        case "verified":
            return "bg-emerald-50 text-emerald-700 ring-emerald-200";
        case "sold":
        case "expired":
            return "bg-amber-50 text-amber-700 ring-amber-200";
        case "invalid":
        case "cancelled":
            return "bg-red-50 text-red-700 ring-red-200";
        default:
            return "bg-slate-100 text-slate-700 ring-slate-200";
    }
}

function StatusBadge({ value }: { value?: string }) {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ring-1 ring-inset ${statusClass(
                value,
            )}`}
        >
            {value ?? "unknown"}
        </span>
    );
}

export default function AdminUserDetailClient({
                                                  userId,
    gateway,
                                              }: Props) {
    const [data, setData] = useState<UserDetail | null>(null);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [notice, setNotice] = useState("");
    const [saving, setSaving] = useState(false);

    async function load() {
        const response = await fetch(`/api/admin/users/${userId}`, {
            cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ?? "Unable to load this account.",
            );
        }

        setData(result);
    }

    useEffect(() => {
        let active = true;

        async function run() {
            try {
                const response = await fetch(
                    `/api/admin/users/${userId}`,
                    { cache: "no-store" },
                );
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error);
                }

                if (active) {
                    setData(result);
                }
            } catch {
                if (active) {
                    setError("Unable to load this account.");
                }
            }
        }

        void run();

        return () => {
            active = false;
        };
    }, [userId]);

    async function manage(
        payload: Record<string, unknown>,
        successMessage: string,
    ) {
        setSaving(true);
        setNotice("");

        try {
            const response = await fetch(
                `/api/admin/users/${userId}/manage`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                },
            );
            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error ?? "Unable to save changes.",
                );
            }

            await load();
            setNotice(successMessage);
        } catch (manageError) {
            setNotice(
                manageError instanceof Error
                    ? manageError.message
                    : "Unable to save changes.",
            );
        } finally {
            setSaving(false);
        }
    }

    const totals = useMemo(() => {
        if (!data) {
            return {
                views: 0,
                phoneClicks: 0,
                favorites: 0,
            };
        }

        return data.properties.items.reduce(
            (total, property) => ({
                views:
                    total.views + (property.analytics?.views ?? 0),
                phoneClicks:
                    total.phoneClicks +
                    (property.analytics?.phoneClicks ?? 0),
                favorites:
                    total.favorites +
                    (property.analytics?.favoritesCount ?? 0),
            }),
            {
                views: 0,
                phoneClicks: 0,
                favorites: 0,
            },
        );
    }, [data]);

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
                <p className="font-black">Account unavailable</p>
                <p className="mt-1 text-sm">{error}</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="space-y-5">
                <div className="h-52 animate-pulse rounded-3xl bg-white" />
                <div className="h-96 animate-pulse rounded-3xl bg-white" />
            </div>
        );
    }

    const { user } = data;
    const initials =
        user.name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "U";

    const tabs: Array<{
        id: Tab;
        label: string;
        count?: number;
    }> = [
        { id: "overview", label: "Overview" },
        { id: "plan", label: "Plan & billing" },
        {
            id: "properties",
            label: "Properties",
            count: data.properties.total,
        },
        {
            id: "leads",
            label: "Leads",
            count: data.leads.total,
        },
        { id: "security", label: "Security" },
        {
            id: "audit",
            label: "Audit trail",
            count: data.auditLogs.length,
        },
    ];

    return (
        <div className="space-y-6">
            <Link
                href="../.."
                className="inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-slate-950"
            >
                <ArrowLeft size={17} aria-hidden="true" />
                Back to accounts
            </Link>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_38%),linear-gradient(135deg,#020617_0%,#172033_100%)] p-6 text-white sm:p-8">
                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                        <div className="flex items-center gap-4 sm:gap-5">
                            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-emerald-400 text-xl font-black text-slate-950 shadow-lg shadow-emerald-400/20 sm:h-20 sm:w-20 sm:text-2xl">
                                {initials}
                            </span>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="truncate text-2xl font-black tracking-tight sm:text-3xl">
                                        {user.name}
                                    </h1>
                                    <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black text-emerald-200 ring-1 ring-inset ring-white/15">
                                        {user.role}
                                    </span>
                                </div>

                                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-300">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Mail size={15} aria-hidden="true" />
                                        {user.email}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <CalendarDays
                                            size={15}
                                            aria-hidden="true"
                                        />
                                        Joined {formatDate(user.createdAt)}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => void load()}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white/15"
                        >
                            <RefreshCw size={17} aria-hidden="true" />
                            Refresh data
                        </button>
                    </div>
                </div>

                <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-5">
                    {[
                        {
                            label: "Properties",
                            value: data.properties.total,
                            icon: Building2,
                        },
                        {
                            label: "Leads",
                            value: data.leads.total,
                            icon: MessageSquareText,
                        },
                        {
                            label: "Property views",
                            value: totals.views,
                            icon: Eye,
                        },
                        {
                            label: "Phone clicks",
                            value: totals.phoneClicks,
                            icon: Phone,
                        },
                        {
                            label: "Favourites",
                            value: user.favoritesCount,
                            icon: Heart,
                        },
                    ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="bg-white p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                    <Icon size={18} aria-hidden="true" />
                                </span>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                                        {label}
                                    </p>
                                    <p className="mt-0.5 text-2xl font-black text-slate-950">
                                        {value}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {notice && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800">
                    {notice}
                </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                <div className="flex min-w-max gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${
                                activeTab === tab.id
                                    ? "bg-slate-950 text-white"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                            }`}
                        >
                            {tab.label}
                            {typeof tab.count === "number" && (
                                <span
                                    className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${
                                        activeTab === tab.id
                                            ? "bg-white/15"
                                            : "bg-slate-200 text-slate-700"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === "overview" && <OverviewTab user={user} />}
            {activeTab === "plan" && (
                <PlanTab
                    plan={user.plan}
                    saving={saving}
                    onSave={(payload) =>
                        manage(payload, "Plan updated successfully.")
                    }
                />
            )}
            {activeTab === "properties" && (
                <PropertiesTab
                    properties={data.properties.items}
                    saving={saving}
                    onSave={(payload) =>
                        manage(payload, "Property controls updated.")
                    }
                />
            )}
            {activeTab === "leads" && (
                <LeadsTab
                    leads={data.leads.items}
                    saving={saving}
                    onSave={(payload) =>
                        manage(payload, "Lead updated.")
                    }
                />
            )}
            {activeTab === "security" && (
                <SecurityTab
                    saving={saving}
                    onRevoke={() =>
                        manage(
                            { action: "revoke-sessions" },
                            "Every active session for this account has been revoked.",
                        )
                    }
                />
            )}
            {activeTab === "audit" && (
                <AuditTab items={data.auditLogs} />
            )}

            <DeleteUserAccount
                userId={
                    user._id
                }
                userName={
                    user.name
                }
                userEmail={
                    user.email
                }
                returnUrl={
                    `/control/${gateway}/dashboard#accounts`
                }
            />
        </div>
    );
}

function OverviewTab({
                         user,
                     }: {
    user: UserDetail["user"];
}) {
    const details = [
        { label: "Email", value: user.email, icon: Mail },
        {
            label: "Phone",
            value: user.phone || "Not provided",
            icon: Phone,
        },
        {
            label: "Company",
            value: user.company || "Not provided",
            icon: Building2,
        },
        {
            label: "City",
            value: user.city || "Not provided",
            icon: MapPin,
        },
        {
            label: "Address",
            value: user.address || "Not provided",
            icon: MapPin,
        },
        {
            label: "Last account update",
            value: formatDate(user.updatedAt),
            icon: CalendarDays,
        },
    ];

    return (
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                    Account details
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                    Profile information
                </h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {details.map(({ label, value, icon: Icon }) => (
                        <div
                            key={label}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                            <div className="flex items-start gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                                    <Icon size={17} aria-hidden="true" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                                        {label}
                                    </p>
                                    <p className="mt-1 break-words text-sm font-bold text-slate-900">
                                        {value}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                    Public profile
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                    Biography
                </h2>
                <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                    <UserRound
                        size={22}
                        className="text-slate-400"
                        aria-hidden="true"
                    />
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                        {user.bio ||
                            "This account has not added a biography."}
                    </p>
                </div>
            </section>
        </div>
    );
}

function PlanTab({
                     plan,
                     saving,
                     onSave,
                 }: {
    plan?: Plan;
    saving: boolean;
    onSave: (payload: Record<string, unknown>) => Promise<void>;
}) {
    const [audience, setAudience] = useState<"owner" | "builder">(
        plan?.audience ?? "owner",
    );
    const [tier, setTier] = useState(plan?.tier ?? "silver");
    const [status, setStatus] = useState<
        "free" | "active" | "expired" | "cancelled"
    >(plan?.status ?? "free");
    const [expiresAt, setExpiresAt] = useState(
        plan?.expiresAt ? plan.expiresAt.slice(0, 10) : "",
    );
    const [boosts, setBoosts] = useState(
        plan?.boostsRemaining ?? 0,
    );

    const tiers = useMemo(
        () =>
            audience === "owner"
                ? ["silver", "gold", "platinum"]
                : [
                    "builder-starter",
                    "builder-growth",
                    "builder-elite",
                ],
        [audience],
    );


    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        await onSave({
            action: "set-plan",
            audience,
            tier,
            status,
            expiresAt: expiresAt
                ? new Date(
                    `${expiresAt}T23:59:59.000Z`,
                ).toISOString()
                : null,
            boostsRemaining: boosts,
        });
    }

    return (
        <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
            <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950">
                    <Sparkles size={22} aria-hidden="true" />
                </span>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                    Current access
                </p>
                <h2 className="mt-2 text-3xl font-black">
                    {titleCase(plan?.tier)}
                </h2>
                <div className="mt-4">
                    <StatusBadge value={plan?.status} />
                </div>

                <dl className="mt-8 space-y-4 text-sm">
                    <PlanRow
                        label="Audience"
                        value={titleCase(plan?.audience)}
                    />
                    <PlanRow
                        label="Started"
                        value={formatDate(plan?.startedAt)}
                    />
                    <PlanRow
                        label="Expires"
                        value={formatDate(plan?.expiresAt)}
                    />
                    <PlanRow
                        label="Boosts remaining"
                        value={String(plan?.boostsRemaining ?? 0)}
                    />
                </dl>
            </section>

            <form
                onSubmit={submit}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                    Manual plan control
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                    Change plan access
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Changes are applied immediately and recorded in the
                    audit trail.
                </p>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <Field label="Plan audience">
                        <select
                            value={audience}
                            onChange={(event) => {
                                const nextAudience =
                                    event.target.value as
                                        | "owner"
                                        | "builder";

                                setAudience(nextAudience);
                                setTier(
                                    nextAudience === "owner"
                                        ? "silver"
                                        : "builder-starter",
                                );
                            }}
                            className="admin-input"
                        >
                            <option value="owner">Property owner</option>
                            <option value="builder">Builder</option>
                        </select>
                    </Field>

                    <Field label="Plan tier">
                        <select
                            value={tier}
                            onChange={(event) =>
                                setTier(event.target.value)
                            }
                            className="admin-input"
                        >
                            {tiers.map((item) => (
                                <option key={item} value={item}>
                                    {titleCase(item)}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Subscription status">
                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value as
                                        | "free"
                                        | "active"
                                        | "expired"
                                        | "cancelled",
                                )
                            }
                            className="admin-input"
                        >
                            <option value="free">Free</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </Field>

                    <Field label="Expiry date">
                        <input
                            type="date"
                            value={expiresAt}
                            onChange={(event) =>
                                setExpiresAt(event.target.value)
                            }
                            className="admin-input"
                        />
                    </Field>

                    <Field label="Boosts remaining">
                        <input
                            type="number"
                            min={0}
                            max={10000}
                            value={boosts}
                            onChange={(event) =>
                                setBoosts(
                                    Number(event.target.value) || 0,
                                )
                            }
                            className="admin-input"
                        />
                    </Field>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
                >
                    <BadgeIndianRupee size={18} aria-hidden="true" />
                    {saving ? "Saving…" : "Save plan changes"}
                </button>
            </form>
        </div>
    );
}

function PropertiesTab({
                           properties,
                           saving,
                           onSave,
                       }: {
    properties: PropertyItem[];
    saving: boolean;
    onSave: (payload: Record<string, unknown>) => Promise<void>;
}) {
    if (properties.length === 0) {
        return (
            <EmptyState
                icon={Building2}
                title="No properties"
                description="This account has not created any listings."
            />
        );
    }

    return (
        <div className="grid gap-5 xl:grid-cols-2">
            {properties.map((property) => (
                <PropertyCard
                    key={property._id}
                    property={property}
                    saving={saving}
                    onSave={onSave}
                />
            ))}
        </div>
    );
}

function PropertyCard({
                          property,
                          saving,
                          onSave,
                      }: {
    property: PropertyItem;
    saving: boolean;
    onSave: (payload: Record<string, unknown>) => Promise<void>;
}) {
    const [status, setStatus] = useState(property.status);
    const [featured, setFeatured] = useState(property.featured);
    const [promotedUntil, setPromotedUntil] = useState(
        property.promotedUntil
            ? property.promotedUntil.slice(0, 10)
            : "",
    );
    const image = property.images?.[0];

    return (
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid sm:grid-cols-[180px_1fr]">
                <div className="min-h-48 bg-slate-100">
                    {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={image}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full min-h-48 items-center justify-center text-slate-300">
                            <Building2 size={38} aria-hidden="true" />
                        </div>
                    )}
                </div>

                <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                                {property.purpose} · {property.propertyType}
                            </p>
                            <h3 className="mt-1 text-xl font-black text-slate-950">
                                {property.locality ||
                                    property.address ||
                                    "Untitled property"}
                            </h3>
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                                <MapPin size={14} aria-hidden="true" />
                                {[property.city, property.state]
                                    .filter(Boolean)
                                    .join(", ") || "Location not set"}
                            </p>
                        </div>
                        <StatusBadge value={property.status} />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <MiniStat
                            label="Price"
                            value={formatMoney(property.price)}
                        />
                        <MiniStat
                            label="Size"
                            value={
                                property.size
                                    ? `${property.size} ${
                                        property.sizeUnit ?? ""
                                    }`
                                    : "—"
                            }
                        />
                        <MiniStat
                            label="Views"
                            value={String(
                                property.analytics?.views ?? 0,
                            )}
                        />
                        <MiniStat
                            label="Phone clicks"
                            value={String(
                                property.analytics?.phoneClicks ?? 0,
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-5">
                <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Listing status">
                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value as
                                        | "active"
                                        | "sold"
                                        | "inactive",
                                )
                            }
                            className="admin-input"
                        >
                            <option value="active">Active</option>
                            <option value="sold">Sold</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </Field>

                    <Field label="Homepage feature">
                        <select
                            value={featured ? "yes" : "no"}
                            onChange={(event) =>
                                setFeatured(event.target.value === "yes")
                            }
                            className="admin-input"
                        >
                            <option value="no">Not featured</option>
                            <option value="yes">Featured</option>
                        </select>
                    </Field>

                    <Field label="Promoted until">
                        <input
                            type="date"
                            value={promotedUntil}
                            onChange={(event) =>
                                setPromotedUntil(event.target.value)
                            }
                            className="admin-input"
                        />
                    </Field>
                </div>

                <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                        void onSave({
                            action: "set-property",
                            propertyId: property._id,
                            status,
                            featured,
                            promotedUntil: promotedUntil
                                ? new Date(
                                    `${promotedUntil}T23:59:59.000Z`,
                                ).toISOString()
                                : null,
                        })
                    }
                    className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
                >
                    <Rocket size={17} aria-hidden="true" />
                    Save property controls
                </button>
            </div>
        </article>
    );
}

function LeadsTab({
                      leads,
                      saving,
                      onSave,
                  }: {
    leads: LeadItem[];
    saving: boolean;
    onSave: (payload: Record<string, unknown>) => Promise<void>;
}) {
    if (leads.length === 0) {
        return (
            <EmptyState
                icon={MessageSquareText}
                title="No leads"
                description="No enquiries are linked to this account."
            />
        );
    }

    return (
        <div className="space-y-4">
            {leads.map((lead) => (
                <LeadCard
                    key={lead._id}
                    lead={lead}
                    saving={saving}
                    onSave={onSave}
                />
            ))}
        </div>
    );
}

function LeadCard({
                      lead,
                      saving,
                      onSave,
                  }: {
    lead: LeadItem;
    saving: boolean;
    onSave: (payload: Record<string, unknown>) => Promise<void>;
}) {
    const [status, setStatus] = useState(lead.status);
    const [delivered, setDelivered] = useState(lead.delivered);

    return (
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-5 lg:flex-row">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-slate-950">
                            {lead.name}
                        </h3>
                        <StatusBadge value={lead.status} />
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize text-slate-600">
                            {lead.source || "form"}
                        </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                        <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1.5 font-bold hover:text-emerald-700"
                        >
                            <Phone size={15} aria-hidden="true" />
                            {lead.phone}
                        </a>
                        {lead.email && (
                            <a
                                href={`mailto:${lead.email}`}
                                className="inline-flex items-center gap-1.5 font-bold hover:text-emerald-700"
                            >
                                <Mail size={15} aria-hidden="true" />
                                {lead.email}
                            </a>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={15} aria-hidden="true" />
                            {formatDate(lead.createdAt)}
                        </span>
                    </div>

                    <p className="mt-4 max-w-3xl whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                        {lead.message || "No message was included."}
                    </p>
                </div>

                <div className="w-full shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:w-80">
                    <div className="grid gap-3">
                        <Field label="Lead status">
                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value as
                                            | "new"
                                            | "verified"
                                            | "invalid",
                                    )
                                }
                                className="admin-input"
                            >
                                <option value="new">New</option>
                                <option value="verified">Verified</option>
                                <option value="invalid">Invalid</option>
                            </select>
                        </Field>

                        <Field label="Delivery">
                            <select
                                value={delivered ? "yes" : "no"}
                                onChange={(event) =>
                                    setDelivered(
                                        event.target.value === "yes",
                                    )
                                }
                                className="admin-input"
                            >
                                <option value="yes">Delivered</option>
                                <option value="no">Not delivered</option>
                            </select>
                        </Field>
                    </div>

                    <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                            void onSave({
                                action: "set-lead",
                                leadId: lead._id,
                                status,
                                delivered,
                            })
                        }
                        className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
                    >
                        <CheckCircle2 size={16} aria-hidden="true" />
                        Save lead
                    </button>
                </div>
            </div>
        </article>
    );
}

function SecurityTab({
                         saving,
                         onRevoke,
                     }: {
    saving: boolean;
    onRevoke: () => Promise<void>;
}) {
    async function confirmRevoke() {
        const confirmed = window.confirm(
            "Sign this account out of every device? They will need to log in again.",
        );

        if (confirmed) {
            await onRevoke();
        }
    }

    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <ShieldCheck size={22} aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-2xl font-black text-slate-950">
                    Session security
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Revoking sessions invalidates every current login token
                    for this account without changing the password.
                </p>
                <button
                    type="button"
                    disabled={saving}
                    onClick={() => void confirmRevoke()}
                    className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
                >
                    <ShieldAlert size={18} aria-hidden="true" />
                    Revoke every session
                </button>
            </section>

            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="text-lg font-black text-amber-950">
                    Protected information
                </h2>
                <p className="mt-2 text-sm leading-6 text-amber-900/80">
                    Password hashes, OTP values, JWTs, cookies, API keys and
                    database credentials are intentionally never displayed.
                </p>
            </section>
        </div>
    );
}

function AuditTab({ items }: { items: AuditItem[] }) {
    if (items.length === 0) {
        return (
            <EmptyState
                icon={Activity}
                title="No admin activity"
                description="No administrative changes have been recorded for this account."
            />
        );
    }

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                Accountability
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
                Administrative audit trail
            </h2>

            <div className="mt-6 space-y-3">
                {items.map((item) => (
                    <article
                        key={item._id}
                        className="flex gap-4 rounded-2xl border border-slate-200 p-4"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                            <Activity size={17} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <p className="break-words text-sm font-black text-slate-900">
                                {item.action.split(".").join(" · ")}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                {item.actorUserId?.name || item.actorRole}
                                {" · "}
                                {formatDate(item.createdAt)}
                            </p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

function Field({
                   label,
                   children,
               }: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                {label}
            </span>
            {children}
        </label>
    );
}

function PlanRow({
                     label,
                     value,
                 }: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex justify-between gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
            <dt className="text-slate-400">{label}</dt>
            <dd className="text-right font-black">{value}</dd>
        </div>
    );
}

function MiniStat({
                      label,
                      value,
                  }: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p className="mt-1 truncate text-sm font-black text-slate-800">
                {value}
            </p>
        </div>
    );
}

function EmptyState({
                        icon: Icon,
                        title,
                        description,
                    }: {
    icon: typeof Building2;
    title: string;
    description: string;
}) {
    return (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Icon size={25} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-black text-slate-900">
                {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                {description}
            </p>
        </section>
    );
}
