import { useState, useEffect } from "react";
import { ProductSearch } from "./product-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Printer, X, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { InvoiceA4 } from "./invoice-a4";
import { CustomerSelect } from "./customer-select";
import { createRoot } from "react-dom/client";
import api from "@/lib/axios";

interface CartItem {
    productId: string;
    name: string;
    mrp: number;
    unitType: "BOX" | "GRAM";
    quantity: number;
    total: number;
    weight?: number;
}

export function BillingPOS() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customer, setCustomer] = useState<{ id: string; name: string; phone: string; address?: string | null } | null>(null);

    const [discountPercent, setDiscountPercent] = useState(0);
    const [gstPercent, setGstPercent] = useState(0);
    const [loading, setLoading] = useState(false);
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

    const addToCart = (product: any) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.productId === product.id);
            if (existing) {
                toast.info(`Increased quantity for ${product.name}`);
                return prev.map((item) =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.mrp }
                        : item
                );
            }
            toast.success(`${product.name} added`);
            return [
                ...prev,
                {
                    productId: product.id,
                    name: product.name,
                    mrp: product.mrp,
                    unitType: product.unitType,
                    quantity: 1,
                    total: product.mrp,
                    weight: product.weight
                },
            ];
        });
    };

    const updateQuantity = (productId: string, qty: number) => {
        if (qty < 0) return;
        setCart((prev) =>
            prev.map((item) =>
                item.productId === productId
                    ? { ...item, quantity: qty, total: qty * item.mrp }
                    : item
            )
        );
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.productId !== productId));
        toast.error("Item removed from cart");
    };

    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * discountPercent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * gstPercent) / 100;
    const totalAmount = Math.round(taxableAmount + taxAmount);

    const handlePrintInvoice = (invoice: any) => {
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
                    <title>Invoice</title>
                    ${styles}
                    <style>
                        body { margin: 0; padding: 0; background: white; }
                        @media print { 
                            @page { margin: 0; size: A4; }
                        }
                    </style>
                </head>
                <body>
                    <div id="print-mount"></div>
                </body>
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

    const handleSaveAndPrint = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        const invoiceData = {
            items: cart.map(item => ({
                productId: item.productId,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.mrp,
                total: item.total
            })),
            subtotal,
            discount: discountAmount,
            taxAmount,
            totalAmount,
            paymentMode: "CASH" as const,
            customerId: customer?.id
        };

        try {
            const res = await api.post("/invoices", invoiceData);
            setLoading(false);

            if (res.data.success) {
                setCart([]);
                setDiscountPercent(0);
                setCustomer(null);
                toast.success("Bill saved successfully!");
                handlePrintInvoice(res.data.data);
            } else {
                toast.error("Failed to save bill");
            }
        } catch (error) {
            setLoading(false);
            toast.error("Failed to save bill");
        }
    };

    return (
        <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <Card className="shadow-md border-0 bg-background/50 backdrop-blur">
                        <CardHeader className="py-4 border-b">
                            <CardTitle className="text-lg">New Sale</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Customer</label>
                                {!customer ? (
                                    <CustomerSelect onSelect={setCustomer} />
                                ) : (
                                    <div className="flex items-center justify-between p-2 border rounded-md bg-accent/20">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{customer.name}</span>
                                            <span className="text-xs text-muted-foreground">{customer.phone}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setCustomer(null)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Add Products</label>
                                <ProductSearch onSelect={addToCart} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex-1 shadow-md border-0 min-h-[400px]">
                        <CardHeader className="py-4 border-b bg-muted/5 flex flex-row justify-between items-center">
                            <CardTitle className="text-lg">Items in Cart</CardTitle>
                            <span className="text-sm text-muted-foreground">{cart.length} items</span>
                        </CardHeader>
                        <CardContent className="p-0">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
                                    <div className="bg-muted p-4 rounded-full mb-4">
                                        <PlusCircle className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <p className="font-medium">No items added yet</p>
                                    <p className="text-sm">Search and select products to bill</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/30 text-muted-foreground font-medium border-b">
                                        <tr>
                                            <th className="text-left p-3 pl-6">Product</th>
                                            <th className="text-center p-3">Price</th>
                                            <th className="text-center p-3">Qty</th>
                                            <th className="text-right p-3 pr-6">Total</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {cart.map((item) => (
                                            <tr key={item.productId} className="hover:bg-muted/20 transition-colors group">
                                                <td className="p-3 pl-6">
                                                    <div className="font-medium text-foreground">{item.name}</div>
                                                    <div className="text-xs text-muted-foreground">{item.unitType === 'GRAM' ? 'Per Gram' : 'Per Box'}</div>
                                                </td>
                                                <td className="text-center p-3">₹{item.mrp}</td>
                                                <td className="text-center p-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button variant="outline" size="icon" className="h-6 w-6 rounded-full" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</Button>
                                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                        <Button variant="outline" size="icon" className="h-6 w-6 rounded-full" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</Button>
                                                    </div>
                                                </td>
                                                <td className="text-right p-3 pr-6 font-bold text-foreground">₹{item.total}</td>
                                                <td className="p-3 text-center">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeFromCart(item.productId)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 sticky top-4">
                    <Card className="shadow-xl border-t-4 border-t-primary overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b pb-4">
                            <CardTitle>Bill Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">

                            <div className="space-y-3">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-foreground">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Disc %</label>
                                        <Input
                                            type="number"
                                            className="h-9 text-center bg-muted/20 border-transparent focus:border-primary focus:bg-background transition-all"
                                            value={discountPercent}
                                            onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-muted-foreground">GST %</label>
                                        <Input
                                            type="number"
                                            className="h-9 text-center bg-muted/20 border-transparent focus:border-primary focus:bg-background transition-all"
                                            value={gstPercent}
                                            onChange={(e) => setGstPercent(parseFloat(e.target.value) || 0)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </div>

                                {(discountAmount > 0 || taxAmount > 0) && (
                                    <div className="pt-2 border-t border-dashed space-y-1">
                                        {discountAmount > 0 && <div className="flex justify-between text-xs text-green-600"><span>Discount</span><span>-₹{discountAmount.toFixed(2)}</span></div>}
                                        {taxAmount > 0 && <div className="flex justify-between text-xs text-red-600"><span>Tax</span><span>+₹{taxAmount.toFixed(2)}</span></div>}
                                    </div>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-sm font-medium text-muted-foreground">Grand Total</span>
                                    <span className="text-3xl font-extrabold text-primary tracking-tight">₹{totalAmount}</span>
                                </div>
                                <p className="text-xs text-muted-foreground text-right">Inclusive of all taxes</p>
                            </div>

                            <Button
                                className="w-full h-14 text-lg font-bold shadow-lg bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
                                onClick={handleSaveAndPrint}
                                disabled={cart.length === 0 || loading}
                            >
                                {loading ? "Processing..." : (
                                    <div className="flex items-center gap-2">
                                        <Printer className="h-5 w-5" />
                                        CONFIRM & PRINT
                                    </div>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
