"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "User",
    });

    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSendOtp = async () => {
        setOtpLoading(true);
        setMessage("");

        const res = await fetch("/api/auth/send-phone-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                phone: form.phone,
                email: form.email,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            setMessage(data.error);
        } else {
            setOtpSent(true);
            setMessage("OTP sent to your phone.");
        }

        setOtpLoading(false);
    };

    const handleVerifyOtp = async () => {
        setOtpLoading(true);
        setMessage("");

        const res = await fetch("/api/auth/verify-phone-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                phone: form.phone,
                otp,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            setMessage(data.error);
        } else {
            setPhoneVerified(true);
            setMessage("Phone number verified.");
        }

        setOtpLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phoneVerified) {
            setMessage("Please verify your phone number before creating an account.");
            return;
        }

        setLoading(true);
        setMessage("");

        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {
            setMessage(data.error);
        } else {
            setMessage("Account created! You can login now.");
        }

        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#f8fbfb] to-[#eef5f5] flex items-start justify-center px-6 pt-28 pb-10">
            <div className="w-full max-w-5xl bg-white rounded-[1.75rem] shadow-[0_18px_50px_-18px_rgba(0,0,0,0.18)] border border-gray-100 overflow-hidden flex">

                {/* LEFT */}
                <div className="w-full lg:w-1/2 px-8 py-8">

                    <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                        Create Account
                    </h1>

                    <p className="text-sm text-gray-500 mb-7">
                        Join{" "}
                        <span className="text-primary font-semibold">PROPYOURS</span>{" "}
                        and start exploring properties
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Role Selection */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                                I am a
                            </label>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: "User", label: "Buyer", icon: "👤" },
                                    { id: "Property Owner", label: "Owner", icon: "🏠" },
                                    { id: "Agent", label: "Agent", icon: "🏢" },
                                    { id: "Builder", label: "Builder", icon: "🏗️" },
                                ].map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setForm({ ...form, role: role.id })}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all text-left ${
                                            form.role === role.id
                                                ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                                                : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                                        }`}
                                    >
                                        <span className="text-lg">{role.icon}</span>
                                        <span className="text-sm">{role.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                Full Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={form.name}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={form.email}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                Phone Number
                            </label>

                            <div className="flex gap-2">
                                <input
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    value={form.phone}
                                    disabled={phoneVerified}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium disabled:opacity-70"
                                    onChange={(e) => {
                                        setForm({ ...form, phone: e.target.value });
                                        setOtpSent(false);
                                        setPhoneVerified(false);
                                        setOtp("");
                                    }}
                                />

                                <button
                                    type="button"
                                    disabled={otpLoading || !form.phone || phoneVerified}
                                    onClick={handleSendOtp}
                                    className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {phoneVerified ? "Verified" : otpSent ? "Resend" : "Send OTP"}
                                </button>
                            </div>
                        </div>

                        {/* OTP */}
                        {otpSent && !phoneVerified && (
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                    Enter OTP
                                </label>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="6-digit OTP"
                                        value={otp}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                        onChange={(e) =>
                                            setOtp(e.target.value.replace(/\D/g, ""))
                                        }
                                    />

                                    <button
                                        type="button"
                                        disabled={otpLoading || otp.length !== 6}
                                        onClick={handleVerifyOtp}
                                        className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Create a password"
                                value={form.password}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                onChange={(e) =>
                                    setForm({ ...form, password: e.target.value })
                                }
                            />
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={loading || !phoneVerified}
                            className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                        {/* Message */}
                        {message && (
                            <p
                                className={`text-sm text-center font-bold ${
                                    message.includes("created") ||
                                    message.includes("sent") ||
                                    message.includes("verified")
                                        ? "text-green-600"
                                        : "text-red-500"
                                }`}
                            >
                                {message}
                            </p>
                        )}
                    </form>

                    {/* Login */}
                    <p className="text-sm text-gray-500 mt-6 text-center">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-primary font-semibold hover:underline"
                        >
                            Login
                        </Link>
                    </p>
                </div>

                {/* RIGHT */}
                <div className="hidden lg:flex w-1/2 bg-white items-center justify-center relative">
                    <div className="absolute left-0 top-0 h-full w-px bg-gray-100" />

                    <Image
                        src="/signuppageimage.png"
                        alt="Real Estate"
                        width={340}
                        height={340}
                        className="relative z-10"
                    />
                </div>
            </div>
        </main>
    );
}