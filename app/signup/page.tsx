"use client";

import { useState } from "react";
import Image from "next/image";

export default function SignupPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
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
        <main className="min-h-screen bg-gradient-to-br from-[#f8fbfb] to-[#eef5f5] flex items-center justify-center px-6">
            <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden flex">

                {/* LEFT */}
                <div className="w-full lg:w-1/2 px-10 py-12">

                    <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                        Create Account
                    </h1>

                    <p className="text-sm text-gray-500 mb-10">
                        Join{" "}
                        <span className="text-primary font-semibold">PROPYOURS</span>{" "}
                        and start exploring properties
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Name */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                onChange={(e) =>
                                    setForm({ ...form, password: e.target.value })
                                }
                            />
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-semibold transition-all shadow-md shadow-primary/20 active:scale-[0.98]"
                        >
                            {loading ? "Creating..." : "Sign Up"}
                        </button>

                        {/* Message */}
                        {message && (
                            <p className="text-sm text-center text-gray-600">{message}</p>
                        )}
                    </form>

                    {/* Login */}
                    <p className="text-sm text-gray-500 mt-10 text-center">
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
                        width={420}
                        height={420}
                        className="relative z-10"
                    />
                </div>
            </div>
        </main>
    );
}