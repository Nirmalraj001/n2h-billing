import express from "express";
import { getDB } from "../db";
import { ObjectId } from "mongodb";

const router = express.Router();

// GET Customers (Search & Pagination)
router.get("/", async (req, res) => {
    try {
        const { page = "1", limit = "20", search = "" } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const db = getDB();
        const query: any = {};

        if (search) {
            query.$or = [
                { name: { $regex: search as string, $options: "i" } },
                { phone: { $regex: search as string, $options: "i" } }
            ];
        }

        const customers = await db.collection("Customer")
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .toArray();

        const total = await db.collection("Customer").countDocuments(query);

        res.json({
            customers: customers.map(c => ({ ...c, id: c._id.toString() })),
            metadata: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error("Get Customers Error:", error);
        res.status(500).json({ error: "Failed to fetch customers" });
    }
});

// GET Single Customer
router.get("/:id", async (req, res) => {
    try {
        const db = getDB();
        const customer = await db.collection("Customer").findOne({ _id: new ObjectId(req.params.id) });
        if (!customer) return res.status(404).json({ error: "Customer not found" });

        res.json({ ...customer, id: customer._id.toString() });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch customer" });
    }
});

// POST Create Customer
router.post("/", async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const db = getDB();

        // Check duplicacy
        const existing = await db.collection("Customer").findOne({ phone });
        if (existing) {
            return res.json({ success: false, message: "Customer with this phone already exists." });
        }

        const now = new Date();
        const result = await db.collection("Customer").insertOne({
            name,
            phone,
            address: address || null,
            createdAt: now,
            updatedAt: now
        });

        res.status(201).json({
            success: true,
            data: {
                id: result.insertedId.toString(),
                name,
                phone,
                address,
                createdAt: now,
                updatedAt: now
            }
        });
    } catch (error) {
        console.error("Create Customer Error:", error);
        res.status(500).json({ success: false, message: "Failed to create customer" });
    }
});

// PUT Update Customer
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const db = getDB();

        delete data.id;
        delete data._id;

        await db.collection("Customer").updateOne(
            { _id: new ObjectId(id) },
            { $set: data }
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to update" });
    }
});

// DELETE Customer
router.delete("/:id", async (req, res) => {
    try {
        await getDB().collection("Customer").deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to delete" });
    }
});

export default router;
