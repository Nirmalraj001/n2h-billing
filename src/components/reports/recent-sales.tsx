import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";

interface RecentSalesProps {
    sales: any[];
}

export function RecentSales({ sales }: RecentSalesProps) {
    return (
        <div className="space-y-8">
            {sales.map(sale => (
                <div key={sale.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{sale.customer?.name?.[0] || "G"}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{sale.customer?.name || "Guest Check"}</p>
                        <p className="text-sm text-muted-foreground">
                            {sale.invoiceNo}
                        </p>
                    </div>
                    <div className="ml-auto font-medium">+₹{sale.totalAmount}</div>
                </div>
            ))}
        </div>
    );
}
