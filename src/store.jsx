import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initialState } from './data';

const STORAGE_KEY = 'devily.demo.v2';
const StoreContext = createContext(null);

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
  } catch {
    return initialState;
  }
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const actions = useMemo(() => ({
    updateSettings: patch => setState(current => ({ ...current, settings: { ...current.settings, ...patch } })),
    saveProduct: product => setState(current => ({
      ...current,
      products: current.products.some(item => item.id === product.id)
        ? current.products.map(item => item.id === product.id ? product : item)
        : [...current.products, { ...product, id: Date.now() }]
    })),
    deleteProduct: id => setState(current => ({ ...current, products: current.products.filter(item => item.id !== id) })),
    saveCategory: category => setState(current => ({
      ...current,
      categories: current.categories.some(item => item.id === category.id)
        ? current.categories.map(item => item.id === category.id ? category : item)
        : [...current.categories, { ...category, id: category.id || `cat-${Date.now()}`, order: current.categories.length }]
    })),
    deleteCategory: id => setState(current => ({ ...current, categories: current.categories.filter(item => item.id !== id) })),
    addOrder: order => setState(current => ({ ...current, orders: [order, ...current.orders] })),
    updateOrderStatus: (id, status) => setState(current => ({ ...current, orders: current.orders.map(order => order.id === id ? { ...order, status } : order) })),
    saveCoupon: coupon => setState(current => ({
      ...current,
      coupons: current.coupons.some(item => item.code === coupon.code)
        ? current.coupons.map(item => item.code === coupon.code ? coupon : item)
        : [...current.coupons, coupon]
    })),
    deleteCoupon: code => setState(current => ({ ...current, coupons: current.coupons.filter(item => item.code !== code) })),
    resetDemo: () => setState(initialState)
  }), []);

  return <StoreContext.Provider value={{ ...state, ...actions }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore deve ser usado dentro de StoreProvider');
  return value;
}
