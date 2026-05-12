# Handoff: Loja Logística — Simulador de Pedidos

## Overview
Aplicação web educacional para alunos do ensino médio (16–18 anos) na disciplina de Logística. Os alunos navegam por **12 fornecedores fictícios**, escolhem produtos, montam um carrinho e enviam o pedido como uma **mensagem de WhatsApp pré-formatada** para o número do fornecedor. Não há checkout real — o "envio" abre `wa.me/<telefone>?text=<mensagem>` para o aluno (ou o professor) revisar e enviar.

Idioma: **pt-BR**.

## About the Design Files
Os arquivos neste bundle são **referências de design criadas em HTML** — protótipos demonstrando o look & feel e o comportamento, **não código de produção para copiar diretamente**. A tarefa é **recriar esses designs no ambiente do codebase alvo** (Next.js + Tailwind, Vite + React, SvelteKit, Astro, etc.) usando os padrões e bibliotecas estabelecidas. Se ainda não existe codebase, recomendo:

- **Stack sugerida:** Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Zustand (para o carrinho) + localStorage para persistência.
- Sem backend necessário no MVP — todos os dados ficam em arquivos JSON/TS no front e o "envio" é um link `wa.me`.

## Fidelity
**High-fidelity (hifi)** — os mocks têm tipografia, cores e espaçamentos definidos. **Replicar com fidelidade visual** na direção escolhida.

**Direção visual escolhida: Editorial + DM Sans para corpo de texto.**
(Veja **Design Tokens — Direção Editorial** abaixo. As outras direções — Mercado e Arcade — podem ser ignoradas; o código em `base.css` mostra os tokens delas só para referência.)

---

## Screens / Views

### 1. Home (Lista de Fornecedores) — rota `/`
**Propósito:** O aluno escolhe de qual fornecedor quer comprar.

**Layout:**
- Header sticky no topo.
- Hero com título grande (display serif) + lede + campo de busca (largura máx. 460px).
- Grid de fornecedores: **3 colunas** em desktop (≥900px), 2 em tablet, 1 em mobile. Gap = `var(--gap)` (16px regular).
- Footer no fim.

**Componentes:**
- **`<SupplierCard>`** — `aspect-ratio: 16/10` para a imagem hero, gradiente sutil no fundo do topo da imagem para o final. Padding interno `var(--pad)` (18px). Estrutura: badge de categoria, h3 com nome (display serif), parágrafo com tagline (muted), divisor + meta com "{n} produtos" e "Ver catálogo →".
- Hover: nenhum shadow (Editorial); o card vai para `background: var(--card-2)`.

**Conteúdo:** 12 fornecedores definidos em `data.js`. Categorias: Hortifruti, Açougue, Laticínios, Panificação, Mercearia, Bebidas, Limpeza, Embalagens, Doces, Congelados, Cafés e Chás, Pescados.

### 2. Catálogo do Fornecedor — rota `/s/:supplierId`
**Propósito:** O aluno busca, filtra, ordena e adiciona produtos ao carrinho.

**Layout:**
- Breadcrumb (`Fornecedores / Nome`) em font-mono pequena.
- Banner com badge categoria, h1 (nome), tagline, linha de meta (endereço, CNPJ, WhatsApp) em font-mono.
- **Toolbar:** campo de busca (flex 1, máx. 460px) + checkbox "Somente em estoque" + select de ordenação (`Nome A→Z`, `Nome Z→A`, `Menor preço`, `Maior preço`).
- Faixa "results meta" com `{n} produtos para "{query}"` + `página X de Y`.
- **Grid de produtos:** padrão = **4 colunas** em desktop (≥1100px), 3 em tablet, 2 em mobile. Variantes: Cozy (3 col), Standard (4 col, default), Dense (5 col), List (1 col).
- **Paginação:** 12 produtos por página. Botões `‹`, `1`, `2`, … `›`. Ativo = `background: var(--primary)`.

**Componentes:**
- **`<ProductCard>`** — `aspect-ratio: 1/1` para a imagem. Body: brand (uppercase, font-mono-ish, 11px, muted), h4 com nome, descrição clamp 2 linhas (muted, 12.5px). Linha de preço: `price` (font display, 26px em Editorial) + `unit` (muted) + `min. {minOrder} {unit}` à direita (font-mono). Stepper de quantidade + botão "Adicionar" lado a lado. Se `inStock = false`, overlay branco semi-transparente "Sem estoque".

**Estados:**
- **Busca em tempo real** (sem debounce no protótipo; em produção, debounce 150–200ms).
- Resetar paginação ao mudar busca/sort/filtro.
- Se o produto já está no carrinho, o botão mostra `Adicionar (N)`.

### 3. Carrinho — rota `/cart`
**Propósito:** Revisar quantidades, remover itens, ir para o envio.

**Layout 2 colunas (desktop ≥900px):**
- Esquerda: card com header do fornecedor (avatar verde-dot + nome + WhatsApp) + lista de linhas do carrinho. Cada linha: thumbnail 80×80 + nome+meta + stepper + total da linha + botão remover (✕).
- Direita: sidebar "Resumo do pedido" com: Itens, Quantidade total, Subtotal, **Total** (negrito grande), botões `Revisar e enviar` (primary), `Continuar comprando` (ghost), `Esvaziar carrinho` (ghost vermelho).

**Estado vazio:** ícone de carrinho centralizado + h2 "Seu carrinho está vazio" + CTA "Ver fornecedores".

**Regra crítica:** **carrinho é mono-fornecedor**. Ao tentar adicionar produto de fornecedor diferente quando o carrinho já tem itens, mostrar `confirm()` perguntando se quer esvaziar o atual. Se sim, substitui pelo novo produto; se não, mantém o atual.

### 4. Revisar Pedido — rota `/review`
**Propósito:** Última conferência + preview da mensagem do WhatsApp.

**Layout 2 colunas (desktop ≥900px):**
- Esquerda: breadcrumb + h1 + parágrafo explicativo + card com cabeçalho do fornecedor (badge + nome + WhatsApp à esq., TOTAL à dir.) + tabela com colunas `Produto | Qtd | Unitário | Total`.
- Direita: **preview do WhatsApp** — fundo `#e5ddd5`, bubble verde `#dcf8c6` com a mensagem em fonte mono, "rabicho" (tail) à direita-cima da bubble, header com avatar circular verde `#25d366`. Abaixo: botão grande verde `#25d366` "Enviar pelo WhatsApp" + botão ghost "Voltar ao carrinho".

**Mensagem (receipt-style):** Ver função `buildMessage()` em `app.jsx` linha ~338. Formato:
```
╔═════════════════════════════╗
   PEDIDO #123456
   10/05/2026
╚═════════════════════════════╝

*Fornecedor:* Hortifruti Verde Vale
*CNPJ:* 12.345.678/0001-01

*── ITENS ──*
01. Banana Prata (Sítio Boa Vista)
    5 kg × R$ 6,90 = R$ 34,50
…

*── TOTAIS ──*
Itens: 5  ·  Qtd total: 27
Subtotal: R$ 142,30
*TOTAL: R$ 142,30*

_Pedido enviado pelo Simulador de Logística — atividade escolar._
```

**Ao enviar:** abrir `https://wa.me/{whatsapp}?text={encodeURIComponent(message)}` em nova aba → esperar 400ms → limpar carrinho → navegar para `/sent`.

### 5. Confirmação — rota `/sent`
**Propósito:** Feedback de sucesso.

**Layout centralizado:** círculo verde grande com ✓ (84px), h1 "Pedido enviado!", parágrafo explicativo, botão "Novo pedido →".

---

## Interactions & Behavior

- **Roteamento:** hash routing (`#/`, `#/s/hortifruti`, `#/cart`, `#/review`, `#/sent`). Em Next.js, troque por roteamento nativo (`app/`, `app/s/[id]`, etc.).
- **Persistência do carrinho:** `localStorage` com chave `logsim.cart.v1`. Em Next.js, hidratar no client após mount para evitar mismatch SSR.
- **Mono-fornecedor:** validação ao adicionar — se `cart.supplierId && product.supplierId !== cart.supplierId`, exibir confirmação.
- **Stepper:** mínimo = 1 (não usa `minOrder` como mínimo do input; `minOrder` é só info para o aluno). Aceita digitação direta no input numérico.
- **Sem debounce na busca no protótipo** — em produção, use debounce 150–200ms.
- **Scroll to top** em mudança de rota.

## State Management

Stores recomendadas (Zustand) ou Context:

```ts
type CartState = {
  supplierId: string | null;
  items: Record<number, { product: Product; qty: number }>;
  add(product: Product, qty: number): void;     // valida mono-fornecedor
  setQty(productId: number, qty: number): void; // qty <= 0 remove
  remove(productId: number): void;
  clear(): void;
};
```

Derivados: `count = Σ qty`, `subtotal = Σ qty * price`.

---

## Design Tokens — Direção **Editorial** (a usada)

### Cores
| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#fafaf7` | Fundo da página |
| `--bg-soft` | `#f1f0eb` | Placeholders, fundos sutis |
| `--card` | `#ffffff` | Cards |
| `--card-2` | `#f6f5f0` | Hover de cards, faixas neutras |
| `--text` | `#15140f` | Texto principal |
| `--muted` | `#6e6c64` | Texto secundário, meta |
| `--border` | `#e3e2dc` | Bordas suaves (hairline) |
| `--border-strong` | `#15140f` | Bordas com ênfase |
| `--primary` | `#15140f` | Botões, badges (Editorial usa preto) |
| `--primary-soft` | `#efeee8` | Fundo de badges |
| `--on-primary` | `#fafaf7` | Texto sobre primary |
| `--accent` | `#b4321a` | Itálicos no hero, alertas |
| `--good` | `#2a5e2a` | Confirmações |
| `--warn` | `#b4321a` | Avisos, remoção |

WhatsApp preview usa cores fixas: bg `#e5ddd5`, bubble `#dcf8c6`, header `#075e54`, avatar/cta `#25d366`.

### Tipografia
- **Sans (body):** `DM Sans`, pesos 400/500/600/700.
- **Display (h1, h3, preços):** `Instrument Serif` (regular + italic). Pesos: 400.
- **Mono (meta, breadcrumb, código):** `JetBrains Mono`, pesos 400/500/600.

Importar via Google Fonts:
```
DM Sans:wght@400;500;600;700
Instrument Serif:ital@0;1
JetBrains Mono:wght@400;500;600
```

Escala (densidade "regular"):
- `--fs-body: 15px`, line-height 1.5
- `--fs-h1: 40px` (× 1.4 em Editorial = **56px**), line-height 1.05, letter-spacing -0.03em
- `--fs-h2: 26px`
- `--fs-card: 15px`
- Preço (Editorial): 26px display serif weight 400

Headings em Editorial são **weight 400** (não negrito) — a estética é leve, magazine-like.

### Espaçamento (densidade regular)
- `--pad: 18px` (padding interno de cards)
- `--gap: 16px` (gap entre cards no grid)
- Container: max-width 1240px, padding lateral 24px

### Bordas e radius (Editorial = sem arredondamento)
- `--radius: 0px`
- `--radius-sm: 0px`
- `--radius-pill: 999px` (mantém pílulas para badges arredondadas no header)
- `--hairline: 1px`
- Sem `box-shadow` em cards (Editorial é flat)

### Estados
- Card hover: sem transform, sem shadow — apenas troca de background para `var(--card-2)`.
- Botão primary hover: `filter: brightness(.95)`.
- Input focus: `border-color: var(--border-strong)`.

---

## Assets

- **Fotos de produtos e hero:** `https://picsum.photos/seed/{keyword}-{seed}/{w}/{h}` — placeholders estáveis. **Devem ser substituídas por fotos reais** (do estoque do professor, ou Unsplash/Pexels via API).
- **Ícones:** SVG inline (lupa, carrinho, plus, seta, whatsapp). Em produção, sugiro `lucide-react`.
- **Dados:** 12 fornecedores × ~35 produtos = ~420 itens em `data.js`. Cada produto tem `id`, `name`, `brand`, `unit` (kg/L/un/pct/etc), `price`, `minOrder`, `description`, `inStock`, `image`, `supplierId`, `keyword`.

## Files (in this bundle)

- `Loja Logística.html` — Entry point (carrega React + Babel CDN + scripts).
- `app.jsx` — Componente raiz, roteador hash, carrinho, todas as telas.
- `base.css` — Todos os tokens das 3 direções + estilos. **Use apenas o bloco `[data-direction="editorial"]` + as regras `data-direction="editorial"` específicas.**
- `data.js` — Catálogo completo (12 suppliers × ~35 products). Pode ser convertido para TS/JSON direto.
- `tweaks-panel.jsx` — Painel de tweaks usado no protótipo; **não precisa ser portado** (era só pra exploração de design).

## Sugestões para Claude Code

Prompt sugerido para iniciar:
> "Implemente a aplicação descrita em `design_handoff_loja_logistica/README.md` em Next.js 14 (App Router) com TypeScript, Tailwind CSS e shadcn/ui. Use Zustand para o carrinho com persistência em localStorage. Use a direção visual **Editorial** descrita no README — fonte DM Sans para corpo, Instrument Serif para títulos, sem arredondamento de cantos, cards flat. Os dados estão em `data.js`; converta para `lib/data.ts` com types apropriados. Faça commit screen por screen: 1) Home, 2) Supplier, 3) Cart, 4) Review (com gerador de mensagem WhatsApp), 5) Sent."
