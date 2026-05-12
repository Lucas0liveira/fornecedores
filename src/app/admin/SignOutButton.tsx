"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "rgba(250,250,247,0.7)",
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        fontFamily: "var(--font-mono)",
      }}
    >
      <LogOut size={14} />
      Sair
    </button>
  );
}
