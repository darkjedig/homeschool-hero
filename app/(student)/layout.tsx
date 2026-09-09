import { StudentGate } from "@/components/student/student-gate";
import { StudentSidebar } from "@/components/student/student-sidebar";
import { FloatingActionButton } from "@/components/student/floating-action-button";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell min-h-screen bg-app">
      <StudentSidebar />
      <main className="min-w-0 overflow-x-hidden lg:pl-64">
        <div className="mx-auto max-w-[1600px] space-y-6 p-4 lg:p-6"><StudentGate>{children}</StudentGate></div>
      </main>
      <FloatingActionButton />
    </div>
  );
}
