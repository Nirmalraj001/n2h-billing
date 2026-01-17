"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getStoreSettings() {
    // Singleton: Find first or create default
    let settings = await prisma.storeSettings.findFirst();

    if (!settings) {
        settings = await prisma.storeSettings.create({
            data: {
                name: "N2H Enterprises",
                address: "123, Main Street",
                phone: "9999999999"
            }
        });
    }

    return settings;
}

export async function updateStoreSettings(data: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    gstin?: string;
}) {
    try {
        const { default: clientPromise } = await import("@/lib/mongo");
        const client = await clientPromise;
        const db = client.db();

        // Check if settings exist
        const existing = await db.collection("StoreSettings").findOne({});

        if (existing) {
            await db.collection("StoreSettings").updateOne(
                { _id: existing._id },
                { $set: data }
            );
        } else {
            await db.collection("StoreSettings").insertOne(data);
        }

        revalidatePath("/settings");
        revalidatePath("/billing");
        return { success: true };
    } catch (error) {
        console.error("Update Settings Error:", error);
        return { success: false, error: "Failed to update settings" };
    }
}
