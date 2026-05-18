"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Users,
  Activity,
  Settings,
  ExternalLink,
} from "lucide-react";

interface Props {
  isTeacher: boolean;
}

export function AdminSidebarNav({ isTeacher }: Props) {
  const pathname = usePathname();

  const active = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <nav className="sidebar-nav">
      <Link href="/admin" className={active("/admin") ? "active" : ""}>
        <LayoutDashboard size={16} />
        Dashboard
      </Link>
      <Link href="/admin/suppliers" className={active("/admin/suppliers") ? "active" : ""}>
        <Store size={16} />
        Fornecedores
      </Link>

      {isTeacher && (
        <>
          <div className="nav-sep">Turma</div>
          <Link href="/admin/students" className={active("/admin/students") ? "active" : ""}>
            <Users size={16} />
            Alunos
          </Link>
          <Link href="/admin/activity" className={active("/admin/activity") ? "active" : ""}>
            <Activity size={16} />
            Atividade
          </Link>
        </>
      )}

      <div className="nav-sep">Sistema</div>
      {isTeacher && (
        <Link href="/admin/settings" className={active("/admin/settings") ? "active" : ""}>
          <Settings size={16} />
          Configurações
        </Link>
      )}
      <Link href="/" target="_blank">
        <ExternalLink size={14} />
        Ver site
      </Link>
    </nav>
  );
}
