import { ParentSidebar } from "@/components/parent/parent-sidebar";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-app">
      <ParentSidebar />
      <main className="min-w-0 overflow-x-hidden lg:pl-60">
        <div className="mx-auto max-w-6xl space-y-6 p-6">{children}</div>
      </main>
    </div>
  );
}
