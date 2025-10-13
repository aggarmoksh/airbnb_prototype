import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// Add to favorites (Traveler)
router.post('/:propertyId', requireRole('TRAVELER'), async (req, res) => {
  const { propertyId } = req.params;
  try {
    const fav = await prisma.favorite.create({ data: { userId: req.session.user.id, propertyId } });
    res.json(fav);
  } catch {
    res.status(409).json({ error: 'Already favorited' });
  }
});

// Remove favorite
router.delete('/:propertyId', requireRole('TRAVELER'), async (req, res) => {
  const { propertyId } = req.params;
  await prisma.favorite.delete({ where: { userId_propertyId: { userId: req.session.user.id, propertyId } } });
  res.json({ ok: true });
});

// List favorites
router.get('/', requireRole('TRAVELER'), async (req, res) => {
  const list = await prisma.favorite.findMany({ where: { userId: req.session.user.id }, include: { property: true } });
  res.json(list.map(f => f.property));
});

export default router;
