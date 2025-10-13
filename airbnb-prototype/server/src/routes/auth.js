import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const prisma = new PrismaClient();
const router = express.Router();

router.post(
  '/signup',
  [
    body('role').isIn(['TRAVELER','OWNER']),
    body('name').isString().isLength({ min: 1 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid input', details: errors.array() });

      const { role, name, email, password, location } = req.body;

      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return res.status(409).json({ error: 'Email already registered' });

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          role, name, email, passwordHash,
          city: location?.city || null,
          state: location?.state || null,
          country: location?.country || null
        },
        select: { id: true, role: true, name: true, email: true }
      });

      req.session.user = user;
      res.json(user);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Signup failed' });
    }
  }
);

router.post(
  '/login',
  [ body('email').isEmail(), body('password').isLength({ min: 1 }) ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid input' });

      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const sessUser = { id: user.id, role: user.role, name: user.name, email: user.email };
      req.session.user = sessUser;
      res.json(sessUser);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  res.json({ user: req.session.user || null });
});

export default router;
