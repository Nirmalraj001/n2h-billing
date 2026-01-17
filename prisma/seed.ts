import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const products = [
    {
        name: "Peanut Laddu",
        costPrice: 45,
        mrp: 60,
        unitType: "BOX",
        weight: 6,
    },
    {
        name: "Sesame Laddu",
        costPrice: 55,
        mrp: 70,
        unitType: "BOX",
        weight: 1,
    },
    {
        name: "Coconut Laddu",
        costPrice: 65,
        mrp: 80,
        unitType: "BOX",
        weight: 1,
    },
    {
        name: "Dry Fruit Laddu",
        costPrice: 90,
        mrp: 110,
        unitType: "BOX",
        weight: 1,
    },
    {
        name: "Moong Dal Laddu",
        costPrice: 75,
        mrp: 90,
        unitType: "BOX",
        weight: 1,
    },
    {
        name: "Black Urad Dal Laddu",
        costPrice: 75,
        mrp: 90,
        unitType: "BOX",
        weight: 1,
    },
    {
        name: "Moringa Soup Mix",
        costPrice: 90,
        mrp: 110,
        unitType: "GRAM",
        weight: 100,
    },
    {
        name: "Manathakkali Soup Mix",
        costPrice: 90,
        mrp: 110,
        unitType: "GRAM",
        weight: 100,
    },
    {
        name: "Mudavattukal Soup Mix",
        costPrice: 180,
        mrp: 210,
        unitType: "GRAM",
        weight: 100,
    },
    {
        name: "Kollu Soup Mix",
        costPrice: 50,
        mrp: 70,
        unitType: "GRAM",
        weight: 100,
    },
    {
        name: "Aavarampoo Tea Mix",
        costPrice: 110,
        mrp: 130,
        unitType: "GRAM",
        weight: 100,
    },
    {
        name: "Herbal Tea",
        costPrice: 75,
        mrp: 90,
        unitType: "GRAM",
        weight: 100,
    },
    {
        name: "ABC Malt",
        costPrice: 110,
        mrp: 130,
        unitType: "GRAM",
        weight: 100,
    },
    {
        name: "Idli Podi",
        costPrice: 40,
        mrp: 55,
        unitType: "GRAM",
        weight: 100,
    },
    {
        name: "Curry Leaves Idli Podi",
        costPrice: 50,
        mrp: 65,
        unitType: "GRAM",
        weight: 100,
    },
    {
        name: "Sesame Idli Podi",
        costPrice: 50,
        mrp: 65,
        unitType: "GRAM",
        weight: 100,
    },
    {
        name: "Aavarampoo Idli Podi",
        costPrice: 60,
        mrp: 75,
        unitType: "GRAM",
        weight: 100,
    },
    {
        name: "Garlic Idli Podi",
        costPrice: 50,
        mrp: 65,
        unitType: "GRAM",
        weight: 100,
    },
    {
        name: "Paruppu Podi",
        costPrice: 60,
        mrp: 75,
        unitType: "GRAM",
        weight: 100,
    },
    {
        name: "Masala Powder",
        costPrice: 70,
        mrp: 90,
        unitType: "GRAM",
        weight: 100,
    },
    {
        name: "Sukku Powder",
        costPrice: 120,
        mrp: 150,
        unitType: "GRAM",
        weight: 100,
    },
    {
        name: "Dry Ginger Powder",
        costPrice: 90,
        mrp: 110,
        unitType: "GRAM",
        weight: 100,
    },
    {
        name: "Kasturi Manjal",
        costPrice: 190,
        mrp: 220,
        unitType: "GRAM",
        weight: 250,
    },
    {
        name: "Nalangu Maavu",
        costPrice: 80,
        mrp: 100,
        unitType: "GRAM",
        weight: 100,
    },
    {
        name: "Sukku Malli Coffee",
        costPrice: 55,
        mrp: 70,
        unitType: "GRAM",
        weight: 100,
    }
] as const;

async function main() {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // 1. Seed Admin
    try {
        const existingAdmin = await prisma.user.findFirst({
            where: { username: "admin" },
        });

        if (!existingAdmin) {
            await prisma.user.create({
                data: {
                    username: "admin",
                    password: hashedPassword,
                    name: "Admin User",
                    role: "ADMIN",
                },
            });
            console.log("✅ Admin created");
        } else {
            console.log("ℹ️  Admin already exists");
        }
    } catch (e: any) {
        if (e.code === 'P2031') {
            console.warn("⚠️  Skipping Admin creation (Replica Set required for transactions). Please Signup manually.");
        } else {
            console.error("❌ Failed to seed admin:", e);
        }
    }

    // 2. Seed Store Settings
    try {
        const existingSettings = await prisma.storeSettings.findFirst();
        if (!existingSettings) {
            await prisma.storeSettings.create({
                data: {
                    name: "N2H Enterprises",
                    address: "123, Main Street, City",
                    phone: "9876543210",
                    email: "contact@n2h.com",
                    gstin: "22AAAAA0000A1Z5"
                }
            });
            console.log("✅ Store Settings created");
        } else {
            console.log("ℹ️  Store Settings already exist");
        }
    } catch (e) {
        console.error("❌ Failed to seed settings:", e);
    }

    // 3. Seed Customers
    try {
        const customers = [
            { name: "Walk-in Customer", phone: "0000000000", address: "Local" },
            { name: "Rajni", phone: "9999999999", address: "Premium Customer" }
        ];

        for (const c of customers) {
            const existing = await prisma.customer.findFirst({ where: { phone: c.phone } });
            if (!existing) {
                await prisma.customer.create({ data: c });
            }
        }
        console.log("✅ Customers seeded");
    } catch (e) {
        console.error("❌ Failed to seed customers:", e);
    }

    // 4. Seed Products
    try {
        console.log("Seeding products...");
        for (const p of products) {
            const existing = await prisma.product.findFirst({ where: { name: p.name } });
            if (!existing) {
                await prisma.product.create({
                    data: {
                        name: p.name,
                        costPrice: p.costPrice,
                        mrp: p.mrp,
                        unitType: p.unitType === "BOX" ? "BOX" : "GRAM",
                        weight: p.weight
                    }
                });
            }
        }
        console.log("Seeding done with products.");
    } catch (e: any) {
        if (e.code === 'P2031') {
            console.warn("⚠️  Skipping Product seeding: MongoDB Standalone does not support transactions needed by Prisma.");
        } else {
            console.error("Failed to seed products:", e);
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
