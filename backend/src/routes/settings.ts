import express from "express";
import { getDB } from "../db";

const router = express.Router();

// GET Settings
router.get("/", async (req, res) => {
    try {
        const db = getDB();
        let settings = await db.collection("StoreSettings").findOne({});

        if (!settings) {
            // Create default
            const defaultSettings = {
                name: "N2H Enterprises",
                address: "123, Main Street",
                phone: "9999999999"
            };
            const res = await db.collection("StoreSettings").insertOne(defaultSettings);
            settings = { ...defaultSettings, _id: res.insertedId };
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch settings" });
    }
});

// PUT Update Settings
router.put("/", async (req, res) => {
    try {
        const data = req.body;
        const db = getDB();

        // Remove _id if passed
        delete data._id;

        const existing = await db.collection("StoreSettings").findOne({});
        if (existing) {
            await db.collection("StoreSettings").updateOne(
                { _id: existing._id },
                { $set: data }
            );
        } else {
            await db.collection("StoreSettings").insertOne(data);
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to update settings" });
    }
});

export default router;
