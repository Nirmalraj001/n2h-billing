import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function DashboardLayout() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar Placeholder */}
            <div className="flex">
                <aside className="w-64 min-h-screen bg-card border-r hidden md:block p-4">
                    <h1 className="text-xl font-bold mb-8">N2H Billing</h1>
                    <nav className="space-y-2">
                        <a href="/dashboard" className="block p-2 hover:bg-accent rounded">Dashboard</a>
                        <a href="/billing" className="block p-2 hover:bg-accent rounded">Billing</a>
                        <a href="/products" className="block p-2 hover:bg-accent rounded">Products</a>
                        <a href="/customers" className="block p-2 hover:bg-accent rounded">Customers</a>
                        <a href="/invoices" className="block p-2 hover:bg-accent rounded">Invoices</a>
                        <a href="/settings" className="block p-2 hover:bg-accent rounded">Settings</a>
                    </nav>
                </aside>
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
