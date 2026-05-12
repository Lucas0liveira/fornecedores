"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteProductButton({
  productId,
  productName,
  supplierId,
}: {
  productId: number;
  productName: string;
  supplierId: string;
}) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(`Excluir "${productName}"?`)) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);
    if (error) {
      alert("Erro ao excluir: " + error.message);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("activity_log").insert({
        user_id: user.id,
        user_name: user.user_metadata?.name ?? user.email ?? "Usuário",
        action: "excluiu",
        entity_type: "produto",
        entity_name: productName,
      });
    }

    router.refresh();
  };

  return (
    <button className="btn btn-danger btn-sm" onClick={handleDelete}>
      Excluir
    </button>
  );
}
