import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "../SignOutButton";
import { AdminRouteTag } from "./AdminRouteTag";
import { AdminSidebarNav } from "./AdminSidebarNav";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  const isTeacher = profile?.role === "teacher";
  const userName = profile?.name || user.email || "Usuário";
  const userInitial = userName[0]?.toUpperCase() ?? "U";
  const userRole = isTeacher ? "Professora" : "Aluno";

  return (
    <div className="admin-shell">
      <AdminRouteTag />

      <aside className="admin-side">
        <Link href="/admin" className="sidebar-brand">
          <span className="brand-mark">A</span>
          <span>
            <span className="brand-name">Arapuá</span>
            <span className="brand-sub">ADMIN</span>
          </span>
        </Link>

        <AdminSidebarNav isTeacher={isTeacher} />

        <div className="sidebar-user">
          <span className="av">{userInitial}</span>
          <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userName}
            </div>
            <div className="role">{userRole}</div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
