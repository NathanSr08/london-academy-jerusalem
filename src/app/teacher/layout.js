import { requireRole } from "@/lib/session";
import PortalShell from "@/components/PortalShell";

const NAV = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/calendar", label: "Calendar" },
  { href: "/teacher/students", label: "Students" },
  { href: "/teacher/earnings", label: "Earnings" },
];

export default async function TeacherLayout({ children }) {
  const user = await requireRole("tutor");
  return (
    <PortalShell title="London Academy — Tutor Portal" badge="Teacher" nav={NAV} user={user}>
      {children}
    </PortalShell>
  );
}
