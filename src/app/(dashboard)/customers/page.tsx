import { Button } from "@/components/ui/button";
import { CustomerTable } from "@/components/customers/customer-table";
import { getCustomers } from "@/lib/actions/customer";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function CustomersPage({
    searchParams,
}: {
    searchParams: { page?: string; search?: string };
}) {
    const page = Number(searchParams.page) || 1;
    const search = searchParams.search || "";

    const { customers, metadata } = await getCustomers({ page, search });

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
                    <p className="text-muted-foreground">
                        Manage your customer database.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href="/customers/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Customer
                        </Button>
                    </Link>
                </div>
            </div>
            <CustomerTable customers={customers} />
        </div>
    );
}
