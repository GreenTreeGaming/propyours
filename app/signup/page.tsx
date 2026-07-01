"use client";

import { useState } from "react";
import Image from "next/image";

export default function SignupPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "User",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const res = await fetch("/api/auth/signup", {
            method: "POST",
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
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all text-left ${form.role === role.id
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
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Create a password"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                onChange={(e) =>
                                    setForm({ ...form, password: e.target.value })
                                }
                            />
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-[0.98] mt-2"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                        {/* Message */}
                        {message && (
                            <p className={`text-sm text-center font-bold ${message.includes("Account created") ? "text-green-600" : "text-red-500"}`}>{message}</p>
                        )}
                    </form>

                    {/* Login */}
                    <p className="text-sm text-gray-500 mt-6 text-center">
                        Already have an account?{" "}
                        <a
                            href="/login"
                            className="text-primary font-semibold hover:underline"
                        >
                            Login
                        </a>
                    </p>
                </div>

                {/* RIGHT */}
                <div className="hidden lg:flex w-1/2 bg-white items-center justify-center relative">

                    {/* divider */}
                    <div className="absolute left-0 top-0 h-full w-px bg-gray-100"></div>

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