import { format } from "date-fns";

interface InvoiceA4Props {
    invoice: any;
    settings?: {
        name: string;
        address?: string | null;
        phone?: string | null;
        email?: string | null;
        gstin?: string | null;
    } | null;
}

export function InvoiceA4({ invoice, settings }: InvoiceA4Props) {
    if (!invoice) return null;

    return (
        <div className="w-full max-w-[210mm] mx-auto bg-white text-black p-10 min-h-[297mm] relative text-sm">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 uppercase tracking-tight">{settings?.name || "N2H Enterprises"}</h1>
                    <p className="text-sm text-slate-500 mt-1 max-w-xs">{settings?.address || "123, Business Street, City"}</p>
                    <div className="mt-2 text-sm text-slate-600 space-y-0.5">
                        <p>Phone: {settings?.phone || "N/A"}</p>
                        <p>Email: {settings?.email || "N/A"}</p>
                        <p>GSTIN: <span className="font-semibold">{settings?.gstin || "N/A"}</span></p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-light text-slate-400 uppercase">Invoice</h2>
                    <p className="text-lg font-bold text-slate-800 mt-1">{invoice.invoiceNo}</p>
                    <p className="text-sm text-slate-500">Date: {format(new Date(invoice.createdAt), "dd MMM yyyy")}</p>
                </div>
            </div>

            {/* Bill To */}
            <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Bill To</h3>
                {invoice.customer ? (
                    <div>
                        <p className="font-bold text-lg text-slate-800">{invoice.customer.name}</p>
                        <p className="text-slate-600">{invoice.customer.phone}</p>
                        <p className="text-slate-600 max-w-sm">{invoice.customer.address || "No Address Provided"}</p>
                    </div>
                ) : (
                    <p className="text-slate-400 italic">Walk-in Customer</p>
                )}
            </div>

            {/* Table */}
            <div className="mb-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-800">
                            <th className="py-3 text-sm font-bold text-slate-600 uppercase w-[50%]">Item Description</th>
                            <th className="py-3 text-sm font-bold text-slate-600 uppercase text-right w-[15%]">Price</th>
                            <th className="py-3 text-sm font-bold text-slate-600 uppercase text-right w-[15%]">Qty</th>
                            <th className="py-3 text-sm font-bold text-slate-600 uppercase text-right w-[20%]">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item: any) => (
                            <tr key={item.id} className="border-b border-slate-200">
                                <td className="py-3 text-slate-700">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-slate-400">HSN: {item.product?.hsn || "N/A"}</p>
                                </td>
                                <td className="py-3 text-right text-slate-700">₹{item.unitPrice.toFixed(2)}</td>
                                <td className="py-3 text-right text-slate-700">{item.quantity}</td>
                                <td className="py-3 text-right text-slate-900 font-medium">₹{item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-12">
                <div className="w-[40%] space-y-2">
                    <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span>₹{invoice.subtotal.toFixed(2)}</span>
                    </div>
                    {invoice.discount > 0 && (
                        <div className="flex justify-between text-red-500">
                            <span>Discount</span>
                            <span>- ₹{invoice.discount.toFixed(2)}</span>
                        </div>
                    )}
                    {invoice.taxAmount > 0 && (
                        <div className="flex justify-between text-slate-600">
                            <span>Tax (GST)</span>
                            <span>₹{invoice.taxAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t-2 border-slate-800 mt-4">
                        <span className="text-xl font-bold text-slate-900">Total</span>
                        <span className="text-2xl font-bold text-primary">₹{invoice.totalAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-right text-xs text-slate-400 mt-1">Amount in Words: {convertNumberToWords(invoice.totalAmount)}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-10 left-10 right-10">
                <div className="grid grid-cols-2 gap-8 items-end">
                    <div className="text-xs text-slate-500 space-y-1">
                        <p className="font-bold text-slate-700 uppercase mb-2">Terms & Conditions:</p>
                        <p>1. Goods once sold will not be taken back.</p>
                        <p>2. Subject to City Jurisdiction.</p>
                        <p>3. Interest @ 24% p.a. will be charged if bill is not paid on due date.</p>
                    </div>
                    <div className="text-right">
                        <div className="h-16 mb-2 border-b border-dashed border-slate-400 inline-block w-48"></div>
                        <p className="text-xs font-bold text-slate-700 uppercase">Authorized Signatory</p>
                        <p className="text-xs text-slate-500">For {settings?.name || "N2H Enterprises"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function convertNumberToWords(amount: number) {
    return `Rupees ${Math.floor(amount)} Only`;
}
