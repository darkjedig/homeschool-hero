import { StudentSidebar } from "@/components/student/student-sidebar";
import { FloatingActionButton } from "@/components/student/floating-action-button";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-app">
      <StudentSidebar />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl space-y-6 p-6">{children}</div>
      </main>
      <FloatingActionButton />
    </div>
  );
}
