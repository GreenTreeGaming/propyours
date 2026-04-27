"use client";

import { useState, useEffect } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect") || "/";

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {
            setMessage(data.error);
        } else {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            // Redirect back to intended page or home
            window.location.href = redirectPath;
        }
    };


    return (
        <main className="min-h-screen bg-gradient-to-br from-[#f8fbfb] to-[#eef5f5] flex items-center justify-center px-6">
            <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden flex">

                {/* LEFT */}
                <div className="w-full lg:w-1/2 px-10 py-12">

                    <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                        Welcome Back
                    </h1>

                    <p className="text-sm text-gray-500 mb-10">
                        Login to continue to{" "}
                        <span className="text-primary font-semibold">PROPYOURS</span>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">

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
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                onChange={(e) =>
                                    setForm({ ...form, password: e.target.value })
                                }
                            />
                        </div>

                        {/* Options */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-gray-500">
                                <input type="checkbox" className="accent-primary" />
                                Remember me
                            </label>

                            <a
                                href="#"
                                className="text-primary font-semibold hover:underline"
                            >
                                Forgot Password?
                            </a>
                        </div>

                        {/* Button */}
                        <button className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-semibold transition-all shadow-md shadow-primary/20 active:scale-[0.98]">
                            Login
                        </button>

                        {/* Error */}
                        {message && (
                            <p className="text-sm text-center text-red-500">{message}</p>
                        )}
                    </form>

                    {/* Signup */}
                    <p className="text-sm text-gray-500 mt-10 text-center">
                        Don’t have an account?{" "}
                        <a
                            href="/signup"
                            className="text-primary font-semibold hover:underline"
                        >
                            Sign Up
                        </a>
                    </p>
                </div>

                {/* RIGHT */}
                <div className="hidden lg:flex w-1/2 bg-white items-center justify-center relative">

                    {/* subtle divider line */}
                    <div className="absolute left-0 top-0 h-full w-px bg-gray-100"></div>

                    {/* soft glow (keep this for depth) */}
                    <div className="absolute w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl"></div>

                    <Image
                        src="/loginimage.png"
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