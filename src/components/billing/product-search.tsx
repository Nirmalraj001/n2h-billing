"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { getProducts } from "@/lib/actions/product";

interface ProductSearchProps {
    onSelect: (product: any) => void;
}

export function ProductSearch({ onSelect }: ProductSearchProps) {
    const [open, setOpen] = React.useState(false);
    const [products, setProducts] = React.useState<any[]>([]);
    const [query, setQuery] = React.useState("");

    React.useEffect(() => {
        // Debounce search
        const timer = setTimeout(async () => {
            if (query.length > 0) { // Search even with empty for initial list?
                const res = await getProducts({ search: query, limit: 10 });
                setProducts(res.products);
            } else {
                const res = await getProducts({ limit: 100 });
                setProducts(res.products);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {query ? query : "Search products..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
                <Command shouldFilter={false}>
                    {/* We handle filtering server-side */}
                    <CommandInput
                        placeholder="Search product name..."
                        onValueChange={setQuery}
                        value={query}
                    />
                    <CommandList>
                        <CommandEmpty>No product found.</CommandEmpty>
                        <CommandGroup>
                            {products.map((product) => (
                                <CommandItem
                                    key={product.id}
                                    value={product.name}
                                    onSelect={(currentValue) => {
                                        onSelect(product);
                                        setOpen(false);
                                        setQuery(""); // Reset query or keep it?
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 opacity-0"
                                        )}
                                    />
                                    <div className="flex justify-between w-full items-center">
                                        <span>{product.name}</span>
                                        <span className="text-muted-foreground">₹{product.mrp}/{product.unitType}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
