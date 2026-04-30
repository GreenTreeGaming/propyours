"use client";

import { useState, useEffect } from "react";
import {
    User,
    Settings,
    LayoutDashboard,
    Building2,
    LogOut,
    Mail,
    Phone,
    UserCircle,
    Save,
    CheckCircle2,
    Heart,
    MapPin,
    Briefcase,
    FileText,
    Map,
    Bell,
    MessageSquare,
    ShieldAlert,
    Key,
    Trash2,
    X,
    Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import 'react-phone-number-input/style.css';
import PhoneInput, { getCountryCallingCode, getCountries } from 'react-phone-number-input';
import en from 'react-phone-number-input/locale/en';

const PRIORITIZED_COUNTRIES = ['IN', 'US', ...getCountries().filter(c => c !== 'IN' && c !== 'US')];

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("Profile");
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [country, setCountry] = useState<any>("IN");

    // MOCK SETTINGS STATE (For UI demonstration)
    const [emailNotif, setEmailNotif] = useState(true);
    const [smsNotif, setSmsNotif] = useState(false);
    const [twoFactor, setTwoFactor] = useState(true);

    // CHANGE PASSWORD MODAL STATE
    const [isPassModalOpen, setIsPassModalOpen] = useState(false);
    const [passFormData, setPassFormData] = useState({ oldPassword: "", newPassword: "" });
    const [passUpdating, setPassUpdating] = useState(false);
    const [passError, setPassError] = useState("");
    const [passSuccess, setPassSuccess] = useState(false);

    // DELETE ACCOUNT MODAL STATE
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

    // Form data
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "User",
        bio: "",
        company: "",
        address: "",
        city: ""
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setFormData({
                name: parsedUser.name || "",
                email: parsedUser.email || "",
                phone: parsedUser.phone || "",
                role: parsedUser.role || "User",
                bio: parsedUser.bio || "",
                company: parsedUser.company || "",
                address: parsedUser.address || "",
                city: parsedUser.city || ""
            });

            // Check if we need to fetch more fresh data
            fetchUserData(parsedUser.id || parsedUser._id);
        } else {
            window.location.href = "/login";
        }
    }, []);

    const fetchUserData = async (userId: string) => {
        try {
            const res = await fetch(`/api/user/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setFormData({
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    role: data.role || "User",
                    bio: data.bio || "",
                    company: data.company || "",
                    address: data.address || "",
                    city: data.city || ""
                });
                localStorage.setItem("user", JSON.stringify(data));
            }
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setSuccessMessage("");

        try {
            console.log("Saving Profile Data:", formData);
            const userId = user.id || user._id;
            const res = await fetch(`/api/user/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setSuccessMessage("Profile updated successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                const error = await res.json();
                alert(error.error || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setUpdating(false);
        }
    };

    const handlePassSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passFormData.newPassword.length < 6) {
            setPassError("New password must be at least 6 characters.");
            return;
        }

        setPassUpdating(true);
        setPassError("");
        setPassSuccess(false);

        try {
            const userId = user.id || user._id;
            const res = await fetch(`/api/user/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    oldPassword: passFormData.oldPassword,
                    newPassword: passFormData.newPassword
                })
            });

            if (res.ok) {
                setPassSuccess(true);
                setPassFormData({ oldPassword: "", newPassword: "" });
                setTimeout(() => {
                    setIsPassModalOpen(false);
                    setPassSuccess(false);
                }, 2000);
            } else {
                const error = await res.json();
                setPassError(error.error || "Failed to update password");
            }
        } catch (error) {
            setPassError("Error updating password. Try again.");
        } finally {
            setPassUpdating(false);
        }
    };

    const handleChangePassword = () => {
        setIsPassModalOpen(true);
        setPassError("");
        setPassSuccess(false);
    };

    const handleDeleteAccount = () => {
        setIsDeleteModalOpen(true);
        setDeleteConfirmInput("");
    };

    const handleDeleteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (deleteConfirmInput !== "DELETE") {
            alert("Please type DELETE to confirm.");
            return;
        }

        setUpdating(true);
        try {
            const userId = user.id || user._id;
            const res = await fetch(`/api/user/${userId}`, {
                method: "DELETE"
            });

            if (res.ok) {
                alert("Account deleted successfully.");
                handleLogout();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to delete account");
            }
        } catch (error) {
            alert("Error deleting account. Try again.");
        } finally {
            setUpdating(false);
            setIsDeleteModalOpen(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    const menuItems = [
        { name: "Profile", icon: UserCircle },
        { name: "My Properties", icon: Building2, href: "/manage-properties" },
        { name: "Saved Properties", icon: Heart, href: "/favorites" },
        { name: "Settings", icon: Settings },
    ];

    if (loading && !user) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFA]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <main className="min-h-screen bg-[#F8FAFA] pt-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-2">
                            <div className="pb-4 mb-4 border-b border-gray-50 text-center">
                                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-3">
                                    {user?.name?.[0]?.toUpperCase()}
                                </div>
                                <h3 className="font-bold text-gray-900">{user?.name}</h3>
                                <p className="text-xs text-gray-500 mb-2">{user?.email}</p>
                                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
                                    {user?.role || "User"}
                                </span>
                            </div>

                            <nav className="space-y-1">
                                {menuItems.map((item) => (
                                    item.href ? (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-100"
                                        >
                                            <item.icon size={18} />
                                            {item.name}
                                        </Link>
                                    ) : (
                                        <button
                                            key={item.name}
                                            onClick={() => setActiveTab(item.name)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.name
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                                }`}
                                        >
                                            <item.icon size={18} />
                                            {item.name}
                                        </button>
                                    )
                                ))}

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all mt-4"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 lg:p-12">

                            <AnimatePresence mode="wait">
                                {activeTab === "Profile" && (
                                    <motion.div
                                        key="profile"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="max-w-2xl"
                                    >
                                        <div className="mb-10">
                                            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">My Profile</h1>
                                            <p className="text-gray-500 font-medium">Manage your personal information and contact details.</p>
                                        </div>

                                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                                            <div className="grid gap-6">
                                                {/* Name Field */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-500 ml-1">Full Name</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <UserCircle size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                            className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                            placeholder="Enter your name"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Email Field */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-500 ml-1">Email Address</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <Mail size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
                                                        </div>
                                                        <input
                                                            type="email"
                                                            value={formData.email}
                                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                            className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                            placeholder="Enter your email"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Phone Field */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-500 ml-1">
                                                        Phone Number
                                                    </label>

                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <Phone size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
                                                        </div>

                                                        <PhoneInput
                                                            international
                                                            defaultCountry="IN"
                                                            countries={PRIORITIZED_COUNTRIES as any}
                                                            value={formData.phone}
                                                            onChange={(val) => setFormData({ ...formData, phone: val || "" })}
                                                            placeholder="Enter phone number"
                                                            className="phone-input-clean"
                                                        />
                                                    </div>

                                                    <style jsx global>{`
    .phone-input-clean {
      display: flex;
      align-items: center;
      width: 100%;
      background: #f9fafb;
      border-radius: 1rem;
      padding-left: 44px;
      padding-right: 12px;
      height: 52px;
      transition: all 0.2s;
      border: 1px solid transparent;
    }

    .phone-input-clean:focus-within {
      background: white;
      border-color: #14b8a6;
      box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.08);
    }

    .phone-input-clean .PhoneInputCountry {
      margin-right: 6px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .phone-input-clean .PhoneInputCountryIcon {
      width: 18px !important;
      height: auto !important;
    }

    .phone-input-clean .PhoneInputInput {
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      font-weight: 700;
      color: #111827;
      width: 100%;
    }
  `}</style>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Role Field */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-500 ml-1">Account Type</label>
                                                    <div className="relative group">
                                                        <select
                                                            value={formData.role}
                                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                            className="block w-full px-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                                                        >
                                                            <option value="User">Standard User</option>
                                                            <option value="Property Owner">Property Owner</option>
                                                            <option value="Agent">Real Estate Agent</option>
                                                            <option value="Builder">Builder / Developer</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Company Field (Optional based on role but good to have) */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-500 ml-1">Company / Agency Name</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <Briefcase size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={formData.company}
                                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                            className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                            placeholder="Agency or Company name"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* City Field */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-500 ml-1">City</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <Map size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={formData.city}
                                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                            className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                            placeholder="City you operate in"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Address Field */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-500 ml-1">Address Location</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <MapPin size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={formData.address}
                                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                            className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                            placeholder="Full address"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bio Field */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-500 ml-1">About You</label>
                                                <div className="relative group">
                                                    <div className="absolute top-4 left-0 pl-4 pointer-events-none">
                                                        <FileText size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
                                                    </div>
                                                    <textarea
                                                        value={formData.bio}
                                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                        rows={4}
                                                        className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                                        placeholder="Write a little bit about yourself, your experience, or what you're looking for..."
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-6 flex items-center gap-4">
                                                <button
                                                    type="submit"
                                                    disabled={updating}
                                                    className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                                                >
                                                    {updating ? (
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Save size={18} />
                                                            Save Changes
                                                        </>
                                                    )}
                                                </button>

                                                {successMessage && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="flex items-center gap-2 text-green-600 font-bold text-sm"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                        {successMessage}
                                                    </motion.div>
                                                )}
                                            </div>
                                        </form>
                                    </motion.div>
                                )}



                                {activeTab === "Settings" && (
                                    <motion.div
                                        key="settings"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <div className="mb-10">
                                            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Account Settings</h1>
                                            <p className="text-gray-500 font-medium">Manage preferences, notifications, and security.</p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Security Section */}
                                            <div className="bg-white border text-left border-gray-100 shadow-sm rounded-3xl p-8 transition-all hover:shadow-md">
                                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                                    <ShieldAlert className="text-primary" size={24} />
                                                    Security & Authentication
                                                </h3>

                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">Password Management</h4>
                                                        <p className="text-xs font-medium text-gray-500 mb-4">Secure your account by updating your password regularly.</p>

                                                        <button
                                                            onClick={handleChangePassword}
                                                            disabled={updating}
                                                            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                                                        >
                                                            <Key size={18} />
                                                            Change Password
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Danger Zone */}
                                            <div className="bg-red-50/50 border text-left border-red-100 shadow-sm rounded-3xl p-8">
                                                <h3 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-2">
                                                    Danger Zone
                                                </h3>
                                                <p className="text-sm font-medium text-gray-500 mb-6">Permanently delete your account and all associated properties. This action cannot be undone.</p>

                                                <button
                                                    onClick={handleDeleteAccount}
                                                    disabled={updating}
                                                    className="flex items-center justify-center gap-2 py-4 px-6 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                                                >
                                                    <Trash2 size={18} />
                                                    Delete Account
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            <AnimatePresence>
                {isPassModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPassModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative z-10"
                        >
                            <button
                                onClick={() => setIsPassModalOpen(false)}
                                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-full"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-8">
                                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                                    <Lock size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Security Update</h2>
                                <p className="text-sm font-medium text-gray-400">Change your account password securely.</p>
                            </div>

                            <form onSubmit={handlePassSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 ml-1">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passFormData.oldPassword}
                                        onChange={(e) => setPassFormData({ ...passFormData, oldPassword: e.target.value })}
                                        className="block w-full px-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 ml-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passFormData.newPassword}
                                        onChange={(e) => setPassFormData({ ...passFormData, newPassword: e.target.value })}
                                        className="block w-full px-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="••••••••"
                                    />
                                    <p className="text-[10px] text-gray-400 font-bold ml-1 uppercase tracking-wider">Minimum 6 characters</p>
                                </div>

                                {passError && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold text-center">
                                        {passError}
                                    </div>
                                )}

                                {passSuccess && (
                                    <div className="p-4 bg-green-50 text-green-600 rounded-2xl text-sm font-bold text-center flex items-center justify-center gap-2 transition-all">
                                        <CheckCircle2 size={18} />
                                        Password Updated!
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={passUpdating || passSuccess}
                                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 mt-4 h-[56px] flex items-center justify-center"
                                >
                                    {passUpdating ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        "Confirm Change"
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Account Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute inset-0 bg-red-900/10 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative z-10 border border-red-50"
                        >
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-full"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-8">
                                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
                                    <ShieldAlert size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Delete Account</h2>
                                <p className="text-sm font-medium text-gray-500 mt-2">
                                    This will permanently remove your profile and all your <span className="text-red-500 font-bold">listed properties</span>. This action is irreversible.
                                </p>
                            </div>

                            <form onSubmit={handleDeleteSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-900 ml-1 italic">
                                        Type <span className="text-red-600 uppercase font-black px-1.5 py-0.5 bg-red-50 rounded-md">DELETE</span> to confirm
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={deleteConfirmInput}
                                        onChange={(e) => setDeleteConfirmInput(e.target.value)}
                                        className="block w-full px-4 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-gray-300"
                                        placeholder="Type DELETE here..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={deleteConfirmInput !== "DELETE" || updating}
                                        className="flex-[1.5] bg-red-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 h-[56px] flex items-center justify-center"
                                    >
                                        {updating ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            "Permanently Delete"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
