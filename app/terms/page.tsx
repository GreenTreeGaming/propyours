import type { Metadata } from "next";
import Link from "next/link";

import LegalPageLayout, {
    LegalList,
    LegalListItem,
    LegalPlaceholder,
    type LegalSection,
} from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
    title: "Terms of Service | PropYours",
    description:
        "Read the terms governing use of the PropYours marketplace.",
};

const sections: LegalSection[] = [
    {
        id: "acceptance",
        title: "Acceptance of these terms",
        content: (
            <p>
                By accessing or using PropYours, you
                agree to these terms and our{" "}
                <Link
                    href="/privacy"
                    className="font-bold text-primary underline decoration-teal-200 underline-offset-4"
                >
                    Privacy Policy
                </Link>
                .
            </p>
        ),
    },
    {
        id: "marketplace-role",
        title: "Marketplace role",
        content: (
            <p>
                PropYours provides tools for
                publishing, discovering, and
                enquiring about property listings.
                Unless expressly stated otherwise,
                PropYours is not a party to
                transactions between users.
            </p>
        ),
    },
    {
        id: "account-responsibilities",
        title: "Account responsibilities",
        content: (
            <p>
                Users must provide accurate
                information, protect their login
                credentials, and promptly report
                unauthorised account access.
            </p>
        ),
    },
    {
        id: "property-listings",
        title: "Property listings",
        content: (
            <>
                <p>
                    Users publishing listings must
                    ensure that:
                </p>

                <LegalList>
                    <LegalListItem>
                        They are authorised to
                        advertise the property.
                    </LegalListItem>
                    <LegalListItem>
                        Listing information is
                        accurate and not misleading.
                    </LegalListItem>
                    <LegalListItem>
                        Images and other content do
                        not infringe third-party
                        rights.
                    </LegalListItem>
                    <LegalListItem>
                        Required regulatory
                        disclosures are included.
                    </LegalListItem>
                    <LegalListItem>
                        Sold, rented, or unavailable
                        properties are updated
                        promptly.
                    </LegalListItem>
                </LegalList>
            </>
        ),
    },
    {
        id: "verification",
        title: "Verification and due diligence",
        content: (
            <p>
                Users are responsible for
                independently verifying property
                ownership, title, approvals,
                measurements, pricing, condition,
                and regulatory compliance before
                entering into a transaction.
            </p>
        ),
    },
    {
        id: "prohibited-activity",
        title: "Prohibited activity",
        content: (
            <LegalList>
                <LegalListItem>
                    Fraudulent, duplicate, or
                    misleading listings.
                </LegalListItem>
                <LegalListItem>
                    Unauthorised scraping or
                    automated access.
                </LegalListItem>
                <LegalListItem>
                    Harassment, impersonation, or
                    misuse of contact information.
                </LegalListItem>
                <LegalListItem>
                    Uploading malicious or unlawful
                    content.
                </LegalListItem>
                <LegalListItem>
                    Attempting to bypass listing or
                    subscription limits.
                </LegalListItem>
            </LegalList>
        ),
    },
    {
        id: "plans-payments",
        title: "Plans and payments",
        content: (
            <p>
                Paid plans may have limits relating
                to listings, images, videos,
                duration, promotion, and analytics.
                Applicable prices and limits are
                shown when purchasing a plan.
            </p>
        ),
    },
    {
        id: "content-licence",
        title: "Content licence",
        content: (
            <p>
                Users retain ownership of their
                content but grant PropYours the
                limited rights needed to host,
                display, distribute, and promote
                that content as part of the
                service.
            </p>
        ),
    },
    {
        id: "suspension",
        title: "Suspension and removal",
        content: (
            <p>
                PropYours may remove listings or
                restrict accounts that violate
                these terms, applicable law,
                platform policies, or the rights
                of others.
            </p>
        ),
    },
    {
        id: "disclaimers",
        title: "Disclaimers",
        content: (
            <p>
                Property information may be
                supplied by users or third parties.
                PropYours does not guarantee the
                accuracy, legality, availability,
                or suitability of every listing.
            </p>
        ),
    },
    {
        id: "liability",
        title: "Limitation of liability",
        content: (
            <p>
                Liability is limited to the maximum
                extent permitted by applicable law.
            </p>
        ),
    },
];

export default function TermsPage() {
    return (
        <LegalPageLayout
            type="terms"
            eyebrow="Legal"
            title="Terms of Service"
            description="These terms explain the rules, responsibilities, and conditions that apply when you access or use the PropYours marketplace."
            lastUpdated="July 13, 2026"
            noticeTitle="PropYours is a marketplace platform"
            notice={
                <p>
                    Property listings are generally
                    submitted by users. Buyers,
                    owners, builders, and agents
                    remain responsible for carrying
                    out appropriate verification
                    before completing a transaction.
                </p>
            }
            sections={sections}
            relatedHref="/privacy"
            relatedLabel="Privacy Policy"
            relatedDescription="Learn what information PropYours collects, why it is used, and the choices available to you."
        />
    );
}