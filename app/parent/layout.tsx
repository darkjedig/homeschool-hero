import { ParentSidebar } from "@/components/parent/parent-sidebar";
import { ParentGate } from "@/components/parent/parent-gate";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell min-h-screen bg-app">
      <ParentSidebar />
      <main className="min-w-0 overflow-x-hidden lg:pl-64">
        <div className="mx-auto max-w-[1600px] space-y-6 p-4 lg:p-6">
          <ParentGate>{children}</ParentGate>
        </div>
      </main>
    </div>
  );
}
