import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/billing-app?directConnection=true";

let client: MongoClient;
let db: Db;

export async function connectDB() {
    if (client) return db;

    try {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db();
        console.log("Connected to MongoDB via Native Driver");
        return db;
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}

export function getDB() {
    if (!db) {
        throw new Error("Database not connected. Call connectDB first.");
    }
    return db;
}
