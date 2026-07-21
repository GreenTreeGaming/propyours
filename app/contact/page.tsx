import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact PropYours",
    description:
        "Contact PropYours for help with property listings, buying, selling, and builder services.",
};

const CONTACT_EMAIL = "reach@propyours.com";

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-gray-50 pb-20 pt-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mb-12 max-w-2xl">
                    <h1 className="mb-4 font-heading text-4xl font-black text-gray-900 md:text-6xl">
                        Contact PropYours
                    </h1>

                    <p className="text-lg text-gray-600">
                        Get help with listings, plans, property enquiries, or builder
                        accounts.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
                    >
                        <p className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">
                            Email
                        </p>
                        <p className="text-xl font-bold text-gray-900">{CONTACT_EMAIL}</p>
                    </a>
                </div>
            </div>
        </main>
    );
}