const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const url = 'mongodb://localhost:27017';
const dbName = 'billing-app';

const client = new MongoClient(url);

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
];

async function main() {
    try {
        await client.connect();
        console.log('Connected correctly to server');
        const db = client.db(dbName);

        // 1. Seed Admin
        const users = db.collection('User');
        const existingAdmin = await users.findOne({ username: 'admin' });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            await users.insertOne({
                username: "admin",
                password: hashedPassword,
                name: "Admin User",
                role: "ADMIN",
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log("✅ Admin created");
        } else {
            console.log("ℹ️  Admin already exists");
        }

        // 2. Seed Store Settings
        const storeSettings = db.collection('StoreSettings');
        const existingSettings = await storeSettings.findOne({});
        if (!existingSettings) {
            await storeSettings.insertOne({
                name: "N2H Enterprises",
                address: "123, Main Street, City",
                phone: "9876543210",
                email: "contact@n2h.com",
                gstin: "22AAAAA0000A1Z5",
                updatedAt: new Date()
            });
            console.log("✅ Store Settings created");
        } else {
            console.log("ℹ️  Store Settings already exist");
        }

        // 3. Seed Customers
        const customersCollection = db.collection('Customer');
        const customers = [
            { name: "Walk-in Customer", phone: "0000000000", address: "Local" },
            { name: "Rajni", phone: "9999999999", address: "Premium Customer" }
        ];

        for (const c of customers) {
            const existing = await customersCollection.findOne({ phone: c.phone });
            if (!existing) {
                await customersCollection.insertOne({ ...c, createdAt: new Date(), updatedAt: new Date() });
            }
        }
        console.log("✅ Customers seeded");

        // 4. Seed Products
        const productsCollection = db.collection('Product');
        // Using bulkWrite for efficiency or loop, natives driver handles inserts fine on standalone
        let successCount = 0;
        for (const p of products) {
            const existing = await productsCollection.findOne({ name: p.name });
            if (!existing) {
                await productsCollection.insertOne({
                    ...p,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                successCount++;
            }
        }
        console.log(`✅ Products seeded: ${successCount} new products added.`);

    } catch (err) {
        console.error(err.stack);
    } finally {
        await client.close();
    }
}

main();
