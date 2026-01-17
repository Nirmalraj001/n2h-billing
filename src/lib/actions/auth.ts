"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

export async function registerUser(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    if (!username || !password || !name) {
        return { success: false, message: "All fields are required" };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return { success: false, message: "Username already exists" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                role: "STAFF", // Default role
            },
        });

        return { success: true, message: "User created successfully" };
    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, message: "Something went wrong" };
    }
}
