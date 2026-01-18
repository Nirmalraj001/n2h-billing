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
import { Printer, Search, FileText } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { InvoiceA4 } from "@/components/billing/invoice-a4";
import { createRoot } from "react-dom/client";

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [storeSettings, setStoreSettings] = useState<any>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get("/settings");
                setStoreSettings(res.data);
            } catch (error) {
                console.error("Failed to load settings");
            }
        };
        fetchSettings();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await api.get("/invoices", {
                params: { page, search, limit: 20 }
            });
            setInvoices(res.data.invoices);
            setTotalPages(res.data.metadata.totalPages);
        } catch (error) {
            toast.error("Failed to load invoices");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInvoices();
        }, 500);
        return () => clearTimeout(timer);
    }, [page, search]);

    const handlePrint = (invoice: any) => {
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
                root.render(<InvoiceA4 invoice={invoice} settings={storeSettings} />);

                setTimeout(() => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                    setTimeout(() => {
                        if (document.body.contains(iframe)) {
                            document.body.removeChild(iframe);
                        }
                    }, 60000);
                }, 500);
            }
        }, 500);
    };

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                <p className="text-muted-foreground">View and manage your billing history.</p>
            </div>

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

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
