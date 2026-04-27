import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Property from "@/models/Property";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();
        const user = await User.findById(id).select("-password");
        console.log("GET User:", user?.email, "Phone:", user?.phone);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json(user);
    } catch (error) {
        console.error("Fetch User Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, email, phone, role, bio, company, address, city, newPassword } = body;
        console.log("PUT Request Body:", body);
        await connectDB();
        // Check if email is already taken by another user
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                return NextResponse.json(
                    { error: "Email already in use" },
                    { status: 409 }
                );
            }
        }

        const updateData: any = { name, email, phone, role, bio, company, address, city };

        if (newPassword) {
            const { oldPassword } = body;
            if (!oldPassword) {
                return NextResponse.json({ error: "Old password is required" }, { status: 400 });
            }

            const currentUser = await User.findById(id).select("+password");
            if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

            const isMatch = await bcrypt.compare(oldPassword, currentUser.password);
            if (!isMatch) return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });

            updateData.password = await bcrypt.hash(newPassword, 12);
        }

        const user = await User.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: "after", runValidators: true }
        ).select("-password");

        console.log("Updated User in DB:", user?.email, "Phone:", user?.phone);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Update User Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        // 1. Delete all properties associated with this user
        const propertyResult = await Property.deleteMany({ userId: id });
        console.log(`Deleted ${propertyResult.deletedCount} properties for user ${id}`);

        // 2. Delete the user
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Account and all associated data deleted successfully",
            deletedProperties: propertyResult.deletedCount
        });
    } catch (error) {
        console.error("Delete Account Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
