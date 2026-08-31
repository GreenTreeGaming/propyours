"use client";

import {
    FormEvent,
    Suspense,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    BriefcaseBusiness,
    Building2,
    Check,
    CheckCircle2,
    Clock3,
    Eye,
    EyeOff,
    Home,
    KeyRound,
    Loader2,
    LockKeyhole,
    Mail,
    MessageSquareText,
    Phone,
    Search,
    ShieldCheck,
    Sparkles,
    UserRound,
    type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
    useSearchParams,
} from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

type AccountRole =
    | "User"
    | "Property Owner"
    | "Agent"
    | "Builder";

type SignupStep =
    | "role"
    | "identity"
    | "security";

type NoticeType =
    | "error"
    | "success"
    | "info";

interface SignupForm {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: AccountRole;
}

interface ApiPayload {
    message?: string;
    error?: string;
}

interface RoleOption {
    value: AccountRole;
    label: string;
    description: string;
    highlight: string;
    icon: LucideIcon;
}

const ROLE_OPTIONS: RoleOption[] = [
    {
        value: "User",
        label: "Buyer or renter",
        description:
            "Browse, save and enquire about properties.",
        highlight:
            "Build a shortlist and contact listing owners.",
        icon: Search,
    },
    {
        value: "Property Owner",
        label: "Property owner",
        description:
            "Publish and manage your own property listings.",
        highlight:
            "Control pricing, media and listing performance.",
        icon: Home,
    },
    {
        value: "Agent",
        label: "Property agent",
        description:
            "Present inventory and handle property enquiries.",
        highlight:
            "Create a public portfolio for client-facing listings.",
        icon: BriefcaseBusiness,
    },
    {
        value: "Builder",
        label: "Builder or developer",
        description:
            "Publish projects and commercial inventory.",
        highlight:
            "Access builder plans, brochures and project visibility.",
        icon: Building2,
    },
];

const STEP_ORDER: SignupStep[] = [
    "role",
    "identity",
    "security",
];

const STEP_LABELS: Record<
    SignupStep,
    {
        number: number;
        label: string;
        shortLabel: string;
    }
> = {
    role: {
        number: 1,
        label: "Account type",
        shortLabel: "Type",
    },
    identity: {
        number: 2,
        label: "Contact verification",
        shortLabel: "Verify",
    },
    security: {
        number: 3,
        label: "Secure account",
        shortLabel: "Security",
    },
};

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

function isValidEmail(
    value: string,
): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        value.trim(),
    );
}

function isValidPhone(
    value: string,
): boolean {
    const digits =
        value.replace(/\D/g, "");

    return (
        digits.length >= 10 &&
        digits.length <= 15
    );
}

function getPasswordScore(
    password: string,
): number {
    let score = 0;

    if (password.length >= 8) {
        score += 1;
    }

    if (/[A-Z]/.test(password)) {
        score += 1;
    }

    if (/[a-z]/.test(password)) {
        score += 1;
    }

    if (/\d/.test(password)) {
        score += 1;
    }

    if (
        /[^A-Za-z0-9]/.test(
            password,
        )
    ) {
        score += 1;
    }

    return score;
}

function getPasswordLabel(
    score: number,
): string {
    if (score <= 1) {
        return "Weak";
    }

    if (score <= 3) {
        return "Good";
    }

    return "Strong";
}

function SignupFormContent() {
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

    const requestedRole =
        searchParams.get("role");
    const requestedAudience =
        searchParams.get(
            "audience",
        );

    const initialRole: AccountRole =
        requestedRole ===
        "Builder" ||
        requestedAudience ===
        "builder"
            ? "Builder"
            : requestedRole ===
            "Agent"
                ? "Agent"
                : requestedRole ===
                "Property Owner"
                    ? "Property Owner"
                    : "User";

    const [form, setForm] =
        useState<SignupForm>({
            name: "",
            email: "",
            phone: "",
            password: "",
            role: initialRole,
        });
    const [
        confirmPassword,
        setConfirmPassword,
    ] = useState("");
    const [step, setStep] =
        useState<SignupStep>("role");
    const [otp, setOtp] =
        useState("");
    const [otpSent, setOtpSent] =
        useState(false);
    const [
        phoneVerified,
        setPhoneVerified,
    ] = useState(false);
    const [
        otpLoading,
        setOtpLoading,
    ] = useState<
        "send" | "verify" | null
    >(null);

    const [
        emailOtp,
        setEmailOtp,
    ] = useState("");

    const [
        emailOtpSent,
        setEmailOtpSent,
    ] = useState(false);

    const [
        emailVerified,
        setEmailVerified,
    ] = useState(false);

    const [
        emailOtpLoading,
        setEmailOtpLoading,
    ] = useState<
        "send" | "verify" | null
    >(null);

    const [
        emailResendSeconds,
        setEmailResendSeconds,
    ] = useState(0);

    const [loading, setLoading] =
        useState(false);
    const [
        showPassword,
        setShowPassword,
    ] = useState(false);
    const [
        showConfirmPassword,
        setShowConfirmPassword,
    ] = useState(false);
    const [termsAccepted, setTermsAccepted] =
        useState(false);
    const [notice, setNotice] =
        useState<{
            type: NoticeType;
            text: string;
        } | null>(null);
    const [
        resendSeconds,
        setResendSeconds,
    ] = useState(0);
    const [accountCreated, setAccountCreated] =
        useState(false);

    const activeStepIndex =
        STEP_ORDER.indexOf(step);

    const selectedRole =
        ROLE_OPTIONS.find(
            (option) =>
                option.value ===
                form.role,
        ) ?? ROLE_OPTIONS[0];

    const SelectedRoleIcon =
        selectedRole.icon;

    const passwordScore =
        getPasswordScore(
            form.password,
        );

    const loginHref = useMemo(() => {
        const params =
            new URLSearchParams();

        if (redirectPath !== "/") {
            params.set(
                "redirect",
                redirectPath,
            );
        }

        if (form.email.trim()) {
            params.set(
                "email",
                form.email
                    .trim()
                    .toLowerCase(),
            );
        }

        if (accountCreated) {
            params.set(
                "created",
                "1",
            );
        }

        const query =
            params.toString();

        return query
            ? `/login?${query}`
            : "/login";
    }, [
        accountCreated,
        form.email,
        redirectPath,
    ]);

    useEffect(() => {
        if (resendSeconds <= 0) {
            return;
        }

        const timer = window.setInterval(
            () => {
                setResendSeconds(
                    (current) =>
                        Math.max(
                            current - 1,
                            0,
                        ),
                );
            },
            1000,
        );

        return () =>
            window.clearInterval(timer);
    }, [resendSeconds]);

    useEffect(() => {
        if (
            emailResendSeconds <=
            0
        ) {
            return;
        }

        const timer =
            window.setInterval(
                () => {
                    setEmailResendSeconds(
                        (current) =>
                            Math.max(
                                current -
                                1,
                                0,
                            ),
                    );
                },
                1000,
            );

        return () =>
            window.clearInterval(
                timer,
            );
    }, [emailResendSeconds]);

    function showNotice(
        type: NoticeType,
        text: string,
    ) {
        setNotice({
            type,
            text,
        });
    }

    function resetEmailVerification(
        email: string,
    ) {
        setForm(
            (current) => ({
                ...current,
                email,
            }),
        );

        setEmailOtp("");

        setEmailOtpSent(
            false,
        );

        setEmailVerified(
            false,
        );

        setEmailResendSeconds(
            0,
        );

        setNotice(null);
    }

    function resetPhoneVerification(
        phone: string,
    ) {
        setForm((current) => ({
            ...current,
            phone,
        }));
        setOtp("");
        setOtpSent(false);
        setPhoneVerified(false);
        setResendSeconds(0);
        setNotice(null);
    }

    function validateIdentity(): boolean {
        if (
            form.name.trim().length < 2
        ) {
            showNotice(
                "error",
                "Enter your full name.",
            );
            return false;
        }

        if (
            !isValidEmail(form.email)
        ) {
            showNotice(
                "error",
                "Enter a valid email address.",
            );
            return false;
        }

        if (
            !isValidPhone(form.phone)
        ) {
            showNotice(
                "error",
                "Enter a valid phone number with 10 to 15 digits.",
            );
            return false;
        }

        return true;
    }

    function goForward() {
        setNotice(null);

        if (step === "role") {
            setStep("identity");
            return;
        }

        if (step === "identity") {
            if (!validateIdentity()) {
                return;
            }

            if (!emailVerified) {
                showNotice(
                    "error",
                    "Verify your email address before continuing.",
                );

                return;
            }

            if (!phoneVerified) {
                showNotice(
                    "error",
                    "Verify your phone number before continuing.",
                );

                return;
            }

            if (!phoneVerified) {
                showNotice(
                    "error",
                    "Verify your phone number before continuing.",
                );
                return;
            }

            setStep("security");
        }
    }

    function goBack() {
        setNotice(null);

        if (step === "security") {
            setStep("identity");
            return;
        }

        if (step === "identity") {
            setStep("role");
        }
    }

    async function handleSendEmailOtp() {
        if (
            !isValidEmail(
                form.email,
            )
        ) {
            showNotice(
                "error",
                "Enter a valid email address.",
            );

            return;
        }

        if (
            emailOtpLoading ||
            emailResendSeconds >
            0 ||
            emailVerified
        ) {
            return;
        }

        setEmailOtpLoading(
            "send",
        );

        setNotice(null);

        try {
            const response =
                await fetch(
                    "/api/auth/send-email-otp",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify(
                                {
                                    email:
                                        form.email
                                            .trim()
                                            .toLowerCase(),
                                },
                            ),
                    },
                );

            const payload =
                (await response.json()) as
                    ApiPayload;

            if (!response.ok) {
                throw new Error(
                    payload.error ||
                    "Unable to send the email verification code.",
                );
            }

            setEmailOtpSent(
                true,
            );

            setEmailOtp("");

            setEmailResendSeconds(
                60,
            );

            showNotice(
                "success",
                "Verification code sent to your email. It expires in 10 minutes.",
            );
        } catch (caughtError) {
            showNotice(
                "error",

                caughtError instanceof
                Error
                    ? caughtError.message
                    : "Unable to send the email verification code.",
            );
        } finally {
            setEmailOtpLoading(
                null,
            );
        }
    }

    async function handleVerifyEmailOtp() {
        if (
            emailOtpLoading ||
            emailOtp.length !== 6
        ) {
            return;
        }

        setEmailOtpLoading(
            "verify",
        );

        setNotice(null);

        try {
            const response =
                await fetch(
                    "/api/auth/verify-email-otp",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify(
                                {
                                    email:
                                        form.email
                                            .trim()
                                            .toLowerCase(),

                                    otp:
                                    emailOtp,
                                },
                            ),
                    },
                );

            const payload =
                (await response.json()) as
                    ApiPayload;

            if (!response.ok) {
                throw new Error(
                    payload.error ||
                    "Unable to verify the email code.",
                );
            }

            setEmailVerified(
                true,
            );

            showNotice(
                "success",
                "Email address verified.",
            );
        } catch (caughtError) {
            showNotice(
                "error",

                caughtError instanceof
                Error
                    ? caughtError.message
                    : "Unable to verify the email code.",
            );
        } finally {
            setEmailOtpLoading(
                null,
            );
        }
    }

    async function handleSendOtp() {
        if (!validateIdentity()) {
            return;
        }

        if (
            otpLoading ||
            resendSeconds > 0 ||
            phoneVerified
        ) {
            return;
        }

        setOtpLoading("send");
        setNotice(null);

        try {
            const response = await fetch(
                "/api/auth/send-phone-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        phone:
                            form.phone.trim(),
                        email:
                            form.email
                                .trim()
                                .toLowerCase(),
                    }),
                },
            );

            const payload =
                (await response.json()) as
                    ApiPayload;

            if (!response.ok) {
                throw new Error(
                    payload.error ||
                    "Unable to send the verification code.",
                );
            }

            setOtpSent(true);
            setOtp("");
            setResendSeconds(60);
            showNotice(
                "success",
                "Verification code sent. It expires in 10 minutes.",
            );
        } catch (caughtError) {
            showNotice(
                "error",
                caughtError instanceof Error
                    ? caughtError.message
                    : "Unable to send the verification code.",
            );
        } finally {
            setOtpLoading(null);
        }
    }

    async function handleVerifyOtp() {
        if (
            otpLoading ||
            otp.length !== 6
        ) {
            return;
        }

        setOtpLoading("verify");
        setNotice(null);

        try {
            const response = await fetch(
                "/api/auth/verify-phone-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        phone:
                            form.phone.trim(),
                        otp,
                    }),
                },
            );

            const payload =
                (await response.json()) as
                    ApiPayload;

            if (!response.ok) {
                throw new Error(
                    payload.error ||
                    "Unable to verify the code.",
                );
            }

            setPhoneVerified(true);
            showNotice(
                "success",
                "Phone number verified. You can continue.",
            );
        } catch (caughtError) {
            showNotice(
                "error",
                caughtError instanceof Error
                    ? caughtError.message
                    : "Unable to verify the code.",
            );
        } finally {
            setOtpLoading(null);
        }
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (step !== "security") {
            goForward();
            return;
        }

        if (
            form.password.length < 8
        ) {
            showNotice(
                "error",
                "Create a password with at least 8 characters.",
            );
            return;
        }

        if (
            form.password !==
            confirmPassword
        ) {
            showNotice(
                "error",
                "The passwords do not match.",
            );
            return;
        }

        if (!termsAccepted) {
            showNotice(
                "error",
                "Accept the Terms and Privacy Policy to create your account.",
            );
            return;
        }

        if (!emailVerified) {
            setStep(
                "identity",
            );

            showNotice(
                "error",
                "Verify your email address before creating the account.",
            );

            return;
        }

        if (!phoneVerified) {
            setStep("identity");
            showNotice(
                "error",
                "Verify your phone number before creating the account.",
            );
            return;
        }

        setLoading(true);
        setNotice(null);

        try {
            const response = await fetch(
                "/api/auth/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        name:
                            form.name.trim(),
                        email:
                            form.email
                                .trim()
                                .toLowerCase(),
                        phone:
                            form.phone.trim(),
                        password:
                        form.password,
                        role: form.role,
                    }),
                },
            );

            const payload =
                (await response.json()) as
                    ApiPayload;

            if (!response.ok) {
                throw new Error(
                    payload.error ||
                    "Unable to create your account.",
                );
            }

            setAccountCreated(true);
            setNotice(null);
        } catch (caughtError) {
            showNotice(
                "error",
                caughtError instanceof Error
                    ? caughtError.message
                    : "Unable to create your account.",
            );
        } finally {
            setLoading(false);
        }
    }

    if (accountCreated) {
        return (
            <SignupSuccess
                role={selectedRole}
                email={form.email}
                loginHref={loginHref}
            />
        );
    }

    return (
        <main className="min-h-screen bg-[#f4f7f6] px-4 pb-10 pt-24 font-body text-slate-950 sm:px-6 lg:pb-12 lg:pt-28">
            <div className="mx-auto grid min-h-[780px] w-full max-w-7xl overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white shadow-[0_32px_100px_rgba(15,23,42,0.14)] lg:grid-cols-[minmax(0,0.86fr)_minmax(560px,1.14fr)]">
                <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
                    <div
                        className="pointer-events-none absolute -right-24 -top-36 h-[420px] w-[420px] rounded-full bg-teal-500/25 blur-3xl"
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none absolute -bottom-48 -left-28 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl"
                        aria-hidden="true"
                    />

                    <div className="relative">
                        <BrandLogo
                            priority
                            className="h-20 w-[300px]"
                            imageClassName="object-left"
                        />

                        <div className="mt-16">
          <h1 className="mt-6 font-heading text-5xl font-black leading-[1.03] tracking-[-0.05em] xl:text-6xl">
                                Start with the account
                                <span className="block text-teal-300">
                  that fits your property goals.
                </span>
                            </h1>

                            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                                Verify your contact details, choose
                                how you use PropYours and create
                                a secure account in three clear
                                stages.
                            </p>
                        </div>
                    </div>

                    <div className="relative mt-12 xl:mt-16">
                        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-5">
                            <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-300 text-slate-950">
                  <SelectedRoleIcon
                      size={20}
                      aria-hidden="true"
                  />
                </span>

                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-teal-300">
                                        Selected account
                                    </p>
                                    <h2 className="mt-2 text-xl font-black">
                                        {selectedRole.label}
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        {selectedRole.highlight}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <SignupBenefit
                                    icon={BadgeCheck}
                                    label="Contact verified"
                                />
                                <SignupBenefit
                                    icon={ShieldCheck}
                                    label="Secure password"
                                />
                                <SignupBenefit
                                    icon={Building2}
                                    label="Public profile"
                                />
                                <SignupBenefit
                                    icon={CheckCircle2}
                                    label="Role-aware tools"
                                />
                            </div>
                        </div>

                        <div className="mt-5 flex items-center gap-4">
                            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl bg-white/5">
                                <Image
                                    src="/signuppageimage.png"
                                    alt=""
                                    fill
                                    sizes="112px"
                                    className="object-contain p-1"
                                />
                            </div>

                            <p className="text-xs leading-5 text-slate-500">
                                You can change profile details
                                later. The account role controls
                                how your public profile and
                                property tools are presented.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="p-5 sm:p-8 lg:p-10 xl:p-12">
                    <div className="mx-auto w-full max-w-2xl">
                        <div className="flex justify-center lg:hidden">
                            <BrandLogo
                                priority
                                className="h-20 w-full max-w-[300px]"
                                imageClassName="object-center"
                            />
                        </div>

                        <div className="mt-9 lg:mt-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                                Create your account
                            </p>

                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h2 className="font-heading text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">
                                        Join PropYours.
                                    </h2>
                                    <p className="mt-3 text-sm leading-6 text-slate-500">
                                        Step{" "}
                                        {activeStepIndex + 1} of{" "}
                                        {STEP_ORDER.length}:{" "}
                                        <span className="font-black text-slate-800">
                      {
                          STEP_LABELS[
                              step
                              ].label
                      }
                    </span>
                                    </p>
                                </div>

                                <Link
                                    href={loginHref}
                                    className="inline-flex items-center gap-1.5 text-xs font-black text-primary"
                                >
                                    Already registered?
                                    <ArrowRight
                                        size={14}
                                        aria-hidden="true"
                                    />
                                </Link>
                            </div>
                        </div>

                        <SignupProgress
                            activeStep={step}
                        />

                        <form
                            onSubmit={handleSubmit}
                            className="mt-8"
                            noValidate
                        >
                            {step === "role" ? (
                                <RoleStep
                                    selectedRole={
                                        form.role
                                    }
                                    onSelect={(
                                        role,
                                    ) =>
                                        setForm(
                                            (current) => ({
                                                ...current,
                                                role,
                                            }),
                                        )
                                    }
                                />
                            ) : null}

                            {step ===
                            "identity" ? (
                                <IdentityStep
                                    form={form}

                                    emailOtp={
                                        emailOtp
                                    }

                                    emailOtpSent={
                                        emailOtpSent
                                    }

                                    emailVerified={
                                        emailVerified
                                    }

                                    emailOtpLoading={
                                        emailOtpLoading
                                    }

                                    emailResendSeconds={
                                        emailResendSeconds
                                    }

                                    otp={otp}

                                    otpSent={otpSent}

                                    phoneVerified={
                                        phoneVerified
                                    }

                                    otpLoading={
                                        otpLoading
                                    }

                                    resendSeconds={
                                        resendSeconds
                                    }

                                    onFormChange={(
                                        patch,
                                    ) =>
                                        setForm(
                                            (current) => ({
                                                ...current,
                                                ...patch,
                                            }),
                                        )
                                    }

                                    onEmailChange={
                                        resetEmailVerification
                                    }

                                    onEmailOtpChange={
                                        setEmailOtp
                                    }

                                    onSendEmailOtp={() =>
                                        void handleSendEmailOtp()
                                    }

                                    onVerifyEmailOtp={() =>
                                        void handleVerifyEmailOtp()
                                    }

                                    onPhoneChange={
                                        resetPhoneVerification
                                    }

                                    onOtpChange={
                                        setOtp
                                    }

                                    onSendOtp={() =>
                                        void handleSendOtp()
                                    }

                                    onVerifyOtp={() =>
                                        void handleVerifyOtp()
                                    }
                                />
                            ) : null}

                            {step ===
                            "security" ? (
                                <SecurityStep
                                    password={
                                        form.password
                                    }
                                    confirmPassword={
                                        confirmPassword
                                    }
                                    passwordScore={
                                        passwordScore
                                    }
                                    showPassword={
                                        showPassword
                                    }
                                    showConfirmPassword={
                                        showConfirmPassword
                                    }
                                    termsAccepted={
                                        termsAccepted
                                    }
                                    onPasswordChange={(
                                        password,
                                    ) =>
                                        setForm(
                                            (current) => ({
                                                ...current,
                                                password,
                                            }),
                                        )
                                    }
                                    onConfirmPasswordChange={
                                        setConfirmPassword
                                    }
                                    onTogglePassword={() =>
                                        setShowPassword(
                                            (current) =>
                                                !current,
                                        )
                                    }
                                    onToggleConfirmPassword={() =>
                                        setShowConfirmPassword(
                                            (current) =>
                                                !current,
                                        )
                                    }
                                    onTermsChange={
                                        setTermsAccepted
                                    }
                                />
                            ) : null}

                            {notice ? (
                                <Notice
                                    type={notice.type}
                                    text={notice.text}
                                />
                            ) : null}

                            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                {step !== "role" ? (
                                    <button
                                        type="button"
                                        onClick={goBack}
                                        disabled={
                                            loading ||
                                            otpLoading !== null
                                        }
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary disabled:opacity-50"
                                    >
                                        <ArrowLeft
                                            size={16}
                                            aria-hidden="true"
                                        />
                                        Back
                                    </button>
                                ) : (
                                    <span />
                                )}

                                {step ===
                                "security" ? (
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-wait disabled:translate-y-0 disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <Loader2
                                                size={17}
                                                className="animate-spin"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <KeyRound
                                                size={17}
                                                aria-hidden="true"
                                            />
                                        )}
                                        {loading
                                            ? "Creating account…"
                                            : "Create account"}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={goForward}
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-black text-white transition hover:bg-primary"
                                    >
                                        Continue
                                        <ArrowRight
                                            size={16}
                                            aria-hidden="true"
                                        />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </main>
    );
}

function RoleStep({
                      selectedRole,
                      onSelect,
                  }: {
    selectedRole: AccountRole;
    onSelect: (
        role: AccountRole,
    ) => void;
}) {
    return (
        <div>
            <SectionIntro
                eyebrow="Account type"
                title="How will you use PropYours?"
                description="Choose the role that best matches your property activity. This shapes your profile and the tools shown after login."
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {ROLE_OPTIONS.map(
                    (option) => {
                        const Icon =
                            option.icon;
                        const selected =
                            selectedRole ===
                            option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                aria-pressed={
                                    selected
                                }
                                onClick={() =>
                                    onSelect(
                                        option.value,
                                    )
                                }
                                className={`relative flex min-h-36 items-start gap-4 rounded-2xl border p-5 text-left transition ${
                                    selected
                                        ? "border-primary bg-teal-50 ring-2 ring-primary/10"
                                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg"
                                }`}
                            >
                <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        selected
                            ? "bg-primary text-white"
                            : "bg-slate-50 text-slate-500"
                    }`}
                >
                  <Icon
                      size={20}
                      aria-hidden="true"
                  />
                </span>

                                <span className="min-w-0">
                  <span className="block text-sm font-black text-slate-950">
                    {option.label}
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-slate-500">
                    {
                        option.description
                    }
                  </span>
                </span>

                                {selected ? (
                                    <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
                    <Check
                        size={14}
                        aria-hidden="true"
                    />
                  </span>
                                ) : null}
                            </button>
                        );
                    },
                )}
            </div>
        </div>
    );
}

function IdentityStep({
                          form,

                          emailOtp,
                          emailOtpSent,
                          emailVerified,
                          emailOtpLoading,
                          emailResendSeconds,

                          otp,
                          otpSent,
                          phoneVerified,
                          otpLoading,
                          resendSeconds,

                          onFormChange,

                          onEmailChange,
                          onEmailOtpChange,
                          onSendEmailOtp,
                          onVerifyEmailOtp,

                          onPhoneChange,
                          onOtpChange,
                          onSendOtp,
                          onVerifyOtp,
                      }: {
    form: SignupForm;

    emailOtp: string;

    emailOtpSent: boolean;

    emailVerified: boolean;

    emailOtpLoading:
        | "send"
        | "verify"
        | null;

    emailResendSeconds:
        number;

    otp: string;

    otpSent: boolean;

    phoneVerified: boolean;

    otpLoading:
        | "send"
        | "verify"
        | null;

    resendSeconds:
        number;

    onFormChange: (
        patch: Partial<SignupForm>,
    ) => void;

    onEmailChange: (
        value: string,
    ) => void;

    onEmailOtpChange: (
        value: string,
    ) => void;

    onSendEmailOtp:
        () => void;

    onVerifyEmailOtp:
        () => void;

    onPhoneChange: (
        value: string,
    ) => void;

    onOtpChange: (
        value: string,
    ) => void;

    onSendOtp:
        () => void;

    onVerifyOtp:
        () => void;
}) {
    return (
        <div>
            <SectionIntro
                eyebrow="Contact verification"
                title="Tell us who you are"
                description="Verify your email and phone number before creating your PropYours account."
            />

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                    <FieldLabel>
                        Full name
                    </FieldLabel>

                    <span className="relative block">
                        <UserRound
                            size={17}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            aria-hidden="true"
                        />

                        <input
                            type="text"
                            value={
                                form.name
                            }
                            autoComplete="name"
                            onChange={(
                                event,
                            ) =>
                                onFormChange(
                                    {
                                        name:
                                        event
                                            .target
                                            .value,
                                    },
                                )
                            }
                            placeholder="Your full name"
                            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                        />
                    </span>
                </label>

                {/* EMAIL */}

                <div className="sm:col-span-2">
                    <FieldLabel>
                        Email address
                    </FieldLabel>

                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px]">
                        <span className="relative block">
                            <Mail
                                size={
                                    17
                                }
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                aria-hidden="true"
                            />

                            <input
                                type="email"
                                value={
                                    form.email
                                }
                                autoComplete="email"
                                inputMode="email"
                                disabled={
                                    emailVerified
                                }
                                onChange={(
                                    event,
                                ) =>
                                    onEmailChange(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="you@example.com"
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:border-teal-100 disabled:bg-teal-50 disabled:text-slate-700"
                            />

                            {emailVerified ? (
                                <CheckCircle2
                                    size={
                                        17
                                    }
                                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-primary"
                                    aria-hidden="true"
                                />
                            ) : null}
                        </span>

                        <button
                            type="button"
                            onClick={
                                onSendEmailOtp
                            }
                            disabled={
                                emailVerified ||
                                emailOtpLoading !==
                                null ||
                                emailResendSeconds >
                                0
                            }
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-black text-white shadow-md shadow-primary/15 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {emailOtpLoading ===
                            "send" ? (
                                <Loader2
                                    size={
                                        15
                                    }
                                    className="animate-spin"
                                    aria-hidden="true"
                                />
                            ) : emailVerified ? (
                                <Check
                                    size={
                                        15
                                    }
                                    aria-hidden="true"
                                />
                            ) : (
                                <Mail
                                    size={
                                        15
                                    }
                                    aria-hidden="true"
                                />
                            )}

                            {emailVerified
                                ? "Verified"
                                : emailResendSeconds >
                                0
                                    ? `Resend in ${emailResendSeconds}s`
                                    : emailOtpSent
                                        ? "Resend code"
                                        : "Verify email"}
                        </button>
                    </div>

                    <p className="mt-2 text-[10px] leading-5 text-slate-400">
                        We&apos;ll send
                        a six-digit
                        verification
                        code to this
                        email address.
                    </p>
                </div>

                {emailOtpSent &&
                !emailVerified ? (
                    <div className="sm:col-span-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                <label className="min-w-0 flex-1">
                                    <FieldLabel>
                                        Email
                                        verification
                                        code
                                    </FieldLabel>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={
                                            6
                                        }
                                        value={
                                            emailOtp
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            onEmailOtpChange(
                                                event.target.value
                                                    .replace(
                                                        /\D/g,
                                                        "",
                                                    )
                                                    .slice(
                                                        0,
                                                        6,
                                                    ),
                                            )
                                        }
                                        placeholder="000000"
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-center text-lg font-black tracking-[0.35em] text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    />
                                </label>

                                <button
                                    type="button"
                                    onClick={
                                        onVerifyEmailOtp
                                    }
                                    disabled={
                                        emailOtpLoading !==
                                        null ||
                                        emailOtp.length !==
                                        6
                                    }
                                    className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-xs font-black text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {emailOtpLoading ===
                                    "verify" ? (
                                        <Loader2
                                            size={
                                                15
                                            }
                                            className="animate-spin"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <BadgeCheck
                                            size={
                                                15
                                            }
                                            aria-hidden="true"
                                        />
                                    )}

                                    Verify
                                    email
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}

                {emailVerified ? (
                    <div className="sm:col-span-2 flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                            <CheckCircle2
                                size={
                                    18
                                }
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <p className="text-sm font-black text-slate-950">
                                Email
                                verified
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-600">
                                This email
                                address is
                                ready to be
                                attached to
                                the new
                                account.
                            </p>
                        </div>
                    </div>
                ) : null}

                {/* PHONE */}

                <div className="sm:col-span-2">
                    <FieldLabel>
                        Phone number
                    </FieldLabel>

                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px]">
                        <span className="relative block">
                            <Phone
                                size={
                                    17
                                }
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                aria-hidden="true"
                            />

                            <input
                                type="tel"
                                value={
                                    form.phone
                                }
                                autoComplete="tel"
                                inputMode="tel"
                                disabled={
                                    phoneVerified
                                }
                                onChange={(
                                    event,
                                ) =>
                                    onPhoneChange(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="+91 98765 43210"
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:border-teal-100 disabled:bg-teal-50 disabled:text-slate-700"
                            />

                            {phoneVerified ? (
                                <CheckCircle2
                                    size={
                                        17
                                    }
                                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-primary"
                                    aria-hidden="true"
                                />
                            ) : null}
                        </span>

                        <button
                            type="button"
                            onClick={
                                onSendOtp
                            }
                            disabled={
                                phoneVerified ||
                                otpLoading !==
                                null ||
                                resendSeconds >
                                0
                            }
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-black text-white shadow-md shadow-primary/15 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {otpLoading ===
                            "send" ? (
                                <Loader2
                                    size={
                                        15
                                    }
                                    className="animate-spin"
                                    aria-hidden="true"
                                />
                            ) : phoneVerified ? (
                                <Check
                                    size={
                                        15
                                    }
                                    aria-hidden="true"
                                />
                            ) : (
                                <MessageSquareText
                                    size={
                                        15
                                    }
                                    aria-hidden="true"
                                />
                            )}

                            {phoneVerified
                                ? "Verified"
                                : resendSeconds >
                                0
                                    ? `Resend in ${resendSeconds}s`
                                    : otpSent
                                        ? "Resend code"
                                        : "Send code"}
                        </button>
                    </div>

                    <p className="mt-2 text-[10px] leading-5 text-slate-400">
                        Use a number that
                        can receive SMS.
                        The verification
                        code expires after
                        10 minutes.
                    </p>
                </div>

                {otpSent &&
                !phoneVerified ? (
                    <div className="sm:col-span-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                <label className="min-w-0 flex-1">
                                    <FieldLabel>
                                        Phone
                                        verification
                                        code
                                    </FieldLabel>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={
                                            6
                                        }
                                        value={
                                            otp
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            onOtpChange(
                                                event.target.value
                                                    .replace(
                                                        /\D/g,
                                                        "",
                                                    )
                                                    .slice(
                                                        0,
                                                        6,
                                                    ),
                                            )
                                        }
                                        placeholder="000000"
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-center text-lg font-black tracking-[0.35em] text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    />
                                </label>

                                <button
                                    type="button"
                                    onClick={
                                        onVerifyOtp
                                    }
                                    disabled={
                                        otpLoading !==
                                        null ||
                                        otp.length !==
                                        6
                                    }
                                    className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-xs font-black text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {otpLoading ===
                                    "verify" ? (
                                        <Loader2
                                            size={
                                                15
                                            }
                                            className="animate-spin"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <BadgeCheck
                                            size={
                                                15
                                            }
                                            aria-hidden="true"
                                        />
                                    )}

                                    Verify
                                    phone
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}

                {phoneVerified ? (
                    <div className="sm:col-span-2 flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                            <CheckCircle2
                                size={
                                    18
                                }
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <p className="text-sm font-black text-slate-950">
                                Phone
                                verified
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-600">
                                This number
                                is ready to
                                be attached
                                to the new
                                account.
                            </p>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function SecurityStep({
                          password,
                          confirmPassword,
                          passwordScore,
                          showPassword,
                          showConfirmPassword,
                          termsAccepted,
                          onPasswordChange,
                          onConfirmPasswordChange,
                          onTogglePassword,
                          onToggleConfirmPassword,
                          onTermsChange,
                      }: {
    password: string;
    confirmPassword: string;
    passwordScore: number;
    showPassword: boolean;
    showConfirmPassword: boolean;
    termsAccepted: boolean;
    onPasswordChange: (
        value: string,
    ) => void;
    onConfirmPasswordChange: (
        value: string,
    ) => void;
    onTogglePassword: () => void;
    onToggleConfirmPassword: () => void;
    onTermsChange: (
        value: boolean,
    ) => void;
}) {
    const passwordsMatch =
        confirmPassword.length > 0 &&
        password === confirmPassword;

    return (
        <div>
            <SectionIntro
                eyebrow="Secure account"
                title="Create your password"
                description="Use a unique password and confirm it before creating the account."
            />

            <div className="mt-6 space-y-5">
                <label className="block">
                    <FieldLabel>
                        Password
                    </FieldLabel>

                    <span className="relative block">
            <LockKeyhole
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
            />

            <input
                type={
                    showPassword
                        ? "text"
                        : "password"
                }
                value={password}
                autoComplete="new-password"
                onChange={(event) =>
                    onPasswordChange(
                        event.target.value,
                    )
                }
                placeholder="At least 8 characters"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            />

            <button
                type="button"
                onClick={
                    onTogglePassword
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
                      aria-hidden="true"
                  />
              ) : (
                  <Eye
                      size={17}
                      aria-hidden="true"
                  />
              )}
            </button>
          </span>
                </label>

                <div>
                    <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              Password strength
            </span>

                        <span
                            className={`text-[10px] font-black ${
                                passwordScore >= 4
                                    ? "text-primary"
                                    : passwordScore >=
                                    2
                                        ? "text-amber-600"
                                        : "text-red-500"
                            }`}
                        >
              {password
                  ? getPasswordLabel(
                      passwordScore,
                  )
                  : "Not set"}
            </span>
                    </div>

                    <div className="mt-2 grid grid-cols-5 gap-1.5">
                        {Array.from({
                            length: 5,
                        }).map((_, index) => (
                            <span
                                key={index}
                                className={`h-1.5 rounded-full transition ${
                                    index <
                                    passwordScore
                                        ? passwordScore >=
                                        4
                                            ? "bg-primary"
                                            : passwordScore >=
                                            2
                                                ? "bg-amber-400"
                                                : "bg-red-400"
                                        : "bg-slate-200"
                                }`}
                            />
                        ))}
                    </div>

                    <div className="mt-3 grid gap-2 text-[10px] font-bold text-slate-500 sm:grid-cols-2">
                        <PasswordCriterion
                            met={
                                password.length >= 8
                            }
                            label="At least 8 characters"
                        />
                        <PasswordCriterion
                            met={/[A-Z]/.test(
                                password,
                            )}
                            label="One uppercase letter"
                            optional
                        />
                        <PasswordCriterion
                            met={/\d/.test(
                                password,
                            )}
                            label="One number"
                            optional
                        />
                        <PasswordCriterion
                            met={/[^A-Za-z0-9]/.test(
                                password,
                            )}
                            label="One symbol recommended"
                            optional
                        />
                    </div>
                </div>

                <label className="block">
                    <FieldLabel>
                        Confirm password
                    </FieldLabel>

                    <span className="relative block">
            <KeyRound
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
            />

            <input
                type={
                    showConfirmPassword
                        ? "text"
                        : "password"
                }
                value={
                    confirmPassword
                }
                autoComplete="new-password"
                onChange={(event) =>
                    onConfirmPasswordChange(
                        event.target.value,
                    )
                }
                placeholder="Enter the password again"
                className={`h-12 w-full rounded-xl border bg-slate-50 pl-11 pr-12 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                    confirmPassword &&
                    !passwordsMatch
                        ? "border-red-200 focus:border-red-400 focus:ring-red-100"
                        : passwordsMatch
                            ? "border-teal-200 focus:border-primary focus:ring-primary/10"
                            : "border-slate-200 focus:border-primary focus:ring-primary/10"
                }`}
            />

            <button
                type="button"
                onClick={
                    onToggleConfirmPassword
                }
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-primary"
                aria-label={
                    showConfirmPassword
                        ? "Hide confirmed password"
                        : "Show confirmed password"
                }
            >
              {showConfirmPassword ? (
                  <EyeOff
                      size={17}
                      aria-hidden="true"
                  />
              ) : (
                  <Eye
                      size={17}
                      aria-hidden="true"
                  />
              )}
            </button>
          </span>

                    {confirmPassword ? (
                        <p
                            className={`mt-2 flex items-center gap-1.5 text-[10px] font-black ${
                                passwordsMatch
                                    ? "text-primary"
                                    : "text-red-500"
                            }`}
                        >
                            {passwordsMatch ? (
                                <Check
                                    size={12}
                                    aria-hidden="true"
                                />
                            ) : (
                                <AlertTriangle
                                    size={12}
                                    aria-hidden="true"
                                />
                            )}
                            {passwordsMatch
                                ? "Passwords match"
                                : "Passwords do not match"}
                        </p>
                    ) : null}
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <input
                        type="checkbox"
                        checked={
                            termsAccepted
                        }
                        onChange={(event) =>
                            onTermsChange(
                                event.target.checked,
                            )
                        }
                        className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                    />

                    <span className="text-xs leading-5 text-slate-600">
            I agree to the{" "}
                        <Link
                            href="/terms"
                            target="_blank"
                            className="font-black text-primary"
                        >
              Terms
            </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            target="_blank"
                            className="font-black text-primary"
                        >
              Privacy Policy
            </Link>
            .
          </span>
                </label>
            </div>
        </div>
    );
}

function SignupProgress({
                            activeStep,
                        }: {
    activeStep: SignupStep;
}) {
    const activeIndex =
        STEP_ORDER.indexOf(
            activeStep,
        );

    return (
        <div className="mt-7">
            <div className="grid grid-cols-3 gap-2">
                {STEP_ORDER.map(
                    (step, index) => {
                        const complete =
                            index < activeIndex;
                        const active =
                            step === activeStep;

                        return (
                            <div
                                key={step}
                                className={`rounded-xl border p-3 transition ${
                                    active
                                        ? "border-primary bg-teal-50"
                                        : complete
                                            ? "border-teal-100 bg-white"
                                            : "border-slate-200 bg-slate-50"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                  <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${
                          active
                              ? "bg-primary text-white"
                              : complete
                                  ? "bg-teal-100 text-primary"
                                  : "bg-white text-slate-400"
                      }`}
                  >
                    {complete ? (
                        <Check
                            size={13}
                            aria-hidden="true"
                        />
                    ) : (
                        STEP_LABELS[
                            step
                            ].number
                    )}
                  </span>

                                    <span
                                        className={`truncate text-[10px] font-black ${
                                            active
                                                ? "text-primary"
                                                : complete
                                                    ? "text-slate-700"
                                                    : "text-slate-400"
                                        }`}
                                    >
                    {
                        STEP_LABELS[
                            step
                            ].shortLabel
                    }
                  </span>
                                </div>
                            </div>
                        );
                    },
                )}
            </div>
        </div>
    );
}

function SectionIntro({
                          eyebrow,
                          title,
                          description,
                      }: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                {eyebrow}
            </p>
            <h3 className="mt-2 font-heading text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
                {title}
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {description}
            </p>
        </div>
    );
}

function FieldLabel({
                        children,
                    }: {
    children: React.ReactNode;
}) {
    return (
        <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.13em] text-slate-500">
      {children}
    </span>
    );
}

function Notice({
                    type,
                    text,
                }: {
    type: NoticeType;
    text: string;
}) {
    const styles =
        type === "success"
            ? {
                wrapper:
                    "border-teal-100 bg-teal-50 text-slate-700",
                icon:
                    "bg-white text-primary",
                Icon: CheckCircle2,
            }
            : type === "info"
                ? {
                    wrapper:
                        "border-sky-100 bg-sky-50 text-slate-700",
                    icon:
                        "bg-white text-sky-600",
                    Icon: Clock3,
                }
                : {
                    wrapper:
                        "border-red-100 bg-red-50 text-red-700",
                    icon:
                        "bg-white text-red-600",
                    Icon: AlertTriangle,
                };

    const Icon = styles.Icon;

    return (
        <div
            role={
                type === "error"
                    ? "alert"
                    : "status"
            }
            className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 ${styles.wrapper}`}
        >
      <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ${styles.icon}`}
      >
        <Icon
            size={17}
            aria-hidden="true"
        />
      </span>

            <p className="pt-1 text-sm font-bold leading-6">
                {text}
            </p>
        </div>
    );
}

function PasswordCriterion({
                               met,
                               label,
                               optional = false,
                           }: {
    met: boolean;
    label: string;
    optional?: boolean;
}) {
    return (
        <span
            className={`flex items-center gap-1.5 ${
                met
                    ? "text-primary"
                    : "text-slate-400"
            }`}
        >
      <span
          className={`flex h-4 w-4 items-center justify-center rounded-full ${
              met
                  ? "bg-teal-100"
                  : "bg-slate-100"
          }`}
      >
        <Check
            size={10}
            aria-hidden="true"
        />
      </span>

            {label}
            {optional ? " · optional" : ""}
    </span>
    );
}

function SignupBenefit({
                           icon: Icon,
                           label,
                       }: {
    icon: LucideIcon;
    label: string;
}) {
    return (
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.045] p-3">
            <Icon
                size={15}
                className="shrink-0 text-teal-300"
                aria-hidden="true"
            />
            <span className="text-xs font-bold text-slate-300">
        {label}
      </span>
        </div>
    );
}

function SignupSuccess({
                           role,
                           email,
                           loginHref,
                       }: {
    role: RoleOption;
    email: string;
    loginHref: string;
}) {
    const RoleIcon = role.icon;

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f4f7f6] px-4 pb-10 pt-24 font-body sm:px-6 lg:pt-28">
            <div className="w-full max-w-3xl overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white shadow-[0_32px_100px_rgba(15,23,42,0.14)]">
                <div className="relative overflow-hidden bg-slate-950 p-8 text-center text-white sm:p-12">
                    <div
                        className="pointer-events-none absolute left-1/2 top-[-10rem] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-teal-500/25 blur-3xl"
                        aria-hidden="true"
                    />

                    <div className="relative">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-teal-300 text-slate-950 shadow-xl">
              <CheckCircle2
                  size={29}
                  aria-hidden="true"
              />
            </span>

                        <div className="mb-6 flex justify-center">
                            <BrandLogo
                                href={undefined}
                                className="h-20 w-full max-w-[320px]"
                                imageClassName="object-center"
                            />
                        </div>

                        <p className="mt-7 text-[10px] font-black uppercase tracking-[0.16em] text-teal-300">
                            Account created
                        </p>

                        <h1 className="mt-3 font-heading text-4xl font-black tracking-[-0.045em] sm:text-5xl">
                            Welcome to PropYours.
                        </h1>

                        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">
                            Your phone has been verified and
                            your account is ready. Sign in
                            with{" "}
                            <span className="font-black text-white">
                {email}
              </span>
                            .
                        </p>
                    </div>
                </div>

                <div className="p-6 sm:p-9">
                    <div className="flex items-start gap-4 rounded-2xl border border-teal-100 bg-teal-50 p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
              <RoleIcon
                  size={20}
                  aria-hidden="true"
              />
            </span>

                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-primary">
                                Account type
                            </p>
                            <p className="mt-2 text-lg font-black text-slate-950">
                                {role.label}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-600">
                                {role.highlight}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <CompletionItem
                            icon={BadgeCheck}
                            label="Phone verified"
                        />
                        <CompletionItem
                            icon={LockKeyhole}
                            label="Password created"
                        />
                        <CompletionItem
                            icon={UserRound}
                            label="Profile ready"
                        />
                    </div>

                    <Link
                        href={loginHref}
                        className="mt-7 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-dark"
                    >
                        Continue to sign in
                        <ArrowRight
                            size={16}
                            aria-hidden="true"
                        />
                    </Link>
                </div>
            </div>
        </main>
    );
}

function CompletionItem({
                            icon: Icon,
                            label,
                        }: {
    icon: LucideIcon;
    label: string;
}) {
    return (
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <Icon
                size={15}
                className="shrink-0 text-primary"
                aria-hidden="true"
            />
            <span className="text-[10px] font-black text-slate-600">
        {label}
      </span>
        </div>
    );
}

function SignupFallback() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f4f7f6]">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <Loader2
                    size={19}
                    className="animate-spin text-primary"
                    aria-hidden="true"
                />
                <span className="text-sm font-black text-slate-600">
          Preparing signup…
        </span>
            </div>
        </main>
    );
}

export default function SignupPage() {
    return (
        <Suspense
            fallback={<SignupFallback />}
        >
            <SignupFormContent />
        </Suspense>
    );
}
