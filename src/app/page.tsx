import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeClient } from "./HomeClient";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("id, name, tagline, category, whatsapp, hero")
    .order("name");

  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>
        <HomeClient suppliers={suppliers ?? []} />
      </main>
      <Footer />
    </>
  );
}
