import { CustomerForm } from "@/components/customers/customer-form";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
    const customer = await prisma.customer.findUnique({
        where: { id: params.id },
    });

    if (!customer) {
        notFound();
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Edit Customer</h2>
            </div>
            <div className="grid gap-4 max-w-2xl">
                <CustomerForm initialData={customer} />
            </div>
        </div>
    );
}
