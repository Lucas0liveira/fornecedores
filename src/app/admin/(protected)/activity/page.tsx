import { requireTeacher } from "@/lib/requireTeacher";
import { createClient } from "@/lib/supabase/server";

const ACTION_LABEL: Record<string, string> = {
  criou: "criou",
  atualizou: "atualizou",
  excluiu: "excluiu",
};

const ACTION_COLOR: Record<string, string> = {
  criou: "var(--good)",
  atualizou: "var(--primary)",
  excluiu: "var(--warn)",
};

function fmt(ts: string) {
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ActivityPage() {
  await requireTeacher();

  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <>
      <div className="admin-hd">
        <h1>Registro de atividade</h1>
      </div>

      {!logs?.length ? (
        <div
          className="empty-state"
          style={{
            border: "var(--hairline) solid var(--border)",
            background: "var(--card)",
            padding: 40,
          }}
        >
          <p>Nenhuma atividade registrada ainda.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Horário</th>
              <th>Aluno</th>
              <th>Ação</th>
              <th>Tipo</th>
              <th>Item</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fmt(log.created_at)}
                </td>
                <td style={{ fontWeight: 600 }}>{log.user_name}</td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background:
                        log.action === "criou"
                          ? "rgba(42,94,42,0.12)"
                          : log.action === "excluiu"
                          ? "rgba(180,50,26,0.1)"
                          : "rgba(21,20,15,0.08)",
                      color: ACTION_COLOR[log.action] ?? "var(--text)",
                    }}
                  >
                    {ACTION_LABEL[log.action] ?? log.action}
                  </span>
                </td>
                <td
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--muted)",
                  }}
                >
                  {log.entity_type}
                </td>
                <td>{log.entity_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
