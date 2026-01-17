"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { createCustomer, updateCustomer } from "@/lib/actions/customer";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea"; // Need to ensure Textarea exists, or use Input

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    phone: z.string().min(10, {
        message: "Phone number must be at least 10 digits.",
    }),
    address: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof formSchema>;

interface CustomerFormProps {
    initialData?: any;
    onSuccess?: () => void;
}

export function CustomerForm({ initialData, onSuccess }: CustomerFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            phone: "",
            address: "",
        },
    });

    async function onSubmit(values: CustomerFormValues) {
        setLoading(true);
        setError("");
        try {
            let res;
            if (initialData) {
                res = await updateCustomer(initialData.id, values);
            } else {
                res = await createCustomer(values);
            }

            if (res.success) {
                form.reset();
                router.refresh();
                if (onSuccess) onSuccess();
                else router.back();
            } else {
                // @ts-ignore
                setError(res.error || res.message || "Something went wrong");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Customer Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Rajni" {...field} />
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
                                <Input placeholder="9876543210" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                {/* Using Input for now, can upgrade to Textarea if needed */}
                                <Input placeholder="123 Street Name, City" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : initialData ? "Update Customer" : "Create Customer"}
                </Button>
            </form>
        </Form>
    );
}
