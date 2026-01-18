import express from "express";
import { getDB } from "../db";
import { ObjectId } from "mongodb";

const router = express.Router();

// GET Invoices
router.get("/", async (req, res) => {
    try {
        const { page = "1", limit = "20", search = "" } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const db = getDB();

        // Build Pipeline for Search & Join
        const pipeline: any[] = [];

        // Lookup Customer
        pipeline.push({
            $lookup: {
                from: "Customer",
                localField: "customerId",
                foreignField: "_id",
                as: "customer"
            }
        });
        pipeline.push({ $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } });

        // Search Match
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { invoiceNo: { $regex: search as string, $options: "i" } },
                        { "customer.name": { $regex: search as string, $options: "i" } }
                    ]
                }
            });
        }

        pipeline.push({ $sort: { createdAt: -1 } });

        // Count total before pagination
        const countPipeline = [...pipeline, { $count: "total" }];
        const countRes = await db.collection("Invoice").aggregate(countPipeline).toArray();
        const total = countRes.length > 0 ? countRes[0].total : 0;

        // Pagination
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limitNum });

        // Get Items (Optional, if needed for list, but usually just for detail)
        // For list we might not need items, but let's include for compatibility
        pipeline.push({
            $lookup: {
                from: "InvoiceItem",
                localField: "_id",
                foreignField: "invoiceId",
                as: "items"
            }
        });

        const invoices = await db.collection("Invoice").aggregate(pipeline).toArray();

        res.json({
            invoices: invoices.map(inv => ({
                ...inv,
                id: inv._id.toString(),
                customer: inv.customer ? { ...inv.customer, id: inv.customer._id.toString() } : null
            })),
            metadata: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error("Get Invoices Error:", error);
        res.status(500).json({ error: "Failed to fetch invoices" });
    }
});

// POST Create Invoice
router.post("/", async (req, res) => {
    try {
        const data = req.body;
        const db = getDB();

        // 1. Generate Invoice No
        const lastInvoice = await db.collection("Invoice").findOne({}, { sort: { createdAt: -1 } });
        let nextInvoiceNo = "INV-001";
        if (lastInvoice && lastInvoice.invoiceNo) {
            const lastNo = parseInt(lastInvoice.invoiceNo.split("-")[1]);
            nextInvoiceNo = `INV-${String(lastNo + 1).padStart(3, '0')}`;
        }

        const now = new Date();

        // 2. Insert Invoice
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

        // 3. Insert Items
        if (invoiceId && data.items && data.items.length > 0) {
            const itemsData = data.items.map((item: any) => ({
                invoiceId: invoiceId,
                productId: new ObjectId(item.productId),
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total
            }));
            await db.collection("InvoiceItem").insertMany(itemsData);
        }

        // 4. Fetch Complete for Return
        const fullInvoice = await db.collection("Invoice").aggregate([
            { $match: { _id: invoiceId } },
            {
                $lookup: {
                    from: "Customer",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customer"
                }
            },
            { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "InvoiceItem",
                    localField: "_id",
                    foreignField: "invoiceId",
                    as: "items"
                }
            }
        ]).next();

        res.status(201).json({ success: true, data: fullInvoice });

    } catch (error) {
        console.error("Create Invoice Error:", error);
        res.status(500).json({ success: false, error: "Failed to create invoice" });
    }
});

export default router;
