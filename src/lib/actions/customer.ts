"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function searchCustomers(query: string) {
    try {
        if (!query) {
            return await prisma.customer.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' }
            });
        }

        const customers = await prisma.customer.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { phone: { contains: query, mode: "insensitive" } }
                ]
            },
            take: 10
        });
        return customers;
    } catch (error) {
        console.error("Search Customer Error:", error);
        return [];
    }
}

export async function createCustomer(data: { name: string; phone: string; address?: string }) {
    try {
        const existing = await prisma.customer.findUnique({
            where: { phone: data.phone }
        });

        if (existing) {
            return { success: false, message: "Customer with this phone already exists." };
        }

        // Use native MongoDB driver for write to bypass Prisma P2031 on standalone
        const { default: clientPromise } = await import("@/lib/mongo");
        const client = await clientPromise;
        const db = client.db();

        const now = new Date();
        const result = await db.collection("Customer").insertOne({
            name: data.name,
            phone: data.phone,
            address: data.address || null,
            createdAt: now,
            updatedAt: now
        });

        // Convert insertedId to string and return similar to Prisma object
        const customer = {
            id: result.insertedId.toString(),
            name: data.name,
            phone: data.phone,
            address: data.address || null,
            createdAt: now,
            updatedAt: now
        };

        revalidatePath("/customers");
        return { success: true, data: customer };
    } catch (error) {
        console.error("Create Customer Error:", error);
        return { success: false, message: "Failed to create customer" };
    }
}

export async function getCustomers({
    page = 1,
    limit = 20,
    search = ""
}: { page?: number, limit?: number, search?: string } = {}) {
    const skip = (page - 1) * limit;
    const where = search ? {
        OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } }
        ]
    } : {};

    // @ts-ignore
    const [customers, total] = await Promise.all([
        prisma.customer.findMany({
            where: where as any,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.customer.count({ where: where as any })
    ]);

    return {
        customers,
        metadata: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}

export async function getCustomer(id: string) {
    try {
        const customer = await prisma.customer.findUnique({
            where: { id }
        });
        return customer;
    } catch (error) {
        return null;
    }
}

export async function updateCustomer(id: string, data: any) {
    try {
        await prisma.customer.update({
            where: { id },
            data
        });
        revalidatePath("/customers");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update" };
    }
}

export async function deleteCustomer(id: string) {
    try {
        await prisma.customer.delete({ where: { id } });
        revalidatePath("/customers");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete" };
    }
}
