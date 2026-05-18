import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "../SignOutButton";

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

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <Link href="/admin" className="brand">
          <span className="brand-mark" style={{ background: "var(--accent)" }}>
            A
          </span>
          <span className="brand-name">Admin <span style={{ opacity: 0.55 }}>· Arapuá</span></span>
        </Link>
        <nav className="admin-nav">
          <Link href="/admin/suppliers">Fornecedores</Link>
          {isTeacher && <Link href="/admin/students">Alunos</Link>}
          {isTeacher && <Link href="/admin/activity">Atividade</Link>}
          {isTeacher && <Link href="/admin/settings">Configurações</Link>}
          <Link href="/" target="_blank">
            ↗ Site
          </Link>
        </nav>
        <SignOutButton />
      </header>
      <div className="admin-body">{children}</div>
    </div>
  );
}
