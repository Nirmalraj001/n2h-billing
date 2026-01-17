"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createInvoice(data: {
    customerId?: string;
    items: {
        productId: string;
        name: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
    subtotal: number;
    discount: number;
    taxAmount: number;
    totalAmount: number;
    paymentMode: "CASH" | "UPI";
}) {
    try {
        // 1. Generate Invoice Number
        const lastInvoice = await prisma.invoice.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        let nextInvoiceNo = "INV-001";
        if (lastInvoice && lastInvoice.invoiceNo) {
            const lastNo = parseInt(lastInvoice.invoiceNo.split("-")[1]);
            nextInvoiceNo = `INV-${String(lastNo + 1).padStart(3, '0')}`;
        }

        // 2. Create Invoice Shell (No nested items to avoid transaction requirement on standalone)
        // Use native MongoDB driver for writes
        const { default: clientPromise } = await import("@/lib/mongo");
        const { ObjectId } = await import("mongodb");
        const client = await clientPromise;
        const db = client.db();

        const now = new Date();

        // 2. Create Invoice Shell
        const invoiceRes = await db.collection("Invoice").insertOne({
            invoiceNo: nextInvoiceNo,
            customerId: data.customerId ? new ObjectId(data.customerId) : null,
            subtotal: data.subtotal,
            discount: data.discount,
            taxAmount: data.taxAmount,
            totalAmount: data.totalAmount,
            paymentMode: data.paymentMode,
            createdAt: now,
            updatedAt: now
        });

        const invoiceId = invoiceRes.insertedId;

        // 3. Create Invoice Items
        if (invoiceId) {
            const itemsData = data.items.map(item => ({
                invoiceId: invoiceId, // Already ObjectId
                productId: new ObjectId(item.productId),
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total
            }));

            if (itemsData.length > 0) {
                await db.collection("InvoiceItem").insertMany(itemsData);
            }
        }

        revalidatePath("/billing");

        // Fetch complete invoice for return
        const fullInvoice = await prisma.invoice.findUnique({
            where: { id: invoiceId.toString() },
            include: { items: true, customer: true }
        });

        return { success: true, data: fullInvoice };
    } catch (error) {
        console.error("Create Invoice Error:", error);
        return { success: false, error: "Failed to create invoice" };
    }
}

export async function getInvoices({
    page = 1,
    limit = 20,
    search = ""
}: { page?: number, limit?: number, search?: string } = {}) {
    const skip = (page - 1) * limit;

    const where = search ? {
        OR: [
            { invoiceNo: { contains: search, mode: 'insensitive' } },
            { customer: { name: { contains: search, mode: 'insensitive' } } }
        ]
    } : {};

    // @ts-ignore
    const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
            where: where as any,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { customer: true, items: true }
        }),
        prisma.invoice.count({ where: where as any })
    ]);

    return {
        invoices,
        metadata: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}
