import { CustomerForm } from "@/components/customers/customer-form";

export default function NewCustomerPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Add Customer</h2>
            </div>
            <div className="grid gap-4 max-w-2xl">
                <CustomerForm />
            </div>
        </div>
    );
}
