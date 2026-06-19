import { APP_CONFIG } from './config';

export const initialCategories = [
  { id: 'destaques', name: 'Destaques', emoji: '⭐', active: true, order: 0 },
  { id: 'pizzas', name: 'Pizzas', emoji: '🍕', active: true, order: 1 },
  { id: 'hamburgueres', name: 'Hambúrguer', emoji: '🍔', active: true, order: 2 },
  { id: 'porcoes', name: 'Porções', emoji: '🍟', active: true, order: 3 },
  { id: 'bebidas', name: 'Bebidas', emoji: '🥤', active: true, order: 4 },
  { id: 'sobremesas', name: 'Sobremesas', emoji: '🍰', active: true, order: 5 }
];

export const initialProducts = [
  { id: 1, category: 'destaques', name: 'Combo Devily', description: 'Burger artesanal, batata crocante e refrigerante gelado.', price: 36.9, tag: 'Mais pedido', active: true, stock: 30, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85' },
  { id: 2, category: 'destaques', name: 'Pizza da Casa', description: 'Mussarela, calabresa artesanal, cebola roxa e orégano.', price: 49.9, tag: 'Oferta', active: true, stock: 25, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85' },
  { id: 3, category: 'pizzas', name: 'Pizza Margherita', description: 'Molho de tomate, mussarela, tomate fresco e manjericão.', price: 44.9, tag: '', active: true, stock: 20, image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85' },
  { id: 4, category: 'pizzas', name: 'Pizza Pepperoni', description: 'Mussarela especial e generosas fatias de pepperoni.', price: 52.9, tag: '', active: true, stock: 18, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=85' },
  { id: 5, category: 'hamburgueres', name: 'X-Bacon Supremo', description: 'Pão brioche, carne 160g, cheddar, bacon e molho especial.', price: 28.9, tag: '', active: true, stock: 35, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85' },
  { id: 6, category: 'hamburgueres', name: 'Chicken Crispy', description: 'Frango empanado, queijo, salada fresca e maionese verde.', price: 26.9, tag: '', active: true, stock: 22, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=85' },
  { id: 7, category: 'porcoes', name: 'Batata com Cheddar', description: 'Batatas sequinhas com cheddar cremoso e bacon.', price: 24, tag: '', active: true, stock: 40, image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=900&q=85' },
  { id: 8, category: 'bebidas', name: 'Refrigerante Lata', description: 'Coca-Cola, Guaraná ou Sprite — 350 ml.', price: 6.5, tag: '', active: true, stock: 80, image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=900&q=85' },
  { id: 9, category: 'sobremesas', name: 'Brownie Cremoso', description: 'Brownie de chocolate com calda e sorvete de creme.', price: 18.9, tag: '', active: true, stock: 16, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85' }
];

export const initialState = {
  settings: {
    ...APP_CONFIG, phone: '(18) 99999-9999',
    open: true, deliveryFee: 5, minimumOrder: 15, deliveryTime: '20 a 50 min',
    pickupTime: '15 a 30 min', color: '#1793db', adminPin: '1234'
  },
  categories: initialCategories,
  products: initialProducts,
  coupons: [{ code: 'BEMVINDO10', type: 'percent', value: 10, active: true }],
  orders: [
    { id: 'DV1001', createdAt: new Date(Date.now() - 32 * 60000).toISOString(), customer: { name: 'Cliente demonstração', phone: '(18) 99999-0000', address: 'Rua das Flores, 120' }, service: 'delivery', payment: 'Pix', items: [{ ...initialProducts[0], quantity: 1, notes: '' }], subtotal: 36.9, fee: 5, discount: 0, total: 41.9, status: 'preparing' }
  ]
};
