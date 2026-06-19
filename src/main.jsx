import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft, Bike, Check, ChevronRight, Clock3, Info, MapPin,
  Menu, Minus, Plus, Search, ShoppingBag, Store, Table2, Trash2, X
} from 'lucide-react';
import './styles.css';
import { APP_CONFIG } from './config';

const categories = [
  { id: 'destaques', name: 'Destaques', emoji: '⭐' },
  { id: 'pizzas', name: 'Pizzas', emoji: '🍕' },
  { id: 'hamburgueres', name: 'Hambúrguer', emoji: '🍔' },
  { id: 'porcoes', name: 'Porções', emoji: '🍟' },
  { id: 'bebidas', name: 'Bebidas', emoji: '🥤' },
  { id: 'sobremesas', name: 'Sobremesas', emoji: '🍰' }
];

const products = [
  { id: 1, category: 'destaques', name: 'Combo Crocante', description: 'Burger artesanal, batata crocante e refrigerante gelado.', price: 36.9, tag: 'Mais pedido', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85' },
  { id: 2, category: 'destaques', name: 'Pizza da Casa', description: 'Mussarela, calabresa artesanal, cebola roxa e orégano.', price: 49.9, tag: 'Oferta', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85' },
  { id: 3, category: 'pizzas', name: 'Pizza Margherita', description: 'Molho de tomate, mussarela, tomate fresco e manjericão.', price: 44.9, image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85' },
  { id: 4, category: 'pizzas', name: 'Pizza Pepperoni', description: 'Mussarela especial e generosas fatias de pepperoni.', price: 52.9, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=85' },
  { id: 5, category: 'hamburgueres', name: 'X-Bacon Supremo', description: 'Pão brioche, carne 160g, cheddar, bacon e molho especial.', price: 28.9, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85' },
  { id: 6, category: 'hamburgueres', name: 'Chicken Crispy', description: 'Frango empanado, queijo, salada fresca e maionese verde.', price: 26.9, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=85' },
  { id: 7, category: 'porcoes', name: 'Batata com Cheddar', description: 'Batatas sequinhas com cheddar cremoso e bacon.', price: 24.0, image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=900&q=85' },
  { id: 8, category: 'bebidas', name: 'Refrigerante Lata', description: 'Coca-Cola, Guaraná ou Sprite — 350 ml.', price: 6.5, image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=900&q=85' },
  { id: 9, category: 'sobremesas', name: 'Brownie Cremoso', description: 'Brownie de chocolate com calda e sorvete de creme.', price: 18.9, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85' }
];

const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function App() {
  const [screen, setScreen] = useState('welcome');
  const [service, setService] = useState('delivery');
  const [activeCategory, setActiveCategory] = useState('destaques');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [success, setSuccess] = useState(false);

  const filtered = useMemo(() => products.filter(product => {
    const inCategory = activeCategory === 'destaques'
      ? product.category === 'destaques'
      : product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.description}`.toLowerCase().includes(search.toLowerCase());
    return inCategory && matchesSearch;
  }), [activeCategory, search]);

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = service === 'delivery' ? 5 : 0;
  const total = subtotal + deliveryFee;

  function chooseService(type) {
    setService(type);
    setScreen('menu');
  }

  function openProduct(product) {
    setSelected(product);
    setQuantity(1);
    setNotes('');
  }

  function addToCart() {
    setCart(current => {
      const existing = current.find(item => item.id === selected.id && item.notes === notes);
      if (existing) return current.map(item => item === existing ? { ...item, quantity: item.quantity + quantity } : item);
      return [...current, { ...selected, quantity, notes }];
    });
    setSelected(null);
    setCartOpen(true);
  }

  function changeItem(index, amount) {
    setCart(current => current
      .map((item, i) => i === index ? { ...item, quantity: item.quantity + amount } : item)
      .filter(item => item.quantity > 0));
  }

  function finishOrder(event) {
    event.preventDefault();
    setSuccess(true);
    setCart([]);
  }

  if (screen === 'welcome') {
    return <Welcome onChoose={chooseService} />;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="icon-button" onClick={() => setScreen('welcome')} aria-label="Voltar"><ArrowLeft /></button>
        <div>
          <span className="eyebrow">{APP_CONFIG.shortName}</span>
          <h1>Seções</h1>
        </div>
        <button className="icon-button" aria-label="Abrir menu"><Menu /></button>
      </header>

      <main className="menu-page">
        <section className="menu-intro">
          <div>
            <span className="status-dot"><i /> Aberto agora</span>
            <h2>O que você vai pedir hoje?</h2>
            <p>{service === 'delivery' ? 'Entrega de 20 a 50 min' : service === 'pickup' ? 'Retirada de 15 a 30 min' : 'Atendimento na mesa'}</p>
          </div>
          <div className="service-pill">{service === 'delivery' ? <Bike /> : service === 'pickup' ? <Store /> : <Table2 />}<span>{service === 'delivery' ? 'Delivery' : service === 'pickup' ? 'Retirada' : 'Mesa'}</span></div>
        </section>

        <label className="search-box">
          <Search size={20} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar no cardápio" />
          {search && <button onClick={() => setSearch('')} aria-label="Limpar busca"><X size={18} /></button>}
        </label>

        <section className="featured-strip" aria-label="Destaques">
          {products.slice(0, 3).map(product => (
            <button className="featured-card" key={product.id} onClick={() => openProduct(product)}>
              <img src={product.image} alt="" />
              <span>{product.tag || 'Destaque'}</span>
              <strong>{product.name}</strong>
              <b>{money(product.price)}</b>
            </button>
          ))}
        </section>

        <nav className="category-tabs" aria-label="Categorias">
          {categories.map(category => (
            <button key={category.id} className={activeCategory === category.id ? 'active' : ''} onClick={() => { setActiveCategory(category.id); setSearch(''); }}>
              <span>{category.emoji}</span>{category.name}
            </button>
          ))}
        </nav>

        <section className="products-section">
          <div className="section-title">
            <div><span>{categories.find(c => c.id === activeCategory)?.emoji}</span><h2>{categories.find(c => c.id === activeCategory)?.name}</h2></div>
            <button aria-label="Informações"><Info size={18} /></button>
          </div>
          <div className="product-grid">
            {filtered.map(product => (
              <button className="product-card" key={product.id} onClick={() => openProduct(product)}>
                <div className="product-copy">
                  {product.tag && <span className="product-tag">{product.tag}</span>}
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <strong>{money(product.price)}</strong>
                </div>
                <div className="product-image"><img src={product.image} alt={product.name} /><span><Plus size={18} /></span></div>
              </button>
            ))}
            {!filtered.length && <div className="empty-state"><Search /><h3>Nenhum item encontrado</h3><p>Tente buscar outro produto.</p></div>}
          </div>
        </section>
      </main>

      {count > 0 && <button className="floating-cart" onClick={() => setCartOpen(true)}><span><ShoppingBag /> <i>{count}</i></span><strong>Ver sacola</strong><b>{money(subtotal)}</b></button>}

      {selected && <ProductModal product={selected} quantity={quantity} setQuantity={setQuantity} notes={notes} setNotes={setNotes} onClose={() => setSelected(null)} onAdd={addToCart} />}
      {cartOpen && <CartDrawer cart={cart} subtotal={subtotal} fee={deliveryFee} total={total} service={service} onClose={() => { setCartOpen(false); setCheckout(false); }} onChange={changeItem} checkout={checkout} setCheckout={setCheckout} onFinish={finishOrder} />}
      {success && <SuccessModal onClose={() => { setSuccess(false); setCartOpen(false); setCheckout(false); }} />}
    </div>
  );
}

function Welcome({ onChoose }) {
  return (
    <div className="welcome-page">
      <header className="welcome-header"><button className="icon-button" aria-label="Abrir menu"><Menu /></button><span>Bem vindo!</span><div /></header>
      <main className="welcome-content">
        <div className="brand-logo"><span>D</span></div>
        <p className="brand-kicker">{APP_CONFIG.slogan}</p>
        <h1>{APP_CONFIG.name}</h1>
        <p className="welcome-copy">Escolha como deseja receber seu pedido</p>
        <div className="service-grid">
          <button onClick={() => onChoose('delivery')}><span><Bike /></span><strong>Delivery</strong><small>Receba em casa</small><ChevronRight /></button>
          <button onClick={() => onChoose('pickup')}><span><Store /></span><strong>Vou Buscar</strong><small>Retire no balcão</small><ChevronRight /></button>
          <button onClick={() => onChoose('table')}><span><Table2 /></span><strong>Mesa</strong><small>Consuma no local</small><ChevronRight /></button>
        </div>
        <div className="store-status"><span><i /> Aberto para pedidos</span><p><MapPin /> {APP_CONFIG.address}</p><div><p><Bike /> Entrega: <strong>20 a 50 min</strong></p><p><Store /> Retirada: <strong>15 a 30 min</strong></p></div><button><Clock3 /> Horários de funcionamento</button></div>
      </main>
      <footer>Cardápio digital • Pedido seguro</footer>
    </div>
  );
}

function ProductModal({ product, quantity, setQuantity, notes, setNotes, onClose, onAdd }) {
  return (
    <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <article className="product-modal">
        <button className="modal-close" onClick={onClose} aria-label="Fechar"><X /></button>
        <img className="modal-image" src={product.image} alt={product.name} />
        <div className="modal-body"><span className="product-tag">{product.tag || 'Feito na hora'}</span><h2>{product.name}</h2><p>{product.description}</p><strong className="modal-price">{money(product.price)}</strong><label>Alguma observação?<textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex.: sem cebola, molho separado..." maxLength="140" /><small>{notes.length}/140</small></label></div>
        <footer className="modal-actions"><div className="stepper"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus /></button><b>{quantity}</b><button onClick={() => setQuantity(quantity + 1)}><Plus /></button></div><button className="primary-button" onClick={onAdd}>Adicionar <strong>{money(product.price * quantity)}</strong></button></footer>
      </article>
    </div>
  );
}

function CartDrawer({ cart, subtotal, fee, total, service, onClose, onChange, checkout, setCheckout, onFinish }) {
  return (
    <div className="overlay cart-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <aside className="cart-drawer">
        <header><div><span className="eyebrow">Seu pedido</span><h2>{checkout ? 'Finalizar pedido' : 'Minha sacola'}</h2></div><button className="close-light" onClick={onClose}><X /></button></header>
        {!checkout ? <>
          <div className="cart-list">{cart.map((item, index) => <div className="cart-item" key={`${item.id}-${index}`}><img src={item.image} alt="" /><div><h3>{item.name}</h3>{item.notes && <p>Obs.: {item.notes}</p>}<strong>{money(item.price * item.quantity)}</strong></div><div className="mini-stepper"><button onClick={() => onChange(index, -1)}>{item.quantity === 1 ? <Trash2 /> : <Minus />}</button><b>{item.quantity}</b><button onClick={() => onChange(index, 1)}><Plus /></button></div></div>)}</div>
          <div className="cart-summary"><p><span>Subtotal</span><strong>{money(subtotal)}</strong></p><p><span>Taxa de entrega</span><strong>{fee ? money(fee) : 'Grátis'}</strong></p><p className="total-row"><span>Total</span><strong>{money(total)}</strong></p></div>
          <button className="primary-button cart-continue" disabled={!cart.length} onClick={() => setCheckout(true)}>Continuar <ChevronRight /></button>
        </> : <form className="checkout-form" onSubmit={onFinish}>
          <div className="checkout-service">{service === 'delivery' ? <Bike /> : service === 'pickup' ? <Store /> : <Table2 />}<div><span>Tipo do pedido</span><strong>{service === 'delivery' ? 'Entrega' : service === 'pickup' ? 'Retirada' : 'Mesa'}</strong></div></div>
          <label>Seu nome<input required placeholder="Nome completo" /></label><label>WhatsApp<input required type="tel" placeholder="(00) 00000-0000" /></label>{service === 'delivery' && <><label>Endereço<input required placeholder="Rua, número e bairro" /></label><label>Complemento<input placeholder="Apartamento, referência..." /></label></>}
          <fieldset><legend>Forma de pagamento</legend><label className="radio-row"><input type="radio" name="payment" value="pix" defaultChecked /><span>Pix</span><Check /></label><label className="radio-row"><input type="radio" name="payment" value="card" /><span>Cartão na entrega</span><Check /></label><label className="radio-row"><input type="radio" name="payment" value="cash" /><span>Dinheiro</span><Check /></label></fieldset>
          <div className="checkout-total"><span>Total do pedido</span><strong>{money(total)}</strong></div><button className="primary-button" type="submit">Confirmar pedido</button><button className="text-button" type="button" onClick={() => setCheckout(false)}>Voltar para a sacola</button>
        </form>}
      </aside>
    </div>
  );
}

function SuccessModal({ onClose }) {
  return <div className="overlay success-overlay"><div className="success-card"><div><Check /></div><span>Pedido confirmado</span><h2>Já estamos preparando!</h2><p>Você receberá as atualizações do pedido pelo WhatsApp.</p><button className="primary-button" onClick={onClose}>Voltar ao cardápio</button></div></div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
