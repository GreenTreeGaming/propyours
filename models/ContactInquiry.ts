import mongoose from "mongoose";

const ContactInquirySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    source: { type: String, default: "contact-page" },
    status: { type: String, enum: ["new", "contacted"], default: "new" },
}, { timestamps: true });

export default mongoose.models.ContactInquiry || mongoose.model("ContactInquiry", ContactInquirySchema);
