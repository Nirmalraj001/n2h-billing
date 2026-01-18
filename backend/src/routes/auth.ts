import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDB } from "../db";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

router.post("/register", async (req, res) => {
    try {
        const { name, username, password, role } = req.body;
        const db = getDB();

        // Check if user exists
        const existingUser = await db.collection("User").findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already taken" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await db.collection("User").insertOne({
            name,
            username,
            password: hashedPassword,
            role: role || "user",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        res.status(201).json({ success: true, userId: result.insertedId });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Register failed" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const db = getDB();

        // Find user
        const user = await db.collection("User").findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

export default router;
