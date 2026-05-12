import Link from "next/link";
import { SupplierForm } from "../SupplierForm";

export default function NewSupplierPage() {
  return (
    <>
      <div className="admin-hd">
        <div>
          <div className="crumbs" style={{ paddingTop: 0, marginBottom: 6 }}>
            <Link href="/admin/suppliers">Fornecedores</Link>
            <span>/</span>
            <span>Novo</span>
          </div>
          <h1>Novo fornecedor</h1>
        </div>
      </div>
      <SupplierForm />
    </>
  );
}
