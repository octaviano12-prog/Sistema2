import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { checkDatabase, pool } from './db.js';
import { createToken, requireAuth, requireRole } from './auth.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET deve possuir pelo menos 32 caracteres.');
  process.exit(1);
}

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.APP_ORIGIN?.split(',').map(item => item.trim()) || false, credentials: false }));
app.use(express.json({ limit: '100kb' }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
const cleanEmail = value => String(value || '').trim().toLowerCase();
const cleanPhone = value => String(value || '').replace(/[^0-9+]/g, '').slice(0, 20);
const publicUser = row => ({ id: row.id, name: row.name, email: row.email, phone: row.phone, role: row.role, createdAt: row.created_at });

app.get('/api/health', async (_req, res) => {
  try { await checkDatabase(); res.json({ status: 'ok', database: 'connected' }); }
  catch { res.status(503).json({ status: 'error', database: 'unavailable' }); }
});

app.post('/api/auth/register', authLimiter, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim().slice(0, 120);
    const email = cleanEmail(req.body.email);
    const phone = cleanPhone(req.body.phone);
    const password = String(req.body.password || '');
    if (name.length < 3) return res.status(400).json({ error: 'Informe seu nome completo.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'E-mail inválido.' });
    if (phone.length < 10) return res.status(400).json({ error: 'Telefone inválido.' });
    if (password.length < 8) return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres.' });
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length) return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute('INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)', [name, email, phone, passwordHash]);
    const user = { id: result.insertId, name, email, phone, role: 'customer' };
    res.status(201).json({ user, token: createToken(user) });
  } catch (error) { next(error); }
});

app.post('/api/auth/login', authLimiter, async (req, res, next) => {
  try {
    const email = cleanEmail(req.body.email);
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? AND active = 1 LIMIT 1', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.password_hash))) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    res.json({ user: publicUser(user), token: createToken(user) });
  } catch (error) { next(error); }
});

app.get('/api/auth/me', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ? AND active = 1', [req.auth.userId]);
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json({ user: publicUser(rows[0]) });
  } catch (error) { next(error); }
});

app.put('/api/users/me', requireAuth, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim().slice(0, 120);
    const phone = cleanPhone(req.body.phone);
    if (name.length < 3 || phone.length < 10) return res.status(400).json({ error: 'Nome ou telefone inválido.' });
    await pool.execute('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone, req.auth.userId]);
    const [rows] = await pool.execute('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [req.auth.userId]);
    res.json({ user: publicUser(rows[0]) });
  } catch (error) { next(error); }
});

app.get('/api/users/me/addresses', requireAuth, async (req, res, next) => {
  try {
    const [addresses] = await pool.execute('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [req.auth.userId]);
    res.json({ addresses });
  } catch (error) { next(error); }
});

app.post('/api/users/me/addresses', requireAuth, async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const address = {
      label: String(req.body.label || 'Casa').trim().slice(0, 50), street: String(req.body.street || '').trim().slice(0, 160),
      number: String(req.body.number || '').trim().slice(0, 20), neighborhood: String(req.body.neighborhood || '').trim().slice(0, 100),
      city: String(req.body.city || '').trim().slice(0, 100), state: String(req.body.state || '').trim().toUpperCase().slice(0, 2),
      postalCode: String(req.body.postalCode || '').replace(/\D/g, '').slice(0, 8), complement: String(req.body.complement || '').trim().slice(0, 120),
      referencePoint: String(req.body.referencePoint || '').trim().slice(0, 160), isDefault: Boolean(req.body.isDefault)
    };
    if (!address.street || !address.number || !address.neighborhood || !address.city || address.state.length !== 2) return res.status(400).json({ error: 'Preencha o endereço completo.' });
    await connection.beginTransaction();
    if (address.isDefault) await connection.execute('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [req.auth.userId]);
    const [result] = await connection.execute('INSERT INTO user_addresses (user_id, label, street, number, neighborhood, city, state, postal_code, complement, reference_point, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [req.auth.userId, address.label, address.street, address.number, address.neighborhood, address.city, address.state, address.postalCode || null, address.complement || null, address.referencePoint || null, address.isDefault ? 1 : 0]);
    await connection.commit();
    res.status(201).json({ id: result.insertId });
  } catch (error) { await connection.rollback(); next(error); }
  finally { connection.release(); }
});

app.delete('/api/users/me/addresses/:id', requireAuth, async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [Number(req.params.id), req.auth.userId]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Endereço não encontrado.' });
    res.status(204).end();
  } catch (error) { next(error); }
});

app.get('/api/admin/users', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1); const limit = 50; const offset = (page - 1) * limit;
    const [users] = await pool.query('SELECT id, name, email, phone, role, active, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset]);
    res.json({ users: users.map(publicUser), page });
  } catch (error) { next(error); }
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(root, 'dist')));
  app.use((_req, res) => res.sendFile(path.join(root, 'dist', 'index.html')));
}
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error?.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Registro já existente.' });
  res.status(500).json({ error: 'Erro interno. Tente novamente.' });
});

app.listen(port, () => console.log(`API Devily disponível na porta ${port}`));
