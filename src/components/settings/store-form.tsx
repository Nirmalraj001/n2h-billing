"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea"; // Ensure this component exists or use Input for now
import { updateStoreSettings } from "@/lib/actions/settings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

const formSchema = z.object({
    name: z.string().min(2, { message: "Store name must be at least 2 characters." }),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    gstin: z.string().optional(),
});

interface StoreFormProps {
    initialData?: {
        name: string;
        address?: string | null;
        phone?: string | null;
        email?: string | null;
        gstin?: string | null;
    };
}

export function StoreForm({ initialData }: StoreFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            address: initialData?.address || "",
            phone: initialData?.phone || "",
            email: initialData?.email || "",
            gstin: initialData?.gstin || "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        const res = await updateStoreSettings(values);
        setLoading(false);

        if (res.success) {
            toast.success("Settings updated successfully");
            router.refresh();
        } else {
            toast.error("Failed to update settings");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Store Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="N2H Enterprises" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="999..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="contact@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gstin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>GSTIN</FormLabel>
                                <FormControl>
                                    <Input placeholder="GST Number" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Optional: Displayed on invoices.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="Full Address" {...field} />
                                    {/* Textarea would be better but keeping simple for now */}
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Settings"}
                </Button>
            </form>
        </Form>
    );
}
