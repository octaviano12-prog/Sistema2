import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, BarChart3, Check, ChevronRight, CircleDollarSign, Clock3,
  Edit3, Eye, EyeOff, LayoutDashboard, LockKeyhole, LogOut, Menu, Package,
  Plus, RotateCcw, Save, Settings, ShoppingBag, Store, Tag, Trash2, X
} from 'lucide-react';
import { useStore } from './store';
import BrandMark from './BrandMark';

const money = value => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const statusMap = {
  received: { label: 'Recebido', next: 'confirmed' },
  confirmed: { label: 'Confirmado', next: 'preparing' },
  preparing: { label: 'Em preparo', next: 'ready' },
  ready: { label: 'Pronto', next: 'delivering' },
  delivering: { label: 'Em entrega', next: 'completed' },
  completed: { label: 'Concluído', next: null },
  cancelled: { label: 'Cancelado', next: null }
};

export default function Admin({ onExit }) {
  const store = useStore();
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('devily.admin') === 'ok');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [tab, setTab] = useState('dashboard');
  const [sidebar, setSidebar] = useState(false);

  function login(event) {
    event.preventDefault();
    if (pin === store.settings.adminPin) {
      sessionStorage.setItem('devily.admin', 'ok');
      setAuthenticated(true);
      setError('');
    } else setError('PIN incorreto. Na demonstração, use 1234.');
  }

  if (!authenticated) return <div className="admin-login">
    <button className="back-store" onClick={onExit}><ArrowLeft /> Voltar ao cardápio</button>
    <form onSubmit={login}>
      <BrandMark size="large" /><span>PAINEL ADMINISTRATIVO</span><h1>{store.settings.name}</h1><p>Controle sua operação com clareza e agilidade.</p>
      <label>PIN de acesso<div><LockKeyhole /><input autoFocus value={pin} onChange={e => setPin(e.target.value)} type={showPin ? 'text' : 'password'} inputMode="numeric" placeholder="Digite o PIN" /><button type="button" onClick={() => setShowPin(!showPin)}>{showPin ? <EyeOff /> : <Eye />}</button></div></label>
      {error && <small className="login-error">{error}</small>}
      <button className="primary-button" type="submit">Entrar no painel <ChevronRight /></button>
      <small>Ambiente demonstrativo • PIN padrão: 1234</small>
    </form>
  </div>;

  const nav = [
    ['dashboard', 'Visão geral', LayoutDashboard], ['orders', 'Pedidos', ShoppingBag],
    ['products', 'Produtos', Package], ['categories', 'Categorias', Tag],
    ['settings', 'Configurações', Settings]
  ];

  return <div className="admin-shell">
    <aside className={sidebar ? 'admin-sidebar open' : 'admin-sidebar'}>
      <div className="sidebar-brand"><BrandMark size="small" light /><span><strong>{store.settings.shortName}</strong><small>Central de gestão</small></span><button onClick={() => setSidebar(false)}><X /></button></div>
      <nav>{nav.map(([id, label, Icon]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => { setTab(id); setSidebar(false); }}><Icon /> {label}{id === 'orders' && <i>{store.orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length}</i>}</button>)}</nav>
      <div className="sidebar-store"><span className={store.settings.open ? 'online' : ''}><i /> {store.settings.open ? 'Loja aberta' : 'Loja fechada'}</span><button onClick={onExit}><Store /> Ver cardápio</button><button onClick={() => { sessionStorage.removeItem('devily.admin'); setAuthenticated(false); }}><LogOut /> Sair</button></div>
    </aside>
    {sidebar && <button className="sidebar-backdrop" onClick={() => setSidebar(false)} />}
    <main className="admin-main">
      <header className="admin-topbar"><button className="mobile-menu" onClick={() => setSidebar(true)}><Menu /></button><div><span>Central de gestão</span><strong>{nav.find(item => item[0] === tab)?.[1]}</strong></div><button className={store.settings.open ? 'store-toggle open' : 'store-toggle'} onClick={() => store.updateSettings({ open: !store.settings.open })}><i />{store.settings.open ? 'Aberta' : 'Fechada'}</button></header>
      <div className="admin-content">
        {tab === 'dashboard' && <Dashboard store={store} setTab={setTab} />}
        {tab === 'orders' && <Orders store={store} />}
        {tab === 'products' && <Products store={store} />}
        {tab === 'categories' && <Categories store={store} />}
        {tab === 'settings' && <StoreSettings store={store} />}
      </div>
    </main>
  </div>;
}

function Dashboard({ store, setTab }) {
  const completed = store.orders.filter(order => order.status === 'completed');
  const validOrders = store.orders.filter(order => order.status !== 'cancelled');
  const revenue = validOrders.reduce((sum, order) => sum + order.total, 0);
  const openOrders = store.orders.filter(order => !['completed', 'cancelled'].includes(order.status));
  const avg = validOrders.length ? revenue / validOrders.length : 0;
  return <>
    <div className="admin-heading"><div><span>HOJE, SUA OPERAÇÃO</span><h1>Visão geral</h1><p>Acompanhe os principais números da demonstração.</p></div><button className="admin-primary" onClick={() => setTab('orders')}><ShoppingBag /> Ver pedidos</button></div>
    <section className="metric-grid">
      <Metric icon={CircleDollarSign} label="Faturamento" value={money(revenue)} change="Pedidos não cancelados" tone="blue" />
      <Metric icon={ShoppingBag} label="Pedidos" value={store.orders.length} change={`${openOrders.length} em andamento`} tone="orange" />
      <Metric icon={BarChart3} label="Ticket médio" value={money(avg)} change="Média por pedido" tone="purple" />
      <Metric icon={Check} label="Concluídos" value={completed.length} change="Pedidos finalizados" tone="green" />
    </section>
    <section className="dashboard-grid">
      <div className="admin-card recent-orders"><header><div><h2>Pedidos recentes</h2><p>Atualização em tempo real neste navegador</p></div><button onClick={() => setTab('orders')}>Ver todos <ChevronRight /></button></header>{store.orders.slice(0, 5).map(order => <OrderRow key={order.id} order={order} compact />)}</div>
      <div className="admin-card operation-card"><header><div><h2>Operação</h2><p>Status do cardápio</p></div></header><div className="operation-status"><span className={store.settings.open ? 'online' : ''}><Store /></span><div><strong>{store.settings.open ? 'Recebendo pedidos' : 'Cardápio pausado'}</strong><p>{store.settings.open ? `Entrega estimada: ${store.settings.deliveryTime}` : 'Abra a loja para receber pedidos'}</p></div></div><button onClick={() => store.updateSettings({ open: !store.settings.open })}>{store.settings.open ? 'Pausar loja' : 'Abrir loja'}</button><ul><li><span>Produtos ativos</span><strong>{store.products.filter(p => p.active).length}</strong></li><li><span>Categorias</span><strong>{store.categories.filter(c => c.active).length}</strong></li><li><span>Estoque baixo</span><strong>{store.products.filter(p => p.stock < 10).length}</strong></li></ul></div>
    </section>
  </>;
}

function Metric({ icon: Icon, label, value, change, tone }) {
  return <article className="metric-card"><div className={`metric-icon ${tone}`}><Icon /></div><span>{label}</span><strong>{value}</strong><small>{change}</small></article>;
}

function OrderRow({ order, compact = false }) {
  return <div className="admin-order-row"><div className="order-code"><strong>#{order.id}</strong><span>{new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></div><div className="order-client"><strong>{order.customer.name}</strong><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} item(ns) • {order.service === 'delivery' ? 'Entrega' : order.service === 'pickup' ? 'Retirada' : 'Mesa'}</span></div><strong className="order-value">{money(order.total)}</strong><span className={`status-badge ${order.status}`}>{statusMap[order.status]?.label}</span>{!compact && <ChevronRight />}</div>;
}

function Orders({ store }) {
  const [filter, setFilter] = useState('active');
  const [selected, setSelected] = useState(null);
  const filtered = store.orders.filter(order => filter === 'all' || (filter === 'active' ? !['completed', 'cancelled'].includes(order.status) : order.status === filter));
  return <>
    <div className="admin-heading"><div><span>GESTÃO DE PEDIDOS</span><h1>Pedidos</h1><p>Avance cada pedido conforme o preparo.</p></div></div>
    <div className="order-filters">{[['active','Em andamento'],['received','Recebidos'],['preparing','Em preparo'],['completed','Concluídos'],['all','Todos']].map(([id,label]) => <button className={filter === id ? 'active' : ''} key={id} onClick={() => setFilter(id)}>{label}</button>)}</div>
    <div className="admin-card orders-list">{filtered.length ? filtered.map(order => <button key={order.id} onClick={() => setSelected(order)}><OrderRow order={order} /></button>) : <AdminEmpty icon={ShoppingBag} title="Nenhum pedido nesta etapa" text="Os pedidos aparecerão aqui automaticamente." />}</div>
    {selected && <OrderDetail order={store.orders.find(item => item.id === selected.id)} store={store} onClose={() => setSelected(null)} />}
  </>;
}

function OrderDetail({ order, store, onClose }) {
  const status = statusMap[order.status];
  const nextStatus = order.status === 'ready' && order.service !== 'delivery' ? 'completed' : status?.next;
  return <div className="admin-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><aside className="order-detail"><header><div><span>Pedido</span><h2>#{order.id}</h2></div><button onClick={onClose}><X /></button></header><div className="detail-body"><span className={`status-badge ${order.status}`}>{status?.label}</span><section><h3>Cliente</h3><p><strong>{order.customer.name}</strong><br />{order.customer.phone}<br />{order.customer.address || (order.service === 'table' ? `Mesa ${order.customer.table || '-'}` : 'Retirada no balcão')}</p></section><section><h3>Itens</h3>{order.items.map((item, i) => <div className="detail-item" key={i}><span>{item.quantity}×</span><div><strong>{item.name}</strong>{item.notes && <small>Obs.: {item.notes}</small>}</div><b>{money(item.price * item.quantity)}</b></div>)}</section><section className="detail-values"><p><span>Subtotal</span><strong>{money(order.subtotal)}</strong></p><p><span>Entrega</span><strong>{money(order.fee)}</strong></p>{order.discount > 0 && <p><span>Desconto</span><strong>-{money(order.discount)}</strong></p>}<p><span>Total</span><strong>{money(order.total)}</strong></p></section><section><h3>Pagamento</h3><p>{order.payment}</p></section></div><footer>{!['completed','cancelled'].includes(order.status) && <button className="cancel-order" onClick={() => store.updateOrderStatus(order.id, 'cancelled')}>Cancelar</button>}{nextStatus && <button className="admin-primary" onClick={() => store.updateOrderStatus(order.id, nextStatus)}>{nextStatus === 'completed' ? 'Concluir pedido' : `Avançar para ${statusMap[nextStatus].label}`} <ChevronRight /></button>}</footer></aside></div>;
}

function Products({ store }) {
  const blank = { name: '', description: '', price: '', category: store.categories[0]?.id || '', image: '', tag: '', stock: 0, active: true };
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const items = store.products.filter(product => product.name.toLowerCase().includes(search.toLowerCase()));
  return <>
    <div className="admin-heading"><div><span>SEU CARDÁPIO</span><h1>Produtos</h1><p>Cadastre preços, imagens e disponibilidade.</p></div><button className="admin-primary" onClick={() => setEditing(blank)}><Plus /> Novo produto</button></div>
    <div className="admin-toolbar"><input placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} /><span>{items.length} produto(s)</span></div>
    <div className="admin-card product-table"><div className="table-head"><span>Produto</span><span>Categoria</span><span>Preço</span><span>Estoque</span><span>Status</span><span /></div>{items.map(product => <div className="product-row" key={product.id}><div><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{product.description}</small></span></div><span>{store.categories.find(c => c.id === product.category)?.name || 'Sem categoria'}</span><strong>{money(product.price)}</strong><span>{product.stock}</span><button className={product.active ? 'tiny-status active' : 'tiny-status'} onClick={() => store.saveProduct({ ...product, active: !product.active })}>{product.active ? 'Ativo' : 'Pausado'}</button><div><button onClick={() => setEditing(product)}><Edit3 /></button><button className="danger-icon" onClick={() => store.deleteProduct(product.id)}><Trash2 /></button></div></div>)}</div>
    {editing && <ProductEditor product={editing} categories={store.categories} onClose={() => setEditing(null)} onSave={product => { store.saveProduct(product); setEditing(null); }} />}
  </>;
}

function ProductEditor({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState(product);
  const patch = (key, value) => setForm(current => ({ ...current, [key]: value }));
  return <div className="admin-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><form className="editor-modal" onSubmit={e => { e.preventDefault(); onSave({ ...form, price: Number(form.price), stock: Number(form.stock) }); }}><header><div><span>PRODUTO</span><h2>{product.id ? 'Editar produto' : 'Novo produto'}</h2></div><button type="button" onClick={onClose}><X /></button></header><div className="editor-fields"><label>Nome<input required value={form.name} onChange={e => patch('name', e.target.value)} /></label><label>Descrição<textarea required value={form.description} onChange={e => patch('description', e.target.value)} /></label><div><label>Preço<input required type="number" step="0.01" min="0" value={form.price} onChange={e => patch('price', e.target.value)} /></label><label>Estoque<input type="number" min="0" value={form.stock} onChange={e => patch('stock', e.target.value)} /></label></div><label>Categoria<select value={form.category} onChange={e => patch('category', e.target.value)}>{categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select></label><label>URL da imagem<input required type="url" value={form.image} onChange={e => patch('image', e.target.value)} placeholder="https://..." /></label><label>Etiqueta<input value={form.tag} onChange={e => patch('tag', e.target.value)} placeholder="Ex.: Mais pedido" /></label><label className="switch-label"><input type="checkbox" checked={form.active} onChange={e => patch('active', e.target.checked)} /><i /><span>Produto disponível no cardápio</span></label></div><footer><button type="button" onClick={onClose}>Cancelar</button><button className="admin-primary" type="submit"><Save /> Salvar produto</button></footer></form></div>;
}

function Categories({ store }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', emoji: '🍽️', active: true });
  function edit(category) { setEditing(category.id); setForm(category); }
  function save(e) { e.preventDefault(); store.saveCategory({ ...form, id: editing || form.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-') }); setEditing(null); setForm({ name: '', emoji: '🍽️', active: true }); }
  return <>
    <div className="admin-heading"><div><span>ORGANIZAÇÃO</span><h1>Categorias</h1><p>Organize as seções exibidas no cardápio.</p></div></div>
    <div className="category-admin-grid"><form className="admin-card category-form" onSubmit={save}><h2>{editing ? 'Editar categoria' : 'Nova categoria'}</h2><div><label>Emoji<input value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} maxLength="4" /></label><label>Nome<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label></div><label className="switch-label"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /><i /><span>Categoria visível</span></label><button className="admin-primary" type="submit"><Save /> {editing ? 'Salvar alterações' : 'Adicionar categoria'}</button>{editing && <button type="button" className="text-button" onClick={() => { setEditing(null); setForm({ name: '', emoji: '🍽️', active: true }); }}>Cancelar edição</button>}</form><div className="admin-card category-list"><header><h2>Categorias cadastradas</h2><span>{store.categories.length}</span></header>{[...store.categories].sort((a,b) => a.order - b.order).map(category => <div key={category.id}><span>{category.emoji}</span><div><strong>{category.name}</strong><small>{store.products.filter(p => p.category === category.id).length} produtos</small></div><i className={category.active ? 'online' : ''}>{category.active ? 'Ativa' : 'Oculta'}</i><button onClick={() => edit(category)}><Edit3 /></button><button className="danger-icon" onClick={() => store.deleteCategory(category.id)}><Trash2 /></button></div>)}</div></div>
  </>;
}

function StoreSettings({ store }) {
  const [form, setForm] = useState(store.settings);
  const [saved, setSaved] = useState(false);
  const [coupon, setCoupon] = useState({ code: '', type: 'percent', value: 10, active: true });
  const patch = (key, value) => setForm(current => ({ ...current, [key]: value }));
  function save(e) { e.preventDefault(); store.updateSettings({ ...form, deliveryFee: Number(form.deliveryFee), minimumOrder: Number(form.minimumOrder) }); setSaved(true); setTimeout(() => setSaved(false), 1800); }
  return <>
    <div className="admin-heading"><div><span>PERSONALIZAÇÃO</span><h1>Configurações</h1><p>Altere a marca e as regras de atendimento.</p></div></div>
    <div className="settings-grid"><form className="admin-card settings-form" onSubmit={save}><header><h2>Dados da loja</h2><p>Essas informações aparecem no cardápio.</p></header><div className="form-grid"><label>Nome do sistema<input value={form.name} onChange={e => patch('name', e.target.value)} /></label><label>Nome curto<input value={form.shortName} onChange={e => patch('shortName', e.target.value)} /></label><label>Slogan<input value={form.slogan} onChange={e => patch('slogan', e.target.value)} /></label><label>Telefone<input value={form.phone} onChange={e => patch('phone', e.target.value)} /></label><label className="wide">Endereço<input value={form.address} onChange={e => patch('address', e.target.value)} /></label><label>Taxa de entrega<input type="number" step="0.01" value={form.deliveryFee} onChange={e => patch('deliveryFee', e.target.value)} /></label><label>Pedido mínimo<input type="number" step="0.01" value={form.minimumOrder} onChange={e => patch('minimumOrder', e.target.value)} /></label><label>Prazo de entrega<input value={form.deliveryTime} onChange={e => patch('deliveryTime', e.target.value)} /></label><label>Prazo de retirada<input value={form.pickupTime} onChange={e => patch('pickupTime', e.target.value)} /></label><label>Cor principal<input type="color" value={form.color} onChange={e => patch('color', e.target.value)} /></label><label>PIN administrativo<input type="text" inputMode="numeric" value={form.adminPin} onChange={e => patch('adminPin', e.target.value)} /></label></div><button className="admin-primary" type="submit">{saved ? <Check /> : <Save />} {saved ? 'Alterações salvas' : 'Salvar configurações'}</button></form>
      <div><form className="admin-card coupon-form" onSubmit={e => { e.preventDefault(); store.saveCoupon({ ...coupon, code: coupon.code.toUpperCase(), value: Number(coupon.value) }); setCoupon({ code: '', type: 'percent', value: 10, active: true }); }}><header><h2>Cupons</h2><p>Crie descontos para seus clientes.</p></header><label>Código<input required value={coupon.code} onChange={e => setCoupon({ ...coupon, code: e.target.value })} placeholder="PROMO10" /></label><div><label>Tipo<select value={coupon.type} onChange={e => setCoupon({ ...coupon, type: e.target.value })}><option value="percent">Percentual</option><option value="fixed">Valor fixo</option></select></label><label>Valor<input type="number" min="0" value={coupon.value} onChange={e => setCoupon({ ...coupon, value: e.target.value })} /></label></div><button className="admin-primary"><Plus /> Criar cupom</button>{store.coupons.map(item => <div className="coupon-row" key={item.code}><Tag /><span><strong>{item.code}</strong><small>{item.type === 'percent' ? `${item.value}%` : money(item.value)} de desconto</small></span><button type="button" onClick={() => store.deleteCoupon(item.code)}><Trash2 /></button></div>)}</form><div className="admin-card danger-zone"><h2>Restaurar demonstração</h2><p>Retorna produtos, pedidos e configurações aos dados iniciais.</p><button onClick={store.resetDemo}><RotateCcw /> Restaurar dados</button></div></div>
    </div>
  </>;
}

function AdminEmpty({ icon: Icon, title, text }) { return <div className="admin-empty"><Icon /><h3>{title}</h3><p>{text}</p></div>; }
