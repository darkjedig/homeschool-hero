import { StudentGate } from "@/components/student/student-gate";
import { StudentSidebar } from "@/components/student/student-sidebar";
import { FloatingActionButton } from "@/components/student/floating-action-button";
import { TeacherProvider } from "@/components/student/teacher-context";
import { TeacherAssistant } from "@/components/student/teacher-assistant";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell min-h-screen bg-app">
      <StudentSidebar />
      <main className="min-w-0 overflow-x-hidden lg:pl-64">
        <div className="mx-auto max-w-[1600px] space-y-6 p-4 lg:p-6">
          <StudentGate>
            <TeacherProvider>
              {children}
              <TeacherAssistant />
            </TeacherProvider>
          </StudentGate>
        </div>
      </main>
      <FloatingActionButton />
    </div>
  );
}
