import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function SentPage() {
  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>
        <div className="sent-page">
          <div className="sent-check">✓</div>
          <h1>Pedido enviado!</h1>
          <p>
            Sua mensagem foi enviada ao fornecedor pelo WhatsApp. Em uma
            situação real, ele confirmaria a disponibilidade e o prazo de
            entrega.
          </p>
          <Link href="/" className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>
            Novo pedido →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
