import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import customerRoutes from "./routes/customers";
import invoiceRoutes from "./routes/invoices";
import settingsRoutes from "./routes/settings";

// Routes
app.get("/", (req, res) => {
    res.send("Billing App Backend is Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/settings", settingsRoutes);

app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server running on port ${PORT}`);
});
