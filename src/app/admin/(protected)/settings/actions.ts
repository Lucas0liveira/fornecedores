"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireTeacher } from "@/lib/requireTeacher";

export async function saveSiteConfig(formData: FormData) {
  await requireTeacher();
  const supabase = await createClient();

  const rows = [
    { key: "site_title",    value: (formData.get("site_title")    as string) || "Arapuá Marketplace" },
    { key: "hero_text",     value: (formData.get("hero_text")     as string) || "" },
    { key: "logo_url",      value: (formData.get("logo_url")      as string) || "" },
    { key: "primary_color", value: (formData.get("primary_color") as string) || "#15140f" },
    { key: "accent_color",  value: (formData.get("accent_color")  as string) || "#b4321a" },
    { key: "bg_type",       value: (formData.get("bg_type")       as string) || "plain" },
    { key: "bg_color",      value: (formData.get("bg_color")      as string) || "#fafaf7" },
    { key: "grad_color_1",  value: (formData.get("grad_color_1")  as string) || "#c8e6c9" },
    { key: "grad_color_2",  value: (formData.get("grad_color_2")  as string) || "#fff9c4" },
    { key: "show_prices",   value: formData.get("show_prices") === "true" ? "true" : "false" },
  ];

  for (const row of rows) {
    await supabase.from("site_config").upsert(row, { onConflict: "key" });
  }

  revalidateTag("site-config", {});
}
