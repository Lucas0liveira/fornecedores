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
    router.refresh();
  };

  return (
    <button className="btn btn-danger btn-sm" onClick={handleDelete}>
      Excluir
    </button>
  );
}
