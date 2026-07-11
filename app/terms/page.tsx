import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | PropYours",
    description: "Read the terms governing use of the PropYours marketplace.",
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-white pb-20 pt-32">
            <article className="prose prose-gray mx-auto max-w-4xl px-6">
                <h1>Terms of Service</h1>
                <p>
                    <strong>Last updated:</strong> [INSERT DATE]
                </p>

                <h2>1. Acceptance of these terms</h2>
                <p>
                    By accessing or using PropYours, you agree to these terms and the
                    Privacy Policy.
                </p>

                <h2>2. Marketplace role</h2>
                <p>
                    PropYours provides tools for publishing, discovering, and enquiring
                    about property listings. Unless expressly stated otherwise, PropYours
                    is not a party to transactions between users.
                </p>

                <h2>3. Account responsibilities</h2>
                <p>
                    Users must provide accurate information, protect their login
                    credentials, and promptly report unauthorised account access.
                </p>

                <h2>4. Property listings</h2>
                <p>Users publishing listings must ensure that:</p>
                <ul>
                    <li>They are authorised to advertise the property.</li>
                    <li>The listing information is accurate and not misleading.</li>
                    <li>Images and other content do not infringe third-party rights.</li>
                    <li>Required regulatory disclosures are included.</li>
                    <li>Sold, rented, or unavailable properties are updated promptly.</li>
                </ul>

                <h2>5. Verification and due diligence</h2>
                <p>
                    Users are responsible for independently verifying property ownership,
                    title, approvals, measurements, pricing, condition, and regulatory
                    compliance before entering into a transaction.
                </p>

                <h2>6. Prohibited activity</h2>
                <ul>
                    <li>Fraudulent, duplicate, or misleading listings.</li>
                    <li>Unauthorised scraping or automated access.</li>
                    <li>Harassment, impersonation, or misuse of contact information.</li>
                    <li>Uploading malicious or unlawful content.</li>
                    <li>Attempting to bypass listing or subscription limits.</li>
                </ul>

                <h2>7. Plans and payments</h2>
                <p>
                    Paid plans may have limits relating to listings, images, videos,
                    duration, promotion, and analytics. Applicable prices and limits are
                    shown when purchasing a plan.
                </p>

                <h2>8. Content licence</h2>
                <p>
                    Users retain ownership of their content but grant PropYours the
                    limited rights needed to host, display, distribute, and promote that
                    content as part of the service.
                </p>

                <h2>9. Suspension and removal</h2>
                <p>
                    PropYours may remove listings or restrict accounts that violate these
                    terms, applicable law, platform policies, or the rights of others.
                </p>

                <h2>10. Disclaimers</h2>
                <p>
                    Property information may be supplied by users or third parties.
                    PropYours does not guarantee the accuracy, legality, availability, or
                    suitability of every listing.
                </p>

                <h2>11. Limitation of liability</h2>
                <p>
                    Liability is limited to the maximum extent permitted by applicable
                    law.
                </p>

                <h2>12. Governing law and disputes</h2>
                <p>
                    [INSERT THE CORRECT GOVERNING LAW, COURTS, AND DISPUTE PROCESS.]
                </p>

                <h2>13. Contact</h2>
                <p>[INSERT LEGAL ENTITY ADDRESS AND CONTACT INFORMATION.]</p>
            </article>
        </main>
    );
}