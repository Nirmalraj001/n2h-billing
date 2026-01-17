
interface InvoicePrintProps {
    invoice: any;
    settings?: {
        name: string;
        address?: string | null;
        phone?: string | null;
        email?: string | null;
        gstin?: string | null;
    } | null;
}

export function InvoicePrint({ invoice, settings }: InvoicePrintProps) {
    if (!invoice) return null;

    return (
        <div className="w-full max-w-[80mm] mx-auto text-black font-mono text-sm">
            <div className="text-center mb-4">
                <h1 className="text-xl font-bold uppercase">{settings?.name || "N2H Enterprises"}</h1>
                <p>{settings?.address || "Homemade Food Business"}</p>
                <p>Phone: {settings?.phone || "9999999999"}</p>
                {settings?.gstin && <p>GSTIN: {settings?.gstin}</p>}
            </div>

            <div className="dashed-border border-b border-black mb-2" />

            <div className="flex justify-between mb-2">
                <span>Inv: {invoice.invoiceNo}</span>
                <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="dashed-border border-b border-black mb-2" />

            <table className="w-full text-left mb-2">
                <thead>
                    <tr>
                        <th className="w-[50%]">Item</th>
                        <th className="w-[15%] text-right">Qty</th>
                        <th className="w-[35%] text-right">Amt</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((item: any) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td className="text-right">{item.quantity}</td>
                            <td className="text-right">{item.total.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="dashed-border border-b border-black mb-2" />

            <div className="space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.discount > 0 && (
                    <div className="flex justify-between">
                        <span>Discount</span>
                        <span>-{invoice.discount.toFixed(2)}</span>
                    </div>
                )}
                {invoice.taxAmount > 0 && (
                    <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{invoice.taxAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-black pt-1">
                    <span>Total</span>
                    <span>₹{invoice.totalAmount}</span>
                </div>
            </div>

            <div className="text-center mt-6">
                <p>Thank you for shopping!</p>
                <p className="text-xs">Visit Again</p>
            </div>
        </div>
    );
}
