# How to Run the Billing App

This application is built with **Next.js**, which handles both the frontend (React) and the backend (API routes) in a single process.

## Prerequisites

1. **MongoDB**: Ensure you have MongoDB running locally.
   - Default URL configured: `mongodb://localhost:27017/billing-app`
   - If you don't have MongoDB installed, download it from [MongoDB Community Server](https://www.mongodb.com/try/download/community).

## Quick Start

Open a terminal in the project folder and run:

```bash
npm run dev
```

This will start the development server at **http://localhost:3000**.

## Verify Database Connection

Since we just updated the connection string, you might want to test the database connection by running a seed script or just interacting with the app.

To seed the database (add initial data):
```bash
npx prisma db seed
```

## Troubleshooting

- **"Connection Refused"**: Make sure the MongoDB service is running.
- **"P1001: Can't reach database server"**: Check if the port `27017` is correct and not blocked by a firewall.
