import { Metadata } from "next";
import { getDashboardStats, getRecentSales, getSalesReport } from "@/lib/actions/report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesChart } from "@/components/reports/sales-chart";
import { RecentSales } from "@/components/reports/recent-sales";
import { IndianRupee, Package, ShoppingCart, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
    title: "Dashboard - Billing App",
    description: "Sales Overview and Analytics",
};

export default async function DashboardPage() {
    // Fetch data in parallel
    const [stats, salesData, recentSales] = await Promise.all([
        getDashboardStats(),
        getSalesReport("30d"), // Default 30 days
        getRecentSales(5)
    ]);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Revenue */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            +₹{stats.monthSales.toLocaleString()} this month
                        </p>
                    </CardContent>
                </Card>

                {/* Sales Today */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Sales Today
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.todaysSales.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.todaysOrders} orders today
                        </p>
                    </CardContent>
                </Card>

                {/* Total Orders */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                    </CardContent>
                </Card>

                {/* Active Products (Placeholder for now) */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Low Stock
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.lowStock}</div>
                        <p className="text-xs text-muted-foreground">
                            Items need reorder
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <SalesChart data={salesData} />
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentSales sales={recentSales} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
