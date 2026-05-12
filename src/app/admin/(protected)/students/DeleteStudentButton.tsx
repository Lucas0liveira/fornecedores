"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { removeStudent } from "./actions";

export function DeleteStudentButton({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!window.confirm(`Remover a conta de "${name}"? O aluno perderá o acesso imediatamente.`))
      return;
    setLoading(true);
    const result = await removeStudent(userId);
    setLoading(false);
    if (result.error) {
      alert("Erro ao remover: " + result.error);
      return;
    }
    router.refresh();
  };

  return (
    <button
      className="btn btn-danger btn-sm"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "…" : "Remover"}
    </button>
  );
}
