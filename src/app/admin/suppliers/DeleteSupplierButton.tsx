"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteSupplierButton({
  supplierId,
  supplierName,
}: {
  supplierId: string;
  supplierName: string;
}) {
  const router = useRouter();

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Excluir "${supplierName}" e TODOS os seus produtos? Esta ação não pode ser desfeita.`
      )
    )
      return;

    const supabase = createClient();
    const { error } = await supabase
      .from("suppliers")
      .delete()
      .eq("id", supplierId);

    if (error) {
      alert("Erro ao excluir fornecedor: " + error.message);
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
