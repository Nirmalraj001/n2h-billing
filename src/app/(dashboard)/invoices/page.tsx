import { InvoiceList } from "@/components/invoices/invoice-list";

export default function InvoicesPage() {
    return (
        <div className="p-6 h-full flex flex-col space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                <p className="text-muted-foreground">View and manage your billing history.</p>
            </div>

            <InvoiceList />
        </div>
    );
}
