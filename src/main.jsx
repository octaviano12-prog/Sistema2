import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft, BadgeCheck, Bike, Check, ChevronRight, Clock3, Info, LockKeyhole, MapPin,
  Menu, Minus, PackageCheck, Plus, Search, ShieldCheck, ShoppingBag, Sparkles, Store, Table2, Trash2, UserRound, WalletCards, X
} from 'lucide-react';
import './styles.css';
import './premium.css';
import { StoreProvider, useStore } from './store';
import Admin from './Admin';
import AccountModal from './AccountModal';
import BrandMark from './BrandMark';

const money = value => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const statusSteps = [
  ['received', 'Pedido recebido'], ['confirmed', 'Pedido confirmado'], ['preparing', 'Em preparo'],
  ['ready', 'Pronto'], ['delivering', 'Saiu para entrega'], ['completed', 'Concluído']
];

function Root() {
  const store = useStore();
  const [route, setRoute] = useState(() => window.location.hash || '#loja');
  useEffect(() => {
    const handler = () => setRoute(window.location.hash || '#loja');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  useEffect(() => { document.documentElement.style.setProperty('--blue', store.settings.color); }, [store.settings.color]);
  if (route === '#admin') return <Admin onExit={() => { window.location.hash = '#loja'; }} />;
  return <CustomerApp onAdmin={() => { window.location.hash = '#admin'; }} />;
}

function CustomerApp({ onAdmin }) {
  const store = useStore();
  const { settings } = store;
  const categories = store.categories.filter(c => c.active).sort((a, b) => a.order - b.order);
  const products = store.products.filter(p => p.active && p.stock > 0);
  const [screen, setScreen] = useState('welcome');
  const [service, setService] = useState('delivery');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || 'destaques');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);

  const filtered = useMemo(() => products.filter(product => {
    const inCategory = search || product.category === activeCategory;
    return inCategory && `${product.name} ${product.description}`.toLowerCase().includes(search.toLowerCase());
  }), [activeCategory, search, products]);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const fee = service === 'delivery' ? settings.deliveryFee : 0;
  const rawDiscount = coupon ? coupon.type === 'percent' ? subtotal * coupon.value / 100 : coupon.value : 0;
  const discount = Math.min(subtotal, rawDiscount);
  const total = Math.max(0, subtotal + fee - discount);

  function chooseService(type) { setService(type); setScreen('menu'); }
  function openProduct(product) { setSelected(product); setQuantity(1); setNotes(''); }
  function addToCart() {
    setCart(current => {
      const index = current.findIndex(item => item.id === selected.id && item.notes === notes);
      if (index >= 0) return current.map((item, i) => i === index ? { ...item, quantity: item.quantity + quantity } : item);
      return [...current, { ...selected, quantity, notes }];
    });
    setSelected(null); setCartOpen(true);
  }
  function changeItem(index, amount) {
    setCart(current => current.map((item, i) => i === index ? { ...item, quantity: item.quantity + amount } : item).filter(item => item.quantity > 0));
  }
  function applyCoupon() {
    const found = store.coupons.find(item => item.active && item.code === couponCode.trim().toUpperCase());
    if (found) { setCoupon(found); setCouponError(''); } else { setCoupon(null); setCouponError('Cupom inválido'); }
  }
  function finishOrder(customer, payment) {
    const order = {
      id: `DV${String(Date.now()).slice(-6)}`, createdAt: new Date().toISOString(), customer,
      service, payment, items: cart, subtotal, fee, discount, total, status: 'received'
    };
    store.addOrder(order); setLastOrder(order); setCart([]); setCoupon(null); setCouponCode('');
  }

  if (screen === 'welcome') return <><Welcome settings={settings} onChoose={chooseService} onAdmin={onAdmin} onTrack={() => setTracking('lookup')} onAccount={() => setAccountOpen(true)} />{accountOpen && <AccountModal onClose={() => setAccountOpen(false)} />}{tracking && <OrderTracker initialId="" orders={store.orders} onClose={() => setTracking(null)} />}</>;

  return <div className="app-shell">
    <header className="topbar"><button className="icon-button" onClick={() => setScreen('welcome')} aria-label="Voltar"><ArrowLeft /></button><div><span className="eyebrow">{settings.shortName}</span><h1>Cardápio</h1></div><button className="icon-button" onClick={() => setAccountOpen(true)} aria-label="Minha conta"><UserRound /></button></header>
    <main className="menu-page">
      <section className="menu-intro"><div className="intro-orb" /><div><span className={settings.open ? 'status-dot' : 'status-dot closed'}><i /> {settings.open ? 'Aberto agora' : 'Fechado no momento'}</span><h2>O que você vai pedir hoje?</h2><p>{service === 'delivery' ? `Entrega de ${settings.deliveryTime}` : service === 'pickup' ? `Retirada de ${settings.pickupTime}` : 'Atendimento na mesa'}</p></div><div className="service-pill">{service === 'delivery' ? <Bike /> : service === 'pickup' ? <Store /> : <Table2 />}<span>{service === 'delivery' ? 'Delivery' : service === 'pickup' ? 'Retirada' : 'Mesa'}</span></div></section>
      {!settings.open && <div className="closed-notice"><Clock3 /><div><strong>Loja fechada para novos pedidos</strong><span>Você ainda pode consultar nosso cardápio.</span></div></div>}
      <label className="search-box"><Search size={20} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar no cardápio" />{search && <button onClick={() => setSearch('')} aria-label="Limpar busca"><X size={18} /></button>}</label>
      <section className="featured-strip" aria-label="Destaques">{products.slice(0, 3).map(product => <button className="featured-card" key={product.id} onClick={() => openProduct(product)}><img src={product.image} alt="" /><span>{product.tag || 'Destaque'}</span><strong>{product.name}</strong><b>{money(product.price)}</b></button>)}</section>
      <nav className="category-tabs" aria-label="Categorias">{categories.map(category => <button key={category.id} className={activeCategory === category.id && !search ? 'active' : ''} onClick={() => { setActiveCategory(category.id); setSearch(''); }}><span>{category.emoji}</span>{category.name}</button>)}</nav>
      <section className="products-section"><div className="section-title"><div><span>{search ? '🔎' : categories.find(c => c.id === activeCategory)?.emoji}</span><h2>{search ? `Resultados para “${search}”` : categories.find(c => c.id === activeCategory)?.name}</h2></div><button aria-label="Informações"><Info size={18} /></button></div><div className="product-grid">{filtered.map(product => <button className="product-card" key={product.id} onClick={() => openProduct(product)}><div className="product-copy">{product.tag && <span className="product-tag">{product.tag}</span>}<h3>{product.name}</h3><p>{product.description}</p><strong>{money(product.price)}</strong></div><div className="product-image"><img src={product.image} alt={product.name} /><span><Plus size={18} /></span></div></button>)}{!filtered.length && <div className="empty-state"><Search /><h3>Nenhum item encontrado</h3><p>Tente buscar outro produto.</p></div>}</div></section>
    </main>
    {count > 0 && <button className="floating-cart" onClick={() => setCartOpen(true)}><span><ShoppingBag /><i>{count}</i></span><strong>Ver sacola</strong><b>{money(subtotal)}</b></button>}
    {selected && <ProductModal product={selected} quantity={quantity} setQuantity={setQuantity} notes={notes} setNotes={setNotes} onClose={() => setSelected(null)} onAdd={addToCart} disabled={!settings.open} />}
    {cartOpen && <CartDrawer cart={cart} subtotal={subtotal} fee={fee} discount={discount} total={total} minimum={settings.minimumOrder} service={service} onClose={() => { setCartOpen(false); setCheckout(false); }} onChange={changeItem} checkout={checkout} setCheckout={setCheckout} onFinish={finishOrder} couponCode={couponCode} setCouponCode={setCouponCode} applyCoupon={applyCoupon} coupon={coupon} couponError={couponError} disabled={!settings.open} />}
    {lastOrder && <OrderSuccess order={lastOrder} onTrack={() => { setTracking(lastOrder.id); setLastOrder(null); }} onClose={() => { setLastOrder(null); setCartOpen(false); setCheckout(false); }} />}
    {tracking && <OrderTracker initialId={tracking === 'lookup' ? '' : tracking} orders={store.orders} onClose={() => setTracking(null)} />}
    {accountOpen && <AccountModal onClose={() => setAccountOpen(false)} />}
  </div>;
}

function Welcome({ settings, onChoose, onAdmin, onTrack, onAccount }) {
  return <div className="welcome-page"><div className="welcome-ambient ambient-one" /><div className="welcome-ambient ambient-two" /><header className="welcome-header"><button className="icon-button" onClick={onAdmin} aria-label="Abrir administração"><Menu /></button><span><BrandMark size="tiny" light /> {settings.shortName}</span><button className="icon-button" onClick={onAccount} aria-label="Minha conta"><UserRound /></button></header><main className="welcome-content"><div className="welcome-badge"><Sparkles /> Cardápio digital inteligente</div><BrandMark size="large" /><p className="brand-kicker">{settings.slogan}</p><h1>{settings.name}</h1><p className="welcome-copy">Seu pedido favorito, do seu jeito.<br />Escolha como deseja ser atendido.</p><div className="service-grid"><button disabled={!settings.open} onClick={() => onChoose('delivery')}><span><Bike /></span><strong>Delivery</strong><small>Receba onde estiver</small><ChevronRight /></button><button disabled={!settings.open} onClick={() => onChoose('pickup')}><span><Store /></span><strong>Vou buscar</strong><small>Retirada sem espera</small><ChevronRight /></button><button disabled={!settings.open} onClick={() => onChoose('table')}><span><Table2 /></span><strong>Estou na mesa</strong><small>Peça direto pelo celular</small><ChevronRight /></button></div><div className="trust-strip"><span><ShieldCheck /> Compra segura</span><span><WalletCards /> Pague como quiser</span><span><BadgeCheck /> Qualidade garantida</span></div><div className="store-status"><span className={settings.open ? '' : 'closed'}><i /> {settings.open ? 'Aberto para pedidos' : 'Fechado no momento'}</span><p><MapPin /> {settings.address}</p><div><p><Bike /> Entrega: <strong>{settings.deliveryTime}</strong></p><p><Store /> Retirada: <strong>{settings.pickupTime}</strong></p></div><button><Clock3 /> Ver horários de funcionamento</button></div><div className="welcome-links"><button onClick={onAccount}><UserRound /> Minha conta</button><button onClick={onTrack}><PackageCheck /> Acompanhar pedido</button><button onClick={onAdmin}><LockKeyhole /> Gestão</button></div></main><footer>Uma experiência <strong>Devily</strong> • Rápida, simples e segura</footer></div>;
}

function ProductModal({ product, quantity, setQuantity, notes, setNotes, onClose, onAdd, disabled }) {
  return <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}><article className="product-modal"><button className="modal-close" onClick={onClose} aria-label="Fechar"><X /></button><img className="modal-image" src={product.image} alt={product.name} /><div className="modal-body"><span className="product-tag">{product.tag || 'Feito na hora'}</span><h2>{product.name}</h2><p>{product.description}</p><strong className="modal-price">{money(product.price)}</strong><label>Alguma observação?<textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex.: sem cebola, molho separado..." maxLength="140" /><small>{notes.length}/140</small></label></div><footer className="modal-actions"><div className="stepper"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus /></button><b>{quantity}</b><button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><Plus /></button></div><button className="primary-button" disabled={disabled} onClick={onAdd}>{disabled ? 'Loja fechada' : 'Adicionar'} <strong>{money(product.price * quantity)}</strong></button></footer></article></div>;
}

function CartDrawer({ cart, subtotal, fee, discount, total, minimum, service, onClose, onChange, checkout, setCheckout, onFinish, couponCode, setCouponCode, applyCoupon, coupon, couponError, disabled }) {
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', complement: '', table: '' });
  const [payment, setPayment] = useState('Pix');
  const underMinimum = subtotal < minimum;
  const patch = (key, value) => setCustomer(current => ({ ...current, [key]: value }));
  function submit(event) { event.preventDefault(); onFinish(customer, payment); }
  return <div className="overlay cart-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}><aside className="cart-drawer"><header><div><span className="eyebrow">Seu pedido</span><h2>{checkout ? 'Finalizar pedido' : 'Minha sacola'}</h2></div><button className="close-light" onClick={onClose}><X /></button></header>{!checkout ? <><div className="cart-list">{cart.map((item, index) => <div className="cart-item" key={`${item.id}-${index}`}><img src={item.image} alt="" /><div><h3>{item.name}</h3>{item.notes && <p>Obs.: {item.notes}</p>}<strong>{money(item.price * item.quantity)}</strong></div><div className="mini-stepper"><button onClick={() => onChange(index, -1)}>{item.quantity === 1 ? <Trash2 /> : <Minus />}</button><b>{item.quantity}</b><button onClick={() => onChange(index, 1)}><Plus /></button></div></div>)}</div><div className="coupon-box"><input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Cupom de desconto" /><button onClick={applyCoupon}>Aplicar</button>{coupon && <small className="coupon-ok"><Check /> Cupom {coupon.code} aplicado</small>}{couponError && <small className="coupon-error">{couponError}</small>}</div><div className="cart-summary"><p><span>Subtotal</span><strong>{money(subtotal)}</strong></p><p><span>Taxa de entrega</span><strong>{fee ? money(fee) : 'Grátis'}</strong></p>{discount > 0 && <p><span>Desconto</span><strong>-{money(discount)}</strong></p>}<p className="total-row"><span>Total</span><strong>{money(total)}</strong></p></div>{underMinimum && <p className="minimum-warning">Pedido mínimo: {money(minimum)}. Adicione mais {money(minimum - subtotal)}.</p>}<button className="primary-button cart-continue" disabled={!cart.length || underMinimum || disabled} onClick={() => setCheckout(true)}>Continuar <ChevronRight /></button></> : <form className="checkout-form" onSubmit={submit}><div className="checkout-service">{service === 'delivery' ? <Bike /> : service === 'pickup' ? <Store /> : <Table2 />}<div><span>Tipo do pedido</span><strong>{service === 'delivery' ? 'Entrega' : service === 'pickup' ? 'Retirada' : 'Mesa'}</strong></div></div><label>Seu nome<input required value={customer.name} onChange={e => patch('name', e.target.value)} placeholder="Nome completo" /></label><label>WhatsApp<input required value={customer.phone} onChange={e => patch('phone', e.target.value)} type="tel" placeholder="(00) 00000-0000" /></label>{service === 'delivery' && <><label>Endereço<input required value={customer.address} onChange={e => patch('address', e.target.value)} placeholder="Rua, número e bairro" /></label><label>Complemento<input value={customer.complement} onChange={e => patch('complement', e.target.value)} placeholder="Apartamento, referência..." /></label></>}{service === 'table' && <label>Número da mesa<input required value={customer.table} onChange={e => patch('table', e.target.value)} inputMode="numeric" placeholder="Ex.: 12" /></label>}<fieldset><legend>Forma de pagamento</legend>{['Pix','Cartão na entrega','Dinheiro'].map(item => <label className="radio-row" key={item}><input type="radio" name="payment" checked={payment === item} onChange={() => setPayment(item)} /><span>{item}</span><Check /></label>)}</fieldset><div className="checkout-total"><span>Total do pedido</span><strong>{money(total)}</strong></div><button className="primary-button" type="submit">Confirmar pedido</button><button className="text-button" type="button" onClick={() => setCheckout(false)}>Voltar para a sacola</button></form>}</aside></div>;
}

function OrderSuccess({ order, onTrack, onClose }) {
  return <div className="overlay success-overlay"><div className="success-card"><div><Check /></div><span>Pedido confirmado</span><h2>Já estamos preparando!</h2><p>Seu código é <strong>#{order.id}</strong>. Acompanhe cada etapa pelo sistema.</p><button className="primary-button" onClick={onTrack}><PackageCheck /> Acompanhar pedido</button><button className="text-button" onClick={onClose}>Voltar ao cardápio</button></div></div>;
}

function OrderTracker({ initialId, orders, onClose }) {
  const [code, setCode] = useState(initialId);
  const [searched, setSearched] = useState(Boolean(initialId));
  const order = orders.find(item => item.id.toLowerCase() === code.replace('#', '').trim().toLowerCase());
  const currentIndex = order ? statusSteps.findIndex(step => step[0] === order.status) : -1;
  return <div className="overlay success-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="tracker-card"><button className="modal-close" onClick={onClose}><X /></button><PackageCheck className="tracker-icon" /><span>ACOMPANHE SEU PEDIDO</span><h2>Status do pedido</h2><div className="tracker-search"><input value={code} onChange={e => { setCode(e.target.value); setSearched(false); }} placeholder="Digite o código: DV123456" /><button onClick={() => setSearched(true)}>Buscar</button></div>{order && searched ? <><div className="tracker-order"><strong>#{order.id}</strong><span>{money(order.total)} • {new Date(order.createdAt).toLocaleString('pt-BR')}</span></div><div className="status-timeline">{statusSteps.map(([id, label], index) => <div key={id} className={index <= currentIndex ? 'done' : ''}><i>{index < currentIndex ? <Check /> : index + 1}</i><span><strong>{label}</strong>{index === currentIndex && <small>Etapa atual</small>}</span></div>)}</div></> : searched && <div className="tracker-empty"><Search /><strong>Pedido não encontrado</strong><span>Confira o código e tente novamente.</span></div>}</div></div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><StoreProvider><Root /></StoreProvider></React.StrictMode>);
