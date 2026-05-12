import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Store, Package, Users, Activity } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { data: { user } },
    { count: supplierCount },
    { count: productCount },
    { data: logs },
    { data: students },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("suppliers").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("activity_log").select("user_id, user_name, action").order("created_at", { ascending: false }).limit(500),
    supabase.from("profiles").select("id, name").eq("role", "student"),
  ]);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const isTeacher = profile?.role === "teacher";

  // Per-student stats from activity log
  const statsMap: Record<string, { name: string; created: number; updated: number; deleted: number }> = {};
  if (logs) {
    for (const log of logs) {
      if (!statsMap[log.user_id]) {
        statsMap[log.user_id] = { name: log.user_name, created: 0, updated: 0, deleted: 0 };
      }
      if (log.action === "criou") statsMap[log.user_id].created++;
      else if (log.action === "atualizou") statsMap[log.user_id].updated++;
      else if (log.action === "excluiu") statsMap[log.user_id].deleted++;
    }
  }
  const stats = Object.values(statsMap).sort((a, b) =>
    (b.created + b.updated + b.deleted) - (a.created + a.updated + a.deleted)
  );

  const cards = [
    { label: "Fornecedores", count: supplierCount ?? 0, icon: Store, href: "/admin/suppliers", action: "Gerenciar" },
    { label: "Produtos", count: productCount ?? 0, icon: Package, href: "/admin/suppliers", action: "Ver por fornecedor" },
    ...(isTeacher ? [
      { label: "Alunos", count: students?.length ?? 0, icon: Users, href: "/admin/students", action: "Gerenciar alunos" },
    ] : []),
  ];

  return (
    <>
      <div className="admin-hd">
        <h1>Dashboard</h1>
        {isTeacher && (
          <Link href="/admin/activity" className="btn btn-ghost btn-sm">
            <Activity size={14} /> Ver atividade completa →
          </Link>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {cards.map(({ label, count, icon: Icon, href, action }) => (
          <div
            key={label}
            style={{
              background: "var(--card)",
              border: "var(--hairline) solid var(--border)",
              padding: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Icon size={18} color="var(--muted)" />
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {label}
              </span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, lineHeight: 1, marginBottom: 16 }}>
              {count}
            </div>
            <Link href={href} className="btn btn-ghost btn-sm">
              {action} →
            </Link>
          </div>
        ))}
      </div>

      {isTeacher && stats.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>
            Atividade por aluno
          </h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Criou</th>
                <th>Atualizou</th>
                <th>Excluiu</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.name}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>
                    <span className="badge" style={{ background: "rgba(42,94,42,0.12)", color: "var(--good)" }}>
                      {s.created}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: "rgba(21,20,15,0.08)", color: "var(--text)" }}>
                      {s.updated}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: "rgba(180,50,26,0.1)", color: "var(--warn)" }}>
                      {s.deleted}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                    {s.created + s.updated + s.deleted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isTeacher && (
        <div style={{ background: "var(--card)", border: "var(--hairline) solid var(--border)", padding: 20, fontSize: 13, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          <strong style={{ color: "var(--text)" }}>Dica:</strong> Use{" "}
          <Link href="/admin/suppliers" style={{ color: "var(--primary)" }}>Fornecedores</Link>{" "}
          para criar, editar ou excluir fornecedores e seus produtos.
        </div>
      )}
    </>
  );
}
