import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full relative">
            {/* Desktop Sidebar - Fixed */}
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900 border-r border-gray-800">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <main className="md:pl-72 h-full flex flex-col">
                {/* Mobile Header */}
                <div className="md:hidden h-16 border-b flex items-center px-4 bg-background sticky top-0 z-[40]">
                    <MobileSidebar />
                    <span className="ml-4 font-bold text-lg">N2H Billing</span>
                </div>

                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
