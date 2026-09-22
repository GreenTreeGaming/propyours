import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongoose";
import { normalizeLeadPhone, consumeVerifiedLeadPhone } from "@/lib/lead-phone";
import { getPublicPropertyFilter } from "@/lib/property-filters";
import { hasTrustedOrigin } from "@/lib/security/trusted-origin";
import { sendLeadNotificationEmail } from "@/lib/send-lead-notification";
import ContactInquiry from "@/models/ContactInquiry";
import Property from "@/models/Property";
import User from "@/models/User";

const schema = z.object({
    name: z.string().trim().min(2).max(120),
    email: z.email().max(160),
    phone: z.string().trim().min(10).max(25),
    verificationToken: z.string().min(20).max(200),
    consent: z.literal(true),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Complete your contact details and verify your phone." }, { status: 400 });
    const phone = normalizeLeadPhone(parsed.data.phone);
    if (!phone) return NextResponse.json({ error: "Enter a valid Indian mobile number." }, { status: 400 });
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Property not found." }, { status: 404 });
    try {
        await connectDB();
        const property = await Property.findOne(getPublicPropertyFilter({ _id: id })).select("address userId");
        if (!property) return NextResponse.json({ error: "Property not found." }, { status: 404 });
        const owner = await User.findById(property.userId).select("name email phone");
        if (!owner) return NextResponse.json({ error: "Property owner not found." }, { status: 404 });
        if (!(await consumeVerifiedLeadPhone(phone, parsed.data.verificationToken))) {
            return NextResponse.json({ error: "Phone verification expired. Request a new code." }, { status: 403 });
        }
        await ContactInquiry.create({
            name: parsed.data.name, email: parsed.data.email, phone,
            message: `Interested in ${property.address}.`, source: "property-contact",
            propertyId: property._id, ownerId: owner._id, verifiedAt: new Date(),
        });
        if (owner.email) {
            try { await sendLeadNotificationEmail({ ownerEmail: owner.email, ownerName: owner.name, buyerName: parsed.data.name, buyerEmail: parsed.data.email, buyerPhone: phone, propertyId: id, propertyAddress: property.address, source: "phone" }); }
            catch (error) { console.error("Property contact notification failed:", error); }
        }
        return NextResponse.json({ success: true, owner: { name: owner.name, phone: owner.phone || null, email: owner.email || null } });
    } catch (error) {
        console.error("Property contact request failed:", error);
        return NextResponse.json({ error: "Unable to save your enquiry." }, { status: 500 });
    }
}
