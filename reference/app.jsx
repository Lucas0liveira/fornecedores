/* app.jsx — Loja Logística simulator. Hash-routed React app.
   Routes: #/ (home), #/s/:supplierId, #/cart, #/review, #/sent
   Cart persists in localStorage. */

const { useState, useEffect, useMemo, useCallback, useRef } = React;
const {
  TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakSelect,
  TweakColor, TweakToggle, TweakSlider,
} = window;

// ── Utilities ──────────────────────────────────────────────────────────────
const fmt = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const cls = (...xs) => xs.filter(Boolean).join(' ');

// SVG icons (24px, currentColor). Use className="ico" so iconography toggle hides them.
const Ico = {
  search: () => <svg className="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>,
  cart: () => <svg className="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h2l2.5 12.5a2 2 0 0 0 2 1.5h8a2 2 0 0 0 2-1.5L21 7H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>,
  whatsapp: () => <svg className="ico" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.518 5.275l.241.39-1.001 3.65 3.731-.978zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>,
  plus: () => <svg className="ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  arrow: () => <svg className="ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
};

// ── Cart hook (localStorage-backed) ────────────────────────────────────────
const CART_KEY = 'logsim.cart.v1';
function useCart() {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || { supplierId: null, items: {} }; }
    catch (e) { return { supplierId: null, items: {} }; }
  });
  useEffect(() => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} }, [cart]);
  const add = (product, qty) => {
    setCart((c) => {
      // single-supplier cart: if a different supplier, ask
      if (c.supplierId && c.supplierId !== product.supplierId && Object.keys(c.items).length > 0) {
        const ok = window.confirm(
          'O carrinho só aceita produtos de um fornecedor por vez. Deseja esvaziar o carrinho atual e começar com este novo fornecedor?'
        );
        if (!ok) return c;
        return { supplierId: product.supplierId, items: { [product.id]: { product, qty } } };
      }
      const existing = c.items[product.id];
      const newQty = (existing ? existing.qty : 0) + qty;
      return {
        supplierId: product.supplierId,
        items: { ...c.items, [product.id]: { product, qty: newQty } },
      };
    });
  };
  const setQty = (productId, qty) => {
    setCart((c) => {
      const items = { ...c.items };
      if (qty <= 0) delete items[productId];
      else items[productId] = { ...items[productId], qty };
      const supplierId = Object.keys(items).length > 0 ? c.supplierId : null;
      return { supplierId, items };
    });
  };
  const remove = (productId) => setQty(productId, 0);
  const clear = () => setCart({ supplierId: null, items: {} });
  const count = Object.values(cart.items).reduce((s, it) => s + it.qty, 0);
  const subtotal = Object.values(cart.items).reduce((s, it) => s + it.qty * it.product.price, 0);
  return { cart, add, setQty, remove, clear, count, subtotal };
}

// ── Routing ────────────────────────────────────────────────────────────────
function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || '#/');
  useEffect(() => {
    const h = () => { setHash(window.location.hash || '#/'); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  const path = hash.slice(1) || '/';
  const parts = path.split('/').filter(Boolean);
  return { path, parts, hash };
}
const go = (path) => { window.location.hash = path; };

// ── Header ─────────────────────────────────────────────────────────────────
function Header({ cartCount }) {
  return (
    <header className="app-hd">
      <div className="container app-hd-row">
        <a href="#/" className="brand" onClick={(e) => { e.preventDefault(); go('/'); }}>
          <span className="brand-mark">L</span>
          <span>Loja Logística</span>
        </a>
        <nav className="nav">
          <a href="#/" onClick={(e) => { e.preventDefault(); go('/'); }}>Fornecedores</a>
        </nav>
        <div className="spacer" />
        <button className="cart-pill" onClick={() => go('/cart')}>
          <Ico.cart />
          <span>Carrinho</span>
          <span className="count">{cartCount}</span>
        </button>
      </div>
    </header>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="app-ft">
    <div className="container row">
      <span>Simulador educacional · Disciplina de Logística</span>
      <span style={{ fontFamily: 'var(--font-mono)' }}>v1.0 · ambiente de demonstração</span>
    </div>
  </footer>
);

// ── Home ───────────────────────────────────────────────────────────────────
function Home() {
  const [q, setQ] = useState('');
  const filtered = window.SUPPLIERS.filter((s) =>
    !q || (s.name + ' ' + s.tagline + ' ' + s.category).toLowerCase().includes(q.toLowerCase())
  );
  return (
    <>
      <section className="container home-hero">
        <h1>Escolha um <em>fornecedor</em><br/>e monte seu pedido.</h1>
        <p className="lede">{window.SUPPLIERS.length} fornecedores parceiros · catálogos atualizados · pedidos enviados direto pelo WhatsApp.</p>
        <div className="search" style={{ marginTop: 22, maxWidth: 460 }}>
          <Ico.search />
          <input className="field" placeholder="Buscar fornecedor ou categoria…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 60 }}>
        <div className="suppliers-grid">
          {filtered.map((s) => (
            <a key={s.id} href={`#/s/${s.id}`} className="supplier-card"
               onClick={(e) => { e.preventDefault(); go(`/s/${s.id}`); }}>
              <div className="img" style={{ backgroundImage: `url(https://picsum.photos/seed/${encodeURIComponent(s.hero)}-${s.id}/640/400)` }} />
              <div className="body">
                <span className="badge muted">{s.category}</span>
                <h3>{s.name}</h3>
                <p>{s.tagline}</p>
                <div className="meta">
                  <span>{s.products.length} produtos</span>
                  <span>Ver catálogo →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

// ── Supplier (catalogue) ───────────────────────────────────────────────────
const PER_PAGE = 12;
function Supplier({ id, cart, add }) {
  const supplier = window.findSupplier(id);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('name-asc');
  const [stockOnly, setStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [q, sort, stockOnly, id]);
  if (!supplier) return <div className="container"><p>Fornecedor não encontrado.</p></div>;
  const filtered = useMemo(() => {
    let list = supplier.products.filter((p) =>
      (!q || (p.name + ' ' + p.brand).toLowerCase().includes(q.toLowerCase())) &&
      (!stockOnly || p.inStock)
    );
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        default: return 0;
      }
    });
    return list;
  }, [supplier.id, q, sort, stockOnly]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <section className="container">
        <div className="crumbs">
          <a href="#/" onClick={(e) => { e.preventDefault(); go('/'); }}>Fornecedores</a>
          <span>/</span>
          <a>{supplier.name}</a>
        </div>
        <div className="supplier-banner">
          <div>
            <span className="badge">{supplier.category}</span>
            <h1 style={{ marginTop: 8 }}>{supplier.name}</h1>
            <p className="tag">{supplier.tagline}</p>
            <div className="meta">
              <span>{supplier.address}</span>
              <span>CNPJ {supplier.cnpj}</span>
              <span>WhatsApp +{supplier.whatsapp}</span>
            </div>
          </div>
        </div>

        <div className="toolbar">
          <div className="search">
            <Ico.search />
            <input className="field" placeholder="Buscar produto ou marca…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="right">
            <label className="checkbox">
              <input type="checkbox" checked={stockOnly} onChange={(e) => setStockOnly(e.target.checked)} />
              Somente em estoque
            </label>
            <select className="field" style={{ width: 'auto' }} value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="name-asc">Nome (A → Z)</option>
              <option value="name-desc">Nome (Z → A)</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
            </select>
          </div>
        </div>

        <div className="results-meta">
          <span>{filtered.length} {filtered.length === 1 ? 'produto' : 'produtos'} {q && `para "${q}"`}</span>
          <span>página {page} de {totalPages}</span>
        </div>

        <div className="products-grid">
          {pageItems.map((p) => <ProductCard key={p.id} product={p} onAdd={add} cart={cart} />)}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} className={n === page ? 'active' : ''} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>›</button>
          </div>
        )}
      </section>
    </>
  );
}

function ProductCard({ product, onAdd, cart }) {
  const [qty, setQty] = useState(product.minOrder || 1);
  const inCart = cart.items[product.id]?.qty || 0;
  return (
    <article className="prod">
      <div className="img" style={{ backgroundImage: `url(${product.image})` }}>
        {!product.inStock && <div className="stock-out">Sem estoque</div>}
      </div>
      <div className="body">
        <div className="col-info">
          <span className="brand">{product.brand}</span>
          <h4>{product.name}</h4>
          <p className="desc">{product.description}</p>
        </div>
        <div className="price-row">
          <div>
            <div className="price">{fmt(product.price)}</div>
            <div className="unit">por {product.unit}</div>
          </div>
          <div className="min">mín. {product.minOrder} {product.unit}</div>
        </div>
        <div className="actions">
          <div className="stepper">
            <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <input type="number" value={qty} min={1} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} />
            <button onClick={() => setQty(qty + 1)}>+</button>
          </div>
          <button className="btn btn-primary" disabled={!product.inStock}
                  onClick={() => onAdd(product, qty)}>
            <Ico.plus /> {inCart > 0 ? `Adicionar (${inCart})` : 'Adicionar'}
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Cart ───────────────────────────────────────────────────────────────────
function Cart({ cart, setQty, remove, clear, subtotal }) {
  const items = Object.values(cart.items);
  if (items.length === 0) {
    return (
      <div className="container empty-state">
        <Ico.cart />
        <h2>Seu carrinho está vazio</h2>
        <p>Escolha um fornecedor e adicione produtos para começar.</p>
        <button className="btn btn-primary btn-lg" style={{ marginTop: 14 }} onClick={() => go('/')}>
          Ver fornecedores <Ico.arrow />
        </button>
      </div>
    );
  }
  const supplier = window.findSupplier(cart.supplierId);
  return (
    <div className="container cart-layout">
      <div className="card">
        <div className="cart-supplier-hd">
          <span className="dot" />
          <div>
            <b>{supplier.name}</b>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>WhatsApp +{supplier.whatsapp}</div>
          </div>
        </div>
        {items.map(({ product, qty }) => (
          <div key={product.id} className="cart-row">
            <div className="img" style={{ backgroundImage: `url(${product.image})` }} />
            <div>
              <div className="name">{product.name}</div>
              <div className="meta">
                <span>{product.brand}</span>
                <span>{fmt(product.price)} / {product.unit}</span>
              </div>
            </div>
            <div className="stepper">
              <button onClick={() => setQty(product.id, qty - 1)}>−</button>
              <input type="number" value={qty} min={1} onChange={(e) => setQty(product.id, Math.max(1, +e.target.value || 1))} />
              <button onClick={() => setQty(product.id, qty + 1)}>+</button>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="line-total">{fmt(qty * product.price)}</div>
              <button className="remove" onClick={() => remove(product.id)} title="Remover">✕</button>
            </div>
          </div>
        ))}
      </div>
      <aside className="card summary">
        <h3>Resumo do pedido</h3>
        <div className="line"><span>Itens</span><span>{items.length}</span></div>
        <div className="line"><span>Quantidade total</span><span>{items.reduce((s, it) => s + it.qty, 0)}</span></div>
        <div className="line"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
        <div className="line total"><span>Total</span><span>{fmt(subtotal)}</span></div>
        <div className="actions">
          <button className="btn btn-primary btn-lg" onClick={() => go('/review')}>
            Revisar e enviar <Ico.arrow />
          </button>
          <button className="btn btn-ghost" onClick={() => go(`/s/${supplier.id}`)}>Continuar comprando</button>
          <button className="btn btn-ghost" onClick={() => { if (confirm('Esvaziar o carrinho?')) clear(); }}
                  style={{ color: 'var(--warn)' }}>Esvaziar carrinho</button>
        </div>
      </aside>
    </div>
  );
}

// ── Build the WhatsApp message text (receipt-style) ────────────────────────
function buildMessage(cart, subtotal) {
  const supplier = window.findSupplier(cart.supplierId);
  const items = Object.values(cart.items);
  const today = new Date().toLocaleDateString('pt-BR');
  const orderId = String(Date.now()).slice(-6);
  const L = [];
  L.push(`╔═════════════════════════════╗`);
  L.push(`   PEDIDO #${orderId}`);
  L.push(`   ${today}`);
  L.push(`╚═════════════════════════════╝`);
  L.push('');
  L.push(`*Fornecedor:* ${supplier.name}`);
  L.push(`*CNPJ:* ${supplier.cnpj}`);
  L.push('');
  L.push('*── ITENS ──*');
  items.forEach(({ product, qty }, i) => {
    const lineTotal = qty * product.price;
    L.push(`${String(i + 1).padStart(2, '0')}. ${product.name} (${product.brand})`);
    L.push(`    ${qty} ${product.unit} × ${fmt(product.price)} = ${fmt(lineTotal)}`);
  });
  L.push('');
  L.push('*── TOTAIS ──*');
  L.push(`Itens: ${items.length}  ·  Qtd total: ${items.reduce((s, it) => s + it.qty, 0)}`);
  L.push(`Subtotal: ${fmt(subtotal)}`);
  L.push(`*TOTAL: ${fmt(subtotal)}*`);
  L.push('');
  L.push('_Pedido enviado pelo Simulador de Logística — atividade escolar._');
  return L.join('\n');
}

// ── Review ─────────────────────────────────────────────────────────────────
function Review({ cart, subtotal, clear }) {
  const empty = Object.keys(cart.items).length === 0;
  useEffect(() => { if (empty) go('/'); }, [empty]);
  const supplier = empty ? null : window.findSupplier(cart.supplierId);
  const message = useMemo(() => empty ? '' : buildMessage(cart, subtotal), [empty, cart, subtotal]);
  if (empty) return null;
  const items = Object.values(cart.items);
  const send = () => {
    const url = `https://wa.me/${supplier.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setTimeout(() => { clear(); go('/sent'); }, 400);
  };
  return (
    <div className="container review-layout">
      <div>
        <div className="crumbs">
          <a href="#/cart" onClick={(e) => { e.preventDefault(); go('/cart'); }}>Carrinho</a>
          <span>/</span>
          <a>Revisar pedido</a>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', margin: '14px 0 8px', letterSpacing: '-.02em' }}>
          Revise o pedido antes de enviar
        </h1>
        <p style={{ color: 'var(--muted)', margin: '0 0 22px' }}>
          Confira os itens e o texto. Ao enviar, abriremos o WhatsApp do fornecedor com a mensagem pronta.
        </p>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: 'var(--hairline) solid var(--border)', paddingBottom: 14, marginBottom: 16 }}>
            <div>
              <span className="badge">Fornecedor</span>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, marginTop: 6 }}>
                {supplier.name}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>WhatsApp +{supplier.whatsapp}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>TOTAL</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30 }}>{fmt(subtotal)}</div>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ color: 'var(--muted)', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                <th style={{ padding: '6px 0' }}>Produto</th>
                <th style={{ textAlign: 'right' }}>Qtd</th>
                <th style={{ textAlign: 'right' }}>Unitário</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map(({ product, qty }) => (
                <tr key={product.id} style={{ borderTop: 'var(--hairline) solid var(--border)' }}>
                  <td style={{ padding: '10px 0' }}>
                    <div style={{ fontWeight: 600 }}>{product.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>{product.brand}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>{qty} {product.unit}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(product.price)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(qty * product.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <aside>
        <div className="wa-preview">
          <div className="meta-h">
            <div className="av">{supplier.name.charAt(0)}</div>
            <div>
              <div style={{ fontWeight: 600, color: '#075e54' }}>{supplier.name}</div>
              <div style={{ fontSize: 11 }}>via WhatsApp · pré-visualização</div>
            </div>
          </div>
          <div className="bubble">{message}</div>
        </div>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-primary btn-lg" onClick={send} style={{ background: '#25d366', justifyContent: 'center' }}>
            <Ico.whatsapp /> Enviar pelo WhatsApp
          </button>
          <button className="btn btn-ghost" onClick={() => go('/cart')} style={{ justifyContent: 'center' }}>
            Voltar ao carrinho
          </button>
        </div>
      </aside>
    </div>
  );
}

// ── Sent confirmation ──────────────────────────────────────────────────────
const Sent = () => (
  <div className="container sent">
    <div className="check">✓</div>
    <h1>Pedido enviado!</h1>
    <p>Sua mensagem foi enviada ao fornecedor pelo WhatsApp. Em uma situação real, ele confirmaria a disponibilidade e o prazo de entrega.</p>
    <div className="actions">
      <button className="btn btn-primary btn-lg" onClick={() => go('/')}>
        Novo pedido <Ico.arrow />
      </button>
    </div>
  </div>
);

// ── Tweaks defaults block ──────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "direction": "mercado",
  "primary": "default",
  "fonts": "default",
  "cards": "standard",
  "header": "classic",
  "density": "regular",
  "icons": "on"
}/*EDITMODE-END*/;

// Direction-aware overrides for primary color and fonts.
const PRIMARY_OPTS = ['default', '#1f4d3a', '#b4321a', '#2b53e0', '#7a3fbf'];
const PRIMARY_LABELS = { 'default': 'auto', '#1f4d3a': 'verde', '#b4321a': 'tijolo', '#2b53e0': 'azul', '#7a3fbf': 'roxo' };
const FONT_PAIRS = {
  'default': null,
  'sans-modern': { sans: "'DM Sans', system-ui, sans-serif", display: "'DM Sans', system-ui, sans-serif" },
  'serif-warm':  { sans: "'DM Sans', system-ui, sans-serif", display: "'Fraunces', Georgia, serif" },
  'editorial':   { sans: "'Inter', system-ui, sans-serif",   display: "'Instrument Serif', Georgia, serif" },
  'bold':        { sans: "'Bricolage Grotesque', system-ui, sans-serif", display: "'Bricolage Grotesque', system-ui, sans-serif" },
};

// ── App root ───────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const route = useHashRoute();
  const cartApi = useCart();

  // Apply direction + tweak data attrs to <html>/<body>.
  useEffect(() => {
    document.documentElement.dataset.direction = t.direction;
    document.body.dataset.density = t.density;
    document.body.dataset.cards = t.cards;
    document.body.dataset.header = t.header;
    document.body.dataset.icons = t.icons;
  }, [t.direction, t.density, t.cards, t.header, t.icons]);

  // Primary color override
  useEffect(() => {
    if (t.primary === 'default') document.documentElement.style.removeProperty('--primary');
    else document.documentElement.style.setProperty('--primary', t.primary);
  }, [t.primary]);

  // Font override
  useEffect(() => {
    const fp = FONT_PAIRS[t.fonts];
    if (!fp) {
      document.documentElement.style.removeProperty('--font-sans');
      document.documentElement.style.removeProperty('--font-display');
    } else {
      document.documentElement.style.setProperty('--font-sans', fp.sans);
      document.documentElement.style.setProperty('--font-display', fp.display);
    }
  }, [t.fonts]);

  // Route resolution
  let screen;
  const parts = route.parts;
  if (parts[0] === 's' && parts[1]) {
    screen = <Supplier id={parts[1]} cart={cartApi.cart} add={cartApi.add} />;
  } else if (parts[0] === 'cart') {
    screen = <Cart cart={cartApi.cart} setQty={cartApi.setQty} remove={cartApi.remove}
                   clear={cartApi.clear} subtotal={cartApi.subtotal} />;
  } else if (parts[0] === 'review') {
    screen = <Review cart={cartApi.cart} subtotal={cartApi.subtotal} clear={cartApi.clear} />;
  } else if (parts[0] === 'sent') {
    screen = <Sent />;
  } else {
    screen = <Home />;
  }

  return (
    <div className="app-shell" data-screen-label={
      parts[0] === 's' ? 'Catálogo do fornecedor'
      : parts[0] === 'cart' ? 'Carrinho'
      : parts[0] === 'review' ? 'Revisar pedido'
      : parts[0] === 'sent' ? 'Confirmação'
      : 'Início — fornecedores'
    }>
      <Header cartCount={cartApi.count} />
      <main style={{ flex: 1 }}>
        {screen}
      </main>
      <Footer />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Direção visual">
          <TweakRadio label="Direção" value={t.direction}
            options={[
              { value: 'mercado',   label: 'Mercado' },
              { value: 'editorial', label: 'Editorial' },
              { value: 'arcade',    label: 'Arcade' },
            ]}
            onChange={(v) => setTweak('direction', v)} />
        </TweakSection>

        <TweakSection label="Aparência">
          <TweakColor label="Cor primária" value={t.primary}
            options={PRIMARY_OPTS}
            onChange={(v) => setTweak('primary', v)} />
          <TweakSelect label="Tipografia" value={t.fonts}
            options={[
              { value: 'default',     label: 'Padrão da direção' },
              { value: 'sans-modern', label: 'Sans moderno (DM Sans)' },
              { value: 'serif-warm',  label: 'Serif quente (Fraunces)' },
              { value: 'editorial',   label: 'Serif editorial (Instrument)' },
              { value: 'bold',        label: 'Sans chunky (Bricolage)' },
            ]}
            onChange={(v) => setTweak('fonts', v)} />
        </TweakSection>

        <TweakSection label="Layout">
          <TweakSelect label="Cards de produto" value={t.cards}
            options={[
              { value: 'cozy',     label: 'Aconchegante (3 col)' },
              { value: 'standard', label: 'Padrão (4 col)' },
              { value: 'dense',    label: 'Densa (5 col)' },
              { value: 'list',     label: 'Lista' },
            ]}
            onChange={(v) => setTweak('cards', v)} />
          <TweakRadio label="Cabeçalho" value={t.header}
            options={[
              { value: 'minimal', label: 'Minimal' },
              { value: 'classic', label: 'Padrão' },
              { value: 'bold',    label: 'Bold' },
            ]}
            onChange={(v) => setTweak('header', v)} />
          <TweakRadio label="Densidade" value={t.density}
            options={[
              { value: 'compact',  label: 'Compacta' },
              { value: 'regular',  label: 'Regular' },
              { value: 'spacious', label: 'Espaçosa' },
            ]}
            onChange={(v) => setTweak('density', v)} />
          <TweakToggle label="Iconografia" value={t.icons === 'on'}
            onChange={(v) => setTweak('icons', v ? 'on' : 'off')} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
