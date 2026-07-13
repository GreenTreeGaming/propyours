import Link from "next/link";
import type { ReactNode } from "react";
import {
    ArrowRight,
    Clock3,
    FileText,
    HelpCircle,
    Home,
    LockKeyhole,
    Scale,
    ShieldCheck,
} from "lucide-react";

export type LegalSection = {
    id: string;
    title: string;
    content: ReactNode;
};

type LegalPageLayoutProps = {
    type: "terms" | "privacy";
    eyebrow: string;
    title: string;
    description: string;
    lastUpdated: string;
    noticeTitle: string;
    notice: ReactNode;
    sections: LegalSection[];
    relatedHref: string;
    relatedLabel: string;
    relatedDescription: string;
};

export function LegalList({
                              children,
                          }: {
    children: ReactNode;
}) {
    return (
        <ul className="mt-4 space-y-3">
            {children}
        </ul>
    );
}

export function LegalListItem({
                                  children,
                              }: {
    children: ReactNode;
}) {
    return (
        <li className="flex gap-3 text-sm leading-7 text-slate-600 sm:text-base">
            <span
                aria-hidden="true"
                className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
            />
            <span>{children}</span>
        </li>
    );
}

export function LegalPlaceholder({
                                     children,
                                 }: {
    children: ReactNode;
}) {
    return (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
            {children}
        </div>
    );
}

export default function LegalPageLayout({
                                            type,
                                            eyebrow,
                                            title,
                                            description,
                                            lastUpdated,
                                            noticeTitle,
                                            notice,
                                            sections,
                                            relatedHref,
                                            relatedLabel,
                                            relatedDescription,
                                        }: LegalPageLayoutProps) {
    const PageIcon =
        type === "terms" ? Scale : ShieldCheck;

    const NoticeIcon =
        type === "terms"
            ? FileText
            : LockKeyhole;

    return (
        <main className="min-h-screen bg-[#f5f7f6] pb-24 pt-20 text-slate-950">
            <section className="relative overflow-hidden border-b border-slate-200 bg-white">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.16),_transparent_36%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.06),_transparent_32%)]"
                />

                <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8">
                    <nav
                        aria-label="Breadcrumb"
                        className="mb-8 flex items-center gap-2 text-xs font-bold text-slate-500"
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 transition hover:text-primary"
                        >
                            <Home
                                size={14}
                                aria-hidden="true"
                            />
                            Home
                        </Link>

                        <span aria-hidden="true">/</span>

                        <span className="text-slate-700">
                            {eyebrow}
                        </span>
                    </nav>

                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                            <PageIcon
                                size={14}
                                aria-hidden="true"
                            />
                            {eyebrow}
                        </div>

                        <h1 className="mt-6 max-w-3xl font-heading text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
                            {title}
                        </h1>

                        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                            {description}
                        </p>

                        <div className="mt-7 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-bold text-slate-600 shadow-sm backdrop-blur">
                            <Clock3
                                size={16}
                                className="text-primary"
                                aria-hidden="true"
                            />
                            Last updated: {lastUpdated}
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto grid max-w-7xl items-start gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-8 lg:py-14">
                <aside className="lg:sticky lg:top-28">
                    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-5">
                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                On this page
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Jump directly to a section.
                            </p>
                        </div>

                        <nav
                            aria-label={`${title} sections`}
                            className="max-h-[55vh] space-y-1 overflow-y-auto p-3"
                        >
                            {sections.map(
                                (section, index) => (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        className="group flex items-start gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-600 transition hover:bg-teal-50 hover:text-primary"
                                    >
                                        <span className="mt-0.5 text-[10px] font-black text-slate-400 group-hover:text-primary">
                                            {String(
                                                index + 1,
                                            ).padStart(
                                                2,
                                                "0",
                                            )}
                                        </span>

                                        <span>
                                            {section.title}
                                        </span>
                                    </a>
                                ),
                            )}
                        </nav>
                    </div>

                    <div className="mt-5 rounded-[1.5rem] bg-slate-950 p-5 text-white shadow-lg">
                        <HelpCircle
                            size={21}
                            className="text-teal-300"
                            aria-hidden="true"
                        />

                        <h2 className="mt-4 font-black">
                            Have a question?
                        </h2>

                        <p className="mt-2 text-xs leading-6 text-slate-400">
                            Contact PropYours for questions
                            about these policies.
                        </p>

                        <Link
                            href="/contact"
                            className="mt-5 inline-flex items-center gap-2 text-sm font-black text-teal-300 transition hover:text-white"
                        >
                            Contact us
                            <ArrowRight
                                size={15}
                                aria-hidden="true"
                            />
                        </Link>
                    </div>
                </aside>

                <div className="min-w-0">
                    <div className="mb-6 flex items-start gap-4 rounded-[1.5rem] border border-teal-200 bg-teal-50 p-5 sm:p-6">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                            <NoticeIcon
                                size={20}
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <h2 className="font-black text-slate-950">
                                {noticeTitle}
                            </h2>

                            <div className="mt-2 text-sm leading-7 text-slate-600">
                                {notice}
                            </div>
                        </div>
                    </div>

                    <article className="space-y-5">
                        {sections.map(
                            (section, index) => (
                                <section
                                    key={section.id}
                                    id={section.id}
                                    className="scroll-mt-28 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                                >
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-teal-300">
                                            {String(
                                                index + 1,
                                            ).padStart(
                                                2,
                                                "0",
                                            )}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                                                {section.title}
                                            </h2>

                                            <div className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                                                {section.content}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            ),
                        )}
                    </article>

                    <section className="mt-8 overflow-hidden rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-teal-300">
                                    Related policy
                                </p>

                                <h2 className="mt-2 text-2xl font-black">
                                    {relatedLabel}
                                </h2>

                                <p className="mt-2 max-w-xl text-sm leading-7 text-slate-400">
                                    {relatedDescription}
                                </p>
                            </div>

                            <Link
                                href={relatedHref}
                                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-teal-200"
                            >
                                Read policy
                                <ArrowRight
                                    size={16}
                                    aria-hidden="true"
                                />
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}