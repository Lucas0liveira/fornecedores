import Link from "next/link";

export function Footer() {
  return (
    <footer className="app-ft">
      <div className="container row">
        <span>Simulador educacional · Disciplina de Logística</span>
        <span style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <span>v1.0 · ambiente de demonstração</span>
          <Link
            href="/admin"
            style={{ color: "var(--muted)", fontSize: "0.75rem", textDecoration: "none" }}
          >
            Área administrativa
          </Link>
        </span>
      </div>
    </footer>
  );
}
