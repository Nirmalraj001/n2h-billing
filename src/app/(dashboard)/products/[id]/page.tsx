import { ProductForm } from "@/components/products/product-form";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const product = await prisma.product.findUnique({
        where: { id: params.id },
    });

    if (!product) {
        notFound();
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
            </div>
            <div className="grid gap-4 max-w-2xl">
                <ProductForm initialData={{ ...product, weight: product.weight || undefined }} />
            </div>
        </div>
    );
}
