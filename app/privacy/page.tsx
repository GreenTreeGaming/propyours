import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | PropYours",
    description: "Read the PropYours privacy policy.",
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-white pb-20 pt-32">
            <article className="prose prose-gray mx-auto max-w-4xl px-6">
                <h1>Privacy Policy</h1>
                <p>
                    <strong>Last updated:</strong> [INSERT DATE]
                </p>

                <h2>1. Who we are</h2>
                <p>
                    PropYours Real Estate Solutions India Pvt Ltd operates the PropYours
                    website and property marketplace.
                </p>

                <h2>2. Information we collect</h2>
                <p>Depending on how you use PropYours, we may collect:</p>
                <ul>
                    <li>Name, email address, phone number, and account details.</li>
                    <li>Property descriptions, locations, prices, images, and videos.</li>
                    <li>Enquiries, favourites, listing activity, and communications.</li>
                    <li>
                        Device, browser, IP address, logs, and basic usage information.
                    </li>
                    <li>Billing information processed by our payment provider.</li>
                </ul>

                <h2>3. How we use information</h2>
                <ul>
                    <li>Create and maintain user accounts.</li>
                    <li>Publish and manage property listings.</li>
                    <li>Connect interested users with property owners or builders.</li>
                    <li>Prevent fraud, abuse, and security incidents.</li>
                    <li>Provide support and service communications.</li>
                    <li>Meet legal and regulatory obligations.</li>
                </ul>

                <h2>4. Information visible to other users</h2>
                <p>
                    Information included in public property listings or public profiles
                    may be visible to visitors and registered users.
                </p>

                <h2>5. Service providers</h2>
                <p>
                    We may use hosting, database, file-upload, email, SMS, analytics, and
                    payment providers to operate the service.
                </p>

                <h2>6. Data retention</h2>
                <p>
                    We retain personal information only for as long as necessary to
                    provide the service, resolve disputes, enforce agreements, and comply
                    with legal obligations.
                </p>

                <h2>7. Security</h2>
                <p>
                    We use reasonable technical and organisational safeguards, but no
                    method of transmission or storage is completely secure.
                </p>

                <h2>8. Your choices and rights</h2>
                <p>
                    You may contact us to request access, correction, or deletion of
                    personal information, subject to applicable law.
                </p>

                <h2>9. Children</h2>
                <p>
                    PropYours is not intended for children under the minimum legal age
                    required to enter into property-related transactions.
                </p>

                <h2>10. Changes to this policy</h2>
                <p>
                    We may update this policy and will publish the revised date on this
                    page.
                </p>

                <h2>11. Contact</h2>
                <p>
                    For privacy questions, contact [INSERT PRIVACY EMAIL AND ADDRESS].
                </p>
            </article>
        </main>
    );
}