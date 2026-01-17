export default function DashboardPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-lg shadow border">
                    <h3 className="text-lg font-medium text-gray-500">Total Sales</h3>
                    <p className="text-3xl font-bold mt-2">₹0.00</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow border">
                    <h3 className="text-lg font-medium text-gray-500">Invoices</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow border">
                    <h3 className="text-lg font-medium text-gray-500">Customers</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                </div>
            </div>
        </div>
    );
}
