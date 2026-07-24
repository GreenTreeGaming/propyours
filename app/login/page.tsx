"use client";

import {
    FormEvent,
    Suspense,
    useMemo,
    useState,
} from "react";
import {
    AlertTriangle,
    ArrowRight,
    BadgeCheck,
    Building2,
    CheckCircle2,
    Eye,
    EyeOff,
    Heart,
    Home,
    KeyRound,
    Loader2,
    LockKeyhole,
    Mail,
    MapPin,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
    useSearchParams,
} from "next/navigation";

import {
    setStoredUser,
    type StoredUser,
} from "@/lib/browser-user";
import BrandLogo from "@/components/BrandLogo";

interface LoginResponse {
    message?: string;
    user?: StoredUser;
    error?: string;
}

function getSafeRedirect(
    value: string | null,
): string {
    if (
        !value ||
        !value.startsWith("/") ||
        value.startsWith("//")
    ) {
        return "/";
    }

    return value;
}

function getDestinationLabel(
    redirectPath: string,
): string {
    if (
        redirectPath.startsWith(
            "/property/",
        )
    ) {
        return "the property you were viewing";
    }

    if (
        redirectPath.startsWith(
            "/favorites",
        )
    ) {
        return "your saved properties";
    }

    if (
        redirectPath.startsWith(
            "/manage-properties",
        )
    ) {
        return "property management";
    }

    if (
        redirectPath.startsWith(
            "/post-property",
        )
    ) {
        return "property publishing";
    }

    if (
        redirectPath.startsWith(
            "/dashboard",
        )
    ) {
        return "your dashboard";
    }

    return "PropYours";
}

function LoginForm() {
    const searchParams =
        useSearchParams();

    const redirectPath =
        useMemo(
            () =>
                getSafeRedirect(
                    searchParams.get(
                        "redirect",
                    ),
                ),
            [searchParams],
        );

    const destinationLabel =
        useMemo(
            () =>
                getDestinationLabel(
                    redirectPath,
                ),
            [redirectPath],
        );

    const accountCreated =
        searchParams.get("created") ===
        "1";

    const [form, setForm] =
        useState({
            email:
                searchParams.get(
                    "email",
                ) ?? "",
            password: "",
        });
    const [
        showPassword,
        setShowPassword,
    ] = useState(false);
    const [loading, setLoading] =
        useState(false);
    const [error, setError] =
        useState("");

    const signupHref =
        redirectPath === "/"
            ? "/signup"
            : `/signup?redirect=${encodeURIComponent(
                redirectPath,
            )}`;

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const email =
            form.email
                .trim()
                .toLowerCase();

        if (!email) {
            setError(
                "Enter your email address.",
            );
            return;
        }

        if (!form.password) {
            setError(
                "Enter your password.",
            );
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                "/api/auth/login",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password:
                        form.password,
                    }),
                },
            );

            const payload =
                (await response.json()) as
                    LoginResponse;

            if (
                !response.ok ||
                !payload.user
            ) {
                throw new Error(
                    payload.error ||
                    "Unable to sign in.",
                );
            }

            setStoredUser(
                payload.user,
            );

            window.location.assign(
                redirectPath,
            );
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Unable to sign in.",
            );
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#f4f7f6] px-4 pb-10 pt-24 font-body text-slate-950 sm:px-6 lg:pb-12 lg:pt-28">
            <div className="mx-auto grid min-h-[720px] w-full max-w-7xl overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white shadow-[0_32px_100px_rgba(15,23,42,0.14)] lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)]">
                <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
                    <div
                        className="pointer-events-none absolute -right-28 -top-36 h-[420px] w-[420px] rounded-full bg-teal-500/25 blur-3xl"
                        aria-hidden={true}
                    />
                    <div
                        className="pointer-events-none absolute -bottom-52 -left-32 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl"
                        aria-hidden={true}
                    />
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:48px_48px]"
                        aria-hidden={true}
                    />

                    <div className="relative">
                        <BrandLogo
                            priority
                            className="h-20 w-[300px]"
                            imageClassName="object-left"
                            />

                        <div className="mt-16 max-w-xl">
             <h1 className="mt-6 font-heading text-5xl font-black leading-[1.03] tracking-[-0.05em] xl:text-6xl">
                                Your shortlist,
                                listings and enquiries
                                <span className="block text-teal-300">
                  stay connected.
                </span>
                            </h1>

                            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                                Sign in once to save
                                properties, contact listing
                                owners, publish inventory and
                                manage your account.
                            </p>
                        </div>
                    </div>

                    <div className="relative mt-12 xl:mt-16">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <AuthBenefit
                                icon={Heart}
                                title="Keep your shortlist"
                                description="Return to saved properties from any signed-in session."
                            />
                            <AuthBenefit
                                icon={Building2}
                                title="Manage listings"
                                description="Edit property details, media, pricing and visibility."
                            />
                            <AuthBenefit
                                icon={MapPin}
                                title="Continue where you left"
                                description={`After signing in, you will return to ${destinationLabel}.`}
                            />
                            <AuthBenefit
                                icon={ShieldCheck}
                                title="Secure session"
                                description="Authentication is stored in an HTTP-only session cookie."
                            />
                        </div>

                        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-white/10">
                                <Image
                                    src="/loginimage.png"
                                    alt=""
                                    fill
                                    sizes="96px"
                                    className="object-contain p-1"
                                />
                            </div>

                            <p className="text-xs leading-5 text-slate-400">
                                Review property details,
                                inspect in person and verify
                                ownership documents before
                                making a payment.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="flex items-center p-5 sm:p-8 lg:p-10 xl:p-14">
                    <div className="mx-auto w-full max-w-lg">
                        <div className="flex justify-center lg:hidden">
                            <BrandLogo
                                priority
                                className="h-20 w-full max-w-[300px]"
                                imageClassName="object-center"
                            />
                        </div>

                        <div className="mt-10 lg:mt-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                                Account access
                            </p>

                            <h2 className="mt-3 font-heading text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">
                                Welcome back.
                            </h2>

                            <p className="mt-4 text-sm leading-6 text-slate-500">
                                Sign in to continue to{" "}
                                <span className="font-black text-slate-800">
                  {destinationLabel}
                </span>
                                .
                            </p>
                        </div>

                        {accountCreated ? (
                            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <CheckCircle2
                      size={17}
                      aria-hidden={true}
                  />
                </span>

                                <div>
                                    <p className="text-sm font-black text-slate-950">
                                        Account created
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-600">
                                        Your phone number was
                                        verified successfully. Sign
                                        in with the password you
                                        created.
                                    </p>
                                </div>
                            </div>
                        ) : null}

                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 space-y-5"
                            noValidate
                        >
                            <label className="block">
                                <FieldLabel>
                                    Email address
                                </FieldLabel>

                                <span className="relative block">
                  <Mail
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      aria-hidden={true}
                  />

                  <input
                      type="email"
                      value={form.email}
                      autoComplete="email"
                      inputMode="email"
                      onChange={(event) =>
                          setForm(
                              (current) => ({
                                  ...current,
                                  email:
                                  event.target
                                      .value,
                              }),
                          )
                      }
                      placeholder="you@example.com"
                      className="h-[52px] w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  />
                </span>
                            </label>

                            <label className="block">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <FieldLabel inline>
                                        Password
                                    </FieldLabel>

                                    <span className="text-[10px] font-bold text-slate-400">
                    Case-sensitive
                  </span>
                                </div>

                                <span className="relative block">
                  <LockKeyhole
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      aria-hidden={true}
                  />

                  <input
                      type={
                          showPassword
                              ? "text"
                              : "password"
                      }
                      value={
                          form.password
                      }
                      autoComplete="current-password"
                      onChange={(event) =>
                          setForm(
                              (current) => ({
                                  ...current,
                                  password:
                                  event.target
                                      .value,
                              }),
                          )
                      }
                      placeholder="Enter your password"
                      className="h-[52px] w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  />

                  <button
                      type="button"
                      onClick={() =>
                          setShowPassword(
                              (current) =>
                                  !current,
                          )
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-primary"
                      aria-label={
                          showPassword
                              ? "Hide password"
                              : "Show password"
                      }
                  >
                    {showPassword ? (
                        <EyeOff
                            size={17}
                            aria-hidden={true}
                        />
                    ) : (
                        <Eye
                            size={17}
                            aria-hidden={true}
                        />
                    )}
                  </button>
                </span>
                            </label>

                            {error ? (
                                <div
                                    role="alert"
                                    className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700"
                                >
                                    <AlertTriangle
                                        size={18}
                                        className="mt-0.5 shrink-0"
                                        aria-hidden={true}
                                    />
                                    <p className="text-sm font-bold leading-6">
                                        {error}
                                    </p>
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-xl disabled:cursor-wait disabled:translate-y-0 disabled:opacity-60"
                            >
                                {loading ? (
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                        aria-hidden={true}
                                    />
                                ) : (
                                    <KeyRound
                                        size={17}
                                        aria-hidden={true}
                                    />
                                )}
                                {loading
                                    ? "Signing in…"
                                    : "Sign in securely"}
                            </button>
                        </form>

                        <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-start gap-3">
                                <BadgeCheck
                                    size={18}
                                    className="mt-0.5 shrink-0 text-primary"
                                    aria-hidden={true}
                                />

                                <p className="text-xs leading-5 text-slate-500">
                                    PropYours does not place your
                                    password in browser storage.
                                    Only non-sensitive profile
                                    details are stored locally
                                    after login.
                                </p>
                            </div>
                        </div>

                        <p className="mt-7 text-center text-sm text-slate-500">
                            New to PropYours?{" "}
                            <Link
                                href={signupHref}
                                className="inline-flex items-center gap-1 font-black text-primary transition hover:text-primary-dark"
                            >
                                Create an account
                                <ArrowRight
                                    size={14}
                                    aria-hidden={true}
                                />
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

function FieldLabel({
                        children,
                        inline = false,
                    }: {
    children: React.ReactNode;
    inline?: boolean;
}) {
    return (
        <span
            className={`text-[10px] font-black uppercase tracking-[0.13em] text-slate-500 ${
                inline
                    ? ""
                    : "mb-2 block"
            }`}
        >
      {children}
    </span>
    );
}

function AuthBenefit({
                         icon: Icon,
                         title,
                         description,
                     }: {
    icon: React.ComponentType<{
        size?: number;
        className?: string;
        "aria-hidden"?: boolean;
    }>;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-teal-300">
        <Icon
            size={17}
            aria-hidden={true}
        />
      </span>

            <p className="mt-4 text-sm font-black text-white">
                {title}
            </p>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">
                {description}
            </p>
        </div>
    );
}

function LoginFallback() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f4f7f6]">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <Loader2
                    size={19}
                    className="animate-spin text-primary"
                    aria-hidden={true}
                />
                <span className="text-sm font-black text-slate-600">
          Preparing sign in…
        </span>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={<LoginFallback />}
        >
            <LoginForm />
        </Suspense>
    );
}
