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
    { key: "hero_image",    value: (formData.get("hero_image")    as string) || "" },
    { key: "logo_url",      value: (formData.get("logo_url")      as string) || "" },
    { key: "primary_color", value: (formData.get("primary_color") as string) || "#2d5f3f" },
    { key: "accent_color",  value: (formData.get("accent_color")  as string) || "#f5c842" },
    { key: "bg_type",       value: (formData.get("bg_type")       as string) || "gradient" },
    { key: "bg_color",      value: (formData.get("bg_color")      as string) || "#fbf7eb" },
    { key: "grad_color_1",  value: (formData.get("grad_color_1")  as string) || "#fef3c7" },
    { key: "grad_color_2",  value: (formData.get("grad_color_2")  as string) || "#d4eccf" },
    { key: "show_prices",   value: formData.get("show_prices") === "true" ? "true" : "false" },
    { key: "contact_email", value: (formData.get("contact_email") as string) || "" },
  ];

  for (const row of rows) {
    await supabase.from("site_config").upsert(row, { onConflict: "key" });
  }

  revalidateTag("site-config", {});
}
