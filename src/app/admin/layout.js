import { requireRole } from "@/lib/session";
import PortalShell from "@/components/PortalShell";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/teachers", label: "Teachers" },
  { href: "/admin/sessions", label: "Matchmaking" },
];

export default async function AdminLayout({ children }) {
  const user = await requireRole("admin");
  return (
    <PortalShell
      title="London Academy — Command Center"
      badge="Super-Admin"
      nav={NAV}
      user={user}
    >
      {children}
    </PortalShell>
  );
}
