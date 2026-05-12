import { requireTeacher } from "@/lib/requireTeacher";
import { createClient } from "@/lib/supabase/server";
import { AddStudentForm } from "./AddStudentForm";
import { DeleteStudentButton } from "./DeleteStudentButton";

export default async function StudentsPage() {
  await requireTeacher();

  const supabase = await createClient();
  const { data: students } = await supabase
    .from("profiles")
    .select("id, name, role, created_at")
    .eq("role", "student")
    .order("name");

  return (
    <>
      <div className="admin-hd">
        <h1>Alunos</h1>
      </div>

      <AddStudentForm />

      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>
          Contas cadastradas ({students?.length ?? 0})
        </h2>

        {!students?.length ? (
          <div
            className="empty-state"
            style={{
              border: "var(--hairline) solid var(--border)",
              background: "var(--card)",
              padding: 40,
            }}
          >
            <p>Nenhum aluno cadastrado ainda.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail / ID</th>
                <th>Cadastrado em</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--muted)",
                    }}
                  >
                    {s.id}
                  </td>
                  <td
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--muted)",
                    }}
                  >
                    {new Date(s.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <DeleteStudentButton userId={s.id} name={s.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
