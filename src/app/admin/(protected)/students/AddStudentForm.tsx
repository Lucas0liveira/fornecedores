"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { addStudent } from "./actions";

export function AddStudentForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(formRef.current!);
    const result = await addStudent(data);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    formRef.current?.reset();
    router.refresh();
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="form-card">
        <h2 style={{ fontWeight: 700, marginBottom: 18 }}>Adicionar aluno</h2>

        {error && (
          <div className="alert-error" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="form-grid">
          <div className="form-field full">
            <label className="form-label">Nome completo</label>
            <input
              name="name"
              className="form-input"
              placeholder="Ana Souza"
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">E-mail</label>
            <input
              name="email"
              type="email"
              className="form-input"
              placeholder="ana@escola.edu.br"
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">Senha inicial</label>
            <input
              name="password"
              type="text"
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Criando conta…" : "Criar conta"}
          </button>
        </div>
      </div>
    </form>
  );
}
