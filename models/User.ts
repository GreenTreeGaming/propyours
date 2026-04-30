import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        enum: ["User", "Admin", "Agent", "Builder", "Property Owner"],
        default: "User",
    },
    bio: {
        type: String,
        required: false,
    },
    company: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    city: {
        type: String,
        required: false,
    },
    favorites: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
        },
    ],
});

// Force fresh model in development to reflect schema changes immediately
if (process.env.NODE_ENV === "development") {
    try {
        mongoose.deleteModel("User");
    } catch (e) {
        // Model might not have been registered yet
    }
}

const User = models.User || mongoose.model("User", UserSchema);

export default User;