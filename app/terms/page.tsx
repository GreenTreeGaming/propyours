import type {
    Metadata,
} from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Terms of Service",
    description:
        "Read the terms governing access to and use of the PropYours property marketplace.",
    alternates: {
        canonical: "/terms",
    },
    robots: {
        index: true,
        follow: true,
    },
};

const EFFECTIVE_DATE =
    "22 July 2026";

const CONTACT_EMAIL =
    "support@propyours.com";

type SectionProps = {
    id: string;
    title: string;
    children: React.ReactNode;
};

function TermsSection({
                          id,
                          title,
                          children,
                      }: SectionProps) {
    return (
        <section
            id={id}
            className="scroll-mt-28 border-b border-slate-200 pb-10 last:border-b-0"
        >
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                {title}
            </h2>

            <div className="mt-5 space-y-4 text-[15px] leading-7 text-slate-700 sm:text-base">
                {children}
            </div>
        </section>
    );
}

function TermsList({
                       children,
                   }: {
    children: React.ReactNode;
}) {
    return (
        <ul className="ml-5 list-disc space-y-2 marker:text-emerald-600">
            {children}
        </ul>
    );
}

const tableOfContents = [
    {
        id: "acceptance",
        label: "Acceptance of the terms",
    },
    {
        id: "service",
        label: "The PropYours service",
    },
    {
        id: "eligibility",
        label: "Eligibility",
    },
    {
        id: "accounts",
        label: "Accounts and security",
    },
    {
        id: "listings",
        label: "Property listings",
    },
    {
        id: "content",
        label: "User content and licence",
    },
    {
        id: "moderation",
        label: "Content moderation",
    },
    {
        id: "enquiries",
        label: "Leads and communications",
    },
    {
        id: "due-diligence",
        label: "Property due diligence",
    },
    {
        id: "rera",
        label: "RERA and legal compliance",
    },
    {
        id: "plans",
        label: "Plans and promotions",
    },
    {
        id: "acceptable-use",
        label: "Acceptable use",
    },
    {
        id: "ai",
        label: "AI-assisted features",
    },
    {
        id: "third-parties",
        label: "Third-party services",
    },
    {
        id: "intellectual-property",
        label: "Intellectual property",
    },
    {
        id: "suspension",
        label: "Suspension and termination",
    },
    {
        id: "disclaimers",
        label: "Disclaimers",
    },
    {
        id: "liability",
        label: "Limitation of liability",
    },
    {
        id: "indemnity",
        label: "Indemnity",
    },
    {
        id: "law",
        label: "Governing law and disputes",
    },
    {
        id: "changes",
        label: "Changes to the terms",
    },
    {
        id: "contact",
        label: "Contact",
    },
] as const;

export default function TermsOfServicePage() {
    return (
        <main className="flex-1 bg-slate-50">
            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
                    <div className="max-w-3xl">
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                            Terms of Service
                        </h1>

                        <p className="mt-5 text-lg leading-8 text-slate-600">
                            These Terms govern your access to and use
                            of PropYours, including property search,
                            listings, enquiries, accounts, plans and
                            related services.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                            <span>
                                Effective date:{" "}
                                <strong className="font-medium text-slate-700">
                                    {EFFECTIVE_DATE}
                                </strong>
                            </span>

                            <span>
                                Last updated:{" "}
                                <strong className="font-medium text-slate-700">
                                    {EFFECTIVE_DATE}
                                </strong>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 lg:py-16">
                <aside className="lg:sticky lg:top-24 lg:self-start">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-slate-950">
                            On this page
                        </p>

                        <nav
                            aria-label="Terms of service sections"
                            className="mt-4"
                        >
                            <ul className="space-y-2">
                                {tableOfContents.map(
                                    (item) => (
                                        <li key={item.id}>
                                            <a
                                                href={`#${item.id}`}
                                                className="block text-sm leading-6 text-slate-600 transition hover:text-emerald-700"
                                            >
                                                {item.label}
                                            </a>
                                        </li>
                                    ),
                                )}
                            </ul>
                        </nav>
                    </div>
                </aside>

                <article className="min-w-0 rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-12">
                    <div className="space-y-10">
                        <TermsSection
                            id="acceptance"
                            title="1. Acceptance of the terms"
                        >
                            <p>
                                These Terms of Service constitute a
                                binding agreement between you and the
                                person or legal entity that owns and
                                operates PropYours.
                            </p>

                            <p>
                                By accessing, browsing, registering
                                for or using PropYours, you confirm
                                that you have read, understood and
                                agreed to these Terms and our{" "}
                                <Link
                                    href="/privacy"
                                    className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-800"
                                >
                                    Privacy Policy
                                </Link>
                                .
                            </p>

                            <p>
                                If you do not agree, you must not use
                                the Platform. If you use PropYours on
                                behalf of a company, partnership or
                                other organisation, you represent
                                that you have authority to bind that
                                organisation to these Terms.
                            </p>

                            <p>
                                These Terms are an electronic record
                                and do not require a physical or
                                digital signature to be effective.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="service"
                            title="2. The PropYours service"
                        >
                            <p>
                                PropYours is an online real-estate
                                information, discovery,
                                communications and advertising
                                platform. The Platform may enable
                                users to:
                            </p>

                            <TermsList>
                                <li>
                                    browse, search, filter, save and
                                    compare property listings;
                                </li>
                                <li>
                                    create, edit, publish and manage
                                    property advertisements;
                                </li>
                                <li>
                                    contact property owners,
                                    landlords, agents, brokers,
                                    builders and developers;
                                </li>
                                <li>
                                    access listing performance and
                                    account tools;
                                </li>
                                <li>
                                    purchase or activate listing
                                    plans or promotional services,
                                    where available; and
                                </li>
                                <li>
                                    use conversational search,
                                    recommendations and other
                                    AI-assisted features.
                                </li>
                            </TermsList>

                            <p>
                                Unless expressly stated otherwise,
                                PropYours is not the owner, seller,
                                purchaser, landlord, tenant, broker,
                                agent, developer, lender, legal
                                adviser or representative in any
                                property transaction.
                            </p>

                            <p>
                                PropYours provides a platform through
                                which independent users may publish
                                and discover information and contact
                                one another. We do not automatically
                                become a party to any negotiation,
                                booking, lease, sale, purchase,
                                financing arrangement or other
                                agreement between users.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="eligibility"
                            title="3. Eligibility"
                        >
                            <p>
                                You may use PropYours only if you are
                                legally capable of entering into a
                                binding contract under applicable
                                law.
                            </p>

                            <p>
                                By creating an account or listing a
                                property, you represent that:
                            </p>

                            <TermsList>
                                <li>
                                    the information you provide is
                                    truthful, current and complete;
                                </li>
                                <li>
                                    you are not prohibited from using
                                    the Services under applicable law;
                                </li>
                                <li>
                                    you are acting for yourself or
                                    have authority to act for the
                                    relevant person or organisation;
                                    and
                                </li>
                                <li>
                                    your use of the Platform will
                                    comply with these Terms and all
                                    applicable laws.
                                </li>
                            </TermsList>
                        </TermsSection>

                        <TermsSection
                            id="accounts"
                            title="4. Accounts and security"
                        >
                            <p>
                                Certain features require an account.
                                You must provide accurate information
                                and keep it updated.
                            </p>

                            <p>
                                You are responsible for:
                            </p>

                            <TermsList>
                                <li>
                                    maintaining the confidentiality of
                                    your password, OTPs and account
                                    credentials;
                                </li>
                                <li>
                                    using a strong password that is
                                    not reused on another service;
                                </li>
                                <li>
                                    restricting access to your devices
                                    and account;
                                </li>
                                <li>
                                    all activity carried out through
                                    your account unless caused by our
                                    failure to use reasonable security
                                    measures; and
                                </li>
                                <li>
                                    notifying us promptly if you
                                    suspect unauthorised access.
                                </li>
                            </TermsList>

                            <p>
                                You must not sell, rent, transfer or
                                share access to your account. We may
                                require phone, email or other
                                verification before allowing access
                                to certain features.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="listings"
                            title="5. Property listings"
                        >
                            <p>
                                A user who creates or manages a
                                property listing is referred to in
                                these Terms as an “Advertiser.”
                            </p>

                            <p>
                                Each Advertiser represents and
                                warrants that:
                            </p>

                            <TermsList>
                                <li>
                                    the Advertiser is the owner of the
                                    property or is duly authorised by
                                    the owner or another legally
                                    entitled person to advertise it;
                                </li>
                                <li>
                                    the listing and supporting content
                                    do not infringe another person’s
                                    copyright, privacy, publicity,
                                    contractual or other rights;
                                </li>
                                <li>
                                    all material details—including
                                    price, purpose, location, size,
                                    dimensions, ownership,
                                    availability and amenities—are
                                    accurate and not misleading;
                                </li>
                                <li>
                                    photographs and videos reasonably
                                    represent the advertised property;
                                </li>
                                <li>
                                    the Advertiser will promptly
                                    correct inaccurate information and
                                    mark a property as sold, rented,
                                    unavailable or inactive when
                                    appropriate;
                                </li>
                                <li>
                                    required licences, consents,
                                    registrations and approvals have
                                    been obtained; and
                                </li>
                                <li>
                                    the listing complies with consumer
                                    protection, advertising, housing,
                                    anti-discrimination, RERA and all
                                    other applicable laws.
                                </li>
                            </TermsList>

                            <p>
                                You must not create duplicate,
                                fraudulent, bait, fictitious,
                                misleading or unauthorised listings.
                                You must not advertise a property at
                                an artificial price merely to obtain
                                enquiries.
                            </p>

                            <p>
                                PropYours may determine how listings
                                are displayed, ranked, categorised,
                                searched and recommended. Ranking may
                                consider relevance, completeness,
                                freshness, quality, user preferences,
                                plan benefits, promotional status and
                                other factors.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="content"
                            title="6. User content and licence"
                        >
                            <p>
                                “User Content” includes listing text,
                                property data, photographs, videos,
                                brochures, profile information,
                                feedback and other material submitted
                                through the Platform.
                            </p>

                            <p>
                                You retain ownership of rights you
                                hold in your User Content. By
                                submitting User Content, you grant
                                PropYours a non-exclusive, worldwide,
                                royalty-free, transferable and
                                sublicensable licence to host, store,
                                reproduce, format, adapt, display,
                                distribute and make that content
                                available as reasonably necessary to:
                            </p>

                            <TermsList>
                                <li>
                                    operate and provide the Services;
                                </li>
                                <li>
                                    display and promote your listing;
                                </li>
                                <li>
                                    resize, compress, transcode or
                                    technically adapt media;
                                </li>
                                <li>
                                    distribute listings through
                                    search, recommendations and
                                    supported promotional channels;
                                </li>
                                <li>
                                    prevent fraud, enforce policies
                                    and resolve disputes; and
                                </li>
                                <li>
                                    improve the Platform and its
                                    search and presentation systems.
                                </li>
                            </TermsList>

                            <p>
                                This licence ends when the content is
                                deleted from our active systems,
                                except where continued retention is
                                reasonably necessary for backups,
                                legal compliance, dispute resolution,
                                fraud prevention or enforcement.
                            </p>

                            <p>
                                You must not upload confidential
                                records, payment credentials,
                                passwords, OTPs, unnecessary identity
                                documents or information that you do
                                not have permission to disclose.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="moderation"
                            title="7. Content moderation"
                        >
                            <p>
                                PropYours may use automated tools,
                                word filters, technical systems and
                                human review to detect content that
                                may violate these Terms or applicable
                                law.
                            </p>

                            <p>
                                We may reject, hide, limit, modify or
                                remove User Content, including where
                                it is:
                            </p>

                            <TermsList>
                                <li>
                                    abusive, obscene, hateful,
                                    discriminatory or threatening;
                                </li>
                                <li>
                                    fraudulent, misleading or
                                    impersonating another person;
                                </li>
                                <li>
                                    unrelated to legitimate property
                                    advertising or use of the
                                    Platform;
                                </li>
                                <li>
                                    infringing intellectual-property
                                    or privacy rights;
                                </li>
                                <li>
                                    spam, malware or an attempt to
                                    manipulate search or ranking; or
                                </li>
                                <li>
                                    otherwise inconsistent with these
                                    Terms, our policies or applicable
                                    law.
                                </li>
                            </TermsList>

                            <p>
                                Moderation systems are not perfect.
                                The absence of removal, a badge,
                                ranking, plan label or other Platform
                                treatment does not mean that
                                PropYours has verified or endorsed the
                                content, property, advertiser,
                                ownership documents or legal status.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="enquiries"
                            title="8. Leads, enquiries and communications"
                        >
                            <p>
                                When a user expresses interest in a
                                property, PropYours may provide the
                                enquiry and relevant contact details
                                to the Advertiser so that the parties
                                can communicate.
                            </p>

                            <p>
                                Advertisers receiving leads must:
                            </p>

                            <TermsList>
                                <li>
                                    use the information only for the
                                    relevant property enquiry or
                                    another purpose clearly authorised
                                    by the user;
                                </li>
                                <li>
                                    protect contact information
                                    against unauthorised access or
                                    disclosure;
                                </li>
                                <li>
                                    comply with applicable privacy,
                                    telemarketing and communication
                                    laws;
                                </li>
                                <li>
                                    respect opt-out, do-not-contact
                                    and withdrawal requests; and
                                </li>
                                <li>
                                    communicate lawfully,
                                    professionally and respectfully.
                                </li>
                            </TermsList>

                            <p>
                                Users must not send abusive,
                                discriminatory, obscene, threatening,
                                deceptive or harassing messages
                                through or in connection with the
                                Platform.
                            </p>

                            <p>
                                PropYours does not guarantee the
                                number, quality, authenticity,
                                responsiveness or conversion of leads
                                or enquiries.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="due-diligence"
                            title="9. Property due diligence"
                        >
                            <p>
                                Property information is commonly
                                submitted by independent users.
                                PropYours does not guarantee that
                                every listing is accurate, current,
                                complete, lawful or authentic.
                            </p>

                            <p>
                                Before paying money, signing a
                                document or entering any property
                                transaction, you should independently:
                            </p>

                            <TermsList>
                                <li>
                                    inspect the property in person;
                                </li>
                                <li>
                                    verify the identity and authority
                                    of the owner, landlord, agent,
                                    broker or developer;
                                </li>
                                <li>
                                    obtain and review title,
                                    ownership, encumbrance and
                                    possession records;
                                </li>
                                <li>
                                    confirm dimensions, boundaries,
                                    approvals, permissions, taxes,
                                    utilities and access rights;
                                </li>
                                <li>
                                    verify applicable RERA
                                    registration and disclosures;
                                </li>
                                <li>
                                    check pending disputes, loans,
                                    liens and legal restrictions;
                                </li>
                                <li>
                                    engage qualified legal, financial,
                                    engineering or property
                                    professionals; and
                                </li>
                                <li>
                                    use secure and properly documented
                                    payment methods.
                                </li>
                            </TermsList>

                            <p>
                                Never transfer money solely because a
                                listing appears on PropYours. Report
                                requests for suspicious deposits,
                                advance payments or credentials.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="rera"
                            title="10. RERA and legal compliance"
                        >
                            <p>
                                Advertisers are solely responsible for
                                determining whether the Real Estate
                                (Regulation and Development) Act,
                                2016, applicable state rules or other
                                property and advertising regulations
                                apply to them or their listing.
                            </p>

                            <p>
                                Where required, an Advertiser must:
                            </p>

                            <TermsList>
                                <li>
                                    hold a valid registration,
                                    licence or authorisation;
                                </li>
                                <li>
                                    provide accurate registration and
                                    project details;
                                </li>
                                <li>
                                    make all legally required
                                    disclosures;
                                </li>
                                <li>
                                    avoid publishing prohibited or
                                    misleading advertisements; and
                                </li>
                                <li>
                                    maintain records and supporting
                                    documents required by law.
                                </li>
                            </TermsList>

                            <p>
                                PropYours may request evidence of
                                authority, registration, ownership or
                                compliance, but is not obligated to
                                independently verify every listing.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="plans"
                            title="11. Plans, promotions and payments"
                        >
                            <p>
                                PropYours may offer free or paid
                                listing plans, promotions, badges,
                                ranking benefits, analytics, media
                                allowances or lead-related features.
                                The included features, duration,
                                limits and price will be shown before
                                purchase or activation.
                            </p>

                            <p>
                                A paid plan or promotion:
                            </p>

                            <TermsList>
                                <li>
                                    does not verify property
                                    ownership, title or legal
                                    compliance;
                                </li>
                                <li>
                                    does not guarantee a sale, rental,
                                    enquiry or minimum number of
                                    views;
                                </li>
                                <li>
                                    does not make PropYours a party to
                                    a property transaction; and
                                </li>
                                <li>
                                    remains subject to moderation and
                                    these Terms.
                                </li>
                            </TermsList>

                            <p>
                                Unless a refund is required by
                                applicable law or expressly stated at
                                purchase, fees for activated,
                                delivered or partially used digital
                                services may be non-refundable.
                            </p>

                            <p>
                                Payments may be processed by a
                                third-party payment provider. Its
                                terms and privacy policy will also
                                apply. PropYours should not receive or
                                store your complete card, bank or UPI
                                credentials.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="acceptable-use"
                            title="12. Acceptable use"
                        >
                            <p>
                                You must not:
                            </p>

                            <TermsList>
                                <li>
                                    violate any applicable law or
                                    another person’s rights;
                                </li>
                                <li>
                                    create a false account or
                                    impersonate another person or
                                    organisation;
                                </li>
                                <li>
                                    publish fraudulent, duplicate,
                                    misleading or unauthorised
                                    listings;
                                </li>
                                <li>
                                    post discriminatory housing
                                    requirements prohibited by law;
                                </li>
                                <li>
                                    upload malware, harmful code or
                                    content designed to disrupt the
                                    Platform;
                                </li>
                                <li>
                                    attempt to gain unauthorised access
                                    to accounts, systems, databases or
                                    restricted features;
                                </li>
                                <li>
                                    probe, scan or test Platform
                                    vulnerabilities without written
                                    authorisation;
                                </li>
                                <li>
                                    scrape, crawl, harvest, download
                                    or copy Platform data through
                                    automated means except as
                                    expressly permitted;
                                </li>
                                <li>
                                    build or populate a competing
                                    property, contact or lead database
                                    using Platform content;
                                </li>
                                <li>
                                    bypass rate limits, listing
                                    limits, authentication, moderation
                                    or security measures;
                                </li>
                                <li>
                                    manipulate analytics, views,
                                    favourites, rankings, enquiries or
                                    reviews;
                                </li>
                                <li>
                                    send spam or use contact details
                                    for unrelated mass marketing;
                                </li>
                                <li>
                                    reverse engineer or attempt to
                                    derive source code except where
                                    applicable law expressly permits
                                    it; or
                                </li>
                                <li>
                                    assist another person in doing any
                                    prohibited act.
                                </li>
                            </TermsList>
                        </TermsSection>

                        <TermsSection
                            id="ai"
                            title="13. AI-assisted features"
                        >
                            <p>
                                PropYours may provide conversational
                                property search, automated search
                                interpretation, recommendations,
                                content assistance or moderation.
                            </p>

                            <p>
                                AI-assisted outputs may be inaccurate,
                                incomplete, outdated or unsuitable for
                                your circumstances. They are provided
                                for convenience and must not be relied
                                upon as legal, financial, investment,
                                taxation, valuation, engineering,
                                planning or property advice.
                            </p>

                            <p>
                                You remain responsible for reviewing
                                any generated or suggested content
                                before submitting or relying on it.
                                You must not use AI-assisted features
                                to generate unlawful, deceptive,
                                discriminatory, abusive or infringing
                                content.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="third-parties"
                            title="14. Third-party services and links"
                        >
                            <p>
                                PropYours may integrate with or link
                                to third-party services, including
                                hosting providers, media-storage
                                platforms, video platforms, email or
                                SMS providers, payment processors and
                                external websites.
                            </p>

                            <p>
                                We do not control and are not
                                responsible for third-party services,
                                content, security, availability,
                                representations or transactions. Your
                                use of a third-party service is
                                governed by that provider’s terms and
                                policies.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="intellectual-property"
                            title="15. PropYours intellectual property"
                        >
                            <p>
                                The Platform, excluding User Content,
                                is owned by or licensed to PropYours
                                and is protected by intellectual
                                property laws. This includes the
                                PropYours name, branding, logos,
                                software, source code, interface
                                design, databases, graphics and
                                original written material.
                            </p>

                            <p>
                                Subject to these Terms, PropYours
                                grants you a limited, revocable,
                                non-exclusive, non-transferable
                                licence to access and use the
                                Platform for its intended purposes.
                            </p>

                            <p>
                                No provision transfers ownership of
                                PropYours intellectual property to
                                you. You may not copy, sell, license,
                                distribute, modify or create
                                derivative works from the Platform
                                except with prior written permission
                                or where applicable law expressly
                                permits it.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="suspension"
                            title="16. Suspension, removal and termination"
                        >
                            <p>
                                We may limit, suspend or terminate an
                                account, listing or access to the
                                Services where we reasonably believe:
                            </p>

                            <TermsList>
                                <li>
                                    these Terms or applicable law have
                                    been violated;
                                </li>
                                <li>
                                    an account or listing is
                                    fraudulent, misleading or
                                    unauthorised;
                                </li>
                                <li>
                                    activity presents a security,
                                    privacy, legal or reputational
                                    risk;
                                </li>
                                <li>
                                    required payment has not been
                                    received or has been reversed;
                                </li>
                                <li>
                                    repeated complaints or policy
                                    violations have occurred; or
                                </li>
                                <li>
                                    suspension is necessary to protect
                                    users, PropYours or another person.
                                </li>
                            </TermsList>

                            <p>
                                Where appropriate and legally
                                permitted, we may provide notice or an
                                opportunity to correct the issue. We
                                may act without advance notice in
                                urgent, fraudulent, unlawful or
                                security-sensitive circumstances.
                            </p>

                            <p>
                                You may stop using the Platform and
                                may request account deletion through
                                available account tools or by
                                contacting us.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="disclaimers"
                            title="17. Disclaimers"
                        >
                            <p>
                                To the maximum extent permitted by
                                law, the Platform and Services are
                                provided on an “as is” and “as
                                available” basis.
                            </p>

                            <p>
                                PropYours does not warrant that:
                            </p>

                            <TermsList>
                                <li>
                                    every listing, user, owner, agent,
                                    builder or developer is genuine or
                                    verified;
                                </li>
                                <li>
                                    listing information, prices,
                                    photographs, measurements,
                                    documents or availability are
                                    accurate or complete;
                                </li>
                                <li>
                                    a property has clear title,
                                    approvals, possession, legal
                                    access or freedom from
                                    encumbrances;
                                </li>
                                <li>
                                    any transaction will occur or
                                    produce a particular result;
                                </li>
                                <li>
                                    the Platform will always be
                                    uninterrupted, error-free or
                                    secure; or
                                </li>
                                <li>
                                    automated, analytical or
                                    AI-assisted outputs are accurate
                                    or suitable.
                                </li>
                            </TermsList>

                            <p>
                                Labels such as “Featured,” “Premium,”
                                “Promoted,” “Priority” or similar
                                terms describe Platform visibility or
                                plan benefits. They are not legal,
                                title, ownership, document or
                                regulatory verification.
                            </p>

                            <p>
                                Nothing on PropYours constitutes
                                legal, financial, taxation,
                                investment, valuation, engineering or
                                professional property advice.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="liability"
                            title="18. Limitation of liability"
                        >
                            <p>
                                Nothing in these Terms excludes or
                                limits liability that cannot lawfully
                                be excluded or limited.
                            </p>

                            <p>
                                To the maximum extent permitted by
                                law, PropYours and its owners,
                                affiliates, directors, personnel and
                                service providers will not be liable
                                for indirect, incidental, special,
                                consequential, exemplary or punitive
                                loss arising from or connected with:
                            </p>

                            <TermsList>
                                <li>
                                    use of or inability to use the
                                    Platform;
                                </li>
                                <li>
                                    reliance on a listing, user,
                                    enquiry, recommendation or
                                    automated output;
                                </li>
                                <li>
                                    negotiations, payments or
                                    transactions between users;
                                </li>
                                <li>
                                    loss of data, opportunity,
                                    goodwill, revenue or profit;
                                </li>
                                <li>
                                    unauthorised account access not
                                    caused by our failure to use
                                    reasonable safeguards; or
                                </li>
                                <li>
                                    the conduct, content or services
                                    of another user or third party.
                                </li>
                            </TermsList>

                            <p>
                                Where permitted by law, PropYours’
                                aggregate liability relating to a
                                paid Service will not exceed the
                                amount you paid directly to PropYours
                                for the specific Service giving rise
                                to the claim during the six months
                                preceding the event.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="indemnity"
                            title="19. Indemnity"
                        >
                            <p>
                                To the maximum extent permitted by
                                law, you agree to defend, indemnify
                                and hold harmless PropYours and its
                                owners, affiliates, directors,
                                personnel and service providers from
                                claims, losses, liabilities, damages,
                                penalties, costs and reasonable legal
                                fees arising from or connected with:
                            </p>

                            <TermsList>
                                <li>
                                    your use or misuse of the
                                    Platform;
                                </li>
                                <li>
                                    your User Content or property
                                    listing;
                                </li>
                                <li>
                                    your lack of authority to
                                    advertise a property;
                                </li>
                                <li>
                                    your infringement of another
                                    person’s rights;
                                </li>
                                <li>
                                    your violation of law or these
                                    Terms; or
                                </li>
                                <li>
                                    a transaction, negotiation or
                                    dispute between you and another
                                    user.
                                </li>
                            </TermsList>
                        </TermsSection>

                        <TermsSection
                            id="law"
                            title="20. Governing law and disputes"
                        >
                            <p>
                                These Terms are governed by the laws
                                of India.
                            </p>

                            <p>
                                Before commencing formal proceedings,
                                you and PropYours agree to make a
                                reasonable attempt to resolve the
                                dispute by written notice and
                                good-faith discussion.
                            </p>

                            <p>
                                Subject to any mandatory consumer
                                rights and after inserting the
                                operator’s actual registered location,
                                courts located in{" "}
                                <strong>
                                    [insert city and state of the
                                    PropYours legal entity]
                                </strong>{" "}
                                will have jurisdiction over disputes
                                arising from these Terms or the
                                Platform.
                            </p>

                            <p>
                                Do not add a mandatory arbitration
                                clause until an Indian lawyer has
                                reviewed the legal entity, seat,
                                procedure, consumer-law implications
                                and enforceability.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="changes"
                            title="21. Changes to the terms"
                        >
                            <p>
                                We may update these Terms to reflect
                                changes in the Platform, Services,
                                business practices or applicable law.
                                Updated Terms will be posted on this
                                page with a revised effective date.
                            </p>

                            <p>
                                Where a change materially affects your
                                rights, we may provide additional
                                notice. Your continued use of
                                PropYours after updated Terms take
                                effect constitutes acceptance to the
                                extent permitted by law.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="contact"
                            title="22. Contact"
                        >
                            <p>
                                Questions, complaints, legal notices
                                and reports concerning these Terms
                                may be sent to:
                            </p>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <p className="font-semibold text-slate-950">
                                    PropYours Legal and Support
                                </p>

                                <p className="mt-2">
                                    Email:{" "}
                                    <a
                                        href={`mailto:${CONTACT_EMAIL}`}
                                        className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-800"
                                    >
                                        {CONTACT_EMAIL}
                                    </a>
                                </p>

                                <p className="mt-1">
                                    Legal entity: Replace with the
                                    registered legal name operating
                                    PropYours
                                </p>

                                <p className="mt-1">
                                    Address: Replace with the
                                    registered business or legal
                                    notice address
                                </p>
                            </div>
                        </TermsSection>
                    </div>

                    <div className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                        <p className="font-semibold text-emerald-950">
                            Privacy information
                        </p>

                        <p className="mt-2 text-sm leading-6 text-emerald-900/80">
                            Learn how PropYours collects, uses,
                            shares, secures and retains personal
                            information.
                        </p>

                        <Link
                            href="/privacy"
                            className="mt-4 inline-flex font-semibold text-emerald-800 underline decoration-emerald-400 underline-offset-4 hover:text-emerald-950"
                        >
                            Read the Privacy Policy
                        </Link>
                    </div>
                </article>
            </div>
        </main>
    );
}