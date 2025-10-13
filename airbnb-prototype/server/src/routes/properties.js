import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dayjs from 'dayjs';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

/* ---------------- helpers ---------------- */
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};
const parseStrictDate = (v) => {
  if (!v) return null;
  const d = dayjs(v, ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY'], true);
  return d.isValid() ? d : null;
};

/* ------------- uploads for property photos ------------- */
const propDir = path.join(process.cwd(), 'uploads', 'properties');
fs.mkdirSync(propDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, propDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '') || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const fileFilter = (_req, file, cb) => {
  if (file.mimetype?.startsWith('image/')) return cb(null, true);
  cb(new Error('Only images allowed'));
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 } // 8MB
});

/* ---------------- create property (OWNER) ---------------- */
router.post('/', requireRole('OWNER'), async (req, res) => {
  try {
    const {
      name, type, description, address, city, state, country,
      pricePerNight, bedrooms, bathrooms, maxGuests, amenities,
      availableFrom, availableTo
    } = req.body;

    if (!(name && type && pricePerNight && bedrooms && bathrooms && maxGuests)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const created = await prisma.property.create({
      data: {
        ownerId: req.session.user.id,
        name,
        type,
        description: description || null,
        address: address || null,
        city: city || null,
        state: state || null,
        country: country || null,
        pricePerNight: parseFloat(pricePerNight),
        bedrooms: parseInt(bedrooms, 10),
        bathrooms: parseInt(bathrooms, 10),
        maxGuests: parseInt(maxGuests, 10),
        amenities: amenities ? JSON.parse(amenities) : undefined,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableTo: availableTo ? new Date(availableTo) : null,
        photos: []
      }
    });

    res.json(created);
  } catch (e) {
    console.error('Create property failed:', e);
    res.status(400).json({ error: 'Invalid property data' });
  }
});

/* ---------------- owner list (mine) ---------------- */
router.get('/mine', requireRole('OWNER'), async (req, res) => {
  const props = await prisma.property.findMany({
    where: { ownerId: req.session.user.id },
    orderBy: { createdAt: 'desc' }
  });
  res.json(props);
});

/* ---------------- photo upload / delete ---------------- */
router.post('/:id/photos', requireRole('OWNER'), upload.array('photos', 10), async (req, res) => {
  try {
    const prop = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!prop || prop.ownerId !== req.session.user.id) return res.status(404).json({ error: 'Not found' });
    if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });

    const prev = Array.isArray(prop.photos) ? prop.photos : [];
    const urls = prev.concat(req.files.map(f => `/uploads/properties/${f.filename}`));
    const updated = await prisma.property.update({ where: { id: prop.id }, data: { photos: urls } });
    res.json(updated);
  } catch (e) {
    console.error('Property photo upload failed:', e);
    res.status(500).json({ error: 'Photo upload failed' });
  }
});

router.delete('/:id/photos', requireRole('OWNER'), async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing photo url' });

    const prop = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!prop || prop.ownerId !== req.session.user.id) return res.status(404).json({ error: 'Not found' });

    const next = (prop.photos || []).filter(p => p !== url);
    // Try deleting the file if it’s in our uploads dir
    try {
      const abs = path.normalize(path.join(process.cwd(), url.replace(/^\//, '')));
      if (abs.startsWith(propDir)) fs.unlink(abs, () => {});
    } catch {}
    const updated = await prisma.property.update({ where: { id: prop.id }, data: { photos: next } });
    res.json(updated);
  } catch (e) {
    console.error('Photo delete failed:', e);
    res.status(500).json({ error: 'Photo delete failed' });
  }
});

/* ---------------- update (owner) ---------------- */
router.put('/:id', requireRole('OWNER'), async (req, res) => {
  try {
    const prop = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!prop || prop.ownerId !== req.session.user.id) return res.status(404).json({ error: 'Not found' });

    const data = { ...req.body };
    if (typeof data.amenities === 'string') data.amenities = JSON.parse(data.amenities);
    if (data.pricePerNight) data.pricePerNight = parseFloat(data.pricePerNight);
    if (data.bedrooms) data.bedrooms = parseInt(data.bedrooms, 10);
    if (data.bathrooms) data.bathrooms = parseInt(data.bathrooms, 10);
    if (data.maxGuests) data.maxGuests = parseInt(data.maxGuests, 10);
    if (data.availableFrom) data.availableFrom = new Date(data.availableFrom);
    if (data.availableTo) data.availableTo = new Date(data.availableTo);

    const updated = await prisma.property.update({ where: { id: prop.id }, data });
    res.json(updated);
  } catch (e) {
    console.error('Update property failed:', e);
    res.status(400).json({ error: 'Invalid update data' });
  }
});

/* ---------------- public read ---------------- */
router.get('/:id', async (req, res) => {
  const prop = await prisma.property.findUnique({ where: { id: req.params.id } });
  if (!prop) return res.status(404).json({ error: 'Not found' });
  res.json(prop);
});

/* ---------------- SEARCH: city OR state OR country + dates (inclusive) ------------- */
router.get('/', async (req, res) => {
  try {
    const { location = '', start, end, guests } = req.query;
    const minGuests = Math.max(parseInt(guests || '1', 10) || 1, 1);

    // Base: guest count in SQL
    let props = await prisma.property.findMany({
      where: { maxGuests: { gte: minGuests } },
      orderBy: { createdAt: 'desc' }
    });

    // Location: OR match across city/state/country (case-insensitive)
    const tokens = location.toLowerCase().split(',').map(t => t.trim()).filter(Boolean);
    if (tokens.length) {
      props = props.filter(p => {
        const hay = `${p.city || ''} ${p.state || ''} ${p.country || ''}`.toLowerCase();
        return tokens.some(tok => hay.includes(tok));
      });
    }

    // Dates: inclusive [start..end], normalized to day edges
    const s = start ? parseStrictDate(start)?.startOf('day') : null;
    const e = end   ? parseStrictDate(end)?.endOf('day')   : null;

    if ((start && !s) || (end && !e)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (s && e) {
      if (!s.isBefore(e) && !s.isSame(e)) {
        return res.status(400).json({ error: 'Start date must be before end date.' });
      }

      const S = s.toDate();
      const E = e.toDate();

      const filtered = [];
      for (const p of props) {
        // Property availability window (inclusive)
        if (p.availableFrom && S < startOfDay(p.availableFrom)) continue;
        if (p.availableTo   && E > endOfDay(p.availableTo)) continue;

        // Block if any ACCEPTED booking overlaps the requested range (inclusive)
        const bookings = await prisma.booking.findMany({
          where: { propertyId: p.id, status: 'ACCEPTED' },
          select: { startDate: true, endDate: true }
        });

        const overlaps = bookings.some(b => {
          const bs = startOfDay(b.startDate);
          const be = endOfDay(b.endDate);
          return S <= be && bs <= E; // inclusive overlap
        });

        if (!overlaps) filtered.push(p);
      }

      return res.json(filtered);
    }

    // No dates → return location/guest filtered results
    res.json(props);
  } catch (e) {
    console.error('Search failed:', e);
    res.status(500).json({ error: 'Search failed' });
  }
});

/* ---------------- delete property (owner) ---------------- */
router.delete('/:id', requireRole('OWNER'), async (req, res) => {
  try {
    const prop = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!prop || prop.ownerId !== req.session.user.id) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Delete associated photos from filesystem
    if (Array.isArray(prop.photos)) {
      prop.photos.forEach(photoUrl => {
        try {
          const abs = path.normalize(path.join(process.cwd(), photoUrl.replace(/^\//, '')));
          if (abs.startsWith(propDir)) {
            fs.unlink(abs, () => {});
          }
        } catch {}
      });
    }

    // Delete property (will cascade delete bookings and favorites via Prisma relations if configured)
    await prisma.property.delete({ where: { id: prop.id } });
    res.json({ ok: true, message: 'Property deleted' });
  } catch (e) {
    console.error('Delete property failed:', e);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

export default router;
