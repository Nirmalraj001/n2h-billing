"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

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
import { searchCustomers, createCustomer } from "@/lib/actions/customer";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerSelectProps {
    onSelect: (customer: { id: string; name: string; phone: string } | null) => void;
}

export function CustomerSelect({ onSelect }: CustomerSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [customers, setCustomers] = React.useState<{ id: string; name: string; phone: string }[]>([]);
    const [loading, setLoading] = React.useState(false);

    // New Customer Dialog State
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [newCustomerName, setNewCustomerName] = React.useState("");
    const [newCustomerAddress, setNewCustomerAddress] = React.useState("");
    const [newCustomerPhone, setNewCustomerPhone] = React.useState("");

    React.useEffect(() => {
        // Initial load
        handleSearch("");
    }, []);

    const handleSearch = async (search: string) => {
        setLoading(true);
        const res = await searchCustomers(search);
        setCustomers(res);
        setLoading(false);
    };

    const handleCreateCustomer = async () => {
        if (!newCustomerName || !newCustomerPhone) {
            toast.error("Name and Phone are required");
            return;
        }

        const res = await createCustomer({
            name: newCustomerName,
            phone: newCustomerPhone,
            address: newCustomerAddress
        });

        if (res.success && res.data) {
            setCustomers((prev) => [res.data, ...prev]);
            setValue(res.data.id);
            onSelect(res.data);
            setDialogOpen(false);
            setOpen(false);
            toast.success("Customer created!");
            setNewCustomerName("");
            setNewCustomerPhone("");
            setNewCustomerAddress("");
        } else {
            toast.error(res.message || "Failed to create customer");
        }
    };

    const selectedCustomer = customers.find((c) => c.id === value);

    return (
        <div className="flex space-x-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {value
                            ? customers.find((customer) => customer.id === value)?.name
                            : "Select customer..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Search customer name or phone..."
                            onValueChange={(val) => handleSearch(val)}
                        />
                        <CommandList>
                            <CommandEmpty>No customer found.</CommandEmpty>
                            <CommandGroup>
                                {customers.map((customer) => (
                                    <CommandItem
                                        key={customer.id}
                                        value={customer.id}
                                        onSelect={(currentValue) => {
                                            setValue(currentValue === value ? "" : currentValue);
                                            onSelect(currentValue === value ? null : customer);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === customer.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span>{customer.name}</span>
                                            <span className="text-xs text-muted-foreground">{customer.phone}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="px-3" title="Add New Customer">
                        <Plus className="h-4 w-4 mr-1" /> New
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} placeholder="Customer Name" />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value)} placeholder="Phone Number" />
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input value={newCustomerAddress} onChange={(e) => setNewCustomerAddress(e.target.value)} placeholder="Address (Optional)" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateCustomer}>Create Customer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
