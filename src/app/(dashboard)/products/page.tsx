import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/products/product-table";
import { getProducts } from "@/lib/actions/product";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { page?: string; search?: string };
}) {
    const page = Number(searchParams?.page) || 1;
    const search = searchParams.search || "";

    const { products, metadata } = await getProducts({ page, search });

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Products</h2>
                    <p className="text-muted-foreground">
                        Manage your product inventory here.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href="/products/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </Link>
                </div>
            </div>
            <ProductTable products={products} />
            {/* Pagination component can be added here if needed */}
        </div>
    );
}
