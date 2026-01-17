"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Eye, Printer, Search, ArrowUpDown, FileText } from "lucide-react";
import { getInvoices } from "@/lib/actions/billing";
import { toast } from "sonner";
// Import InvoiceA4 for printing logic reuse if possible, or we recreate the iframe logic
import { InvoiceA4 } from "@/components/billing/invoice-a4";
import { createRoot } from "react-dom/client";

export function InvoiceList() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [storeSettings, setStoreSettings] = useState<any>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInvoices();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const fetchSettings = async () => {
            const { getStoreSettings } = await import("@/lib/actions/settings");
            const data = await getStoreSettings();
            setStoreSettings(data);
        };
        fetchSettings();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await getInvoices({ search, limit: 50 }); // Fetch last 50
            setInvoices(res.invoices);
        } catch (error) {
            toast.error("Failed to load invoices");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (invoice: any) => {
        // Reuse the iframe print logic
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (!doc) return;

        const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
            .map(node => node.outerHTML)
            .join("");

        doc.open();
        doc.write(`
            <html>
                <head>
                    <title>Invoice #${invoice.invoiceNo}</title>
                    ${styles}
                    <style>
                        body { margin: 0; padding: 0; background: white; }
                        @media print { @page { margin: 0; size: A4; } }
                    </style>
                </head>
                <body><div id="print-mount"></div></body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            if (iframe.contentWindow && doc.getElementById('print-mount')) {
                const root = createRoot(doc.getElementById('print-mount')!);
                // Need to fetch full invoice details with items if "getInvoices" didn't return them? 
                // The current "getInvoices" DOES NOT return items by default in my checks? 
                // Wait, let's look at actions/billing.ts again. 
                // It includes: { customer: true }. items are NOT included.
                // So we might fail to print items if we don't fetch them.
                // We should probably fetch the single invoice details before printing.

                // Let's assume we need to fetch details.
                // Or I can update getInvoices to include items? 
                // Better to fetch single invoice on print to keep list light.
                // But for now, let's assume I'll add "items: true" to getInvoices for simplicity since it's "Invoice History" and user will likely view details.
                // Actually, modifying `getInvoices` is safer.

                root.render(<InvoiceA4 invoice={invoice} settings={storeSettings} />);
                setTimeout(() => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                    setTimeout(() => document.body.removeChild(iframe), 60000);
                }, 500);
            }
        }, 500);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Card className="shadow-md border-0 bg-background/50 backdrop-blur">
                <CardHeader className="py-4 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Invoice History
                    </CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search invoice # or customer..."
                            className="pl-9 h-9 bg-background"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[150px]">Invoice No</TableHead>
                                <TableHead className="w-[150px]">Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-center w-[120px]">Payment</TableHead>
                                <TableHead className="text-right w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Loading invoices...
                                    </TableCell>
                                </TableRow>
                            ) : invoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                                            <FileText className="h-12 w-12" />
                                            <p>No invoices found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoices.map((invoice) => (
                                    <TableRow key={invoice.id} className="group hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-medium font-mono text-primary">
                                            {invoice.invoiceNo}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {format(new Date(invoice.createdAt), "dd MMM yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            {invoice.customer ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{invoice.customer.name}</span>
                                                    <span className="text-xs text-muted-foreground">{invoice.customer.phone}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">Walk-in</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            ₹{invoice.totalAmount}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                Paid
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                onClick={() => handlePrint(invoice)}
                                                title="Print Invoice"
                                            >
                                                <Printer className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
