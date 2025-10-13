import express from 'express';
import dayjs from 'dayjs';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { overlaps } from '../utils/date.js';

const prisma = new PrismaClient();
const router = express.Router();

// Create booking (TRAVELER) → PENDING
router.post('/', requireRole('TRAVELER'), async (req, res) => {
  try {
    const { propertyId, startDate, endDate, guests } = req.body;
    if (!(propertyId && startDate && endDate && guests)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const prop = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!prop) return res.status(404).json({ error: 'Property not found' });

    const s = dayjs(startDate).toDate();
    const e = dayjs(endDate).toDate();
    if (!(s < e)) return res.status(400).json({ error: 'Invalid date range' });
    if (guests > prop.maxGuests) return res.status(400).json({ error: 'Too many guests' });

    // On accept, conflicts are re-checked, but we also reject obvious conflicts here
    const accepted = await prisma.booking.findMany({ where: { propertyId, status: 'ACCEPTED' } });
    const conflict = accepted.some(b => overlaps(s, e, new Date(b.startDate), new Date(b.endDate)));
    if (conflict) return res.status(409).json({ error: 'Dates not available' });

    const created = await prisma.booking.create({
      data: {
        travelerId: req.session.user.id,
        propertyId,
        startDate: s,
        endDate: e,
        guests: parseInt(guests),
        status: 'PENDING'
      },
      include: { property: true }
    });
    res.json(created);
  } catch (e) {
    console.error('Create booking failed:', e);
    res.status(400).json({ error: 'Invalid booking data' });
  }
});

// List bookings (TRAVELER & OWNER)
router.get('/', requireAuth, async (req, res) => {
  if (req.session.user.role === 'TRAVELER') {
    const rows = await prisma.booking.findMany({
      where: { travelerId: req.session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { property: true }
    });
    return res.json(rows);
  }

  // OWNER: bookings for my properties
  const rows = await prisma.booking.findMany({
    where: { property: { ownerId: req.session.user.id } },
    orderBy: { createdAt: 'desc' },
    include: { property: true }
  });
  res.json(rows);
});

// Owner: accept/cancel a booking
router.put('/:id/status', requireRole('OWNER'), async (req, res) => {
  const { action } = req.body; // ACCEPT or CANCEL
  const book = await prisma.booking.findUnique({ where: { id: req.params.id }, include: { property: true } });
  if (!book || book.property.ownerId !== req.session.user.id) return res.status(404).json({ error: 'Not found' });

  if (action === 'ACCEPT') {
    // Ensure no conflict with other accepted bookings
    const others = await prisma.booking.findMany({
      where: {
        propertyId: book.propertyId,
        status: 'ACCEPTED',
        id: { not: book.id }
      }
    });
    const s = new Date(book.startDate);
    const e = new Date(book.endDate);
    const conflict = others.some(b => overlaps(s, e, new Date(b.startDate), new Date(b.endDate)));
    if (conflict) return res.status(409).json({ error: 'Dates already accepted for another booking' });

    const updated = await prisma.booking.update({ where: { id: book.id }, data: { status: 'ACCEPTED' } });
    return res.json(updated);
  }

  if (action === 'CANCEL') {
    const updated = await prisma.booking.update({ where: { id: book.id }, data: { status: 'CANCELLED' } });
    return res.json(updated);
  }

  res.status(400).json({ error: 'Unknown action' });
});

// Traveler cancel their booking
router.put('/:id/cancel', requireRole('TRAVELER'), async (req, res) => {
  const book = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!book || book.travelerId !== req.session.user.id) return res.status(404).json({ error: 'Not found' });
  const updated = await prisma.booking.update({ where: { id: book.id }, data: { status: 'CANCELLED' } });
  res.json(updated);
});

export default router;
