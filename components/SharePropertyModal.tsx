"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Share2, X, MessageCircle, Mail } from "lucide-react";

type SharePropertyModalProps = {
    isOpen: boolean;
    onClose: () => void;
    propertyTitle: string;
    shareUrl: string;
};

export default function SharePropertyModal({
    isOpen,
    onClose,
    propertyTitle,
    shareUrl,
}: SharePropertyModalProps) {
    const [copied, setCopied] = useState(false);
    const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

    const handleClose = () => {
        setCopied(false);
        onClose();
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setCopied(false);
                onClose();
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            // Try modern Clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
            } else {
                // Fallback for non-secure contexts or older browsers
                const textArea = document.createElement("textarea");
                textArea.value = shareUrl;
                document.body.appendChild(textArea);
                textArea.select();
                const successful = document.execCommand("copy");
                document.body.removeChild(textArea);
                if (successful) setCopied(true);
            }
        } catch (error) {
            console.error("Failed to copy share link:", error);
        }

        // Reset "Copied" state after delay
        setTimeout(() => setCopied(false), 2000);
    };


    const customMessage = `I just found this property on PropYours: ${propertyTitle}`;

    const handleNativeShare = async () => {
        if (!canNativeShare) return;

        try {
            await navigator.share({
                title: propertyTitle,
                text: customMessage,
                url: shareUrl,
            });
        } catch (error) {
            // Ignore AbortError (user cancelled)
            if ((error as Error).name !== "AbortError") {
                console.error("Native share failed:", error);
            }
        }

    };
    const encodedMessage = encodeURIComponent(customMessage);

    const encodedUrl = encodeURIComponent(shareUrl);

    const shareOptions = [
        {
            name: "WhatsApp",
            icon: <MessageCircle size={20} />,
            href: `https://wa.me/?text=${encodedMessage}%0A${encodedUrl}`,
            color: "hover:bg-green-50 hover:text-green-600 hover:border-green-100",
        },
        {
            name: "X (Twitter)",
            icon: <X size={20} />,
            href: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
            color: "hover:bg-blue-50 hover:text-blue-400 hover:border-blue-100",
        },
        {
            name: "Email",
            icon: <Mail size={20} />,
            href: `mailto:?subject=${encodeURIComponent(propertyTitle)}&body=${encodedMessage}%0A%0A${encodedUrl}`,
            color: "hover:bg-gray-50 hover:text-gray-600 hover:border-gray-100",
        },
    ];


    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <button
                aria-label="Close share modal"
                className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm"
                onClick={handleClose}
            />

            <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-2xl">
                <button
                    onClick={handleClose}
                    className="absolute right-6 top-6 z-10 rounded-full border border-gray-100 bg-white p-2 text-gray-400 transition-all hover:text-gray-900 shadow-sm"
                >
                    <X size={18} />
                </button>

                <div className="p-8">
                    <div className="mb-8 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Share2 size={26} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Share Property</h2>
                            <p className="text-sm font-semibold text-gray-400">
                                Let others explore this property
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {shareOptions.map((option) => (
                            <a
                                key={option.name}
                                href={option.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex flex-col items-center gap-2 rounded-2xl border border-gray-100 p-4 transition-all duration-300 transform hover:scale-[1.03] active:scale-95 ${option.color}`}
                            >
                                <div className="p-1">{option.icon}</div>
                                <span className="text-[11px] font-bold uppercase tracking-wider">{option.name}</span>
                            </a>
                        ))}
                    </div>

                    <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            Direct Link
                        </p>
                        <div className="flex items-center gap-2 overflow-hidden">
                            <p className="truncate flex-1 text-sm font-bold text-gray-600">{shareUrl}</p>
                            <button
                                onClick={handleCopy}
                                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${copied ? "bg-green-100 text-green-600" : "bg-white border border-gray-200 text-gray-500 hover:border-primary hover:text-primary"
                                    }`}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? "Copied!" : "Copy"}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {canNativeShare && (
                            <button
                                onClick={handleNativeShare}
                                className="w-full flex items-center justify-center gap-3 rounded-[1.25rem] bg-gray-900 px-6 py-4.5 text-sm font-bold text-white transition-all hover:bg-black hover:shadow-lg active:scale-[0.98]"
                            >
                                <ExternalLink size={18} />
                                More Ways to Share
                            </button>
                        )}

                        <button
                            onClick={handleClose}
                            className="w-full flex items-center justify-center px-6 py-4 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

