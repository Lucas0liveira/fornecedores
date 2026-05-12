"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function addStudent(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const email = (formData.get("email") as string).trim();
  const password = (formData.get("password") as string).trim();

  if (!name || !email || !password) {
    return { error: "Preencha todos os campos." };
  }

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    user_metadata: { name, role: "student" },
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      return { error: "Este e-mail já está cadastrado." };
    }
    return { error: error.message };
  }

  // Profile is created automatically by the DB trigger.
  // If the trigger isn't installed yet, insert manually.
  if (data.user) {
    await admin.from("profiles").upsert({
      id: data.user.id,
      name,
      role: "student",
    });
  }

  return { error: null };
}

export async function removeStudent(userId: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  return { error: null };
}
