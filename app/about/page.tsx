import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "About PropYours",
    description:
        "Learn about PropYours, our real estate experience, legal expertise, and property services.",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white pb-20 pt-32">
            <div className="mx-auto max-w-4xl px-6">
                <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
                    About PropYours
                </p>

                <h1 className="mb-8 font-heading text-4xl font-black text-gray-900 md:text-6xl">
                    Property decisions backed by real-estate and legal expertise.
                </h1>

                <div className="space-y-6 text-lg leading-8 text-gray-600">
                    <p>
                        PropYours helps property owners, buyers, and builders market and
                        discover real estate across Tamil Nadu.
                    </p>

                    <p>
                        Our goal is to make property discovery, verification, communication,
                        and listing management clearer and more trustworthy.
                    </p>
                </div>

                <section className="mt-16 grid gap-6 md:grid-cols-3">
                    <article className="rounded-3xl border border-gray-100 p-6">
                        <h2 className="mb-2 text-lg font-bold text-gray-900">
                            Property discovery
                        </h2>
                        <p className="text-sm leading-6 text-gray-600">
                            Search and compare residential, land, and commercial listings.
                        </p>
                    </article>

                    <article className="rounded-3xl border border-gray-100 p-6">
                        <h2 className="mb-2 text-lg font-bold text-gray-900">
                            Owner listings
                        </h2>
                        <p className="text-sm leading-6 text-gray-600">
                            Give property owners tools to publish and manage their listings.
                        </p>
                    </article>

                    <article className="rounded-3xl border border-gray-100 p-6">
                        <h2 className="mb-2 text-lg font-bold text-gray-900">
                            Professional support
                        </h2>
                        <p className="text-sm leading-6 text-gray-600">
                            Connect users with experienced real-estate professionals.
                        </p>
                    </article>
                </section>

                <div className="mt-12 flex flex-wrap gap-4">
                    <Link
                        href="/buy"
                        className="rounded-xl bg-primary px-6 py-3 font-bold text-white"
                    >
                        Browse properties
                    </Link>

                    <Link
                        href="/contact"
                        className="rounded-xl border border-gray-200 px-6 py-3 font-bold text-gray-800"
                    >
                        Contact us
                    </Link>
                </div>
            </div>
        </main>
    );
}