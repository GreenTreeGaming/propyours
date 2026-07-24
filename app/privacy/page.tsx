import type {
    Metadata,
} from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description:
        "Learn how PropYours collects, uses, stores and shares personal information.",
    alternates: {
        canonical: "/privacy",
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

function PolicySection({
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

function PolicyList({
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
        id: "overview",
        label: "Overview",
    },
    {
        id: "scope",
        label: "Who this policy applies to",
    },
    {
        id: "information-we-collect",
        label: "Information we collect",
    },
    {
        id: "how-we-use-information",
        label: "How we use information",
    },
    {
        id: "listing-enquiries",
        label: "Property listings and enquiries",
    },
    {
        id: "cookies",
        label: "Cookies and similar technologies",
    },
    {
        id: "sharing",
        label: "How we share information",
    },
    {
        id: "ai",
        label: "AI-assisted features",
    },
    {
        id: "storage",
        label: "Storage and retention",
    },
    {
        id: "security",
        label: "Data security",
    },
    {
        id: "rights",
        label: "Your rights and choices",
    },
    {
        id: "children",
        label: "Children",
    },
    {
        id: "third-parties",
        label: "Third-party services",
    },
    {
        id: "transfers",
        label: "Data transfers",
    },
    {
        id: "changes",
        label: "Changes to this policy",
    },
    {
        id: "contact",
        label: "Contact and grievances",
    },
] as const;

export default function PrivacyPolicyPage() {
    return (
        <main className="flex-1 bg-slate-50">
            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
                    <div className="max-w-3xl">
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                            Privacy Policy
                        </h1>

                        <p className="mt-5 text-lg leading-8 text-slate-600">
                            This Privacy Policy explains how
                            PropYours collects, uses, shares,
                            protects and retains information when
                            you use our property marketplace and
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
                            aria-label="Privacy policy sections"
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
                        <PolicySection
                            id="overview"
                            title="1. Overview"
                        >
                            <p>
                                PropYours is a digital real-estate
                                discovery, advertising and
                                communications platform. It allows
                                users to search for properties,
                                publish property listings, save and
                                compare properties, contact property
                                advertisers, manage listings and use
                                related tools and services.
                            </p>

                            <p>
                                In this Privacy Policy,
                                “PropYours,” “we,” “us” and “our”
                                refer to the person or legal entity
                                that owns and operates the PropYours
                                platform. “Platform” means the
                                PropYours website, applications,
                                APIs and related online services.
                                “Services” means the features,
                                products and services available
                                through the Platform.
                            </p>

                            <p>
                                By accessing or using the Platform,
                                you acknowledge that you have read
                                this Privacy Policy. Where applicable
                                law requires consent for a particular
                                activity, we will request that
                                consent separately.
                            </p>

                            <p>
                                This Privacy Policy should be read
                                together with our{" "}
                                <Link
                                    href="/terms"
                                    className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-800"
                                >
                                    Terms of Service
                                </Link>
                                .
                            </p>
                        </PolicySection>

                        <PolicySection
                            id="scope"
                            title="2. Who this policy applies to"
                        >
                            <p>
                                This policy applies to everyone who
                                visits, accesses or uses PropYours,
                                including:
                            </p>

                            <PolicyList>
                                <li>
                                    visitors browsing property
                                    listings without an account;
                                </li>
                                <li>
                                    buyers, tenants and other property
                                    seekers;
                                </li>
                                <li>
                                    property owners, landlords and
                                    authorised representatives;
                                </li>
                                <li>
                                    agents, brokers and property
                                    consultants;
                                </li>
                                <li>
                                    builders, developers and their
                                    authorised personnel; and
                                </li>
                                <li>
                                    users who contact us for support,
                                    complaints, feedback or other
                                    enquiries.
                                </li>
                            </PolicyList>
                        </PolicySection>

                        <PolicySection
                            id="information-we-collect"
                            title="3. Information we collect"
                        >
                            <h3 className="text-lg font-semibold text-slate-900">
                                3.1 Information you provide
                            </h3>

                            <p>
                                Depending on how you use PropYours,
                                you may provide:
                            </p>

                            <PolicyList>
                                <li>
                                    <strong>
                                        Account information:
                                    </strong>{" "}
                                    name, email address, telephone
                                    number, password and account role.
                                </li>

                                <li>
                                    <strong>
                                        Profile information:
                                    </strong>{" "}
                                    biography, company name, address,
                                    city and professional information.
                                </li>

                                <li>
                                    <strong>
                                        Property information:
                                    </strong>{" "}
                                    property type, purpose, price,
                                    location, address, dimensions,
                                    ownership details, amenities,
                                    photographs, videos, brochures,
                                    availability and description.
                                </li>

                                <li>
                                    <strong>
                                        Enquiry information:
                                    </strong>{" "}
                                    details you submit when contacting
                                    an owner, agent, builder or other
                                    advertiser.
                                </li>

                                <li>
                                    <strong>
                                        Communications:
                                    </strong>{" "}
                                    messages, feedback, complaints,
                                    support requests and other
                                    correspondence with us.
                                </li>

                                <li>
                                    <strong>
                                        Verification information:
                                    </strong>{" "}
                                    one-time-password verification
                                    status and related verification
                                    records.
                                </li>

                                <li>
                                    <strong>
                                        Transaction information:
                                    </strong>{" "}
                                    plan, promotion or purchase
                                    details if paid services become
                                    available. Card, bank and UPI
                                    credentials should be processed
                                    directly by the relevant payment
                                    provider rather than stored by
                                    PropYours.
                                </li>
                            </PolicyList>

                            <h3 className="pt-3 text-lg font-semibold text-slate-900">
                                3.2 Information collected automatically
                            </h3>

                            <p>
                                When you use the Platform, we may
                                automatically receive:
                            </p>

                            <PolicyList>
                                <li>
                                    IP address and general location
                                    inferred from it;
                                </li>
                                <li>
                                    browser type, operating system,
                                    device type and language;
                                </li>
                                <li>
                                    referring and exit pages;
                                </li>
                                <li>
                                    pages viewed, searches performed,
                                    filters used and links selected;
                                </li>
                                <li>
                                    dates, times and duration of
                                    activity;
                                </li>
                                <li>
                                    authentication, security and error
                                    logs;
                                </li>
                                <li>
                                    listing views, contact clicks,
                                    favourites and other interaction
                                    analytics; and
                                </li>
                                <li>
                                    cookie and similar technology
                                    identifiers.
                                </li>
                            </PolicyList>

                            <h3 className="pt-3 text-lg font-semibold text-slate-900">
                                3.3 Information from other sources
                            </h3>

                            <p>
                                We may receive information from
                                service providers that support
                                authentication, hosting, media
                                storage, email delivery, analytics,
                                payment processing, fraud prevention
                                or customer support. We may also
                                receive information from public
                                sources or from people authorised to
                                act on behalf of a property owner or
                                business.
                            </p>
                        </PolicySection>

                        <PolicySection
                            id="how-we-use-information"
                            title="4. How we use information"
                        >
                            <p>
                                We may process information for the
                                following purposes:
                            </p>

                            <PolicyList>
                                <li>
                                    creating, authenticating and
                                    maintaining user accounts;
                                </li>
                                <li>
                                    verifying phone numbers and
                                    protecting accounts;
                                </li>
                                <li>
                                    publishing, editing, ranking and
                                    managing property listings;
                                </li>
                                <li>
                                    providing search, filtering,
                                    favourites, comparisons and
                                    recommendations;
                                </li>
                                <li>
                                    connecting property seekers with
                                    owners, agents, builders and other
                                    advertisers;
                                </li>
                                <li>
                                    administering plans, listing
                                    limits, promotions and paid
                                    services;
                                </li>
                                <li>
                                    measuring listing performance and
                                    providing analytics;
                                </li>
                                <li>
                                    moderating content and enforcing
                                    our policies;
                                </li>
                                <li>
                                    detecting spam, fraud,
                                    unauthorised access and security
                                    threats;
                                </li>
                                <li>
                                    responding to support requests,
                                    grievances and legal notices;
                                </li>
                                <li>
                                    maintaining, troubleshooting and
                                    improving the Platform;
                                </li>
                                <li>
                                    complying with applicable law,
                                    regulatory requests and legal
                                    obligations; and
                                </li>
                                <li>
                                    sending service-related messages
                                    and, where legally permitted or
                                    consented to, promotional
                                    communications.
                                </li>
                            </PolicyList>
                        </PolicySection>

                        <PolicySection
                            id="listing-enquiries"
                            title="5. Property listings and enquiries"
                        >
                            <p>
                                Property listings are intended to be
                                public. Information submitted as part
                                of a listing—including descriptions,
                                locations, images, videos, prices,
                                amenities, company information and
                                advertiser details—may be visible to
                                Platform users and search engines.
                            </p>

                            <p>
                                When you request information about a
                                property, select a contact option or
                                otherwise express interest, we may
                                share the information necessary to
                                respond to your enquiry with the
                                relevant property owner, landlord,
                                agent, broker, builder, developer or
                                authorised representative.
                            </p>

                            <p>
                                Once your information is provided to
                                another user in response to your
                                request, that person may process it
                                independently. You should review the
                                identity and privacy practices of any
                                person or business you choose to
                                contact.
                            </p>

                            <p>
                                Do not publish confidential
                                information, government identifiers,
                                financial credentials, private
                                documents or other sensitive personal
                                information in a public listing.
                            </p>
                        </PolicySection>

                        <PolicySection
                            id="cookies"
                            title="6. Cookies and similar technologies"
                        >
                            <p>
                                PropYours may use cookies, local
                                storage and similar technologies to:
                            </p>

                            <PolicyList>
                                <li>
                                    keep you signed in;
                                </li>
                                <li>
                                    remember preferences and saved
                                    choices;
                                </li>
                                <li>
                                    protect forms and sessions;
                                </li>
                                <li>
                                    understand Platform usage and
                                    performance; and
                                </li>
                                <li>
                                    identify abuse, unusual activity
                                    or repeated requests.
                                </li>
                            </PolicyList>

                            <p>
                                Most browsers allow you to block or
                                delete cookies. Some features,
                                including authentication and saved
                                preferences, may not function
                                correctly if required cookies are
                                disabled.
                            </p>
                        </PolicySection>

                        <PolicySection
                            id="sharing"
                            title="7. How we share information"
                        >
                            <p>
                                We do not sell your personal
                                information as an independent data
                                product. We may share information in
                                the following circumstances:
                            </p>

                            <PolicyList>
                                <li>
                                    <strong>
                                        With other users:
                                    </strong>{" "}
                                    when necessary to publish a
                                    listing or respond to a property
                                    enquiry.
                                </li>

                                <li>
                                    <strong>
                                        With service providers:
                                    </strong>{" "}
                                    companies that provide cloud
                                    hosting, database services, media
                                    storage, email delivery, SMS,
                                    analytics, security, support or
                                    payment processing.
                                </li>

                                <li>
                                    <strong>
                                        At your direction:
                                    </strong>{" "}
                                    where you request that we connect
                                    you with an owner, agent, builder
                                    or another service provider.
                                </li>

                                <li>
                                    <strong>
                                        For legal reasons:
                                    </strong>{" "}
                                    when disclosure is reasonably
                                    necessary to comply with law,
                                    court orders or lawful government
                                    requests; enforce our agreements;
                                    investigate fraud; or protect the
                                    rights, safety and security of
                                    PropYours, our users or others.
                                </li>

                                <li>
                                    <strong>
                                        Business transfers:
                                    </strong>{" "}
                                    in connection with a merger,
                                    acquisition, financing,
                                    restructuring, sale of assets or
                                    similar corporate transaction,
                                    subject to applicable law.
                                </li>

                                <li>
                                    <strong>
                                        Aggregated information:
                                    </strong>{" "}
                                    statistics or insights that do not
                                    reasonably identify an individual.
                                </li>
                            </PolicyList>

                            <p>
                                Service providers may process
                                information only for the services
                                they provide to us and subject to
                                their contractual and legal
                                obligations.
                            </p>
                        </PolicySection>

                        <PolicySection
                            id="ai"
                            title="8. AI-assisted and automated features"
                        >
                            <p>
                                PropYours may provide conversational
                                search, search interpretation,
                                content assistance, recommendations
                                or moderation features that use
                                automated systems or third-party
                                artificial-intelligence services.
                            </p>

                            <p>
                                Information submitted to an
                                AI-assisted feature may be processed
                                to interpret your request, generate a
                                response, identify matching
                                properties, detect prohibited content
                                or improve the reliability and safety
                                of that feature.
                            </p>

                            <p>
                                Do not enter passwords, payment
                                credentials, government
                                identification numbers or other
                                sensitive information into
                                conversational or AI-assisted fields.
                                Automated outputs may be incomplete
                                or inaccurate and should not be
                                treated as legal, financial,
                                investment, engineering or property
                                advice.
                            </p>
                        </PolicySection>

                        <PolicySection
                            id="storage"
                            title="9. Data storage and retention"
                        >
                            <p>
                                We retain information for as long as
                                reasonably necessary to provide the
                                Services, maintain accounts, resolve
                                disputes, prevent fraud, enforce
                                agreements and comply with legal
                                obligations.
                            </p>

                            <p>
                                Retention periods vary depending on
                                the type of information and the
                                reason it was collected. For example:
                            </p>

                            <PolicyList>
                                <li>
                                    account information may be kept
                                    while an account remains active;
                                </li>
                                <li>
                                    listing information may remain
                                    available while a listing is
                                    active and may be retained for a
                                    reasonable period after removal;
                                </li>
                                <li>
                                    verification and rate-limit
                                    records may be kept for security
                                    and abuse prevention;
                                </li>
                                <li>
                                    transaction records may be
                                    retained as required for tax,
                                    accounting and legal purposes; and
                                </li>
                                <li>
                                    backups may retain deleted
                                    information for a limited period
                                    before being overwritten.
                                </li>
                            </PolicyList>

                            <p>
                                When information is no longer
                                required, we may delete, anonymise or
                                aggregate it, subject to applicable
                                law and technical limitations.
                            </p>
                        </PolicySection>

                        <PolicySection
                            id="security"
                            title="10. Data security"
                        >
                            <p>
                                We use reasonable administrative,
                                technical and organisational
                                safeguards designed to protect
                                information against unauthorised
                                access, loss, misuse, alteration and
                                disclosure.
                            </p>

                            <p>
                                These measures may include password
                                hashing, access restrictions,
                                encrypted connections, secure
                                authentication cookies, request
                                validation, rate limiting, activity
                                logging and infrastructure security.
                            </p>

                            <p>
                                No online service can guarantee
                                absolute security. You are responsible
                                for keeping your password and devices
                                secure, using a unique password and
                                notifying us promptly if you believe
                                your account has been compromised.
                            </p>
                        </PolicySection>

                        <PolicySection
                            id="rights"
                            title="11. Your rights and choices"
                        >
                            <p>
                                Subject to applicable law, you may
                                have the right to:
                            </p>

                            <PolicyList>
                                <li>
                                    request access to information we
                                    hold about you;
                                </li>
                                <li>
                                    request correction of inaccurate
                                    or incomplete information;
                                </li>
                                <li>
                                    update certain account and profile
                                    information through your account;
                                </li>
                                <li>
                                    request deletion of your account
                                    and associated personal
                                    information;
                                </li>
                                <li>
                                    withdraw consent where processing
                                    depends on consent;
                                </li>
                                <li>
                                    opt out of optional promotional
                                    communications;
                                </li>
                                <li>
                                    raise a complaint or grievance;
                                    and
                                </li>
                                <li>
                                    nominate another person to
                                    exercise applicable rights where
                                    permitted by law.
                                </li>
                            </PolicyList>

                            <p>
                                We may ask you to verify your identity
                                before processing a request. We may
                                retain information where required by
                                law or where necessary for fraud
                                prevention, dispute resolution,
                                security or enforcement.
                            </p>

                            <p>
                                You may submit a request by emailing{" "}
                                <a
                                    href={`mailto:${CONTACT_EMAIL}`}
                                    className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-800"
                                >
                                    {CONTACT_EMAIL}
                                </a>
                                .
                            </p>
                        </PolicySection>

                        <PolicySection
                            id="children"
                            title="12. Children"
                        >
                            <p>
                                PropYours is not intended for persons
                                who are not legally capable of
                                entering into binding contracts or
                                providing valid consent under
                                applicable law. We do not knowingly
                                permit children to create property
                                advertiser accounts.
                            </p>

                            <p>
                                If you believe a child has provided
                                personal information without
                                appropriate authorisation, contact us
                                so that we can investigate and take
                                suitable action.
                            </p>
                        </PolicySection>

                        <PolicySection
                            id="third-parties"
                            title="13. Third-party websites and services"
                        >
                            <p>
                                The Platform may contain property
                                videos, external links, embedded
                                content or services operated by third
                                parties. Those third parties may
                                collect information under their own
                                terms and privacy policies.
                            </p>

                            <p>
                                PropYours is not responsible for the
                                privacy, security, availability or
                                content of third-party services. You
                                should review their policies before
                                providing information or completing a
                                transaction.
                            </p>
                        </PolicySection>

                        <PolicySection
                            id="transfers"
                            title="14. Data transfers"
                        >
                            <p>
                                Some service providers may process or
                                store information in locations other
                                than the state or country where you
                                live. Where required, we will use
                                appropriate safeguards and comply
                                with applicable restrictions on
                                cross-border processing.
                            </p>
                        </PolicySection>

                        <PolicySection
                            id="changes"
                            title="15. Changes to this policy"
                        >
                            <p>
                                We may update this Privacy Policy to
                                reflect changes in the Platform,
                                technology, service providers,
                                business practices or applicable law.
                            </p>

                            <p>
                                The updated version will be posted on
                                this page with a revised effective
                                date. Where required by law, we may
                                provide additional notice or request
                                renewed consent.
                            </p>
                        </PolicySection>

                        <PolicySection
                            id="contact"
                            title="16. Contact and grievance redressal"
                        >
                            <p>
                                Questions, privacy requests,
                                complaints and grievances may be sent
                                to:
                            </p>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <p className="font-semibold text-slate-950">
                                    PropYours Privacy and Grievance
                                    Contact
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
                                    registered business or grievance
                                    address
                                </p>
                            </div>

                            <p>
                                Please include your name, account
                                email or phone number, a description
                                of your request and any relevant
                                listing or account details. Do not
                                email passwords, OTPs, complete
                                payment credentials or unnecessary
                                identification documents.
                            </p>
                        </PolicySection>
                    </div>

                    <div className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                        <p className="font-semibold text-emerald-950">
                            Related document
                        </p>

                        <p className="mt-2 text-sm leading-6 text-emerald-900/80">
                            Review the rules governing accounts,
                            listings, enquiries and use of the
                            Platform in our Terms of Service.
                        </p>

                        <Link
                            href="/terms"
                            className="mt-4 inline-flex font-semibold text-emerald-800 underline decoration-emerald-400 underline-offset-4 hover:text-emerald-950"
                        >
                            Read the Terms of Service
                        </Link>
                    </div>
                </article>
            </div>
        </main>
    );
}