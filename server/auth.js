import jwt from 'jsonwebtoken';

export function createToken(user) {
  return jwt.sign(
    { sub: String(user.id), role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d', issuer: 'devily-api' }
  );
}

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Autenticação necessária.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'devily-api' });
    req.auth = { userId: Number(payload.sub), role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => roles.includes(req.auth?.role)
    ? next()
    : res.status(403).json({ error: 'Acesso não autorizado.' });
}
