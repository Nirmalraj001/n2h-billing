"use server";

import prisma from "@/lib/prisma";
import dayjs from "dayjs";

export async function getDashboardStats() {
    const todayStart = dayjs().startOf("day").toDate();
    const monthStart = dayjs().startOf("month").toDate();

    const [
        todaysSales,
        todaysOrders,
        monthSales,
        totalOrders,
        totalRevenue,
        lowStock // Placeholder if we had stock
    ] = await Promise.all([
        // Today's Sales
        prisma.invoice.aggregate({
            _sum: { totalAmount: true },
            where: { createdAt: { gte: todayStart } },
        }),
        // Today's Orders count
        prisma.invoice.count({
            where: { createdAt: { gte: todayStart } },
        }),
        // This Month's Sales
        prisma.invoice.aggregate({
            _sum: { totalAmount: true },
            where: { createdAt: { gte: monthStart } },
        }),
        // Total Orders All Time
        prisma.invoice.count(),
        // Total Revenue All Time
        prisma.invoice.aggregate({
            _sum: { totalAmount: true },
        }),
        Promise.resolve(0), // Placeholder
    ]);

    return {
        todaysSales: todaysSales._sum.totalAmount || 0,
        todaysOrders,
        monthSales: monthSales._sum.totalAmount || 0,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        lowStock
    };
}

export async function getSalesReport(range: "7d" | "30d" | "90d" = "30d") {
    const startDate = dayjs()
        .subtract(range === "7d" ? 7 : range === "30d" ? 30 : 90, "day")
        .startOf("day")
        .toDate();

    // Fetch all invoices in range
    const invoices = await prisma.invoice.findMany({
        where: {
            createdAt: { gte: startDate },
            // status: "PAID" // Assuming all created are paid for now
        },
        select: {
            createdAt: true,
            totalAmount: true,
            subtotal: true,
            discount: true,
            items: {
                select: {
                    quantity: true,
                    total: true,
                    product: {
                        select: {
                            costPrice: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: "asc" },
    });

    // Group by day in JS
    const grouped = new Map<string, { date: string; sales: number; profit: number }>();

    invoices.forEach((inv: any) => {
        const dateKey = dayjs(inv.createdAt).format("MMM DD");
        const current = grouped.get(dateKey) || { date: dateKey, sales: 0, profit: 0 };

        current.sales += inv.totalAmount;

        // Profit Calculation: Total - (CostPrice * Qty)
        const cost = inv.items.reduce((sum: number, item: any) => {
            // Handle case where product might be deleted or null (though relation should hold)
            const cp = item.product?.costPrice || 0;
            return sum + (cp * item.quantity);
        }, 0);

        // Net profit for this invoice = (Sold Price - Discount) - Cost
        // Wait, simpler: Invoice Total Amount includes discount reduction.
        // So Profit = Invoice Total Amount - Cost of Goods Sold
        // If we want exact margin.
        // Note: Tax is passing through, usually Profit excludes Tax collection?
        // Gross Profit = (Revenue ex Tax) - COGS?
        // For simple business: Profit = (Total Amount - Tax) - COGS. 
        // Let's use that.

        const revenueExTax = inv.totalAmount; // actually simplest is margin on sales.
        // Let's stick to simple: Revenue - Cost.
        // If Tax is included in totalAmount, then Profit = TotalAmount - TaxAmount - COGS.
        // But we don't select taxAmount above. Let's fix that?
        // Actually inv.subtotal - inv.discount is roughly revenue before tax.

        // Precise Profit = (Item Price * Qty) - (Item CP * Qty) - Discount
        const itemMargin = inv.items.reduce((sum: number, item: any) => {
            const itemSale = item.total; // (Unit * Qty)
            const itemCost = (item.product?.costPrice || 0) * item.quantity;
            return sum + (itemSale - itemCost);
        }, 0);

        const invoiceProfit = itemMargin - inv.discount;

        current.profit += invoiceProfit;

        grouped.set(dateKey, current);
    });

    return Array.from(grouped.values());
}

export async function getRecentSales(limit = 5) {
    return prisma.invoice.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
            customer: true,
        },
    });
}

export async function getTopProducts(limit = 5) {
    // In Mongo/Prisma, aggregation on related grouping is hard.
    // We'll fetch InvoiceItems aggregations if possible, or do JS.
    // GroupBy is supported.
    const top = await prisma.invoiceItem.groupBy({
        by: ['productId', 'name'],
        _sum: {
            quantity: true,
            total: true
        },
        orderBy: {
            _sum: {
                total: 'desc'
            }
        },
        take: limit
    });

    return top.map((t: any) => ({
        name: t.name,
        revenue: t._sum.total || 0,
        quantity: t._sum.quantity || 0
    }));
}
