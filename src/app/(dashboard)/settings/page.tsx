import { StoreForm } from "@/components/settings/store-form";
import { getStoreSettings } from "@/lib/actions/settings";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
    const settings = await getStoreSettings();

    return (
        <div className="space-y-6 p-10 pb-16">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your store profile and invoice configurations.
                </p>
            </div>
            <Separator />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <div className="flex-1 lg:max-w-2xl">
                    <StoreForm initialData={settings} />
                </div>
            </div>
        </div>
    );
}
