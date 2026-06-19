import React, { useEffect, useState } from 'react';
import { Check, Home, LockKeyhole, LogIn, LogOut, MapPin, Plus, Save, Trash2, UserRound, X } from 'lucide-react';
import { api, authSession } from './api';

const emptyAddress = { label: 'Casa', street: '', number: '', neighborhood: '', city: '', state: 'SP', postalCode: '', complement: '', referencePoint: '', isDefault: true };

export default function AccountModal({ onClose }) {
  const [mode, setMode] = useState(authSession.getToken() ? 'loading' : 'login');
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [address, setAddress] = useState(emptyAddress);
  const [addingAddress, setAddingAddress] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authSession.getToken()) return;
    Promise.all([api('/auth/me'), api('/users/me/addresses')])
      .then(([profile, list]) => { setUser(profile.user); setAddresses(list.addresses); setForm(current => ({ ...current, ...profile.user })); setMode('profile'); })
      .catch(() => setMode('login'));
  }, []);

  const patch = (key, value) => setForm(current => ({ ...current, [key]: value }));
  async function submitAuth(event) {
    event.preventDefault(); setError('');
    if (mode === 'register' && form.password !== form.confirmPassword) return setError('As senhas não conferem.');
    setBusy(true);
    try {
      const payload = await api(mode === 'register' ? '/auth/register' : '/auth/login', {
        method: 'POST', body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password })
      });
      authSession.setToken(payload.token); setUser(payload.user); setForm(current => ({ ...current, ...payload.user, password: '', confirmPassword: '' })); setAddresses([]); setMode('profile');
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function saveProfile(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { const payload = await api('/users/me', { method: 'PUT', body: JSON.stringify({ name: form.name, phone: form.phone }) }); setUser(payload.user); setSaved(true); setTimeout(() => setSaved(false), 1600); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function saveAddress(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await api('/users/me/addresses', { method: 'POST', body: JSON.stringify(address) }); const list = await api('/users/me/addresses'); setAddresses(list.addresses); setAddress(emptyAddress); setAddingAddress(false); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function removeAddress(id) {
    try { await api(`/users/me/addresses/${id}`, { method: 'DELETE' }); setAddresses(current => current.filter(item => item.id !== id)); }
    catch (e) { setError(e.message); }
  }
  function logout() { authSession.clear(); setUser(null); setAddresses([]); setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' }); setMode('login'); }

  return <div className="overlay account-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="account-modal"><header><div><UserRound /><span><small>MINHA CONTA</small><strong>{mode === 'profile' ? `Olá, ${user?.name?.split(' ')[0]}` : mode === 'register' ? 'Criar cadastro' : 'Entrar'}</strong></span></div><button onClick={onClose}><X /></button></header>
    {mode === 'loading' ? <div className="account-loading">Carregando seus dados...</div> : mode !== 'profile' ? <form className="auth-form" onSubmit={submitAuth}><div className="account-intro"><LockKeyhole /><h2>{mode === 'register' ? 'Crie sua conta' : 'Bem-vindo de volta'}</h2><p>{mode === 'register' ? 'Salve seus dados e peça mais rápido.' : 'Acesse seus endereços e pedidos.'}</p></div>{mode === 'register' && <label>Nome completo<input required minLength="3" value={form.name} onChange={e => patch('name', e.target.value)} /></label>}<label>E-mail<input required type="email" value={form.email} onChange={e => patch('email', e.target.value)} /></label>{mode === 'register' && <label>WhatsApp<input required type="tel" value={form.phone} onChange={e => patch('phone', e.target.value)} placeholder="(00) 00000-0000" /></label>}<label>Senha<input required minLength="8" type="password" value={form.password} onChange={e => patch('password', e.target.value)} placeholder="Mínimo de 8 caracteres" /></label>{mode === 'register' && <label>Confirmar senha<input required minLength="8" type="password" value={form.confirmPassword} onChange={e => patch('confirmPassword', e.target.value)} /></label>}{error && <p className="form-error">{error}</p>}<button className="primary-button" disabled={busy}>{busy ? 'Aguarde...' : mode === 'register' ? 'Criar minha conta' : <><LogIn /> Entrar</>}</button><button type="button" className="switch-auth" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Ainda não tenho cadastro' : 'Já tenho uma conta'}</button></form> : <div className="profile-content"><form className="profile-form" onSubmit={saveProfile}><h2>Dados pessoais</h2><label>Nome<input required value={form.name} onChange={e => patch('name', e.target.value)} /></label><label>E-mail<input disabled value={form.email} /></label><label>WhatsApp<input required value={form.phone} onChange={e => patch('phone', e.target.value)} /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button" disabled={busy}>{saved ? <Check /> : <Save />} {saved ? 'Dados salvos' : 'Salvar alterações'}</button></form><section className="address-section"><div><h2>Meus endereços</h2><button onClick={() => setAddingAddress(!addingAddress)}><Plus /> Novo</button></div>{addresses.map(item => <article key={item.id}><Home /><div><strong>{item.label} {item.is_default ? '• Principal' : ''}</strong><span>{item.street}, {item.number} — {item.neighborhood}<br />{item.city}/{item.state}</span></div><button onClick={() => removeAddress(item.id)}><Trash2 /></button></article>)}{!addresses.length && !addingAddress && <p className="no-address"><MapPin /> Nenhum endereço cadastrado.</p>}{addingAddress && <form className="address-form" onSubmit={saveAddress}><div><label>Identificação<input value={address.label} onChange={e => setAddress({ ...address, label: e.target.value })} /></label><label>CEP<input value={address.postalCode} onChange={e => setAddress({ ...address, postalCode: e.target.value })} /></label></div><label>Rua<input required value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} /></label><div><label>Número<input required value={address.number} onChange={e => setAddress({ ...address, number: e.target.value })} /></label><label>Bairro<input required value={address.neighborhood} onChange={e => setAddress({ ...address, neighborhood: e.target.value })} /></label></div><div><label>Cidade<input required value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} /></label><label>UF<input required maxLength="2" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value.toUpperCase() })} /></label></div><label>Complemento<input value={address.complement} onChange={e => setAddress({ ...address, complement: e.target.value })} /></label><label className="default-check"><input type="checkbox" checked={address.isDefault} onChange={e => setAddress({ ...address, isDefault: e.target.checked })} /> Endereço principal</label><button className="primary-button" disabled={busy}>Salvar endereço</button></form>}</section><button className="logout-button" onClick={logout}><LogOut /> Sair da conta</button></div>}
  </section></div>;
}
