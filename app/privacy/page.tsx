import type { Metadata } from "next";

import LegalPageLayout, {
    LegalList,
    LegalListItem,
    LegalPlaceholder,
    type LegalSection,
} from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
    title: "Privacy Policy | PropYours",
    description:
        "Learn how PropYours collects, uses, protects, and shares personal information.",
};

const sections: LegalSection[] = [
    {
        id: "who-we-are",
        title: "Who we are",
        content: (
            <p>
                PropYours Real Estate Solutions
                India Pvt Ltd operates the
                PropYours website and property
                marketplace.
            </p>
        ),
    },
    {
        id: "information-collected",
        title: "Information we collect",
        content: (
            <>
                <p>
                    Depending on how you use
                    PropYours, we may collect:
                </p>

                <LegalList>
                    <LegalListItem>
                        Name, email address, phone
                        number, and account details.
                    </LegalListItem>
                    <LegalListItem>
                        Property descriptions,
                        locations, prices, images,
                        and videos.
                    </LegalListItem>
                    <LegalListItem>
                        Enquiries, favourites,
                        listing activity, and
                        communications.
                    </LegalListItem>
                    <LegalListItem>
                        Device, browser, IP address,
                        logs, and basic usage
                        information.
                    </LegalListItem>
                    <LegalListItem>
                        Billing information
                        processed by our payment
                        provider.
                    </LegalListItem>
                </LegalList>
            </>
        ),
    },
    {
        id: "how-we-use-information",
        title: "How we use information",
        content: (
            <LegalList>
                <LegalListItem>
                    Create and maintain user
                    accounts.
                </LegalListItem>
                <LegalListItem>
                    Publish and manage property
                    listings.
                </LegalListItem>
                <LegalListItem>
                    Connect interested users with
                    property owners or builders.
                </LegalListItem>
                <LegalListItem>
                    Prevent fraud, abuse, and
                    security incidents.
                </LegalListItem>
                <LegalListItem>
                    Provide support and service
                    communications.
                </LegalListItem>
                <LegalListItem>
                    Meet legal and regulatory
                    obligations.
                </LegalListItem>
            </LegalList>
        ),
    },
    {
        id: "public-information",
        title: "Information visible to other users",
        content: (
            <p>
                Information included in public
                property listings or public
                profiles may be visible to visitors
                and registered users.
            </p>
        ),
    },
    {
        id: "service-providers",
        title: "Service providers",
        content: (
            <p>
                We may use hosting, database,
                file-upload, email, SMS, analytics,
                and payment providers to operate
                the service.
            </p>
        ),
    },
    {
        id: "data-retention",
        title: "Data retention",
        content: (
            <p>
                We retain personal information only
                for as long as necessary to provide
                the service, resolve disputes,
                enforce agreements, and comply with
                legal obligations.
            </p>
        ),
    },
    {
        id: "security",
        title: "Security",
        content: (
            <p>
                We use reasonable technical and
                organisational safeguards, but no
                method of transmission or storage
                is completely secure.
            </p>
        ),
    },
    {
        id: "rights",
        title: "Your choices and rights",
        content: (
            <p>
                You may contact us to request
                access, correction, or deletion of
                personal information, subject to
                applicable law.
            </p>
        ),
    },
    {
        id: "children",
        title: "Children",
        content: (
            <p>
                PropYours is not intended for
                children under the minimum legal
                age required to enter into
                property-related transactions.
            </p>
        ),
    },
    {
        id: "policy-changes",
        title: "Changes to this policy",
        content: (
            <p>
                We may update this policy and will
                publish the revised date on this
                page.
            </p>
        ),
    },
];

export default function PrivacyPage() {
    return (
        <LegalPageLayout
            type="privacy"
            eyebrow="Privacy"
            title="Privacy Policy"
            description="This policy explains what information PropYours collects, how it is used, when it may be shared, and the choices available to you."
            lastUpdated="July 13, 2026"
            noticeTitle="Your privacy matters"
            notice={
                <p>
                    PropYours uses personal
                    information to operate accounts,
                    publish listings, connect users,
                    process services, and protect
                    the marketplace from fraud and
                    abuse.
                </p>
            }
            sections={sections}
            relatedHref="/terms"
            relatedLabel="Terms of Service"
            relatedDescription="Review the rules and responsibilities that govern use of the PropYours marketplace."
        />
    );
}