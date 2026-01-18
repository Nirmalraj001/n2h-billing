import express from "express";
import { getDB } from "../db";
import { ObjectId } from "mongodb";

const router = express.Router();

// GET Products with search and pagination
router.get("/", async (req, res) => {
    try {
        const { page = "1", limit = "100", search = "" } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const db = getDB();
        const query: any = { isActive: true };

        if (search) {
            query.name = { $regex: search as string, $options: "i" };
        }

        const products = await db.collection("Product")
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .toArray();

        const total = await db.collection("Product").countDocuments(query);

        // Map _id to id for frontend compatibility
        const mappedProducts = products.map(p => ({
            ...p,
            id: p._id.toString()
        }));

        res.json({
            products: mappedProducts,
            metadata: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// POST Create Product
router.post("/", async (req, res) => {
    try {
        // Auth check middleware placeholder (if needed later)
        const data = req.body;
        const db = getDB();

        const now = new Date();
        const productData = {
            ...data,
            costPrice: parseFloat(data.costPrice),
            mrp: parseFloat(data.mrp),
            weight: data.weight ? parseFloat(data.weight) : undefined,
            isActive: true,
            createdAt: now,
            updatedAt: now
        };

        const result = await db.collection("Product").insertOne(productData);

        res.status(201).json({
            success: true,
            data: { ...productData, id: result.insertedId.toString() }
        });
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ success: false, error: "Failed to create product" });
    }
});

// PUT Update Product
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const db = getDB();

        // Ensure numeric fields are parsed
        const updateData: any = { ...data, updatedAt: new Date() };
        if (updateData.costPrice !== undefined) updateData.costPrice = parseFloat(updateData.costPrice);
        if (updateData.mrp !== undefined) updateData.mrp = parseFloat(updateData.mrp);
        if (updateData.weight !== undefined) updateData.weight = parseFloat(updateData.weight);

        // Remove id from update payload
        delete updateData.id;
        delete updateData._id;

        await db.collection("Product").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        res.json({ success: true });
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ success: false, error: "Failed to update product" });
    }
});

// DELETE Product
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();

        await db.collection("Product").updateOne(
            { _id: new ObjectId(id) },
            { $set: { isActive: false, updatedAt: new Date() } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ success: false, error: "Failed to delete product" });
    }
});

export default router;
