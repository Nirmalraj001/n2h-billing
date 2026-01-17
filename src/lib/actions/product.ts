"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ProductQuery = {
    page?: number;
    limit?: number;
    search?: string;
};

export async function getProducts({
    page = 1,
    limit = 100,
    search = "",
}: ProductQuery = {}) {
    const skip = (page - 1) * limit;

    const where = {
        isActive: true, // Only generic active products
        // Note: Mongo's full-text search is different, but for simple regex we can use contains
        // OR: name contains search
        ...(search
            ? {
                name: { contains: search, mode: "insensitive" },
            }
            : {}),
    };

    // @ts-ignore: Prisma types sometimes act up with Monogo 'insensitive' mode but it works
    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where: where as any,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.product.count({ where: where as any }),
    ]);

    return {
        products,
        metadata: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function createProduct(data: {
    name: string;
    costPrice: number;
    mrp: number;
    unitType: "BOX" | "GRAM";
    weight?: number;
}) {
    try {
        const { default: clientPromise } = await import("@/lib/mongo");
        const client = await clientPromise;
        const db = client.db();

        const now = new Date();
        const productData = {
            ...data,
            isActive: true,
            createdAt: now,
            updatedAt: now
        };

        const res = await db.collection("Product").insertOne(productData);

        // Convert _id to string for return
        const product = { ...productData, id: res.insertedId.toString() };

        revalidatePath("/products");
        return { success: true, data: product };
    } catch (error) {
        console.error("Create Product Error:", error);
        return { success: false, error: "Failed to create product" };
    }
}

export async function updateProduct(
    id: string,
    data: {
        name?: string;
        costPrice?: number;
        mrp?: number;
        unitType?: "BOX" | "GRAM";
        weight?: number;
    }
) {
    try {
        const { default: clientPromise } = await import("@/lib/mongo");
        const { ObjectId } = await import("mongodb");
        const client = await clientPromise;
        const db = client.db();

        await db.collection("Product").updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...data, updatedAt: new Date() } }
        );

        revalidatePath("/products");
        return { success: true };
    } catch (error) {
        console.error("Update Product Error:", error);
        return { success: false, error: "Failed to update product" };
    }
}

export async function deleteProduct(id: string) {
    try {
        const { default: clientPromise } = await import("@/lib/mongo");
        const { ObjectId } = await import("mongodb");
        const client = await clientPromise;
        const db = client.db();

        // Soft delete
        await db.collection("Product").updateOne(
            { _id: new ObjectId(id) },
            { $set: { isActive: false, updatedAt: new Date() } }
        );

        revalidatePath("/products");
        return { success: true };
    } catch (error) {
        console.error("Delete Product Error:", error);
        return { success: false, error: "Failed to delete product" };
    }
}
