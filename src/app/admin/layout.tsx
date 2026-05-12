import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogOut } from "lucide-react";
import { SignOutButton } from "./SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <Link href="/admin" className="brand">
          <span
            className="brand-mark"
            style={{ background: "var(--accent)" }}
          >
            L
          </span>
          <span>Admin · Loja Logística</span>
        </Link>
        <nav className="admin-nav">
          <Link href="/admin/suppliers">Fornecedores</Link>
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
